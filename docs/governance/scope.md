# Phase 0 范围声明

## 本仓库要建成的产品

与 Python PowerContext 语义对齐的 TypeScript 产品线，按四个 milestone 发布：

- M1 `client`：Protocol + official typed Client
- M2 `sqlite-fts`：Core + SQLite FTS + Memory + subset Server
- M3 domain runtime：Review / Experience / Skill / Handoff / Work / Report / Scheduler
- M4 `full-product`：inference、vector、OceanBase、完整 HTTP / MCP / CLI / 宿主

## M1 非目标

- 本地数据库、Scheduler、MCP Server、Dashboard
- 在 Client 包里放入 DSH 审批或宿主策略
- 实现 52 个 HTTP route

## M2 非目标

- embedding、Vec1、hybrid、rerank 模型调用
- OceanBase
- Experience / Skill / Handoff / Work / Report 完整域
- 22-tool MCP、完整 CLI、五宿主验收
- 把 `flush_memory` 的模型抽取路径说成已对齐

## 明确不移植

- Python 模块 / 类布局，以及 Pydantic、SQLAlchemy、FastAPI、FastMCP、Pydantic AI
  内部类型
- 生成的 Python HTTP 文件
- `evaluation/` 的 Web、Worker、容器调度和报告实现
- Codex、Claude Code、DSH、Bub、Hermes 插件的实现语言
- Draft RFC 中尚未落地的未来能力

## 评测平台策略

复用，不移植。Python 仓库的 `evaluation/` 继续作为评测控制面。需要 TypeScript
Server 时，由 Python 侧增加 SUT adapter / profile。本仓库只提供可被黑盒驱动的
Server 与 parity 证据。
