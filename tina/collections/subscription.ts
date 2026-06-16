/* ============================================================
 * Subscription Collection for TinaCMS
 * Defines the CMS collection fields that map to the
 * subscription JSON schema structure.
 * ============================================================ */

import type { Collection } from 'tinacms';

const subscriptionCollection: Collection = {
  name: 'subscription',
  label: 'Subscriptions',
  path: 'content/subscriptions',
  format: 'json',
  fields: [
    {
      type: 'string',
      name: 'subscriptionId',
      label: 'Subscription ID',
      description: 'Azure subscription UUID (leave empty for null)',
    },
    {
      type: 'string',
      name: 'location',
      label: 'Location',
      required: true,
      description: 'Azure region for the subscription',
    },
    {
      type: 'string',
      name: 'subscriptionName',
      label: 'Subscription Name',
      required: true,
      description: 'Display name for the subscription',
    },
    {
      type: 'string',
      name: 'subscriptionAliasName',
      label: 'Subscription Alias Name',
      required: true,
      description: 'Alias name for the subscription',
    },
    {
      type: 'string',
      name: 'managementGroupName',
      label: 'Management Group Name',
      required: true,
      description: 'The management group this subscription belongs to',
    },
  ],
};

export default subscriptionCollection;
