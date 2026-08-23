# ADR 0004：OpenAPI authority

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: protocol-owner, python-owner

## Context

`openapi/powercontext.yaml` 已经是 Python 仓库的 HTTP 事实源。若 TypeScript 再维护
一份手写 wire model，两个实现会在 extra field、nullable 和 default 上静默分叉。

## Decision

1. HTTP wire 的事实源在 Python 仓库的 OpenAPI 文档。
2. TypeScript 只消费 `contract/openapi/powercontext.yaml` 这份 pinned 快照。
3. 禁止在本仓库新增第二份 wire contract，包括：
   - 手写 OpenAPI / JSON Schema；
   - 手写 request / response interface 并当作契约；
   - 从运行时代码反推再覆盖生成物。
4. 发现 OpenAPI、fixture 与 Python 可观察行为冲突时，先开 compatibility decision：
   两端一起修，或记录 legacy 与移除条件。TypeScript 不得单方面“改得更合理”
   仍宣称 parity。
5. API version 当前为 `0.0.2`。version 变化必须伴随 baseline bump，而不是注释里改数字。

## Consequences

- 生成链、Client、Server 和 MCP 投影共用同一份快照。
- DSH 插件里的 OpenAPI 副本属于 Python 仓库，不构成本仓库的第二事实源。
- Draft RFC 里尚未进入 OpenAPI 的字段不是 TypeScript 的实现依据。
