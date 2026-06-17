/* ============================================================
 * ArrayField Component
 * Repeatable group with add/remove controls.
 * Each item renders its sub-fields via FieldRenderer.
 * ============================================================ */

'use client';

import React from 'react';
import FieldRenderer from '@/components/forms/FieldRenderer';
import Button from '@/components/ui/Button';
import type { FormFieldDefinition } from '@/utils/types';

interface ArrayFieldProps {
  name: string;
  label: string;
  items: unknown[];
  itemDefinition: FormFieldDefinition;
  onChange: (name: string, value: unknown[]) => void;
  error?: string;
  errors?: Record<string, string>;
  description?: string;
}

export default function ArrayField({
  name,
  label,
  items,
  itemDefinition,
  onChange,
  error,
  errors = {},
  description,
}: ArrayFieldProps) {
  const handleAddItem = () => {
    let newItem: unknown;
    
    if (itemDefinition.type === 'object') {
      const obj: Record<string, unknown> = {};
      if (itemDefinition.children) {
        for (const child of itemDefinition.children) {
          if (child.type === 'array') {
            obj[child.name] = [];
          } else if (child.type === 'object') {
            obj[child.name] = {};
          } else {
            obj[child.name] = '';
          }
        }
      }
      newItem = obj;
    } else if (itemDefinition.type === 'array') {
      newItem = [];
    } else {
      newItem = '';
    }
    
    onChange(name, [...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(name, items.filter((_, i) => i !== index));
  };

  const handleObjectItemChange = (index: number, fieldName: string, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...(updated[index] as Record<string, unknown>), [fieldName]: value };
    onChange(name, updated);
  };

  const handlePrimitiveItemChange = (index: number, value: unknown) => {
    const updated = [...items];
    updated[index] = value;
    onChange(name, updated);
  };

  // Filter errors relevant to this array's items
  const getItemErrors = (index: number): Record<string, string> => {
    const prefix = `${name}[${index}].`;
    const itemErrors: Record<string, string> = {};
    for (const [key, msg] of Object.entries(errors)) {
      if (key.startsWith(prefix)) {
        itemErrors[key.slice(prefix.length)] = msg;
      } else if (key === `${name}[${index}]`) {
        itemErrors[itemDefinition.name] = msg;
      }
    }
    return itemErrors;
  };

  return (
    <div className="form-field form-field--array">
      <div className="array-field__header">
        <label className="form-field__label">{label}</label>
      </div>

      {description && (
        <p className="form-field__description">{description}</p>
      )}

      {error && (
        <p className="form-field__error" role="alert">{error}</p>
      )}

      {items.length === 0 && (
        <p className="array-field__empty">
          No {label.toLowerCase()} added yet. Click the button below to add one.
        </p>
      )}

      <div className="array-field__items">
        {items.map((item, index) => (
          <div key={index} className="array-field__item">
            <div className="array-field__item-header">
              <span className="array-field__item-index">#{index + 1}</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveItem(index)}
                type="button"
              >
                Remove
              </Button>
            </div>

            {itemDefinition.children ? (
              <div className="array-field__item-fields">
                {itemDefinition.children.map((childField) => (
                  <FieldRenderer
                    key={childField.name}
                    field={childField}
                    value={(item as Record<string, unknown>)?.[childField.name]}
                    onChange={(fieldName, value) => handleObjectItemChange(index, fieldName, value)}
                    errors={getItemErrors(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="array-field__item-fields">
                <FieldRenderer
                  field={itemDefinition}
                  value={item}
                  onChange={(_, value) => handlePrimitiveItemChange(index, value)}
                  errors={getItemErrors(index)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="array-field__actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddItem}
          type="button"
        >
          + Add {label}
        </Button>
      </div>
    </div>
  );
}
