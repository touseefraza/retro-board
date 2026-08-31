import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isAiConfigured } from "@/lib/ai";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateMetadata(): Metadata {
  const base = siteUrl();
  // The facilitator is only worth advertising when there's a key behind it.
  const description = isAiConfigured()
    ? `${SITE_DESCRIPTION} Claude groups the cards, drafts the actions, and writes the read-out.`
    : SITE_DESCRIPTION;

  return {
    metadataBase: new URL(base),
    title: {
      // Search results show this; the tagline carries the words people type.
      default: `${SITE_NAME} | ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: [
      "retro board",
      "retrospective board",
      "sprint retrospective",
      "agile retrospective",
      "online retro tool",
      "team retrospective",
      "free retro board",
      "scrum retrospective",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: base,
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
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
