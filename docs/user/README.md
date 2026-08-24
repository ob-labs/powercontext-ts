# Current status

TypeScript PowerContext is a second implementation. Python remains the
reference and semantic oracle.

| Surface | Status |
| --- | --- |
| Protocol types, operation metadata, and runtime validators | Available (`client` / C1 foundation) |
| Official typed HTTP Client transport | Not shipped |
| SQLite / OceanBase Runtime | Not shipped |
| HTTP Server, MCP, CLI, Dashboard | Not shipped |

Installable packages currently publish packable skeletons. Protocol and Client
tarballs must install without compiling a native addon.

See [Compatibility policy](../policies/compatibility.md) for what each profile
may claim.
