import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, type Feed, type FeedStatus } from "../feeds";
import { channelLabel } from "../lib/view";
import { FeedPlayer } from "./FeedPlayer";
import { CrtLayers, Osd, StaticScreen } from "./Monitor";

interface FocusViewProps {
  feed: Feed;
  channel: number;
  total: number;
  cctv: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onShare: () => void;
}

export function FocusView({ feed, channel, total, cctv, onPrev, onNext, onClose, onShare }: FocusViewProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const currentId = useRef(feed.id);

  useEffect(() => {
    currentId.current = feed.id;
  }, [feed.id]);

  // Take focus while open. On close, hand it to the wall tile of the feed
  // that was last on screen (which may not be the one originally clicked).
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
      const tile = document.querySelector<HTMLElement>(`[data-feed="${currentId.current}"]`);
      (tile ?? previous)?.focus();
    };
  }, []);

  const multiple = total > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${feed.name} feed`}
      className={`fixed inset-0 z-40 flex flex-col ${cctv ? "bg-bg" : "bg-black/90 text-white backdrop-blur-sm"}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className={`truncate ${cctv ? "font-mono text-sm uppercase tracking-wider text-accent" : "font-medium"}`}>
            {cctv && <span className="mr-2 text-muted">{channelLabel(channel)}</span>}
            {feed.name}
          </p>
          <p className={`truncate text-xs ${cctv ? "font-mono uppercase tracking-wider text-muted" : "text-white/60"}`}>
            {feed.place}, {feed.parish} · {CATEGORY_LABELS[feed.category]} · via{" "}
            <a href={feed.provider.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-accent">
              {feed.provider.name}
            </a>
          </p>
        </div>
        <button type="button" className="btn" onClick={onShare}>
          Share
        </button>
        <a className="btn hidden sm:inline-flex" href={feed.sourceUrl} target="_blank" rel="noreferrer">
          Source ↗
        </a>
        <button ref={closeButton} type="button" className="btn" onClick={onClose} aria-label="Close focus view">
          ✕<span className="hidden sm:inline">Close</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20">
        {multiple && (
          <SideButton direction="prev" onClick={onPrev} cctv={cctv} />
        )}
        <div className="w-full" style={{ maxWidth: "calc((100dvh - 8.5rem) * 16 / 9)" }}>
          <FocusScreen key={feed.id} feed={feed} channel={channel} cctv={cctv} />
        </div>
        {multiple && (
          <SideButton direction="next" onClick={onNext} cctv={cctv} />
        )}
      </div>

      <div
        className={`flex items-center justify-center gap-3 px-4 py-3 text-xs ${
          cctv ? "font-mono uppercase tracking-wider text-muted" : "text-white/60"
        }`}
      >
        {multiple && (
          <button type="button" className="btn sm:hidden" onClick={onPrev} aria-label="Previous feed">
            ‹
          </button>
        )}
        <span className="tabular-nums">
          {String(channel).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="hidden sm:inline">· ← → switch feeds · Esc to close</span>
        {multiple && (
          <button type="button" className="btn sm:hidden" onClick={onNext} aria-label="Next feed">
            ›
          </button>
        )}
      </div>
    </div>
  );
}

function SideButton({ direction, onClick, cctv }: { direction: "prev" | "next"; onClick: () => void; cctv: boolean }) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Previous feed" : "Next feed"}
      className={`absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center text-2xl sm:grid ${
        prev ? "left-4" : "right-4"
      } ${
        cctv
          ? "border border-line bg-surface font-mono text-accent hover:bg-raised"
          : "rounded-full bg-white/10 text-white hover:bg-white/20"
      } cursor-pointer focus-visible:outline-2 focus-visible:outline-accent`}
    >
      {prev ? "‹" : "›"}
    </button>
  );
}

// Keyed by feed id, so switching feeds starts a fresh player and replays the
// channel-change static.
function FocusScreen({ feed, channel, cctv }: { feed: Feed; channel: number; cctv: boolean }) {
  const [status, setStatus] = useState<FeedStatus>("connecting");

  return (
    <div className="tile relative">
      <div
        className={`relative aspect-video overflow-hidden ${cctv ? "crt-screen" : "rounded-xl bg-black"}`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            status === "live" ? "opacity-100" : "opacity-0"
          } ${cctv ? "cctv-feed" : ""}`}
        >
          <FeedPlayer feed={feed} interactive onStatus={setStatus} />
        </div>
        {cctv && status === "connecting" && <StaticScreen label="ACQUIRING" faint />}
        {cctv && status === "offline" && <StaticScreen label="NO SIGNAL" detail="FEED OFFLINE" />}
        {cctv && <CrtLayers />}
        {cctv && <Osd feed={feed} channel={channel} status={status} />}
        {cctv && (
          <div aria-hidden className="switch-burst pointer-events-none absolute inset-0">
            <div className="tv-static absolute inset-0" />
          </div>
        )}
        {!cctv && status === "connecting" && (
          <div className="absolute inset-0 grid animate-pulse place-items-center text-sm text-white/60">
            Connecting…
          </div>
        )}
        {!cctv && status === "offline" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/70">
            <p>
              This feed is offline right now.{" "}
              <a className="underline" href={feed.sourceUrl} target="_blank" rel="noreferrer">
                Check the source
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
