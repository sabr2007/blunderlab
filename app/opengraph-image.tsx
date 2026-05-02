import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#111319",
        color: "#f4f4f5",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 32,
            fontWeight: 700,
            gap: 18,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "rgba(82, 113, 255, 0.18)",
              borderRadius: 14,
              color: "#86a0ff",
              display: "flex",
              height: 56,
              justifyContent: "center",
              width: 56,
            }}
          >
            B
          </div>
          BlunderLab
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.02,
            maxWidth: 760,
          }}
        >
          Turn every blunder into your next training plan.
        </div>
        <div style={{ color: "#b6bbc7", display: "flex", fontSize: 28 }}>
          AI chess coach for post-game review, patterns, and daily training.
        </div>
      </div>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 20,
          width: 300,
        }}
      >
        {[
          "Critical moment",
          "Pattern: Tunnel Vision",
          "Goal: scan threats",
        ].map((item) => (
          <div
            key={item}
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              color: "#e9eaf0",
              display: "flex",
              fontSize: 22,
              padding: "18px 20px",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
