# Investigation: OpenAPI 3.0 to runtime Schema

## Question

Can OpenAPI 3.0 Schema be handed to Ajv (Draft 07) unchanged? How should
`nullable`, `allOf` / `oneOf`, boolean `exclusiveMinimum`, defaults, and extra
fields behave?

## Method

`tools/generate-protocol/src/oas3.ts` performs an explicit conversion. Corpus
tests are in `tools/generate-protocol/tests/oas3.test.ts`. Ajv options:

- `strict: false`
- `coerceTypes: false`
- `useDefaults: false`
- `removeAdditional: false`

## Result

| OAS3 input | Conversion |
| --- | --- |
| `{ type: string, nullable: true, minLength: 1 }` | `anyOf` string / null |
| `{ type: number, minimum: 0, exclusiveMinimum: true }` | `exclusiveMinimum: 0` |
| `{ type: integer }` | ADR 0001 overlay `±9007199254740991` |
| Nested `allOf` / `oneOf` / `nullable` | Recursed |
| Extra fields on `HealthResponse` | Ajv `valid === false` |

## Conclusion

Do not treat OpenAPI 3.0 Schema as ordinary JSON Schema Draft 7. The converter
id is `oas3-to-json-schema.v1`. Wire fixtures must cover omitted values,
explicit null, and discriminators. Do not rely on Ajv default coerce.
