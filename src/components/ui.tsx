import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Tone } from "@/lib/types";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Static class lookups — Tailwind needs to see the full class name. */
export const TONE: Record<
  Tone,
  { text: string; border: string; glow: string; dot: string; chip: string }
> = {
  positive: {
    text: "text-tone-positive",
    border: "border-l-tone-positive",
    glow: "shadow-[0_0_28px_-12px_var(--color-tone-positive)]",
    dot: "bg-tone-positive",
    chip: "bg-tone-positive/12 text-tone-positive ring-tone-positive/25",
  },
  negative: {
    text: "text-tone-negative",
    border: "border-l-tone-negative",
    glow: "shadow-[0_0_28px_-12px_var(--color-tone-negative)]",
    dot: "bg-tone-negative",
    chip: "bg-tone-negative/12 text-tone-negative ring-tone-negative/25",
  },
  idea: {
    text: "text-tone-idea",
    border: "border-l-tone-idea",
    glow: "shadow-[0_0_28px_-12px_var(--color-tone-idea)]",
    dot: "bg-tone-idea",
    chip: "bg-tone-idea/12 text-tone-idea ring-tone-idea/25",
  },
  neutral: {
    text: "text-tone-neutral",
    border: "border-l-tone-neutral",
    glow: "shadow-[0_0_28px_-12px_var(--color-tone-neutral)]",
    dot: "bg-tone-neutral",
    chip: "bg-tone-neutral/12 text-tone-neutral ring-tone-neutral/25",
  },
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary:
    "bg-accent text-white hover:bg-accent-soft shadow-[0_6px_20px_-8px_var(--color-accent)]",
  ghost:
    "surface text-mist-100 hover:bg-fill-3 hover:border-line-strong",
  quiet:
    "text-mist-500 hover:text-mist-100 hover:bg-fill-2",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
} as const;

export function Button({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-[background-color,border-color,color,transform] duration-150",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    />
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("surface rounded-2xl", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500">
      {children}
    </span>
  );
}

/** Skeleton shimmer used while a Claude pass is running. */
export function Shimmer({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          style={{ width: `${100 - index * 12}%` }}
          className="h-3 rounded-full bg-[linear-gradient(90deg,var(--color-shimmer-base),var(--color-shimmer-peak),var(--color-shimmer-base))] bg-[length:200%_100%] animate-shimmer"
        />
      ))}
    </div>
  );
}
