# Python oracle harness

Phase 1 will create an isolated uv environment from the `uv.lock` blob recorded
by `oracle_dependency_lock_path` and `oracle_dependency_lock_sha256`, then install

`git+https://github.com/oceanbase/powercontext.git@733e4bf6b378785e76274ff07632029c699ecb09`.

The Phase 0 verifier already checks that dependency-lock blob at the same Python
commit. This directory must not contain PowerContext implementation code.
