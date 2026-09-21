import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteSavedView, loadSavedViews, saveView, startupView } from "./storage";
import { viewCode, type ViewState } from "./view";

const KEY = "ja-cctv:saved-views";
const kingston: ViewState = { mode: "cctv", cols: 0, feeds: ["hwt", "dvh", "kgh"], focus: "dvh" };
const coast: ViewState = { mode: "grid", cols: 2, feeds: ["kgh", "neg"], focus: null };

const names = () => loadSavedViews().map((saved) => saved.name);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saved views", () => {
  it("starts empty", () => {
    expect(loadSavedViews()).toEqual([]);
    expect(startupView()).toBeNull();
  });

  it("saves a view without its focused feed", () => {
    saveView(kingston, "Kingston");
    expect(loadSavedViews()[0]).toMatchObject({ code: viewCode(kingston), name: "Kingston" });
    expect(startupView()).toEqual({ ...kingston, focus: null });
  });

  it("updates an existing entry instead of duplicating it", () => {
    saveView(kingston, "Kingston");
    saveView({ ...kingston, focus: null }, "Kingston at night");
    expect(names()).toEqual(["Kingston at night"]);
  });

  it("names blank views after their code", () => {
    saveView(coast, "   ");
    expect(names()).toEqual([`View ${viewCode(coast)}`]);
  });

  it("opens the most recently saved view on startup", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    saveView(coast, "Coast");
    vi.setSystemTime(2_000);
    saveView(kingston, "Kingston");
    vi.setSystemTime(3_000);
    saveView(coast, "Coast again");
    expect(startupView()).toEqual(coast);
  });

  it("deletes by code", () => {
    saveView(kingston, "Kingston");
    saveView(coast, "Coast");
    deleteSavedView(viewCode(kingston));
    expect(names()).toEqual(["Coast"]);
  });

  it("ignores corrupt or unexpected data", () => {
    localStorage.setItem(KEY, "not json");
    expect(loadSavedViews()).toEqual([]);

    const valid = { code: "X", name: "Valid", encoded: "m=cctv&c=auto&f=hwt", savedAt: 5 };
    localStorage.setItem(KEY, JSON.stringify([{ code: 1 }, null, "text", valid]));
    expect(loadSavedViews()).toEqual([valid]);
  });
});
