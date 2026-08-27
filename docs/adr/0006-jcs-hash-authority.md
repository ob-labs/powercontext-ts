# ADR 0006：JCS 与 hash authority

- Status: Accepted
- Date: 2026-08-23
- Amended: 2026-08-27 (raw JCS vs domain integer split)
- Kind: Regular
- Owners: runtime-owner, conformance-owner

## Context

PowerContext 的 identity、Memory hash、Report digest 和 Skill fingerprint 都依赖
canonical bytes。普通 `JSON.stringify` 不满足 RFC 8785，也不包含项目级 NFC、
引用排序和 domain prefix。

RFC 8785 Appendix B 把 `9007199254740992`（`2^53`）列为合法 JCS 输出。pinned
Python `rfc8785==0.1.4` 把 JSON 整数域收成 `±(2^53-1)`，对 Python `int` 的
`±2^53` 抛 `IntegerDomainError`。JavaScript 没有独立整数类型，该值是精确的
IEEE 754 number。两条权威在这一点上冲突。

## Decision

1. Canonical JSON 的权威是 RFC 8785（JCS）：I-JSON、ECMAScript 数值序列化、
   UTF-16 code unit key 排序、无额外空白、拒绝非法 Unicode 与非有限数值。
2. Python `rfc8785` 在 pinned baseline 上的输出是 oracle。TypeScript 必须与它
   byte-for-byte 一致，包括官方 vectors 与项目 vectors。
3. 对 `±2^53` 的整数域冲突，按两条路径拆开，禁止混用：
   - raw JCS（`canonicalizeJson`）跟 RFC 8785 Appendix B，接受该 IEEE 754
     值并写出 `9007199254740992` / `-9007199254740992`；
   - project domain（`canonicalizeDomain`、hash、共享 C2 integer fixtures）
     跟 Python `rfc8785` 与 ADR 0001，拒绝超出 `±(2^53-1)` 的整数。
   Identity 与 content hash 必须走 domain 路径，不得对未校验的 raw JCS 结果
   做 domain-separated hash。
4. 项目叠加规则同样是契约，不是实现细节：
   - recursive NFC；canonical key 在 NFC 后冲突则拒绝；
   - SourceRef / ArtifactRef 排序与去重；禁止 `localeCompare`；
   - Memory manifest / change 顺序；
   - domain-separated SHA-256；
   - embedding content hash 与 external Skill fingerprint。
   Memory / Skill 叠加随对应工作流落地，不是 Deterministic Core primitives
   （issue #2）的关闭条件。
5. hash 输入必须是已验证 canonical bytes。禁止 hash 普通对象的插入顺序。
6. `Date`、`Map`、`Set`、`BigInt`、typed array 不是 JSON domain 值，必须在
   边界转换成规范字符串或拒绝。
7. UTF-8 byte length 是 `max_bytes` 与 PreparedContext `content_bytes` 的唯一口径。

## Consequences

- 官方 JCS vectors 的证据见 `docs/develop/investigations/jcs.md`。
- canonical primitives 达到 C2 属于 Runtime 工作，不在 Client C1 范围内。
- 任何“为了方便改用 JSON.stringify”的补丁都直接否决。
- 不得为了迁就 Python `IntegerDomainError` 而改掉 raw JCS 的 Appendix B 行为。
- 不得为了迁就 Appendix B 而放宽 domain / hash 的 safe-integer 拒绝。
