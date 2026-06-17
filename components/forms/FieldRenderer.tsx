/* ============================================================
 * FieldRenderer
 * Dispatches to the correct field component based on
 * FormFieldDefinition type. This is the core routing layer
 * for schema-driven form rendering.
 * ============================================================ */

'use client';

import React from 'react';
import TextField from './fields/TextField';
import SelectField from './fields/SelectField';
import ArrayField from './fields/ArrayField';
import ObjectField from './fields/ObjectField';
import type { FormFieldDefinition } from '@/utils/types';

interface FieldRendererProps {
  field: FormFieldDefinition;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string>;
}

export default function FieldRenderer({
  field,
  value,
  onChange,
  errors = {},
}: FieldRendererProps) {
  const fieldError = errors[field.name];

  switch (field.type) {
    case 'string':
      return (
        <TextField
          name={field.name}
          label={field.label}
          value={(value as string) || ''}
          onChange={onChange}
          required={field.required}
          pattern={field.pattern}
          errorMessage={field.errorMessage}
          error={fieldError}
          description={field.description}
          minLength={field.minLength}
          nullable={field.nullable}
        />
      );

    case 'select':
      return (
        <SelectField
          name={field.name}
          label={field.label}
          value={(value as string) || ''}
          onChange={onChange}
          options={field.enumValues || []}
          required={field.required}
          error={fieldError}
          description={field.description}
        />
      );

    case 'object':
      return (
        <ObjectField
          name={field.name}
          label={field.label}
          value={(value as Record<string, unknown>) || {}}
          onChange={onChange}
          error={fieldError}
          errors={errors}
          description={field.description}
        >
          {field.children || []}
        </ObjectField>
      );

    case 'array':
      if (field.itemDefinition) {
        return (
          <ArrayField
            name={field.name}
            label={field.label}
            items={(value as Record<string, unknown>[]) || []}
            itemDefinition={field.itemDefinition}
            onChange={onChange}
            error={fieldError}
            errors={errors}
            description={field.description}
          />
        );
      }
      // Fallback for arrays without item definitions (simple string arrays)
      return (
        <TextField
          name={field.name}
          label={`${field.label} (comma-separated)`}
          value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
          onChange={(name, val) => {
            const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
            onChange(name, arr);
          }}
          required={field.required}
          error={fieldError}
          description={field.description}
        />
      );

    default:
      return (
        <TextField
          name={field.name}
          label={field.label}
          value={String(value || '')}
          onChange={onChange}
          required={field.required}
          error={fieldError}
          description={field.description}
        />
      );
  }
}
