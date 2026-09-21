import { describe, expect, it } from "vitest";
import { FEEDS } from "./feeds";

describe("feed catalog", () => {
  it("has unique ids", () => {
    const ids = FEEDS.map((feed) => feed.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Share links join ids with "." and "&", so ids must never contain them.
  it("uses ids that are safe inside share links", () => {
    for (const feed of FEEDS) expect(feed.id).toMatch(/^[a-z0-9]+$/);
  });

  it("credits every feed with https links", () => {
    for (const feed of FEEDS) {
      expect(feed.provider.url).toMatch(/^https:\/\//);
      expect(feed.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("uses well-formed YouTube video ids", () => {
    for (const { source } of FEEDS) {
      if (source.kind === "youtube") expect(source.videoId).toMatch(/^[\w-]{11}$/);
    }
  });
});
