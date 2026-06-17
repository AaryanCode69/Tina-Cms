/* ============================================================
 * Subscription Form Page — Server Component
 * Loads schema on the server, passes parsed fields to client.
 * ============================================================ */

import { getSchema } from '@/lib/schema/registry';
import { parseSubscriptionFields } from '@/lib/schema/parser';
import { SchemaResourceType } from '@/utils/types';
import SubscriptionFormClient from './SubscriptionFormClient';

export const metadata = {
  title: 'Create Subscription | Terraform Config Builder',
  description: 'Create a new Azure subscription configuration through a guided form.',
};

export default function NewSubscriptionPage() {
  // Server-side: load and parse schema
  const schema = getSchema(SchemaResourceType.Subscription);
  const fields = parseSubscriptionFields(schema);

  return <SubscriptionFormClient fields={fields} />;
}
