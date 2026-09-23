import { ImageResponse } from "next/og";
import { OG, OG_SIZE, TONE_HEX } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt =
  "Retro Board, a free online retrospective board for agile teams";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * The board mocked along the bottom edge. It is deliberately wordless: at the
 * ~500px Slack and X render this at, column labels are unreadable anyway, and
 * the shape of four columns of stickies is what makes the card say "retro
 * board" before anyone reads the headline.
 */
const COLUMNS: { tone: keyof typeof TONE_HEX; label: string; cards: string[] }[] = [
  { tone: "positive", label: "62%", cards: ["88%", "64%"] },
  { tone: "negative", label: "48%", cards: ["72%", "90%"] },
  { tone: "neutral", label: "55%", cards: ["80%", "58%"] },
  { tone: "idea", label: "44%", cards: ["66%", "84%"] },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 60,
          background: OG.bg,
          color: OG.text,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundImage: `linear-gradient(135deg, ${OG.markFrom} 0%, ${OG.markTo} 100%)`,
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            RB
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: OG.muted }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            Run the retro.
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
              color: OG.accentSoft,
            }}
          >
            Everyone on the same board.
          </div>
          <div style={{ marginTop: 22, fontSize: 25, color: OG.muted }}>
            Free, no sign-up. Pick a format, share the link, write cards.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {COLUMNS.map((column) => (
            <div
              key={column.tone}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                gap: 12,
                padding: 18,
                borderRadius: 18,
                background: OG.fill,
                border: `1px solid ${OG.line}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: TONE_HEX[column.tone],
                  }}
                />
                <div
                  style={{
                    width: column.label,
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.3)",
                  }}
                />
              </div>
              {column.cards.map((width, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    height: 34,
                    width,
                    borderRadius: 10,
                    background: OG.fillStrong,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
