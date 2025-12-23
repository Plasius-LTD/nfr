import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  AnalyticsProvider,
  useAnalytics,
} from "../src/telemetry/AnalyticsProvider";

const Consumer: React.FC<{ onValue: (v: any) => void }> = ({ onValue }) => {
  onValue(useAnalytics());
  return null;
};

describe("AnalyticsProvider value passthrough", () => {
  it("honors a custom value prop", () => {
    const custom = { track: vi.fn(), page: vi.fn() };
    const onValue = vi.fn();

    render(
      <AnalyticsProvider value={custom as any}>
        <Consumer onValue={onValue} />
      </AnalyticsProvider>
    );

    const ctx = onValue.mock.calls[0][0];
    expect(ctx.track).toBeDefined();
    expect(ctx.track).toBe(custom.track);
  });
});
