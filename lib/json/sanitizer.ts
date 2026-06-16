/* ============================================================
 * JSON Sanitizer
 * Cleans form data before JSON generation:
 *  - Removes empty strings for optional fields
 *  - Converts empty subscriptionId to null (per anyOf schema)
 *  - Strips undefined values
 *  - Removes empty arrays for optional fields
 * ============================================================ */

/** Fields that should become null when empty (anyOf with null) */
const NULLABLE_FIELDS = new Set(['subscriptionId']);

/** Top-level required fields that must always be present */
const REQUIRED_SUBSCRIPTION_FIELDS = new Set([
  'location',
  'subscriptionName',
  'subscriptionAliasName',
  'managementGroupName',
]);

/**
 * Recursively sanitizes form data for JSON output.
 * Removes empty optional values while preserving required ones.
 */
export function sanitizeFormData(
  data: Record<string, unknown>,
  requiredFields: Set<string> = REQUIRED_SUBSCRIPTION_FIELDS
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Handle nullable fields (e.g., subscriptionId)
    if (NULLABLE_FIELDS.has(key)) {
      if (value === '' || value === undefined || value === null) {
        result[key] = null;
      } else {
        result[key] = value;
      }
      continue;
    }

    // Skip undefined values
    if (value === undefined) continue;

    // Handle empty strings
    if (value === '') {
      if (requiredFields.has(key)) {
        result[key] = value; // Keep — validation will catch it
      }
      // Skip optional empty strings
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const sanitizedArray = value
        .map((item) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return sanitizeFormData(item as Record<string, unknown>, new Set());
          }
          return item;
        })
        .filter((item) => {
          // Remove empty objects from arrays
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return Object.keys(item).length > 0;
          }
          // Remove empty strings from arrays
          return item !== '' && item !== undefined;
        });

      // Only include non-empty arrays (or required ones)
      if (sanitizedArray.length > 0 || requiredFields.has(key)) {
        result[key] = sanitizedArray;
      }
      continue;
    }

    // Handle nested objects
    if (value && typeof value === 'object') {
      const sanitized = sanitizeFormData(value as Record<string, unknown>, new Set());
      if (Object.keys(sanitized).length > 0 || requiredFields.has(key)) {
        result[key] = sanitized;
      }
      continue;
    }

    // Primitive values — include as-is
    result[key] = value;
  }

  return result;
}
