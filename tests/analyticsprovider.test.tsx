

import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

// Import the module and support multiple export styles
import * as ProviderMod from "../src/telemetry/AnalyticsProvider";
import { useAnalytics } from "../src/telemetry/AnalyticsProvider";

// Pick the provider component from various possible exports
const Provider: React.ComponentType<any> =
  (ProviderMod as any).AnalyticsProvider ||
  (ProviderMod as any).default ||
  (ProviderMod as any);

describe("AnalyticsProvider", () => {
  it("renders children without crashing", () => {
    expect(Provider).toBeTruthy();

    render(
      <Provider>
        <div data-testid="child">hello</div>
      </Provider>
    );

    expect(screen.getByTestId("child").textContent).toBe("hello");
  });

  it("accepts props transparently (smoke test)", () => {
    // If the provider accepts a `value` or `sink` prop, this should still render without throwing.
    render(
      <Provider value={{}} sink={{ track: () => {} }}>
        <span data-testid="ok">ok</span>
      </Provider>
    );
    expect(screen.getByTestId("ok")).toBeInTheDocument();
  });

  it("throws when the hook is used without a provider", () => {
    const OrphanConsumer = () => {
      useAnalytics();
      return null;
    };

    expect(() => render(<OrphanConsumer />)).toThrow(
      "useAnalytics must be used within AnalyticsProvider"
    );
  });
});
