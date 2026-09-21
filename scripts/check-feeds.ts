// Checks every feed in src/feeds.ts: YouTube streams must be playable,
// embeddable and live; other sources must respond. Live stream IDs change when a
// publisher restarts a stream, so run this when a monitor sits on NO SIGNAL.
//
//   npm run check-feeds        (Node 24 runs this TypeScript file directly)
import { FEEDS, type Feed } from "../src/feeds.ts";
import { HEADERS, inspectVideo } from "./lib/youtube.ts";

async function check(feed: Feed): Promise<string | null> {
  const { source } = feed;
  try {
    if (source.kind !== "youtube") {
      const response = await fetch(source.url, { method: "HEAD", headers: HEADERS });
      return response.ok ? null : `HTTP ${response.status}`;
    }
    const video = await inspectVideo(source.videoId);
    if (video.playability !== "OK") return `not playable (${video.playability})`;
    if (!video.embeddable) return "embedding disabled";
    if (!video.live) return "not live right now";
    return null;
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
  console.log(
    "`npm run list-streams` shows the publishers' current streams, to find replacements.",
  );
  process.exitCode = 1;
}
