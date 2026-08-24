# Risk register

Baseline: `733e4bf6b378785e76274ff07632029c699ecb09`. This table records risks
that can block parity or force a route change.

| ID | Risk | Impact | Level | Mitigation | Tracked by |
| --- | --- | --- | --- | --- | --- |
| R1 | Integer overflow | JSON `number` loses precision and breaks position / CAS / usage | High | ADR 0001; Python OpenAPI `maximum`; boundary fixtures | ADR 0001, M2 writes |
| R2 | Unicode / NFC | Hash, FTS tokens, Windows names, and canonical keys diverge | High | ADR 0006; CJK / emoji / combining / lone-surrogate fixtures | ADR 0006 |
| R3 | SQLite native | `node:sqlite` is still experimental; Vec1 / FTS5 load failures | High | Investigation: `node:sqlite` for M2 FTS-only; degrade to FTS, never fake vector | ADR 0001, M2 |
| R4 | MCP version | Official TS SDK and FastMCP may negotiate different versions; allowlist expands to 52 | Medium | Pin spec/SDK; lock the 22 operation IDs | ADR 0007, M4 |
| R5 | OceanBase | MySQL passing is not OceanBase passing; identity collation regressions | High | Real tenant acceptance; case-variant fixtures | M4 |
| R6 | Provider | Non-deterministic output used for byte comparison; secrets in CI | Medium | Fake / recorded fixtures on the main path; live providers opt-in | M4 |
| R7 | Migration | Dual writers without a global schema version | High | ADR 0002; do not write existing Python databases until it lands | ADR 0002, M2 |
| R8 | Contract drift | The independent repository silently follows Python `main` | High | Biweekly bump, PR drift check, nightly advisory | [contract-sync.md](contract-sync.md) |
| R9 | DSH Node 20 | Plugin still declares `>=20`; Client is tested on 22 / 24 | Medium | ADR 0007; raise `engines` on the Python side | ADR 0007 |
| R10 | Draft RFC creep | Unimplemented RFC 0048 / 0082 / 1223 clauses become M4 work | Medium | RFC ledger; Draft is not a fact source | [rfc-ledger.yaml](rfc-ledger.yaml) |

When a risk becomes fact, write a compatibility decision before changing
fixtures or code.
