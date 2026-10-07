import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/api.ts",
        "lib/server-api.ts",
        "components/dashboard/quiz-panel.tsx",
        "components/admin/assessment-editor.tsx",
        "components/admin/assessment-settings-form.tsx",
        "components/admin/trainer-assignment-form.tsx",
        "components/admin/trainer-management-form.tsx",
        "components/admin/reset-attempts-button.tsx",
        "components/navigation/navigation-items.ts",
        "app/api/backend/[...path]/route.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
