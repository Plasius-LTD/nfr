/*
 * Performance & Web Vitals tracking
 * ---------------------------------
 * A lightweight collector that wires up:
 *  - Core Web Vitals (LCP, INP, CLS, FCP, TTFB) via optional dynamic import of `web-vitals`
 *  - Long tasks via PerformanceObserver('longtask')
 *  - Navigation timing (TTFB, DOMContentLoaded, load, etc.)
 *  - Paint timings (FP, FCP fallback)
 *  - Resource timings (optionally sampled)
 *  - Visibility lifecycle (hidden, pagehide)
 *  - Network info (downlink, rtt, effectiveType) when available
 *  - Memory snapshot (JS heap) when available (Chromium only)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type VitalName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
export type PerfCategory =
  | "web-vitals"
  | "nav-timing"
  | "paint"
  | "resource"
  | "longtask"
  | "visibility"
  | "snapshot";

export type PerfEvent = {
  category: PerfCategory;
  name: string; // e.g., "LCP", "DOMContentLoaded", "resource:script"
  value?: number; // ms for most; CLS is unitless
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number; // for web-vitals deltas
  id?: string; // web-vitals id
  url?: string; // current page
  navigationType?: string; // navigate, reload, back_forward, prerender
  ts?: number; // epoch ms when measured
  details?: Record<string, any>;
};

export type PerfTracker = (event: PerfEvent) => void;

export type InitOptions = {
  track: PerfTracker;
  /** Sample a subset of resource entries to avoid high-volume beacons */
  resourceSampleRate?: number; // 0..1, default 0.25
  /** Predicate to include a resource entry */
  resourceFilter?: (e: PerformanceResourceTiming) => boolean;
  /** Include network information (effectiveType/downlink/rtt) snapshots */
  includeNetworkInfo?: boolean;
  /** Include JS heap memory snapshot where supported */
  includeMemorySnapshot?: boolean;
};

const now = () => Date.now();
const pageURL = () => (typeof location !== "undefined" ? location.href : undefined);
const navType = () => {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type ?? (performance as any).navigation?.type;
  } catch {
    return undefined;
  }
};

// ---------------------------------------------------------------------------
// Web Vitals (via optional dynamic import of `web-vitals`)
// ---------------------------------------------------------------------------
async function wireWebVitals(track: PerfTracker) {
  try {
    // @ts-ignore - optional dependency; we ignore TS resolution and rely on runtime try/catch
    const mod: any = await import(/* webpackChunkName: "web-vitals" */ "web-vitals");
    const handlers: [string, (onReport: any, opts?: any) => void, any?][] = [
      ["LCP", mod.onLCP],
      ["INP", mod.onINP],
      ["CLS", mod.onCLS],
      ["FCP", mod.onFCP],
      ["TTFB", mod.onTTFB],
    ];

    handlers.forEach(([name, fn]) => {
      if (typeof fn === "function") {
        fn((metric: any) => {
          const { value, rating, delta, id, navigationType: nt, attribution } = metric;
          track({
            category: "web-vitals",
            name,
            value,
            rating,
            delta,
            id,
            url: pageURL(),
            navigationType: nt ?? navType(),
            ts: now(),
            details: attribution ? { attribution } : undefined,
          });
        }, { reportAllChanges: true });
      }
    });
  } catch {
    // `web-vitals` not available — silently skip.
  }
}

// ---------------------------------------------------------------------------
// Navigation timing & paint timings
// ---------------------------------------------------------------------------
function reportNavigationTiming(track: PerfTracker) {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;
    const base = {
      category: "nav-timing" as const,
      url: pageURL(),
      navigationType: nav.type,
      ts: now(),
    };
    const push = (name: string, value: number | undefined, details?: any) => {
      if (value == null || Number.isNaN(value)) return;
      track({ ...base, name, value, details });
    };

    // Common derived timings (ms)
    push("TTFB", nav.responseStart);
    push("DNS", nav.domainLookupEnd - nav.domainLookupStart);
    push("TCP", nav.connectEnd - nav.connectStart);
    push("TLS", nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0);
    push("Request", nav.responseStart - nav.requestStart);
    push("Response", nav.responseEnd - nav.responseStart);
    push("DOMInteractive", nav.domInteractive);
    push("DOMComplete", nav.domComplete);
    push("DOMContentLoaded", nav.domContentLoadedEventEnd);
    push("LoadEvent", nav.loadEventEnd - nav.loadEventStart);
    push("FirstByteToInteractive", nav.domInteractive - nav.responseStart);
  } catch {
    // ignore
  }
}

