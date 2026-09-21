import { useCallback, useEffect, useMemo, useState } from "react";
import { ChannelsPanel } from "./components/ChannelsPanel";
import { Header, StatusBar, Toast } from "./components/Chrome";
import { FocusView } from "./components/FocusView";
import { ViewsPanel } from "./components/ViewsPanel";
import { Wall } from "./components/Wall";
import { FEED_BY_ID, type FeedStatus } from "./feeds";
import { copyText } from "./lib/clipboard";
import { pickUnstable, useReducedMotion, useSignalLoss, useViewportWidth } from "./lib/hooks";
import { deleteSavedView, loadSavedViews, saveView, startupView, type SavedView } from "./lib/storage";
import { DEFAULT_VIEW, decodeView, encodeView, sameView, shareUrl, viewCode, type ViewState } from "./lib/view";

type Panel = "channels" | "views" | null;

// A link wins, then the last view saved in this browser, then the default.
function initialView(): ViewState {
  return decodeView(window.location.hash) ?? startupView() ?? DEFAULT_VIEW;
}

export default function App() {
  const [view, setView] = useState<ViewState>(initialView);
  const [statuses, setStatuses] = useState<Record<string, FeedStatus>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [saved, setSaved] = useState<SavedView[]>(loadSavedViews);
  const [toast, setToast] = useState<string | null>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const width = useViewportWidth();
  const reducedMotion = useReducedMotion();

  const cctv = view.mode === "cctv";
  const focusIndex = view.focus ? view.feeds.indexOf(view.focus) : -1;
  const focusFeed = focusIndex >= 0 ? FEED_BY_ID.get(view.feeds[focusIndex]) : undefined;

  // The address bar always holds the share link for what's on screen.
  useEffect(() => {
    const hash = `#${encodeView(view)}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  }, [view]);

  // Follow share links pasted into this same tab.
  useEffect(() => {
    const onHashChange = () => {
      const next = decodeView(window.location.hash);
      if (next) setView((current) => (sameView(current, next) ? current : next));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = view.mode;
  }, [view.mode]);

  useEffect(() => {
    document.title = focusFeed ? `${focusFeed.name} · JA·CCTV` : "JA·CCTV · Public cameras across Jamaica";
  }, [focusFeed]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const hasFocus = view.focus !== null;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        if (panel) setPanel(null);
        else if (hasFocus) setView((current) => ({ ...current, focus: null }));
        return;
      }
      if (panel) return;
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable='true']")) return;

      if (hasFocus && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        setView((current) => stepFocus(current, event.key === "ArrowLeft" ? -1 : 1));
      } else if (event.key === "m" || event.key === "M") {
        setView((current) => ({ ...current, mode: current.mode === "cctv" ? "grid" : "cctv" }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, hasFocus]);

  const reportStatus = useCallback((id: string, status: FeedStatus) => {
    setStatuses((current) => (current[id] === status ? current : { ...current, [id]: status }));
  }, []);

  const liveIds = view.feeds.filter((id) => statuses[id] === "live");
  const signals = useSignalLoss(liveIds, cctv && !reducedMotion && !hasFocus && panel === null);
  const unstable = useMemo(() => pickUnstable(view.feeds, seed), [view.feeds, seed]);

  const counts = { live: 0, connecting: 0, offline: 0 };
  for (const id of view.feeds) counts[statuses[id] ?? "connecting"]++;

  const update = (patch: Partial<ViewState>) => setView((current) => ({ ...current, ...patch }));

  const copy = async (text: string, message: string) => {
    setToast((await copyText(text)) ? message : "Couldn't copy. Copy the link from the address bar.");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <Header
        view={view}
        onMode={(mode) => update({ mode })}
        onCols={(cols) => update({ cols })}
        onChannels={() => setPanel("channels")}
        onViews={() => setPanel("views")}
      />

      <main className="flex-1 p-3 sm:p-4">
        <Wall
          view={view}
          width={width}
          signals={signals}
          unstable={unstable}
          onOpen={(id) => update({ focus: id })}
          onStatus={reportStatus}
          onOpenChannels={() => setPanel("channels")}
        />
      </main>

      <StatusBar view={view} code={viewCode(view)} {...counts} />

      {focusFeed && (
        <FocusView
          feed={focusFeed}
          channel={focusIndex + 1}
          total={view.feeds.length}
          cctv={cctv}
          onPrev={() => setView((current) => stepFocus(current, -1))}
          onNext={() => setView((current) => stepFocus(current, 1))}
          onClose={() => update({ focus: null })}
          onShare={() => copy(shareUrl(view), "Link copied. It opens on this feed.")}
        />
      )}

      {panel === "channels" && (
        <ChannelsPanel feeds={view.feeds} onChange={(feeds) => update({ feeds })} onClose={() => setPanel(null)} />
      )}

      {panel === "views" && (
        <ViewsPanel
          view={view}
          saved={saved}
          onCopy={(url) => copy(url, "Share link copied")}
          onSave={(name) => {
            const next = saveView(view, name);
            if (next) setSaved(next);
            setToast(next ? "View saved to this browser" : "Couldn't save. Browser storage is unavailable.");
          }}
          onLoad={(state) => {
            setView(state);
            setPanel(null);
          }}
          onDelete={(code) => setSaved(deleteSavedView(code))}
          onReset={() => {
            setView(DEFAULT_VIEW);
            setPanel(null);
          }}
          onClose={() => setPanel(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

function stepFocus(view: ViewState, delta: number): ViewState {
  const index = view.focus ? view.feeds.indexOf(view.focus) : -1;
  if (index < 0) return view;
  const count = view.feeds.length;
  return { ...view, focus: view.feeds[(index + delta + count) % count] };
}
