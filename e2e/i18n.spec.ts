import { expect, test } from "@playwright/test";

test("root redirects to default English locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test("Russian landing renders localized primary copy", async ({ page }) => {
  await page.goto("/ru");
  await expect(
    page.getByRole("heading", {
      name: /Преврати каждую ошибку в персональный план тренировок/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Начать тренировку/i }).first(),
  ).toBeVisible();
});

test("Russian landing final CTA routes to sign-in", async ({ page }) => {
  await page.goto("/ru");
  await expect(
    page.getByRole("link", { name: /Начать тренировку/i }).last(),
  ).toHaveAttribute("href", "/ru/sign-in?next=/play");
});
