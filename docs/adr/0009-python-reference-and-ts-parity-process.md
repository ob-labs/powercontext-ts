# ADR 0009：Python reference 与 TypeScript parity process

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: conformance-owner, python-owner

## Context

Python 是 reference implementation 与语义权威。TypeScript 通过对同一规范和
conformance 套件追齐。若把 Draft RFC 或“看起来更干净的设计”当成目标，M4 会
变成隐性重写。

## Decision

1. 事实源优先级：
   1. 已接受且适用于当前版本的 ADR；
   2. pinned OpenAPI 快照；
   3. 版本化 conformance fixtures / expected results；
   4. pinned Python 的可观察行为与公共 acceptance test；
   5. 已实现 RFC 所描述、且仍与源码一致的行为。
2. Draft RFC 不得作为 parity 事实源，也不得成为 M4 隐性需求。
   `accepted-not-implemented` 只能进入明确排期，不能混进 current parity。
3. “full parity” 的书面定义见 `docs/policies/compatibility.md`。每个测试、
   报告和 release 必须同时标注 profile 与 C0–C5。
4. baseline 改变必须走 compatibility review。禁止在同一个 feature PR 里追随
   新的 Python `main` 并改 expected result。
5. Python 仍可先实验新 RFC，但进入 stable API 前必须有语言无关 contract。
6. 跨仓库行为变化按 `python-only` / `cross-language` / `wire-breaking` 分类。
7. 评测平台 `evaluation/` 复用不移植。为它增加 TypeScript SUT profile 是
   Python 仓库的独立改动。

## Consequences

- RFC 台账是每次 baseline bump 都要更新的活文档。
- 停在 M1 或 M2 仍是成功，只要不把该 profile 说成 full-product C5。
- 进入 M3 / M4 必须留下书面产品线结论，不得只靠测试变绿。
