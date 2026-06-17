/* ============================================================
 * SchemaForm Component
 * Generic schema-driven form that renders fields dynamically
 * from FormFieldDefinition[].
 *
 * Manages form state with useReducer for predictable updates.
 * Supports client-side validation before submission.
 * ============================================================ */

'use client';

import React, { useReducer, useCallback, useRef, useState } from 'react';
import FieldRenderer from './FieldRenderer';
import Button from '@/components/ui/Button';
import type { FormFieldDefinition } from '@/utils/types';

// ── State Management ────────────────────────────────────────

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Set<string>;
}

type FormAction =
  | { type: 'SET_VALUE'; name: string; value: unknown }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'TOUCH_FIELD'; name: string }
  | { type: 'RESET'; initialValues: Record<string, unknown> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.name]: action.value },
        touched: new Set<string>([...state.touched, action.name]),
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'TOUCH_FIELD':
      return { ...state, touched: new Set<string>([...state.touched, action.name]) };
    case 'RESET':
      return { values: action.initialValues, errors: {}, touched: new Set<string>() };
    default:
      return state;
  }
}

// ── Client-side Validation ──────────────────────────────────

function validateFields(
  fields: FormFieldDefinition[],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.name];

    // Required check
    if (field.required) {
      if (value === undefined || value === null || value === '') {
        errors[field.name] = `${field.label} is required`;
        continue;
      }
    }

    // Skip further validation for empty optional fields
    if (value === undefined || value === null || value === '') continue;

    // Pattern validation
    if (field.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          errors[field.name] = field.errorMessage || `${field.label} format is invalid`;
        }
      } catch {
        // Invalid regex in schema — skip
      }
    }

    // MinLength validation
    if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
      errors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
    }

    // Recurse into object children
    if (field.type === 'object' && field.children && typeof value === 'object') {
      const childErrors = validateFields(field.children, value as Record<string, unknown>);
      for (const [key, msg] of Object.entries(childErrors)) {
        errors[`${field.name}.${key}`] = msg;
      }
    }

    // Validate array items
    if (field.type === 'array' && field.itemDefinition?.children && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i] as Record<string, unknown>;
        const itemErrors = validateFields(field.itemDefinition.children, item);
        for (const [key, msg] of Object.entries(itemErrors)) {
          errors[`${field.name}[${i}].${key}`] = msg;
        }
      }
    }
  }

  return errors;
}

// ── Component ───────────────────────────────────────────────

interface SchemaFormProps {
  fields: FormFieldDefinition[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function SchemaForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Continue to Review',
  isSubmitting = false,
}: SchemaFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [validationSummary, setValidationSummary] = useState<string[]>([]);

  const [state, dispatch] = useReducer(formReducer, {
    values: { ...initialValues },
    errors: {},
    touched: new Set<string>(),
  });

  const handleChange = useCallback((name: string, value: unknown) => {
    dispatch({ type: 'SET_VALUE', name, value });
  }, []);

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    // Run validation
    const errors = validateFields(fields, state.values);
    dispatch({ type: 'SET_ERRORS', errors });

    const errorMessages = Object.values(errors);

    if (errorMessages.length > 0) {
      // Show validation summary and scroll to top of form
      setValidationSummary(errorMessages);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setValidationSummary([]);
      onSubmit(state.values);
    }
  };

  return (
    <form ref={formRef} className="schema-form" onSubmit={handleSubmit} noValidate>
      {/* Validation Error Summary */}
      {validationSummary.length > 0 && (
        <div className="schema-form__error-summary" role="alert">
          <div className="schema-form__error-summary-header">
            <span className="schema-form__error-summary-icon">⚠</span>
            <strong>Please fix {validationSummary.length} error{validationSummary.length > 1 ? 's' : ''} before continuing:</strong>
          </div>
          <ul className="schema-form__error-summary-list">
            {validationSummary.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="schema-form__fields">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={state.values[field.name]}
            onChange={handleChange}
            errors={state.errors}
          />
        ))}
      </div>

      <div className="schema-form__actions">
        <Button type="button" onClick={handleSubmit} variant="primary" size="lg" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
