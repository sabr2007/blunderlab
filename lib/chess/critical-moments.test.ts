import { describe, expect, it } from "vitest";
import {
  type AnalyzedPly,
  evalDropCp,
  evalSnapshotToCp,
  selectCriticalMoments,
  severityFromDrop,
  userPovCp,
} from "./critical-moments";

function makePly(overrides: Partial<AnalyzedPly>): AnalyzedPly {
  return {
    ply: 1,
    moveNumber: 1,
    color: "white",
    san: "e4",
    uci: "e2e4",
    from: "e2",
    to: "e4",
    fenBefore: "start",
    fenAfter: "after",
    bestMove: "e2e4",
    bestMoveSan: "e4",
    evalBefore: { cp: 0, mate: null },
    evalAfter: { cp: 0, mate: null },
    ...overrides,
  };
}

describe("evalSnapshotToCp", () => {
  it("returns cp directly when present", () => {
    expect(evalSnapshotToCp({ cp: 120, mate: null })).toBe(120);
  });

  it("converts positive mate to large positive cp", () => {
    expect(evalSnapshotToCp({ cp: null, mate: 3 })).toBe(10_000);
  });

  it("converts negative mate to large negative cp", () => {
    expect(evalSnapshotToCp({ cp: null, mate: -2 })).toBe(-10_000);
  });

  it("returns null when both are null", () => {
    expect(evalSnapshotToCp({ cp: null, mate: null })).toBeNull();
  });
});

describe("userPovCp", () => {
  it("keeps sign when side-to-move equals user color", () => {
    expect(userPovCp({ cp: 200, mate: null }, "white", "white")).toBe(200);
    expect(userPovCp({ cp: -100, mate: null }, "black", "black")).toBe(-100);
  });

  it("flips sign when side-to-move is opponent", () => {
    expect(userPovCp({ cp: 200, mate: null }, "black", "white")).toBe(-200);
    expect(userPovCp({ cp: -100, mate: null }, "white", "black")).toBe(100);
  });
});

describe("evalDropCp", () => {
  it("computes drop in user pov for a white user move", () => {
    const ply = makePly({
      color: "white",
      evalBefore: { cp: 100, mate: null },
      evalAfter: { cp: 150, mate: null },
    });

    // white before = +100, after (black to move, +150) flipped = -150 → drop 250
    expect(evalDropCp(ply, "white")).toBe(250);
  });

  it("returns null when either snapshot is missing", () => {
    const ply = makePly({
      evalBefore: { cp: null, mate: null },
      evalAfter: { cp: 100, mate: null },
    });
    expect(evalDropCp(ply, "white")).toBeNull();
  });
});

describe("selectCriticalMoments", () => {
  function userPly(overrides: Partial<AnalyzedPly>) {
    return makePly({ color: "white", ...overrides });
  }

  it("filters by minimum drop and selects top three", () => {
    const plies: AnalyzedPly[] = [
      // drop = 50 (under threshold)
      userPly({
        ply: 1,
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: -50, mate: null },
      }),
      // drop = 250
      userPly({
        ply: 3,
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 150, mate: null },
      }),
      // drop = 400
      userPly({
        ply: 7,
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 300, mate: null },
      }),
      // drop = 300
      userPly({
        ply: 11,
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 200, mate: null },
      }),
      // drop = 350
      userPly({
        ply: 15,
        evalBefore: { cp: 50, mate: null },
        evalAfter: { cp: 300, mate: null },
      }),
    ];

    const moments = selectCriticalMoments(plies, "white");

    expect(moments).toHaveLength(3);
    expect(moments.map((m) => m.ply.ply)).toEqual([7, 11, 15]);
    expect(moments[0].evalDropCp).toBe(400);
  });

  it("dedupes adjacent plies, keeping the larger drop", () => {
    const plies: AnalyzedPly[] = [
      makePly({
        ply: 5,
        color: "white",
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 150, mate: null },
      }), // drop 250
      makePly({
        ply: 6,
        color: "white",
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 400, mate: null },
      }), // drop 500 (within 2 ply of the previous)
      makePly({
        ply: 12,
        color: "white",
        evalBefore: { cp: 100, mate: null },
        evalAfter: { cp: 250, mate: null },
      }), // drop 350
    ];

    const moments = selectCriticalMoments(plies, "white");

    expect(moments.map((m) => m.ply.ply)).toEqual([6, 12]);
  });

  it("ignores opponent plies", () => {
    const plies: AnalyzedPly[] = [
      makePly({
        ply: 4,
        color: "black", // opponent move when user is white
        evalBefore: { cp: 0, mate: null },
        evalAfter: { cp: 800, mate: null },
      }),
    ];

    const moments = selectCriticalMoments(plies, "white");
    expect(moments).toHaveLength(0);
  });
});

describe("severityFromDrop", () => {
  it("classifies blunder/mistake/inaccuracy", () => {
    expect(severityFromDrop(400)).toBe("blunder");
    expect(severityFromDrop(200)).toBe("mistake");
    expect(severityFromDrop(120)).toBe("inaccuracy");
  });
});
