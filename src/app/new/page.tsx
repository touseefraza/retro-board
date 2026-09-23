import type { Metadata } from "next";
import Link from "next/link";
import { BoardBuilder } from "@/components/BoardBuilder";
import { SiteFooter } from "@/components/SiteFooter";
import { SetupNotice } from "@/components/SetupNotice";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isAiConfigured } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";
import { openGraphFor } from "@/lib/site";

const NEW_DESCRIPTION =
  "Build a retro board your way: choose how many columns, name each one, pick its colour, rename the action items section, and set the vote budget. Free, no sign-up.";

export const metadata: Metadata = {
  title: "Build a custom retrospective board",
  description: NEW_DESCRIPTION,
  alternates: { canonical: "/new" },
  openGraph: openGraphFor({
    title: "Build a custom retrospective board",
    description: NEW_DESCRIPTION,
    path: "/new",
  }),
};


/** Reasons a hand-built board beats picking a format off the shelf. */
const WHEN_CUSTOM = [
  {
    title: "Your team has its own words",
    body: "A team that already says keep, kill and combine in every planning session should not spend an hour translating into Start, Stop and Continue. Columns work better in the vocabulary the team already argues in.",
  },
  {
    title: "It isn't a sprint retro",
    body: "Incident reviews, project kickoffs, quarterly planning and post-launch reviews all want columns no sprint format has. A blameless incident review needs what we saw, what we assumed and what we changed, and none of those sit under Mad or Sad.",
  },
  {
    title: "You need a column nothing else has",
    body: "Most formats have nowhere to put a decision made somewhere else, a dependency on another team, or a question nobody in the room could answer. One extra column for whatever your retros keep spilling is usually the whole fix.",
  },
  {
    title: "The room is bigger than one team",
    body: "Cross-team retros and workshop debriefs go better with fewer, broader columns than a sprint format offers, because half the room has no context for the other half's cards.",
  },
];

/** What actually makes a hand-built board work, learned the boring way. */
const COLUMN_ADVICE = [
  "Each column should ask a different question. If two columns would collect the same card, you have one column.",
  "Name them as something a person can answer. What slowed you down fills faster than Impediments.",
  "Put the column you most want filled first. The first column takes the most cards whatever it says, so spend that position on the question you actually care about.",
  "Colour is not decoration on a retro board. Keep one colour for what worked and one for what hurt, and keep the meaning stable between retros so an old board still reads at a glance.",
  "Columns are fixed once the board exists, so spend the extra minute now. The board name, the vote budget, hiding cards and the actions section can all be changed while the retro is running.",
];

const NEW_FAQ = [
  {
    q: "How many columns can a custom retro board have?",
    a: "Between one and eight, each with a name of up to 40 characters and a colour. Four or five is where most teams land: enough to separate the questions, few enough that people still read every column.",
  },
  {
    q: "Can I change the columns after the board is created?",
    a: "No. The columns are set when the board is created. The board name, the vote budget, whether cards stay hidden while people write, and the actions section can all be changed while the retro runs.",
  },
  {
    q: "Can I rename the action items section?",
    a: "Yes. Call it Next steps, Commitments, Experiments, or whatever your team already calls it, or switch it off entirely if this retro does not end in a list.",
  },
  {
    q: "Can I start from a template and then change it?",
    a: "Yes, and it is usually quicker than starting blank. Pick the closest format, then rename, recolour, reorder or remove columns until the board matches the retro you are actually running.",
  },
];

export default function NewBoardPage() {
  if (!isDatabaseConfigured()) {
    return <SetupNotice hasDatabase={false} hasAi={isAiConfigured()} />;
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: NEW_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
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
          <Link href="/templates" className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
            Browse the retrospective templates
          </Link>
          .
        </p>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-mist-100">
            When a custom board beats a template
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {WHEN_CUSTOM.map((reason) => (
              <div key={reason.title} className="surface rounded-2xl p-4 sm:p-5">
                <h3 className="text-[14px] font-semibold text-mist-100">{reason.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mist-300">{reason.body}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
            Choosing your columns
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-mist-300">
            Three columns is the floor and four is comfortable. Eight is the
            limit, and a board using all eight is usually two retros wearing one
            board.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {COLUMN_ADVICE.map((line) => (
              <li key={line} className="flex gap-2.5 text-[14px] leading-relaxed text-mist-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tone-neutral" />
                {line}
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
            Common questions
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {NEW_FAQ.map((item) => (
              <details key={item.q} className="surface group rounded-2xl p-4">
                <summary className="cursor-pointer list-none text-[14px] font-semibold text-mist-100 marker:content-none">
                  <span className="mr-2 inline-block text-mist-700 transition-transform group-open:rotate-90">
                    ›
                  </span>
                  {item.q}
                </summary>
                <p className="mt-2 pl-5 text-[13px] leading-relaxed text-mist-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
