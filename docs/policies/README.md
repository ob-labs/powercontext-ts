# Policies

Living rules for this repository. They are not construction diaries.

| Document | Role |
| --- | --- |
| [compatibility.md](compatibility.md) | Profiles, C0–C5 levels, and when full parity may be claimed |
| [contract-sync.md](contract-sync.md) | How the Python pin moves |
| [dependencies.md](dependencies.md) | License, audit, and native-module rules |
| [risks.md](risks.md) | Risks that can block parity |
| [rfc-ledger.yaml](rfc-ledger.yaml) | Python RFC status used for TypeScript parity |
| [capability-manifest.yaml](capability-manifest.yaml) | Owners, targets, and unimplemented defaults |

Machine checks read the YAML files through `tools/contract-sync`.
