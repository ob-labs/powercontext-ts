# Phase 0 风险登记

基线：`733e4bf6b378785e76274ff07632029c699ecb09`。本表只登记会阻断 parity
或迫使路线改道的风险。

| ID | 风险 | 影响 | 等级 | 缓解 | 触发阶段 |
| --- | --- | --- | --- | --- | --- |
| R1 | Integer 越界 | JSON `number` 丢精度，破坏 position / CAS / usage | 高 | ADR 0001；Python 补 OpenAPI maximum；边界 fixture | P0 / P2 / P5 |
| R2 | Unicode / NFC | hash、FTS token、Windows 文件名与 canonical key 分叉 | 高 | ADR 0006；CJK / emoji / 组合字符 / lone surrogate fixtures | P4 / P6 / P8 |
| R3 | SQLite native | `node:sqlite` 仍是 RC；`better-sqlite3` 同步；Vec1 / FTS5 加载失败 | 高 | Phase 1 spike B；FTS-only 可降级，禁止伪造 vector | P1 / P5 / P10 |
| R4 | MCP version | FastMCP / 官方 TS SDK 默认协商不同；allowlist 被自动扩成 52 | 中 | Phase 1 spike C pin spec/SDK；lock 冻结 22 个 ID | P1 / P11 |
| R5 | OceanBase | MySQL 通过 ≠ OceanBase 通过；identity collation 回归 | 高 | 真实 tenant 验收；大小写变体 fixture | P10 / P12 |
| R6 | Provider | 非确定输出被拿来做 byte-for-byte 对比；密钥进入 CI | 中 | Fake / 录制 fixture 走主路径；真实 provider 仅 opt-in | P10 / P12 |
| R7 | Migration | 无全局 schema version 时双实现写同一库 | 高 | ADR 0002；未落地前禁止写既有 Python 库 | P5 / P12 |
| R8 | Contract drift | 独立仓库后静默追随 Python main | 高 | 双周 bump、PR drift check、nightly advisory | P0 起持续 |
| R9 | DSH Node 20 | 插件仍声明 `>=20`，Client 只测 22 / 24 | 中 | ADR 0007；Python 侧提升 engines | P3 / P11 |
| R10 | Draft RFC creep | 把 0048 / 0082 / 1223 的未实现段落做成 M4 | 中 | RFC 台账；Draft 不得当事实源 | 每个 milestone |

升级规则：风险变成既成事实时，必须先写 compatibility decision，再改 fixture
或代码。
