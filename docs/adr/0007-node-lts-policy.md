# ADR 0007：Node LTS 策略

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: product-owner, protocol-owner

## Context

调研时 Node 24 与 22 是 LTS，Node 20 已 EOL。现有 DSH 插件声明 `engines.node >= 20`。
不能一面保持该声明，一面无测试地依赖只支持 22 / 24 的官方 Client。

## Decision

1. 生产 Runtime（`builtin` / `server` / `cli`）以 Node 24 LTS 为基线。
2. Client 与 Protocol 必须在 Node 22 与 Node 24 上由 CI 验证。`engines` 写
   `>=22 <25`，或等价的“支持 22 与 24 LTS”。
3. 不维护 Node 20 兼容构建。EOL 运行时不进入支持矩阵。
4. DSH 插件的 `>=20` 声明必须提升到 `>=22`。改造在 Python 仓库独立 PR 中进行，
   可延至 Phase 3 设计、Phase 11 落地。在那之前，官方 Client 文档必须写明
   Node 20 不受支持。
5. 选择“提升 DSH 最低版本”，不选择“为 Node 20 维持第二套构建”。
6. 包为 ESM-only，`moduleResolution: NodeNext`。

## Consequences

- Phase 1 CI 必须包含 Node 22 / 24 Client matrix 与 Node 24 Runtime matrix。
- 纯 Protocol / Client 安装不得触发 native build。
- 宿主若仍停在 Node 20，只能继续调用 Python Server，不能把官方 TS Client
  标成受支持。
