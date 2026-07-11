import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // به‌جای دانلود کروم مخصوص Playwright (که توی ایران مسدوده)،
        // از Edge که روی ویندوز از قبل نصبه استفاده می‌کنیم.
        channel: "msedge",
      },
    },
  ],
  // عمداً webServer رو خودکار روشن نمی‌کنیم، چون هم فرانت‌اند (npm run dev)
  // هم بک‌اند (php artisan serve) باید از قبل جدا اجرا شده باشن.
});
