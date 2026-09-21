import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Feed, FeedSource, FeedStatus } from "../feeds";

type SetStatus = Dispatch<SetStateAction<FeedStatus>>;

interface PlayerProps {
  feed: Feed;
  // Wall tiles are passive (no controls, cropped imagery); the focus view is
  // interactive.
  interactive?: boolean;
  onStatus: SetStatus;
}

export function FeedPlayer({ feed, interactive = false, onStatus }: PlayerProps) {
  const title = `${feed.name}, ${feed.parish}`;
  const { source } = feed;
  switch (source.kind) {
    case "youtube":
      return (
        <YouTubePlayer
          videoId={source.videoId}
          title={title}
          interactive={interactive}
          onStatus={onStatus}
        />
      );
    case "image":
      return (
        <ImagePlayer source={source} title={title} interactive={interactive} onStatus={onStatus} />
      );
    case "iframe":
      return (
        <iframe
          src={source.url}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen"
          loading="lazy"
          tabIndex={interactive ? 0 : -1}
          onLoad={() => onStatus("live")}
        />
      );
  }
}

const YOUTUBE_ORIGINS = new Set(["https://www.youtube-nocookie.com", "https://www.youtube.com"]);

// YouTube player states from the IFrame API.
const PLAYING = 1;
const ENDED = 0;

function YouTubePlayer({
  videoId,
  title,
  interactive,
  onStatus,
}: {
  videoId: string;
  title: string;
  interactive: boolean;
  onStatus: SetStatus;
}) {
  const frame = useRef<HTMLIFrameElement>(null);

  // Speaks the IFrame API's postMessage protocol directly (no API script) so a
  // tile only reveals the picture once the stream is actually playing, and
  // shows "no signal" when the stream errors or has ended.
  useEffect(() => {
    let heard = false;
    const send = (message: object) =>
      frame.current?.contentWindow?.postMessage(
        JSON.stringify({ ...message, id: videoId, channel: "widget" }),
        "*",
      );
    const applyState = (state: unknown) => {
      if (state === PLAYING) onStatus("live");
      else if (state === ENDED) onStatus("offline");
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (!YOUTUBE_ORIGINS.has(event.origin)) return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!heard) {
        heard = true;
        send({ event: "command", func: "addEventListener", args: ["onStateChange"] });
        send({ event: "command", func: "addEventListener", args: ["onError"] });
      }
      if (data.event === "onError") onStatus("offline");
      else if (data.event === "onStateChange") applyState(data.info);
      else if (data.event === "initialDelivery" || data.event === "infoDelivery") {
        const info = data.info as { playerState?: number } | null;
        applyState(info?.playerState);
      }
    };

    window.addEventListener("message", onMessage);
    const handshake = window.setInterval(() => {
      if (heard) window.clearInterval(handshake);
      else send({ event: "listening" });
    }, 400);
    // If the player never reports back, show whatever it is displaying.
    const fallback = window.setTimeout(
      () => onStatus((status) => (status === "connecting" ? "live" : status)),
      15000,
    );

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(handshake);
      window.clearTimeout(fallback);
    };
  }, [videoId, onStatus]);

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
    controls: interactive ? "1" : "0",
    disablekb: interactive ? "0" : "1",
    fs: interactive ? "1" : "0",
    enablejsapi: "1",
    origin: window.location.origin,
  });

  return (
    <iframe
      ref={frame}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
      title={title}
      className="yt-frame absolute inset-0 h-full w-full border-0"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      tabIndex={interactive ? 0 : -1}
      allowFullScreen={interactive}
    />
  );
}

function ImagePlayer({
  source,
  title,
  interactive,
  onStatus,
}: {
  source: Extract<FeedSource, { kind: "image" }>;
  title: string;
  interactive: boolean;
  onStatus: SetStatus;
}) {
  const period = source.refreshSeconds * 1000;
  const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / period));

  // Re-request the still whenever a new refresh window starts.
  useEffect(() => {
    const timer = window.setInterval(() => setEpoch(Math.floor(Date.now() / period)), 30_000);
    return () => window.clearInterval(timer);
  }, [period]);

  return (
    <img
      src={`${source.url}?t=${epoch}`}
      alt={title}
      draggable={false}
      className={`absolute inset-0 h-full w-full ${interactive ? "object-contain" : "object-cover"}`}
      style={interactive ? undefined : { transform: source.tileTransform }}
      onLoad={() => onStatus("live")}
      onError={() => onStatus("offline")}
    />
  );
}
