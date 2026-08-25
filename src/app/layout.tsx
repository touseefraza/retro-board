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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
