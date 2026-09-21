import { consoleStamp, useNow } from "../lib/clock";
import { COLUMN_CHOICES, type Columns, type Mode, type ViewState } from "../lib/view";

const ABOUT_URL = `${import.meta.env.BASE_URL}about.html`;

interface HeaderProps {
  view: ViewState;
  onMode: (mode: Mode) => void;
  onCols: (cols: Columns) => void;
  onChannels: () => void;
  onViews: () => void;
}

export function Header({ view, onMode, onCols, onChannels, onViews }: HeaderProps) {
  const cctv = view.mode === "cctv";
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          {cctv ? <span className="rec-dot text-sm" /> : <span className="size-2.5 rounded-full bg-red-500" />}
          <h1 className={cctv ? "font-mono text-sm font-semibold tracking-[0.25em] text-accent" : "font-semibold"}>
            JA·CCTV
          </h1>
          <span
            className={`hidden text-muted xl:inline ${cctv ? "font-mono text-[11px] uppercase tracking-widest" : "text-sm"}`}
          >
            {cctv ? "Public camera network // Jamaica" : "Public live cameras across Jamaica"}
          </span>
        </div>

        {cctv && <ConsoleClock />}

        <a className="btn ml-auto sm:hidden" href={ABOUT_URL}>
          About
        </a>

        <nav aria-label="View controls" className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <Segmented<Mode>
            label="Display mode"
            value={view.mode}
            onChange={onMode}
            options={[
              { value: "cctv", label: "CCTV" },
              { value: "grid", label: "Grid" },
            ]}
          />
          <Segmented<Columns>
            label="Columns"
            className="hidden lg:inline-flex"
            value={view.cols}
            onChange={onCols}
            options={COLUMN_CHOICES.map((cols) => ({ value: cols, label: cols ? `${cols}` : "Auto" }))}
          />
          <button type="button" className="btn" onClick={onChannels}>
            Channels <span className="text-muted">{view.feeds.length}</span>
          </button>
          <button type="button" className="btn" onClick={onViews}>
            <span className="sm:hidden">Share</span>
            <span className="hidden sm:inline">Save / Share</span>
          </button>
          <a className="btn hidden sm:inline-flex" href={ABOUT_URL}>
            About
          </a>
        </nav>
      </div>
    </header>
  );
}

function ConsoleClock() {
  const { date, time } = consoleStamp(useNow());
  return (
    <div className="hidden items-baseline gap-3 font-mono text-xs tracking-widest text-muted md:flex">
      <span>{date}</span>
      <span className="text-base font-medium tabular-nums text-accent [text-shadow:0_0_8px_rgb(125_255_160/0.45)]">
        {time}
      </span>
      <span>UTC−5 KINGSTON</span>
    </div>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`seg ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface StatusBarProps {
  view: ViewState;
  code: string;
  live: number;
  connecting: number;
  offline: number;
}

export function StatusBar({ view, code, live, connecting, offline }: StatusBarProps) {
  const cctv = view.mode === "cctv";
  return (
    <footer
      className={`flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-4 py-2 text-muted ${
        cctv ? "font-mono text-[11px] uppercase tracking-widest" : "text-xs"
      }`}
    >
      <span>
        <span className="text-accent">●</span> {live} live
      </span>
      {connecting > 0 && <span>◌ {connecting} connecting</span>}
      {offline > 0 && <span className="text-alert">✕ {offline} {cctv ? "no signal" : "offline"}</span>}
      <span>View {code}</span>
      <span className="ml-auto hidden md:inline">
        {cctv ? "Select a monitor to focus · M switches mode" : "Select a feed to focus · M switches mode"}
      </span>
      <a className="underline-offset-2 hover:text-accent hover:underline" href={ABOUT_URL}>
        Sources
      </a>
    </footer>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-12 z-[60] flex justify-center px-4">
      {message && (
        <div className="rounded-md border border-line bg-surface px-4 py-2 text-sm text-ink shadow-lg in-data-[mode=cctv]:font-mono in-data-[mode=cctv]:uppercase in-data-[mode=cctv]:tracking-wider">
          {message}
        </div>
      )}
    </div>
  );
}
