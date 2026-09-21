import { FEEDS, FEED_BY_ID } from "../feeds";

export type Mode = "cctv" | "grid";

// 0 means "auto": pick a column count from the number of feeds.
export const COLUMN_CHOICES = [0, 2, 3, 4, 5] as const;
export type Columns = (typeof COLUMN_CHOICES)[number];

export interface ViewState {
  mode: Mode;
  cols: Columns;
  // Ordered feed ids on the wall.
  feeds: string[];
  // Feed opened in the focus view, if any.
  focus: string | null;
}

export const DEFAULT_VIEW: ViewState = {
  mode: "cctv",
  cols: 0,
  feeds: FEEDS.map((feed) => feed.id),
  focus: null,
};

// Canonical form used for share links: fixed key order and no optional
// padding, so the same view always produces the same string.
// e.g. "m=cctv&c=auto&f=hwt.dvh.kgh&z=dvh"
export function encodeView(view: ViewState): string {
  const parts = [`m=${view.mode}`, `c=${view.cols || "auto"}`, `f=${view.feeds.join(".")}`];
  if (view.focus) parts.push(`z=${view.focus}`);
  return parts.join("&");
}

// Lenient parser: unknown feeds are dropped and bad values fall back to
// defaults, so old or hand-edited links still open something sensible.
export function decodeView(hash: string): ViewState | null {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;

  const params = new Map<string, string>();
  for (const part of raw.split("&")) {
    const eq = part.indexOf("=");
    if (eq > 0) params.set(part.slice(0, eq), safeDecode(part.slice(eq + 1)));
  }
  if (!params.has("m") && !params.has("f")) return null;

  const mode: Mode = params.get("m") === "grid" ? "grid" : "cctv";
  const colsValue = Number(params.get("c"));
  const cols = COLUMN_CHOICES.find((choice) => choice === colsValue) ?? 0;
  const feedParam = params.get("f");
  const feeds =
    feedParam === undefined
      ? DEFAULT_VIEW.feeds
      : [...new Set(feedParam.split("."))].filter((id) => FEED_BY_ID.has(id));
  const focusParam = params.get("z") ?? null;
  const focus = focusParam && feeds.includes(focusParam) ? focusParam : null;

  return { mode, cols, feeds, focus };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function sameView(a: ViewState, b: ViewState): boolean {
  return encodeView(a) === encodeView(b);
}

// Short fingerprint of a view (ignoring focus): FNV-1a over the canonical
// encoding, shown as "3F9A-C21B". Identical views always share a code, which
// is also how saved views are de-duplicated.
export function viewCode(view: ViewState): string {
  const text = encodeView({ ...view, focus: null });
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}

export function shareUrl(view: ViewState): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${encodeView(view)}`;
}

// Monitors are numbered by their position on the wall.
export const channelLabel = (channel: number) => `CAM ${String(channel).padStart(2, "0")}`;

// Column count actually used, given the choice, feed count and screen width.
export function effectiveColumns(cols: Columns, count: number, width: number, mode: Mode): number {
  const maxForWidth = width < 640 ? 1 : width < 1024 ? 2 : width < 1440 ? 4 : 5;
  const auto = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : count <= 16 ? 4 : 5;
  let result = Math.min(cols || auto, maxForWidth);
  // A monitor wall can have empty screens; a plain grid shouldn't.
  if (mode === "grid") result = Math.min(result, Math.max(count, 1));
  return Math.max(1, result);
}
