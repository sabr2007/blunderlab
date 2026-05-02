import { describe, expect, it } from "vitest";
import { pickPrimaryAction } from "./today-action";

const baseGoal = {
  id: "goal-1",
  gameId: "game-1",
  text: "Stop trading queens before move 15.",
  category: null,
  createdAt: new Date().toISOString(),
};

describe("pickPrimaryAction", () => {
  it("prefers daily blunder when available, with goal as secondary", () => {
    const action = pickPrimaryAction({
      dailyStatus: "available",
      activeGoal: baseGoal,
    });

    expect(action.primary.kind).toBe("daily");
    expect(action.primary.href).toBe("/daily-blunder");
    expect(action.secondary?.kind).toBe("goal");
    expect(action.secondary?.href).toBe(`/play?goal=${baseGoal.id}`);
  });

  it("prefers daily blunder when available, falls back to classic when no goal", () => {
    const action = pickPrimaryAction({
      dailyStatus: "available",
      activeGoal: null,
    });

    expect(action.primary.kind).toBe("daily");
    expect(action.secondary?.kind).toBe("classic");
    expect(action.secondary?.href).toBe("/play");
  });

  it("falls back to active goal when daily already completed", () => {
    const action = pickPrimaryAction({
      dailyStatus: "completed",
      activeGoal: baseGoal,
    });

    expect(action.primary.kind).toBe("goal");
    expect(action.primary.href).toBe(`/play?goal=${baseGoal.id}`);
    expect(action.statusHint).toBe("daily_completed");
  });

  it("falls back to classic when daily completed and no goal", () => {
    const action = pickPrimaryAction({
      dailyStatus: "completed",
      activeGoal: null,
    });

    expect(action.primary.kind).toBe("classic");
    expect(action.primary.href).toBe("/play");
    expect(action.statusHint).toBe("daily_completed");
  });

  it("falls back to classic when daily locked and no goal", () => {
    const action = pickPrimaryAction({
      dailyStatus: "locked",
      activeGoal: null,
    });

    expect(action.primary.kind).toBe("classic");
    expect(action.statusHint).toBe("daily_locked");
  });

  it("uses active goal when daily locked but goal exists", () => {
    const action = pickPrimaryAction({
      dailyStatus: "locked",
      activeGoal: baseGoal,
    });

    expect(action.primary.kind).toBe("goal");
    expect(action.statusHint).toBe("daily_locked");
  });

  it("never returns the same href for primary and secondary", () => {
    const action = pickPrimaryAction({
      dailyStatus: "available",
      activeGoal: baseGoal,
    });

    expect(action.primary.href).not.toBe(action.secondary?.href);
  });
});
