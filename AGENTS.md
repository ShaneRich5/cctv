# AGENTS.md

Guidance for AI coding agents working in this repository. It's a static React site (no backend) showing public live cameras across Jamaica in a CCTV-style wall, deployed to GitHub Pages. See `README.md` for the full feature list.

## Commands

Node 24 (`.nvmrc`). Install with `npm ci`.

- `npm run dev`: dev server at http://localhost:5173/cctv/ (About page: `/cctv/about.html`)
- `npm run verify`: format check, lint, type-check, test and build, the same steps as CI. **Work isn't done until this passes.**
- `npm run format`: fix formatting. Prettier also formats `.md`, `.json` and `.yml`, and CI fails on unformatted files.
- `npm run lint` / `npm run lint:fix`, `npm run typecheck`, `npm test`
- Single test file: `npx vitest run src/lib/view.test.ts`. Single test by name: `npx vitest run -t "round-trips"`.
- `npm run check-feeds`: checks every feed is live and embeddable. It needs the network and isn't part of CI.
- `npm run list-streams`: lists the publishers' current YouTube streams and which feed uses each one. Use it to find replacement IDs.

## Architecture

- **Two pages, one Vite build.** `index.html` → `src/main.tsx` → `src/app.tsx` is the wall. `about.html` → `src/about.tsx` → `src/about-page.tsx` is the standalone About page. Vite's `base` is `/cctv/` (the GitHub Pages path), so internal links use `import.meta.env.BASE_URL`.
- **`src/feeds.ts` is the only feed catalog.** Source kinds are `youtube`, `iframe` and `image`. The About page's sources table is generated from it.
- **The view is the state.** `ViewState` (`src/lib/view.ts`) holds mode, columns, the ordered feed ids and the focused feed. `encodeView` produces the canonical URL hash (`m=cctv&c=auto&f=hwt.dvh&z=dvh`). `app.tsx` mirrors state into the hash with `history.replaceState` and follows `hashchange`. On startup: URL hash, then the most recently saved view, then `DEFAULT_VIEW`.
- **Saved views** (`src/lib/storage.ts`) live in localStorage under `ja-cctv:saved-views`, keyed by `viewCode`: an FNV-1a hash of the encoding, ignoring focus.
- **Feed status.** Every player reports `connecting`, `live` or `offline`, and tiles show static until `live`. YouTube players (`src/components/feed-player.tsx`) speak the IFrame API's postMessage protocol directly (a `listening` handshake, then `infoDelivery`, `onStateChange` and `onError` messages), with a 15-second fallback to `live`.
- **CCTV and grid modes render the same component tree.** Mode only swaps classes and overlays, so switching never remounts an iframe, which would reload the stream. In `src/components/wall.tsx`, keep the feed layer's position among the tile's children stable, and add overlays after it.
- **Styling** (`src/index.css`). Colour tokens (`--bg`, `--ink`, …) are swapped by `:root[data-mode="cctv"]` and exposed to Tailwind as `bg-bg`, `text-ink` and so on. CRT effect classes live in `@layer components`, so Tailwind utilities override them. Static and grain animate one canvas-generated noise image (`src/lib/noise.ts` sets `--noise`) by jumping `background-position`; there's no per-frame JavaScript.
- **Simulated faults are cosmetic.** Flicker and "SIGNAL LOST" drops come from `useSignalLoss` and `pickUnstable` in `src/lib/hooks.ts`, and are off for reduced motion and in grid mode. "FEED OFFLINE" must only ever mean a real stream error.
- **One shared clock** (`src/lib/clock.ts`, via `useSyncExternalStore`). Times display in `America/Jamaica`.

## Rules that aren't obvious

- **Feed `id`s are permanent.** They're written into share links and saved views. Never rename or reuse one, and keep them matching `/^[a-z0-9]+$/` (checked in `src/feeds.test.ts`).
- **Don't change `encodeView`'s format or the `viewCode` hash.** A pinned test ("matches a known fingerprint") guards them, because changing either orphans people's saved views and links.
- **Every feed must be public and embeddable, and credit its publisher** (`provider` and `sourceUrl`).
- **YouTube live stream IDs rotate** when a publisher restarts a stream. To fix an offline feed or add a camera, follow `.claude/skills/update-feeds/SKILL.md`.
- **The React Compiler is on**, so manual `useMemo`, `useCallback` and `memo` are rarely needed. ESLint runs the compiler rules (`eslint-plugin-react-hooks` v7).
- **Lint is strict.** typescript-eslint strict type-checked rules and jsx-a11y are on, and `noUncheckedIndexedAccess` is enabled in TypeScript.
- **File and folder names are kebab-case**, and lint enforces it. Tests sit beside the code as `*.test.ts`.
- **No UI tests exist.** For visual changes, check CCTV and Grid modes (`M` toggles) and a phone-width viewport in a browser.
