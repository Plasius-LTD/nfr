# @plasius/nfr

[![npm version](https://img.shields.io/npm/v/@plasius/nfr.svg)](https://www.npmjs.com/package/@plasius/nfr)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/nfr/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/nfr/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/nfr)](https://codecov.io/gh/Plasius-LTD/nfr)
[![License](https://img.shields.io/github/license/Plasius-LTD/nfr)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

---

## Overview

`@plasius/nfr` provides Non-Functional Requirement assistance, exposing platform agnostic Analytics, Performance Tracking and more.

---

## Installation

```bash
npm install @plasius/nfr
```

---

## Privacy-safe events-service integration

Use `installUsefulMetricCollectors` with an application-owned
`@plasius/analytics` semantic client. Compose
`USEFUL_METRIC_EVENT_DEFINITIONS` into its catalogue and evaluate the stored
remote flag before installing. The collector uses the released analytics 1.3
standalone metric entry (minimum 1.3.1), keeping optional metric projection out
of legacy-only root analytics imports. Hosts must still verify their build's
lazy-loading and initial-load budgets. It uses the same fixed
projection; it does not create a sender, endpoint, identity or persistent state.

```ts
import { installUsefulMetricCollectors } from "@plasius/nfr";

const collectors = installUsefulMetricCollectors({
  enabled: runtime.enabled, // stored platform.analytics.semantic-journeys.enabled
  onEvent: (event) => semanticClient.track(event),
  // catalogue: hostCatalogue, // optional explicitly annotated interactions
});
// On rollback/unmount: stop producers before destroying the host client.
collectors.dispose();
semanticClient.destroy();
```

The host must provide the same catalogue-approved metric definitions to the
service and verify processing, not merely HTTP acceptance. Lazy-load this
integration at the host's telemetry boundary. Do not install the optional
interaction observer when the host already owns one.

Captured signals are one bucketed navigation load duration, fixed runtime /
resource / unhandled-rejection counts, and anonymous activity periods. A visible
period ends on hide/pagehide or 30 minutes without activity. A later visible
interaction begins a new period; hidden time is excluded. These are sampled
activity counts, not unique users or cross-tab sessions. Reloads, tabs and lost
final observations affect totals. No Web Vitals SDK, resource URL enumeration,
error text, stack, input value, DOM label or identity is forwarded by this API.

At most 120 observations per minute reach the host callback. Excess observations
and sink failures increment only the local `snapshot().dropped` diagnostic.
`snapshot().emitted` counts successful callback handoffs, **not network delivery**.
No per-frame sampling or network work occurs in this collector. Disabled/SSR
installs nothing; disposal removes listeners and timers without emitting a final
rollback event. Use the shared client's batching/retry/backpressure and destroy
it on rollback to discard queued observations.

Legacy `track`, `page`, `trackPerf`, `withInteractionTracking` and
`initPerformanceTracking` remain compatible but are **not** a privacy-safe
forwarding contract: they can include free-form props, DOM labels or URLs. Do not
wire their raw console/dataLayer payloads into the events service. Migrate each
producer to fixed semantic events or this collector and test its host wiring.

## Demo

```bash
npm run build
node demo/example.mjs
```

See `demo/README.md` for the local sanity-check scaffold.

## Validation

```bash
npm run lint
npm run typecheck
npm test
```

---

## Usage Example

### Analytics & Performance

```tsx
import React from "react";
import { withInteractionTracking, trackPerf, initPerformanceTracking } from "@plasius/nfr";

// Example: wrap a component with interaction tracking
const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  (props, ref) => (
    <button ref={ref} {...props}>
      Click me
    </button>
  )
);
const TrackedButton = withInteractionTracking(Button, { origin: "docs" });

// Example: initialize performance tracking
const teardown = initPerformanceTracking({
  track: trackPerf,                    // re-use our analytics pipeline
  resourceSampleRate: 0.25,            // optional (default 0.25; set 0 to disable)
  resourceFilter: (r) => r.initiatorType !== "img", // optional
  includeNetworkInfo: true,            // optional (default true)
  includeMemorySnapshot: false,        // optional (default false)
});

// Example: manual performance event (use a supported PerfCategory)
trackPerf({
  category: "resource",
  name: "user-action",
  ts: Date.now(),
  details: { action: "something-happened" },
});
```

> Notes:
> - Web Vitals are loaded via optional `web-vitals`; if it isn’t installed, those metrics are skipped.
> - `initPerformanceTracking` safely no-ops in SSR/non-DOM environments.

---

## Testing

Run `npm test -- --coverage` to execute the Vitest suite (jsdom) and generate coverage reports in `coverage/` (currently ~95% line coverage). The harness automatically preloads a tiny shim to provide `vm.constants.DONT_CONTEXTIFY` on Node 20 so jsdom can start safely.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributor License Agreement](./legal/CLA.md)

---

## License

This project is licensed under the terms of the [Apache 2.0 license](./LICENSE).

<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

CI keeps the administrative contributor registry outside Git and npm package
artifacts using exact, case-normalised path checks. CI runs on approved
GitHub-hosted runners for same-repository pull requests and `main`, with
package-manager cache finalization disabled; fork PR code is denied.
Publication uses the GitHub-hosted `production` job with Node 24 and a pinned
npm 11.6.2 client. It is token-free and proceeds only while the prepared SHA
is the exact `main` head after successful push-triggered CI. Do not dispatch CD
until the npm trusted-publisher binding is verified.
<!-- END PLASIUS RELEASE INTEGRITY -->
