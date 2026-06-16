/* ============================================================
 * JsonPreview Component
 * Read-only JSON display with syntax highlighting and
 * copy-to-clipboard functionality.
 * ============================================================ */

'use client';

import React, { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

interface JsonPreviewProps {
  json: string;
  isValid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Simple CSS-based JSON syntax highlighting.
 * Avoids external dependencies.
 */
function highlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // String values (not keys)
    .replace(/("(\\.|[^"\\])*")\s*:/g, '<span class="json-key">$1</span>:')
    .replace(/:\s*("(\\.|[^"\\])*")/g, ': <span class="json-string">$1</span>')
    // Numbers
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    // Booleans and null
    .replace(/:\s*(true|false|null)/g, ': <span class="json-literal">$1</span>');
}

export default function JsonPreview({ json, isValid, errors = [] }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="json-preview">
      <div className="json-preview__header">
        <h3 className="json-preview__title">Generated JSON</h3>
        <div className="json-preview__actions">
          <StatusBadge status={isValid ? 'valid' : 'invalid'} />
          <button className="json-preview__copy" onClick={handleCopy} type="button">
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>
      </div>

      {!isValid && errors.length > 0 && (
        <div className="json-preview__errors">
          <p className="json-preview__errors-title">Validation Errors:</p>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>
                <strong>{err.field}:</strong> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <pre className="json-preview__code">
        <code dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />
      </pre>
    </div>
  );
}
