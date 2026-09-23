import type { Metadata } from "next";

/**
 * Canonical origin, used for metadata, robots and the sitemap.
 *
 * Vercel exposes the production domain at build and run time, so this is right
 * on production without configuration. Set NEXT_PUBLIC_SITE_URL to override —
 * which is what you'd do after pointing a custom domain at the project.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_NAME = "Retro Board";

export const SITE_TAGLINE =
  "Free online retrospective board for agile teams, no sign-up";

export const SITE_DESCRIPTION =
  "A free online retro board for sprint retrospectives. Create a retrospective board, share the link, and run the retro together: live cursors, voting, action items, and export to Confluence. No sign-up, no setup.";

/**
 * The Open Graph block for one page.
 *
 * Next replaces a parent's `openGraph` wholesale when a child declares one,
 * rather than merging it field by field, so every page has to restate siteName
 * and type. A page that omits the block entirely inherits the root's title and
 * URL instead, which is how a subpage ends up sharing as the home page. Going
 * through here is what stops either failure from coming back.
 *
 * `path` is the page's own path, matching its canonical.
 *
 * Deliberately no `images`: naming one here would beat the opengraph-image
 * file colocated with the page, and every route that renders a card has one.
 * Left out, each segment's own file fills it in, hash and all.
 */
export function openGraphFor(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata["openGraph"] {
  return {
    type: opts.type ?? "website",
    siteName: SITE_NAME,
    title: opts.title,
    description: opts.description,
    url: `${siteUrl()}${opts.path}`,
  };
}
