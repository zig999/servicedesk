---
target: frontend
title: Current-pin refusal no longer folds into a load failure on the hypothesis revision history screen
  -- proof
summary: Proves that use-case-hypothesis-current-pin.ts's not-valid phase lets hypothesis-revision-history.tsx
  present the hypothesis's own successfully-read revisions with no fact from the refused version's manifest,
  distinct from both the fixed read-did-not-complete statement and a genuine revisions-read failure.
implementation: sha256:4846d58edd230931b5e684832a97b6331ecb7126539eb22356c748cc735baccf
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-current-pin-suite
tests:
- file: src/routes/hypothesis-revision-history-case-not-valid.spec.ts
  name: HypothesisRevisionHistory -- the hypothesis's own revisions are presented, stating no fact derived
    from the manifest, when the case's current version fails validation > renders every one of the hypothesis's
    own successfully-read revisions, and neither a current/frozen status, a Revise action, the "uses no
    revision" statement, nor the read-did-not-complete text, when the highest-numbered version's manifest
    read is refused for failing validation
  proves: 'Criterion 1: "Opening a hypothesis''s revision history for a case whose current (highest-numbered)
    version fails a validator rule of validation-runs-at-every-read presents that hypothesis''s own revision
    history, read successfully and independently of the version''s own refused read, turning on nothing
    about which validator rule failed over that version." and criterion 2: "On that same reading, the
    screen states neither that some revision it presents is the one the case currently uses nor that the
    case currently uses no revision of that hypothesis -- no fact derived from that version''s manifest
    is stated at all -- and the presence of the revision history is distinguishable from the statement
    the screen makes for a read that did not complete."'
  fails_when: the hypothesis's own successfully-read revisions stop rendering on this refused reading,
    or any row shows a "current"/"frozen" status, a Revise action appears, the "uses no revision" statement
    appears, or the load-error text appears in their place
  demonstrates: rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
- file: src/routes/hypothesis-revision-history-case-not-valid.spec.ts
  name: HypothesisRevisionHistory -- a refusal of the current-version read carrying an error code the
    screen holds no presentation of its own for is presented exactly as a read that did not complete >
    renders only the fixed read-did-not-complete statement, never the revision history rows nor the refusal's
    own error code, message, or any value it carries, when the highest-numbered version's manifest read
    fails with a code the screen holds no presentation of its own for
  proves: 'rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete:
    "the surface states of c exactly what it states where a read of c did not complete, indistinguishable
    from it, and states nothing else about the refusal -- not the error code, not the refusal''s message,
    not any value the refusal carries", as this task''s own current-version-read branch answers it'
  fails_when: the manifest read's refusal (an error code the screen holds no presentation of its own for)
    stops being presented as the fixed read-did-not-complete statement -- the revision rows render instead,
    or the refusal's own code, message, or any carried value is disclosed
  demonstrates: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- file: src/routes/hypothesis-revision-history-case-not-valid.spec.ts
  name: HypothesisRevisionHistory -- a genuine failure reading the hypothesis's own revisions still presents
    the read-did-not-complete statement even when the case's current version read is separately refused
    for failing validation > renders the read-did-not-complete statement, not the revision history, when
    the hypothesis's own revisions read fails while the highest-numbered version's manifest read is refused
    for failing validation
  proves: 'Criterion 3: "A genuine failure to read the hypothesis''s own revisions (not the case''s current
    version) still presents the statement the screen already makes for a read that did not complete."'
  fails_when: the read-did-not-complete statement stops appearing, or the revision rows appear instead,
    when the hypothesis's own revisions read fails, regardless of the case's current-version read being
    separately (and differently) refused for failing validation
not_applicable:
- edge_case: Zero revisions of the hypothesis on the reading where the current version's read is refused
    for validation
  why: the empty-revisions branch (revisions.length === 0) is reached before currentPin's phase is consulted
    for any status/pin fact and is unaffected by it; no criterion of this task concerns the shape of the
    "no revisions yet" message, only whether pin-derived facts are stated, and none render in that branch
    regardless of currentPin's phase. The branch itself is already exercised, independent of this task,
    by the pre-existing "shows an explicit empty state" test in hypothesis-revision-history.spec.ts.
- edge_case: Concurrent or out-of-order resolution of the current-version read and the hypothesis's-own-revisions
    read
  why: both rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
    and rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
    state their own consistency as eventual, each read judged separately; no criterion or node requires
    an ordering or atomicity guarantee across the two independent queries, so no test asserts one.
untested:
- 'rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case''s
  fact is not decided whole by any test against this delivery: on the refused reading, hypothesis-revision-history.tsx
  tells the phase apart internally (not-valid vs load-error) but renders no explicit "the version c currently
  uses does not read back as a case" statement distinct from the other two states, anywhere on this surface.
  The implementation record''s own divergences disclose this as a deliberate, deferred gap (this task''s
  own UNDERDETERMINED entry 1). No test is written for this node or for UNDERDETERMINED entry 1.'
- 'UNDERDETERMINED entry 2 (extending the "case currently uses no revision of" marking convention to the
  refused reading) names no implementation to test against distinct from entry 1''s gap: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version''s
  own expression does not reach a version that exists but whose read was refused. No test is written for
  it.'
- UNDERDETERMINED entry 3 (a case currently holding no version at all, folded into the same generic load-error
  phase) names a branch this task's own files list does not touch -- the implementation record marks it
  "preserved" and untouched. No test is written for it here.
- UNDERDETERMINED entry 4 (widening the not-valid narrowing to every failed read of the current version,
  or disclosing the refusal's own code or message) names no implementation this task was asked to avoid
  beyond what test 2 already demonstrates for the named CaseVersionNotValidError refusal. No test is written
  for the wider behavior.
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version's fact for the reading where
  the current version's own read answers (the "ready" phase) is unchanged by this task and continues to
  be decided, whole, by the pre-existing tests in hypothesis-revision-history-current-pin.spec.ts (not
  modified by this delivery). This proof adds no new test for it since nothing about that behavior changed.
---

## What it is
The proof for the current-pin corrective task: hypothesis-revision-history-case-not-valid.spec.ts covers the revision history's presence and no-manifest-fact-disclosed guarantee on the refused reading, the unrecognized-refusal fallback, and the revisions-read failure staying distinct from the refused-version reading.

## Notes
Suite captured at run/case-not-valid-surface-presentation-current-pin-suite.
