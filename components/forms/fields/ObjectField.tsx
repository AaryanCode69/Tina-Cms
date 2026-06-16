/* ============================================================
 * ObjectField Component
 * Collapsible fieldset for nested object properties.
 * ============================================================ */

'use client';

import React, { useState } from 'react';
import FieldRenderer from '@/components/forms/FieldRenderer';
import type { FormFieldDefinition } from '@/utils/types';

interface ObjectFieldProps {
  name: string;
  label: string;
  value: Record<string, unknown>;
  children: FormFieldDefinition[];
  onChange: (name: string, value: Record<string, unknown>) => void;
  error?: string;
  errors?: Record<string, string>;
  description?: string;
}

export default function ObjectField({
  name,
  label,
  value,
  children,
  onChange,
  error,
  errors = {},
  description,
}: ObjectFieldProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChildChange = (fieldName: string, fieldValue: unknown) => {
    onChange(name, { ...value, [fieldName]: fieldValue });
  };

  // Filter errors relevant to this object's children
  const getChildErrors = (): Record<string, string> => {
    const prefix = `${name}.`;
    const childErrors: Record<string, string> = {};
    for (const [key, msg] of Object.entries(errors)) {
      if (key.startsWith(prefix)) {
        childErrors[key.slice(prefix.length)] = msg;
      }
    }
    return childErrors;
  };

  return (
    <fieldset className={`form-field form-field--object ${isExpanded ? '' : 'form-field--collapsed'}`}>
      <legend
        className="form-field__legend"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="form-field__legend-icon">{isExpanded ? '▾' : '▸'}</span>
        {label}
      </legend>

      {description && isExpanded && (
        <p className="form-field__description">{description}</p>
      )}

      {error && (
        <p className="form-field__error" role="alert">{error}</p>
      )}

      {isExpanded && (
        <div className="object-field__children">
          {children.map((childField) => (
            <FieldRenderer
              key={childField.name}
              field={childField}
              value={value[childField.name]}
              onChange={handleChildChange}
              errors={getChildErrors()}
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}
