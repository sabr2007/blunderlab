"use client";

import { cn } from "@/lib/utils";
import type { Square } from "chess.js";
import { Chessboard, type ChessboardOptions } from "react-chessboard";

type ChessBoardWrapperProps = {
  fen: string;
  disabled?: boolean;
  selectedSquare?: Square | null;
  legalTargets?: Square[];
  lastMove?: {
    from: Square;
    to: Square;
  } | null;
  bestMove?: {
    from: Square;
    to: Square;
  } | null;
  blunderSquare?: Square | null;
  orientation?: "white" | "black";
  onDrop?: ChessboardOptions["onPieceDrop"];
  onSquareClick?: ChessboardOptions["onSquareClick"];
  canDragPiece?: ChessboardOptions["canDragPiece"];
  className?: string;
};

export function ChessBoardWrapper({
  fen,
  disabled = false,
  selectedSquare,
  legalTargets = [],
  lastMove,
  bestMove,
  blunderSquare,
  orientation = "white",
  onDrop,
  onSquareClick,
  canDragPiece,
  className,
}: ChessBoardWrapperProps) {
  const squareStyles: NonNullable<ChessboardOptions["squareStyles"]> = {};

  if (lastMove) {
    squareStyles[lastMove.from] = {
      background: "var(--board-last-move)",
    };
    squareStyles[lastMove.to] = {
      background: "var(--board-last-move)",
    };
  }

  if (bestMove) {
    squareStyles[bestMove.from] = {
      ...(squareStyles[bestMove.from] ?? {}),
      boxShadow: "inset 0 0 0 3px oklch(70% 0.18 145)",
    };
    squareStyles[bestMove.to] = {
      ...(squareStyles[bestMove.to] ?? {}),
      background: "var(--board-best-move)",
    };
  }

  if (blunderSquare) {
    squareStyles[blunderSquare] = {
      ...(squareStyles[blunderSquare] ?? {}),
      background: "var(--board-blunder)",
    };
  }

  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      ...(squareStyles[selectedSquare] ?? {}),
      boxShadow: "inset 0 0 0 3px var(--color-accent)",
    };
  }

  for (const square of legalTargets) {
    squareStyles[square] = {
      ...(squareStyles[square] ?? {}),
      background:
        "radial-gradient(circle, oklch(70% 0.18 145 / 0.46) 0 18%, transparent 20%)",
    };
  }

  return (
    <div
      className={cn(
        "mx-auto aspect-square w-full max-w-[min(84vw,620px)] overflow-hidden rounded-md border border-border bg-surface shadow-2xl shadow-black/30",
        className,
      )}
    >
      <Chessboard
        options={{
          id: "blunderlab-play-board",
          position: fen,
          boardOrientation: orientation,
          allowDragging: !disabled,
          canDragPiece,
          onPieceDrop: onDrop,
          onSquareClick,
          showNotation: true,
          animationDurationInMs: 160,
          darkSquareStyle: {
            backgroundColor: "var(--board-dark)",
          },
          lightSquareStyle: {
            backgroundColor: "var(--board-light)",
          },
          boardStyle: {
            width: "100%",
            height: "100%",
            borderRadius: "0.5rem",
          },
          squareStyles,
        }}
      />
    </div>
  );
}
