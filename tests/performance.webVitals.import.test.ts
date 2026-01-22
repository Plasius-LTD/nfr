import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const FIXED_TIME = new Date("2024-04-05T06:07:08.000Z").getTime();
const originalPerformance = globalThis.performance;
const originalPerformanceObserver = (globalThis as any).PerformanceObserver;
const originalReadyState = Object.getOwnPropertyDescriptor(document, "readyState");

const setReadyState = (state: DocumentReadyState) => {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => state,
  });
};

describe("performance/webVitals optional pieces", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(Date, "now").mockReturnValue(FIXED_TIME);
  });

  afterEach(() => {
    vi.resetModules();
    vi.unmock("web-vitals");
    if (originalReadyState) {
      Object.defineProperty(document, "readyState", originalReadyState);
    }
    globalThis.performance = originalPerformance as any;
    (globalThis as any).PerformanceObserver = originalPerformanceObserver;
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("emits web-vitals metrics when the optional dependency is available", async () => {
    vi.useFakeTimers();
    setReadyState("complete");
    const getEntriesByType = vi.fn((type: string) => {
      if (type === "navigation") {
        return [
          {
            type: "reload",
            responseStart: 10,
            domainLookupStart: 1,
            domainLookupEnd: 2,
            connectStart: 2,
            connectEnd: 3,
            secureConnectionStart: 0,
            requestStart: 4,
            responseEnd: 12,
            domInteractive: 20,
            domComplete: 30,
            domContentLoadedEventEnd: 18,
            loadEventStart: 30,
            loadEventEnd: 32,
          } as any,
        ];
      }
      if (type === "paint") {
        return [
          {
            name: "first-contentful-paint",
            entryType: "paint",
            startTime: 15,
            duration: 0,
            toJSON() {
              return this as any;
            },
          } as any,
        ];
      }
      return [];
    });
    globalThis.performance = { getEntriesByType } as any;
    (globalThis as any).PerformanceObserver = class {
      observe() {}
      disconnect() {}
    } as any;

    vi.mock(
      "web-vitals",
      () => ({
        onLCP: (cb: any) =>
          cb({
            value: 123,
            rating: "good",
            delta: 1,
            id: "lcp-1",
            navigationType: "navigate",
            attribution: { element: "img" },
          }),
        onINP: (cb: any) =>
          cb({
            value: 250,
            rating: "needs-improvement",
            delta: 10,
            id: "inp-1",
          }),
        onCLS: (cb: any) =>
          cb({
            value: 0.02,
            rating: "good",
            delta: 0,
            id: "cls-1",
            navigationType: undefined,
          }),
        onFCP: (cb: any) =>
          cb({ value: 45, rating: "good", delta: 0, id: "fcp-1" }),
        onTTFB: (cb: any) =>
          cb({ value: 5, rating: "good", delta: 0, id: "ttfb-1" }),
      }),
      { virtual: true }
    );
    const mod = await import("web-vitals");
    expect(mod.onLCP).toBeTypeOf("function");

    const track = vi.fn();
    const { initPerformanceTracking } = await import("../src/performance/webVitals");
    const teardown = initPerformanceTracking({
      track,
      resourceSampleRate: 0,
      includeNetworkInfo: false,
      includeMemorySnapshot: false,
    });

    await vi.waitFor(() => {
      const events = track.mock.calls.map(([arg]) => arg as any);
      const webVitalNames = events
        .filter((e) => e.category === "web-vitals")
        .map((e) => e.name);
      expect(webVitalNames).toEqual(
        expect.arrayContaining(["LCP", "INP", "CLS", "FCP", "TTFB"])
      );
      expect(events.some((e) => e.category === "nav-timing")).toBe(true);
      expect(events.some((e) => e.category === "paint")).toBe(true);
    });

    teardown();
  });

  it("tolerates navigation timing failures while still reporting paints", async () => {
    setReadyState("complete");
    const getEntriesByType = vi.fn((type: string) => {
      if (type === "navigation") throw new Error("nav boom");
      if (type === "paint") {
        return [
          {
            name: "first-paint",
            entryType: "paint",
            startTime: 12,
            duration: 0,
            toJSON() {
              return this as any;
            },
          } as any,
        ];
      }
      return [];
    });
    globalThis.performance = { getEntriesByType } as any;
    (globalThis as any).PerformanceObserver = class {
      observe() {}
      disconnect() {}
    } as any;

    const track = vi.fn();
    const { initPerformanceTracking } = await import("../src/performance/webVitals");
    const teardown = initPerformanceTracking({
      track,
      resourceSampleRate: 0,
      includeNetworkInfo: false,
      includeMemorySnapshot: false,
    });

    expect(() => teardown()).not.toThrow();
    expect(
      track.mock.calls.some(([e]) => (e as any).category === "paint")
    ).toBe(true);
  });

  it("flushes web-vitals callbacks when timers are advanced", async () => {
    vi.useFakeTimers();
    setReadyState("complete");
    const getEntriesByType = vi.fn((type: string) => {
      if (type === "navigation") {
        return [
          {
            type: "navigate",
            responseStart: 1,
            domainLookupStart: 0,
            domainLookupEnd: 0,
            connectStart: 0,
            connectEnd: 0,
            secureConnectionStart: 0,
            requestStart: 0,
            responseEnd: 1,
            domInteractive: 2,
            domComplete: 3,
            domContentLoadedEventEnd: 2,
            loadEventStart: 3,
            loadEventEnd: 4,
          } as any,
        ];
      }
      return [];
    });
    globalThis.performance = { getEntriesByType } as any;
    (globalThis as any).PerformanceObserver = class {
      observe() {}
      disconnect() {}
    } as any;

    vi.mock(
      "web-vitals",
      () => ({
        onLCP: (cb: any) => setTimeout(() => cb({ value: 1, rating: "good" }), 5),
        onINP: (cb: any) => setTimeout(() => cb({ value: 2, rating: "good" }), 5),
        onCLS: (cb: any) => setTimeout(() => cb({ value: 3, rating: "good" }), 5),
        onFCP: (cb: any) => setTimeout(() => cb({ value: 4, rating: "good" }), 5),
        onTTFB: (cb: any) => setTimeout(() => cb({ value: 5, rating: "good" }), 5),
      }),
      { virtual: true }
    );

    const track = vi.fn();
    const { initPerformanceTracking } = await import("../src/performance/webVitals");
    const teardown = initPerformanceTracking({
      track,
      resourceSampleRate: 0,
      includeNetworkInfo: false,
      includeMemorySnapshot: false,
    });

    await teardown.ready;
    await vi.runAllTimersAsync();

    const vitalNames = track.mock.calls
      .map(([arg]) => arg as any)
      .filter((e) => e.category === "web-vitals")
      .map((e) => e.name);
    expect(vitalNames).toEqual(
      expect.arrayContaining(["LCP", "INP", "CLS", "FCP", "TTFB"])
    );
  });
});
