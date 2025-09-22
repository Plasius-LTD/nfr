

import { describe, it, expect } from "vitest";
import * as perf from "../src/performance";

describe("performance barrel", () => {
  it("exposes expected members", () => {
    expect(perf).toBeTruthy();
    expect(Object.keys(perf).length).toBeGreaterThan(0);
  });
});