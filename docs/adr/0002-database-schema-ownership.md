# ADR 0002：Database schema ownership

- Status: Accepted
- Date: 2026-08-23
- Kind: Blocking (persistence write gate)
- Owners: runtime-owner, python-owner

## Context

当前 Python 主要靠 `create_all` 和少量显式 DDL 管理表，没有全局 schema version、
manifest digest 或 unknown-version 拒写。v0.0.2 已公开发布，迁移承诺必须覆盖该
版本创建的数据库。两个实现若各自 `CREATE TABLE IF NOT EXISTS`，共享数据库会在
静默漂移后无法互读。

## Decision

数据库 schema 是跨语言公共资产，所有权不在 TypeScript，也不在某一个 ORM。

1. 引入语言无关的 `powercontext.database` contract。第一个受治理版本在 Python
   落地后编号为 `powercontext.database.v1`。当前基线称为
   `unversioned-v0.0.2-anchor`，只作为升级源，不是可写目标。
2. 每个受治理数据库必须能读出：
   - 全局 schema version；
   - schema manifest / DDL digest；
   - supported read range 与 supported write range。
3. 启动时做兼容性检查。unknown 或过新 version：拒写，且探测不得隐式改库。
   只读是否允许由 supported read range 决定。
4. migration 必须进入 registry，禁止运行时发明 DDL。
5. M2 / M3 只支持 exclusive writer。双向互读是离线交接，不是双进程同写。
6. 先在 Python reference 落地同一识别逻辑，再允许 TypeScript 打开既有 Python
   数据库执行写入。TypeScript 可以对自己创建的实验库写，但不得宣称共享库
   parity。
7. 锚点是 v0.0.2 公开发布后创建的数据库。

## Consequences

- 持久化写入打开之前没有全局 version 实现，这是已知缺口，不是 TypeScript 可以单方面补的。
- Python 仓库需要独立 PR / RFC 落地识别逻辑；本仓库只消费 pinned 后的行为。
- `baseline.lock.yaml` 的 `database_schema_digest` 冻结的是 733e4bf6 上的表定义源文件，
  不是已治理的 contract version。
- 未执行本 ADR 到代码前，禁止宣称 persistence C3。

## Follow-up

- Python PR：schema version 表 / manifest、拒写、migration registry 骨架。
- M2：TypeScript 实现同一检查，并做 Python ↔ TypeScript 离线互读。
- M4：公开版本 migration rehearsal 与 backup / rollback。
