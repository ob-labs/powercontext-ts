# Dependency policy

## Lockfile

- pnpm 10.33.2 is the workspace package manager.
- CI installs with `pnpm install --frozen-lockfile`.
- Feature pull requests must not float `latest` for Fastify, Ajv, the MCP SDK,
  an AI SDK, or SQLite drivers.

## License baseline

Default-allowed SPDX identifiers:

- Apache-2.0
- MIT
- BSD-2-Clause
- BSD-3-Clause
- ISC
- 0BSD
- CC0-1.0
- BlueOak-1.0.0
- Unlicense

`pnpm deps:licenses` reads the installed graph through
`pnpm licenses list --json` and fails on an unapproved license expression. The
current graph also contains `(MIT OR CC0-1.0)` and the legacy npm metadata
value `MIT OR Apache`; both alternatives are permissive. The latter is confined
to the root-only `sqlite-vec` investigation packages.

New runtime dependencies with other licenses need an explicit compatibility
decision.

## Security baseline

`pnpm deps:audit` queries the npm advisory database for the frozen lockfile and
fails CI on high or critical vulnerabilities. Moderate or lower findings still
require triage. They do not make the workspace unavailable while the finding
has no published runtime path.

## Native modules

`@powercontext/protocol` and `@powercontext/client` must not depend on native
addons. Installing those tarballs must not compile `better-sqlite3` or any
other binding. SQLite drivers stay in the Runtime profile and are selected
when persistence work starts; see
[docs/develop/investigations/sqlite-driver.md](../develop/investigations/sqlite-driver.md).

`pnpm pack:smoke` proves this through a clean temporary project that installs
only the packed Protocol and Client tarballs. The gate rejects native
package/build markers, then imports both packages.

The repository root carries `better-sqlite3@13.0.3` and `sqlite-vec@0.1.9` as
development probes. They are absent from every package manifest and published
tarball. `sqlite-vec` proves generic loadable-extension support only. It is
not the product Vec1 adapter and must never be reported as Vec1 parity.

## Provenance template

Public packages declare:

```json
"publishConfig": {
  "access": "public",
  "provenance": true
}
```

npm provenance is enabled at publish time. The manifest template is already
present.
