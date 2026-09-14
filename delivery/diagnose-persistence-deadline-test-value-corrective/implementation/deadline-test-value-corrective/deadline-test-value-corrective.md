---
target: backend
title: Persistence-deadline e2e test's injected total pinned to the specification's declared 20-second figure
summary: Corrects TOTAL_DEADLINE_BUDGET_MS in diagnose-persistence-deadline-e2e.spec.ts from 30_000 to
  20_000, matching rules/investigation/an-answer-arrives-within-the-declared-deadline's own declared total.
task: sha256:d0016f981fb8aab5d4a224a527207de82c53d532a2261e2f2f40a3aabbcd6dfb
run: run/deadline-test-value-corrective-build
files:
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: TOTAL_DEADLINE_BUDGET_MS changed from 30_000 to 20_000. Every other assertion in the file was
    checked for a derived dependency on the old figure — WRITE_DELAY_MS and CLEANUP_WAIT_MS are independent
    of it, and the remainingMs assertion traces to run-diagnosis.ts's fixed PERSISTENCE_STAGE_BUDGET_MS
    (2_000), unaffected by the total — so nothing else needed adjustment. Every sibling production file
    and the sibling e2e spec already independently declared the same constant as 20_000; this file was
    the sole outlier.
criteria:
- criterion: The constant this test uses to compute the injected deadline equals the specification's
    declared total deadline in milliseconds.
  met: true
  how: TOTAL_DEADLINE_BUDGET_MS is now 20_000, matching rules/investigation/an-answer-arrives-within-the-declared-deadline's
    declared total (2000 overhead/margin + 7000 collection + 5000 judgment + 4000 writing + 2000 persistence).
- criterion: The file still builds and the full suite still passes.
  met: true
  how: run/deadline-test-value-corrective-build and run/deadline-test-value-corrective-suite-full both
    pass cleanly with this change in the tree, running every step the project's registry declares.
nodes:
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  encoded_at:
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  how: This file's own injected total now equals the node's declared 20-second total rather than a
    locally chosen 30-second figure that had drifted from it. The node's second clause (that the total
    is smaller than the caller's timeout) reaches no criterion of this task, per the task's own REMAINDER
    note.
inferences:
- inferred: No other assertion in the file needed adjustment for the new total.
  from: Reading run-diagnosis.ts to confirm the persistence-stage cap (PERSISTENCE_STAGE_BUDGET_MS =
    2_000) is fixed and independent of the injected total, and reading every sibling production file
    and the sibling e2e spec to confirm they already independently declare 20_000, corroborating that
    this file was the sole outlier rather than part of a consistent 30_000 convention.
deferred:
- what: A structural guard against a future re-declaration of a diverging literal total in some other
    file.
  why: The task's own third ADVISORY note observes that no node refuses a locally re-declared literal
    matching the correct value; the proof's new guard test pins only this one file's constant.
---
## What it is
TOTAL_DEADLINE_BUDGET_MS becomes 20_000, matching the specification's own declared total.

## Notes
None.
