---
title: Hold the simulate dispatch open for a missing requirement -- test proof
summary: Corrects the one pre-existing hook-level test whose assertion this task's own isReady change
  makes wrong, and adds hook-level and cockpit-level tests proving that a required case-input-requirement's
  own empty input no longer refuses the simulate-case or simulate-hypothesis dispatch, that a requirement's
  mere presence never gates either dispatch, and that the requirement's own required flag still survives
  the read even though the gate stopped consulting it -- while confirming criteria 4-6 are already covered
  and adding nothing redundant for them.
implementation: sha256:bfb0542c90e21a5d91bb721b134dba713221e0a98789e76be1f1cd53423f1dbf
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-hold-dispatch-suite
tests:
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criteria 5-6: readiness > turns ready once the requester and a curator-added
    attribute-value are both present, even though the one derived required field''s own input stays empty'
  proves: Criteria 1-2's shared foundation -- isReady no longer reads a required field's own typed value
    at all, so a required requirement's own empty input does not by itself keep the shared subject un-ready
    once the requester and at least one attribute-value (here, a curator-added row) are present. Replaces
    the pre-existing test at the same location, which asserted the opposite outcome and is now wrong.
  fails_when: isReady still conjuncts requiredFields.every((field) => field.value.trim() !== "") (the
    pre-task formula), or any other read of a required field's own value gates readiness.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criteria 5-6: readiness > stays not-ready while the requester is empty,
    even once every derived required field holds a value'
  proves: Criterion 5 -- the requester's own emptiness still refuses, unchanged. Pre-existing, left untouched;
    still holds unmodified under the new formula.
  fails_when: isReady turns true while requester.trim() === "".
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criteria 5-6: readiness > never turns ready for a subject holding zero
    attribute-values, even once the requester is filled, for a version whose case-input-requirements read
    names no field and to which the curator has added none'
  proves: Criterion 4 -- a subject holding no attribute-value at all does not dispatch. Pre-existing,
    left untouched; still holds unmodified under the new formula.
  fails_when: isReady turns true while subject.attributes.length === 0.
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: useSimulationSubject -- hold-the-simulate-dispatch-open-for-a-missing-requirement, criteria 1-2
    > stays ready with the required field's own input still empty, and stays ready once that same field
    is filled in afterwards too
  proves: Criteria 1-2's shared isReady fact, both before and after the once-empty field is later filled
    -- the one value both onSimulateCase's canSimulateNow and onSimulateHypothesis's canSimulateNow gate
    on.
  fails_when: isReady reads a required field's own emptiness as a refusal reason at either point in this
    sequence.
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: useSimulationSubject -- criterion 3 > stays ready with two derived requirements, one required
    and one optional, both left completely empty
  proves: Criterion 3 -- a requirement's mere presence in the derived set (required or optional, empty
    or filled) is never by itself a reason readiness refuses.
  fails_when: isReady turns false because either derived requirement (required or optional) is present
    and empty, or any traversal of requiredFields factors into the gate at all.
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: 'useSimulationSubject -- hold-the-simulate-dispatch-open-for-a-missing-requirement''s own first
    UNDERDETERMINED note > still reports required: true for the one requirement the read names required,
    while that same field''s own input stays empty and readiness is true'
  proves: The task's own first UNDERDETERMINED note -- rules/investigation/a-composed-subject-presents-every-case-input-requirement
    requires each presented input to still carry its own requirement's required flag, unchanged, even
    though that flag no longer gates dispatch.
  fails_when: an implementation removes or blanks the required flag on a requiredFields entry once that
    flag stops being read by isReady.
- file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  name: useCaseSimulationCockpit -- criterion 1 > issues the /v1/simulate request once the requester and
    a curator-added attribute-value are present, with the one derived required field still empty
  proves: Criterion 1 at the dispatch boundary itself -- a real POST /v1/simulate request lands when the
    shared subject's one required field is left empty but the requester and a curator-added attribute-value
    are present, proving the simulate-case dispatch is not refused for that reason.
  fails_when: onSimulateCase issues no request (canSimulateNow stays false, or the dispatch is otherwise
    gated) because the required field's own input is empty.
