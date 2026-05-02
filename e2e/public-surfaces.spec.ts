import { expect, test } from "@playwright/test";

test("landing exposes start and sign-in CTAs", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("link", { name: /start training/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /sign in/i }).first(),
  ).toBeVisible();
});

test("pro page renders tiers and waitlist", async ({ page }) => {
  await page.goto("/en/pro");
  await expect(
    page.getByRole("heading", { name: /deeper training modes/i }),
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

test("builders landing renders the focused audience narrative", async ({
  page,
}) => {
  await page.goto("/en/builders");
  await expect(
    page.getByRole("heading", {
      name: /pattern recognition is your superpower/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/decision-making gym/i)).toBeVisible();
});

test("play page starts from mode selection", async ({ page }) => {
  await page.goto("/en/play");
  await expect(
    page.getByRole("heading", { name: /choose the mode/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /classic game/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /goal focus/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /dashboard/i }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: /start game/i }).click();
  await expect(page.getByText(/game status/i)).toBeVisible();
});
