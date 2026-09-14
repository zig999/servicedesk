---
title: The persistence-deadline test's injected total deadline matches the specification's declared total
summary: Derives the test's injected deadline from the specification's own declared total instead of a
  locally chosen figure that happens to diverge from it.
rationale: A /review-change conformance finding over src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  observed that its TOTAL_DEADLINE_BUDGET_MS constant (30_000) diverges from rules/investigation/an-answer-arrives-within-the-declared-deadline's
  own declared total (20 seconds — two of overhead and margin, seven of collection, five of judgment,
  four of writing and two of persistence), and that because this file computes and injects the deadline
  itself the test keeps passing under either figure.
sources:
- work/diagnose-persistence-deadline-test-value-corrective/intake/corrective-deadline-test-value.md
objective: The test's injected total deadline budget equals the specification's own declared total, so
  the two can never silently diverge again.
criteria:
- The constant this test uses to compute the injected deadline equals the specification's declared total
  deadline in milliseconds.
- The file still builds and the full suite still passes.
implements:
- rules/investigation/an-answer-arrives-within-the-declared-deadline
---
## What it is
TOTAL_DEADLINE_BUDGET_MS becomes 20_000, matching the specification's own declared total.

## Notes
ADVISORY, from the specification — rules/investigation/an-answer-arrives-within-the-declared-deadline's own statement declares the total deadline as twenty seconds (20_000ms), composed of two of overhead and margin, seven of collection, five of judgment, four of writing and two of persistence; the decision log confirms this is the node's only declared total, and no other node the log locates holds a competing figure.
REMAINDER, from the specification — the node's own second clause, "that deadline is smaller than the caller's timeout," reaches no criterion of this task; both criteria concern only the value of one test constant and the suite still passing.
Belongs to a task implementing the diagnose route's own deadline propagation, not this test-constant alignment task.
ADVISORY, from the specification — both criteria as written are satisfied by any constant valued 20_000ms, including one re-declared locally in this same test file rather than sourced from wherever the specification's own figure is meant to live in code; no candidate node refuses a re-declared literal, so this is a live but unrefused divergence risk rather than a criterion gap the specification itself closes.
