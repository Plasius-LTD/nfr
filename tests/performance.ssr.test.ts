// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

describe("performance tracking SSR safety", () => {
  it("no-ops when called without a DOM", async () => {
    const { initPerformanceTracking } = await import("../src/performance/webVitals");

    const track = vi.fn();
    expect(() => initPerformanceTracking({ track })).not.toThrow();
    const teardown = initPerformanceTracking({ track });
    expect(typeof teardown).toBe("function");
    expect(() => teardown()).not.toThrow();
  });
});
