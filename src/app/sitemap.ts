import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { TEMPLATE_GUIDES } from "@/lib/templateContent";

/** Public pages only: board URLs are private and intentionally unlisted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/how-to-run-a-retrospective`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/templates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...TEMPLATE_GUIDES.map((guide) => ({
      url: `${base}/templates/${guide.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/new`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
