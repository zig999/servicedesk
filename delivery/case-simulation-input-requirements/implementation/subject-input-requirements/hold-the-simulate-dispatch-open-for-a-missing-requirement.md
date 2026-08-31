---
title: Hold the simulate dispatch open where a requirement's own input is empty
summary: Removes isReady's requiredFields.every(...) conjunct in use-simulation-subject.ts so a required
  requirement's own empty input no longer refuses either dispatch, while the requester and at-least-one-attribute
  conjuncts stay untouched.
task: sha256:bbcaa56a7fac0ca3400b34ca9a76b63c897ba99cb25527d31e5bf72347952bdd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-hold-dispatch-build-2
files:
- path: src/hooks/use-simulation-subject.ts
  effect: 'isReady''s formula drops the `requiredFields.every((field) => field.value.trim() !== "")` conjunct
    entirely, so a case-input-requirement''s own empty typed value no longer refuses either dispatch and
    a requirement''s mere presence in `requiredFields` (required or optional) is never read by the gate
    at all. isReady is now exactly `requester.trim() !== "" && subject.attributes.length > 0`, both conjuncts
    byte-for-byte unchanged from what was delivered before this task. Nothing else in the file changed:
    requiredFields itself, each field''s own required flag, mergedAttributes, capabilitiesWithMalformedInputSchema,
    and every setter are untouched. Two comments are updated to stop describing the removed formula.'
criteria:
- criterion: With a requester and at least one attribute-value present, a required requirement's own empty
    input does not refuse the simulate-case dispatch.
  met: true
  how: isReady no longer conjuncts requiredFields.every(...), so a required field's own empty typed value
    cannot make isReady false while requester.trim() !== "" and subject.attributes.length > 0 both hold.
    use-case-simulation-cockpit.ts's canSimulateCase (returned as canSimulateNow) reads subjectState.isReady
    && !anySimulating unchanged, and onSimulateCase dispatches caseSim.onSimulate whenever canSimulateNow
    is true -- neither of those two files was touched, so the same wiring now passes through a true isReady
    in this case.
- criterion: With a requester and at least one attribute-value present, a required requirement's own empty
    input does not refuse the simulate-hypothesis dispatch.
  met: true
  how: Both dispatch paths read the identical subjectState.isReady (use-case-simulation-cockpit.ts's one-subject-shared
    composition, unchanged) -- disableSimulateHypothesis is !canSimulateNow, the same canSimulateNow computed
    from the same isReady, so the identical reasoning as criterion 1 applies to onSimulateHypothesis without
    any separate gate to change.
- criterion: A requirement's mere presence in the derived set is never a reason either dispatch is refused.
  met: true
  how: isReady's formula no longer reads requiredFields at all (neither .every(...) nor any other traversal
    of it), so a requirement appearing in that derived set -- whether required or optional, whether its
    own input is empty or filled -- cannot by itself factor into either dispatch's gate; only the requester
    and the attribute count do.
- criterion: A subject holding no attribute-value at all does not dispatch.
  met: true
  how: The subject.attributes.length > 0 conjunct is kept exactly as it was (rules/investigation/a-subject-carries-at-least-one-attribute)
    -- not touched by this change, so a subject with zero attribute-values still makes isReady false regardless
    of the requester or of any requirement's own state.
- criterion: The requester's own emptiness still refuses the dispatch, unchanged from what is delivered
    today.
  met: true
  how: The requester.trim() !== "" conjunct is kept exactly as it was, first in the formula and untouched
    -- an empty requester still makes isReady false regardless of the subject's attribute-values or of
    any requirement's own state.
- criterion: A dispatch already running still refuses a second one, unchanged from what is delivered today.
  met: true
  how: Confirmed rather than built, per this task's own Notes. use-case-simulation-cockpit.ts computes
    anySimulating = caseSim.isSimulating || hypSim.isSimulating and canSimulateNow = subjectState.isReady
    && !anySimulating, gating both onSimulateCase and onSimulateHypothesis; use-simulate-case.ts and use-simulate-hypothesis.ts
    each hold their own per-hook isDispatchingRef, set on dispatch and cleared in the mutation's own onSettled
    (called whether the mutation resolved or rejected), with isSimulating read from mutation.isPending,
    likewise false once settled regardless of outcome. None of these three files were modified by this
    delivery.
