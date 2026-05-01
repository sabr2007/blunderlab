import { expect, test } from "@playwright/test";

test("mobile auth guard remains usable", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(
    page.getByRole("button", { name: /continue with google/i }),
  ).toBeVisible();
});
