/* ============================================================
 * DictionaryField Component
 * Dynamic Key-Value dictionary field.
 * ============================================================ */

'use client';

import React, { useState } from 'react';
import FieldRenderer from '@/components/forms/FieldRenderer';
import Button from '@/components/ui/Button';
import type { FormFieldDefinition } from '@/utils/types';

interface DictionaryFieldProps {
  name: string;
  label: string;
  value: Record<string, unknown>;
  valueDefinition: FormFieldDefinition;
  onChange: (name: string, value: Record<string, unknown>) => void;
  error?: string;
  errors?: Record<string, string>;
  description?: string;
}

export default function DictionaryField({
  name,
  label,
  value,
  valueDefinition,
  onChange,
  error,
  errors = {},
  description,
}: DictionaryFieldProps) {
  // We maintain an internal ordered list to prevent focus jumping when editing keys
  const [entries, setEntries] = useState<{ id: string; key: string; val: unknown }[]>(() => {
    return Object.entries(value || {}).map(([k, v]) => ({
      id: Math.random().toString(36).substring(7),
      key: k,
      val: v,
    }));
  });

  // Sync internal state to parent when it changes
  const updateParent = (newEntries: typeof entries) => {
    const newObj: Record<string, unknown> = {};
    for (const e of newEntries) {
      if (e.key.trim() !== '') {
        newObj[e.key] = e.val;
      }
    }
    onChange(name, newObj);
  };

  const handleAddEntry = () => {
    // Initialize value based on definition
    let initialVal: unknown = '';
    if (valueDefinition.type === 'object') initialVal = {};
    if (valueDefinition.type === 'array') initialVal = [];

    const newEntries = [
      ...entries,
      { id: Math.random().toString(36).substring(7), key: '', val: initialVal },
    ];
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleRemoveEntry = (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleKeyChange = (id: string, newKey: string) => {
    const newEntries = entries.map((e) => (e.id === id ? { ...e, key: newKey } : e));
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleValueChange = (id: string, newVal: unknown) => {
    const newEntries = entries.map((e) => (e.id === id ? { ...e, val: newVal } : e));
    setEntries(newEntries);
    updateParent(newEntries);
  };

  // Filter errors relevant to this dictionary
  const getEntryErrors = (key: string): Record<string, string> => {
    const prefix = `${name}.${key}.`;
    const itemErrors: Record<string, string> = {};
    for (const [errKey, msg] of Object.entries(errors)) {
      if (errKey.startsWith(prefix)) {
        itemErrors[errKey.slice(prefix.length)] = msg;
      } else if (errKey === `${name}.${key}`) {
        itemErrors[valueDefinition.name] = msg;
      }
    }
    return itemErrors;
  };

  return (
    <div className="form-field form-field--dictionary">
      <div className="dictionary-field__header">
        <label className="form-field__label">{label}</label>
      </div>

      {description && <p className="form-field__description">{description}</p>}

      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}

      {entries.length === 0 && (
        <p className="dictionary-field__empty array-field__empty">
          No {label.toLowerCase()} added yet. Click the button below to add one.
        </p>
      )}

      <div className="dictionary-field__items array-field__items">
        {entries.map((entry) => {
          // Find if there's an error for this specific key name missing/invalid
          const keyError = errors[`${name}.${entry.key}`];

          return (
            <div key={entry.id} className="dictionary-field__item array-field__item">
              <div className="dictionary-field__item-header array-field__item-header">
                <div className="dictionary-field__key-input" style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <span className="array-field__item-index">Key:</span>
                  <input
                    type="text"
                    className={`form-field__input ${keyError ? 'form-field__input--error' : ''}`}
                    value={entry.key}
                    onChange={(e) => handleKeyChange(entry.id, e.target.value)}
                    placeholder="Enter key name..."
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveEntry(entry.id)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              
              {keyError && (
                 <p className="form-field__error" role="alert" style={{ marginLeft: '45px', marginTop: '4px' }}>
                   {keyError}
                 </p>
              )}

              <div className="dictionary-field__item-fields array-field__item-fields" style={{ marginLeft: '20px', marginTop: '12px' }}>
                <FieldRenderer
                  field={valueDefinition}
                  value={entry.val}
                  onChange={(_, value) => handleValueChange(entry.id, value)}
                  errors={getEntryErrors(entry.key)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dictionary-field__actions array-field__actions">
        <Button variant="secondary" size="sm" onClick={handleAddEntry} type="button">
          + Add {label}
        </Button>
      </div>
    </div>
  );
}
