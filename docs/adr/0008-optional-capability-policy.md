# ADR 0008：Optional capability 策略

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: runtime-owner, product-owner

## Context

PowerContext 的能力来自已经装配并 probe 成功的 Runtime，而不是 settings 文件里
写了某个键。Python 当前默认：Dashboard 启动、Handoff Report 启用、MCP 启用、
work 路由无 feature flag、memory rerank 关闭、tracing 关闭。

## Decision

1. 未实现、未配置或 probe 失败的能力必须显式 unavailable。禁止伪成功、空列表
   冒充“没有数据”、或把 fallback 说成请求模式成功。
2. `/v1/capabilities` 与 readiness 是唯一对外能力声明。settings 存在不等于
   capability 可用。
3. 默认值必须与 pinned Python 一致：
   - `dashboard.enabled = true`；
   - `handoff_report.enabled = true`；
   - work 路由无 feature flag，始终属于契约；
   - `mcp.enabled = true`；
   - `memory_rerank_enabled = false`；
   - `auth.enabled = false`；
   - `tracing.enabled = false`。
4. feature 被显式关闭时，必须从 route、表、MCP tool 和 UI 一致移除。
5. 在某个 milestone 之前尚未实现的 operation：
   - subset Server 不注册该 route；
   - 不把它写进当前 profile 的 OpenAPI parity 宣称；
   - 若请求到达，返回结构化 `ErrorResponse`（capability / unavailable），
     不得返回 200 空成功。
6. vector capability 只有在 embedding profile、Vec1 或 OceanBase index、以及
   projection policy 都可用后才能声明。
7. MCP 不得自动暴露全部 52 个 HTTP operation。只允许 lock 中的 22 个 ID，
   外加 Report 路由存在时的 workstream picker。

## Consequences

- M1 Client 可以调用 Python Server 的全部 52 个 operation。
- M2 TypeScript Server 只宣称 sqlite-fts subset。
- 每个未实现 capability 的行为以本 ADR 和 capability manifest 为准，不再靠口头约定。
