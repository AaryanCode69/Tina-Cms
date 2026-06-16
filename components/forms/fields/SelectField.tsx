/* ============================================================
 * SelectField Component
 * Dropdown for enum-based fields.
 * ============================================================ */

'use client';

import React from 'react';

interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  description?: string;
}

export default function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  description,
}: SelectFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required" aria-label="required">*</span>}
      </label>

      {description && (
        <p className="form-field__description">{description}</p>
      )}

      <select
        id={inputId}
        className="form-field__select"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
