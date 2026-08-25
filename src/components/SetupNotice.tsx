import { cx } from "./ui";

type Step = { env: string; what: string; how: string; done: boolean };

/**
 * Shown instead of a crash when the app is running without its two environment
 * variables. Getting from `git clone` to a working board should never require
 * reading the source.
 */
export function SetupNotice({
  hasDatabase,
  hasAi,
}: {
  hasDatabase: boolean;
  hasAi: boolean;
}) {
  const steps: Step[] = [
    {
      env: "DATABASE_URL",
      what: "Postgres connection string",
      how: "Create a free database at neon.tech or supabase.com and paste the connection string. Tables are created automatically on first request.",
      done: hasDatabase,
    },
    {
      env: "ANTHROPIC_API_KEY",
      what: "Claude API key",
      how: "Grab one from console.anthropic.com. Without it the board still works — the four AI passes are simply disabled.",
      done: hasAi,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-soft">
        One step left
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-mist-100">
        Add your environment variables
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mist-500">
        Copy <code className="font-mono text-mist-300">.env.example</code> to{" "}
        <code className="font-mono text-mist-300">.env.local</code>, fill these in, and
        restart the dev server.
      </p>

      <ol className="mt-8 space-y-3">
        {steps.map((step) => (
          <li
            key={step.env}
            className={cx(
              "surface flex gap-4 rounded-2xl p-4",
              step.done && "border-tone-positive/25 bg-tone-positive/5",
            )}
          >
            <span
              className={cx(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                step.done
                  ? "bg-tone-positive text-ink-fixed"
                  : "bg-fill-3 text-mist-500",
              )}
            >
              {step.done ? "✓" : "!"}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[13px] text-mist-100">{step.env}</p>
              <p className="mt-0.5 text-[13px] font-medium text-mist-300">{step.what}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-mist-700">{step.how}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
