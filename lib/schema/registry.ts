/* ============================================================
 * Schema Registry
 * Loads, caches, and provides JSON Schema files by resource type.
 * New schemas are registered by adding entries to SCHEMA_FILE_MAP.
 * ============================================================ */

import { readFileSync } from 'fs';
import path from 'path';
import { SchemaResourceType, SCHEMA_FILE_MAP } from '@/utils/types';

/** Raw JSON Schema type — intentionally loose to support any valid schema */
export interface JSONSchema {
  $schema?: string;
  $id?: string;
  $defs?: Record<string, JSONSchema>;
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  $ref?: string;
  pattern?: string;
  minLength?: number;
  enum?: string[];
  description?: string;
  errorMessage?: string | Record<string, unknown>;
  additionalProperties?: boolean | JSONSchema;
  propertyNames?: JSONSchema;
}

/** In-memory cache of loaded schemas */
const schemaCache = new Map<SchemaResourceType, JSONSchema>();

/**
 * Loads a JSON Schema file for the given resource type.
 * Results are cached after first load.
 */
export function getSchema(resourceType: SchemaResourceType): JSONSchema {
  const cached = schemaCache.get(resourceType);
  if (cached) return cached;

  const fileName = SCHEMA_FILE_MAP[resourceType];
  if (!fileName) {
    throw new Error(`No schema file registered for resource type: ${resourceType}`);
  }

  const schemaPath = path.join(process.cwd(), 'schemas', fileName);
  const raw = readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(raw) as JSONSchema;

  schemaCache.set(resourceType, schema);
  return schema;
}

/**
 * Returns all registered resource types that have schema files.
 */
export function getRegisteredResourceTypes(): SchemaResourceType[] {
  return Object.keys(SCHEMA_FILE_MAP) as SchemaResourceType[];
}

/**
 * Clears the schema cache — useful for testing or hot-reload scenarios.
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
}
