import { CreateBoard } from "@/components/CreateBoard";
import { SetupNotice } from "@/components/SetupNotice";
import { isAiConfigured } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";

const FEATURES = [
  {
    title: "Find themes",
    body: "Claude reads every card and clusters them into named themes, so the grouping phase takes seconds instead of ten minutes of dragging.",
  },
  {
    title: "Draft actions",
    body: "Concrete, sprint-sized action items pulled from the highest-voted pain — each one with the card it came from.",
  },
  {
    title: "Unstick the room",
    body: "When a column is thin and nobody is typing, ask for prompts written against this board, not a generic retro checklist.",
  },
  {
    title: "Write the read-out",
    body: "The summary your team actually reads tomorrow: what happened, what hurt, and the tension between them.",
  },
];

export default function Home() {
  const hasDatabase = isDatabaseConfigured();
  if (!hasDatabase) {
    return <SetupNotice hasDatabase={false} hasAi={isAiConfigured()} />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-accent-soft" fill="currentColor" aria-hidden="true">
            <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
            <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
            <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
            <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight text-mist-300">
          Retro Board
        </span>
      </div>

      <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-mist-100 sm:text-6xl">
        Run the retro.
        <br />
        <span className="bg-gradient-to-r from-accent-soft via-mist-100 to-tone-neutral bg-clip-text text-transparent">
          Let Claude do the sorting.
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mist-500">
        A retrospective board that is ready the moment you open it. Pick a format,
        share the link, write cards. When the wall of stickies gets messy, Claude
        groups them, finds the actions, and writes the read-out.
      </p>

      <div className="mt-10">
        <CreateBoard />
      </div>

      <section className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/7 bg-white/6 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="bg-ink-950/80 p-5">
            <h2 className="text-[13px] font-semibold text-mist-100">{feature.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist-700">
              {feature.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 surface rounded-2xl p-5">
        <h2 className="text-[13px] font-semibold text-mist-100">
          Agents are first-class here
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-mist-700">
          Every board is also an API. Point any MCP client at{" "}
          <code className="font-mono text-mist-300">/api/mcp</code> and your agent can
          create boards, post cards, vote, and run the same Claude passes the UI uses.
          The full tool manifest and REST surface are described at{" "}
          <a
            href="/api/agent"
            className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
          >
            /api/agent
          </a>
          .
        </p>
      </section>
    </main>
  );
}
