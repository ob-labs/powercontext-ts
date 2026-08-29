# @powercontext/server

Experimental subset HTTP Server for the TypeScript-created experimental
database. It exposes health, capabilities, Source-content availability, and
minimal Memory remember/search/list/get over Fastify, using the frozen
`@powercontext/protocol` validators and the existing `@powercontext/builtin`
runtime. It also exposes experimental `prepare_context` greedy FTS packing.

`PACKAGE_PROFILE` remains `sqlite-fts` as the intended M2 product-line name,
but this package does not claim the `sqlite-fts` implementation or C3. This is
not the full 52-route Server and not a Python replacement.
MCP, CLI, Dashboard, extraction, handoff, vector, and hybrid behavior are not
registered as available. The server listens on `127.0.0.1` only.

## Pits / intentional gaps

- `capture_content_source` is registered and always returns `503`: HTTP CaptureContent
  (202 + position) is not the `ExperimentalRuntime.capture()` catalog add, so the
  server does not fake a `202`.
- Search hit `score` is the placeholder `1`, not BM25; it is not a ranking claim.
- `entry_id === content_hash`, `entry_version_id === entry_id`, and `version` is
  `1`; this is not Python revision/CAS.
- `DatabaseSync` calls are synchronous and can block the Node event loop;
  exclusive-writer protection remains process-local.

`prepare_context` is experimental greedy FTS packing, not Python
`PreparedContext` parity. Search scores are unused by the packer.
