import { expect, test } from "@playwright/test";

test("protected service routes redirect anonymous users to sign-in", async ({
  page,
}) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/sign-in\?next=%2Fen%2Fdashboard/);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
