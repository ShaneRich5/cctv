import { useState } from "react";
import { savedViewState, type SavedView } from "../lib/storage";
import { shareUrl, viewCode, type ViewState } from "../lib/view";
import { Drawer, Section } from "./Drawer";

interface ViewsPanelProps {
  view: ViewState;
  saved: SavedView[];
  onSave: (name: string) => void;
  onLoad: (view: ViewState) => void;
  onDelete: (code: string) => void;
  onCopy: (text: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const savedDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function ViewsPanel({ view, saved, onSave, onLoad, onDelete, onCopy, onReset, onClose }: ViewsPanelProps) {
  const code = viewCode(view);
  const url = shareUrl({ ...view, focus: null });
  const current = saved.find((entry) => entry.code === code);
  const [name, setName] = useState(current?.name ?? "");
  const canNativeShare = typeof navigator.share === "function";

  return (
    <Drawer title="Save & share" subtitle={`Current view · ${code}`} onClose={onClose}>
      <Section title="Share link">
        <p className="mb-2 text-sm text-muted">
          The link spells out this exact wall: feeds, order, layout and mode. The same view always gives the same
          link, and nothing is stored on a server.
        </p>
        <div className="flex gap-2">
          <input
            className="field min-w-0 flex-1"
            readOnly
            value={url}
            aria-label="Share link"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button type="button" className="btn btn-primary" onClick={() => onCopy(url)}>
            Copy
          </button>
        </div>
        {canNativeShare && (
          <button
            type="button"
            className="btn mt-2"
            onClick={() => navigator.share({ title: "JA·CCTV view", url }).catch(() => {})}
          >
            Share…
          </button>
        )}
      </Section>

      <Section title="Save to this browser">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(name);
          }}
        >
          <input
            className="field min-w-0 flex-1"
            value={name}
            maxLength={60}
            placeholder={`View ${code}`}
            aria-label="View name"
            onChange={(event) => setName(event.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            {current ? "Update" : "Save"}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Saved views stay in this browser's local storage. The most recently saved one opens automatically when you
          visit without a link.
        </p>
      </Section>

      <Section title={`Saved views (${saved.length})`}>
        {saved.length === 0 ? (
          <p className="text-sm text-muted">No saved views yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line">
            {saved.map((entry) => {
              const state = savedViewState(entry);
              const isCurrent = entry.code === code;
              return (
                <li key={entry.code} className="flex items-center gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {entry.name}
                      {isCurrent && <span className="ml-2 text-xs font-normal text-accent">current</span>}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {entry.code} · {state?.feeds.length ?? 0} feeds · {state?.mode === "grid" ? "Grid" : "CCTV"} ·{" "}
                      {savedDate.format(entry.savedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    disabled={!state || isCurrent}
                    onClick={() => state && onLoad(state)}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="btn"
                    aria-label={`Delete ${entry.name}`}
                    title="Delete"
                    onClick={() => onDelete(entry.code)}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <button type="button" className="btn" onClick={onReset}>
        Reset to default view
      </button>
    </Drawer>
  );
}
