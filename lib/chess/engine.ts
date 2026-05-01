import type { AiDifficulty, EnginePreset, EngineSearchResult } from "./types";

const STOCKFISH_WORKER_PATH = "/stockfish/stockfish-18-lite-single.js";
const STOCKFISH_WASM_PATH = "/stockfish/stockfish-18-lite-single.wasm";

export const ENGINE_PRESETS: Record<AiDifficulty, EnginePreset> = {
  beginner: {
    label: "Beginner",
    skillLevel: 4,
    depth: 6,
  },
  intermediate: {
    label: "Intermediate",
    skillLevel: 12,
    depth: 10,
  },
  advanced: {
    label: "Advanced",
    skillLevel: 18,
    depth: 14,
  },
};

type PendingSearch = {
  resolve: (result: EngineSearchResult) => void;
  reject: (error: Error) => void;
  lastInfo?: Partial<EngineSearchResult>;
  timeoutId: number;
};

export class StockfishEngine {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private readyResolver: (() => void) | null = null;
  private pendingSearch: PendingSearch | null = null;
  private configuredDifficulty: AiDifficulty | null = null;

  async bestMove(
    fen: string,
    difficulty: AiDifficulty,
  ): Promise<EngineSearchResult> {
    await this.ensureReady(difficulty);

    const preset = ENGINE_PRESETS[difficulty];

    return new Promise<EngineSearchResult>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Stockfish worker is not available"));
        return;
      }

      if (this.pendingSearch) {
        this.post("stop");
        window.clearTimeout(this.pendingSearch.timeoutId);
        this.pendingSearch.reject(new Error("Stockfish search interrupted"));
      }

      const timeoutId = window.setTimeout(() => {
        if (this.pendingSearch) {
          this.post("stop");
          this.pendingSearch.reject(new Error("Stockfish search timed out"));
          this.pendingSearch = null;
        }
      }, 5000);

      this.pendingSearch = {
        resolve,
        reject,
        timeoutId,
      };

      this.post(`position fen ${fen}`);
      this.post(`go depth ${preset.depth}`);
    });
  }

  async evaluate(
    fen: string,
    difficulty: AiDifficulty,
  ): Promise<EngineSearchResult> {
    return this.bestMove(fen, difficulty);
  }

  destroy() {
    if (this.pendingSearch) {
      window.clearTimeout(this.pendingSearch.timeoutId);
      this.pendingSearch.reject(new Error("Stockfish worker destroyed"));
      this.pendingSearch = null;
    }

    this.post("quit");
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    this.readyResolver = null;
    this.configuredDifficulty = null;
  }

  private ensureReady(difficulty: AiDifficulty) {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Stockfish can only run in the browser"));
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
      this.readyPromise?.then(() => this.configure(difficulty)) ??
      Promise.resolve()
    );
  }

  private configure(difficulty: AiDifficulty) {
    if (this.configuredDifficulty === difficulty) {
      return;
    }

    const preset = ENGINE_PRESETS[difficulty];

    this.post("ucinewgame");
    this.post("setoption name UCI_LimitStrength value false");
    this.post(`setoption name Skill Level value ${preset.skillLevel}`);
    this.post("isready");
    this.configuredDifficulty = difficulty;
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
