

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

// Mock the analytics module so we can assert on track calls
vi.mock("../src/telemetry/analytics", () => ({
  track: vi.fn(),
}));

import { track } from "../src/telemetry/analytics";
import { withInteractionTracking } from "../src/telemetry/withInteractionTracking";

const ButtonImpl = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function ButtonImpl(props, ref) {
    return (
      <button ref={ref} aria-label="Test Button" {...props}>
        {props.children ?? "Press"}
      </button>
    );
  }
);

const TrackedButton = withInteractionTracking(ButtonImpl, { origin: "spec" });

describe("withInteractionTracking HOC", () => {
  beforeEach(() => {
    (track as unknown as Mock).mockClear();
  });

  it("forwards refs through the HOC", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<TrackedButton ref={ref}>Go</TrackedButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("tracks pointer interactions (pointerup)", () => {
    render(<TrackedButton>Click</TrackedButton>);
    const btn = screen.getByRole("button", { name: /test button/i });

    fireEvent.pointerUp(btn);

    const calls = (track as unknown as Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [eventName, payload] = calls.at(-1) as [string, any];
    expect(eventName).toBe("ui.interaction");
    expect(payload).toMatchObject({ origin: "spec", type: "pointerup" });
  });

  it("tracks keyboard activation (Enter)", () => {
    render(<TrackedButton>Click</TrackedButton>);
    const btn = screen.getByRole("button", { name: /test button/i });

    fireEvent.keyDown(btn, { key: "Enter" });

    const calls = (track as unknown as Mock).mock.calls;
    const [eventName, payload] = calls.at(-1) as [string, any];
    expect(eventName).toBe("ui.interaction");
    expect(payload).toMatchObject({ type: "keydown", key: "Enter" });
  });
});