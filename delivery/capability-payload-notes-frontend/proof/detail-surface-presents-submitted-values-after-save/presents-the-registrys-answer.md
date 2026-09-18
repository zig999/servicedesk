---
target: frontend
title: Proof that the capability detail surface presents the registry's own subsequent read, not the submission, after a save
summary: Two dedicated hook-level test files prove criteria 1, 2, 3 and 4 directly, isolating the invalidated
  refetch behind a controllable promise; criterion 5 is proved by two pre-existing, unaffected tests; and two
  further pre-existing tests (onDiscard after a save) this task's change also falsified are corrected here to
  assert discard falls back to the surface's own last identity read rather than a hardcoded just-saved value.
implementation: sha256:f17acb9ccba9709e2ff4527b49aa1ddb9985efa021e0999110edb235fbedfe15
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/detail-surface-and-save-tests-corrections-suite-3
tests:
- file: src/hooks/use-capability-detail-outcome-independent-of-refetch.spec.ts
  name: reports isSubmitSuccessful true the moment the write settles, while the refetch it invalidated is still
    outstanding, and keeps it true once that refetch answers
  proves: "Criterion 1 — the outcome statement that the registration was made fires as soon as the registry
    answers the write, unaffected by whether a subsequent identity read has settled."
  fails_when: isSubmitSuccessful is not yet true immediately once the write settles while the invalidated
    refetch is still pending, or turns false once that refetch later answers.
- file: src/hooks/use-capability-detail-outcome-independent-of-refetch.spec.ts
  name: keeps isSubmitSuccessful true, and the surface in the ready phase, after the refetch the save invalidated rejects
  proves: "The UNDERDETERMINED note this task's own Notes record — an implementation that withdraws the outcome
    statement on a failed refetch (as opposed to a failed write) would still satisfy every criterion as written;
    this test fixes that this implementation does not do so."
  fails_when: the outcome statement withdraws, or the surface leaves the ready phase, once the invalidated
    refetch rejects rather than the write itself failing.
- file: src/hooks/use-capability-detail-refetch-supersedes-submission.spec.ts
  name: holds exactly the submitted values for both schema fields and a plain field between the write's answer and the refetch answering
  proves: "Criterion 3 — between the registry's answer to the write and that refetch answering, a field the
    operator had changed away from the prior read's content holds exactly what was submitted for it, never
    reverted and never emptied."
  fails_when: any of the three exercised fields (input_schema, output_schema, connector) reverts to the prior
    read's content or is emptied before the refetch answers.
- file: src/hooks/use-capability-detail-refetch-supersedes-submission.spec.ts
  name: adopts the refetched answer's values once it lands, even where that answer differs from what was submitted
  proves: "Criteria 2 and 4 — after a successful save, once the invalidated identity-keyed query's own refetch
    has answered, every exercised field equals that refetched answer's own attributes, even where it differs
    from what was submitted."
  fails_when: any of the three exercised fields keeps the submitted value, rather than the refetch's own
    (deliberately different) answer, once that refetch lands.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: keeps isDirty true immediately after a successful save, and clears it only once the invalidated query's own refetch answers with matching values
  proves: "Criteria 2 and 3 (input_schema and its own baseline) — corroborates the two dedicated tests above on
    the exact hook this task edited."
  fails_when: inputSchema.value is anything other than the submitted value before the refetch answers, or
    isDirty stays true (or the field differs from the refetch answer) once it does.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: re-baselines both JSON fields to the refetched answer, not whatever was just submitted, once that refetch has landed
  proves: "Criterion 4, corroborated — once the refetch answers with content that differs from both the
    submission and the PUT response body, the field equals the refetch's own answer."
  fails_when: inputSchema.value equals the submitted value, or the PUT response's value, rather than the
    refetch's own answer, once isDirty clears.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: returns isSubmitting to false and keeps both the edit and the ready phase once the PUT fails, with isDirty still true
  proves: "Criterion 5 (no-reset half) — a save that fails leaves the surface exactly as before this task: no
    field or baseline reset of any kind."
  fails_when: a failed save resets isDirty to false or changes phase away from the edit/ready state it already held.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: shows the registry's own distinguishable refusal message when the edit is refused
  proves: "Criterion 5 (failure-presentation half) — the existing failure presentation is unchanged."
  fails_when: a recognised refusal stops showing its own distinguishable message.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: falls back to a generic message for a refusal this surface does not recognise
  proves: "Criterion 5 (failure-presentation half) — the existing failure presentation is unchanged, for an
    unrecognised refusal."
  fails_when: an unrecognised refusal stops falling back to the generic message.
- file: src/hooks/use-capability-detail-view.spec.ts
  name: discards back to the schema values the post-save refetch answered with, not the values loaded before it
  proves: "rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface's fixed
    content (a discard returns to the surface's own last read), corrected: a pre-existing test in this same
    file asserted discard falls back to the just-submitted values, which this task's change falsified since
    the last read is now genuinely the refetch's own answer, decoupled from the submission."
  fails_when: onDiscard resets the two schema fields to any value other than the post-save refetch's own answer.
- file: src/routes/capability-detail-screen-discard.spec.ts
  name: resets both schema fields to the post-save refetch's own answer once the confirmation Dialog is confirmed, rather than the values loaded before it
  proves: "The same fact as the sibling hook-level test above, exercised at the screen level through the
    Discard confirmation dialog."
  fails_when: the Discard confirmation resets the two schema fields to any value other than the post-save
    refetch's own answer.
not_applicable:
- edge_case: the invalidated query's own refetch failing, rather than answering, after a successful save,
    for the fields/baselines themselves (as opposed to the outcome statement)
  why: Neither criterion 2 nor criterion 3 is stated over that case; only the outcome statement's own standing
    (criterion 1's UNDERDETERMINED note) is tested for a failed refetch.
untested:
- "criterion 2's own totality (\"every form field's value and both schema baselines\") is exercised for
  input_schema, output_schema and connector; the remaining plain react-hook-form-managed fields (name,
  version, nature, timeout, concept, payload_notes) are not separately exercised by any test in this record."
- "rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers's
  clause that no such field is ever drawn from any other answer (a list-capabilities page,
  read-capability-for-concept, or another identity's read) is not exercised."
- "rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's fact
  is not decided whole — only the fields this record's tests exercise are, during the save/discard flows, not
  the full declared-attribute set from the surface's first opening moment."
---

## What it is

Criteria 1, 2, 3 and 4 are each proved directly by two dedicated hook-level tests isolating the invalidated
refetch behind a controllable promise, corroborated by the corrected pre-existing save tests on the same
hook. Criterion 5 is proved by two pre-existing, unrelated tests already covering the failure path. Two
further pre-existing tests (onDiscard after a save, at the hook and the screen level) that this task's own
change also falsified are corrected here and added as proof of the discard rule's own fixed content.

## Notes

None.
