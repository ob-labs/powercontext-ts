# ADR 0003：仓库分离与契约同步

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: protocol-owner, conformance-owner

## Context

建设路线要求 TypeScript 独立建仓，不进入 Python 仓库，不共享 OpenAPI 文件、
fixtures、release tag 与 CI。分离的代价是契约会漂，必须用显式同步补偿。

## Decision

1. 仓库名定稿为 `powercontext-ts`，位于 Python 项目同级目录：

   ```text
   <workspace>/
     powercontext/       # Python reference
     powercontext-ts/    # this repository
   ```

2. npm 包作用域占位为 `@powercontext/*`。正式发布前再确认组织名，不提前
   抢占公共 registry。
3. 两仓库之间只保留两条 Python → TypeScript 通道：
   - `tools/contract-sync`：按 lock 中的 commit 拉取 OpenAPI 快照并更新 digest；
   - oracle 导出：安装 pinned `powercontext`（研究文档里的 `powermem` 是历史名，
     实际发行包是 `powercontext`）生成 conformance fixtures。
4. 禁止第三条通道：不得手改快照，TypeScript 改动不得回写 Python 仓库。
5. 吸收 Python `main` 的节奏见 `docs/policies/contract-sync.md`：
   每两周一次 baseline bump PR，必须走 compatibility review，并同步更新 fixtures。
6. 快照 digest 规则：
   - OpenAPI digest 是 pinned git blob 的 SHA-256（LF）；
   - 同一 pin 重复同步必须零 diff；
   - 禁止在 feature PR 里混用不同基线的快照与 fixtures。
7. 漂移处理：
   - PR CI：快照与 lock 不一致则失败；
   - nightly：对 Python `main` 做 advisory 检测，只开 compatibility review，
     不阻塞普通 PR。

## Consequences

- Python CI 不再负担 TypeScript 工具链；TypeScript 从第一天自建质量门。
- 契约一致性从“同仓库自动一致”变成“显式同步”。不执行补偿就会分叉。
- 跨仓库项（schema 治理、DSH 依赖官方 Client、evaluation SUT profile）一律走
  Python 独立 PR。

## Follow-up

- contract-sync 与 nightly advisory 已落地。
- 发布前确认 `@powercontext` npm 组织名。
