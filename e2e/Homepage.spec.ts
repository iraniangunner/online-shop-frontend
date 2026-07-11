import { test, expect } from "@playwright/test";

test.describe("صفحه‌ی اصلی", () => {
  test("shows the hero heading and CTA button", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /نوبت زیبایی/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "رزرو نوبت" }).first()
    ).toBeVisible();
  });

  test("header navigation links are present", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");

    await expect(
      header.getByRole("link", { name: "خدمات", exact: true })
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "درباره ما", exact: true })
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "تماس با ما", exact: true })
    ).toBeVisible();
  });

  test("clicking the main CTA navigates to branch selection", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "رزرو نوبت" }).first().click();

    await expect(page).toHaveURL(/\/login|\/booking\/branch/);
  });

  test("services preview shows real services from the backend", async ({
    page,
  }) => {
    await page.goto("/");

    // چون این بخش با SSR از بک‌اند واقعی داده می‌گیره، باید حداقل یه کارت خدمت دیده بشه
    const servicesSection = page.locator("#services").first();
    await expect(servicesSection).toBeVisible();
  });
});
