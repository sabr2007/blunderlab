import { expect, test } from "@playwright/test";

test.skip(
  !process.env.E2E_REVIEW_GAME_ID,
  "Set E2E_REVIEW_GAME_ID to snapshot a seeded review on mobile.",
);

test("seeded review remains readable on mobile", async ({ page }) => {
  await page.goto(`/en/review/${process.env.E2E_REVIEW_GAME_ID}`);
  await expect(
    page
      .getByTestId("critical-moment-card")
      .first()
      .or(page.getByText(/clean game/i)),
  ).toBeVisible();
});
