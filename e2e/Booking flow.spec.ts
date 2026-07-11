import { test, expect, Page } from "@playwright/test";

async function loginAsCustomer(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("email@example.com").fill("customer@clinic.test");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: "ورود" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("فلوی رزرو نوبت (نیاز به داده‌ی Seeder دارد)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test("customer can select a branch and see services", async ({ page }) => {
    await page.goto("/booking/branch");

    await expect(
      page.getByText("شعبه‌ی مورد نظرتان را انتخاب کنید")
    ).toBeVisible();

    // انتخاب اولین شعبه (طبق Seeder: «شعبه مرکزی»)
    await page.getByText("شعبه مرکزی").first().click();

    await expect(page).toHaveURL(/\/booking\/service/);
    await expect(page.getByText("پاکسازی پوست")).toBeVisible();
  });

  test("selecting a service navigates to specialist selection", async ({
    page,
  }) => {
    await page.goto("/booking/branch");
    await page.getByText("شعبه مرکزی").first().click();

    await page.getByText("پاکسازی پوست").first().click();

    await expect(page).toHaveURL(/\/booking\/specialist/);
    await expect(
      page.getByText("متخصص مورد نظرتان را انتخاب کنید")
    ).toBeVisible();
  });

  test("unauthenticated user is redirected away from booking pages", async ({
    page,
    context,
  }) => {
    // کوکی‌ها رو پاک می‌کنیم تا انگار لاگین نکردیم
    await context.clearCookies();

    await page.goto("/booking/branch");

    await expect(page).toHaveURL(/\/login/);
  });
});
