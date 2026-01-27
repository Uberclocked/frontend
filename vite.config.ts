/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/*.stories.*", "**/*.mdx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/components/ui/**",
        "**/*.variants.ts",
        "**/*.types.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "**/*.stories.*",
        "**/*.mdx",
        "**/apiClient.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
