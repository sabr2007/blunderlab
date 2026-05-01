import type { EngineSearchResult } from "./types";

const STOCKFISH_WORKER_PATH = "/stockfish/stockfish-18-lite-single.js";
const STOCKFISH_WASM_PATH = "/stockfish/stockfish-18-lite-single.wasm";

const DEFAULT_DEPTH = 14;
const DEFAULT_MOVETIME_MS = 1500;
const DEFAULT_TIMEOUT_MS = 6000;

export type AnalysisOptions = {
  depth?: number;
  movetimeMs?: number;
  timeoutMs?: number;
};

export type AnalyzedPosition = {
  fen: string;
  bestMove: string | null;
  evalCp: number | null;
  evalMate: number | null;
  depth: number | null;
  principalVariation: string[];
};

type PendingSearch = {
  resolve: (result: EngineSearchResult) => void;
  reject: (error: Error) => void;
  lastInfo?: Partial<EngineSearchResult>;
  timeoutId: number;
};

/**
 * Analysis-strength Stockfish wrapper. Distinct from the play-time engine
 * because it must run at full skill level regardless of opponent difficulty
 * and operate on a sequence of post-game positions.
 */
export class StockfishAnalyzer {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private readyResolver: (() => void) | null = null;
  private pendingSearch: PendingSearch | null = null;
  private isConfigured = false;

  async analyzePosition(
    fen: string,
    options: AnalysisOptions = {},
  ): Promise<AnalyzedPosition> {
    await this.ensureReady();

    const depth = options.depth ?? DEFAULT_DEPTH;
    const movetime = options.movetimeMs ?? DEFAULT_MOVETIME_MS;
    const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const raw = await this.runSearch(fen, depth, movetime, timeout);

    return {
      fen,
      bestMove: normaliseBestMove(raw.bestMove),
      evalCp: raw.evaluation?.type === "cp" ? raw.evaluation.value : null,
      evalMate: raw.evaluation?.type === "mate" ? raw.evaluation.value : null,
      depth: raw.depth ?? null,
      principalVariation: raw.principalVariation ?? [],
    };
  }

  async analyzeBatch(
    fens: string[],
    options: AnalysisOptions = {},
    onProgress?: (done: number, total: number) => void,
  ): Promise<AnalyzedPosition[]> {
    const results: AnalyzedPosition[] = [];

    for (let i = 0; i < fens.length; i += 1) {
      const result = await this.analyzePosition(fens[i], options);
      results.push(result);
      onProgress?.(i + 1, fens.length);
    }

    return results;
  }

  destroy() {
    if (this.pendingSearch) {
      window.clearTimeout(this.pendingSearch.timeoutId);
      this.pendingSearch.reject(new Error("Analyzer destroyed"));
      this.pendingSearch = null;
    }

    if (this.worker) {
      this.post("quit");
      this.worker.terminate();
      this.worker = null;
    }

    this.readyPromise = null;
    this.readyResolver = null;
    this.isConfigured = false;
  }

  private ensureReady() {
    if (typeof window === "undefined") {
      return Promise.reject(
        new Error("Stockfish analyzer can only run in the browser"),
      );
    }

    if (!this.worker) {
      this.worker = createWorker();
      this.worker.addEventListener("message", this.handleMessage);
      this.readyPromise = new Promise((resolve) => {
        this.readyResolver = resolve;
      });
      this.post("uci");
    }

    return (
      this.readyPromise?.then(() => {
        if (this.isConfigured) {
          return;
        }

        this.post("ucinewgame");
        this.post("setoption name UCI_LimitStrength value false");
        this.post("setoption name Skill Level value 20");
        this.post("isready");
        this.isConfigured = true;
      }) ?? Promise.resolve()
    );
  }

  private runSearch(
    fen: string,
    depth: number,
    movetimeMs: number,
    timeoutMs: number,
  ) {
    return new Promise<EngineSearchResult>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Analyzer worker is not available"));
        return;
      }

      if (this.pendingSearch) {
        this.post("stop");
        window.clearTimeout(this.pendingSearch.timeoutId);
        this.pendingSearch.reject(new Error("Analyzer search interrupted"));
      }

      const timeoutId = window.setTimeout(() => {
        if (this.pendingSearch) {
          this.post("stop");
          this.pendingSearch.reject(new Error("Analyzer search timed out"));
          this.pendingSearch = null;
        }
      }, timeoutMs);

      this.pendingSearch = { resolve, reject, timeoutId };
      this.post(`position fen ${fen}`);
      this.post(`go depth ${depth} movetime ${movetimeMs}`);
    });
  }

  private post(command: string) {
    this.worker?.postMessage(command);
  }

  private handleMessage = (event: MessageEvent<string>) => {
    const line = String(event.data);

    if (line === "uciok" || line === "readyok") {
      this.readyResolver?.();
      return;
    }

    if (line.startsWith("info ")) {
      this.pendingSearch = this.pendingSearch
        ? {
            ...this.pendingSearch,
            lastInfo: parseInfoLine(line, this.pendingSearch.lastInfo),
          }
        : null;
      return;
    }

    if (line.startsWith("bestmove ")) {
      const pending = this.pendingSearch;

      if (!pending) {
        return;
      }

      window.clearTimeout(pending.timeoutId);
      this.pendingSearch = null;
      pending.resolve(parseBestMoveLine(line, pending.lastInfo));
    }
  };
}

function createWorker() {
  const wasmPath = encodeURIComponent(STOCKFISH_WASM_PATH);
  return new Worker(`${STOCKFISH_WORKER_PATH}#${wasmPath}`);
}

function normaliseBestMove(value: string | undefined) {
  if (!value || value === "(none)" || value === "0000") {
    return null;
  }

  return value;
}

function parseInfoLine(
  line: string,
  previous?: Partial<EngineSearchResult>,
): Partial<EngineSearchResult> {
  const tokens = line.split(/\s+/);
  const next: Partial<EngineSearchResult> = { ...previous };
  const depthIndex = tokens.indexOf("depth");
  const scoreIndex = tokens.indexOf("score");
  const pvIndex = tokens.indexOf("pv");

  if (depthIndex !== -1) {
    next.depth = Number(tokens[depthIndex + 1]);
  }

  if (scoreIndex !== -1) {
    const type = tokens[scoreIndex + 1];
    const value = Number(tokens[scoreIndex + 2]);

    if ((type === "cp" || type === "mate") && Number.isFinite(value)) {
      next.evaluation = { type, value };
    }
  }

  if (pvIndex !== -1) {
    next.principalVariation = tokens.slice(pvIndex + 1);
  }

  return next;
}

function parseBestMoveLine(
  line: string,
  info: Partial<EngineSearchResult> = {},
): EngineSearchResult {
  const tokens = line.split(/\s+/);
  const ponderIndex = tokens.indexOf("ponder");

  return {
    bestMove: tokens[1],
    ponder: ponderIndex === -1 ? undefined : tokens[ponderIndex + 1],
    evaluation: info.evaluation,
    depth: info.depth,
    principalVariation: info.principalVariation,
  };
}
