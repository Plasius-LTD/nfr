import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Import the analytics module under test
import * as analytics from "../src/telemetry/analytics";
import type { PerfEvent } from "../src/performance";

// Small utility to install a mock sink regardless of API shape
function installMockSink() {
  const calls: any[] = [];
  const sink = {
    track: vi.fn((evt: any) => void calls.push(evt)),
  };

  // prefer a configurator if exported
  const maybeSet =
    (analytics as any).setAnalyticsSink ||
    (analytics as any).configure ||
    (analytics as any).setSink;
  if (typeof maybeSet === "function") {
    maybeSet(sink);
    return { sink, calls } as const;
  }

  // else, try to replace an exported activeSink
  if (
    (analytics as any).activeSink &&
    typeof (analytics as any).activeSink === "object"
  ) {
    const original = (analytics as any).activeSink;
    (analytics as any).activeSink = sink;
    return {
      sink,
      calls,
      restore: () => ((analytics as any).activeSink = original),
    } as const;
  }

  // else, try to monkey-patch a non-exported module field via defineProperty if present
  try {
    Object.defineProperty(analytics as any, "activeSink", {
      configurable: true,
      get: () => sink,
    });
    return { sink, calls } as const;
  } catch {
    // final fallback: we can still spy on trackPerf and assert it doesn't throw
    return { sink, calls } as const;
  }
}

const FIXED_TIME = new Date("2024-01-02T03:04:05.678Z").getTime();

describe("analytics.trackPerf", () => {
  let restore: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
    if (restore) {
      try {
        restore();
      } catch {}
      restore = undefined;
    }
  });

  it("forwards perf events to the sink with name 'perf' and preserves provided ts", () => {
    const { sink, calls, restore: r } = installMockSink();
    restore = r;

    const payload: PerfEvent = {
      category: "web-vitals",
      name: "LCP",
      value: 1234.56,
      rating: "good",
      delta: 12.34,
      id: "v1",
      url: "https://example.test/",
      navigationType: "navigate",
      ts: 111111,
      details: { size: 123456 },
    };

    analytics.trackPerf(payload);

    expect(sink.track).toHaveBeenCalledTimes(1);
    const evt = calls[0];
    expect(evt.name).toBe("perf");
    expect(evt.ts).toBe(111111); // preserved
    expect(evt.props).toMatchObject({
      category: "web-vitals",
      name: "LCP",
      value: 1234.56,
      rating: "good",
      delta: 12.34,
      id: "v1",
      url: "https://example.test/",
      navigationType: "navigate",
      details: { size: 123456 },
    });
  });

  it("adds a timestamp if one is not provided", () => {
    const { sink, calls, restore: r } = installMockSink();
    restore = r;

    analytics.trackPerf({
      category: "paint",
      name: "first-contentful-paint",
      value: 250.1,
    });

    expect(sink.track).toHaveBeenCalledTimes(1);
    const evt = calls[0];
    expect(evt.name).toBe("perf");
    expect(evt.ts).toBe(FIXED_TIME); // generated from Date.now()
    expect(evt.props).toMatchObject({
      category: "paint",
      name: "first-contentful-paint",
      value: 250.1,
    });
  });

  it("handles diverse categories and minimal payloads", () => {
    const { sink, calls, restore: r } = installMockSink();
    restore = r;

    const categories: PerfEvent["category"][] = [
      "web-vitals",
      "nav-timing",
      "paint",
      "resource",
      "longtask",
      "visibility",
      "snapshot",
    ];

    categories.forEach((c, i) => {
      analytics.trackPerf({ category: c, name: `case-${i}` });
    });

    expect(sink.track).toHaveBeenCalledTimes(categories.length);
    categories.forEach((c, i) => {
      const evt = calls[i];
      expect(evt.name).toBe("perf");
      expect(evt.props.category).toBe(c);
      expect(evt.props.name).toBe(`case-${i}`);
      expect(typeof evt.ts).toBe("number");
    });
  });

  it("accepts large details objects without throwing", () => {
    const { sink, restore: r } = installMockSink();
    restore = r;

    const big = Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`k${i}`, i % 2 ? `v${i}` : i])
    );

    expect(() =>
      analytics.trackPerf({ category: "resource", name: "batch", details: big })
    ).not.toThrow();
    expect(sink.track).toHaveBeenCalledTimes(1);
  });
});
