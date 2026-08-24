# Spike E：OpenAPI 3.0 到运行时 Schema

## 问题

能不能把 OpenAPI 3.0 Schema 原样交给 Ajv（Draft 07）？`nullable`、
`allOf`/`oneOf`、boolean `exclusiveMinimum`、default、extra field 如何处理？

## 做法

`tools/generate-protocol/src/oas3.ts` 做显式转换，corpus 在
`tools/generate-protocol/tests/oas3.test.ts`。同一转换结果还装入真实 Fastify
response schema，经 `app.inject` 验证 nullable/union/default/extra/required 的
serializer 行为；生成的 `HealthResponse` validator 继续覆盖输入 extra field。

Ajv 选项（刻意与 Draft 07 默认行为拉开）：

- `strict: false`（OAS3 残留关键字不能当 Draft 07 strict）
- `coerceTypes: false`
- `useDefaults: false`
- `removeAdditional: false`

## 数据

| OAS3 输入 | 转换结果 |
| --- | --- |
| `{ type: string, nullable: true, minLength: 1 }` | `{ anyOf: [{ type: string, minLength: 1 }, { type: 'null' }] }` |
| `{ type: number, minimum: 0, exclusiveMinimum: true }` | `{ type: number, exclusiveMinimum: 0 }` |
| `{ type: integer }` | 加上 ADR 0001 overlay `minimum/maximum = ±9007199254740991` |
| `{ type: integer, minimum: 1, maximum: 8 }` | 保留更窄边界 |
| `allOf` + `oneOf` + 嵌套 `nullable` | 递归转换 |
| `{ type: boolean, default: false }` | 保留 `default`，校验时不应用 |
| `HealthResponse` + `{ status, extra: true }` | Ajv `valid === false`（`additionalProperties: false`） |
| Fastify response 含 nullable `null`、extra、default | 保留 null、移除 extra、输出 default |
| Fastify response 缺 required 字段 | serialization 失败并返回 500 |

## 结论

**validator/serializer spike 通过。** 禁止把 OpenAPI 3.0 Schema 当普通 JSON
Schema Draft 7。转换器 id 为 `oas3-to-json-schema.v1`。Phase 2 必须把 omitted /
explicit null / discriminator 扩展为全量 wire fixtures，而不是依赖 Ajv 默认
coerce。
