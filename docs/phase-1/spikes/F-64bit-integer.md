# Spike F：64-bit 整数与 JSON 边界

## 问题

`JSON.parse`、SQLite `INTEGER` 和 `JSON.stringify` 在越过
`Number.MAX_SAFE_INTEGER` 时分别做什么？ADR 0001 能否只靠
`Number.isSafeInteger`？

## 做法

`@powercontext/protocol` 提供 `assertSafeInteger` /
`bigintToSafeInteger` / `findUnsafeIntegerTokens`。SQLite 路径见 Spike B。

## 数据

| 操作 | 观察 |
| --- | --- |
| `JSON.parse('{"position":9007199254740993}')` | 得到 `9007199254740992`（**已经丢精度**，且结果仍是 safe integer） |
| `findUnsafeIntegerTokens` 扫同一段原文 | `['9007199254740993']` |
| 字符串 `"ticket 9007199254740993"` | 不误判 |
| `9007199254740993e0` / `.0` | 在 parse 前识别为 unsafe integer |
| `1e1000000000` | 有界判定为 unsafe，不分配巨型字符串 |
| `JSON.stringify(9007199254740992n)` | `TypeError`（不能把 bigint 直接当 JSON number） |
| `assertSafeInteger(9007199254740991)` | 通过 |
| `assertSafeInteger(9007199254740992)` | `SafeIntegerError` |
| `assertSafeInteger(1.5)` / `NaN` / `Infinity` | 拒绝 |
| SQLite 默认读取越界 INTEGER | `RangeError` |
| SQLite `setReadBigInts(true)` 后再转换 | bigint 进入 `bigintToSafeInteger` 后拒绝 |

关键结论：`JSON.parse` 之后再检查 `Number.isSafeInteger` **抓不住**
`9007199254740993`，因为解析结果已经是 `9007199254740992`。必须在原始 JSON
文本上扫描 integer token，或使用无损 JSON parser。

## 结论

ADR 0001 的 TypeScript 执行面固定为：

1. HTTP/MCP/CLI JSON 入口使用 string-aware JSON number lexer；对数学上为整数的
   plain/decimal/exponent token 做十进制精确判定，越界即 invalid request/response；
2. 数据库 INTEGER 一律 `readBigInts`，再 `bigintToSafeInteger`；
3. 禁止 `JSON.stringify(bigint)`；
4. 不把 bigint 漏进 domain canonical model。

Phase 2 要为 revision / position / usage / token statistics 各做 valid/invalid
fixture。Python OpenAPI 补 `minimum`/`maximum` 仍是跨仓库前置项。
