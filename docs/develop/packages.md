# Packages

The `@powercontext/*` names below are the public package contract. npm
namespace ownership and publication credentials are release-operations
prerequisites; they do not change consumer import paths.

| Directory | Package | First milestone |
| --- | --- | --- |
| protocol | `@powercontext/protocol` | M1 |
| client | `@powercontext/client` | M1 (typed HTTP Client) |
| core | `@powercontext/core` | M2 |
| builtin | `@powercontext/builtin` | M2 |
| server | `@powercontext/server` | M2 / M4 |
| cli | `@powercontext/cli` | M2 / M4 |
| conformance-runner | `@powercontext/conformance-runner` | M1 (private) |

Dependency direction is `protocol <- client` and
`core <- builtin <- server <- cli`. `conformance/` stays at the repository root
and never enters an npm package.

Do not split database or search adapters into extra public packages before the
Runtime profile needs them.
