/* ============================================================
 * Core type definitions for the schema-driven form builder.
 * All types are shared across schema engine, form UI, and
 * JSON generation layers.
 * ============================================================ */

/** Supported resource types — extend this enum when adding new schemas */
export enum SchemaResourceType {
  Subscription = 'subscription',
}

/** Maps resource types to their schema file names */
export const SCHEMA_FILE_MAP: Record<SchemaResourceType, string> = {
  [SchemaResourceType.Subscription]: 'subscription-schema.json',
};

/** Maps resource types to their content output directories */
export const CONTENT_DIR_MAP: Record<SchemaResourceType, string> = {
  [SchemaResourceType.Subscription]: 'content/subscriptions',
};

// ── Form Field Definitions ──────────────────────────────────

/** Primitive field types supported by the form renderer */
export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'select' | 'null';

/** A single form field definition, derived from JSON Schema parsing */
export interface FormFieldDefinition {
  /** JSON property key */
  name: string;
  /** Human-readable label */
  label: string;
  /** Field input type */
  type: FieldType;
  /** Whether the field is required */
  required: boolean;
  /** Placeholder / help text */
  description?: string;
  /** Regex pattern for validation */
  pattern?: string;
  /** Custom error message from schema */
  errorMessage?: string;
  /** Minimum string length */
  minLength?: number;
  /** Enum options (for select fields) */
  enumValues?: string[];
  /** Child fields (for object type) */
  children?: FormFieldDefinition[];
  /** Item field definition (for array type) */
  itemDefinition?: FormFieldDefinition;
  /** anyOf constraint descriptions */
  anyOfConstraints?: AnyOfConstraint[];
  /** Whether this field accepts null (anyOf with null) */
  nullable?: boolean;
  /** Default value */
  defaultValue?: unknown;
}

/** Represents an anyOf constraint from the schema */
export interface AnyOfConstraint {
  requiredFields: string[];
  description?: string;
}

// ── Validation ──────────────────────────────────────────────

/** A single validation error with path and message */
export interface ValidationError {
  /** JSON pointer path to the field (e.g., "/subscriptions/0/location") */
  path: string;
  /** Human-readable field name */
  field: string;
  /** User-friendly error message */
  message: string;
}

/** Result of schema validation */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ── GitHub Integration ──────────────────────────────────────

/** Result of a GitHub submission */
export interface SubmissionResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  branchName?: string;
  error?: string;
}

/** Payload for the submit API route */
export interface SubmitPayload {
  resourceType: SchemaResourceType;
  name: string;
  data: Record<string, unknown>;
}

// ── Form State ──────────────────────────────────────────────

/** Steps in the form submission workflow */
export enum FormStep {
  Fill = 'fill',
  Review = 'review',
  Submit = 'submit',
  Success = 'success',
}

/** Possible states during GitHub submission */
export enum SubmissionStatus {
  Idle = 'idle',
  Validating = 'validating',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error',
}
