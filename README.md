# @plasius/nfr

[![npm version](https://img.shields.io/npm/v/@plasius/nfr.svg)](https://www.npmjs.com/package/@plasius/nfr)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/nfr/ci.yml?branch=main&label=build&style=flat)](https://github.com/plasius/nfr/actions/workflows/ci.yml)
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

Run `npm test -- --coverage` to execute the Vitest suite (jsdom) and generate coverage reports in `coverage/` (currently ~95% line coverage).

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributor License Agreement](./legal/CLA.md)

---

## License

This project is licensed under the terms of the [Apache 2.0 license](./LICENSE).
