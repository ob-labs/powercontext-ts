# ADR 0001：Integer 边界策略

- Status: Accepted
- Date: 2026-08-23
- Kind: Blocking (Phase 5 write gate)
- Owners: protocol-owner, python-owner

## Context

PowerContext OpenAPI 3.0.3 把大量计数、游标、revision、usage 和统计字段标成
`integer`，其中多数没有 `maximum`。Python 用任意精度 `int`。JavaScript `number`
只能安全表示 `-(2^53-1)` 到 `2^53-1`（`Number.MAX_SAFE_INTEGER` = 9007199254740991）。
超出后 JSON 解析会静默丢精度，破坏 journal position、CAS、usage 和 hash 输入。

建设路线要求三选一，并执行到 OpenAPI / Python：

1. 把 wire integer 约束为 `Number.MAX_SAFE_INTEGER`；
2. 改成十进制 string（wire-breaking）；
3. TypeScript 对 unsafe integer 报 invalid response，并承认非 full parity。

## Decision

选择方案 1，并把它写成跨语言契约。

1. 所有 JSON wire `integer` 的有效范围是
   `-9007199254740991` 到 `9007199254740991`，除非字段已经有更窄的
   `minimum` / `maximum`。
2. Python 仓库必须补 OpenAPI `minimum` / `maximum`，并让 Pydantic 模型执行同一边界。
   这是独立的 Python PR，不在本仓库改 OpenAPI 事实源。
3. 在 Python PR 合并并被 baseline bump 吸收之前，TypeScript 仍按本 ADR 校验：
   请求、响应、数据库读回和 CLI JSON 里的整数必须先通过 `Number.isSafeInteger`。
   失败时返回 invalid request / invalid response，禁止四舍五入、截断或改成 `bigint`
   再 `JSON.stringify`。
4. 数据库 `BIGINT` / `INTEGER` 用无损模式读取。`bigint -> number` 与
   `number -> DB` 都必须先证明值落在 safe integer 内。
5. 不采用方案 2。现网 v0.0.2 已发布，string 化会破坏 Client 与数据库互读。
6. 不采用方案 3 作为终态。它会把 full parity 永远关在门外。

## Consequences

- Full parity 仍然可宣称，前提是 Python 与 TypeScript 拒绝同一批越界值。
- journal position、revision、usage、token statistics 必须有边界 fixture。
- 若未来某字段确实会超过 2^53-1，必须开新的 wire-breaking RFC，不能在本 ADR
  下偷偷改用 string。
- Phase 5 写入硬门：本 ADR 已批准；Python OpenAPI 补边界是跨仓库前置项，
  未落地前 TypeScript 不得打开既有 Python 数据库写路径。

## Follow-up

- Python PR：为全部 integer schema 补 safe-range。
- Phase 1 spike F：SQLite `bigint` 读取与 JSON 边界失败语义。
- Phase 2：每个 integer 字段的 valid / invalid fixture。
