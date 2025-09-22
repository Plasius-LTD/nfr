import React, { createContext, useContext } from "react";
import { track, page } from "./analytics.js";

type AnalyticsContextValue = { track: typeof track; page: typeof page };
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export const AnalyticsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <AnalyticsContext.Provider value={{ track, page }}>
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
