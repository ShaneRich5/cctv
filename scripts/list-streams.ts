// Lists YouTube streams with their live and embed status, marking which feed in
// src/feeds.ts (if any) already uses each one. Use it to find the new video ID
// when a publisher restarts a stream, or to discover cameras to add.
//
//   npm run list-streams                            channels already in src/feeds.ts
//   npm run list-streams -- @SeeJamaica ...         specific channels (handle or UC… id)
//   npm run list-streams -- --search "negril live"  live search results
//   npm run list-streams -- yHcnmIezKo4 ...         specific video ids
import { FEEDS } from "../src/feeds.ts";
import {
  channelVideoIds,
  inspectVideo,
  searchLiveVideoIds,
  type VideoInfo,
} from "./lib/youtube.ts";

const feedByVideo = new Map(
  FEEDS.flatMap((feed) =>
    feed.source.kind === "youtube" ? [[feed.source.videoId, feed.id] as const] : [],
  ),
);

// The YouTube channels publishing the current feeds, from their provider links.
function catalogChannels(): string[] {
  const handles = FEEDS.flatMap(
    (feed) => /youtube\.com\/(@[\w.-]+)/.exec(feed.provider.url)?.[1] ?? [],
  );
  return [...new Set(handles)];
}

async function inspectAll(videoIds: string[]): Promise<VideoInfo[]> {
  const results: VideoInfo[] = [];
  // A few at a time, to be gentle with YouTube.
  for (let i = 0; i < videoIds.length; i += 6) {
    results.push(...(await Promise.all(videoIds.slice(i, i + 6).map(inspectVideo))));
  }
  return results;
}

function statusOf(video: VideoInfo): string {
  if (video.live) return "LIVE";
  return video.playability === "OK" ? "not live" : video.playability.toLowerCase();
}

async function report(heading: string, loadIds: () => Promise<string[]>) {
  try {
    const videos = await inspectAll(await loadIds());
    console.log(`\n# ${heading}: ${videos.length} stream(s)`);
    videos.sort((a, b) => Number(b.live) - Number(a.live));
    for (const video of videos) {
      console.log(
        [
          statusOf(video).padEnd(14),
          (video.embeddable ? "embed" : "NO EMBED").padEnd(8),
          video.videoId,
          `feed:${feedByVideo.get(video.videoId) ?? "-"}`.padEnd(9),
          video.title,
          video.channel === "?" ? "" : `(${video.channel})`,
        ].join("  "),
      );
    }
  } catch (error) {
    console.log(
      `\n# ${heading}: failed (${error instanceof Error ? error.message : String(error)})`,
    );
    process.exitCode = 1;
  }
}

const args = process.argv.slice(2);

if (args[0] === "--search") {
  const query = args.slice(1).join(" ");
  await report(`search "${query}"`, () => searchLiveVideoIds(query));
} else {
  const videoIds = args.filter((arg) => /^[\w-]{11}$/.test(arg));
  const channels = args.filter((arg) => !videoIds.includes(arg));
  if (videoIds.length) await report("videos", () => Promise.resolve(videoIds));
  for (const channel of channels.length || videoIds.length ? channels : catalogChannels()) {
    await report(channel, () => channelVideoIds(channel));
  }
}
