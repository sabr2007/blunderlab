import { coachWidgetLauncherContainerClassName } from "@/components/coach/coach-widget-layout";
import { describe, expect, it } from "vitest";

describe("coachWidgetLauncherContainerClassName", () => {
  it("lifts the launcher above the mobile bottom nav", () => {
    expect(coachWidgetLauncherContainerClassName).toContain(
      "bottom-[calc(4rem+1rem+env(safe-area-inset-bottom))]",
    );
    expect(coachWidgetLauncherContainerClassName).toContain("lg:bottom-6");
  });
});
