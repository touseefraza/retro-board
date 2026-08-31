import { ImageResponse } from "next/og";

/**
 * iOS ignores SVG icons, so the home-screen icon is rendered to PNG at build
 * time from the same monogram. Apple also puts its own rounding on top, hence
 * the square canvas and the generous padding.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #9a8bff 0%, #6248e8 100%)",
          color: "#ffffff",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        RB
      </div>
    ),
    size,
  );
}
