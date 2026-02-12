# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

---

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [1.0.3] - 2026-01-22

- **Added**
  - Additional tests for analytics sinks, `useAnalytics` guard rails, and the optional `web-vitals` import path (coverage now ~95% lines).
  - Preload shim test to guarantee `vm.constants.DONT_CONTEXTIFY` exists before jsdom starts, plus behavior tests for the shim.

- **Changed**
  - Resource sampling clamp now honors explicit values (including 0 to disable) and only falls back when unset.
  - AnalyticsProvider now accepts a custom `value` or `sink` to inject alternative tracking implementations.
  - Vitest now injects the vm constants shim via `NODE_OPTIONS` (global setup) instead of mutating `vm.constants` at config time, keeping the harness more predictable.
  - Removed direct patching of jsdom’s bundled `Window.js` in `node_modules`; the preload shim now handles missing VM constants safely.
  - Web-vitals import tests use deterministic waits (fake timers + `waitFor`) to avoid timing flakiness.
  - Exposed `main`, `module`, and `types` metadata for dual ESM/CJS builds.
  - `initPerformanceTracking` now exposes a `ready` promise for async web-vitals wiring.

- **Fixed**
  - Performance visibility listeners are now removed with stable handler references to avoid duplicate tracking.
  - Performance tracking no-ops in SSR/non-DOM contexts instead of throwing.
  - Production analytics sink falls back to console when `window` is unavailable (SSR-safe).
  - CJS builds no longer warn on `import.meta` usage.

- **Security**
  - (placeholder)

## [1.0.2] - 2025-10-16

- **Added**
  - (placeholder)

- **Changed**
  - track and page console log events now use the name of the event rather than pre-pend generic names.

- **Fixed**
  - CD.yml no longer double commits upon release

- **Security**
  - (placeholder)

## [1.0.1] - 2025-09-24

- **Added**
  - Improved code coverage

## [1.0.0] - 2025-09-22

- **Added**

  - Initial Commit
  - CD pipeline added major, minor and patch flags for the pipeline

---

## Release process (maintainers)

1. Update `CHANGELOG.md` under **Unreleased** with user‑visible changes.
2. Bump version in `package.json` following SemVer (major/minor/patch).
3. Move entries from **Unreleased** to a new version section with the current date.
4. Tag the release in Git (`vX.Y.Z`) and push tags.
5. Publish to npm (via CI/CD or `npm publish`).

> Tip: Use Conventional Commits in PR titles/bodies to make changelog updates easier.

---

[Unreleased]: https://github.com/Plasius-LTD/nfr/compare/v1.0.3...HEAD
[1.0.0]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.0
[1.0.1]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.1
[1.0.2]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.2
[1.0.3]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.3

## [1.0.3] - 2026-02-11

- **Added**
  - Initial release.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)
