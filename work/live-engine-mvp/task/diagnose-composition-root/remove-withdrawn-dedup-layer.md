---
title: Remove the window-based dedup layer the specification withdrew
summary: diagnose.ts and its idempotency/lease/registry siblings, and their own tests, are deleted along with every reference to them.
objective: The code implementing the withdrawn window-based dedup/join rule is removed from the tree, along with its own tests, and nothing else in the project references it.
criteria:
  - diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts and diagnose-entry-point.factory.ts no longer exist in the tree.
  - Their own five spec files (diagnose.spec.ts, idempotency-key.spec.ts, idempotency-resolution.spec.ts, idempotency-lease-store.spec.ts, diagnosis-run-registry.spec.ts) no longer exist.
  - No remaining file imports any of the six removed modules, and the project still type-checks and its existing suite still passes.
implements:
  - contracts/investigation/diagnosis
sources:
  - intake/scope.md
---

## What it is

Six source files and five test files, implementing a rule the specification no longer states, are deleted.
Nothing that remains references any of them.

## Notes

This task's three criteria are exhausted by deletion, non-reference and a still-green build/suite; none of them constructs or exercises a diagnose entry point that is itself fresh end to end. contracts/investigation/diagnosis's own affirmative text — every call is fresh, the whole engine runs again, assessment out within the declared deadline, and the ticket reference is correlation never a matching key — reaches no criterion of this task. diagnose.ts, one of the six files this task deletes with no replacement, was the only code that ever exposed the payload-shaped diagnose operation itself; after this task nothing in the tree publishes that operation at all. That gap is not left open within this plan: task/diagnose-composition-root/wire-diagnose-runner and task/http-surface/diagnose-http-endpoint together rebuild a fresh diagnose entry point over the already-delivered run-diagnosis.ts/diagnose.factory.ts composition, without this withdrawn layer, and both already implement contracts/investigation/diagnosis in their own right.
