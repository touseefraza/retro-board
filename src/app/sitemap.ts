import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Only the landing page: board URLs are private and intentionally unlisted. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
