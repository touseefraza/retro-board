"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, cx, TONE } from "./ui";
import { VISITOR_NAME } from "@/lib/names";
import { useParticipant } from "@/lib/useParticipant";
import {
  COLUMN_LIMITS,
  TEMPLATES,
  TONES,
  TONE_LABELS,
  type TemplateColumn,
  type Tone,
} from "@/lib/types";

const TEMPLATE_IDS = Object.keys(TEMPLATES);

/**
 * Colour arrangements applied across whatever columns exist. The tone drives
 * the column's accent, so a palette is really an ordering of tones — picking
 * one re-colours the board without touching the column names.
 */
const PALETTES: { id: string; label: string; order: Tone[] }[] = [
  { id: "signal", label: "Signal", order: ["positive", "negative", "neutral", "idea"] },
  { id: "cool", label: "Cool", order: ["neutral", "idea", "positive", "negative"] },
  { id: "warm", label: "Warm", order: ["idea", "negative", "positive", "neutral"] },
  { id: "calm", label: "Calm", order: ["neutral", "positive", "neutral", "positive"] },
];

type Draft = { key: string; title: string; tone: Tone };

let keySeed = 0;
const nextKey = () => `col-${keySeed++}`;

function fromTemplate(columns: readonly TemplateColumn[]): Draft[] {
  return columns.map((column) => ({ key: nextKey(), ...column }));
}

