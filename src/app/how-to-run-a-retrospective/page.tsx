import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TEMPLATES } from "@/lib/types";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to run a retrospective",
  description:
    "A practical guide to running a sprint retrospective: the five phases, how long each takes, which format to pick, and the facilitation mistakes that quietly kill retros. With free templates you can start in one click.",
  alternates: { canonical: "/how-to-run-a-retrospective" },
};

const PHASES = [
  {
    time: "5 min",
    title: "Set the stage",
    body: "Say what the retro covers and how long it runs. Read the prime directive out loud if the team is new to it — everyone did the best they could with what they knew at the time. This is not ceremony: it is what makes it safe to say the difficult thing twenty minutes later.",
  },
  {
    time: "10–15 min",
    title: "Gather data",
    body: "Everyone writes, silently and at the same time. Silent writing is the single highest-leverage habit in a retro: it stops the loudest person setting the agenda, and it gets the quiet people's observations onto the board at all. Keep cards hidden until everyone has finished so nobody anchors on the first opinion they read.",
  },
  {
    time: "10 min",
    title: "Generate insight",
    body: "Reveal, read out, and group related cards into themes. You are looking for the pattern under the individual complaints — four cards about waiting is one card about handoffs. Then vote, with a fixed budget per person, so the discussion goes where the team's attention actually is rather than where the argument is loudest.",
  },
  {
    time: "15 min",
    title: "Decide what to do",
    body: "Take the top two or three themes and turn them into actions. An action needs an owner and needs to be small enough to finish before the next retro. \"Improve communication\" is not an action. \"Ana posts the deploy checklist in the team channel by Friday\" is.",
  },
  {
    time: "5 min",
    title: "Close",
    body: "Read the actions back, confirm the owners, and say where the notes will live. Then actually put them there — a retro whose output never leaves the tool teaches the team that retros do not matter.",
  },
];

const MISTAKES = [
  {
    title: "Skipping the actions",
    body: "The most common failure by far. A retro that ends in discussion and no owned action is a support group. If you only have time for one thing, cut the discussion short and spend the last ten minutes on actions.",
  },
  {
    title: "Never revisiting last time",
    body: "Open the next retro by reading out the previous actions and their status. Two minutes. It is the only thing that makes the team believe actions are real.",
  },
  {
    title: "The manager writes first",
    body: "Whoever speaks or writes first sets the frame. Silent writing with cards hidden until reveal removes the problem structurally, rather than relying on everyone being brave.",
  },
  {
    title: "Same format every time",
    body: "Teams stop seeing what the columns stop asking about. Rotating the format — a sailboat retro after a quarter of Start/Stop/Continue — surfaces different material from the same people.",
  },
  {
    title: "Too many people",
    body: "Above about ten, most people stop talking. Split into two retros and have the facilitators compare notes afterwards.",
  },
];

const FAQ = [
  {
    q: "How long should a retrospective be?",
    a: "About an hour for a two-week sprint. Forty-five minutes works if the team is practised and the format is familiar. Under thirty minutes you will get through gathering data and not reach actions, which defeats the point.",
  },
  {
    q: "Who should facilitate?",
    a: "Ideally not the person the team reports to, and ideally rotating. A facilitator who is also the loudest stakeholder cannot run a neutral room.",
  },
  {
    q: "What if nobody says anything?",
    a: "Silence usually means it is not safe, or the question is too broad. Switch to silent writing before discussion, and ask a narrower question — not \"how did the sprint go\" but \"what took longer than you expected\".",
  },
  {
    q: "Should retrospectives be anonymous?",
    a: "Anonymity helps a team that is not yet safe, and hurts one that is, because you cannot follow up on a card nobody will claim. Hiding cards until everyone has written gets most of the benefit without the cost.",
  },
  {
    q: "How do we run a remote retrospective?",
    a: "Use a shared board everyone can write on at once, keep cameras on for the discussion, and be stricter about timeboxing than you would in a room. The failure mode of a remote retro is one person narrating while everyone else waits.",
  },
];

export default function GuidePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to run a retrospective",
    description:
      "A practical guide to running a sprint retrospective, from setting the stage to deciding on owned actions.",
    totalTime: "PT45M",
    url: `${siteUrl()}/how-to-run-a-retrospective`,
    step: PHASES.map((phase, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: phase.title,
      text: phase.body,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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

      <h1 className="mt-10 text-3xl font-semibold leading-[1.12] tracking-tight text-mist-100 sm:text-5xl">
        How to run a retrospective
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist-500">
        A retrospective is an hour the team spends deciding what to change. Most
        of them fail in the same few ways, and all of those are avoidable. Here
        is the shape that works, what each part is for, and the mistakes worth
        knowing about before you make them.
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        The five phases
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        {PHASES.map((phase, index) => (
          <li key={phase.title} className="surface rounded-2xl p-4 sm:p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-mist-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] font-semibold text-mist-100">{phase.title}</h3>
              <span className="ml-auto shrink-0 text-[11px] tabular-nums text-mist-700">
                {phase.time}
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-mist-300">{phase.body}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Which format should you use?
      </h2>
      <p className="mt-3 text-[14px] leading-relaxed text-mist-300">
        The format decides what the team notices. Rotate it when the same cards
        keep appearing.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(TEMPLATES).map(([id, template]) => (
          <div key={id} className="surface rounded-2xl p-4">
            <h3 className="text-[14px] font-semibold text-mist-100">{template.name}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-mist-500">
              {template.blurb}
            </p>
            <p className="mt-2 text-[11px] text-mist-700">
              {template.columns.map((column) => column.title).join(" · ")}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-mist-500">
        None of them fit?{" "}
        <Link href="/new" className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
          Build a custom board
        </Link>{" "}
        with your own columns.
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Five ways retros quietly fail
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {MISTAKES.map((mistake) => (
          <div key={mistake.title} className="surface rounded-2xl p-4">
            <h3 className="text-[14px] font-semibold text-mist-100">{mistake.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist-300">
              {mistake.body}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Common questions
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {FAQ.map((item) => (
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

      <div className="surface mt-12 rounded-2xl p-5 text-center">
        <p className="text-[15px] font-semibold text-mist-100">
          Ready to run one?
        </p>
        <p className="mt-1.5 text-[13px] text-mist-500">
          Create a board, share the link. No sign-up, no setup.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
        >
          Start a retro →
        </Link>
      </div>
    </main>
  );
}
