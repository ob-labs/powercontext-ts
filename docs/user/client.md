# Official typed Client

`@powercontext/client` is the M1 product. It is a Fetch-based typed HTTP
Client for the pinned OpenAPI snapshot (52 operations). Install it in a clean
project, import `PowerContextClient`, and call operations against a compliant
Server.

This package claims **`client` / C1** only. It is not a local Runtime, SQLite
database, MCP server, CLI, or full-product replacement for Python.

## Support matrix

| Surface | Claim |
| --- | --- |
| Protocol types and runtime validators | Available |
| Typed methods for 52 operations | Available |
| TypeScript Client → Python Server | C1 wire parity |
| Node 22 and Node 24 LTS | Supported |
| Node 20 | Not supported |
| Native addons on install | None |

See the [package README](../../packages/client/README.md) for the quickstart
and transport rules.
