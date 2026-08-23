# Full parity 书面定义

本文是 Phase 0 对“完整对齐”的唯一定义。口头上的“差不多了”或“测试绿了”
不能替代它。

## 等级

| 等级 | 名称 | 判定 |
| --- | --- | --- |
| C0 | API shape | 符号或 route 存在，能编译 |
| C1 | Wire parity | OpenAPI 请求 / 响应 / 错误 / 序列化一致 |
| C2 | Domain parity | 状态转移、校验、幂等、冲突一致 |
| C3 | Persistence parity | 事务、schema、互读、migration、rebuild 一致 |
| C4 | Operational parity | 生命周期、readiness、metrics、tracing、CLI、failover 一致 |
| C5 | Release parity | 平台矩阵、升级、文档、安全、性能预算和长期支持达标 |

## 何时可以宣称 full parity

必须同时满足：

1. OpenAPI 52 / 52 operation 与 177 schema 无未解释 drift。
2. capability manifest 里每个公开 capability 都有 C1–C4 证据；C5 有发布证据。
3. 相同 golden input 下，Python 与 TypeScript 产生相同 canonical bytes、hash、
   ID、顺序、状态和错误。
4. 两个 Runtime 可以读取对方创建的受支持版本数据库。
5. CAS、no-op、rollback、cursor failure 和 close race 场景一致。
6. SQLite FTS 与 PreparedContext 达到 contract-level 一致。
7. vector / hybrid 在允许的 backend-specific raw score 差异下满足共同排序契约。
8. MCP allowlist、annotations、HTTP 映射、CLI exit code 和权限边界一致。
9. 迁移覆盖 v0.0.2 及之后公开版本，并有 backup / rollback 说明。
10. capabilities 准确声明未配置或不可用能力，不伪装全功能。
11. 共同 acceptance（含 LoCoMo 派生 E2E、observability）达标。评测平台本身
    不移植。
12. 发布包在声明的 OS / CPU / Node LTS / 数据库上验证。

## 不是 full parity 的成功状态

| 实际交付 | 允许的说法 | 禁止的说法 |
| --- | --- | --- |
| Protocol + Client | TypeScript Client parity（`client` / C1） | PowerContext TypeScript 完全版 |
| SQLite FTS Runtime | Node Runtime Core profile（`sqlite-fts` / C3） | full-product C5 |
| Domain Runtime | M3 domain runtime C3 | 已完成移植 |

未实现 capability 的行为固定为 ADR 0008：不注册、不宣称、返回 unavailable，
不返回伪成功。
