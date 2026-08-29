---
title: Adapter's isRecord-to-isPlainObject substitution proven behavior-preserved
summary: The pre-existing unit suite is left unmodified, and two new tests confirm parseJudgment's and
  isCitation's own narrowing still rejects a top-level array and a non-object citation entry the same
  way after the substitution — a case neither pre-existing test isolated.
implementation: sha256:6ccfcf20f15f34921849850fab018c072bb0272ebce7ae843fcee3d313178f55
run: run/arc01-mnt03-suite
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model answers valid JSON that is a
    top-level array rather than an object
  proves: parseJudgment's and isCitation's own existing behavior is unchanged — the existing suite passes
    with no assertion or outcome changed. Specifically, this shows parseJudgment's own top-level narrowing
    check, now calling the imported isPlainObject in place of the deleted local isRecord, still rejects
    a bare JSON array exactly as the local function did — a case no pre-existing test in this file exercised.
  fails_when: parseJudgment's narrowing check stops rejecting a top-level JSON array (for example if a
    future edit to the substituted guard narrowed permissively enough to accept one), producing any outcome
    other than verdict inconclusive, reason judgment-failure, citations empty, for this input.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when a confirmed answer carries a citation entry
    that is not an object
  proves: parseJudgment's and isCitation's own existing behavior is unchanged — the existing suite passes
    with no assertion or outcome changed. Specifically, this shows isCitation's own per-entry narrowing
    check, now calling the imported isPlainObject in place of the deleted local isRecord, still rejects
    a non-object citation entry exactly as the local function did — a case no pre-existing test in this
    file exercised.
  fails_when: isCitation's narrowing check stops rejecting a non-object citation entry, producing any
    outcome other than verdict inconclusive, reason judgment-failure, citations empty, for this input.
not_applicable:
- edge_case: isPlainObject's null-specific rejection branch, and its typeof-mismatch branch, each re-exercised
    separately at both of this adapter's two call sites
  why: isPlainObject's own three-part check (typeof mismatch, null, array) is already exhaustively unit-tested
    directly against the function itself in src/__tests__/unit/investigation/citation-validation.spec.ts,
    written for the sibling task task/investigation-json-guard-consolidation/export-shared-json-guards.
    What this record's own two new tests need to establish is only that each of this adapter's two call
    sites still reaches and honors that same function on a value it should reject — one distinguishing
    branch per site (an array at parseJudgment's top-level check, a non-object entry inside isCitation)
    already shows the wiring is live at both. Repeating every branch at every site would prove nothing
    further about a function whose own behavior is already proven elsewhere.
- edge_case: absent, empty or duplicate input to evaluate() itself, and two evaluate() calls at once
  why: this task changes nothing about evaluate()'s own inputs, its no-data short-circuit, or its call
    isolation. Those are already proven by the pre-existing suite's own tests (the no-data and byte-identical-prompt
    tests among them), left untouched by this delivery, and this task's own criteria do not ask this record
    to re-prove them.
- edge_case: a dependency (the Anthropic API) that is unavailable, slow, or answers in an unexpected shape
  why: already proven by the pre-existing suite's own provider-rejection and elapsed-time tests, which
    this delivery leaves unmodified. The guard substitution touches only parseJudgment's and isCitation's
    own narrowing, never requestJudgment's own error handling, so this task's criteria do not ask this
    record to re-prove that behavior.
untested:
- anthropic-hypothesis-evaluator.adapter.ts no longer declares its own isRecord function — a code-shape
  fact with no external behavioral signature, since evaluate()'s outward behavior is identical whether
  isRecord is declared locally or isPlainObject is imported (the two share one body and one return type).
  No test in this record can fail specifically over the declaration's absence; this was confirmed only
  by directly reading src/investigation/anthropic-hypothesis-evaluator.adapter.ts, which holds no isRecord
  declaration or reference anywhere in the file.
- anthropic-hypothesis-evaluator.adapter.ts imports isPlainObject from citation-validation.ts and uses
  it at every site that called isRecord — for the same reason this is a code-shape fact, not a behavioral
  one, and was confirmed only by directly reading the file's import statement and its two call sites (inside
  parseJudgment and inside isCitation), not by any test in this record.
- 'anthropic-hypothesis-evaluator.adapter.ts''s own parseJsonOrUndefined is unchanged — confirmed only
  by directly reading the file: parseJsonOrUndefined, unwrapCodeFence and the CODE_FENCE constant are
  byte-for-byte identical to what they were before this delivery. The pre-existing suite''s own code-fence
  tests already exercise that function''s behavior and are left unmodified by this record.'
---

## What it is
Two new tests confirm parseJudgment's and isCitation's own narrowing still rejects a top-level array and a non-object citation entry after isRecord is replaced by the imported isPlainObject; the pre-existing suite is left unmodified.

## Notes
Criteria 4 (typecheck) and 5 (suite) — both left unconfirmed at authoring time since this proof-authoring session held no shell — are confirmed by run/arc01-mnt03-suite, captured over the whole tree after all six of this increment's tasks were implemented and proven: typecheck, lint, secret-scan and the full 1680-test suite all passed.
