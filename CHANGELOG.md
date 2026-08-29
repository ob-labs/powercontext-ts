# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once packages
are published.

## Unreleased

### Added

- Experimental `@powercontext/server` subset HTTP composition over the
  TypeScript-created database: health, capabilities, and minimal Memory
  routes only. It is not the full Server, not a Python replacement, and not
  C3; `sqlite-fts` is the intended M2 product-line profile, not a claim that
  this package implements that profile or C3; unsupported capabilities return
  structured errors instead of fake success. Experimental `prepare_context`
  uses greedy FTS packing and does not claim Python `PreparedContext` parity.
  Experimental content capture appends durable positions without Memory
  extraction and does not claim Python capture parity. The same loopback
  process can now expose exactly five implemented MCP tools plus the REST
  subset through an experimental serve entry; this is not M4 or a shipped CLI.
  The Streamable HTTP endpoint now keeps a stateful session transport with
  `POST` + `GET` and `Mcp-Session-Id` follow-up support for direct Codex
  Desktop/CLI enumeration. A separate experimental Node Codex plugin and setup
  renderer provide fail-open prompt preparation/capture plus the same five MCP
  tools; they do not port the Python plugin, handoff Skill, work surface, or
  22-tool allowlist.
- Experimental `@powercontext/builtin` Node `node:sqlite` persistence skeleton:
  Analyzer v1-projected FTS, guarded schema stamp, Source/Artifact persistence,
  CAS, and minimal Memory remember/list/get/search. It is not C3 and does not
  write the shared Python database; `DatabaseSync` event-loop blocking remains
  an explicit documented pit.
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
