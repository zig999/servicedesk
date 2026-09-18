---
target: frontend
title: Both capability form hooks forward payload_notes unconditionally
summary: use-capability-detail.ts and use-capability-form.ts drop the dirtyFields.payload_notes
  gate from their PUT-body mutationFns, forwarding the form's current payload_notes value the
  same way every other declared attribute already is.
task: sha256:99a628a6ee08d0e7d8ebc5b89eb5f76ebdcadd028e0dc3a5014ebc695922b834
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/payload-notes-dropped-when-untouched-forwarded-unconditionally-build
files:
- path: src/hooks/use-capability-detail.ts
  effect: >-
    The PUT-body mutationFn's conditional spread
    `...(form.formState.dirtyFields.payload_notes ? { payload_notes: values.payload_notes } : {})`
    is replaced with the unconditional `payload_notes: values.payload_notes`, the same shape
    every other declared attribute in the body already uses.
- path: src/hooks/use-capability-form.ts
  effect: The same replacement, in this hook's own PUT-body mutationFn.
criteria:
- criterion: A capability loaded with existing payload_notes, resubmitted through
    use-capability-detail after editing only an unrelated field, is submitted with
    payload_notes carrying that same existing text.
  met: true
  how: values.payload_notes always holds the form's current field value regardless of which
    field the operator touched; the body now always carries it.
- criterion: A capability loaded with existing payload_notes, resubmitted through
    use-capability-form after editing only an unrelated field, is submitted with
    payload_notes carrying that same existing text.
  met: true
  how: Same mechanism, in use-capability-form.ts's own mutationFn.
- criterion: An operator who explicitly clears payload_notes and resubmits through either hook
    still submits payload_notes as an empty string, not the prior text.
  met: true
  how: Clearing the field sets values.payload_notes to '', which the unconditional forward
    carries as-is.
- criterion: An operator who explicitly types new payload_notes and resubmits through either
    hook still submits the newly typed text.
  met: true
  how: values.payload_notes reflects whatever the operator last typed; the unconditional forward
    carries it unchanged.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-capability-form.ts
  how: payload_notes is a declared, optional attribute of the capability; both hooks now
    forward whatever value the form currently holds for it, the same as every other declared
    attribute, rather than conditioning it on this session's own edit history.
preserved:
- Every other attribute's unconditional forwarding in both mutationFns, unchanged.
- use-capability-form.ts's pre-existing `void form.formState.isDirty;` line, left untouched.
---

## What it is

Both capability form hooks' PUT-body mutationFns forward payload_notes unconditionally now,
dropping the dirtyFields gate that previously dropped an untouched, previously-declared value
on resubmission.

## Notes

None.
