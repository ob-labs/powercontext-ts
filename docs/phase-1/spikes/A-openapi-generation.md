# Spike A：OpenAPI 生成链

## 问题

能否从 `contract/openapi/powercontext.yaml` 稳定生成 compile-time types、
52 条 operation metadata、Ajv validators，并且让漂移在 CI 失败？

## 做法

生成器在 `tools/generate-protocol`。入口是 `pnpm generate` /
`pnpm generate:check`。产物只写到
`packages/protocol/src/generated/`，带 `DO NOT EDIT`、source digest 和
`generatorVersion: 0.1.0-phase1`。

| 产物 | 工具 |
| --- | --- |
| `openapi-types.ts` | `openapi-typescript` 7.13.0 |
| `operations.ts` | 自写 OpenAPI 3.0.3 walker（对齐 DSH 的 id/method/path/location/scope） |
| `validators.ts` | OAS3 转换 + `createWireValidator`（Ajv 8.20.0，`ajv-formats` 3.0.1） |
| `coverage.json` | 52 operation / 177 schema 清单 |

## 数据

- 解析到 **52** 个 operation，含 work 域四条。
- 解析到 **177** 个 component schema。
- `sourceDigest` =
  `a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3`，
  与 baseline lock 的 OpenAPI SHA-256 一致。
- `HealthResponse` 接受 `{ status: "alive" }`，拒绝 `{}` 和多余字段。
- `pnpm generate:check` 在重复运行后零漂移。

## 结论

生成链最小闭环成立，可以进入 Phase 2 补全每个 operation 的
request/success/error validator 与 wire fixtures。禁止手写第二份 wire
schema。必要 overlay 只有已版本化的 `integer-safe-range.v1`。
