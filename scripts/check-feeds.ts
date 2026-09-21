// Checks every feed in src/feeds.ts: YouTube streams must be playable,
// embeddable and live; other sources must respond. Live stream IDs change when a
// publisher restarts a stream, so run this when a monitor sits on NO SIGNAL.
//
//   npm run check-feeds        (Node 24 runs this TypeScript file directly)
import { FEEDS, type Feed } from "../src/feeds.ts";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "Accept-Language": "en-US",
  Cookie: "CONSENT=YES+1",
};

async function checkYouTube(videoId: string): Promise<string | null> {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: HEADERS });
  const html = await response.text();
  const status = /"playabilityStatus":\{"status":"([A-Z_]+)"/.exec(html)?.[1] ?? "UNKNOWN";
  if (status !== "OK") return `not playable (${status})`;
  if (!html.includes('"playableInEmbed":true')) return "embedding disabled";
  if (!html.includes('"isLiveNow":true')) return "not live right now";
  return null;
}

async function checkUrl(url: string): Promise<string | null> {
  const response = await fetch(url, { method: "HEAD", headers: HEADERS });
  return response.ok ? null : `HTTP ${response.status}`;
}

async function check(feed: Feed): Promise<string | null> {
  const { source } = feed;
  try {
    return source.kind === "youtube"
      ? await checkYouTube(source.videoId)
      : await checkUrl(source.url);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

let failures = 0;
for (const feed of FEEDS) {
  const problem = await check(feed);
  if (problem) failures++;
  console.log(
    `${problem ? "✕" : "✓"} ${feed.id.padEnd(4)} ${feed.name}${problem ? ` — ${problem}` : ""}`,
  );
}

if (failures) {
  console.log(`\n${failures} feed(s) need attention.`);
  process.exitCode = 1;
}
