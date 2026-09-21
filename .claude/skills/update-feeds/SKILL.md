---
name: update-feeds
description: Fix, add or retire the live camera feeds in this repo (the catalog in src/feeds.ts). Use this whenever a monitor shows NO SIGNAL or "feed offline", `npm run check-feeds` reports a failure, a YouTube stream looks dead or replaced, or someone wants to add, find, swap or remove a public camera, webcam or weather feed for Jamaica, even if they only say something like "the Half Way Tree cam is down" or "can we get a camera in Port Antonio?".
---

# Updating feeds

Every monitor on the wall comes from one catalog, `src/feeds.ts`. Feeds usually break in one way: a publisher restarts a YouTube live stream, which gives it a new video ID, and the old ID becomes a dead embed. So most of this work is finding the new ID. Occasionally it's adding or retiring a camera.

## Ground rules, and why

- **Never change a feed's `id`.** Ids are written into people's share links and saved views (`#…&f=hwt.dvh…`). Fix a feed by changing its `source`, not its id. A new camera gets a new id. Never reuse a retired id, or old links would silently show a different camera. Ids must match `^[a-z0-9]+$`; a test enforces this.
- **Only public, embeddable sources, from the original publisher.** Aggregator sites (livebeaches, webcamtaxi, skylinewebcams…) are fine for _discovering_ cameras, but embed the publisher's own stream. Skip anything that needs an API key or a login. Also skip TV channels and music streams labelled "live" (for example "Negril TV 24/7" on the See Jamaica channel) and looping drone footage. They aren't cameras.
- **Credit the publisher.** Set `provider` (a name and public page) and `sourceUrl` (the specific stream or page). The About page builds its sources table from these.
- **Keep status honest.** A camera that's really down should look down. Don't fill the slot with a different camera under the old name.

## Tools

- `npm run check-feeds` checks every feed. YouTube feeds must be playable, embeddable and live; other feeds must respond.
- `npm run list-streams` lists every stream on the YouTube channels the catalog already uses, live ones first. The `feed:` column shows which feed, if any, uses each video. It can also look elsewhere:
  - `npm run list-streams -- @SomeChannel` for other channels (handle or `UC…` id)
  - `npm run list-streams -- --search "ocho rios live cam"` for YouTube search, live broadcasts only
  - `npm run list-streams -- <videoId> …` to check specific videos

Both read public YouTube pages. If YouTube changes its markup or asks for a sign-in (common from cloud and CI machines), their results can be wrong. When something looks off, open the watch page to confirm.

## Fixing an offline feed

1. Run `npm run check-feeds` and read the reason next to each failure:
   - `not playable (…)` or `not live right now`: the stream ended or was replaced. This is the usual case.
   - `embedding disabled`: the publisher blocked embeds. Find another stream or retire the feed.
   - An HTTP error on an `image` or `iframe` feed: open the URL in a browser. Product paths occasionally change.
2. Run `npm run list-streams` and look for a live, embeddable stream showing `feed:-` whose title matches the camera. Publishers keep titles like "Half Way Tree Clock LIVE 24/7" when they restart a stream. Cameras also move between sister channels: See Jamaica runs both `@SeeJamaica` and `@SeeJamaicaLive`.
3. In `src/feeds.ts`, change only that feed's `videoId`, plus `provider` if the channel changed. The `youtube()` helper derives `sourceUrl`.
4. If no replacement is live, say so and leave the feed alone unless asked to remove it. The monitor will honestly show NO SIGNAL · FEED OFFLINE, and streams often come back.

## Adding a feed

1. Find a candidate with `npm run list-streams -- --search "<town> jamaica live"`, from the publishers already in the catalog, or on aggregator sites that name the publisher.
2. Pick the source kind. In order of preference:
   - `youtube` is best, because the app detects live and offline status from the player. The stream must be live and embeddable.
   - `iframe` is for an embed page the publisher provides for embedding (like EarthCam's `?embed` URL). Check framing isn't blocked: `curl -sI <url>` should show no `X-Frame-Options` and no restrictive `frame-ancestors` in a CSP header. Then confirm it plays in the app. An iframe counts as live once the page loads, so outages won't show.
   - `image` is for a still that is updated in place at a stable URL, like NOAA's fixed-size GOES images. Set `refreshSeconds` to roughly how often it updates, and use `tileTransform` to crop wide imagery onto Jamaica for wall tiles.
3. Add the entry to `FEEDS`. Its position is its position on the default wall.
   - `id`: new, short, lowercase letters and digits. Make sure it has never been used: `git log -S'id: "abc"' -- src/feeds.ts` should print nothing.
   - `name`: what the camera shows ("Sam Sharpe Square"). `place`: the town or district.
   - `parish`: one of Jamaica's 14 (Kingston, St Andrew, St Thomas, Portland, St Mary, St Ann, Trelawny, St James, Hanover, Westmoreland, St Elizabeth, Manchester, Clarendon, St Catherine), written without a full stop after "St".
   - `category`: `street`, `coast` or `weather`.
   - `provider`: reuse the existing constant when the publisher is already in the catalog. A new provider needs a `name`, a public `url` and a one-sentence `note`, which the About page shows.

## Retiring a feed

Delete the entry, and don't reuse its id. Old share links keep working, because unknown ids are dropped when a link is read; they just show one fewer monitor.

## Already explored

These looked promising but don't work, so skip them unless something has changed:

- **Meteorological Service of Jamaica radar.** Each frame gets a new, timestamped filename, so there's no stable URL to embed. The About page links to it instead.
- **Windy webcams.** Their API needs a key, which can't be kept secret on a static site.

## Before you finish

- Run `npm run verify`. It includes `src/feeds.test.ts`, which checks for unique, URL-safe ids, https links and well-formed video ids.
- Run `npm run check-feeds`. Everything you touched should pass.
- If you can open a browser, run `npm run dev`, open http://localhost:5173/cctv/, and check that the tile goes live in both CCTV and Grid mode (press M) and that the name fits the on-screen label.
- In your summary, list each feed you changed with its old and new video ID, or its new source, so the change is easy to review.
