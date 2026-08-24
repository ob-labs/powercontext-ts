# Spike B：SQLite driver 选型

## 问题

`node:sqlite` 是否足以支撑 M2 的 FTS-only kernel，还是必须立刻引入
`better-sqlite3`？

## 做法

在 Node v24.14.1 上对照内置 `node:sqlite` `DatabaseSync` 与
`better-sqlite3@13.0.3`。后者和 `sqlite-vec@0.1.9` 仅是仓库根的 spike
devDependency，不进入任何发布包；pack smoke 继续证明 Protocol/Client 安装不含
native binding。

## 数据（Windows x64 本机样本；CI 在三大 OS 重跑）

| 检查 | 结果 |
| --- | --- |
| 物理文件 `PRAGMA journal_mode = WAL` | 两个候选均返回 `wal` |
| FTS5 + MATCH | 两个候选均为 1 hit |
| loadable extension | 两个候选均加载独立的 `sqlite-vec` probe，并返回 `v0.1.9` |
| foreign keys / busy timeout | 两个候选均为 `1` / `5000` |
| `BEGIN` / `INSERT` / `ROLLBACK` | `node:sqlite` 回滚后行数为 0 |
| 默认读取 `9007199254740992` | `RangeError: Value is too large to be represented as a JavaScript number` |
| `statement.setReadBigInts(true)` | 返回 `9007199254740992n` |
| 1000 次 SELECT：`node:sqlite` main | 约 1.89 ms |
| 1000 次 SELECT：`better-sqlite3` main | 约 1.31 ms |
| 1000 次 SELECT：`node:sqlite` worker | query 约 1.71 ms；含启动 round-trip 约 60.72 ms |
| close 后继续 prepare | 两个候选均确定失败 |
| Node 运行时警告 | `ExperimentalWarning: SQLite is an experimental feature` |

`sqlite-vec` 在这里**只用于证明通用 extension-loading 路径**，不属于产品依赖，
也不代表 Vec1 parity。Phase 10 的兼容目标仍是 Python 使用的 SQLite 官方 Vec1。
延迟数字只用于比较模型与暴露 worker 启动成本，不是性能门；Phase 5 仍需以真实
PowerContext workload 决定 main-thread/long-lived-worker 策略。

## 结论

**M2 FTS-only 选型：`node:sqlite`。**

理由：

1. 两个候选都能完成 FTS5、WAL、外键、扩展加载、事务和确定关闭；
   `node:sqlite` 不增加产品 native addon，适合作为 M2 FTS-only 首选。
2. 64-bit 读取必须默认打开 `readBigInts`，再走 ADR 0001 的
   `bigintToSafeInteger`。默认 number 模式会在越界时抛异常，不能当静默降级。
3. 它仍是 experimental。Phase 5 要把 backup、close race、event-loop budget
   和 long-lived worker RPC 原子性写成 repository contract。
4. 若后续 Vec1 在 `node:sqlite` 上不可靠，按路线停止条件
   **降级为 FTS-only**，不得伪造 vector。`better-sqlite3` 只作为 Runtime
   包内的备选，永远不能进入 Protocol/Client。
