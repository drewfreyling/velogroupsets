import {defineConfig} from '@playwright/test';
import production from './playwright.production.config.mjs';

export default defineConfig({
  ...production,
  // Check the deployed site with normal browser certificate validation.
  webServer: undefined,
  use: {...production.use, baseURL: 'https://velogroupsets.com'},
});
