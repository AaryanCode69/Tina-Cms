/* ============================================================
 * JSON Generator
 * Converts sanitized form data into schema-compliant JSON.
 * Output is deterministic with consistent key ordering and
 * 2-space indentation.
 * ============================================================ */

/**
 * Generates a formatted JSON string for a single subscription.
 * Wraps the subscription data in the required { subscriptions: [...] } envelope.
 *
 * @param formData — Sanitized form data from the subscription form
 * @returns — Pretty-printed JSON string ready for file output
 */
export function generateSubscriptionJson(
  formData: Record<string, unknown>
): string {
  const output = {
    subscriptions: [formData],
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Generates the file name for a subscription JSON file.
 * Uses the subscriptionName field, lowercased and hyphenated.
 *
 * @param subscriptionName — The subscription name from form data
 * @returns — File name without path (e.g., "my-subscription.json")
 */
export function generateFileName(subscriptionName: string): string {
  const sanitized = subscriptionName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${sanitized}.json`;
}

/**
 * Generates the full file path within the repository.
 *
 * @param subscriptionName — The subscription name from form data
 * @returns — Full path (e.g., "content/subscriptions/my-subscription.json")
 */
export function generateFilePath(subscriptionName: string): string {
  return `content/subscriptions/${generateFileName(subscriptionName)}`;
}
