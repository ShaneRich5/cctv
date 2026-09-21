import { decodeView, encodeView, viewCode, type ViewState } from "./view";

export interface SavedView {
  code: string;
  name: string;
  // Stored in canonical encoded form so it goes through the same validation
  // as a share link when loaded.
  encoded: string;
  savedAt: number;
}

const KEY = "ja-cctv:saved-views";

export function loadSavedViews(): SavedView[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedView =>
        typeof item?.code === "string" &&
        typeof item?.name === "string" &&
        typeof item?.encoded === "string" &&
        typeof item?.savedAt === "number",
    );
  } catch {
    return [];
  }
}

function writeSavedViews(views: SavedView[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(views));
    return true;
  } catch {
    return false;
  }
}

// Saves (or renames) a view. Views are keyed by their code, so saving the same
// arrangement twice updates the existing entry instead of duplicating it.
export function saveView(view: ViewState, name: string): SavedView[] | null {
  const code = viewCode(view);
  const entry: SavedView = {
    code,
    name: name.trim() || `View ${code}`,
    encoded: encodeView({ ...view, focus: null }),
    savedAt: Date.now(),
  };
  const next = [entry, ...loadSavedViews().filter((saved) => saved.code !== code)];
  return writeSavedViews(next) ? next : null;
}

export function deleteSavedView(code: string): SavedView[] {
  const next = loadSavedViews().filter((saved) => saved.code !== code);
  writeSavedViews(next);
  return next;
}

export function savedViewState(saved: SavedView): ViewState | null {
  return decodeView(saved.encoded);
}

// The most recently saved view opens when the app is visited without a link.
export function startupView(): ViewState | null {
  const [latest] = loadSavedViews().sort((a, b) => b.savedAt - a.savedAt);
  return latest ? savedViewState(latest) : null;
}
