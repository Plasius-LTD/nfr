// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("analytics production sink SSR safety", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("falls back to a safe sink when window is missing in production", async () => {
    const analytics = await import("../src/telemetry/analytics");
    expect(() => analytics.track("event-in-prod-ssr")).not.toThrow();
  });
});
