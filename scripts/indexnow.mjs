/**
 * Pushes the public URLs to IndexNow, which Bing and Yandex consume directly.
 *
 * Bing is what Copilot searches and a large part of what ChatGPT's search
 * reads, so this is the shortest path from "deployed" to "an assistant can
 * find it" — minutes rather than the days a crawler takes to come round.
 *
 *   node scripts/indexnow.mjs
 */
import { readdirSync } from "node:fs";

const HOST = process.env.INDEXNOW_HOST ?? "retroboard.site";
const base = `https://${HOST}`;

const key = readdirSync(new URL("../public", import.meta.url))
  .find((name) => /^[0-9a-f]{32}\.txt$/.test(name))
  ?.replace(/\.txt$/, "");

if (!key) {
  console.error("No IndexNow key file found in public/. Expected <32 hex>.txt");
  process.exit(1);
}

/**
 * Taken from the deployed sitemap rather than listed here.
 *
 * The sitemap is generated from the same data the pages are, so it cannot
 * fall behind the way a hand-written list does: this one was still naming
 * four formats a release after there were five, and the missing page was the
 * new one, which is the only page that really needed submitting.
 */
const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) {
  console.error(`Could not read ${base}/sitemap.xml: ${sitemap.status}`);
  process.exit(1);
}
const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);

if (urlList.length === 0) {
  console.error("Sitemap parsed to zero URLs, refusing to submit.");
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `${base}/${key}.txt`,
    urlList,
  }),
});

// 200 and 202 both mean accepted; IndexNow returns no body.
console.log(`IndexNow: ${response.status} ${response.statusText} for ${urlList.length} URLs`);
if (!response.ok) process.exit(1);
