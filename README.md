# JA·CCTV

A wall of public live cameras across Jamaica, styled like an old CCTV control room.

It started as a page for watching Kingston street cameras during Hurricane Melissa (October 2025). It now covers street, coast and weather feeds from Half Way Tree to Negril.

## Features

- **CCTV mode.** Green-tinted monitors with scanlines, grain, OSD timestamps in Jamaica time, one or two flickering screens, occasional simulated signal drops, and NO SIGNAL / NO INPUT screens in empty slots.
- **Grid mode.** The same feeds in full colour with no effects. Press `M` to switch modes.
- **Focus view.** Click a monitor to open it large. Use `←` / `→` to move between feeds and `Esc` to close.
- **Channels.** Add, remove and reorder the feeds on the wall, and pick a column layout.
- **Save and share.** The URL hash always encodes the current view, and the same view always gives the same URL. Views can also be saved to `localStorage`.
- **Real status.** YouTube tiles only show the picture once the stream is playing. They show `NO SIGNAL · FEED OFFLINE` if the stream has errored or ended.

The standalone About page (`about.html`) lists every source and explains what is simulated.

## Development

```sh
npm install
npm run dev          # http://localhost:5173/cctv/
npm run build        # type-check and build both pages into dist/
npm run lint
npm run check-feeds  # confirm every feed is still live and embeddable
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Feeds

All feeds live in [`src/feeds.ts`](src/feeds.ts). Each entry needs a public, embeddable source and credit to its publisher. Supported source kinds:

| kind      | used for                                   |
| --------- | ------------------------------------------ |
| `youtube` | live streams (embedded via youtube-nocookie) |
| `iframe`  | publisher-provided embeds such as EarthCam |
| `image`   | periodically refreshed stills (NOAA GOES)  |

Feed `id`s are written into share links and saved views. Never rename or reuse one; give a new feed a new id. YouTube live stream IDs change when a publisher restarts a stream. When a monitor stays on NO SIGNAL, run `npm run check-feeds` and update the `videoId` from the publisher's streams page.

## View links

```
/cctv/#m=cctv&c=auto&f=hwt.dvh.kgh&z=dvh
        │      │      │             └ feed open in focus (optional)
        │      │      └ feeds on the wall, in order
        │      └ columns: auto, 2, 3, 4 or 5
        └ mode: cctv or grid
```

The view code in the status bar (for example `A2B5-6D97`) is an FNV-1a hash of this string, not counting focus. Saved views are keyed by it, so saving the same arrangement twice doesn't create a duplicate.
