import { defineConfig } from "vite";

// https://vitejs.dev/config

export default defineConfig({
  build: {
    rollupOptions: {
      // Tell Vite to not bundle these Node.js modules and leave their imports as-is
      external: ["googleapis", "@google-cloud/local-auth"],
    },
  },
});
