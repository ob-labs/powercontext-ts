# @powercontext/server

Experimental subset HTTP Server for the TypeScript-created experimental
database. It exposes health, capabilities, Source-content availability, and
minimal Memory remember/search/list/get over Fastify, using the frozen
`@powercontext/protocol` validators and the existing `@powercontext/builtin`
runtime. It also exposes experimental `prepare_context` greedy FTS packing and
a five-tool Streamable HTTP MCP endpoint at `/mcp`.

`PACKAGE_PROFILE` remains `sqlite-fts` as the intended M2 product-line name,
but this package does not claim the `sqlite-fts` implementation or C3. This is
not the full 52-route Server and not a Python replacement.
CLI, Dashboard, extraction, handoff, vector, and hybrid behavior are not
registered as available. The experimental MCP surface contains only
`capture_content_source`, `remember_memory`, `search_memory`,
`list_memory_entries`, and `get_memory_entry`; all other locked MCP IDs are
absent from `tools/list`. The server listens on `127.0.0.1` only.

This is not a shipped CLI. You need Node 24, this git checkout, and a
long-running Server process. If `pnpm` is missing from `PATH`, run
`corepack enable` then `corepack prepare pnpm@10.33.2 --activate`.

Do not commit `*.sqlite3`, `*.sqlite3-shm`, or `*.sqlite3-wal`.

## Experimental serve and Codex (current dogfood)

`/mcp` keeps one persistent stateful `NodeStreamableHTTPServerTransport` per
initialized MCP session, with generated session IDs, and accepts both `POST`
and `GET`. Codex can initialize, retain the `Mcp-Session-Id`, open its SSE
`GET`, and make follow-up `tools/list` requests directly. A new Codex session
receives a separate persistent transport instead of reconnecting a server for
every request.

Python's `powercontext setup codex` remains the product path in the Python
repository. This TypeScript helper is experimental setup output, not a shipped
`powercontext setup` CLI, not M4, and not C3.

### 1. Start the Server (keep this terminal open)

From the repository root:

```sh
corepack enable
corepack prepare pnpm@10.33.2 --activate

pnpm --filter @powercontext/server experimental:serve -- \
  --db ./powercontext.experimental.sqlite3 \
  --port 8787
```

The command prints `http://127.0.0.1:8787`. Check:

```sh
curl -s http://127.0.0.1:8787/health/live
# {"status":"ok"}
```

### 2. Install the experimental Codex plugin

The plugin is not the Python marketplace plugin and does not port the handoff
Skill, work tools, or the 22-tool allowlist. Its MCP surface is the same five
tools listed above.

For each `UserPromptSubmit`, the hook derives a stable scope from the Git root
(or current directory), calls REST `POST /v1/context/prepare`, injects the
prepared content only when `status` is `ready`, and captures the prompt through
`POST /v1/sources/content` in the same scope. Set `POWERCONTEXT_SCOPE_ID` to
override the derived scope. Connection errors, timeouts, and HTTP failures are
written as JSON lines to stderr while the hook returns `continue: true`, so
Codex remains fail-open.

Another terminal, Server still running:

```sh
pnpm --filter @powercontext/server experimental:setup-codex -- \
  --output /tmp/powercontext-codex-plugin \
  --base-url http://127.0.0.1:8787

codex plugin marketplace add /tmp/powercontext-codex-plugin
codex plugin add powercontext-experimental@powercontext-experimental-local
```

Start a **new** Codex Desktop or CLI session. Approve the `UserPromptSubmit`
hook if asked. `POWERCONTEXT_BASE_URL` overrides the hook URL at runtime;
`--base-url` renders both hook and MCP configuration for another loopback port.

In Codex `/mcp`, you should see `powercontext_experimental` with:
`capture_content_source`, `remember_memory`, `search_memory`,
`list_memory_entries`, `get_memory_entry`.

If a second MCP server (for example `pc-tx`) shows Tools `(none)` or times
out after 30s, disable it. Use only `powercontext_experimental`.

Desktop Streamable HTTP should talk to `http://127.0.0.1:8787/mcp`. If
enumeration fails, use stdio instead:

```toml
[mcp_servers.powercontext_experimental]
command = "npx"
args = ["-y", "mcp-remote", "http://127.0.0.1:8787/mcp"]
startup_timeout_sec = 60
```

### 3. Smoke-test Memory from Codex

Paste:

```text
Call MCP server powercontext_experimental only (not pc-tx).

1. remember_memory
   scope_id: codex-probe
   kind: note
   text: 中文验证一条

2. search_memory
   scope_id: codex-probe
   query: 中文
   limit: 20

Paste both raw tool results.
```

Success: `search_memory` `hits` contain `中文验证一条`.
Do not pass `"limit": null` (omit `limit` or use an integer).

The hook derives `scope_id` from the Git root (`codex:<name>:<hash>`), which
is **not** `codex-probe`. Automatic prepare only sees memories stored in that
hook scope. Capture does not create Memory entries; explicit `remember_memory`
is still required.

### 4. Stop

Ctrl+C the serve process. The SQLite file keeps data for the next run if you
reuse the same `--db` path.

## Pits / intentional gaps

- `capture_content_source` experimentally appends content and returns a durable,
  monotonic position. This is not Python capture parity, does not auto-extract
  Memory, and is separate from the catalog-only `ExperimentalRuntime.capture()`.
- Search hit `score` is the placeholder `1`, not BM25; it is not a ranking claim.
- `entry_id === content_hash`, `entry_version_id === entry_id`, and `version` is
  `1`; this is not Python revision/CAS.
- `DatabaseSync` calls are synchronous and can block the Node event loop;
  exclusive-writer protection remains process-local.

`prepare_context` is experimental greedy FTS packing, not Python
`PreparedContext` parity. Search scores are unused by the packer.
