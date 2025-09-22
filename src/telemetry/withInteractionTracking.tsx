import React from "react";
import { track } from "./analytics.js";

type WithInteractionOpts = {
  origin?: string; // e.g. story name
};

export function withInteractionTracking<P extends object, R = unknown>(
  Component: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<R>
  >,
  opts?: WithInteractionOpts
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<R>
>;

export function withInteractionTracking<P extends object>(
  Component: React.ComponentType<P>,
  opts?: WithInteractionOpts
): React.FC<P>;

export function withInteractionTracking<P extends object, R = unknown>(
  Component:
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<P> & React.RefAttributes<R>
      >
    | React.ComponentType<P>,
  { origin }: WithInteractionOpts = {}
): any {
  const Wrapped = React.forwardRef<R, P>(function Wrapped(props, ref) {
    const onInteractionCapture = (
      e: React.PointerEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
    ) => {
      // Normalize event type
      const isKey = (e as React.KeyboardEvent).key !== undefined;
      const isPointer = (e as React.PointerEvent).pointerType !== undefined;
      const type = isKey ? "keydown" : isPointer ? "pointerup" : e.type;

      // Only track meaningful keyboard activations (Enter/Space)
      let key: string | undefined;
      if (isKey) {
        key = (e as React.KeyboardEvent).key;
        if (key !== "Enter" && key !== " ") return; // ignore other keys
      }

      // For pointers: only primary button releases
      if (isPointer) {
        const pe = e as React.PointerEvent;
        if (type === "pointerup" && pe.button !== 0) return;
      }

      const target = e.target as HTMLElement | null;
      const label =
        target?.getAttribute?.("aria-label") ||
        target?.getAttribute?.("data-analytics-label") ||
        target?.textContent?.trim() ||
        target?.tagName;

      track("ui.interaction", {
        origin,
        label,
        type,
        key,
        pointerType: isPointer ? (e as React.PointerEvent).pointerType : undefined,
      });
    };

    const Comp = Component as any; // Allow ref passing for both ref-aware and plain components
    return (
      <div
        onPointerUpCapture={onInteractionCapture}
        onKeyDownCapture={onInteractionCapture}
      >
        <Comp ref={ref} {...(props as any)} />
      </div>
    );
  });

  Wrapped.displayName = `WithInteractionTracking(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
}
