import type { TemplateId, Tone } from "./types";

/**
 * Editorial copy for the per-format landing pages.
 *
 * These pages exist to answer the question someone types before they know
 * which tool they want — "what is a sailboat retrospective" — so each one has
 * to actually explain the format rather than restate the template's name.
 */
export type TemplateColumnGuide = {
  title: string;
  tone: Tone;
  /** What belongs in this column. */
  what: string;
  /** A prompt the facilitator can read out. */
  prompt: string;
  /** A card that would plausibly appear here. */
  example: string;
};

export type TemplateGuide = {
  slug: string;
  templateId: TemplateId;
  name: string;
  /** Meta title — carries the query people actually type. */
  title: string;
  description: string;
  intro: string;
  origin: string;
  bestFor: string[];
  avoid: string;
  columns: TemplateColumnGuide[];
  running: { time: string; step: string }[];
  tips: string[];
  faq: { q: string; a: string }[];
};

export const TEMPLATE_GUIDES: TemplateGuide[] = [
  {
    slug: "start-stop-continue",
    templateId: "classic",
    name: "Start / Stop / Continue",
    title: "Start Stop Continue retrospective template",
    description:
      "The Start Stop Continue retrospective template explained: what goes in each column, prompts to read out, when to use it, and how to run one in 45 minutes. Free board, no sign-up.",
    intro:
      "Start / Stop / Continue is the format most teams learn first, and the one most teams come back to. It asks for behaviour rather than feeling, and every card is already shaped like a decision — which is why it produces actions more reliably than any other format.",
    origin:
      "It comes out of the same lineage as Agile Retrospectives (Derby and Larsen, 2006), and survives because the three questions map cleanly onto what a team can control: things it isn't doing, things it is doing badly, and things worth protecting.",
    bestFor: [
      "A team new to retrospectives that needs an obvious structure",
      "Sprints where the goal is concrete process change",
      "Short retros — 45 minutes is comfortable",
      "Teams that drift into venting and need the format to pull them back",
    ],
    avoid:
      "Skip it when the team needs to talk about how the work felt rather than how it ran. Start / Stop / Continue is deliberately unemotional, and a team carrying a bad quarter will find it cold. Use Mad / Sad / Glad instead.",
    columns: [
      {
        title: "Start",
        tone: "idea",
        what: "Things the team isn't doing that it should be. New practices, experiments, habits worth trying for one sprint.",
        prompt: "What should we try that we aren't trying?",
        example: "Start pairing on anything that touches the migration",
      },
      {
        title: "Stop",
        tone: "negative",
        what: "Things actively costing the team time, attention or morale. The column where the honest material lives.",
        prompt: "What's costing us more than it gives back?",
        example: "Stop taking bug reports directly in DMs",
      },
      {
        title: "Continue",
        tone: "positive",
        what: "Things working that would quietly stop if nobody named them. Easy to skip and worth protecting.",
        prompt: "What worked that we should make sure survives?",
        example: "Continue the Friday demo — it caught two regressions",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage and say what period the retro covers." },
      { time: "10 min", step: "Everyone writes into all three columns, silently, with cards hidden." },
      { time: "10 min", step: "Reveal, read out, group the cards that are really the same card." },
      { time: "5 min", step: "Vote — three dots each is usually enough for three columns." },
      { time: "15 min", step: "Take the top two or three and turn them into owned actions." },
    ],
    tips: [
      "Stop is the column that fills last and matters most. If it's empty, the room isn't safe yet — ask directly rather than moving on.",
      "Continue is not a participation trophy. A team that stops naming what works loses those practices to the next reorganisation.",
      "Cap Start at two actions per sprint. A team that agrees to start six things starts none of them.",
    ],
    faq: [
      {
        q: "What is the Start Stop Continue retrospective?",
        a: "A retrospective format with three columns: what the team should start doing, what it should stop doing, and what it should keep doing. Each person writes cards into all three, the team groups and votes, and the top items become actions.",
      },
      {
        q: "How long does a Start Stop Continue retro take?",
        a: "About 45 minutes for a two-week sprint — 10 minutes writing, 10 grouping, 5 voting, and 15 on actions, with 5 minutes either side.",
      },
      {
        q: "What's the difference between Stop and Start?",
        a: "Stop is about removing something the team already does. Start is about adding something it doesn't. Teams over-fill Start because adding feels productive, but removing usually frees more time.",
      },
    ],
  },
  {
    slug: "mad-sad-glad",
    templateId: "mad_sad_glad",
    name: "Mad / Sad / Glad",
    title: "Mad Sad Glad retrospective template",
    description:
      "The Mad Sad Glad retrospective template explained: what each column captures, prompts that get people talking, when to use it over Start Stop Continue, and how to turn feelings into actions. Free board, no sign-up.",
    intro:
      "Mad / Sad / Glad asks how the sprint felt rather than how it ran. That sounds softer than it is: emotion is where a team stores the problems it hasn't articulated yet, and this format is the fastest way to surface the ones nobody has words for.",
    origin:
      "It's a variation on the 'Mad Sad Glad' check-in used widely in agile coaching, built on the observation that people notice how something felt long before they can explain what caused it.",
    bestFor: [
      "After a hard sprint, an incident, or a missed deadline",
      "Teams that have gone quiet in process-shaped retros",
      "Detecting burnout and friction before it shows up in delivery",
      "Teams that already trust each other enough to be honest",
    ],
    avoid:
      "Don't use it with a team that isn't safe yet, or in the first retro with a new manager in the room. Asking people what made them angry before they trust the audience produces a wall of neutral cards and teaches them the exercise is theatre.",
    columns: [
      {
        title: "Mad",
        tone: "negative",
        what: "Things that caused real frustration. Blockers, repeated friction, work that was wasted.",
        prompt: "What made you angry this sprint?",
        example: "Mad that the staging environment was down for three days",
      },
      {
        title: "Sad",
        tone: "neutral",
        what: "Disappointments rather than frustrations — things that fell short, got dropped, or didn't land.",
        prompt: "What disappointed you, even if nobody's at fault?",
        example: "Sad we cut the accessibility work again",
      },
      {
        title: "Glad",
        tone: "positive",
        what: "What genuinely went well. Wins, help received, moments worth repeating.",
        prompt: "What made you glad to be on this team?",
        example: "Glad the on-call handover actually worked this time",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage. Read the prime directive out loud — this format needs it." },
      { time: "10 min", step: "Silent writing, cards hidden. Emotional cards especially shouldn't be anchored." },
      { time: "15 min", step: "Reveal and read out. Give each card a moment; don't rush to solutions." },
      { time: "5 min", step: "Vote on what the team wants to change." },
      { time: "15 min", step: "Convert the top themes into actions with owners." },
    ],
    tips: [
      "Resist solving during the read-out. A card that gets solved in ten seconds usually wasn't understood.",
      "Mad cards are about situations, not people. If a name appears on a card, redirect to the system that made it possible.",
      "Glad is not filler. It tells you which practices are load-bearing for morale.",
    ],
    faq: [
      {
        q: "What is a Mad Sad Glad retrospective?",
        a: "A format where the team categorises the sprint by emotional response: what made them mad, what made them sad, and what made them glad. It surfaces friction that process-focused formats miss.",
      },
      {
        q: "When should I use Mad Sad Glad instead of Start Stop Continue?",
        a: "Use it after a hard sprint, an incident, or when the team has gone quiet. Start Stop Continue is better when you need concrete process change and the team is already talking freely.",
      },
      {
        q: "How do you turn feelings into actions?",
        a: "Look for the cause under the card. Four Mad cards about waiting is one action about handoffs. The feeling identifies where to look; the action addresses the system that produced it.",
      },
    ],
  },
  {
    slug: "four-ls",
    templateId: "four_ls",
    name: "Liked / Learned / Lacked / Longed for",
    title: "4 Ls retrospective template (Liked, Learned, Lacked, Longed for)",
    description:
      "The 4 Ls retrospective template explained: Liked, Learned, Lacked and Longed for, what belongs in each, and when this format beats a sprint retro. Best for end of milestone. Free board, no sign-up.",
    intro:
      "The four Ls — Liked, Learned, Lacked, Longed for — is the format to reach for when the period under review is longer than a sprint. Its two middle columns are what make it: Learned captures knowledge the team gained, and Lacked names what was missing, which is usually more actionable than what went wrong.",
    origin:
      "Attributed to Mary Gorman and Ellen Gottesdiener, the four Ls were designed for reflection across a release or project rather than a two-week iteration.",
    bestFor: [
      "End of a milestone, quarter, release or project",
      "Retros where knowledge transfer matters as much as process",
      "Teams that have just finished something unfamiliar",
      "Onboarding reviews and post-project reflection",
    ],
    avoid:
      "It's too broad for a routine two-week sprint. Asking what the team learned every fortnight produces filler by the third round. Save it for the end of something.",
    columns: [
      {
        title: "Liked",
        tone: "positive",
        what: "What the team enjoyed or valued — practices, decisions, moments worth keeping.",
        prompt: "What did you like about how this went?",
        example: "Liked how early we got a working prototype in front of users",
      },
      {
        title: "Learned",
        tone: "idea",
        what: "New knowledge, technical or otherwise. The column that turns experience into something the team owns.",
        prompt: "What do you know now that you didn't at the start?",
        example: "Learned the rate limit is per-account, not per-key",
      },
      {
        title: "Lacked",
        tone: "negative",
        what: "What was missing — information, tools, time, access, clarity. Absences, not mistakes.",
        prompt: "What did you need and not have?",
        example: "Lacked a staging database with realistic data volume",
      },
      {
        title: "Longed for",
        tone: "neutral",
        what: "Wishes beyond the team's immediate control. Useful upward signal, and a release valve.",
        prompt: "What did you wish for, however unrealistic?",
        example: "Longed for a decision on the API version before we built on it",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage and name the period — a release, not a sprint." },
      { time: "15 min", step: "Silent writing across four columns. Four needs more time than three." },
      { time: "15 min", step: "Reveal and group. Learned cards often deserve writing down somewhere permanent." },
      { time: "5 min", step: "Vote, with four or five dots each given the extra column." },
      { time: "15 min", step: "Actions from Lacked; escalations from Longed for." },
    ],
    tips: [
      "Learned is the column teams skip and regret. Copy those cards into your documentation before the board is forgotten.",
      "Lacked usually converts to actions more cleanly than a 'what went wrong' column, because an absence names its own fix.",
      "Longed for is not wasted time even when nothing is actionable — it tells a manager what the team can't fix alone.",
    ],
    faq: [
      {
        q: "What are the 4 Ls in a retrospective?",
        a: "Liked, Learned, Lacked and Longed for. The team writes cards under each, covering what they valued, what knowledge they gained, what was missing, and what they wished for.",
      },
      {
        q: "When should you use a 4 Ls retrospective?",
        a: "At the end of a milestone, release, quarter or project — anywhere the period is long enough that the team genuinely learned something. It's too broad for a routine sprint.",
      },
      {
        q: "What's the difference between Lacked and Longed for?",
        a: "Lacked is something the team needed and could plausibly have had — a tool, data, access. Longed for is a wish that's usually outside the team's control, which makes it a signal to escalate rather than an action.",
      },
    ],
  },
  {
    slug: "sailboat",
    templateId: "sailboat",
    name: "Sailboat",
    title: "Sailboat retrospective template (wind, anchors, rocks, island)",
    description:
      "The sailboat retrospective template explained: wind, anchors, rocks and island, what each metaphor captures, and why it's the best format for goals and risk. Free board, no sign-up.",
    intro:
      "The sailboat retrospective is the one format here that looks forward as much as back. The boat is the team, the island is where it's going, the wind pushes it there, the anchors hold it back, and the rocks are what could sink it. That last column is the reason to use it: it's the only common retro format with a place to put a risk that hasn't happened yet.",
    origin:
      "A variation on Luke Hohmann's 'Speed Boat' innovation game, widened from a pure obstacle exercise into a full retrospective by adding the island and the wind.",
    bestFor: [
      "Start of a quarter, project kickoff, or planning a big piece of work",
      "Teams that need to talk about risk without a formal risk review",
      "Retros where the goal itself is unclear or contested",
      "Groups that engage better with a visual metaphor than a table",
    ],
    avoid:
      "It's a poor fit for a routine sprint retro where the goal is obvious and unchanged. If the island is the same every fortnight, the column stops earning its place.",
    columns: [
      {
        title: "Wind",
        tone: "positive",
        what: "What's pushing the team forward — momentum, help, tooling, anything making the work easier.",
        prompt: "What's carrying us along?",
        example: "Wind: the new CI pipeline cut review turnaround in half",
      },
      {
        title: "Anchors",
        tone: "negative",
        what: "What's slowing the team down right now. Present, active drag.",
        prompt: "What's holding us back?",
        example: "Anchors: three separate approval steps before a release",
      },
      {
        title: "Rocks",
        tone: "neutral",
        what: "Risks ahead that haven't hit yet. The column no other format has.",
        prompt: "What could sink us that hasn't yet?",
        example: "Rocks: only one person can deploy the payments service",
      },
      {
        title: "Island",
        tone: "idea",
        what: "Where the team is trying to get to. Write it first — everything else is relative to it.",
        prompt: "What are we actually aiming at?",
        example: "Island: ship self-serve onboarding by end of quarter",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage and draw the metaphor — boat, island, wind, anchors, rocks." },
      { time: "5 min", step: "Fill the island first, together. If the team disagrees here, that's the retro." },
      { time: "10 min", step: "Silent writing into wind, anchors and rocks." },
      { time: "10 min", step: "Reveal and group." },
      { time: "15 min", step: "Actions for the top anchors; owners and dates for the top rocks." },
    ],
    tips: [
      "Do the island first and do it out loud. A team that can't agree where it's sailing has found its most important problem.",
      "Rocks need an owner and a date, not a discussion. A risk everyone acknowledges and nobody owns is still a risk.",
      "Anchors are present tense, rocks are future tense. Keeping that line clean stops the two columns collapsing into one.",
    ],
    faq: [
      {
        q: "What is a sailboat retrospective?",
        a: "A retrospective format using a sailing metaphor: the island is the goal, the wind is what's helping, the anchors are what's slowing the team down, and the rocks are risks ahead that haven't caused problems yet.",
      },
      {
        q: "What's the difference between anchors and rocks?",
        a: "Anchors are slowing you down now. Rocks are hazards that haven't hit yet. Keeping them separate is the point of the format — most retro formats have nowhere to put a future risk.",
      },
      {
        q: "When should you run a sailboat retrospective?",
        a: "At the start of a quarter or project, or any time the team needs to talk about goals and risk together. It's less useful for a routine sprint where the goal hasn't changed.",
      },
    ],
  },
];

export function guideBySlug(slug: string): TemplateGuide | undefined {
  return TEMPLATE_GUIDES.find((guide) => guide.slug === slug);
}
