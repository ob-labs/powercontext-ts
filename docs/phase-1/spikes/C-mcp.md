# Spike C：MCP TypeScript SDK v2

## 问题

官方 TypeScript SDK v2 能否与 Fastify 做 in-process Streamable HTTP，版本
如何锁定？

## 做法

把下列包 **精确 pin 到 2.0.0**，作为 root `devDependencies`（不进入
Protocol/Client 运行时图）：

- `@modelcontextprotocol/server@2.0.0`
- `@modelcontextprotocol/fastify@2.0.0`
- `@modelcontextprotocol/node@2.0.0`

配套 Fastify 解析为 `5.12.1`。测试在
`tools/spikes/mcp/mcp-fastify.test.ts`。

## 数据

| 检查 | 结果 |
| --- | --- |
| `new McpServer` + allowlisted tool | 成功 |
| Fastify `/mcp` + `NodeStreamableHTTPServerTransport` | 成功 |
| JSON-RPC `initialize` over in-process HTTP | HTTP 200，SSE message |
| 请求/协商协议 | `2025-03-26` / `2025-03-26` |
| SDK pin | server/fastify/node 均为 `2.0.0` |
| baseline lock | `mcp_protocols: [2025-03-26]`，`locked-phase1-spike-c` |

未在本 spike 把 22-operation allowlist 自动注册成 tool。路线禁止把 52 个
HTTP operation 自动暴露为 MCP。

## 结论

**锁定官方 SDK v2.0.0 + Fastify adapter 2.0.0 + `@modelcontextprotocol/node` 2.0.0。**

PowerContext 对外支持的 MCP spec 固定为 `2025-03-26`：SDK v2.0.0 对该版本可
成功协商，这也保留了与 pinned Python/FastMCP 基线的兼容口径。SDK 中更晚的 wire
词汇不自动进入产品 contract；升级必须走独立 compatibility PR。

Phase 11 实现产品 MCP 时：

- tool 集合必须按 lock 里的 22 个 operation ID digest 管理；
- 8 个 read-only annotations、`handoff_current_work` 非幂等、
  `commit_handoff` 幂等保持不变；
- 若要增加其他协议版本，必须先做 Python/TS negotiation matrix，再显式更新 lock；
  不跟随 SDK 默认值静默扩展支持声明。
