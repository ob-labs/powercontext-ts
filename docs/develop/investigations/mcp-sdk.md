# Investigation: MCP TypeScript SDK v2

## Question

Can the official TypeScript SDK v2 speak Streamable HTTP in-process with
Fastify, and how should the version be locked?

## Method

Pin these root `devDependencies` at 2.0.0 (they do not enter the
Protocol/Client runtime graph):

- `@modelcontextprotocol/server@2.0.0`
- `@modelcontextprotocol/fastify@2.0.0`
- `@modelcontextprotocol/node@2.0.0`

Tests live in `tools/spikes/mcp/mcp-fastify.test.ts`.

## Result

| Check | Result |
| --- | --- |
| `new McpServer` + allowlisted tool | Success |
| Fastify `/mcp` + `NodeStreamableHTTPServerTransport` | Success |
| JSON-RPC `initialize` over in-process HTTP | HTTP 200, SSE message |
| Requested / negotiated protocol | `2025-03-26` / `2025-03-26` |

This investigation did not auto-register the 22-operation allowlist as tools.
The 52 HTTP operations must not become MCP tools automatically.

## Conclusion

Lock official SDK v2.0.0, Fastify adapter 2.0.0, and
`@modelcontextprotocol/node` 2.0.0.

The supported MCP spec is `2025-03-26`. Later wire vocabulary in the SDK does
not enter the product contract. Upgrades need a dedicated compatibility pull
request.

When the product MCP ships:

- Tools follow the 22 locked operation IDs.
- Keep the eight read-only annotations, non-idempotent
  `handoff_current_work`, and idempotent `commit_handoff`.
- Additional protocol versions need a Python/TypeScript negotiation matrix
  before the lock changes.