- file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  name: useCaseSimulationCockpit -- criterion 2 > issues the /v1/simulate/hypothesis request once the
    requester and a curator-added attribute-value are present, with the one derived required field still
    empty
  proves: Criterion 2 at the dispatch boundary itself -- a real POST /v1/simulate/hypothesis request lands
    under the identical scenario, proving the simulate-hypothesis dispatch is not refused for that reason
    either.
  fails_when: onSimulateHypothesis issues no request because the required field's own input is empty.
untested:
- The task's own second UNDERDETERMINED note (rules/investigation/a-pending-simulation-call-is-not-dispatched-again
  keyed by the operation and the subject together; a passing implementation must not use one screen-wide
  pending flag blocking a simulate-hypothesis dispatch while a simulate-case call is pending, or the reverse).
  What is actually delivered today in use-case-simulation-cockpit.ts (untouched by this task) is exactly
  the screen-wide anySimulating flag the note names as a candidate the specification refuses -- and this
  task's own criterion 6 explicitly asks to preserve that same mechanism unchanged. Whether that pre-existing
  composition conforms to or violates the rule's own per-operation-and-subject keying is a question the
  task that built use-case-simulation-cockpit.ts owns; nothing in this task's own file set (use-simulation-subject.ts)
  reaches it. Recorded rather than tested.
- The task's own third UNDERDETERMINED note (the same rule releases the guard on any outcome, including
  a refusal). use-simulate-hypothesis-dispatch-safety.spec.ts already proves this for the hypothesis-side
  per-hook guard. use-simulate-case.spec.ts's own criterion-7 test proves release-after-success for the
  case side but has no equivalent explicit assertion of isSimulating returning to false after a failed
  (rather than successful) case-level dispatch -- only that simulateError turns non-null. That gap sits
  entirely inside use-simulate-case.ts, a file this task's own delivery does not touch and whose own proof
  is that file's own task's responsibility, not this one's; recorded as a finding rather than closed here.
- 'Criterion 6 (a dispatch already running still refuses a second one, unchanged from what is delivered
  today) has no new test in this delivery, per this task''s own Notes stating it is confirmed rather than
  built. Confirmed already covered: use-case-simulation-cockpit-gating.spec.ts''s own ''disabled while
  any dispatch is already in flight'' describe block (four tests, covering both directions and both a
  case-level and a hypothesis-level in-flight call), case-simulation-ready-view-dispatch.spec.ts''s own
  ''disabled while a dispatch is already in flight'' tests at the rendered level, and use-simulate-case.spec.ts''s/use-simulate-hypothesis-dispatch-safety.spec.ts''s
  own per-hook isDispatchingRef/isSimulating tests. None of those three files were touched by this task''s
  own delivery, and none of their existing assertions changed meaning under this task''s own isReady formula
  change.'
divergences:
- cites: TST-04
  file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  departure: Named for the unit plus a task-qualifying suffix rather than exactly "use-simulation-subject.spec"
    -- split out of that file to stay under MNT-01/eslint's configured max-lines (300).
  why: mirrors use-simulation-subject-malformed-capabilities.spec.ts's own already-established, already-disclosed
    precedent for the identical reason.
- cites: TST-04
  file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  departure: Named for the unit plus a task-qualifying suffix rather than exactly "use-case-simulation-cockpit.spec"
    -- follows this hooks directory's own already-established split convention for use-case-simulation-cockpit.ts.
  why: mirrors the sibling split files already in this directory (-gating.spec.ts, -evaluations.spec.ts,
    -staleness.spec.ts, -hypothesis-requester.spec.ts, -detail-evidence-capability-hotfix.spec.ts, -hypothesis-evidence-and-prompt.spec.ts),
    none of which carry the unit's own bare name either.
---

## What it is
Proof that a required requirement's own empty input no longer holds either dispatch closed, while the requester gate, the at-least-one-attribute invariant, and the already-running-dispatch guard all stay exactly as they were.

## Notes
None.
