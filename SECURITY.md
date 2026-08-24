# Security policy

## Supported versions

This repository has not published a supported product release. Security reports
still apply to the checked-in Protocol validators, generated contracts, and
tooling.

Once packages are published, this file will list the versions that receive
fixes.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Report it privately through GitHub Security Advisories on this repository, or
follow the process used by
[oceanbase/powercontext](https://github.com/oceanbase/powercontext).

Include:

- A description of the issue and its impact
- Reproduction steps or a proof of concept
- Affected package, commit, or command

## Supply-chain notes

- `@powercontext/protocol` and `@powercontext/client` must not depend on native
  addons.
- Contract snapshots and conformance fixtures are generated. Hand edits are
  rejected.
- Dependency licenses and high/critical advisories are CI gates. See
  [docs/policies/dependencies.md](docs/policies/dependencies.md).