function reportPaintTimings(track: PerfTracker) {
  try {
    const paints = performance.getEntriesByType("paint") as PerformanceEntry[];
    const base = { category: "paint" as const, url: pageURL(), navigationType: navType(), ts: now() };
    for (const p of paints) {
      track({ ...base, name: p.name, value: p.startTime });
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Long tasks
// ---------------------------------------------------------------------------
function observeLongTasks(track: PerfTracker): () => void {
  if (!("PerformanceObserver" in window)) return () => {};
  let obs: PerformanceObserver | undefined;
  try {
    obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const anyEntry: any = entry as any;
        track({
          category: "longtask",
          name: "longtask",
          value: entry.duration,
          ts: now(),
          url: pageURL(),
          details: {
            startTime: entry.startTime,
            duration: entry.duration,
            attribution: anyEntry.attribution ?? anyEntry.attribution ?? undefined,
          },
        });
      }
    });
    obs.observe({ type: "longtask", buffered: true as any });
  } catch {
    // ignore
  }
  return () => {
    try { obs?.disconnect(); } catch {}
  };
}

// ---------------------------------------------------------------------------
// Resource timings (sampled)
// ---------------------------------------------------------------------------
function observeResources(track: PerfTracker, sampleRate: number, filter?: (e: PerformanceResourceTiming) => boolean): () => void {
  if (!("PerformanceObserver" in window)) return () => {};
  const shouldSample = (Math.max(0, Math.min(1, sampleRate)) || 0.25);
  const take = () => Math.random() < shouldSample;
  let obs: PerformanceObserver | undefined;

  const toEvent = (e: PerformanceResourceTiming): PerfEvent => ({
    category: "resource",
    name: `resource:${e.initiatorType || "other"}`,
    url: e.name,
    ts: now(),
    value: e.duration,
    details: {
      startTime: e.startTime,
      transferSize: (e as any).transferSize,
      encodedBodySize: (e as any).encodedBodySize,
      decodedBodySize: (e as any).decodedBodySize,
      nextHopProtocol: (e as any).nextHopProtocol,
      initiatorType: e.initiatorType,
    },
  });

  try {
    obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (filter && !filter(entry)) continue;
        if (!take()) continue;
        track(toEvent(entry));
      }
    });
    obs.observe({ type: "resource", buffered: true as any });
  } catch {
    // ignore
  }
  return () => { try { obs?.disconnect(); } catch {} };
}

// ---------------------------------------------------------------------------
// Visibility & lifecycle
// ---------------------------------------------------------------------------
function wireVisibility(track: PerfTracker): () => void {
  const onHidden = (type: string) => () => {
    track({ category: "visibility", name: type, ts: now(), url: pageURL() });
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHidden("hidden")();
  });
  window.addEventListener("pagehide", onHidden("pagehide"));
  return () => {
    document.removeEventListener("visibilitychange", onHidden("hidden"));
    window.removeEventListener("pagehide", onHidden("pagehide"));
  };
}

// ---------------------------------------------------------------------------
// Snapshots: Network / Memory
// ---------------------------------------------------------------------------
function snapshotNetwork(track: PerfTracker) {
  const nav: any = (navigator as any);
  const c = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
  if (!c) return;
  track({
    category: "snapshot",
    name: "network-info",
    ts: now(),
    url: pageURL(),
    details: {
      effectiveType: c.effectiveType,
      downlink: c.downlink,
      rtt: c.rtt,
      saveData: c.saveData,
    },
  });
}

function snapshotMemory(track: PerfTracker) {
  const mem: any = (performance as any).memory;
  if (!mem) return;
  track({
    category: "snapshot",
    name: "js-heap",
    ts: now(),
    url: pageURL(),
    details: {
      jsHeapSizeLimit: mem.jsHeapSizeLimit,
      totalJSHeapSize: mem.totalJSHeapSize,
      usedJSHeapSize: mem.usedJSHeapSize,
    },
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function initPerformanceTracking(opts: InitOptions): () => void {
  const {
    track,
    resourceSampleRate = 0.25,
    resourceFilter,
    includeNetworkInfo = true,
    includeMemorySnapshot = false,
  } = opts;

  // Web Vitals (async)
  void wireWebVitals(track);

  // Navigation & paints (buffered entries are available after DOM ready)
  if (document.readyState === "complete") {
    reportNavigationTiming(track);
    reportPaintTimings(track);
  } else {
    window.addEventListener("load", () => {
      reportNavigationTiming(track);
      reportPaintTimings(track);
    }, { once: true });
  }

  // Observers
  const offLong = observeLongTasks(track);
  const offRes = observeResources(track, resourceSampleRate, resourceFilter);
  const offVis = wireVisibility(track);

  // Snapshots
  if (includeNetworkInfo) snapshotNetwork(track);
  if (includeMemorySnapshot) snapshotMemory(track);

  // Teardown
  return () => {
    offLong();
    offRes();
    offVis();
  };
}

export default {
  initPerformanceTracking,
};
