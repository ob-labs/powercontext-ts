# contract-sync cadence

## 节奏

每两周一次 baseline bump PR，由 `tools/contract-sync` 生成快照 diff。

紧急 wire-breaking 或安全修复可以提前 bump，但不能把 bump 塞进普通功能 PR。

## Bump PR 必须包含

1. 新的 `python_commit` 与 `openapi_sha256`；
2. operation / schema 数量变化说明；
3. MCP allowlist、默认配置、CLI 树若有变化，同步更新 digest；
4. compatibility review 结论：兼容、有补偿、或 wire-breaking；
5. 同一 pin 导出的 fixture / expected 更新；
6. RFC 台账与 capability manifest 的对应修订。

## 禁止

- 在 feature PR 中静默追随 Python `main`；
- 混用不同基线的 OpenAPI 快照与 conformance fixtures；
- 手工编辑 `contract/` 或 `conformance/` 快照去“对齐测试”；
- 未更新 lock 就提交新的生成物。

## 检测

- 每个 PR：`python tools/contract-sync/verify.py`，快照与 lock 不一致即失败。
- nightly：对比 Python `main` 的 OpenAPI，只产生 advisory issue，不阻断日常 PR。
- 同一 pin 连续跑两次 contract-sync，工作树必须零 diff。

这条节奏不是可选项。API 0.0.2 仍在演进，08-20 至 08-23 已经新增 work 域。
不定期 rebase 的唯一结果，是开工数月后的大爆炸合并。
