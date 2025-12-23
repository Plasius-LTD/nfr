import React, { createContext, useContext } from "react";
import { track, page, AnalyticsSink } from "./analytics.js";

type AnalyticsContextValue = { track: typeof track; page: typeof page };
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

type AnalyticsProviderProps = React.PropsWithChildren<{
  value?: AnalyticsContextValue;
  sink?: AnalyticsSink;
}>;

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  value,
  sink,
}) => {
  const resolved: AnalyticsContextValue =
    value ??
    (sink
      ? {
          track: sink.track,
          page: sink.page ?? page,
        }
      : { track, page });

  return (
    <AnalyticsContext.Provider value={resolved}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx)
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
};
