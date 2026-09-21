import { describe, expect, it } from "vitest";
import {
  DEFAULT_VIEW,
  decodeView,
  effectiveColumns,
  encodeView,
  shareUrl,
  viewCode,
  type ViewState,
} from "./view";

const sample: ViewState = { mode: "grid", cols: 3, feeds: ["kgh", "hwt", "neg"], focus: "hwt" };

describe("encodeView", () => {
  it("writes keys in a fixed order", () => {
    expect(encodeView(sample)).toBe("m=grid&c=3&f=kgh.hwt.neg&z=hwt");
  });

  it("spells out auto columns and omits focus when nothing is focused", () => {
    expect(encodeView({ ...sample, cols: 0, focus: null })).toBe("m=grid&c=auto&f=kgh.hwt.neg");
  });
});

describe("decodeView", () => {
  it("round-trips encoded views", () => {
    expect(decodeView(`#${encodeView(sample)}`)).toEqual(sample);
    expect(decodeView(encodeView(DEFAULT_VIEW))).toEqual(DEFAULT_VIEW);
  });

  it("ignores hashes that aren't views", () => {
    expect(decodeView("")).toBeNull();
    expect(decodeView("#")).toBeNull();
    expect(decodeView("#section-2")).toBeNull();
  });

  it("drops unknown and duplicate feeds", () => {
    expect(decodeView("#m=cctv&c=auto&f=hwt.nope.hwt.kgh")?.feeds).toEqual(["hwt", "kgh"]);
  });

  it("falls back to defaults for invalid values", () => {
    expect(decodeView("#m=tv&c=9&f=hwt&z=kgh")).toEqual({
      mode: "cctv",
      cols: 0,
      feeds: ["hwt"],
      focus: null,
    });
  });

  it("uses the default feeds when the list is missing, but keeps an empty wall", () => {
    expect(decodeView("#m=grid")?.feeds).toEqual(DEFAULT_VIEW.feeds);
    expect(decodeView("#m=cctv&c=auto&f=")?.feeds).toEqual([]);
  });
});

describe("viewCode", () => {
  it("is stable and ignores focus", () => {
    expect(viewCode(sample)).toBe(viewCode({ ...sample, focus: null }));
    expect(viewCode(sample)).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("changes with feed order", () => {
    expect(viewCode(sample)).not.toBe(viewCode({ ...sample, feeds: ["hwt", "kgh", "neg"] }));
  });

  // Saved views are keyed by this code; changing the hash would orphan them.
  it("matches a known fingerprint", () => {
    const feeds = "hwt.hwc.dvh.bbc.kgh.dtk.spt.ocr.mbj.scz.llw.neg".split(".");
    expect(viewCode({ mode: "cctv", cols: 0, feeds, focus: null })).toBe("A2B5-6D97");
  });
});

describe("shareUrl", () => {
  it("puts the view in the hash of the current page", () => {
    expect(shareUrl(sample)).toBe("http://localhost:5173/cctv/#m=grid&c=3&f=kgh.hwt.neg&z=hwt");
  });
});

describe("effectiveColumns", () => {
  it("picks a roughly square layout automatically", () => {
    expect(effectiveColumns(0, 4, 1920, "cctv")).toBe(2);
    expect(effectiveColumns(0, 9, 1920, "cctv")).toBe(3);
    expect(effectiveColumns(0, 14, 1920, "cctv")).toBe(4);
  });

  it("caps columns on narrow screens", () => {
    expect(effectiveColumns(5, 14, 390, "cctv")).toBe(1);
    expect(effectiveColumns(5, 14, 800, "grid")).toBe(2);
  });

  it("leaves empty monitors in CCTV mode but not in grid mode", () => {
    expect(effectiveColumns(4, 2, 1920, "cctv")).toBe(4);
    expect(effectiveColumns(4, 2, 1920, "grid")).toBe(2);
  });
});
