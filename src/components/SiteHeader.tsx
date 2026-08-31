import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

/** The brand row shared by every content page. */
export function SiteHeader() {
  return (
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
      <Link href="/" className="text-sm font-semibold tracking-tight text-mist-300 hover:text-mist-100">
        Retro Board
      </Link>
      <nav className="ml-auto flex items-center gap-3">
        <Link href="/templates" className="text-[12px] text-mist-500 hover:text-mist-100">
          Templates
        </Link>
        <Link href="/how-to-run-a-retrospective" className="hidden text-[12px] text-mist-500 hover:text-mist-100 sm:block">
          Guide
        </Link>
        <ThemeToggle />
      </nav>
    </div>
  );
}
