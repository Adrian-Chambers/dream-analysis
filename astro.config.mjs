import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import devAdapter from './dev-adapter.mjs';

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: devAdapter
});