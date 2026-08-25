import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-20 text-center sm:px-6 sm:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist-700">
        404
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-mist-100">
        That board doesn&rsquo;t exist
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mist-500">
        The link may be mistyped, or the board was never created.
      </p>
      <Link
        href="/"
        className="mx-auto mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
      >
        Start a new retro
      </Link>
    </main>
  );
}
