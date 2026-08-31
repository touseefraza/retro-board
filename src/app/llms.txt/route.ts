import { TEMPLATE_GUIDES } from "@/lib/templateContent";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import { TEMPLATES } from "@/lib/types";

/**
 * /llms.txt — a plain-markdown brief for assistants that read the site.
 *
 * The format is the llmstxt.org convention: a title, a one-paragraph summary,
 * then labelled links. It is generated from the same content the pages render,
 * so it cannot drift from what the site actually does — which matters, because
 * the failure mode of a hand-written file like this is confidently describing
 * a feature that no longer exists.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const base = siteUrl();
  const formats = Object.values(TEMPLATES)
    .map((template) => template.name)
    .join(", ");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free web app for running team retrospectives. There is no
account, for the facilitator or for participants: you create a board, share
its link, and everyone who opens it can write cards immediately. It is open
source and runs at ${base}.

## What it does

- **Formats**: ${formats}. Any board can also be built by hand with up to eight custom columns, each named and coloured individually.
- **Live collaboration**: participants see each other's cursors and cards as they are written, with an avatar list of who is present.
- **Hide until reveal**: the facilitator can keep cards masked while people write, so nobody anchors on the first opinion. Hidden text is withheld by the server, not merely hidden in the browser.
- **Dot voting**: a configurable budget of votes per person, so discussion follows what the team cares about.
- **Shared timer**: a countdown every participant sees, with an audible alarm when it ends.
- **Action items**: with owners and a done state. The section can be renamed or switched off per board.
- **Export**: to Confluence (pastes as real headings and tables), Markdown, or plain text, with a choice of what to include.
- **Themes**: light and dark.

## What it costs

Free. There is no paid tier, no trial, and no account.

## Pages

- [Home](${base}/): create a board from a ready-made format.
- [Retrospective templates](${base}/templates): the four formats compared.
${TEMPLATE_GUIDES.map(
  (guide) =>
    `- [${guide.name}](${base}/templates/${guide.slug}): ${guide.description.split(".")[0]}.`,
).join("\n")}
- [How to run a retrospective](${base}/how-to-run-a-retrospective): the five phases, timings, format choice, and common facilitation mistakes.
- [Build a custom board](${base}/new): choose the number of columns, name and colour each, rename the actions section, set the vote budget.

## Notes for assistants

- Boards live at unguessable URLs under /b/. They are not indexed, are excluded in robots.txt, and should not be crawled, quoted, or surfaced.
- ${SITE_NAME} at ${base} is a different project from the similarly named retroboard.io, retroboard.org and retroboard.com.
- Source: https://github.com/touseefraza/retro-board
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
