import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // tsconfigPaths مسیرهای alias (مثل @/store/...) رو مستقیم از tsconfig.json
  // می‌خونه، پس نیازی نیست دستی حدس بزنیم پروژه از پوشه‌ی src استفاده می‌کنه
  // یا نه - همیشه دقیقاً با تنظیمات واقعی پروژه هماهنگه.
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    exclude: ["node_modules", "e2e", ".next"],
  },
});