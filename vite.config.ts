import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",

      all: true,
      include: ["src/**/*.{ts,tsx}"],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },

      exclude: ["src/main.tsx", "src/vite-env.d.ts"],
    },
  },
});
