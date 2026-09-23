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

/**
 * One board, filled in, for a team that doesn't exist.
 *
 * The question behind most searches for a format's name is "what does a real
 * one look like", and a single example card per column doesn't answer it. The
 * cards here belong to one scenario, so the themes and actions underneath
 * follow from them rather than being asserted.
 */
export type TemplateWalkthrough = {
  /** The team and the moment this board belongs to. */
  scenario: string;
  /** Cards per column, titled to match `columns`. */
  columns: { title: string; cards: string[] }[];
  /** What grouping the cards actually surfaced. */
  themes: string[];
  /** What the team left the room with. */
  actions: string[];
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
  walkthrough: TemplateWalkthrough;
  /** Named reshapings of the format, including the ones people search for. */
  variations: { name: string; body: string; slug?: string }[];
  /** When to reach for a different format, pointing at the guide for it. */
  insteadOf: { slug: string; when: string }[];
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
      "Start / Stop / Continue is the format most teams learn first, and the one most teams come back to. It asks for behaviour rather than feeling, and every card is already shaped like a decision, which is why it produces actions more reliably than any other format.",
    origin:
      "It comes out of the same lineage as Agile Retrospectives (Derby and Larsen, 2006), and survives because the three questions map cleanly onto what a team can control: things it isn't doing, things it is doing badly, and things worth protecting.",
    bestFor: [
      "A team new to retrospectives that needs an obvious structure",
      "Sprints where the goal is concrete process change",
      "Short retros, where 45 minutes is comfortable",
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
        example: "Continue the Friday demo, which caught two regressions",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage and say what period the retro covers." },
      { time: "10 min", step: "Everyone writes into all three columns, silently, with cards hidden." },
      { time: "10 min", step: "Reveal, read out, group the cards that are really the same card." },
      { time: "5 min", step: "Vote. Three dots each is usually enough for three columns." },
      { time: "15 min", step: "Take the top two or three and turn them into owned actions." },
    ],
    tips: [
      "Stop is the column that fills last and matters most. If it's empty, the room isn't safe yet. Ask directly rather than moving on.",
      "Continue is not a participation trophy. A team that stops naming what works loses those practices to the next reorganisation.",
      "Cap Start at two actions per sprint. A team that agrees to start six things starts none of them.",
    ],
    walkthrough: {
      scenario:
        "A five person team two sprints into replacing a payments integration, running 45 minutes on a Thursday.",
      columns: [
        {
          title: "Start",
          cards: [
            "Start pairing on anything that touches the migration",
            "Start writing the rollback step before the deploy step, not after it",
            "Start asking at standup what is blocked rather than what is done",
          ],
        },
        {
          title: "Stop",
          cards: [
            "Stop taking bug reports directly in DMs",
            "Stop carrying the same two tickets across three sprints without saying why",
            "Stop deploying on Friday afternoon and then watching it all weekend",
          ],
        },
        {
          title: "Continue",
          cards: [
            "Continue the Friday demo, which caught two regressions",
            "Continue the shared on-call notes doc",
            "Continue having support review the release notes before they go out",
          ],
        },
      ],
      themes: [
        "Three cards across Start and Stop were one card: work arriving through channels nobody else can see.",
        "The deploy cards and the Friday demo card were all about catching problems before a release rather than after it.",
      ],
      actions: [
        "Priya opens a bug channel and the team stops answering bug DMs, by Friday.",
        "Sam adds the rollback step to the deploy checklist template before the next release.",
      ],
    },
    variations: [
      {
        name: "Good / Bad / Start / Stop",
        slug: "good-bad-start-stop",
        body: "Splits the three columns into four: Good and Bad collect what happened, Start and Stop collect what to do about it. Worth using when people keep writing observations into Start, because it gives those cards somewhere to go. The cost is that the retro needs a grouping step between the two halves, so add ten minutes.",
      },
      {
        name: "More of / Less of / Keep",
        body: "The same three questions with the edges filed off. Useful for a team that reads Stop as an accusation, or a first retro where nobody yet knows how blunt they are allowed to be. It surfaces less, so move back to Stop once the room can take it.",
      },
      {
        name: "Drop / Add / Keep / Improve",
        body: "DAKI adds a fourth column for practices that are nearly right. It stops a team throwing out something that only needs adjusting, which is the most common way Start / Stop / Continue loses a good habit.",
      },
    ],
    insteadOf: [
      {
        slug: "mad-sad-glad",
        when: "The sprint was hard and the team needs to say so before it can talk about process.",
      },
      {
        slug: "sailboat",
        when: "The goal itself is contested, or there is a risk ahead that nobody has raised.",
      },
    ],
    faq: [
      {
        q: "What is the Start Stop Continue retrospective?",
        a: "A retrospective format with three columns: what the team should start doing, what it should stop doing, and what it should keep doing. Each person writes cards into all three, the team groups and votes, and the top items become actions.",
      },
      {
        q: "How long does a Start Stop Continue retro take?",
        a: "About 45 minutes for a two-week sprint: 10 minutes writing, 10 grouping, 5 voting, and 15 on actions, with 5 minutes either side.",
      },
      {
        q: "What's the difference between Stop and Start?",
        a: "Stop is about removing something the team already does. Start is about adding something it doesn't. Teams over-fill Start because adding feels productive, but removing usually frees more time.",
      },
      {
        q: "Is Good Bad Start Stop the same as Start Stop Continue?",
        a: "Not quite. Good / Bad / Start / Stop splits the exercise in two: Good and Bad collect what happened, Start and Stop collect what to do next. Start / Stop / Continue asks for decisions directly and has a column for protecting what already works, which the four column version drops. Use the four column form if people keep writing observations where actions should go.",
      },
      {
        q: "How many cards should each person write?",
        a: "Three to five in total is normal, not three to five per column. A team that writes twenty cards each spends the whole retro reading and never reaches actions.",
      },
      {
        q: "Can you use Start Stop Continue for an individual?",
        a: "Yes, and it is one of the better formats for a one to one or a personal review, because all three questions are about behaviour rather than outcome. Write it yourself first, then compare with the other person's version of the same three columns.",
      },
    ],
  },
  {
    slug: "good-bad-start-stop",
    templateId: "good_bad_start_stop",
    name: "Good / Bad / Start / Stop",
    title: "Good Bad Start Stop retrospective template",
    description:
      "The Good Bad Start Stop retrospective template explained: why splitting observations from decisions gets more out of a quiet team, what belongs in each of the four columns, and how to run one in an hour. Free board, no sign-up.",
    intro:
      "Good / Bad / Start / Stop does one thing the three column formats cannot: it separates noticing from deciding. Good and Bad collect what actually happened. Start and Stop collect what the team intends to do about it. Teams reach for this the moment they realise their Start column has quietly filled up with complaints.",
    origin:
      "It has no single author. It is what Start / Stop / Continue turns into when a team keeps writing observations where actions should go, and it has been rediscovered independently by enough teams that most people meet it without ever being taught it.",
    bestFor: [
      "Teams whose Start column keeps filling with things that are really complaints",
      "Rooms where people want to say what happened before being asked to fix it",
      "Sprints with an obvious event in them: an incident, a launch, a deadline missed",
      "Mixed groups where not everyone has the standing to propose a process change",
    ],
    avoid:
      "Skip it when the team is practised and time is short. The extra column and the grouping step between the halves cost about ten minutes, and a team that already writes decisions straight into Start gets nothing back for them. Use Start / Stop / Continue instead.",
    columns: [
      {
        title: "Good",
        tone: "positive",
        what: "What happened that was worth it. Observations, not proposals: this column is a record of the sprint, not a plan.",
        prompt: "What went well, whether or not we did it on purpose?",
        example: "Good: the release went out on Tuesday with no rollback",
      },
      {
        title: "Bad",
        tone: "negative",
        what: "What happened that hurt. The column that earns the format, because nothing here has to be anyone's suggestion yet.",
        prompt: "What went badly, even if you don't know what to do about it?",
        example: "Bad: we found out the schema had changed by breaking in production",
      },
      {
        title: "Start",
        tone: "idea",
        what: "Decisions. Things the team will begin doing, drawn from what the first two columns turned up.",
        prompt: "Given all that, what should we begin doing?",
        example: "Start announcing schema changes in the channel before merging",
      },
      {
        title: "Stop",
        tone: "neutral",
        what: "The other half of the decision. Things the team will stop doing, for the same reasons.",
        prompt: "Given all that, what should we stop?",
        example: "Stop approving migrations without a named reviewer",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage. Say that the first two columns are for observations only." },
      { time: "10 min", step: "Silent writing into Good and Bad, cards hidden. Nothing goes in Start or Stop yet." },
      { time: "10 min", step: "Reveal Good and Bad, read out, and group the cards that are really one card." },
      { time: "10 min", step: "Now open Start and Stop, and write against the themes on the board." },
      { time: "5 min", step: "Vote on the Start and Stop cards rather than the observations." },
      { time: "15 min", step: "Turn the top two or three into actions with owners." },
    ],
    tips: [
      "Hold the line on the first ten minutes. The whole value of the format is that nobody has to have a solution ready before they are allowed to say what happened.",
      "Vote on the decisions, not the observations. Voting on Bad cards just ranks the team's misery and leaves you no closer to an action.",
      "If Start and Stop fill up faster than Good and Bad, the team did not need this format. Run Start / Stop / Continue next time and save ten minutes.",
      "A Bad card with no matching Start or Stop card is not a failure. Some things are worth recording and outside the team's reach, and pretending otherwise produces actions nobody does.",
    ],
    faq: [
      {
        q: "What is the Good Bad Start Stop retrospective?",
        a: "A four column retrospective that splits the session in two. Good and Bad gather what happened during the sprint, then Start and Stop gather what the team will do differently. The first pair is observation, the second pair is decision, and keeping them apart is the point.",
      },
      {
        q: "Is Good Bad Start Stop the same as Start Stop Continue?",
        a: "No. Start / Stop / Continue asks for decisions in all three columns and keeps a place for protecting what already works. Good / Bad / Start / Stop gives observations a home of their own but drops the Continue column, so nothing on the board argues for keeping a practice that is working.",
      },
      {
        q: "How long does a Good Bad Start Stop retro take?",
        a: "About an hour for a two week sprint, which is ten minutes longer than the three column formats. The extra time goes on grouping Good and Bad before the team is allowed to write in Start and Stop.",
      },
      {
        q: "Should people write in all four columns at once?",
        a: "No, and that is the one rule worth enforcing. Opening all four at the start collapses the format back into Start / Stop / Continue with a spare column, because people write the solution they arrived with instead of the thing they noticed.",
      },
      {
        q: "What if the Bad column is much longer than the Good one?",
        a: "That is normal and not by itself a problem: bad things are more memorable and easier to name. It is worth worrying about when it happens every sprint, which usually means the team has no habit of noticing what works and will lose those practices without noticing either.",
      },
    ],
    walkthrough: {
      scenario:
        "A four person team in the sprint after a schema change took the search service down for an afternoon, running an hour.",
      columns: [
        {
          title: "Good",
          cards: [
            "Good: the release went out on Tuesday with no rollback",
            "Good: two people picked up the incident without being asked",
            "Good: the new smoke tests caught the second bad deploy",
          ],
        },
        {
          title: "Bad",
          cards: [
            "Bad: we found out the schema had changed by breaking in production",
            "Bad: the runbook was six months out of date when we opened it",
            "Bad: nobody could say who owned the search service during the incident",
          ],
        },
        {
          title: "Start",
          cards: [
            "Start announcing schema changes in the channel before merging",
            "Start putting a named owner on every service in the catalogue",
          ],
        },
        {
          title: "Stop",
          cards: [
            "Stop approving migrations without a named reviewer",
            "Stop treating the runbook as documentation rather than part of the change",
          ],
        },
      ],
      themes: [
        "All three Bad cards were one card: changes reaching production without the people downstream knowing, and nobody named to ask.",
        "The Good column was mostly the safety net working. Worth noticing, because it is the only reason the afternoon was not a day.",
      ],
      actions: [
        "Rae adds a required platform reviewer on migrations, this week.",
        "Ola fills in the owner field for every service in the catalogue before the next retro, and the team reads the list out at it.",
      ],
    },
    variations: [
      {
        name: "Good / Bad / Start / Stop / Continue",
        slug: "start-stop-continue",
        body: "Adds back the column this format drops. Worth it for a team that has lost a good practice recently, because Continue is the only column that argues for keeping something. The cost is five columns, which is about as wide as a retro can get before people stop reading each other's cards.",
      },
      {
        name: "Plus / Delta",
        body: "The same split with two columns instead of four: Plus for what worked, Delta for what to change. It fits a fifteen minute retro at the end of a workshop or a day of interviews, where the full format would be heavier than the material.",
      },
      {
        name: "Written asynchronously first",
        body: "Open Good and Bad a day early and let people fill them in as the sprint ends, then run the live session on Start and Stop only. It suits distributed teams and gets better observations, because people write them while they are still annoyed rather than a week later.",
      },
    ],
    insteadOf: [
      {
        slug: "start-stop-continue",
        when: "The team already writes decisions straight into Start and the extra ten minutes buys nothing.",
      },
      {
        slug: "mad-sad-glad",
        when: "The Bad column keeps filling with how the sprint felt rather than what happened in it.",
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
        what: "Disappointments rather than frustrations: things that fell short, got dropped, or didn't land.",
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
      { time: "5 min", step: "Set the stage. Read the prime directive out loud. This format needs it." },
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
    walkthrough: {
      scenario:
        "A six person team in the sprint after a two day outage, running an hour with the engineering manager out of the room.",
      columns: [
        {
          title: "Mad",
          cards: [
            "Mad that the staging environment was down for three days",
            "Mad that we heard about the config change from the incident, not the PR",
            "Mad that one alert paged three people and none of them owned it",
          ],
        },
        {
          title: "Sad",
          cards: [
            "Sad we cut the accessibility work again",
            "Sad that whoever fixed it spent their weekend on it",
            "Sad that the postmortem actions from March are still open",
          ],
        },
        {
          title: "Glad",
          cards: [
            "Glad the on-call handover actually worked this time",
            "Glad two people volunteered before anyone was asked",
            "Glad the status page updates went out without anyone chasing",
          ],
        },
      ],
      themes: [
        "Two Mad cards and one Sad card were the same thing: changes landing without anyone downstream knowing.",
        "The Glad column was mostly people covering for each other, which is worth naming and also a sign the system is running on goodwill.",
      ],
      actions: [
        "Ana makes a platform reviewer required on any config change to shared infrastructure.",
        "Tom reopens the March postmortem actions at the next retro, with a yes or no on each.",
      ],
    },
    variations: [
      {
        name: "Mad / Sad / Glad / Afraid",
        body: "Adds a column for what people are worried about rather than what already happened. It catches the thing a team knows is coming and has not said out loud, and it gives an anxious room somewhere to put that feeling other than Mad.",
      },
      {
        name: "Glad first",
        body: "Run the columns in reverse, starting with Glad. Writing something good first makes the hard column easier to fill, which matters most with a team doing this format for the first time.",
      },
      {
        name: "Happy / Meh / Sad",
        body: "A lighter labelling for teams that find Mad too strong, or in cultures where naming anger at work is a bigger step than the format intends. The middle column collects the things that were merely disappointing, which is where most of the useful material sits anyway.",
      },
    ],
    insteadOf: [
      {
        slug: "start-stop-continue",
        when: "The team is already talking freely and what it needs now is concrete process change.",
      },
      {
        slug: "four-ls",
        when: "The period under review is a whole release, and what the team learned matters as much as how it felt.",
      },
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
      {
        q: "Can you run Mad Sad Glad anonymously?",
        a: "You can, and it is a reasonable choice for a team that is not safe yet. The cost is that you cannot follow up on a card nobody will claim. Keeping cards hidden until everyone has written gets most of the benefit and leaves the author able to explain what they meant.",
      },
      {
        q: "What if everybody only writes Glad cards?",
        a: "That is information, not a failed retro. Either the sprint genuinely went well, or the room does not believe the Mad column is safe. Ask directly which one it is. If it is the second, switch to a process format and come back to this one later.",
      },
      {
        q: "How long does a Mad Sad Glad retro take?",
        a: "About an hour, and it does not compress well. The read-out is the part that matters and it needs time, because an emotional card that gets solved in ten seconds usually was not understood.",
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
      "The four Ls (Liked, Learned, Lacked, Longed for) is the format to reach for when the period under review is longer than a sprint. Its two middle columns are what make it: Learned captures knowledge the team gained, and Lacked names what was missing, which is usually more actionable than what went wrong.",
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
        what: "What the team enjoyed or valued: practices, decisions, moments worth keeping.",
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
        what: "What was missing: information, tools, time, access, clarity. Absences, not mistakes.",
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
      { time: "5 min", step: "Set the stage and name the period: a release, not a sprint." },
      { time: "15 min", step: "Silent writing across four columns. Four needs more time than three." },
      { time: "15 min", step: "Reveal and group. Learned cards often deserve writing down somewhere permanent." },
      { time: "5 min", step: "Vote, with four or five dots each given the extra column." },
      { time: "15 min", step: "Actions from Lacked; escalations from Longed for." },
    ],
    tips: [
      "Learned is the column teams skip and regret. Copy those cards into your documentation before the board is forgotten.",
      "Lacked usually converts to actions more cleanly than a 'what went wrong' column, because an absence names its own fix.",
      "Longed for is not wasted time even when nothing is actionable. It tells a manager what the team can't fix alone.",
    ],
    walkthrough: {
      scenario:
        "An eight person team the week after shipping a six month billing migration, running 90 minutes.",
      columns: [
        {
          title: "Liked",
          cards: [
            "Liked how early we got a working prototype in front of users",
            "Liked that we froze scope at the halfway point and held it",
            "Liked having one person own the cutover plan end to end",
          ],
        },
        {
          title: "Learned",
          cards: [
            "Learned the rate limit is per-account, not per-key",
            "Learned the legacy proration logic has three special cases nobody had written down",
            "Learned finance needed two weeks of parallel running, not the two days we planned",
          ],
        },
        {
          title: "Lacked",
          cards: [
            "Lacked a staging database with realistic data volume",
            "Lacked any way to test a month-end close without waiting for month end",
            "Lacked a named contact in finance for the first two months",
          ],
        },
        {
          title: "Longed for",
          cards: [
            "Longed for a decision on the API version before we built on it",
            "Longed for the scope freeze to apply to the teams around us too",
            "Longed for more than one person who can read the old billing code",
          ],
        },
      ],
      themes: [
        "Three Learned cards were things a document could have told the team, which makes them a documentation gap rather than knowledge gained.",
        "Lacked and Longed for were pointing at one problem: the team could not rehearse the risky part before doing it for real.",
      ],
      actions: [
        "Dev writes the proration special cases and the parallel-running requirement into the billing runbook this week.",
        "Maya asks for a month-end simulation environment in the next platform planning round, using the migration as the argument.",
      ],
    },
    variations: [
      {
        name: "Learned first",
        body: "Open with Learned instead of Liked when the point of the session is knowledge transfer rather than process. It puts the most perishable column first, while people still remember the detail, and it sets the tone that this is a handover rather than a scoring exercise.",
      },
      {
        name: "As an onboarding review",
        body: "Run the four Ls with one person about their first ninety days. Lacked and Longed for turn into the clearest onboarding backlog you will get, because a new joiner is the only person who can still see what is missing.",
      },
      {
        name: "Split across two sessions",
        body: "For a project long enough that one sitting cannot cover it, take Liked and Learned in the first session and Lacked and Longed for in the second. The gap lets people remember things, and the second session starts with the knowledge already written down.",
      },
    ],
    insteadOf: [
      {
        slug: "start-stop-continue",
        when: "It is a routine two-week sprint, where asking what the team learned produces filler.",
      },
      {
        slug: "sailboat",
        when: "The next milestone matters more than the last one and the risks are still ahead.",
      },
    ],
    faq: [
      {
        q: "What are the 4 Ls in a retrospective?",
        a: "Liked, Learned, Lacked and Longed for. The team writes cards under each, covering what they valued, what knowledge they gained, what was missing, and what they wished for.",
      },
      {
        q: "When should you use a 4 Ls retrospective?",
        a: "At the end of a milestone, release, quarter or project, anywhere the period is long enough that the team genuinely learned something. It's too broad for a routine sprint.",
      },
      {
        q: "What's the difference between Lacked and Longed for?",
        a: "Lacked is something the team needed and could plausibly have had: a tool, data, access. Longed for is a wish that's usually outside the team's control, which makes it a signal to escalate rather than an action.",
      },
      {
        q: "Who invented the 4 Ls retrospective?",
        a: "It is attributed to Mary Gorman and Ellen Gottesdiener, who designed it for reflection across a release or a project rather than a two week iteration. That origin is why it reads as too broad when a team tries to run it every sprint.",
      },
      {
        q: "Is there a 5 Ls retrospective?",
        a: "Some teams add a fifth column, usually Loathed or Loved, to give strong feeling somewhere to go. It works, but if that column is the one filling up then the team is asking an emotional question, and Mad / Sad / Glad asks it better.",
      },
      {
        q: "Where should the Learned cards go afterwards?",
        a: "Somewhere that outlives the board, on the day of the retro. A runbook, an onboarding doc, an architecture note. Learned is the column teams skip copying out and regret, because the knowledge was only ever in the room.",
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
        what: "What's pushing the team forward: momentum, help, tooling, anything making the work easier.",
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
        what: "Where the team is trying to get to. Write it first. Everything else is relative to it.",
        prompt: "What are we actually aiming at?",
        example: "Island: ship self-serve onboarding by end of quarter",
      },
    ],
    running: [
      { time: "5 min", step: "Set the stage and draw the metaphor: boat, island, wind, anchors, rocks." },
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
    walkthrough: {
      scenario:
        "A seven person team at the start of a quarter, planning self-serve onboarding, running 50 minutes.",
      columns: [
        {
          title: "Wind",
          cards: [
            "Wind: the new CI pipeline cut review turnaround in half",
            "Wind: design has the flows ready two weeks ahead of us",
            "Wind: we did the auth work last quarter and it has held",
          ],
        },
        {
          title: "Anchors",
          cards: [
            "Anchors: three separate approval steps before a release",
            "Anchors: the signup form still lives in the marketing site repo",
            "Anchors: nobody reviews PRs in the first week of a sprint",
          ],
        },
        {
          title: "Rocks",
          cards: [
            "Rocks: only one person can deploy the payments service",
            "Rocks: the trial logic assumes a sales-assisted signup and nobody has checked what self-serve does to it",
            "Rocks: the identity provider contract is up for renewal in March",
          ],
        },
        {
          title: "Island",
          cards: [
            "Island: ship self-serve onboarding by the end of the quarter",
            "Island: a new customer reaches a working account without talking to anyone",
          ],
        },
      ],
      themes: [
        "The island took ten minutes, because two people thought self-serve meant no sales contact at all and two thought it meant sales later. That was the most valuable ten minutes of the session.",
        "Two rocks were the same rock: things that only work because one particular person knows about them.",
      ],
      actions: [
        "Jo runs a deploy of the payments service with somebody else driving, before the end of the month.",
        "Kit checks what the trial logic does on a self-serve signup and reports back at the next planning session.",
      ],
    },
    variations: [
      {
        name: "Speed Boat",
        body: "The original game this format came from: the boat and the anchors, nothing else. Half an hour, one question, and a ranked list of what is slowing the team down. Reach for it when the goal is not in question and you only want the drag.",
      },
      {
        name: "Add a sun and a storm",
        body: "The sun is what the team is optimistic about, the storm is the weather it cannot control: a reorganisation, a hiring freeze, a market shift. Separating the storm from the anchors stops the team writing actions against things no action will reach.",
      },
      {
        name: "Run it as a pre-mortem",
        body: "Island and rocks only, before the work starts rather than after. Ask the team to imagine the quarter has failed and to write why. It gets the same risks onto the board as the full format and takes twenty minutes.",
      },
    ],
    insteadOf: [
      {
        slug: "start-stop-continue",
        when: "The goal has not changed and what you want is a short retro that produces process actions.",
      },
      {
        slug: "mad-sad-glad",
        when: "Something went badly wrong and the team needs to talk about it before it can plan forward.",
      },
    ],
    faq: [
      {
        q: "What is a sailboat retrospective?",
        a: "A retrospective format using a sailing metaphor: the island is the goal, the wind is what's helping, the anchors are what's slowing the team down, and the rocks are risks ahead that haven't caused problems yet.",
      },
      {
        q: "What's the difference between anchors and rocks?",
        a: "Anchors are slowing you down now. Rocks are hazards that haven't hit yet. Keeping them separate is the point of the format. Most retro formats have nowhere to put a future risk.",
      },
      {
        q: "When should you run a sailboat retrospective?",
        a: "At the start of a quarter or project, or any time the team needs to talk about goals and risk together. It's less useful for a routine sprint where the goal hasn't changed.",
      },
      {
        q: "Is a sailboat retrospective the same as a speedboat retrospective?",
        a: "Speed Boat is the original and narrower exercise: the boat and the anchors, asking only what slows the team down. The sailboat adds the island, the wind and the rocks, which turns an obstacle game into a full retrospective that also looks forward.",
      },
      {
        q: "Do you need to draw the boat?",
        a: "No. The drawing helps a room that engages better with a picture than a table, but the format works as four columns. What actually matters is filling the island first, because every other column is written relative to it.",
      },
      {
        q: "How long does a sailboat retrospective take?",
        a: "About 45 minutes, of which the first five go on the island. Budget more if the team has never agreed the goal out loud, because that conversation is the one worth having and it will not fit in five minutes.",
      },
    ],
  },
];

export function guideBySlug(slug: string): TemplateGuide | undefined {
  return TEMPLATE_GUIDES.find((guide) => guide.slug === slug);
}

/** The guide for a board template, where one has been written. */
export function guideByTemplateId(
  templateId: string,
): TemplateGuide | undefined {
  return TEMPLATE_GUIDES.find((guide) => guide.templateId === templateId);
}
