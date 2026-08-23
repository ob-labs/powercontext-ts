# ADR 0005：Generated code policy

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: protocol-owner

## Context

`openapi-typescript` 只提供编译期类型，不能替代运行时校验。大而全的 Client
generator 也不会自动满足本项目对 response validation、redirect、bytes/text 和
error taxonomy 的要求。

## Decision

1. 生成源只能是 `contract/openapi/powercontext.yaml`。
2. 允许生成：
   - compile-time wire types；
   - operation metadata（id / method / path / location / scope）；
   - request 与 success / error response validators；
   - Server route schema / serializer 资产；
   - API coverage report。
3. 生成文件必须带 `DO NOT EDIT`、source digest 和 generator version。
4. 禁止手改生成物。必要 overlay 必须版本化，写明理由、影响字段和移除条件。
5. Domain model 可以使用 Zod / Valibot / 手写 guard，但那是 domain 层，不是
   第二份 wire schema。
6. 公共 Client 的 transport 手写；不把 OpenAPI Generator 的默认 TypeScript Fetch
   产物当作产品实现。
7. 生成漂移必须使 CI 失败。

## Consequences

- Phase 1 / Phase 2 先做生成链 spike，再写业务代码。
- 任何人在 `packages/protocol/src/generated` 里手工修补都会在 drift check 中失败。
