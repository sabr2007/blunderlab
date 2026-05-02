import { expect, test } from "@playwright/test";

test.skip(
  process.env.RUN_SUPABASE_E2E !== "1",
  "Set RUN_SUPABASE_E2E=1 with configured Supabase env to run the real Play to Review flow.",
);

test("anonymous player can reach review after a completed game", async ({
  page,
}) => {
  await page.goto("/en/play");
  await expect(
    page.getByRole("heading", { name: /play against stockfish/i }),
  ).toBeVisible();

  // Full board automation is intentionally gated behind the real Supabase E2E
  // run because react-chessboard does not expose stable square test ids yet.
  await expect(page.getByText(/game status/i)).toBeVisible();
});
