// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import vm from "node:vm";

const ORIGINAL_CONSTANTS = vm.constants;

describe("vm-constants setup shim", () => {
  beforeEach(() => {
    // Reset module cache so the setup file re-runs each test
    vi.resetModules();
  });

  afterEach(() => {
    vm.constants = ORIGINAL_CONSTANTS;
  });

  it("adds DONT_CONTEXTIFY when missing while preserving existing keys", async () => {
    vm.constants = { FOO: "bar" } as any;

    await import("./vm-constants.ts");

    expect(vm.constants).toHaveProperty("FOO", "bar");
    expect(vm.constants).toHaveProperty("DONT_CONTEXTIFY");
    expect(typeof vm.constants.DONT_CONTEXTIFY).toBe("object");
  });

  it("does not overwrite an existing DONT_CONTEXTIFY", async () => {
    const existing = { already: true };
    vm.constants = { DONT_CONTEXTIFY: existing } as any;

    await import("./vm-constants.ts");

    expect(vm.constants.DONT_CONTEXTIFY).toBe(existing);
  });
});
