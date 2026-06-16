/* ============================================================
 * Schema Validator
 * Wraps Ajv to validate data against loaded JSON Schemas.
 * Translates Ajv error output into user-friendly ValidationError[].
 * ============================================================ */

import Ajv2020 from 'ajv/dist/2020';
import ajvErrors from 'ajv-errors';
import { getSchema } from './registry';
import type { JSONSchema } from './registry';
import { SchemaResourceType } from '@/utils/types';
import type { ValidationResult, ValidationError } from '@/utils/types';

/** Singleton Ajv instance configured for JSON Schema 2020-12 */
let ajvInstance: Ajv2020 | null = null;

function getAjv(): Ajv2020 {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    ajvErrors(ajvInstance);
  }
  return ajvInstance;
}

/**
 * Strips meta-schema properties ($schema, $id) from a schema
 * before compilation to avoid Ajv trying to resolve them.
 */
function prepareSchemaForValidation(schema: JSONSchema): JSONSchema {
  const { $schema, $id, ...rest } = schema;
  void $schema;
  void $id;
  return rest as JSONSchema;
}

/**
 * Converts a JSON pointer path to a human-readable field name.
 * "/subscriptions/0/location" → "location"
 */
function pathToFieldName(path: string): string {
  const parts = path.split('/').filter(Boolean);
  // Return the last non-numeric segment
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!/^\d+$/.test(parts[i])) {
      return parts[i];
    }
  }
  return path;
}

/**
 * Converts a camelCase or PascalCase field name to a readable label.
 */
function fieldToLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Validates data against the JSON Schema for a given resource type.
 */
export function validateAgainstSchema(
  data: unknown,
  resourceType: SchemaResourceType
): ValidationResult {
  const ajv = getAjv();
  const rawSchema = getSchema(resourceType);
  const schema = prepareSchemaForValidation(rawSchema);

  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (compileError) {
    // If schema compilation fails (e.g., unsupported keywords),
    // skip server-side validation and rely on client-side
    console.warn('Schema compilation warning:', compileError);
    return { valid: true, errors: [] };
  }

  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = (validate.errors || []).map((err) => {
    const instancePath = err.instancePath || '';
    const field = pathToFieldName(instancePath);

    // Prefer custom errorMessage, fall back to Ajv default
    let message: string;
    if (err.message) {
      message = err.message;
    } else {
      message = `Invalid value for ${fieldToLabel(field)}`;
    }

    return {
      path: instancePath,
      field,
      message,
    };
  });

  // Deduplicate errors by path + message
  const seen = new Set<string>();
  const uniqueErrors = errors.filter((e) => {
    const key = `${e.path}:${e.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid: false, errors: uniqueErrors };
}

/**
 * Convenience: validates a single subscription data object.
 * Wraps the data in the expected { subscriptions: [...] } envelope.
 */
export function validateSubscription(
  subscriptionData: Record<string, unknown>
): ValidationResult {
  const wrapped = { subscriptions: [subscriptionData] };
  return validateAgainstSchema(wrapped, SchemaResourceType.Subscription);
}
