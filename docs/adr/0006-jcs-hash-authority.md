# ADR 0006：JCS 与 hash authority

- Status: Accepted
- Date: 2026-08-23
- Kind: Regular
- Owners: runtime-owner, conformance-owner

## Context

PowerContext 的 identity、Memory hash、Report digest 和 Skill fingerprint 都依赖
canonical bytes。普通 `JSON.stringify` 不满足 RFC 8785，也不包含项目级 NFC、
引用排序和 domain prefix。

## Decision

1. Canonical JSON 的权威是 RFC 8785（JCS）：I-JSON、ECMAScript 数值序列化、
   UTF-16 code unit key 排序、无额外空白、拒绝非法 Unicode 与非有限数值。
2. Python `rfc8785` 在 pinned baseline 上的输出是 oracle。TypeScript 必须与它
   byte-for-byte 一致，包括官方 vectors 与项目 vectors。
3. 项目叠加规则同样是契约，不是实现细节：
   - recursive NFC；canonical key 在 NFC 后冲突则拒绝；
   - SourceRef / ArtifactRef 排序与去重；禁止 `localeCompare`；
   - Memory manifest / change 顺序；
   - domain-separated SHA-256；
   - embedding content hash 与 external Skill fingerprint。
4. hash 输入必须是已验证 canonical bytes。禁止 hash 普通对象的插入顺序。
5. `Date`、`Map`、`Set`、`BigInt`、typed array 不是 JSON domain 值，必须在
   边界转换成规范字符串或拒绝。
6. UTF-8 byte length 是 `max_bytes` 与 PreparedContext `content_bytes` 的唯一口径。

## Consequences

- Phase 1 spike D 必须先通过官方 JCS vectors。
- Phase 4 才能把 canonical primitives 标为 C2。
- 任何“为了方便改用 JSON.stringify”的补丁都直接否决。
