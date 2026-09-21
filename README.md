# JA·CCTV

A wall of public live cameras across Jamaica, styled like the security monitors in an old heist film. It shows street corners in Kingston, Spanish Town, Montego Bay and Ocho Rios, the harbour, the beach in Negril, and satellite views of the weather overhead. Switch to Grid mode for a plain, full-colour view of the same feeds.

It started in October 2025 as a quick page for watching Kingston street cameras while Hurricane Melissa crossed the island, and grew into a way to look in on Jamaica on any day. Everything runs in the browser. There's no backend: each feed is embedded straight from its public publisher, and views are saved in the URL or in local storage.

**Live site:** https://shanerich5.github.io/cctv/

## Features

- **CCTV mode.** Green-tinted monitors with scanlines, grain and on-screen timestamps in Jamaica time. One or two screens flicker, a monitor occasionally drops to "SIGNAL LOST" for a few seconds, and empty slots show NO SIGNAL or NO INPUT screens.
- **Grid mode.** The same feeds in full colour with no effects. Press `M` to switch modes.
- **Focus view.** Click a feed to open it large. Use `←` / `→` to move between feeds and `Esc` to close.
- **Channels.** Add, remove and reorder the feeds on the wall, and pick a column layout.
- **Save and share.** The address bar always holds a link to the current view, and the same view always gives the same link. Views can also be saved in the browser.
- **Real status.** A YouTube feed only appears once its stream is actually playing, and shows `NO SIGNAL · FEED OFFLINE` if the stream has errored or ended.

A standalone About page (`about.html`) credits every source and explains which effects are simulated.

## Stack

| Area         | Tools                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App          | React 19 with the React Compiler, written in TypeScript                                                                                                           |
| Build        | Vite 7, producing two pages: the wall (`index.html`) and the About page (`about.html`)                                                                            |
| Styling      | Tailwind CSS 4, plus hand-written CSS for the CRT effects. Static and grain animate a single canvas-generated noise texture, with no per-frame JavaScript.        |
| Feeds        | YouTube embeds in privacy-enhanced mode (live status comes from the IFrame API's postMessage protocol), an EarthCam embed, and NOAA GOES-19 satellite images      |
| State        | URL hash for share links and `localStorage` for saved views. No backend.                                                                                          |
| Code quality | ESLint 9 (typescript-eslint strict type-checked rules, React Hooks and React Compiler rules, jsx-a11y, kebab-case filenames), Prettier 3, Vitest 5 with happy-dom |
| CI/CD        | Node 24, GitHub Actions, GitHub Pages                                                                                                                             |

## Running locally

You need Node 24, which is pinned in `.nvmrc`, and an internet connection, since every feed streams live from its publisher.

```sh
git clone https://github.com/ShaneRich5/cctv.git
cd cctv
nvm use       # switch to Node 24 (with nvm-windows: nvm use 24)
npm ci        # install the exact versions in package-lock.json
npm run dev
```

Then open http://localhost:5173/cctv/. The app lives under `/cctv/` because that's the path GitHub Pages serves it from, and http://localhost:5173/ redirects there. The About page is at http://localhost:5173/cctv/about.html.

To try the production build instead, run `npm run build && npm run preview` and open http://localhost:4173/cctv/.

Before pushing, run `npm run verify`. It runs the same checks as the pipeline, in the same order.

| Script                            | What it does                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Start the dev server with hot reload                                                                     |
| `npm run build` / `preview`       | Type-check and build both pages into `dist/`, then serve that build                                      |
| `npm run verify`                  | Format check, lint, type-check, test and build: everything the pipeline runs                             |
| `npm run format` / `format:check` | Prettier, including Tailwind class sorting                                                               |
| `npm run lint` / `lint:fix`       | ESLint: type-aware TypeScript, React Hooks and React Compiler rules, accessibility, kebab-case filenames |
| `npm run typecheck`               | `tsc -b` for the app and the Node tooling                                                                |
| `npm test` / `test:watch`         | Vitest unit tests                                                                                        |
| `npm run check-feeds`             | Check that every feed is still live and embeddable                                                       |

## Project structure

```
src/
  main.tsx, app.tsx           the wall: entry point and app state
  about.tsx, about-page.tsx   the standalone About page
  feeds.ts                    the feed catalog
  index.css                   theme colours and CRT effects
  components/                 wall, monitors, players, focus view, panels, header
  lib/                        share-link encoding, saved views, clock, hooks
scripts/check-feeds.ts        live-status check for every feed
.github/workflows/            the CI/CD pipeline
```

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
