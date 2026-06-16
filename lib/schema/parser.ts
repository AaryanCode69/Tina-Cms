/* ============================================================
 * Schema Parser
 * Converts a JSON Schema into a tree of FormFieldDefinition
 * objects that the form renderer can consume.
 *
 * Handles: primitives, objects, arrays, $ref resolution,
 * required fields, patterns, enums, anyOf/oneOf, and
 * nullable (anyOf with null).
 * ============================================================ */

import type { JSONSchema } from './registry';
import type { FormFieldDefinition, AnyOfConstraint, FieldType } from '@/utils/types';

/**
 * Converts a property key to a human-readable label.
 * "subscriptionAliasName" → "Subscription Alias Name"
 */
function keyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Resolves a $ref pointer (e.g., "#/$defs/roleAssignment") against the
 * root schema's $defs.
 */
function resolveRef(ref: string, rootSchema: JSONSchema): JSONSchema {
  const parts = ref.replace('#/', '').split('/');
  let current: unknown = rootSchema;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      throw new Error(`Cannot resolve $ref: ${ref}`);
    }
  }
  return current as JSONSchema;
}

/**
 * Determines the FieldType from a JSON Schema type definition.
 * Handles anyOf-with-null (nullable strings, etc.)
 */
function resolveFieldType(schema: JSONSchema): { type: FieldType; nullable: boolean } {
  // Handle anyOf with null (e.g., subscriptionId: anyOf [null, string])
  if (schema.anyOf) {
    const nonNullTypes = schema.anyOf.filter((s) => s.type !== 'null');
    const hasNull = schema.anyOf.some((s) => s.type === 'null');

    if (hasNull && nonNullTypes.length === 1) {
      const innerType = nonNullTypes[0].type as FieldType;
      return { type: innerType || 'string', nullable: true };
    }
  }

  if (schema.enum) return { type: 'select', nullable: false };

  const schemaType = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  return { type: (schemaType as FieldType) || 'string', nullable: false };
}

/**
 * Extracts the errorMessage for a field. The schema uses both string
 * and object forms of errorMessage.
 */
function extractErrorMessage(schema: JSONSchema): string | undefined {
  if (typeof schema.errorMessage === 'string') return schema.errorMessage;
  return undefined;
}

/**
 * Extracts the pattern from a schema, handling anyOf-with-null cases
 * where the pattern is on the non-null branch.
 */
function extractPattern(schema: JSONSchema): string | undefined {
  if (schema.pattern) return schema.pattern;

  // Check anyOf branches for pattern (e.g., subscriptionId)
  if (schema.anyOf) {
    for (const branch of schema.anyOf) {
      if (branch.type !== 'null' && branch.pattern) {
        return branch.pattern;
      }
    }
  }
  return undefined;
}

/**
 * Extracts anyOf constraints that define conditional requirements
 * (e.g., "must have either tagsRef or tags").
 */
function extractAnyOfConstraints(schema: JSONSchema): AnyOfConstraint[] | undefined {
  if (!schema.anyOf) return undefined;

  // Only extract if anyOf contains required-field constraints (not type unions)
  const constraints = schema.anyOf
    .filter((branch) => branch.required && branch.required.length > 0)
    .map((branch) => ({
      requiredFields: branch.required!,
      description: typeof branch.errorMessage === 'string' ? branch.errorMessage : undefined,
    }));

  return constraints.length > 0 ? constraints : undefined;
}

/**
 * Main recursive parser: walks a JSON Schema properties object
 * and produces FormFieldDefinition[].
 */
export function parseSchemaToFields(
  schema: JSONSchema,
  rootSchema: JSONSchema,
  requiredFields: string[] = []
): FormFieldDefinition[] {
  if (!schema.properties) return [];

  const fields: FormFieldDefinition[] = [];

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // Resolve $ref if present
    let resolved = propSchema;
    if (propSchema.$ref) {
      resolved = resolveRef(propSchema.$ref, rootSchema);
    }

    const { type, nullable } = resolveFieldType(resolved);
    const isRequired = requiredFields.includes(key);

    const field: FormFieldDefinition = {
      name: key,
      label: keyToLabel(key),
      type,
      required: isRequired,
      description: resolved.description,
      pattern: extractPattern(resolved),
      errorMessage: extractErrorMessage(resolved),
      minLength: resolved.minLength,
      enumValues: resolved.enum,
      nullable,
    };

    // Recurse into object properties
    if (type === 'object' && resolved.properties) {
      field.children = parseSchemaToFields(
        resolved,
        rootSchema,
        resolved.required || []
      );
      field.anyOfConstraints = extractAnyOfConstraints(resolved);
    }

    // Handle arrays
    if (type === 'array' && resolved.items) {
      let itemSchema = resolved.items;
      if (itemSchema.$ref) {
        itemSchema = resolveRef(itemSchema.$ref, rootSchema);
      }

      const itemType = resolveFieldType(itemSchema).type;

      field.itemDefinition = {
        name: `${key}_item`,
        label: `${keyToLabel(key)} Item`,
        type: itemType,
        required: false,
      };

      // If array items are objects, parse their properties
      if (itemType === 'object' && itemSchema.properties) {
        field.itemDefinition.children = parseSchemaToFields(
          itemSchema,
          rootSchema,
          itemSchema.required || []
        );
        field.itemDefinition.anyOfConstraints = extractAnyOfConstraints(itemSchema);
      }
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Parse the subscription-level fields from the full schema.
 * The schema wraps subscriptions in { subscriptions: [{ ... }] },
 * so we drill into the items schema of the subscriptions array.
 */
export function parseSubscriptionFields(rootSchema: JSONSchema): FormFieldDefinition[] {
  const subscriptionsProperty = rootSchema.properties?.subscriptions;
  if (!subscriptionsProperty || subscriptionsProperty.type !== 'array' || !subscriptionsProperty.items) {
    throw new Error('Schema does not contain a valid subscriptions array property');
  }

  const itemSchema = subscriptionsProperty.items;
  return parseSchemaToFields(itemSchema, rootSchema, itemSchema.required || []);
}
