/* ============================================================
 * TextField Component
 * Text input with label, validation error display, and
 * pattern constraint hints.
 * ============================================================ */

'use client';

import React from 'react';

interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  pattern?: string;
  errorMessage?: string;
  error?: string;
  description?: string;
  placeholder?: string;
  minLength?: number;
  nullable?: boolean;
}

export default function TextField({
  name,
  label,
  value,
  onChange,
  required = false,
  error,
  description,
  placeholder,
  nullable,
}: TextFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required" aria-label="required">*</span>}
        {nullable && <span className="form-field__nullable">(optional, leave empty for null)</span>}
      </label>

      {description && (
        <p id={descId} className="form-field__description">{description}</p>
      )}

      <input
        id={inputId}
        type="text"
        className="form-field__input"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={`${description ? descId : ''} ${error ? errorId : ''}`.trim() || undefined}
      />

      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
