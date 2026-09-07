import {
  observeSemanticJourneyInteractions,
  type SemanticJourneyCatalog,
  type SemanticJourneyEventInput,
} from "@plasius/analytics";
import { projectUsefulMetric } from "@plasius/analytics/metrics";

/** Host-owned metric capture; the host supplies its stored remote-flag decision. */
export interface UsefulMetricCollectorOptions {
  enabled: boolean;
  onEvent: (event: SemanticJourneyEventInput) => void;
  /** Optional explicit semantic interaction catalogue; no DOM auto-labelling. */
  catalogue?: SemanticJourneyCatalog;
  target?: Window;
}

/** No queue or transport is owned here; diagnostics contain counts only. */
export interface UsefulMetricCollector {
  dispose(): void;
  snapshot(): Readonly<{ emitted: number; dropped: number }>;
}

const IDLE_MS = 30 * 60 * 1000;
const WINDOW_MS = 60 * 1000;
const MAX_OBSERVATIONS = 120;

/**
 * Collects one page-load duration, fixed error categories and anonymous visible
 * activity periods through the released analytics privacy projection. Optional
 * explicit semantic interactions reuse its approved delegated observer.
 *
 * Does not read DOM text, values, URLs, errors/reasons, identities or raw input
 * data. Installs nothing when disabled/SSR. Dispose removes every listener and
 * timer without producing a rollback sample. The host owns client destruction,
 * aggregation, transport, sampling disclosure and downstream processing.
 */
export function installUsefulMetricCollectors(options: UsefulMetricCollectorOptions): UsefulMetricCollector {
  const target = options.target ?? (typeof window === "undefined" ? undefined : window);
  let emitted = 0;
  let dropped = 0;
  const snapshot = () => Object.freeze({ emitted, dropped });
  if (options.enabled !== true || !target) return { dispose: () => undefined, snapshot };

  const document = target.document;
  const now = () => target.performance.now();
  let disposed = false;
  let windowStart = now();
  let observations = 0;
  let episodeStart: number | null = null;
  let idleTimer: number | undefined;
  let loadTimer: number | undefined;
  let loadRecorded = false;

  const emitEvent = (event: SemanticJourneyEventInput): void => {
    if (disposed) return;
    const time = now();
    if (time - windowStart >= WINDOW_MS) { windowStart = time; observations = 0; }
    if (observations >= MAX_OBSERVATIONS) { dropped++; return; }
    observations++;
    try { options.onEvent(event); emitted++; } catch { dropped++; }
  };
  const emit = (metric: string, value?: number): void => {
    const event = projectUsefulMetric(value === undefined ? { metric } : { metric, value });
    if (event) emitEvent(event);
  };
  const endEpisode = (): void => {
    if (disposed || episodeStart === null) return;
    const duration = Math.max(0, Math.min(86_400_000, now() - episodeStart));
    episodeStart = null;
    target.clearTimeout(idleTimer);
    emit("episode.completed");
    emit("episode.active-duration", duration);
  };
  const activity = (): void => {
    if (disposed || document.visibilityState !== "visible") return;
    if (episodeStart === null) { episodeStart = now(); emit("episode.started"); }
    target.clearTimeout(idleTimer);
    idleTimer = target.setTimeout(endEpisode, IDLE_MS);
  };
  const visibility = (): void => {
    if (document.visibilityState === "visible") activity(); else endEpisode();
  };
  const readLoad = (): void => {
    if (disposed || loadRecorded) return;
    try {
      const entry = target.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!entry || !(entry.loadEventEnd > 0)) return;
      const event = projectUsefulMetric({ metric: "page.load", value: entry.loadEventEnd - entry.startTime });
      if (event) { loadRecorded = true; emitEvent(event); }
    } catch { /* Unsupported timing data never alters application behaviour. */ }
  };
  const scheduleLoad = (): void => {
    if (disposed || loadRecorded) return;
    target.clearTimeout(loadTimer);
    // loadEventEnd becomes final after load handlers have returned.
    loadTimer = target.setTimeout(readLoad, 0);
  };
  const error = (event: Event): void => {
    // Element targets are resource failures; do not read error/message/filename.
    const resource = event.target !== null && "nodeType" in event.target && event.target.nodeType === 1;
    emit(resource ? "error.resource" : "error.runtime");
  };
  const rejection = (): void => emit("error.unhandled");

  target.addEventListener("error", error, true);
  target.addEventListener("unhandledrejection", rejection);
  target.addEventListener("load", scheduleLoad);
  target.addEventListener("pagehide", endEpisode);
  target.addEventListener("pageshow", activity);
  document.addEventListener("visibilitychange", visibility);
  const activityEvents = ["pointerdown", "keydown", "touchstart"] as const;
  for (const event of activityEvents) document.addEventListener(event, activity, { capture: true, passive: true });
  const disposeInteractions = options.catalogue
    ? observeSemanticJourneyInteractions({ enabled: true, root: document, catalogue: options.catalogue, onEvent: emitEvent })
    : () => undefined;
  activity();
  if (document.readyState === "complete") scheduleLoad();

  return {
    snapshot,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      episodeStart = null;
      target.clearTimeout(idleTimer); target.clearTimeout(loadTimer);
      target.removeEventListener("error", error, true);
      target.removeEventListener("unhandledrejection", rejection);
      target.removeEventListener("load", scheduleLoad);
      target.removeEventListener("pagehide", endEpisode);
      target.removeEventListener("pageshow", activity);
      document.removeEventListener("visibilitychange", visibility);
      for (const event of activityEvents) document.removeEventListener(event, activity, true);
      disposeInteractions();
    },
  };
}
