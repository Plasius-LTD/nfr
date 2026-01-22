import { PerfEvent } from "../performance/index.js";

declare const __IMPORT_META_ENV__: { MODE?: string } | undefined;

export type AnalyticsEvent = {
  name: string;
  props?: Record<string, unknown>;
  ts?: number;
};

export interface AnalyticsSink {
  track: (event: AnalyticsEvent) => void;
  page?: (name: string, props?: Record<string, unknown>) => void;
}

/**
 * Send a performance event through the active analytics sink.
 * We flatten the payload so `dataLayer`-style sinks can consume it directly.
 */
export const trackPerf = (e: PerfEvent) => {
  // Preserve provided timestamp if present; otherwise add one in the sink (or here)
  const { ts, ...rest } = e;
  activeSink.track({
    name: "perf",
    props: rest,
    ts: ts ?? Date.now(),
  });
};

const metaEnv =
  typeof __IMPORT_META_ENV__ !== "undefined" ? __IMPORT_META_ENV__ : undefined;
const isProd =
  metaEnv?.MODE === "production" ||
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production");
const hasWindow = typeof window !== "undefined";

// Example sinks
const consoleSink: AnalyticsSink = {
  track: (event) => console.info(event.name, event.props),
  page: (name, props) => console.info(name, props),
};

// Replace with your real one later:
const dataLayerSink: AnalyticsSink = {
  track: (event) => {
    // Example: Google Tag Manager dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: event.name,
      ...event.props,
      ts: event.ts ?? Date.now(),
    });
  },
  page: (name, props) => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "page_view",
      page: name,
      ...props,
    });
  },
};

let activeSink: AnalyticsSink = isProd && hasWindow ? dataLayerSink : consoleSink;

export const setAnalyticsSink = (sink: AnalyticsSink) => {
  activeSink = sink;
};

export const track = (name: string, props?: Record<string, unknown>) =>
  activeSink.track({ name, props, ts: Date.now() });

export const page = (name: string, props?: Record<string, unknown>) =>
  activeSink.page?.(name, props);
