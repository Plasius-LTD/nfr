import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const FIXED_TIME = new Date("2024-05-06T07:08:09.000Z").getTime();
const ORIGINAL_ENV = process.env.NODE_ENV;
let originalDataLayer: any;

describe("analytics sinks", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
    originalDataLayer = (window as any).dataLayer;
    delete (window as any).dataLayer;
  });

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_ENV;
    vi.useRealTimers();
    vi.resetModules();
    if (originalDataLayer === undefined) {
      delete (window as any).dataLayer;
    } else {
      (window as any).dataLayer = originalDataLayer;
    }
  });

  it("pushes events to dataLayer in production when window is present", async () => {
    process.env.NODE_ENV = "production";

    const analytics = await import("../src/telemetry/analytics");

    analytics.track("purchase", { total: 42 });
    analytics.page("Checkout", { step: "confirm" });

    const dl = (window as any).dataLayer;
    expect(dl).toBeDefined();
    expect(dl).toHaveLength(2);
    expect(dl[0]).toMatchObject({
      event: "purchase",
      total: 42,
      ts: FIXED_TIME,
    });
    expect(dl[1]).toMatchObject({
      event: "page_view",
      page: "Checkout",
      step: "confirm",
    });
  });

  it("allows swapping sinks and still routes track/page", async () => {
    const analytics = await import("../src/telemetry/analytics");

    const trackSpy = vi.fn();
    const pageSpy = vi.fn();
    analytics.setAnalyticsSink({ track: trackSpy, page: pageSpy });

    analytics.track("custom", { a: 1 });
    analytics.page("Landing", { b: 2 });

    expect(trackSpy).toHaveBeenCalledWith({
      name: "custom",
      props: { a: 1 },
      ts: FIXED_TIME,
    });
    expect(pageSpy).toHaveBeenCalledWith("Landing", { b: 2 });
  });
});
