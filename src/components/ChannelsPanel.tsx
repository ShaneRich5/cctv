import { CATEGORY_LABELS, FEEDS, FEED_BY_ID, type Category, type Feed } from "../feeds";
import { DEFAULT_VIEW, channelLabel } from "../lib/view";
import { Drawer, Section } from "./Drawer";

interface ChannelsPanelProps {
  feeds: string[];
  onChange: (feeds: string[]) => void;
  onClose: () => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function ChannelsPanel({ feeds, onChange, onClose }: ChannelsPanelProps) {
  const onWall = feeds.flatMap((id) => FEED_BY_ID.get(id) ?? []);
  const available = FEEDS.filter((feed) => !feeds.includes(feed.id));

  const move = (index: number, delta: number) => {
    const next = [...feeds];
    const [id] = next.splice(index, 1);
    next.splice(index + delta, 0, id);
    onChange(next);
  };

  return (
    <Drawer
      title="Channels"
      subtitle={`${onWall.length} of ${FEEDS.length} feeds on the wall. New feeds are added to the end.`}
      onClose={onClose}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={() => onChange(DEFAULT_VIEW.feeds)}>
          All feeds
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onChange(FEEDS.filter((feed) => feed.category !== "weather").map((feed) => feed.id))}
        >
          Cameras only
        </button>
        <button type="button" className="btn" onClick={() => onChange([])}>
          Clear wall
        </button>
      </div>

      <Section title="On the wall">
        {onWall.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet. Add feeds below.</p>
        ) : (
          <ol className="divide-y divide-line rounded-md border border-line">
            {onWall.map((feed, index) => (
              <li key={feed.id} className="flex items-center gap-2 px-3 py-2">
                <span className="w-12 shrink-0 font-mono text-[11px] text-muted">{channelLabel(index + 1)}</span>
                <FeedLabel feed={feed} />
                <div className="flex shrink-0 gap-1">
                  <IconButton label={`Move ${feed.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                    ↑
                  </IconButton>
                  <IconButton
                    label={`Move ${feed.name} down`}
                    disabled={index === onWall.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    label={`Remove ${feed.name}`}
                    onClick={() => onChange(feeds.filter((id) => id !== feed.id))}
                  >
                    ✕
                  </IconButton>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {CATEGORIES.map((category) => {
        const list = available.filter((feed) => feed.category === category);
        if (list.length === 0) return null;
        return (
          <Section key={category} title={`Add · ${CATEGORY_LABELS[category]}`}>
            <ul className="divide-y divide-line rounded-md border border-line">
              {list.map((feed) => (
                <li key={feed.id} className="flex items-center gap-2 px-3 py-2">
                  <FeedLabel feed={feed} />
                  <IconButton label={`Add ${feed.name}`} onClick={() => onChange([...feeds, feed.id])}>
                    +
                  </IconButton>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </Drawer>
  );
}

function FeedLabel({ feed }: { feed: Feed }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-ink">{feed.name}</p>
      <p className="truncate text-xs text-muted">
        {feed.place}, {feed.parish} · {feed.provider.name}
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      className="btn size-8 justify-center px-0 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