export function BoardBuilder() {
  const router = useRouter();
  const { setName } = useParticipant();

  const [title, setTitle] = useState("");
  const [name, setNameDraft] = useState("");
  const [columns, setColumns] = useState<Draft[]>(() =>
    fromTemplate(TEMPLATES.classic.columns),
  );
  const [votes, setVotes] = useState(5);
  const [showActions, setShowActions] = useState(true);
  const [actionsLabel, setActionsLabel] = useState("Action items");
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const named = title.trim().length > 0;
  const usable = columns.filter((column) => column.title.trim()).length;
  const ready = named && usable >= COLUMN_LIMITS.min;

  const patch = (key: string, change: Partial<Draft>) =>
    setColumns((current) =>
      current.map((column) => (column.key === key ? { ...column, ...change } : column)),
    );

  const addColumn = () =>
    setColumns((current) =>
      current.length >= COLUMN_LIMITS.max
        ? current
        : [
            ...current,
            { key: nextKey(), title: "", tone: TONES[current.length % TONES.length] },
          ],
    );

  const removeColumn = (key: string) =>
    setColumns((current) =>
      current.length <= COLUMN_LIMITS.min
        ? current
        : current.filter((column) => column.key !== key),
    );

  const move = (index: number, by: number) =>
    setColumns((current) => {
      const next = [...current];
      const target = index + by;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const applyPalette = (order: Tone[]) =>
    setColumns((current) =>
      current.map((column, index) => ({ ...column, tone: order[index % order.length] })),
    );

  const create = async () => {
    if (!ready) return;
    setCreating(true);
    setFailure(null);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          votesPerParticipant: votes,
          showActions,
          actionsLabel: actionsLabel.trim() || "Action items",
          columns: columns
            .filter((column) => column.title.trim())
            .map(({ title: columnTitle, tone }) => ({ title: columnTitle.trim(), tone })),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setFailure(payload?.fix ?? payload?.error ?? "Could not create the board");
        return;
      }
      setName(name.trim() || VISITOR_NAME);
      router.push(`/b/${payload.boardId}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="surface rounded-3xl p-5 sm:p-6">
        <Field label="Board name">
          <input
            value={title}
            placeholder="Enter board name"
            maxLength={80}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Start from">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setColumns(fromTemplate(TEMPLATES[id].columns))}
                className="rounded-lg border border-line bg-fill-1 px-3 py-1.5 text-[12px] text-mist-300 transition-colors hover:border-line-strong hover:bg-fill-2"
              >
                {TEMPLATES[id].name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setColumns([{ key: nextKey(), title: "", tone: "neutral" }])}
              className="rounded-lg border border-dashed border-line px-3 py-1.5 text-[12px] text-mist-700 transition-colors hover:border-line-strong hover:text-mist-300"
            >
              Blank
            </button>
          </div>
        </Field>

        <Field label={`Columns (${columns.length} of ${COLUMN_LIMITS.max})`}>
          <ul className="flex flex-col gap-2">
            {columns.map((column, index) => (
              <li key={column.key} className="flex items-center gap-2">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Move column up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="px-1 text-[10px] leading-none text-mist-700 hover:text-mist-100 disabled:opacity-25"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="Move column down"
                    disabled={index === columns.length - 1}
                    onClick={() => move(index, 1)}
                    className="px-1 text-[10px] leading-none text-mist-700 hover:text-mist-100 disabled:opacity-25"
                  >
                    ▼
                  </button>
                </div>

                <input
                  value={column.title}
                  placeholder={`Column ${index + 1} name`}
                  maxLength={COLUMN_LIMITS.titleLength}
                  onChange={(event) => patch(column.key, { title: event.target.value })}
                  className={cx(inputClass, "h-10 flex-1")}
                />

                <div className="flex shrink-0 gap-1">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      aria-label={`${TONE_LABELS[tone]} accent`}
                      title={TONE_LABELS[tone]}
                      aria-pressed={column.tone === tone}
                      onClick={() => patch(column.key, { tone })}
                      className={cx(
                        "h-6 w-6 rounded-full border-2 transition-transform",
                        TONE[tone].dot,
                        column.tone === tone
                          ? "scale-110 border-mist-100"
                          : "border-transparent opacity-50 hover:opacity-100",
                      )}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Remove column"
                  disabled={columns.length <= COLUMN_LIMITS.min}
                  onClick={() => removeColumn(column.key)}
                  className="shrink-0 rounded p-1 text-mist-700 transition-colors hover:text-tone-negative disabled:opacity-25"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addColumn}
            disabled={columns.length >= COLUMN_LIMITS.max}
            className="mt-2 w-full rounded-lg border border-dashed border-line py-2 text-[12px] text-mist-700 transition-colors hover:border-line-strong hover:text-mist-300 disabled:opacity-30"
          >
            + Add column
          </button>
        </Field>

        <Field label="Colour palette">
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((palette) => (
              <button
                key={palette.id}
                type="button"
                onClick={() => applyPalette(palette.order)}
                className="flex items-center gap-2 rounded-lg border border-line bg-fill-1 px-3 py-1.5 transition-colors hover:border-line-strong hover:bg-fill-2"
              >
                <span className="flex gap-1">
                  {palette.order.map((tone, index) => (
                    <span
                      key={`${tone}-${index}`}
                      className={cx("h-2 w-2 rounded-full", TONE[tone].dot)}
                    />
                  ))}
                </span>
                <span className="text-[12px] text-mist-300">{palette.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Action items">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={showActions}
              onChange={(event) => setShowActions(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-[13px] text-mist-300">
              Track actions on this board
            </span>
          </label>
          {showActions && (
            <input
              value={actionsLabel}
              placeholder="Action items"
              maxLength={40}
              aria-label="Name for the actions section"
              onChange={(event) => setActionsLabel(event.target.value)}
              className={cx(inputClass, "mt-2")}
            />
          )}
        </Field>

        <Field label={`Votes per person: ${votes === 0 ? "unlimited" : votes}`}>
          <input
            type="range"
            min={0}
            max={20}
            value={votes}
            onChange={(event) => setVotes(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </Field>

        <Field label="Your name (optional)">
          <input
            value={name}
            placeholder={`Leave blank to join as ${VISITOR_NAME}`}
            maxLength={60}
            onChange={(event) => setNameDraft(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Button
          variant="primary"
          onClick={create}
          disabled={creating || !ready}
          className="mt-5 h-11 w-full"
        >
          {creating ? "Creating…" : "Create board →"}
        </Button>

        {failure && (
          <p className="mt-3 text-[12px] leading-relaxed text-tone-negative">{failure}</p>
        )}
        {!ready && !failure && (
          <p className="mt-3 text-[11px] text-mist-700">
            {named ? "Name at least one column." : "Give the board a name to start."}
          </p>
        )}
      </div>

      <aside className="surface sticky top-6 rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
          Preview
        </p>
        <p className="mt-2 truncate text-sm font-semibold text-mist-100">
          {title.trim() || "Untitled board"}
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {columns.map((column, index) => (
            <li key={column.key} className="flex items-center gap-2">
              <span className={cx("h-2 w-2 shrink-0 rounded-full", TONE[column.tone].dot)} />
              <span className="truncate text-[13px] text-mist-300">
                {column.title.trim() || `Column ${index + 1}`}
              </span>
            </li>
          ))}
        </ul>
        {showActions && (
          <p className="mt-3 border-t border-line pt-3 text-[12px] text-mist-500">
            + {actionsLabel.trim() || "Action items"}
          </p>
        )}
      </aside>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-fill-1 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 outline-none transition-colors focus:border-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
        {label}
      </p>
      {children}
    </div>
  );
}
