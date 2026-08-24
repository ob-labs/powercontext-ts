# Summary

<!-- What changed and why. -->

# Profile and parity

- Profile: `client` / `sqlite-fts` / `sqlite-vector` / `oceanbase-hybrid` / `full-product`
- Target level: C0–C5
- Related issue or RFC:

# Checklist

- [ ] Does not add a second wire contract
- [ ] Does not hand-edit `contract/` or `conformance/` snapshots
- [ ] Does not hand-edit `packages/protocol/src/generated`
- [ ] Baseline bump, if any, is this pull request’s only purpose
- [ ] New or changed behavior names the compatibility decision or ADR

# Test plan

```text
pnpm format
pnpm lint
pnpm typecheck
pnpm test
```

<!-- Add generate:check, export-check, conformance, or verify.py when those surfaces change. -->
