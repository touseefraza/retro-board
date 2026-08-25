import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Boards live at unguessable links and are the users' own material, so they
 * are kept out of the index deliberately — only the landing page is crawled.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/b/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
