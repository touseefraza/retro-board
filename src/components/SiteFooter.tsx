import Link from "next/link";
import { TEMPLATE_GUIDES } from "@/lib/templateContent";

/**
 * Sitewide links, on every page a visitor can arrive at from search.
 *
 * The format guides are listed in full on every page rather than only from the
 * templates index. They are the pages worth crawling and the ones least likely
 * to be linked from anywhere else, so the footer is most of the internal
 * linking they get. Generated from TEMPLATE_GUIDES so a new format appears
 * here the moment it exists.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-20">
          <nav aria-label="Retrospective formats">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-700">
              Formats
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {TEMPLATE_GUIDES.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/templates/${guide.slug}`}
                    className="text-[13px] text-mist-500 transition-colors hover:text-mist-100"
                  >
                    {guide.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-700">
              Retro Board
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/" className="text-[13px] text-mist-500 transition-colors hover:text-mist-100">
                  Start a retro board
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[13px] text-mist-500 transition-colors hover:text-mist-100">
                  All retrospective templates
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-run-a-retrospective"
                  className="text-[13px] text-mist-500 transition-colors hover:text-mist-100"
                >
                  How to run a retrospective
                </Link>
              </li>
              <li>
                <Link href="/new" className="text-[13px] text-mist-500 transition-colors hover:text-mist-100">
                  Build a custom board
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-10 text-[12px] leading-relaxed text-mist-700">
          Free to use, with no account for you or anyone you invite. Boards are
          private links and are kept out of search engines.
        </p>
      </div>
    </footer>
  );
}
