import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineSemanticJourneyCatalog } from "@plasius/analytics";
import { installUsefulMetricCollectors } from "../src/index.js";

let dispose: (() => void) | undefined;
let visible = true;
const state = (show: boolean) => {
  visible = show;
  document.dispatchEvent(new Event("visibilitychange"));
};
beforeEach(() => {
  vi.useFakeTimers(); visible = true;
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visible ? "visible" : "hidden");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  Object.defineProperty(performance, "getEntriesByType", { configurable: true,
    value: vi.fn(() => [{ startTime: 0, loadEventEnd: 1250, name: "https://synthetic.invalid/private" }]),
  });
});
afterEach(() => {
  dispose?.(); dispose = undefined; document.body.replaceChildren();
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

describe("host-owned useful metric collectors", () => {
  it("does nothing when disabled, including no listeners, timers or performance reads", () => {
    const listener = vi.spyOn(window, "addEventListener");
    const onEvent = vi.fn();
    const collector = installUsefulMetricCollectors({ enabled: false, onEvent });
    dispose = collector.dispose;
    expect(listener).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
    expect(performance.getEntriesByType).not.toHaveBeenCalled();
    expect(onEvent).not.toHaveBeenCalled(); expect(collector.snapshot()).toEqual({ emitted: 0, dropped: 0 });
  });

  it("is safe without a browser during SSR", () => {
    vi.stubGlobal("window", undefined);
    const onEvent = vi.fn();
    const collector = installUsefulMetricCollectors({ enabled: true, onEvent });
    collector.dispose(); expect(collector.snapshot()).toEqual({ emitted: 0, dropped: 0 });
    expect(onEvent).not.toHaveBeenCalled();
  });

  it.each([undefined, null, "false", "true", 1])("fails closed for non-boolean rollout decision %s", enabled => {
    const onEvent = vi.fn();
    const collector = installUsefulMetricCollectors({ enabled: enabled as boolean, onEvent });
    collector.dispose();
    expect(onEvent).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });

  it("emits one bucketed page-load sample and never reads navigation names", async () => {
    const onEvent = vi.fn();
    const forbidden = vi.fn(() => { throw new Error("private"); });
    vi.mocked(performance.getEntriesByType).mockReturnValue([
      Object.defineProperty({ startTime: 0, loadEventEnd: 1250 }, "name", { get: forbidden }),
    ] as unknown as PerformanceEntryList);
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    await vi.advanceTimersByTimeAsync(0);
    window.dispatchEvent(new Event("load"));
    await vi.advanceTimersByTimeAsync(0);
    expect(onEvent.mock.calls.map(([event]) => event.name)).toEqual([
      "metric.episode.started", "metric.page.load.lt2500ms",
    ]);
    expect(forbidden).not.toHaveBeenCalled();
  });

  it("projects fixed error categories without inspecting Error or rejection details", () => {
    const onEvent = vi.fn();
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    const error = new ErrorEvent("error", { message: "synthetic-private", filename: "https://synthetic.invalid", error: new Error("private") });
    window.dispatchEvent(error);
    const image = document.createElement("img"); document.body.append(image);
    image.dispatchEvent(new Event("error"));
    window.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: "synthetic-person@example.invalid" }));
    const names = onEvent.mock.calls.map(([event]) => event.name);
    expect(names).toEqual(expect.arrayContaining(["metric.error.runtime", "metric.error.resource", "metric.error.unhandled"]));
    expect(JSON.stringify(onEvent.mock.calls)).not.toMatch(/synthetic|private|filename|reason|sessionId|stack/);
  });

  it("excludes hidden time and completes each activity period only once", async () => {
    const onEvent = vi.fn();
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    await vi.advanceTimersByTimeAsync(15000);
    state(false); window.dispatchEvent(new Event("pagehide"));
    await vi.advanceTimersByTimeAsync(100000);
    state(true);
    await vi.advanceTimersByTimeAsync(1000);
    window.dispatchEvent(new Event("pagehide"));
    expect(onEvent.mock.calls.filter(([event]) => event.name === "metric.episode.completed")).toHaveLength(2);
    expect(onEvent.mock.calls.map(([event]) => event.name)).toEqual(expect.arrayContaining([
      "metric.episode.active-duration.lt60s", "metric.episode.active-duration.lt10s",
    ]));
  });

  it("does not count a hidden initial page until shown", () => {
    visible = false;
    const onEvent = vi.fn();
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    expect(onEvent).not.toHaveBeenCalled();
    state(true); window.dispatchEvent(new Event("pageshow"));
    expect(onEvent.mock.calls.filter(([event]) => event.name === "metric.episode.started")).toHaveLength(1);
  });

  it.each(["pointerdown", "keydown", "touchstart"])("renews anonymous activity through %s without retaining input", async eventType => {
    const onEvent = vi.fn();
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
    document.dispatchEvent(new Event(eventType));
    expect(onEvent.mock.calls.filter(([event]) => event.name === "metric.episode.started")).toHaveLength(2);
  });

  it("uses the existing explicit semantic observer without DOM text or input values", () => {
    const onEvent = vi.fn();
    const catalogue = defineSemanticJourneyCatalog({ "ui.submit": { category: "interaction" } }, { sources: ["site"] });
    document.body.innerHTML = '<button data-plasius-event="ui.submit">synthetic-private</button>';
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent, catalogue }).dispose;
    document.querySelector("button")!.click();
    expect(onEvent.mock.calls.at(-1)?.[0].name).toBe("ui.submit");
    expect(JSON.stringify(onEvent.mock.calls)).not.toContain("synthetic-private");
  });

  it("bounds error storms and resets its observation budget", async () => {
    const onEvent = vi.fn();
    const collector = installUsefulMetricCollectors({ enabled: true, onEvent });
    dispose = collector.dispose;
    for (let index = 0; index < 10000; index++) window.dispatchEvent(new Event("error"));
    expect(onEvent.mock.calls.length).toBeLessThanOrEqual(120);
    expect(collector.snapshot().dropped).toBeGreaterThan(9800);
    await vi.advanceTimersByTimeAsync(60000);
    window.dispatchEvent(new Event("error"));
    expect(onEvent.mock.calls.length).toBeGreaterThan(120);
  });

  it("disposes every listener/timer and produces no late or rollback sample", async () => {
    const onEvent = vi.fn();
    dispose = installUsefulMetricCollectors({ enabled: true, onEvent }).dispose;
    onEvent.mockClear(); dispose(); dispose();
    for (const name of ["error", "unhandledrejection", "load", "pagehide", "pageshow"]) window.dispatchEvent(new Event(name));
    state(false); state(true); document.dispatchEvent(new Event("pointerdown"));
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    expect(onEvent).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });

  it("isolates sink and unsupported performance failures", async () => {
    const onEvent = vi.fn(() => { throw new Error("synthetic-private"); });
    vi.mocked(performance.getEntriesByType).mockImplementation(() => { throw new Error("unavailable"); });
    const collector = installUsefulMetricCollectors({ enabled: true, onEvent });
    dispose = collector.dispose;
    await vi.advanceTimersByTimeAsync(0);
    expect(collector.snapshot().dropped).toBeGreaterThan(0);
    expect(() => window.dispatchEvent(new Event("error"))).not.toThrow();
  });
});
