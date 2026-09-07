import { expect, it, vi } from "vitest";

vi.mock("@plasius/analytics", async () => ({
  ...await vi.importActual<typeof import("@plasius/analytics")>("@plasius/analytics"),
  projectUsefulMetric: () => { throw new Error("Collectors must use the standalone metric entry."); },
}));

import { installUsefulMetricCollectors } from "../src/telemetry/usefulMetrics.js";

it("collects through the standalone projection without the legacy root metric export", () => {
  const onEvent = vi.fn();
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const collector = installUsefulMetricCollectors({ enabled: true, onEvent });
  try {
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ name: "metric.episode.started" }));
  } finally { collector.dispose(); visibility.mockRestore(); }
});
