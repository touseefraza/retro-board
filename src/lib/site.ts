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
