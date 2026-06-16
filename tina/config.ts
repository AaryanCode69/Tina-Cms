/* ============================================================
 * TinaCMS Configuration
 * Local mode setup — no TinaCMS Cloud dependency.
 * ============================================================ */

import { defineConfig } from 'tinacms';
import subscriptionCollection from './collections/subscription';

export default defineConfig({
  branch: '',
  clientId: '',
  token: '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [subscriptionCollection],
  },
});
