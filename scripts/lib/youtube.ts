// Reads public YouTube pages to learn whether a video is live and embeddable.
// There's no API key involved, so this depends on YouTube's page markup and may
// need updating if that changes.

export const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "Accept-Language": "en-US",
  Cookie: "CONSENT=YES+1",
};

export interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  // YouTube's playability status: "OK", "UNPLAYABLE", "LOGIN_REQUIRED", ...
  playability: string;
  embeddable: boolean;
  live: boolean;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, (match, name: string) => ENTITIES[name] ?? match);
}

function uniqueMatches(html: string, pattern: RegExp): string[] {
  return [...new Set([...html.matchAll(pattern)].flatMap((match) => match[1] ?? []))];
}

export async function inspectVideo(videoId: string): Promise<VideoInfo> {
  const html = await fetchText(`https://www.youtube.com/watch?v=${videoId}`);
  return {
    videoId,
    // Removed videos have an empty title.
    title:
      decodeEntities(/<meta name="title" content="([^"]*)"/.exec(html)?.[1] ?? "") ||
      "(no title: video removed?)",
    channel: /"ownerChannelName":"([^"]*)"/.exec(html)?.[1] ?? "?",
    playability: /"playabilityStatus":\{"status":"([A-Z_]+)"/.exec(html)?.[1] ?? "UNKNOWN",
    embeddable: html.includes('"playableInEmbed":true'),
    live: html.includes('"isLiveNow":true'),
  };
}

// Video ids on a channel's "Live" tab. Accepts a handle ("@SeeJamaica") or a
// channel id ("UC...").
export async function channelVideoIds(channel: string): Promise<string[]> {
  const path = channel.startsWith("@") ? channel : `channel/${channel}`;
  const html = await fetchText(`https://www.youtube.com/${path}/streams`);
  return uniqueMatches(html, /"watchEndpoint":\{"videoId":"([\w-]{11})"/g);
}

// Video ids from a YouTube search restricted to live broadcasts.
export async function searchLiveVideoIds(query: string): Promise<string[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgJAAQ%253D%253D`;
  return uniqueMatches(await fetchText(url), /"videoRenderer":\{"videoId":"([\w-]{11})"/g);
}
