import type { ReactNode } from "react";
import { FEEDS, PROVIDERS, type FeedSource } from "./feeds";

const APP_URL = import.meta.env.BASE_URL;
const REPO_URL = "https://github.com/ShaneRich5/cctv";

const SOURCE_TYPES: Record<FeedSource["kind"], string> = {
  youtube: "YouTube live",
  iframe: "EarthCam",
  image: "Satellite still",
};

const PROVIDER_NOTES: Record<string, string> = {
  "See Jamaica":
    "An independent network streaming public street views around the island 24/7 on YouTube. See seejm.com.",
  "See Jamaica Live":
    "See Jamaica's second YouTube channel, carrying more of its 24/7 street and harbour cameras.",
  "CocoLaPalm Seaside Resort / EarthCam":
    "A beach camera on Seven Mile Beach in Negril, which the resort publishes through EarthCam.",
  "NOAA / NESDIS STAR":
    "GOES-19 satellite imagery of the Caribbean from the US National Oceanic and Atmospheric Administration. It is a US government work in the public domain.",
};

export default function About() {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <span className="rec-dot text-sm" />
          <a
            href={APP_URL}
            className="font-mono text-sm font-semibold tracking-[0.25em] text-accent"
          >
            JA·CCTV
          </a>
          <a href={APP_URL} className="btn ml-auto">
            ← Back to the wall
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20">
        <section className="relative my-8 overflow-hidden border border-line bg-surface px-6 py-10 sm:px-10">
          <div
            aria-hidden
            className="crt-scanlines pointer-events-none absolute inset-0 opacity-60"
          />
          <p className="relative font-osd text-2xl tracking-widest text-muted">CAM 00 · ABOUT</p>
          <h1 className="relative mt-2 font-mono text-2xl font-semibold tracking-wider text-accent uppercase sm:text-3xl">
            About JA·CCTV
          </h1>
          <p className="relative mt-4 max-w-2xl text-lg leading-relaxed">
            A wall of public live cameras across Jamaica, from Half Way Tree to Negril, styled like
            the security consoles in old films. Switch to Grid mode to see the same feeds in plain
            colour.
          </p>
        </section>

        <Prose>
          <H2>Why it exists</H2>
          <p>
            JA·CCTV started in October 2025 as a quick page for watching Kingston street cameras
            while Hurricane Melissa crossed the island. It has since grown into a way to look in on
            Jamaica on any day: traffic at Half Way Tree, the waterfront in Kingston, Sam Sharpe
            Square in Montego Bay, the beach in Negril, and the weather overhead.
          </p>

          <H2>Where the feeds come from</H2>
          <p>
            Every feed is public, and each one is embedded straight from its publisher. JA·CCTV
            doesn't host, record, proxy or edit any video. The CCTV look is a filter your browser
            draws over the picture.
          </p>
          <ul className="my-4 space-y-3">
            {PROVIDERS.map((provider) => (
              <li key={provider.name} className="border-l-2 border-line pl-4">
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  {provider.name}
                </a>
                <p className="text-muted">{PROVIDER_NOTES[provider.name]}</p>
              </li>
            ))}
          </ul>
        </Prose>

        <div className="my-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">All feeds and their sources</caption>
            <thead className="bg-surface font-mono text-[11px] tracking-widest text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Feed</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Published by</th>
                <th className="px-3 py-2 font-medium">Original</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {FEEDS.map((feed) => (
                <tr key={feed.id}>
                  <td className="px-3 py-2 font-medium">{feed.name}</td>
                  <td className="px-3 py-2 text-muted">
                    {feed.place}, {feed.parish}
                  </td>
                  <td className="px-3 py-2 text-muted">{SOURCE_TYPES[feed.source.kind]}</td>
                  <td className="px-3 py-2 text-muted">{feed.provider.name}</td>
                  <td className="px-3 py-2">
                    <a
                      href={feed.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      Open ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Prose>
          <p>
            Live streams come and go. When a camera is down, its monitor shows{" "}
            <Osd>NO SIGNAL · FEED OFFLINE</Osd>. If it stays down for a while, the publisher has
            probably moved it to a new stream.
          </p>

          <H2>What's real and what's for show</H2>
          <p>The pictures are real and live. Some of the trouble on screen is put on for effect:</p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>the green tint, scanlines, grain and rolling bars;</li>
            <li>one or two monitors that flicker and jump;</li>
            <li>
              a monitor that drops to <Osd>SIGNAL LOST</Osd> for a few seconds every so often, while
              the stream keeps playing underneath;
            </li>
            <li>
              <Osd>NO SIGNAL</Osd> and <Osd>NO INPUT</Osd> screens that fill empty slots on the
              wall.
            </li>
          </ul>
          <p>
            <Osd>FEED OFFLINE</Osd> is never simulated: it means the stream really has errored or
            ended. Timestamps show Jamaica time (UTC−5). Grid mode, or the M key, turns all the
            effects off. If your device is set to reduce motion, the flicker and signal drops stay
            off in CCTV mode too.
          </p>

          <H2>Saving and sharing a view</H2>
          <p>
            A view is the feeds on your wall, their order, the column layout and the display mode.
            If a feed is open in focus, that is part of the view too.
          </p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>Share.</strong> The address bar always holds a link to exactly what's on
              screen, for example{" "}
              <code className="font-mono text-[0.85em] text-accent">
                #m=cctv&amp;c=3&amp;f=hwt.dvh.kgh
              </code>
              . The same view always gives the same link. The view code in the status bar (like{" "}
              <code className="font-mono text-[0.85em] text-accent">3F9A-C21B</code>) is a short
              fingerprint of it. Everything after the # stays in the browser and is never sent to a
              server.
            </li>
            <li>
              <strong>Save.</strong> Save / Share keeps named views in this browser's local storage.
              The most recently saved one opens automatically when you visit without a link. Nothing
              leaves your device.
            </li>
          </ul>

          <H2>Controls</H2>
          <dl className="my-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <Key k="Click or Enter">Open a feed in focus</Key>
            <Key k="← →">Previous or next feed while focused</Key>
            <Key k="Esc">Close the focus view or a panel</Key>
            <Key k="M">Switch between CCTV and Grid mode</Key>
          </dl>

          <H2>Privacy</H2>
          <p>
            This site has no accounts, cookies or analytics of its own. The embedded players come
            from their publishers: YouTube (in its privacy-enhanced mode), EarthCam and NOAA. Those
            services may collect data under their own policies. Fonts load from Google Fonts.
          </p>

          <H2>Not an official source</H2>
          <p>
            JA·CCTV is an independent project. It isn't affiliated with any of the publishers above
            or with any government CCTV programme. For weather warnings and emergency information,
            go to:
          </p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <Ext href="https://metservice.gov.jm/">Meteorological Service of Jamaica</Ext>{" "}
              (including its{" "}
              <Ext href="https://metservice.gov.jm/daily-forecast/radar/">weather radar</Ext>)
            </li>
            <li>
              <Ext href="https://www.odpem.org.jm/">ODPEM</Ext>, Jamaica's disaster preparedness
              office
            </li>
            <li>
              <Ext href="https://www.nhc.noaa.gov/">US National Hurricane Center</Ext>
            </li>
          </ul>

          <H2>Suggest a camera</H2>
          <p>
            Know of a public, embeddable camera in Jamaica that isn't here, or spotted one that has
            moved? The feed list is in{" "}
            <code className="font-mono text-[0.85em] text-accent">src/feeds.ts</code> in the{" "}
            <Ext href={REPO_URL}>GitHub repository</Ext>. Open an issue or a pull request.
          </p>
        </Prose>
      </main>
    </div>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl space-y-4 leading-relaxed text-ink/90">{children}</div>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-6 font-mono text-sm font-semibold tracking-[0.2em] text-accent uppercase">
      {children}
    </h2>
  );
}

function Osd({ children }: { children: ReactNode }) {
  return <span className="font-osd text-[1.15em] tracking-wider text-accent">{children}</span>;
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-accent underline underline-offset-2"
    >
      {children}
    </a>
  );
}

function Key({ k, children }: { k: string; children: ReactNode }) {
  return (
    <>
      <dt>
        <kbd className="border border-line bg-surface px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
      </dt>
      <dd className="text-muted">{children}</dd>
    </>
  );
}
