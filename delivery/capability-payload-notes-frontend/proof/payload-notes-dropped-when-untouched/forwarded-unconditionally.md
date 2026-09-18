---
target: frontend
title: Both capability form hooks forward an untouched, previously-declared payload_notes unconditionally
summary: Six tests, three newly written and three already standing, together show that use-capability-detail
  and use-capability-form each carry payload_notes forward exactly as the form holds it on resubmission --
  an existing value survives editing an unrelated field, an explicit clear submits as an empty string, and
  an explicit new value submits as typed -- across both hooks.
implementation: sha256:24e1980e492a0f2d31f687745229b4e30b05c11d1da271b1749ce0201fe1d4de
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/payload-notes-dropped-when-untouched-forwarded-unconditionally-suite
tests:
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: carries the previously loaded payload_notes forward in the submitted body, unchanged
  proves: Criterion 1 -- a capability loaded with existing payload_notes, resubmitted through
    use-capability-detail after editing only an unrelated field, is submitted with payload_notes
    carrying that same existing text.
  fails_when: The mutationFn's PUT body stops forwarding the form's current payload_notes value
    unconditionally -- e.g. if the dirtyFields.payload_notes gate this task removed were
    restored, or if editing the unrelated connector field caused payload_notes to be dropped or
    overwritten.
- file: src/hooks/use-capability-form-payload-notes-submission.spec.ts
  name: carries the previously loaded payload_notes forward in the submitted body, unchanged
  proves: Criterion 2 -- the same behavior, through use-capability-form.
  fails_when: use-capability-form's own mutationFn stops forwarding the form's current
    payload_notes value unconditionally under the same conditions as above.
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: carries payload_notes as an empty string in the submitted body, and no other content
  proves: Criterion 3 (use-capability-detail instance) -- an operator who explicitly clears
    payload_notes and resubmits still submits it as an empty string, not the prior text.
  fails_when: The PUT body stops carrying an explicitly-cleared payload_notes as exactly '',
    e.g. by falling back to a prior or default value instead of the form's current, cleared one.
- file: src/hooks/use-capability-form-payload-notes-submission.spec.ts
  name: carries payload_notes as an empty string in the submitted body
  proves: Criterion 3 (use-capability-form instance) -- the same clearing behavior, through
    use-capability-form.
  fails_when: use-capability-form's mutationFn stops carrying an explicitly-cleared payload_notes
    as exactly '' under the same conditions.
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: forwards a payload_notes value the operator just set into the PUT body, unchanged
  proves: Criterion 4 (use-capability-detail instance) -- an operator who explicitly types new
    payload_notes and resubmits still submits the newly typed text.
  fails_when: The PUT body stops carrying a newly typed payload_notes value unchanged.
- file: src/hooks/use-capability-form-payload-notes-submission.spec.ts
  name: forwards a payload_notes value the operator just set into the PUT body, unchanged
  proves: Criterion 4 (use-capability-form instance) -- the same typing behavior, through
    use-capability-form.
  fails_when: use-capability-form's mutationFn stops carrying a newly typed payload_notes value
    unchanged.
not_applicable:
- edge_case: A capability loaded with payload_notes already an empty string, left untouched,
    resubmitted after editing an unrelated field.
  why: The unconditional forward carries values.payload_notes exactly as the form holds it
    regardless of its content; an empty string and non-empty text traverse the identical code
    path in both mutationFns, so this dimension does not change what criteria 1 and 2 require
    beyond what their non-empty-text representative already establishes.
- edge_case: A capability with no payload_notes ever declared, submitted without any field
    touched.
  why: Not a criterion of this task -- every criterion here speaks to a value that was
    previously declared or explicitly acted on this session. The undeclared-and-untouched case
    is already a sibling proof's own ground and is unaffected by this task's change.
- edge_case: Two concurrent submissions of the same form.
  why: No criterion of this task concerns concurrency; the submit-in-flight guards are
    pre-existing behavior this task's implementation did not touch.
- edge_case: The PUT request fails after payload_notes was forwarded.
  why: No criterion of this task concerns the error path; error-to-message mapping is unchanged
    and belongs to the save-failure-message proofs already covering it.
untested:
- domain/integration/capability's fact spans the whole aggregate's contract -- name, version,
  nature, both schemas, timeout, connector, concept, and the registry's own responsibility to
  refuse what departs from it. No finite test reachable from this task's own files decides that
  fact whole; it says nothing about the aggregate's identity, its other required fields, or the
  registry's refusal behavior, which stays on duty for the rest of its fact.
---

## What it is

Six tests, three newly written and three already standing, prove both capability form hooks now
forward payload_notes exactly as the form holds it on resubmission, whether the value was loaded
untouched, explicitly cleared, or explicitly retyped.

## Notes

None.
