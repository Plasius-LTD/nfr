import { describe, it, expect, vi, beforeEach } from "vitest";
import { initPerformanceTracking } from "../src/performance/webVitals";

// Mock track function
const track = vi.fn();

// Keep references to created observers so tests can push entries later
const OBSERVERS: any[] = [];

// Mock PerformanceObserver with a registry
class PO {
  private cb: PerformanceObserverCallback;
  public types: Set<string> = new Set();
  constructor(cb: PerformanceObserverCallback) {
    this.cb = cb;
    OBSERVERS.push(this);
  }
  observe(opts: any) {
    if (opts && opts.type) this.types.add(opts.type);
  }
  disconnect() {}
  push(entries: PerformanceEntry[]) {
    const list = { getEntries: () => entries } as PerformanceObserverEntryList;
    this.cb(list, this as any);
  }
}

globalThis.PerformanceObserver = PO as any;

// Helper to craft navigation entry
function makeNav(): PerformanceNavigationTiming {
  return {
    name: "nav",
    entryType: "navigation",
    startTime: 0,
    duration: 0,
    type: "navigate",
    redirectCount: 0,
    unloadEventStart: 0,
    unloadEventEnd: 0,
    domInteractive: 120,
    domContentLoadedEventStart: 100,
    domContentLoadedEventEnd: 110,
    domComplete: 200,
    loadEventStart: 200,
    loadEventEnd: 210,
    responseStart: 50,
    responseEnd: 90,
    requestStart: 30,
    fetchStart: 10,
    domainLookupStart: 10,
    domainLookupEnd: 20,
    connectStart: 20,
    connectEnd: 25,
    secureConnectionStart: 22,
    transferSize: 1000,
    encodedBodySize: 800,
    decodedBodySize: 900,
    workerStart: 0,
    nextHopProtocol: "h2",
    redirectStart: 0,
    redirectEnd: 0,
    toJSON() {
      return this as any;
    },
  } as any;
}

// Helper to craft paint entries
function makePaint(name: string, time: number): PerformanceEntry {
  return {
    name,
    entryType: "paint",
    startTime: time,
    duration: 0,
    toJSON() {
      return this as any;
    },
  } as any;
}

// Stub performance.getEntriesByType
const getEntriesByType = vi.fn((type: string) => {
  if (type === "navigation") return [makeNav()];
  if (type === "paint")
    return [
      makePaint("first-paint", 40),
      makePaint("first-contentful-paint", 60),
    ];
  return [];
});

globalThis.performance = { getEntriesByType } as any;

// Stub location
globalThis.location = { href: "https://example.test/" } as any;

// Utility to set document.readyState (read-only) via defineProperty
function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => state,
  });
}

// Utility to push entries to observers by type
function pushTo(type: string, entries: PerformanceEntry[]) {
  OBSERVERS.filter((o) => o.types.has(type)).forEach((o) => o.push(entries));
}

describe("performance/webVitals", () => {
  beforeEach(() => {
    track.mockClear();
    getEntriesByType.mockClear();
    OBSERVERS.splice(0, OBSERVERS.length);
    // Reset memory/network on performance/navigator
    (globalThis as any).navigator = undefined;
    (globalThis.performance as any).memory = undefined;
    // Default readyState to "loading" so the load listener path is exercised unless tests change it
    setReadyState("loading");
  });

  it("reports navigation and paint timings on load (listener path)", () => {
    const teardown = initPerformanceTracking({ track, resourceSampleRate: 1 });

    // Trigger load event
    window.dispatchEvent(new Event("load"));

    expect(track).toHaveBeenCalled();
    const payloads = track.mock.calls.map(([arg]) => arg as any);
    const names = payloads.map((p) => p.name);
    expect(names).toContain("DOMContentLoaded");
    expect(names).toContain("first-paint");

    expect(() => teardown()).not.toThrow();
  });

  it("reports immediately when document is already complete (immediate path)", () => {
    setReadyState("complete");
    initPerformanceTracking({ track });
    // Without dispatching load, it should still report nav/paint via immediate branch
    const names = track.mock.calls.map(([arg]) => (arg as any).name);
    expect(names).toContain("DOMContentLoaded");
    expect(names).toContain("first-paint");
  });

  it("observes longtasks and resources, samples resources, and respects resourceFilter", () => {
    // Force sampling to always take
    const rand = Math.random;
    Math.random = () => 0;

    const teardown = initPerformanceTracking({
      track,
      resourceSampleRate: 1,
      resourceFilter: (e) => (e as any).initiatorType !== "img", // drop images
    });

    // Simulate a long task entry
    pushTo("longtask", [
      {
        name: "lt",
        entryType: "longtask",
        startTime: 500,
        duration: 120,
        toJSON() {
          return this as any;
        },
      } as any,
    ]);

    // Simulate resource entries (one img should be filtered, one script should pass)
    pushTo("resource", [
      {
        name: "https://cdn/img.png",
        entryType: "resource",
        initiatorType: "img",
        startTime: 10,
        duration: 30,
        toJSON() {
          return this as any;
        },
      } as any,
      {
        name: "https://cdn/app.js",
        entryType: "resource",
        initiatorType: "script",
        startTime: 20,
        duration: 50,
        toJSON() {
          return this as any;
        },
      } as any,
    ]);

    const events = track.mock.calls.map(([arg]) => arg as any);
    // Expect longtask event
    expect(
      events.some((e) => e.category === "longtask" && e.value === 120)
    ).toBe(true);
    // Expect only the script resource to be tracked
    const resourceUrls = events
      .filter((e) => e.category === "resource")
      .map((e) => e.url);
    expect(resourceUrls).toContain("https://cdn/app.js");
    expect(resourceUrls).not.toContain("https://cdn/img.png");

    Math.random = rand;
    teardown();
  });

  it("captures visibility (hidden, pagehide) and snapshots (network, memory)", () => {
    // Provide network + memory
    (globalThis as any).navigator = {
      connection: {
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
      },
    };
    (globalThis.performance as any).memory = {
      jsHeapSizeLimit: 1,
      totalJSHeapSize: 2,
      usedJSHeapSize: 1,
    };

    initPerformanceTracking({
      track,
      includeNetworkInfo: true,
      includeMemorySnapshot: true,
    });

    // visibilitychange -> hidden
    setReadyState("hidden" as any);
    document.dispatchEvent(new Event("visibilitychange"));
    // pagehide
    window.dispatchEvent(new Event("pagehide"));

    const cats = track.mock.calls.map(([arg]) => (arg as any).category);
    expect(cats).toContain("snapshot"); // network-info
    expect(cats.filter((c) => c === "snapshot").length).toBeGreaterThanOrEqual(
      2
    ); // includes memory
    expect(cats).toContain("visibility");
  });
});
