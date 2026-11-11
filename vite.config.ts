import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Relative assets so it can be deployed to any static host or opened directly
  server: {
    port: 5175,
    open: false,
  },
});
