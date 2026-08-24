# Investigation: 64-bit integers and JSON

## Question

What do `JSON.parse`, SQLite `INTEGER`, and `JSON.stringify` do past
`Number.MAX_SAFE_INTEGER`? Is `Number.isSafeInteger` enough for ADR 0001?

## Method

`@powercontext/protocol` exposes `assertSafeInteger`, `bigintToSafeInteger`,
and `findUnsafeIntegerTokens`. SQLite behavior is in
[sqlite-driver.md](sqlite-driver.md).

## Result

| Operation | Observation |
| --- | --- |
| `JSON.parse('{"position":9007199254740993}')` | Becomes `9007199254740992` (precision already lost; result is still a safe integer) |
| `findUnsafeIntegerTokens` on the same text | `['9007199254740993']` |
| String `"ticket 9007199254740993"` | Not a false positive |
| `JSON.stringify(9007199254740992n)` | `TypeError` |
| `assertSafeInteger(9007199254740992)` | `SafeIntegerError` |
| SQLite default read of an out-of-range INTEGER | `RangeError` |
| SQLite `setReadBigInts(true)` then convert | `bigintToSafeInteger` rejects |

Checking `Number.isSafeInteger` after `JSON.parse` cannot catch
`9007199254740993`, because parsing has already rounded it to
`9007199254740992`. Scan integer tokens on the raw JSON text, or use a
lossless JSON parser.

## Conclusion

ADR 0001’s TypeScript surface is:

1. HTTP / MCP / CLI JSON entry uses a string-aware JSON number lexer.
2. Database INTEGER always uses `readBigInts`, then `bigintToSafeInteger`.
3. Never `JSON.stringify(bigint)`.
4. Never leak bigint into the domain canonical model.

Python still needs OpenAPI `minimum` / `maximum` as a cross-repository follow-up.
