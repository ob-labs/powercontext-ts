# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once packages
are published.

## Unreleased

### Added

- Official `@powercontext/client` typed HTTP Client: 52 methods, strict
  transport, runtime validation, and Python Server call-through for the
  `client` / C1 profile.
- Generated Protocol contracts, runtime validators, and C1 wire / canonical
  conformance fixtures against the pinned Python OpenAPI 0.0.2 baseline.
- Repository documentation for policies, ADRs, contributing, and security.

### Changed

- OpenAPI-derived request types preserve required fields while leaving
  server-defaulted fields optional.
- Undeclared 2xx responses are classified as Server errors, and malformed UTF-8
  success bodies are rejected instead of being decoded with replacement text.
- The Python-side DSH reuse design now uses the Client's exact Node range,
  `>=22 <25`.
