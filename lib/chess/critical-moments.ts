import type { PlayerColor } from "./types";

export const MATE_CP_EQUIVALENT = 10_000;

export type EvalSnapshot = {
  cp: number | null;
  mate: number | null;
};

export type AnalyzedPly = {
  ply: number;
  moveNumber: number;
  color: PlayerColor;
  san: string;
  uci: string;
  from: string;
  to: string;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: EvalSnapshot;
  evalAfter: EvalSnapshot;
  bestMove: string | null;
  bestMoveSan: string | null;
};

export type CriticalMoment = {
  ply: AnalyzedPly;
  evalDropCp: number;
  evalBeforeUserCp: number;
  evalAfterUserCp: number;
};

export type CriticalMomentOptions = {
  minDropCp?: number;
  max?: number;
  dedupeWithinPly?: number;
};

const DEFAULTS: Required<CriticalMomentOptions> = {
  minDropCp: 100,
  max: 3,
  dedupeWithinPly: 2,
};

export function evalSnapshotToCp(snapshot: EvalSnapshot): number | null {
  if (snapshot.mate !== null) {
    return snapshot.mate >= 0 ? MATE_CP_EQUIVALENT : -MATE_CP_EQUIVALENT;
  }

  return snapshot.cp;
}

export function userPovCp(
  snapshot: EvalSnapshot,
  sideToMove: PlayerColor,
  userColor: PlayerColor,
): number | null {
  const cp = evalSnapshotToCp(snapshot);

  if (cp === null) {
    return null;
  }

  return sideToMove === userColor ? cp : -cp;
}

export function evalDropCp(
  ply: AnalyzedPly,
  userColor: PlayerColor,
): number | null {
  const before = userPovCp(ply.evalBefore, ply.color, userColor);
  const opponentColor: PlayerColor = ply.color === "white" ? "black" : "white";
  const after = userPovCp(ply.evalAfter, opponentColor, userColor);

  if (before === null || after === null) {
    return null;
  }

  return before - after;
}

/**
 * Select up to N critical moments where the user's move dropped evaluation
 * by at least minDropCp. Results are sorted by drop (desc) with later
 * positions winning ties (the player should focus on the costliest miss
 * closest to the result).
 */
export function selectCriticalMoments(
  plies: AnalyzedPly[],
  userColor: PlayerColor,
  options: CriticalMomentOptions = {},
): CriticalMoment[] {
  const { minDropCp, max, dedupeWithinPly } = { ...DEFAULTS, ...options };

  const candidates: CriticalMoment[] = [];

  for (const ply of plies) {
    if (ply.color !== userColor) {
      continue;
    }

    const opponentColor: PlayerColor =
      ply.color === "white" ? "black" : "white";
    const before = userPovCp(ply.evalBefore, ply.color, userColor);
    const after = userPovCp(ply.evalAfter, opponentColor, userColor);

    if (before === null || after === null) {
      continue;
    }

    const drop = before - after;

    if (drop < minDropCp) {
      continue;
    }

    candidates.push({
      ply,
      evalDropCp: drop,
      evalBeforeUserCp: before,
      evalAfterUserCp: after,
    });
  }

  candidates.sort((a, b) => {
    if (b.evalDropCp !== a.evalDropCp) {
      return b.evalDropCp - a.evalDropCp;
    }

    return b.ply.ply - a.ply.ply;
  });

  const selected: CriticalMoment[] = [];

  for (const candidate of candidates) {
    if (selected.length >= max) {
      break;
    }

    const tooClose = selected.some(
      (existing) =>
        Math.abs(existing.ply.ply - candidate.ply.ply) < dedupeWithinPly,
    );

    if (tooClose) {
      continue;
    }

    selected.push(candidate);
  }

  return selected.sort((a, b) => a.ply.ply - b.ply.ply);
}

export function severityFromDrop(
  dropCp: number,
): "inaccuracy" | "mistake" | "blunder" {
  if (dropCp >= 300) {
    return "blunder";
  }

  if (dropCp >= 150) {
    return "mistake";
  }

  return "inaccuracy";
}
