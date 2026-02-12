# ADR-0002: Public Package Governance Baseline

- Status: Accepted
- Date: 2026-02-12

## Context

`@plasius/nfr` is a public package consumed outside a single application. It should align with the `@plasius/schema` baseline for visible quality signals and durable architectural documentation.

## Decision

Adopt schema-equivalent governance requirements:

- Preserve README badges for npm version, build health, coverage, license, code of conduct, security policy, and changelog.
- Maintain ADR documentation for architecture-level decisions.
- Keep legal and security policy docs in-repo and versioned.
- Use GitHub-driven CI/CD for testing, coverage upload, and release automation.

## Consequences

- Positive: Consumers see consistent trust and maintenance signals across packages.
- Positive: Decisions are auditable and easier to onboard new maintainers.
- Negative: Additional process overhead for documentation updates.

## Alternatives Considered

- Only enforce standards on high-traffic packages: Rejected because all public packages should meet the same baseline.
- Rely on PR discussion history alone: Rejected due to weak discoverability of final decisions.
