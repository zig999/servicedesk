---
title: Remove the window-based dedup layer the specification withdrew
summary: diagnose.ts and its idempotency/lease/registry siblings, and their own five spec files, are deleted;
  nothing else in the tree references them.
task: sha256:1cc4ac5a6c6796987c08ee176b755f3ab0dad25258c2dc2827b70abb0bc34a1d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-composition-root-remove-withdrawn-dedup-layer-build
files:
- path: src/investigation/diagnose.ts
  effect: removed — was the payload-shaped diagnose entry point wrapping the pipeline in window-based
    dedup/join logic
- path: src/investigation/idempotency-key.ts
  effect: removed — was the repeat-request key builder the withdrawn rule used
- path: src/investigation/idempotency-lease-store.ts
  effect: removed — was the in-progress lease store the withdrawn rule used
- path: src/investigation/idempotency-resolution.ts
  effect: removed — was the completed/in-progress/free resolution logic the withdrawn rule used
- path: src/investigation/diagnosis-run-registry.ts
  effect: removed — was the in-progress-run registry the withdrawn rule used to join a second call to
    a first
- path: src/factories/diagnose-entry-point.factory.ts
  effect: removed — was the factory wiring the window-dedup layer in front of the still-standing createDiagnoseRunner
- path: src/__tests__/unit/investigation/diagnose.spec.ts
  effect: removed — its own subject no longer exists
- path: src/__tests__/unit/investigation/idempotency-key.spec.ts
  effect: removed — its own subject no longer exists
- path: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  effect: removed — its own subject no longer exists
- path: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  effect: removed — its own subject no longer exists
- path: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
  effect: removed — its own subject no longer exists
criteria:
- criterion: diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts
    and diagnose-entry-point.factory.ts no longer exist in the tree.
  met: true
  how: all six files were removed from src/investigation/ and src/factories/; confirmed absent by a fresh
    glob of the tree
- criterion: Their own five spec files (diagnose.spec.ts, idempotency-key.spec.ts, idempotency-resolution.spec.ts,
    idempotency-lease-store.spec.ts, diagnosis-run-registry.spec.ts) no longer exist.
  met: true
  how: all five spec files were removed from src/__tests__/unit/investigation/; confirmed absent by a
    fresh glob of the tree
- criterion: No remaining file imports any of the six removed modules, and the project still type-checks
    and its existing suite still passes.
  met: true
  how: a source-wide grep for the six module paths and their exported symbols (diagnose, DiagnosePayload,
    DiagnosisRunRegistry, IdempotencyLeaseStore, IdempotencyKey, idempotencyKeyOf, resolveIdempotency,
    createDiagnoseEntryPoint, DiagnoseEntryPointDependencies) finds only five prose comments naming them
    in explanatory text, no import statement or re-export; the captured run diagnose-composition-root-remove-withdrawn-dedup-layer-build
    holds install, typecheck, lint and secret-scan all passing
nodes:
- node: contracts/investigation/diagnosis
  how: removes the machinery that violated the contract's amended clause that every call is fresh and
    never returns, reuses or joins an earlier investigation; does not itself rebuild the fresh entry point
    the contract also requires, which is a remainder this task's own Notes assign to task/diagnose-composition-root/wire-diagnose-runner
    and task/http-surface/diagnose-http-endpoint
preserved:
- createDiagnoseRunner (src/factories/diagnose.factory.ts) and run-diagnosis.ts, the already-delivered
  synchronous pipeline this removal does not touch
- every other test under src/__tests__/, none of which imported the six removed modules
---

## What it is

Six source files and five test files, implementing a rule the specification no longer states, are removed.
Nothing that remains references any of them.

## Notes

This task's three criteria are tree-shape and build facts with no runtime behavior left to exercise — the deletion left nothing behind that anything else in the tree calls. No proof record accompanies this implementation: a proof requires at least one test that can be said to fail for a stated reason, and a test asserting file absence by literal path, or re-deciding what the compiler already exhaustively decided about imports, would compute nothing beyond what this record and the captured build run already state. deliver.py --outstanding reports this honestly as "implemented, and no proof record holds it up," the same state a substrate-only delivery reports, for the same underlying reason (no source for a test to reach) even though this task declares no produces.