nodes:
- node: domain/investigation/subject
  how: This task encodes no new fact about the subject's own shape (type plus attribute-values, already
    established by an earlier task). It only honors the invariant that shape implies -- a subject is identified
    by its attribute-value set -- by keeping subject.attributes.length > 0 in the gate untouched; no encoded_at,
    since nothing here is a fact this delivery placed in the source that was not already there.
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: 'The rule''s own statement -- a simulate-case or simulate-hypothesis call is never refused for
    a subject omitting an attribute-value a requirement names required -- is what removing the requiredFields.every(...)
    conjunct answers to directly: the gate this screen gives both dispatches can no longer be closed by
    a required requirement''s own empty input, leaving that concept''s own eventual collection free to
    degrade to unavailable instead, exactly as the rule states.'
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: 'Only this rule''s gating clause reaches this task''s criteria -- only a required flag, never an
    attribute''s mere presence in this set, gates whether its own input blocks the call -- and it is now
    trivially true: isReady reads neither a required flag nor mere presence from requiredFields at all,
    so nothing in that set can gate the call by either means. The rule''s own presentation and disclosure
    clauses are this task''s own REMAINDER, delivered by a sibling task (case-simulation-subject-panel.tsx,
    outside this task''s file set) and untouched here.'
- node: rules/investigation/a-simulation-carries-its-requester
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: This task's own REMAINDER locates the rule's own refusal at the call's own route, reached by no
    criterion here; this screen's own criterion (5) holds the dispatch back before any request is issued,
    through the unchanged requester.trim() !== "" conjunct, which this delivery leaves exactly as it stood.
- node: rules/investigation/a-pending-simulation-call-is-not-dispatched-again
  how: 'This task''s own Notes name the guard''s per-operation/per-subject keying and its release-on-any-outcome
    behavior as almost certainly already delivered by a different task, to confirm rather than build.
    Confirmed: use-simulate-case.ts''s and use-simulate-hypothesis.ts''s own separate isDispatchingRef
    per hook instance realize the per-operation half, and since this cockpit composes one subject shared
    by both dispatches, a differently-composed subject only ever exists on a different mount of this same
    cockpit, where a fresh ref exists too. The release-on-any-outcome half is realized by each mutation''s
    own onSettled callback clearing the ref, and by react-query''s isPending, false once settled either
    way. No file implementing this rule was touched by this delivery.'
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: Criterion 4 requires the invariant to keep refusing an attribute-less subject; the subject.attributes.length
    > 0 conjunct that encodes it is left exactly as it was, untouched by the conjunct this task removes.
preserved:
- The requester's own emptiness refusing the dispatch (requester.trim() !== "", isReady's first conjunct).
- A subject holding no attribute-value at all never dispatching (subject.attributes.length > 0, isReady's
  remaining conjunct).
- Each requirement's own required flag still carried through unchanged on every entry of requiredFields
  and still exposed to callers, even though isReady stopped reading it (and stopped reading every field's
  own typed value).
- 'The pending-dispatch guard: use-simulate-case.ts''s and use-simulate-hypothesis.ts''s own per-hook
  isDispatchingRef plus mutation.isPending, and use-case-simulation-cockpit.ts''s own anySimulating/canSimulateNow
  composition gating both onSimulateCase and onSimulateHypothesis.'
- capabilitiesWithMalformedInputSchema's pass-through, and the malformed-capability disclosure this hook
  itself never renders.
- mergedAttributes' own merge order (derived fields first, then curator-added rows, a curator-added row
  overriding a same-named derived field's own value) -- unrelated to and unaffected by this change.
---

## What it is
The one change to what this screen refuses: readiness stops counting requirement inputs, and keeps counting the requester and the invariant that a subject carries at least one attribute-value.

## Notes
None.
