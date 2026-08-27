# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once packages
are published.

## Unreleased

### Added

- `@powercontext/core` deterministic primitives for the `sqlite-fts`
  profile: RFC 8785 JCS, recursive NFC, domain-separated SHA-256, UTF-8
  byte budgets, Source/Artifact refs, Trigger contracts, and fake-store
  revision/head traces. Shared `sqlite-fts` / C2 canonical fixtures, including
  invalid Unicode, Python-int token rejection, IEEE `1e30`, NFC collision,
  ref, and domain-hash cases, now run through this package.
- Official `@powercontext/client` typed HTTP Client: 52 methods, strict
  transport, runtime validation, and Python Server call-through for the
  `client` / C1 profile.
- Generated Protocol contracts, runtime validators, and C1 wire / canonical
  conformance fixtures against the pinned Python OpenAPI 0.0.2 baseline.
- Repository documentation for policies, ADRs, contributing, and security.

### Changed

- Canonical UTF-8 helpers reject lone surrogates, identity limits count Unicode
  code points, and fake Artifact histories are immutable snapshots with
  collision-free composite identities.
- ADR 0006 records that raw JCS keeps RFC 8785 Appendix B `±2^53` values, while
  domain canonicalization and content hashes reject them to match Python
  `rfc8785`.
- Conformance emits separate `client` / C1 and deterministic Core /
  `sqlite-fts` / C2 reports.
- OpenAPI-derived request types preserve required fields while leaving
  server-defaulted fields optional.
- Undeclared 2xx responses are classified as Server errors, and malformed UTF-8
  success bodies are rejected instead of being decoded with replacement text.
- The Python-side DSH reuse design now uses the Client's exact Node range,
  `>=22 <25`.
