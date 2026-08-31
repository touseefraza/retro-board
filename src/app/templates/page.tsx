import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { TONE, cx } from "@/components/ui";
import { TEMPLATE_GUIDES } from "@/lib/templateContent";

export const metadata: Metadata = {
  title: "Retrospective templates",
  description:
    "Free retrospective templates for agile teams: Start Stop Continue, Mad Sad Glad, the 4 Ls, and Sailboat. What each format surfaces, when to use it, and a board you can start in one click. No sign-up.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesIndex() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24">
      <SiteHeader />

      <h1 className="mt-10 text-3xl font-semibold leading-[1.12] tracking-tight text-mist-100 sm:text-5xl">
        Retrospective templates
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist-500">
        The format decides what the team notices. Four that cover most retros:
        what each one surfaces, when to reach for it, and a board ready to run.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {TEMPLATE_GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/templates/${guide.slug}`}
            className="surface rounded-2xl p-5 transition-colors hover:border-line-strong"
          >
            <div className="flex items-center gap-2">
              {guide.columns.map((column) => (
                <span
                  key={column.title}
                  className={cx("h-2 w-2 rounded-full", TONE[column.tone].dot)}
                />
              ))}
              <h2 className="ml-1 text-[15px] font-semibold text-mist-100">
                {guide.name}
              </h2>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-mist-500">
              {guide.intro.split(". ")[0]}.
            </p>
            <p className="mt-2 text-[11px] text-mist-700">
              {guide.columns.map((column) => column.title).join(" · ")}
            </p>
          </Link>
        ))}
      </div>

      <div className="surface mt-8 rounded-2xl p-5">
        <p className="text-[15px] font-semibold text-mist-100">None of these fit?</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-mist-500">
          Build a board with your own columns, up to eight, named and coloured
          however your team works.
        </p>
        <Link
          href="/new"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
        >
          Build a custom board →
        </Link>
      </div>

      <p className="mt-8 text-[13px] text-mist-500">
        New to running these?{" "}
        <Link
          href="/how-to-run-a-retrospective"
          className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          How to run a retrospective
        </Link>
      </p>
    </main>
  );
}
