# ADR 0004: Host-owned private metric collectors

## Status

Accepted for implementation under nfr#35, site Story #2160, Feature #1464 and
Epic #1463. Release and host adoption are separate gates.

## Context

Existing NFR collectors expose generic diagnostic payloads and default to
console/dataLayer sinks. Their DOM labels, URLs, error details and arbitrary
props cannot be forwarded into the local-private semantic event service.

## Decision

Add an explicit, disabled-by-default installation API. Reuse the released
`@plasius/analytics` 1.3 projection and optional delegated semantic observer.
The host owns the catalogue, remote flag, batched sender, causal context and
processing endpoint. The package owns lifecycle-safe DOM collection, not an
independent HTTP client or queue. Legacy APIs remain compatible and documented
as outside this privacy-safe path.

Task #38 moves metric projection imports to the released
`@plasius/analytics/metrics` entry (minimum 1.3.1), while reusing the existing
root semantic observer. This prevents the collector from making unused root
metric exports live in a legacy-only host graph. It does not change any metric
or privacy behavior. Verify actual host bundle budgets after adoption.

Collect one navigation load bucket, fixed error categories and anonymous visible
activity periods with a 30-minute idle boundary. Capture no error message/reason,
navigation/resource URL, DOM text, typed value, raw input sample or identifier.
Input modalities may renew the in-memory activity timer but never create a raw
input stream. Optional interactions must have explicit catalogue annotations.

Bound callback handoffs to 120 observations per minute. Drop excess or failing
handoffs into count-only local diagnostics, with no recursive error reporting.
No intervals, per-frame sampling or autonomous transport. Hidden time is excluded;
period counts must never be represented as unique people or identified sessions.

## Rollout and rollback

The host evaluates stored `platform.analytics.semantic-journeys.enabled`, default
false, and passes its decision. The package cannot override that decision with
environment variables. No capability is required for internal observability.
Disabled/SSR installs nothing. Rollback first disposes collectors, then destroys
the host client to discard pending observations. Existing independent 3D gates
remain the responsibility of world adapters and the host/service.

## Validation and limitations

Test disabled/SSR, load bucket privacy, unknown diagnostic fields, fixed errors,
visibility/idle/multiple modalities, duplicate completion, observer cleanup,
host failure isolation and flood budgets. Keep changed source files in LCOV.
The API does not install Web Vitals instrumentation or certify legacy callers.
Host-to-service acceptance, deduplication, processing, retention and production
smokes remain necessary before claiming end-to-end metric delivery.
