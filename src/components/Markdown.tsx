import { Fragment, type ReactNode } from "react";

/**
 * A deliberately tiny renderer for the small subset Claude is asked to emit:
 * paragraphs, `- ` bullets, and `**bold**`. It builds React elements rather than
 * injecting HTML, so model output can never become markup.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="ml-1 space-y-1.5">
        {bullets.map((item, index) => (
          <li key={index} className="flex gap-2.5">
            <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent-soft" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  text.split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets(`ul-${index}`);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ""));
      return;
    }
    flushBullets(`ul-${index}`);
    blocks.push(<p key={`p-${index}`}>{inline(line)}</p>);
  });
  flushBullets("ul-end");

  return <div className="space-y-3 text-sm leading-relaxed text-mist-300">{blocks}</div>;
}

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-mist-100">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
