import { describe, it, expect } from "vitest";
import * as telemetry from "../src/telemetry";

describe("telemetry barrel", () => {
  it("exposes expected members", () => {
    expect(telemetry).toBeTruthy();
    expect(Object.keys(telemetry).length).toBeGreaterThan(0);
  });
});
