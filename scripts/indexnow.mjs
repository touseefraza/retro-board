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

const urlList = [
  `${base}/`,
  `${base}/templates`,
  `${base}/templates/start-stop-continue`,
  `${base}/templates/mad-sad-glad`,
  `${base}/templates/four-ls`,
  `${base}/templates/sailboat`,
  `${base}/how-to-run-a-retrospective`,
  `${base}/new`,
];

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
