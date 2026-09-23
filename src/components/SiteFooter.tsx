import Link from "next/link";
import { TEMPLATE_GUIDES } from "@/lib/templateContent";

const LINK =
  "text-[13px] text-mist-500 transition-colors hover:text-mist-100";
const HEADING =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-700";

/** The site pages, kept beside the formats so both columns run the same depth. */
const PAGES = [
  { href: "/", label: "Start a retro board" },
  { href: "/templates", label: "All retrospective templates" },
  { href: "/how-to-run-a-retrospective", label: "How to run a retrospective" },
  { href: "/new", label: "Build a custom board" },
];

/**
 * Sitewide links, on every page a visitor can arrive at from search.
 *
 * The format guides are listed in full on every page rather than only from the
 * templates index. They are the pages worth crawling and the ones least likely
 * to be linked from anywhere else, so the footer is most of the internal
 * linking they get. Generated from TEMPLATE_GUIDES so a new format appears
 * here the moment it exists.
 *
 * The column headings are paragraphs rather than headings: each nav already
 * names itself to a screen reader, and two more h2s on every page would say
 * "Formats" in an outline that is meant to describe the article.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <div className="max-w-[17rem]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-accent-soft" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
                  <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
                  <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
                  <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
                </svg>
              </span>
              <span className="text-[13px] font-semibold tracking-tight text-mist-300">
                Retro Board
              </span>
            </div>
            <p className="mt-3.5 text-[12px] leading-relaxed text-mist-700">
              Free to use, with no account for you or anyone you invite. Boards
              are private links and are kept out of search engines.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <nav aria-label="Retrospective formats">
              <p className={HEADING}>Formats</p>
              <ul className="mt-3.5 flex flex-col gap-2">
                {TEMPLATE_GUIDES.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/templates/${guide.slug}`} className={LINK}>
                      {guide.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Retro Board">
              <p className={HEADING}>Retro Board</p>
              <ul className="mt-3.5 flex flex-col gap-2">
                {PAGES.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className={LINK}>
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
