import { ImageResponse } from "next/og";
import { OG, OG_SIZE, TONE_HEX } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { TEMPLATE_GUIDES, guideBySlug } from "@/lib/templateContent";

export const alt = "Retrospective template on Retro Board";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Prerender one card per format rather than rendering them on request. */
export function generateStaticParams() {
  return TEMPLATE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

/**
 * Format names run from "Sailboat" to "Liked / Learned / Lacked / Longed for",
 * so the headline cannot take a fixed size without either wrapping badly or
 * leaving the short ones looking lost. Satori has no text-fitting, hence the
 * step function.
 */
function headlineSize(name: string): number {
  if (name.length <= 18) return 68;
  if (name.length <= 26) return 58;
  return 44;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return new ImageResponse(<div />, size);

  const fontSize = headlineSize(guide.name);

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
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: 3,
              color: OG.faint,
            }}
          >
            RETROSPECTIVE TEMPLATE
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            {guide.name}
          </div>
          <div style={{ marginTop: 16, fontSize: 25, color: OG.muted }}>
            Free board, ready to run. No sign-up.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {guide.columns.map((column) => (
            <div
              key={column.title}
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
                    fontSize: 23,
                    fontWeight: 600,
                    color: TONE_HEX[column.tone],
                  }}
                >
                  {column.title}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 30,
                  width: "88%",
                  borderRadius: 10,
                  background: OG.fillStrong,
                }}
              />
              <div
                style={{
                  display: "flex",
                  height: 30,
                  width: "66%",
                  borderRadius: 10,
                  background: OG.fillStrong,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
