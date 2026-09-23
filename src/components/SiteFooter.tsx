import Link from "next/link";
import { TEMPLATE_GUIDES } from "@/lib/templateContent";
import { TONE, cx } from "./ui";

const LINK =
  "text-[13px] text-mist-500 underline decoration-transparent underline-offset-4 transition-colors hover:text-accent-soft hover:decoration-accent/50";
const HEADING =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-700";

const LEARN = [
  { href: "/how-to-run-a-retrospective", label: "How to run a retrospective" },
  { href: "/templates", label: "All retrospective templates" },
];

const BOARD = [
  { href: "/", label: "Start a retro board" },
  { href: "/new", label: "Build a custom board" },
];

/**
 * Sitewide links, on every page a visitor can arrive at from search.
 *
 * The format guides are listed in full on every page rather than only from the
 * templates index. They are the pages worth crawling and the ones least likely
 * to be linked from anywhere else, so the footer is most of the internal
 * linking they get. Generated from TEMPLATE_GUIDES so a new format appears
 * here the moment it exists, carrying its column colours the way the template
 * cards do, which is the one piece of the board that survives being shrunk to
 * a row in a list.
 *
 * The column headings are paragraphs rather than headings: each nav already
 * names itself to a screen reader, and three more h2s on every page would put
 * "Formats" into an outline that is meant to describe the article.
 *
 * `width` tracks the page's own column. Without it the footer hangs wider
 * than the content above it on every max-w-3xl page.
 */
export function SiteFooter({ width = "5xl" }: { width?: "3xl" | "5xl" }) {
  return (
    <footer className="mt-auto border-t border-line-strong bg-fill-1">
      <div
        className={cx(
          "mx-auto w-full px-4 sm:px-6",
          width === "3xl" ? "max-w-3xl" : "max-w-5xl",
        )}
      >
        <div className="flex flex-col gap-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-accent-soft" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
                  <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
                  <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
                  <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-mist-100">
                Retro Board
              </span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-mist-500">
              Pick a format, share the link, run the retro. Nothing to install
              and nobody has to sign up.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center rounded-lg bg-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-accent-soft"
          >
            Start a board →
          </Link>
        </div>

        <div className="grid gap-8 border-t border-line py-9 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <nav aria-label="Retrospective formats">
            <p className={HEADING}>Formats</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {TEMPLATE_GUIDES.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/templates/${guide.slug}`}
                    className="group flex items-center gap-2.5"
                  >
                    <span className="flex shrink-0 gap-1">
                      {guide.columns.map((column) => (
                        <span
                          key={column.title}
                          className={cx(
                            "h-1.5 w-1.5 rounded-full opacity-70 transition-opacity group-hover:opacity-100",
                            TONE[column.tone].dot,
                          )}
                        />
                      ))}
                    </span>
                    <span className="text-[13px] text-mist-500 transition-colors group-hover:text-accent-soft">
                      {guide.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Learn">
            <p className={HEADING}>Learn</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LEARN.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Boards">
            <p className={HEADING}>Boards</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {BOARD.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-mist-700">
            Free to use, with no account for you or anyone you invite.
          </p>
          <p className="text-[12px] text-mist-700">
            Boards are private links, kept out of search engines.
          </p>
        </div>
      </div>
    </footer>
  );
}
