# Phase 0 退出记录

完成日期：2026-08-23

## 交付物

| 要求 | 位置 |
| --- | --- |
| Baseline lock | `contract/baseline.lock.yaml` |
| OpenAPI snapshot | `contract/openapi/powercontext.yaml` |
| Capability manifest | `docs/governance/capability-manifest.yaml` |
| 阻塞 ADR | `docs/adr/0001-integer-boundary.md`、`docs/adr/0002-database-schema-ownership.md` |
| 常规 ADR | `docs/adr/0003` 至 `0009` |
| RFC 台账 | `docs/governance/rfc-ledger.yaml` |
| 风险登记 | `docs/governance/risk-register.md` |
| 范围声明 | `docs/governance/scope.md` |
| Full parity 定义 | `docs/governance/full-parity.md` |
| Cadence | `docs/governance/contract-sync-cadence.md` |
| 贡献规则 | `CONTRIBUTING.md` |

## 验收门

- [x] 52 个 operation、177 个 schema、领域 capability 都有 owner 与 target milestone
- [x] full parity 有书面定义；未实现 capability 有明确 response / capability 行为
- [x] integer 与 schema ownership 两个阻塞 ADR 已批准
- [x] baseline lock 含 Python pin、MCP allowlist digest 与默认配置 digest
- [x] 仓库分离 ADR 已批准；本仓库位于 Python 项目同级目录
- [x] 禁止第二份 wire contract、禁止手改快照的规则已写入 `CONTRIBUTING.md`

## 已知跨仓库后续

- Python：integer `maximum` / `minimum`（ADR 0001）
- Python：全局 schema version 与拒写（ADR 0002）
- Python：DSH `engines` 提升到 Node 22（ADR 0007）
- 本仓库 Phase 1：pnpm workspace、CI、完整 contract-sync
