import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isAiConfigured } from "@/lib/ai";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateMetadata(): Metadata {
  return {
    title: {
      default: "Retro Board",
      template: "%s · Retro Board",
    },
    // The facilitator is only worth advertising when there's a key behind it.
    description: isAiConfigured()
      ? "A retrospective board with a Claude-powered facilitator. No accounts, no setup — create a board, share the link, run the retro."
      : "A retrospective board for the whole team. No accounts, no setup — create a board, share the link, run the retro.",
  };
}

/**
 * Runs before first paint so the page never flashes the wrong theme: the stored
 * choice wins, otherwise the OS preference decides. Kept inline and tiny for
 * that reason — a component effect would run after the first paint.
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem("retro:theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
