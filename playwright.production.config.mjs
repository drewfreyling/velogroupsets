import {defineConfig} from '@playwright/test';
import base from './playwright.config.mjs';

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/production-launch.spec.mjs',
  webServer: {
    ...base.webServer,
    command: 'npx --no-install wrangler dev --config wrangler.jsonc --var ENVIRONMENT:production --var COMMUNITY_ENABLED:false --port 8787 --ip 127.0.0.1',
    reuseExistingServer: false,
  },
});
