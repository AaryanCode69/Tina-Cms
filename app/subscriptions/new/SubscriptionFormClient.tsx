/* ============================================================
 * Subscription Form Client Component
 * Three-step workflow: Fill → Review → Submit
 * Handles form state, JSON generation, validation, and
 * GitHub submission via the /api/submit endpoint.
 * ============================================================ */

'use client';

import React, { useState, useCallback } from 'react';
import SchemaForm from '@/components/forms/SchemaForm';
import JsonPreview from '@/components/forms/JsonPreview';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Toast from '@/components/ui/Toast';
import type { ToastMessage } from '@/components/ui/Toast';
import {
  FormStep,
  SubmissionStatus,
  SchemaResourceType,
} from '@/utils/types';
import type { FormFieldDefinition, SubmissionResult } from '@/utils/types';
import { generateSubscriptionJson } from '@/lib/json/generator';

interface SubscriptionFormClientProps {
  fields: FormFieldDefinition[];
}

export default function SubscriptionFormClient({ fields }: SubscriptionFormClientProps) {
  const [step, setStep] = useState<FormStep>(FormStep.Fill);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>(SubmissionStatus.Idle);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Step 1 → Step 2: Form submitted, generate JSON
  const handleFormSubmit = (values: Record<string, unknown>) => {
    setFormData(values);
    const json = generateSubscriptionJson(values);
    setGeneratedJson(json);
    setStep(FormStep.Review);
    addToast('info', 'JSON generated. Please review before submitting.');
  };

  // Step 2 → Step 3: Submit to GitHub
  const handleSubmitToGitHub = async () => {
    const subscriptionName = formData.subscriptionName as string;
    if (!subscriptionName) {
      addToast('error', 'Subscription name is required');
      return;
    }

    setSubmissionStatus(SubmissionStatus.Submitting);
    setStep(FormStep.Submit);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceType: SchemaResourceType.Subscription,
          name: subscriptionName,
          data: formData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionStatus(SubmissionStatus.Success);
        setSubmissionResult(result);
        setStep(FormStep.Success);
        addToast('success', 'Pull Request created successfully!');
      } else {
        setSubmissionStatus(SubmissionStatus.Error);
        setSubmissionResult({ success: false, error: result.error || 'Submission failed' });
        addToast('error', result.error || 'Failed to create Pull Request');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      setSubmissionStatus(SubmissionStatus.Error);
      setSubmissionResult({ success: false, error: message });
      addToast('error', `Network error: ${message}`);
    }
  };

  // Reset to start over
  const handleStartOver = () => {
    setStep(FormStep.Fill);
    setFormData({});
    setGeneratedJson('');
    setSubmissionStatus(SubmissionStatus.Idle);
    setSubmissionResult(null);
  };

  return (
    <div className="subscription-page">
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step-indicator__step ${step === FormStep.Fill ? 'step-indicator__step--active' : ''} ${step !== FormStep.Fill ? 'step-indicator__step--complete' : ''}`}>
          <span className="step-indicator__number">1</span>
          <span className="step-indicator__label">Subscription Details</span>
        </div>
        <div className="step-indicator__connector" />
        <div className={`step-indicator__step ${step === FormStep.Review ? 'step-indicator__step--active' : ''} ${step === FormStep.Submit || step === FormStep.Success ? 'step-indicator__step--complete' : ''}`}>
          <span className="step-indicator__number">2</span>
          <span className="step-indicator__label">Review JSON</span>
        </div>
        <div className="step-indicator__connector" />
        <div className={`step-indicator__step ${step === FormStep.Submit || step === FormStep.Success ? 'step-indicator__step--active' : ''}`}>
          <span className="step-indicator__number">3</span>
          <span className="step-indicator__label">Submit for Review</span>
        </div>
      </div>

      {/* Step 1: Fill Form */}
      {step === FormStep.Fill && (
        <Card
          title="Create Subscription"
          subtitle="Fill in the subscription details below. Required fields are marked with an asterisk."
        >
          <SchemaForm
            fields={fields}
            initialValues={formData}
            onSubmit={handleFormSubmit}
            submitLabel="Generate JSON & Review →"
          />
        </Card>
      )}

      {/* Step 2: Review JSON */}
      {step === FormStep.Review && (
        <Card
          title="Review Generated Configuration"
          subtitle="Review the generated JSON below. This is exactly what will be committed to the repository."
        >
          <JsonPreview json={generatedJson} isValid={true} />

          <div className="review-actions">
            <Button variant="ghost" onClick={() => setStep(FormStep.Fill)}>
              ← Back to Edit
            </Button>
            <Button variant="primary" size="lg" onClick={handleSubmitToGitHub}>
              Submit & Create Pull Request →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Submitting */}
      {step === FormStep.Submit && submissionStatus === SubmissionStatus.Submitting && (
        <Card title="Submitting to GitHub...">
          <div className="submission-progress">
            <div className="submission-progress__spinner" />
            <p className="submission-progress__text">
              Creating branch, committing file, and opening Pull Request...
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {submissionStatus === SubmissionStatus.Error && (
        <Card title="Submission Failed">
          <div className="submission-error">
            <div className="submission-error__icon">✗</div>
            <p className="submission-error__message">
              {submissionResult?.error || 'An unknown error occurred'}
            </p>
            <div className="submission-error__actions">
              <Button variant="secondary" onClick={() => setStep(FormStep.Review)}>
                ← Back to Review
              </Button>
              <Button variant="primary" onClick={handleSubmitToGitHub}>
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Success State */}
      {step === FormStep.Success && submissionResult?.success && (
        <Card title="Pull Request Created!">
          <div className="submission-success">
            <div className="submission-success__icon">✓</div>
            <p className="submission-success__message">
              Your subscription configuration has been submitted for review.
            </p>

            <div className="submission-success__details">
              <div className="submission-success__detail">
                <span className="submission-success__label">Pull Request:</span>
                <a
                  href={submissionResult.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="submission-success__link"
                >
                  #{submissionResult.prNumber} — View on GitHub →
                </a>
              </div>
              <div className="submission-success__detail">
                <span className="submission-success__label">Branch:</span>
                <code className="submission-success__code">{submissionResult.branchName}</code>
              </div>
            </div>

            <div className="submission-success__actions">
              <Button variant="primary" onClick={handleStartOver}>
                Create Another Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
