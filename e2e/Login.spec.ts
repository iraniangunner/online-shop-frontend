import { test, expect } from "@playwright/test";

test.describe("صفحه‌ی ورود", () => {
  test("email tab is active by default", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByPlaceholder("email@example.com")).toBeVisible();
  });

  test("switching to OTP tab shows the mobile number field", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "پیامک" }).click();

    await expect(page.getByPlaceholder("09123456789")).toBeVisible();
  });

  test("shows an error message for wrong credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("email@example.com").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrong-password");
    await page.getByRole("button", { name: "ورود" }).click();

    await expect(page.getByText(/اشتباه است/)).toBeVisible();
  });

  test("successful login with seeded customer redirects to dashboard", async ({
    page,
  }) => {
    // این تست فرض می‌کنه ClinicDemoSeeder اجرا شده
    // (customer@clinic.test / password123)
    await page.goto("/login");

    await page
      .getByPlaceholder("email@example.com")
      .fill("customer@clinic.test");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "ورود" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("forgot password link navigates to the correct page", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "فراموشی رمز عبور؟" }).click();

    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
