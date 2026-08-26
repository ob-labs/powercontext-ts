# @powercontext/client

Official typed HTTP Client for PowerContext. This is the first publishable
product (`client` / C1). It talks to any compliant Server, including the
pinned Python reference. It does not ship a Runtime, SQLite, MCP server, or
host approval policy.

Node 22 and Node 24 LTS are supported. Node 20 is not.

## Install

```text
pnpm add @powercontext/client
```

The package depends only on `@powercontext/protocol` and the Fetch API. A
clean install must not compile a native addon.

## Quickstart

```ts
import { PowerContextClient } from '@powercontext/client'

const client = new PowerContextClient({
  baseUrl: 'http://127.0.0.1:8000',
  token: process.env.POWERCONTEXT_TOKEN,
})

const live = await client.get_liveness()
const remembered = await client.remember_memory({
  scope_id: 'project:demo',
  kind: 'decision',
  text: 'Keep the official Client on the public HTTP contract.',
})
const report = await client.get_handoff_report({
  project_id: 'project-1',
  format: 'markdown',
})
const file = await client.download_handoff_report({ project_id: 'project-1' })

void live
void remembered
void report
void file
```

Generic operation-id calls are available for host plugins:

```ts
const result = await client.request('search_memory', {
  scope_id: 'project:demo',
  query: 'official Client',
})
```

## Compatibility

| Client | Server | What this package claims |
| --- | --- | --- |
| TypeScript `@powercontext/client` | Python Server (pinned baseline) | `client` / C1 wire parity |
| TypeScript `@powercontext/client` | TypeScript Server | later milestone |
| Python Client | TypeScript Server | later milestone |

This package does **not** claim `sqlite-fts`, `full-product`, or C5.

| Runtime | Status |
| --- | --- |
| Node 22 LTS | Supported and CI-tested |
| Node 24 LTS | Supported and CI-tested |
| Node 20 | Unsupported (EOL). DSH hosts must use the Client range `>=22 <25`. |

## Transport

- Base URL normalization; credentials, fragments, and query tokens are rejected
- `Authorization` and `User-Agent: @powercontext/client/<version>`
- Server `X-PowerContext-Request-ID` is captured on success and errors
- Caller `AbortSignal` combined with a timeout; listeners and timers are cleared
- Redirects are rejected (`redirect: 'manual'`)
- Response bodies are bounded (1 MiB by default)
- JSON, Markdown/text, and download bytes
- Success bodies are validated against the pinned OpenAPI snapshot
- Optional tracing hook; the OpenTelemetry SDK is not a dependency

## Errors

`ClientError` is the base. Transport failures are `UnavailableError`
(`TransportError`). Schema or redirect failures are `InvalidResponseError`.
Any HTTP status not declared as a success status for that operation is a
`ServerResponseError`, including an undeclared 2xx. Unknown operation ids are
`UnknownOperationError`.

## DSH reuse

Host-specific scope, approval, secret guard, and fail-open behavior stay in
the Python-repository DSH plugin. See
[docs/develop/dsh-reuse.md](../../docs/develop/dsh-reuse.md).
