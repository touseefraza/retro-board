import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Assistants that answer from the live web fetch with their own named agents,
 * and several of them look for an explicit rule before a wildcard one. The
 * permissions are the same either way — the point of naming them is that the
 * intent is unambiguous rather than inferred.
 */
const ASSISTANT_AGENTS = [
  "GPTBot", // OpenAI, training
  "OAI-SearchBot", // ChatGPT search results
  "ChatGPT-User", // fetched because a user asked
  "ClaudeBot", // Anthropic
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini grounding
  "Applebot-Extended",
  "CCBot", // Common Crawl, which feeds many training sets
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "DuckAssistBot",
  "Bingbot", // Copilot's index
];

/**
 * Boards are private links holding a team's own words. They stay out of every
 * index and out of every training set — the disallow applies to the assistant
 * crawlers exactly as it does to search engines.
 */
const OFF_LIMITS = ["/b/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: OFF_LIMITS },
      ...ASSISTANT_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: OFF_LIMITS,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
