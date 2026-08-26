# Current status

TypeScript PowerContext is a second implementation. Python remains the
reference and semantic oracle.

| Surface | Status |
| --- | --- |
| Protocol types, operation metadata, and runtime validators | Available (`client` / C1) |
| Official typed HTTP Client transport | M1 release candidate (`client` / C1) |
| SQLite / OceanBase Runtime | Not shipped |
| HTTP Server, MCP, CLI, Dashboard | Not shipped |

`@powercontext/client` is the first independently packable product. Install it, import
`PowerContextClient`, and call operations against a compliant Server. Protocol
and Client tarballs must install without compiling a native addon.

See [Official typed Client](client.md).

The auditable acceptance record is the
[M1 Client exit review](../reviews/m1-client-exit-review.md).

See [Compatibility policy](../policies/compatibility.md) for what each profile
may claim.
