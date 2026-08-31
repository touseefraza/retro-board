import { CreateBoard } from "@/components/CreateBoard";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SetupNotice } from "@/components/SetupNotice";
import { isAiConfigured } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

/** Shown when a Claude key is configured — every one of these is an AI pass. */
const AI_FEATURES = [
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

/** What the board is without any of that — the honest pitch when AI is off. */
const BOARD_FEATURES = [
  {
    title: "Pick a format",
    body: "Start / Stop / Continue, Mad / Sad / Glad, the four Ls, or Sailboat. The columns are set up before you have finished reading this.",
  },
  {
    title: "Everyone at once",
    body: "Live cursors and cards that appear as they are written, so a remote retro feels like a room standing at the same wall.",
  },
  {
    title: "Vote, then talk",
    body: "A vote budget per person puts the discussion on what the team actually cares about instead of whoever spoke first.",
  },
  {
    title: "Leave with actions",
    body: "Action items live on the board with an owner and a done state, so the retro ends with a list rather than a feeling.",
  },
];

/** What the board actually does — the list people scan before trying it. */
const CAPABILITIES = [
  { title: "No sign-up", body: "No accounts, for you or anyone you invite. Open a board, share the link, start writing." },
  { title: "Four formats, or your own", body: "Start/Stop/Continue, Mad/Sad/Glad, the four Ls and Sailboat — or build a board with your own columns." },
  { title: "Live cursors", body: "See where everyone is on the board and what they add, as they add it." },
  { title: "Hide until reveal", body: "Keep cards private while people write, so nobody anchors on the first opinion in the room." },
  { title: "Dot voting", body: "A fixed budget per person puts the discussion where the team's attention actually is." },
  { title: "Action items", body: "Owners and a done state, so the retro ends with a list rather than a feeling." },
  { title: "Export to Confluence", body: "Pastes as real headings and a real table. Markdown and plain text too." },
  { title: "Light and dark", body: "Both themes, readable in either, remembered per browser." },
];

const FAQ = [
  {
    q: "Is it free?",
    a: "Yes, and there is no account to create. Open the site, make a board, share the link.",
  },
  {
    q: "Do my teammates need to sign up?",
    a: "No. They open the link, type a name if they want one, and they are in. Anyone who would rather not give a name joins as Visitor.",
  },
  {
    q: "Can I use my own columns?",
    a: "Yes. Build a custom board with up to eight columns, name each one, pick its colour, and rename the action items section to whatever your team calls it.",
  },
  {
    q: "Can I stop people seeing each other's cards while they write?",
    a: "Yes. Hide mode keeps other people's cards masked until the facilitator reveals them, and the hidden text never leaves the server rather than being hidden in the browser.",
  },
  {
    q: "How do I get the results into Confluence?",
    a: "Export, choose Confluence, and copy. It pastes into a Confluence page as real headings and a real table. Markdown and plain text are there too.",
  },
  {
    q: "Who can see my board?",
    a: "Anyone with the link — boards are unguessable URLs with no password. They are deliberately kept out of search engines, but treat the link as the key and share it accordingly.",
  },
  {
    q: "How many people can be on one board?",
    a: "There is no hard cap, but retros work best under about ten people. Above that, most of the room stops talking.",
  },
];

export default function Home() {
  const hasDatabase = isDatabaseConfigured();
  if (!hasDatabase) {
    return <SetupNotice hasDatabase={false} hasAi={isAiConfigured()} />;
  }

  // Without a key there is nothing to promise, so the page promises nothing:
  // the Claude copy, the AI feature grid, and the MCP section all drop out.
  const hasAi = isAiConfigured();
  const features = hasAi ? AI_FEATURES : BOARD_FEATURES;

  // Structured data: tells search engines what this page *is*, which is what
  // earns a rich result rather than a bare blue link.
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: siteUrl(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description: SITE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Sprint retrospective templates",
      "Live cursors and real-time collaboration",
      "Dot voting with a per-person budget",
      "Action items with owners",
      "Export to Confluence, Markdown or plain text",
    ],
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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent-soft" fill="currentColor" aria-hidden="true">
            <rect x="2" y="2.5" width="4.5" height="7" rx="1.2" />
            <rect x="8" y="2.5" width="6" height="4.5" rx="1.2" opacity=".55" />
            <rect x="2" y="11" width="4.5" height="2.5" rx="1" opacity=".55" />
            <rect x="8" y="8.5" width="6" height="5" rx="1.2" opacity=".3" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight text-mist-300">
          Retro Board
        </span>

        <ThemeToggle className="ml-auto" />
      </div>

      <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-mist-100 sm:text-6xl">
        Run the retro.
        <br />
        <span className="bg-gradient-to-r from-accent-soft via-mist-100 to-tone-neutral bg-clip-text text-transparent">
          {hasAi ? "Let Claude do the sorting." : "Everyone on the same board."}
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist-500">
        {hasAi
          ? "A retrospective board that is ready the moment you open it. Pick a format, share the link, write cards. When the wall of stickies gets messy, Claude groups them, finds the actions, and writes the read-out."
          : "A retrospective board that is ready the moment you open it. Pick a format, share the link, write cards — everyone sees the same wall, and each other's cursors, as it fills up."}
      </p>

      <div className="mt-8">
        <CreateBoard />
      </div>

      <p className="mt-3 text-[12px] text-mist-700">
        Browse{" "}
        <Link
          href="/templates"
          className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          retrospective templates
        </Link>
        , need different columns?{" "}
        <Link
          href="/new"
          className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          Build a custom board
        </Link>{" "}
        — or read{" "}
        <Link
          href="/how-to-run-a-retrospective"
          className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          how to run a retrospective
        </Link>
        .
      </p>

      <section className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-fill-2 sm:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="bg-ink-950/80 p-5">
            <h2 className="text-[13px] font-semibold text-mist-100">{feature.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist-700">
              {feature.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
          What you get
        </h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-fill-2 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((item) => (
            <div key={item.title} className="bg-ink-950/80 p-4">
              <h3 className="text-[13px] font-semibold text-mist-100">{item.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-mist-700">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-mist-100">
          Frequently asked questions
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {FAQ.map((item) => (
            <details key={item.q} className="surface group rounded-2xl p-4">
              <summary className="cursor-pointer list-none text-[14px] font-semibold text-mist-100 marker:content-none">
                <span className="mr-2 inline-block text-mist-700 transition-transform group-open:rotate-90">
                  ›
                </span>
                {item.q}
              </summary>
              <p className="mt-2 pl-5 text-[13px] leading-relaxed text-mist-300">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {hasAi && (
        <section className="mt-4 surface rounded-2xl p-5">
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
      )}
    </main>
  );
}
