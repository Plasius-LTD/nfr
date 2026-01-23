# ADR-0001: NFR Analytics and Performance

## Status

- Proposed -> Accepted
- Date: 2025-09-22
- Version: 1.0
- Supersedes: N/A
- Superseded by: N/A

## Context

Plasius applications need consistent analytics and performance telemetry with minimal overhead. The solution must be React-friendly, SSR-safe, and allow optional integrations (such as Web Vitals) without forcing heavy dependencies.

## Decision

We will build `@plasius/nfr` as a focused library for analytics and performance tracking with these structural choices:

- Provide a core analytics API plus helpers for performance events.
- Keep optional dependencies (e.g., `web-vitals`) guarded so the package can run without them.
- Ensure SSR and non-DOM environments are safe by using runtime guards.
- Offer React-friendly helpers (providers/HOCs/hooks) for interaction tracking.
- Publish as ESM + CJS with TypeScript types.

## Consequences

- **Positive:** Consistent telemetry across projects with low overhead and SSR safety.
- **Negative:** Requires ongoing maintenance of tracking APIs and compatibility with evolving web APIs.
- **Neutral:** Consumers can wire the tracking pipeline to their own backends.

## Alternatives Considered

- **Use third-party analytics SDKs directly:** Rejected for inconsistent APIs, heavier runtime, and limited SSR control.
- **Per-project tracking utilities:** Rejected due to duplication and fragmented behavior.
