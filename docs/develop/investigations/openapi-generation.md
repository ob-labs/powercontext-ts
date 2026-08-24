# Investigation: OpenAPI generation

## Question

Can `contract/openapi/powercontext.yaml` stably produce compile-time types, 52
operation metadata rows, and Ajv validators, with drift failing CI?

## Method

The generator lives in `tools/generate-protocol`. Entry points are
`pnpm generate` and `pnpm generate:check`. Output is only
`packages/protocol/src/generated/`.

| Artifact | Tool |
| --- | --- |
| `openapi-types.ts` | `openapi-typescript` |
| `operations.ts` | OpenAPI 3.0.3 walker |
| `validators.ts` | OAS3 conversion + `createWireValidator` |
| `coverage.json` | 52 operation / 177 schema inventory |

## Result

- 52 operations, including the four work-domain operations.
- 177 component schemas.
- `sourceDigest` matches the baseline lock OpenAPI SHA-256.
- `HealthResponse` accepts `{ status: "alive" }` and rejects `{}` and extras.
- Repeat `pnpm generate:check` is a zero drift.

## Conclusion

The generation loop is closed. Do not hand-write a second wire schema. The only
necessary overlay is the versioned `integer-safe-range.v1`.
