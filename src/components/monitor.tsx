import type { Feed, FeedStatus } from "../feeds";
import { osdStamp, useNow } from "../lib/clock";
import { channelLabel } from "../lib/view";

function OsdClock() {
  const now = useNow();
  return <span className="tabular-nums">{osdStamp(now)}</span>;
}

// Screen texture layered over every CCTV picture: grain, scanlines, a rolling
// band, vignette and glass glare.
export function CrtLayers({ roll = false }: { roll?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="crt-grain absolute inset-0" />
      <div className="crt-scanlines absolute inset-0" />
      {roll && <div className="crt-roll absolute inset-0" />}
      <div className="crt-vignette absolute inset-0" />
      <div className="crt-glass absolute inset-0" />
    </div>
  );
}

// The DVR-style on-screen display in each corner of a monitor.
export function Osd({
  feed,
  channel,
  status,
}: {
  feed: Feed;
  channel: number;
  status: FeedStatus | "lost";
}) {
  return (
    <div aria-hidden className="osd pointer-events-none absolute inset-0">
      <span className="absolute top-[5%] left-[4%]">{channelLabel(channel)}</span>
      <span className="absolute top-[5%] right-[4%]">
        <OsdClock />
      </span>
      <span className="absolute bottom-[5%] left-[4%] max-w-[62%] truncate uppercase">
        {feed.name}
        <span className="block truncate opacity-70">{feed.parish}</span>
      </span>
      <span className="absolute right-[4%] bottom-[5%] flex items-center gap-[0.35em]">
        {status === "live" && (
          <>
            <span className="rec-dot" />
            REC
          </>
        )}
        {status === "connecting" && <span className="blink">SYNC</span>}
        {(status === "offline" || status === "lost") && (
          <span className="text-[#ff6b60]">LOSS</span>
        )}
      </span>
    </div>
  );
}

export function StaticScreen({
  label,
  detail,
  faint = false,
  drop = false,
}: {
  label: string;
  detail?: string;
  faint?: boolean;
  drop?: boolean;
}) {
  return (
    <div aria-hidden className={`absolute inset-0 ${drop ? "signal-drop" : ""}`}>
      <div className={`tv-static absolute inset-0 ${faint ? "tv-static-faint" : ""}`} />
      <div className="absolute inset-0 grid place-items-center">
        <div className="bg-black/70 px-[5%] py-[3%] text-center">
          <div className={`osd-banner ${faint ? "blink" : ""}`}>{label}</div>
          {detail && <div className="osd mt-[0.4em] opacity-80">{detail}</div>}
        </div>
      </div>
    </div>
  );
}

// Empty slots on the monitor wall: a channel with nothing patched in.
export function DeadMonitor({ channel, variant }: { channel: number; variant: "static" | "bars" }) {
  return (
    <div aria-hidden className="tile">
      <div className="crt-screen relative aspect-video overflow-hidden">
        {variant === "static" ? (
          <StaticScreen label="NO SIGNAL" detail={channelLabel(channel)} />
        ) : (
          <div className="absolute inset-0">
            <div className="color-bars absolute inset-x-0 top-0 h-[75%]" />
            <div className="color-bars-low absolute inset-x-0 bottom-0 h-[25%]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="osd-banner bg-black/75 px-[5%] py-[2%]">NO INPUT</div>
            </div>
            <span className="osd absolute top-[5%] left-[4%]">{channelLabel(channel)}</span>
          </div>
        )}
        <CrtLayers />
      </div>
    </div>
  );
}
