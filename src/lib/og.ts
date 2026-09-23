import type { Tone } from "./types";

/**
 * Palette for the generated OG images.
 *
 * These are the dark-theme values from globals.css, duplicated as literals
 * rather than read from CSS: ImageResponse renders through Satori, which
 * resolves neither Tailwind classes nor CSS custom properties. Keep them in
 * step with the `:root` block in globals.css when the brand colours move.
 */
export const OG = {
  bg: "#08080b",
  text: "#f4f4f7",
  muted: "#a2a2b8",
  faint: "#7e7e99",
  accent: "#7f6cff",
  accentSoft: "#a99dff",
  line: "rgba(255,255,255,0.09)",
  fill: "rgba(255,255,255,0.05)",
  fillStrong: "rgba(255,255,255,0.12)",
  markFrom: "#9a8bff",
  markTo: "#6248e8",
} as const;

/** The column accent colours, keyed the same way the board keys them. */
export const TONE_HEX: Record<Tone, string> = {
  positive: "#34d399",
  negative: "#fb7185",
  neutral: "#60a5fa",
  idea: "#fbbf24",
};

/** Facebook and X both crop to roughly this ratio, so match it exactly. */
export const OG_SIZE = { width: 1200, height: 630 };
