import { useEffect, useState, type CSSProperties } from "react";
import { FEED_BY_ID, type Feed, type FeedStatus } from "../feeds";
import type { SignalEvent } from "../lib/hooks";
import { effectiveColumns, type ViewState } from "../lib/view";
import { FeedPlayer } from "./feed-player";
import { CrtLayers, DeadMonitor, Osd, StaticScreen } from "./monitor";

interface WallProps {
  view: ViewState;
  width: number;
  signals: Record<string, SignalEvent>;
  unstable: Set<string>;
  onOpen: (id: string) => void;
  onStatus: (id: string, status: FeedStatus) => void;
  onOpenChannels: () => void;
}

export function Wall({
  view,
  width,
  signals,
  unstable,
  onOpen,
  onStatus,
  onOpenChannels,
}: WallProps) {
  const feeds = view.feeds.flatMap((id) => FEED_BY_ID.get(id) ?? []);
  const cctv = view.mode === "cctv";

  if (feeds.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className={cctv ? "osd-banner" : "text-lg font-medium"}>
          {cctv ? "NO FEEDS PATCHED" : "No feeds on the wall"}
        </p>
        <p className="text-sm text-muted">Pick some cameras to start watching.</p>
        <button type="button" className="btn btn-primary" onClick={onOpenChannels}>
          Choose feeds
        </button>
      </div>
    );
  }

  const cols = effectiveColumns(view.cols, feeds.length, width, view.mode);
  const rows = Math.ceil(feeds.length / cols);
  const empty = cctv ? rows * cols - feeds.length : 0;
  const style = { "--cols": cols, "--rows": rows } as CSSProperties;

  return (
    <div className={`wall mx-auto grid ${cctv ? "wall-fit" : "gap-x-4 gap-y-6"}`} style={style}>
      {feeds.map((feed, index) => (
        <FeedTile
          key={feed.id}
          feed={feed}
          channel={index + 1}
          cctv={cctv}
          unstable={unstable.has(feed.id)}
          signal={signals[feed.id]}
          onOpen={onOpen}
          onStatus={onStatus}
        />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <DeadMonitor
          key={`empty-${i}`}
          channel={feeds.length + i + 1}
          variant={i % 2 === 0 ? "static" : "bars"}
        />
      ))}
    </div>
  );
}

interface TileProps {
  feed: Feed;
  channel: number;
  cctv: boolean;
  unstable: boolean;
  signal: SignalEvent | undefined;
  onOpen: (id: string) => void;
  onStatus: (id: string, status: FeedStatus) => void;
}

// The element structure stays identical in both modes so switching modes never
// remounts (and reloads) the player.
function FeedTile({ feed, channel, cctv, unstable, signal, onOpen, onStatus }: TileProps) {
  const [status, setStatus] = useState<FeedStatus>("connecting");

  useEffect(() => {
    onStatus(feed.id, status);
  }, [feed.id, status, onStatus]);

  const lost = cctv && status === "live" && signal === "lost";
  const tileClass = [
    "tile group relative",
    cctv && unstable ? "crt-unstable" : "",
    cctv && signal === "recovering" ? "resync" : "",
  ].join(" ");

  return (
    <div className={tileClass}>
      <div
        className={`relative aspect-video overflow-hidden ${
          cctv ? "crt-screen" : "rounded-lg bg-black ring-1 ring-line"
        }`}
      >
        <div
          className={`feed-layer absolute inset-0 transition-opacity duration-700 ${
            status === "live" ? "opacity-100" : "opacity-0"
          } ${cctv ? "cctv-feed" : ""}`}
        >
          <div className="feed-inner absolute inset-0">
            <FeedPlayer feed={feed} onStatus={setStatus} />
          </div>
        </div>

        {cctv && status === "connecting" && <StaticScreen label="ACQUIRING" faint />}
        {cctv && status === "offline" && <StaticScreen label="NO SIGNAL" detail="FEED OFFLINE" />}
        {lost && <StaticScreen label="SIGNAL LOST" detail="RECONNECTING" drop />}
        {cctv && <CrtLayers roll={unstable} />}
        {cctv && <Osd feed={feed} channel={channel} status={lost ? "lost" : status} />}

        {!cctv && status === "connecting" && (
          <div className="absolute inset-0 grid animate-pulse place-items-center bg-raised text-sm text-muted">
            Connecting…
          </div>
        )}
        {!cctv && status === "offline" && (
          <div className="absolute inset-0 grid place-items-center bg-raised p-4 text-center text-sm text-muted">
            This feed is offline right now.
          </div>
        )}
        {!cctv && status === "live" && feed.category !== "weather" && (
          <span className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
            <span className="size-1.5 rounded-full bg-red-500" />
            LIVE
          </span>
        )}
      </div>

      {!cctv && (
        <div className="px-0.5 pt-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="truncate text-sm font-medium group-hover:text-accent">{feed.name}</h2>
            <span className="shrink-0 text-xs text-muted">{feed.parish}</span>
          </div>
          <p className="truncate text-xs text-muted">
            {feed.place} · {feed.provider.name}
          </p>
        </div>
      )}

      <button
        type="button"
        className={`absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
          cctv ? "rounded-[6px] hover:shadow-[inset_0_0_0_2px_var(--accent)]" : "rounded-lg"
        }`}
        aria-label={`Open ${feed.name}, ${feed.parish}`}
        data-feed={feed.id}
        onClick={() => onOpen(feed.id)}
      />
    </div>
  );
}
