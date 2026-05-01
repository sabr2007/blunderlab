import { expect, test } from "@playwright/test";

test("landing exposes start and sign-in CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /start training/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /sign in/i }).first(),
  ).toBeVisible();
});

test("pro page renders tiers and waitlist", async ({ page }) => {
  await page.goto("/pro");
  await expect(
    page.getByRole("heading", { name: /upgrade when reviews/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Free", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pro", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "School", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /join waitlist/i }),
  ).toBeVisible();
});
