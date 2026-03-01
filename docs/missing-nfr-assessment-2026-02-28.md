# Missing NFR Assessment (2026-02-28)

## Scope

- Included: top-level packages in `/Users/philliphounslow/plasius`, plus workspace packages under `plasius-ltd-site/` and `ui-foundry/packages/`.
- Excluded: prototype/archive copies under `business ideas/**` for this pass.
- Method: static check of package scripts, local CI workflows, and source/test artifacts.

## Package Matrix

| Package Path | Package Name | Kind | Test Files | Missing NFR Controls |
|---|---|---:|---:|---|
| `ai` | `@plasius/ai` | library | 6 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `analytics` | `@plasius/analytics` | library | 2 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `api` | `@plasius/api` | backend | 10 | Lint not enforced in CI; Typecheck not enforced in CI; No coverage gate in CI; Security audit not enforced in CI; No health/readiness endpoint; No metrics/tracing instrumentation |
| `auth` | `@plasius/auth` | library | 1 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `build all` | `@plasius/build-all` | tooling | 0 | No CI workflow; No lint script; No typecheck script; No test script; No coverage script; No coverage gate in CI; No security audit automation |
| `chatbot` | `@plasius/chatbot` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `entity-manager` | `@plasius/entity-manager` | library | 1 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `environment` | `@plasius/environment` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `error` | `@plasius/error` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `gpu-camera` | `@plasius/gpu-camera` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-lighting` | `@plasius/gpu-lighting` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-particles` | `@plasius/gpu-particles` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-physics` | `@plasius/gpu-physics` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-renderer` | `@plasius/gpu-renderer` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-worker` | `@plasius/gpu-worker` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-world-generator` | `@plasius/gpu-world-generator` | library | 6 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpu-xr` | `@plasius/gpu-xr` | library | 1 | No lint script; No typecheck script; Security audit not enforced in CI |
| `gpuLockFreeQueue` | `@plasius/gpu-lock-free-queue` | library | 4 | No lint script; No typecheck script; Security audit not enforced in CI |
| `hexagons` | `@plasius/hexagons` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `images` | `@plasius/images` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `nfr` | `@plasius/nfr` | library | 16 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `plasius-ltd-site` | `@plasius/root` | library | 25 | No lint script; Typecheck not enforced in CI; Security audit not enforced in CI |
| `plasius-ltd-site/backend` | `@plasius/backend` | backend | 18 | No lint script; Typecheck not enforced in CI; No coverage script; Security audit not enforced in CI; No health/readiness endpoint; No metrics/tracing instrumentation |
| `plasius-ltd-site/dashboard` | `@plasius/dashboard` | frontend-app | 3 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI; No accessibility test gate; No performance budget/test gate |
| `plasius-ltd-site/frontend` | `@plasius/site` | frontend-app | 4 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI; No accessibility test gate; No performance budget/test gate |
| `plasius-ltd-site/infra/cosmos-init` | `cosmos-init` | tooling | 0 | No lint script; No typecheck script; No test script; No coverage script; No security audit automation |
| `profile` | `@plasius/profile` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `react-query` | `@plasius/react-query` | library | 0 | Lint not enforced in CI; Typecheck not enforced in CI; No test files; Security audit not enforced in CI; Missing license metadata |
| `react-state` | `@plasius/react-state` | library | 6 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `renderer` | `@plasius/renderer` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; No coverage gate in CI; Security audit not enforced in CI |
| `schema` | `@plasius/schema` | library | 9 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `shadow` | `@plasius/shadow` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; No coverage gate in CI; Security audit not enforced in CI |
| `sharedassets` | `@plasius/sharedassets` | library | 0 | Lint not enforced in CI; Typecheck not enforced in CI; No test files; Security audit not enforced in CI |
| `sharedcomponents` | `@plasius/sharedcomponents` | library | 8 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `snake-voice` | `snake-voice` | frontend-app | 0 | No CI workflow; Lint not enforced in CI; Typecheck not enforced in CI; No test files; No coverage script; No coverage gate in CI; No security audit automation; No accessibility test gate; No performance budget/test gate |
| `storage` | `@plasius/storage` | library | 1 | Lint not enforced in CI; Typecheck not enforced in CI; Security audit not enforced in CI |
| `translations` | `@plasius/translations` | library | 4 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |
| `ui-foundry` | `@plasius/ui-foundry` | library | 0 | Lint not enforced in CI; No typecheck script; No test files; No coverage script; No coverage gate in CI; No security audit automation |
| `ui-foundry/packages/cli/templates` | `@plasius/ui-foundry-cli` | library | 0 | No lint script; No typecheck script; No test script; No coverage script; No coverage gate in CI; No security audit automation; Missing license metadata |
| `ui-foundry/packages/components` | `@plasius/ui-foundry-components` | ui-library | 0 | No lint script; No typecheck script; No test files; No coverage script; No coverage gate in CI; No security audit automation; Missing license metadata; No accessibility test gate; No performance budget/test gate |
| `ui-foundry/packages/core` | `@plasius/ui-foundry-core` | ui-library | 0 | No lint script; No typecheck script; No test files; No coverage script; No coverage gate in CI; No security audit automation; Missing license metadata; No accessibility test gate; No performance budget/test gate |
| `ui-foundry/packages/docs` | `@plasius/ui-foundry-docs` | frontend-app | 0 | No lint script; No typecheck script; No test script; No coverage script; No coverage gate in CI; No security audit automation; No accessibility test gate; No performance budget/test gate |
| `ui-foundry/packages/integrations/analytics-appinsights` | `@plasius/ui-foundry-analytics-appinsights` | ui-library | 0 | No lint script; No typecheck script; No test files; No coverage script; No coverage gate in CI; No security audit automation; Missing license metadata; No accessibility test gate; No performance budget/test gate |
| `video` | `@plasius/video` | library | 1 | No CI workflow; Lint not enforced in CI; Typecheck not enforced in CI; No coverage gate in CI; Security audit not enforced in CI |
| `voice` | `@plasius/voice` | library | 21 | Lint not enforced in CI; No typecheck script; Security audit not enforced in CI |

## Evidence Highlights

- `ui-foundry` lint currently fails due missing `eslint.config.*` (ESLint v9 requires flat config).
- `react-query` `test:coverage` runs with no test files and no `coverage/lcov.info` emitted.
- `video` currently has CD workflow but no CI workflow; local coverage run is ~24.24% lines.
- `api` and `plasius-ltd-site/backend` include middleware for CORS/CSRF/rate-limiting/auth but no health endpoint/telemetry instrumentation found in source scan.

## Urgent Top 5 (Risk-Based)

1. Establish CI quality gates (lint, typecheck, security audit) across all active packages.
2. Fix package test baselines with 0 tests (`react-query`, `sharedassets`, `ui-foundry` packages, `snake-voice`).
3. Add missing CI workflow for `video` and `snake-voice` (PR-time validation, not only release-time).
4. Add backend operability controls: health/readiness endpoint + metrics/tracing (`api`, `plasius-ltd-site/backend`).
5. Add accessibility/performance gates for user-facing frontends and UI libraries (`plasius-ltd-site/frontend`, `plasius-ltd-site/dashboard`, `ui-foundry/packages/components`, `ui-foundry/packages/core`).