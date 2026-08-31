import type { Metadata } from "next";
import Link from "next/link";
import { BoardBuilder } from "@/components/BoardBuilder";
import { SetupNotice } from "@/components/SetupNotice";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isAiConfigured } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Build a custom retrospective board",
  description:
    "Build a retro board your way: choose how many columns, name each one, pick its colour, rename the action items section, and set the vote budget. Free, no sign-up.",
  alternates: { canonical: "/new" },
};

export default function NewBoardPage() {
  if (!isDatabaseConfigured()) {
    return <SetupNotice hasDatabase={false} hasAi={isAiConfigured()} />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24">
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30"
          aria-label="Retro Board home"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent-soft" fill="currentColor" aria-hidden="true">
            <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
            <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
            <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
            <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
          </svg>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-mist-300">
          Retro Board
        </span>
        <ThemeToggle className="ml-auto" />
      </div>

      <h1 className="mt-10 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight text-mist-100 sm:text-5xl">
        Build the board your team actually runs.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist-500">
        Start from a format or a blank board, then set it up however your retro
        works: as many columns as you need, named and coloured your way, with
        the actions section renamed to whatever your team calls it.
      </p>

      <div className="mt-8">
        <BoardBuilder />
      </div>

      <p className="mt-6 text-[12px] text-mist-700">
        Want a ready-made format instead?{" "}
        <Link href="/" className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
          Pick a template on the home page
        </Link>
        .
      </p>
    </main>
  );
}
