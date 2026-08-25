"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, cx } from "./ui";
import {
  DEFAULT_EXPORT,
  filename,
  maskedCount,
  render,
  type ExportFormat,
  type ExportOptions,
} from "@/lib/export";
import type { BoardState } from "@/lib/types";

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  {
    id: "confluence",
    label: "Confluence",
    hint: "Copies formatted. Paste into a Confluence page and it arrives as real headings and a table.",
  },
  {
    id: "markdown",
    label: "Markdown",
    hint: "For Jira, GitHub, Notion, or anywhere that speaks Markdown.",
  },
  {
    id: "text",
    label: "Plain text",
    hint: "Readable as-is — for a message, an email, or a commit body.",
  },
];

const PARTS: { key: keyof ExportOptions; label: string; hint: string }[] = [
  { key: "actions", label: "Action items", hint: "With owner and done state" },
  { key: "cards", label: "What people wrote", hint: "Cards grouped by column" },
  { key: "authors", label: "Author names", hint: "Who wrote each card" },
  { key: "votes", label: "Vote counts", hint: "Tally next to each card" },
];

export function ExportDialog({
  state,
  onClose,
}: {
  state: BoardState;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => render(state, options), [state, options]);
  const rich = Boolean(output.html);
  const hidden = maskedCount(state);
  const empty = !options.actions && !options.cards;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof ExportOptions, value: boolean | ExportFormat) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const copy = async () => {
    // Rich formats go on the clipboard as text/html so the paste target keeps
    // the structure, with a plain flavour alongside for editors that ignore it.
    if (output.html && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([output.html], { type: "text/html" }),
          "text/plain": new Blob([output.text], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(output.text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    const blob = new Blob([output.html ?? output.text], {
      type: output.html ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename(state, options.format);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-scrim p-4 backdrop-blur-sm sm:p-6"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export board"
        className="my-auto w-full max-w-2xl rounded-2xl border border-line bg-panel p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-mist-100">
              Export board
            </h2>
            <p className="mt-1 truncate text-[12px] text-mist-700">
              {state.board.title}
            </p>
          </div>
          <Button size="sm" variant="quiet" onClick={onClose} aria-label="Close">
            Close
          </Button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
            Format
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => set("format", format.id)}
                aria-pressed={options.format === format.id}
                className={cx(
                  "rounded-xl border p-3 text-left transition-colors",
                  options.format === format.id
                    ? "border-accent/45 bg-accent/8"
                    : "border-line bg-fill-1 hover:border-line-strong hover:bg-fill-2",
                )}
              >
                <span className="text-[13px] font-medium text-mist-100">
                  {format.label}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-mist-700">
                  {format.hint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
            Include
          </legend>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {PARTS.map((part) => {
              // Author and vote toggles only mean anything alongside the cards.
              const disabled = !options.cards && part.key !== "actions" && part.key !== "cards";
              return (
                <label
                  key={part.key}
                  className={cx(
                    "flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                    disabled ? "opacity-40" : "cursor-pointer hover:bg-fill-1",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(options[part.key])}
                    disabled={disabled}
                    onChange={(event) => set(part.key, event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] text-mist-300">{part.label}</span>
                    <span className="block text-[11px] text-mist-700">{part.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
              Preview
            </span>
            {hidden > 0 && (
              <span className="text-[11px] text-tone-idea">
                {hidden} hidden {hidden === 1 ? "card is" : "cards are"} excluded
              </span>
            )}
          </div>
          {rich && !empty ? (
            // Every value in here is escaped by the generator, so what renders
            // is exactly the markup that goes on the clipboard.
            <div
              className="export-preview mt-2 h-56 overflow-y-auto rounded-xl border border-line bg-fill-1 p-3 text-[12px] leading-relaxed text-mist-300"
              dangerouslySetInnerHTML={{ __html: output.html as string }}
            />
          ) : (
            <textarea
              readOnly
              value={empty ? "Nothing selected." : output.text}
              onFocus={(event) => event.currentTarget.select()}
              spellCheck={false}
              className="mt-2 h-56 w-full resize-none rounded-xl border border-line bg-fill-1 p-3 font-mono text-[11px] leading-relaxed text-mist-300 outline-none focus:border-accent/50"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={copy} disabled={empty}>
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
          <Button variant="ghost" onClick={download} disabled={empty}>
            Download
          </Button>
          <p className="ml-auto text-[11px] text-mist-700">
            {options.format === "confluence"
              ? "Copy, then paste straight into a Confluence page"
              : "Paste anywhere"}
          </p>
        </div>
      </div>
    </div>
  );
}
