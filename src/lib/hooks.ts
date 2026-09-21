import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function useViewportWidth(): number {
  return useSyncExternalStore(subscribeResize, () => window.innerWidth);
}

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function subscribeReducedMotion(callback: () => void) {
  reducedMotionQuery.addEventListener("change", callback);
  return () => reducedMotionQuery.removeEventListener("change", callback);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, () => reducedMotionQuery.matches);
}

export type SignalEvent = "lost" | "recovering";

const NO_EVENTS: Record<string, SignalEvent> = {};
const random = (min: number, max: number) => min + Math.random() * (max - min);

// Simulated interference for the CCTV wall: every so often one monitor drops
// to "no signal" for a few seconds, then rolls back into picture. Purely
// cosmetic; the real feed keeps playing underneath.
export function useSignalLoss(ids: string[], enabled: boolean) {
  const [events, setEvents] = useState<Record<string, SignalEvent>>(NO_EVENTS);
  const key = ids.join(".");

  useEffect(() => {
    const candidates = key ? key.split(".") : [];
    if (!enabled || candidates.length < 3) return;

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    const clear = (id: string) =>
      setEvents((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

    const next = () =>
      later(() => {
        const id = candidates[Math.floor(Math.random() * candidates.length)];
        setEvents((current) => ({ ...current, [id]: "lost" }));
        later(() => {
          setEvents((current) => ({ ...current, [id]: "recovering" }));
          later(() => clear(id), 900);
        }, random(1800, 5200));
        next();
      }, random(7000, 17000));

    next();
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      setEvents(NO_EVENTS);
    };
  }, [key, enabled]);

  return enabled ? events : NO_EVENTS;
}

// Deterministic PRNG so a session's "bad" monitors stay the same while the
// wall re-renders.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Picks the one or two monitors that flicker and roll continuously.
export function pickUnstable(ids: string[], seed: number): Set<string> {
  const count = ids.length >= 10 ? 2 : ids.length >= 4 ? 1 : 0;
  const rand = mulberry32(seed);
  const pool = [...ids];
  const picked = new Set<string>();
  while (picked.size < count && pool.length) {
    picked.add(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return picked;
}
