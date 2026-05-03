import { expect, test } from "@playwright/test";

test("mobile app shell keeps bottom nav tiles equal and compact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 280, height: 568 });
  await page.goto("/ru/play");

  const bottomNav = page.getByRole("navigation");
  await expect(bottomNav).toHaveCount(1);

  const links = bottomNav.getByRole("link");
  await expect(links).toHaveCount(4);

  const navWidth = await bottomNav.evaluate(
    (node) => node.getBoundingClientRect().width,
  );
  const viewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth,
  );

  const metrics = await links.evaluateAll((nodes) =>
    nodes.map((node) => {
      const label = node.querySelector("span");
      const linkRect = node.getBoundingClientRect();
      const labelRect = label?.getBoundingClientRect();

      return {
        linkWidth: linkRect.width,
        labelHeight: labelRect?.height ?? 0,
      };
    }),
  );

  expect(Math.abs(navWidth - viewportWidth)).toBeLessThanOrEqual(2);

  const widths = metrics.map((metric) => metric.linkWidth);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);

  const labelHeights = metrics.map((metric) => metric.labelHeight);
  expect(
    Math.max(...labelHeights) - Math.min(...labelHeights),
  ).toBeLessThanOrEqual(2);
});
