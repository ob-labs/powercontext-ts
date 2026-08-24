# Dependency governance

Phase 1 baseline for the TypeScript workspace.

## Lockfile

- pnpm 10.33.2 is the workspace package manager.
- Every install in CI uses `pnpm install --frozen-lockfile`.
- Feature PRs must not float `latest` for Fastify, Ajv, MCP SDK, AI SDK or SQLite drivers.

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

`pnpm deps:licenses` reads the installed dependency graph through
`pnpm licenses list --json` and fails on an unapproved license expression. The
current graph also contains `(MIT OR CC0-1.0)` and the legacy npm metadata value
`MIT OR Apache`; both alternatives are permissive. The latter is confined to the
root-only `sqlite-vec` spike packages.

New runtime dependencies with other licenses need an explicit compatibility decision.

## Security baseline

`pnpm deps:audit` queries the npm advisory database for the frozen lockfile and
fails CI on high or critical vulnerabilities. On 2026-08-24 the locked Phase 1
graph reports no known vulnerabilities. Moderate or lower findings still require
triage, but do not make this exploratory workspace unavailable while the finding
has no published runtime path.

## Native modules

`@powercontext/protocol` and `@powercontext/client` must not depend on native addons. A Protocol/Client tarball install must not compile `better-sqlite3` or any other binding. SQLite drivers stay in the Runtime profile and are selected in Phase 5 from the Phase 1 spike.

`pnpm pack:smoke` proves this through a dedicated clean temporary project that
installs only the packed Protocol and Client tarballs. The gate rejects native
package/build markers in the install output, package store and generated
lockfile, then imports both packages. This is separate from the all-seven-package
pack/import smoke.

The repository root carries `better-sqlite3@13.0.3` and `sqlite-vec@0.1.9` as
Phase 1-only development probes. They are absent from every package manifest and
published tarball. `sqlite-vec` proves generic loadable-extension support only;
it is not the product Vec1 adapter and must never be reported as Vec1 parity.

## Provenance template

Public packages declare:

```json
"publishConfig": {
  "access": "public",
  "provenance": true
}
```

npm provenance is enabled at publish time; Phase 1 only lands the manifest template.
