import { expect, test } from "@playwright/test";

test("reduced motion clamps animated durations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/play");

  const transitionMs = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "transition-[width] duration-300 ease-out";
    document.body.appendChild(probe);
    const duration = window.getComputedStyle(probe).transitionDuration;
    probe.remove();
    return duration.endsWith("ms")
      ? Number.parseFloat(duration)
      : Number.parseFloat(duration) * 1000;
  });

  expect(transitionMs).toBeLessThanOrEqual(10);
});
