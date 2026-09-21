import { useSyncExternalStore } from "react";

// One shared ticker for every on-screen clock, aligned to the second, so the
// OSD timestamps on all monitors change together.
const listeners = new Set<() => void>();
let now = Date.now();
let timer: number | undefined;

function schedule() {
  timer = window.setTimeout(() => {
    now = Date.now();
    listeners.forEach((listener) => listener());
    schedule();
  }, 1000 - (Date.now() % 1000));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    now = Date.now();
    schedule();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, () => now);
}

// Jamaica is UTC-5 all year (no daylight saving).
const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Jamaica",
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const numeric = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Jamaica",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pick(date: number) {
  const out: Record<string, string> = {};
  for (const part of parts.formatToParts(date)) out[part.type] = part.value;
  return out;
}

// "2026-09-21 23:14:07"
export function osdStamp(date: number): string {
  const p = pick(date);
  return `${numeric.format(date)} ${p.hour}:${p.minute}:${p.second}`;
}

// { date: "MON 21 SEP 2026", time: "23:14:07" }
export function consoleStamp(date: number) {
  const p = pick(date);
  return {
    date: `${p.weekday} ${p.day} ${p.month} ${p.year}`.toUpperCase(),
    time: `${p.hour}:${p.minute}:${p.second}`,
  };
}
