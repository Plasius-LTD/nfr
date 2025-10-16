# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

---

## [Unreleased]

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

[Unreleased]: https://github.com/Plasius-LTD/nfr/compare/v1.0.1...HEAD
[1.0.0]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.0
[1.0.1]: https://github.com/Plasius-LTD/nfr/releases/tag/v1.0.1
