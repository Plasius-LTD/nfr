import { describe, it, expect } from "vitest";
import * as root from "../src";

describe("root index", () => {
  it("exports something", () => {
    expect(root).toBeTruthy();
    expect(Object.keys(root).length).toBeGreaterThan(0);
  });
});
