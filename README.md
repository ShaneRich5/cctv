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

Requires Node 24 (pinned in `.nvmrc`, so `nvm use` picks it up).

```sh
npm install
npm run dev          # http://localhost:5173/cctv/
npm run verify       # everything the pipeline runs, in the same order
npm run check-feeds  # confirm every feed is still live and embeddable
```

| Script                            | What it does                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run format` / `format:check` | Prettier, including Tailwind class sorting                                                               |
| `npm run lint` / `lint:fix`       | ESLint: type-aware TypeScript, React Hooks and React Compiler rules, accessibility, kebab-case filenames |
| `npm run typecheck`               | `tsc -b` for the app and the Node tooling                                                                |
| `npm test` / `test:watch`         | Vitest unit tests                                                                                        |
| `npm run build`                   | Type-check and build both pages into `dist/`                                                             |

### Conventions

- File and folder names are kebab-case (`feed-player.tsx`, `view.test.ts`), and ESLint enforces it. Components keep PascalCase names in code.
- Tests live next to the code they cover, as `*.test.ts`.
- Prettier owns formatting; ESLint rules that would conflict with it are turned off.
- Line endings are LF everywhere (`.gitattributes`, `.editorconfig`).

## Pipeline

[`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) runs on every pull request and every push to `main`, using Node 24:

1. Check formatting, lint, type-check, test and build.
2. On `main` only, once all of those pass, deploy `dist/` to GitHub Pages.

A newer push cancels an older run of the same pull request. Deploys are never cancelled partway through.

`npm run check-feeds` isn't part of the pipeline, because it depends on third-party streams being up at that moment.

## Feeds

All feeds live in [`src/feeds.ts`](src/feeds.ts). Each entry needs a public, embeddable source and credit to its publisher. Supported source kinds:

| kind      | used for                                     |
| --------- | -------------------------------------------- |
| `youtube` | live streams (embedded via youtube-nocookie) |
| `iframe`  | publisher-provided embeds such as EarthCam   |
| `image`   | periodically refreshed stills (NOAA GOES)    |

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
