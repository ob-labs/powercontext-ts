# DSH plugin reuse of `@powercontext/client`

Phase 3 produces this design. Implementation is a Python-repository pull
request and may wait until the later host-acceptance milestone.

## Current split

The DSH plugin lives in the Python repository at `integrations/dsh`. Today it
owns a generic Fetch client, operation-id dispatch, scope derivation, mutation
approval, secret-like payload guards, PreparedContext wrapping, and fail-open
recall/capture.

The official Client now owns the generic transport. The plugin should depend
on the published `@powercontext/client` package instead of keeping a second
Fetch implementation.

## Move to the official Client

- Base URL normalization
- `Authorization` / `User-Agent` / request-id capture
- Timeout plus caller `AbortSignal`
- Manual redirect rejection
- Bounded response bodies
- JSON / Markdown / download-bytes modes
- Runtime request and success validation
- `transport` / `unavailable` / `server` / `invalid-response` /
  `unknown-operation` errors
- Optional tracing injection hook

## Keep in the DSH plugin

- Host scope derivation and long scope hashes
- Mutation approval and curated tool policy
- Secret-like payload rejection
- Fail-open recall/capture so a Server outage does not block the agent
- Host UI, commands, and DSH-specific skill text
- Untrusted-context wrapping for PreparedContext injection

## Node engine

ADR 0007 does not maintain a Node 20 build. The official Client declares
`engines.node: ">=22 <25"`. The plugin's `>=20` declaration must be raised to
`>=22 <25` in the Python-repository PR so it does not claim untested Node 25+
runtimes. Hosts that remain on Node 20 keep calling the Python Server and must
not mark the official Client as supported.

## Suggested adapter

```ts
import { PowerContextClient } from '@powercontext/client'

const official = new PowerContextClient({
  baseUrl,
  authorization,
  timeoutMs: requestTimeoutMs,
  fetch,
})

export async function request(id: string, payload?: object, signal?: AbortSignal) {
  return official.request(id, payload, { signal })
}
```

The plugin keeps its operation table only if host tooling still needs it.
Wire types and validators come from `@powercontext/protocol` through the
Client. Do not copy OpenAPI snapshots into the plugin.

## Acceptance

- Current DSH unit and E2E behavior must not regress after the Python PR
- Plugin tests may keep host-level mocks; transport cases should use the
  official Client
- This repository only publishes the Client and this design. It does not
  modify the Python plugin tree
