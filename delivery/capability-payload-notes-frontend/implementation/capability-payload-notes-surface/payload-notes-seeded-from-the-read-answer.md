---
target: frontend
title: Seed and restore payload_notes from the capability identity read
summary: Both capability form hooks now build their defaultValues' payload_notes from the same Capability
  answer they already read every other optional attribute from, so the field presents, discards and restores
  exactly as that read answered it.
task: sha256:49720bd60e93b4fe28a6ddc015af0f25d9ac3b8a5a4013d6e6cb761fb1e2de21
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-seeded-from-the-read-answer-build
files:
- path: src/hooks/use-capability-form.ts
  effect: 'Added `payload_notes: existing?.payload_notes` to the useForm defaultValues object, on the
    same line pattern already used for every other optional/scalar attribute (timeout, connector, concept)
    sourced from the existing Capability passed in.'
- path: src/hooks/use-capability-detail.ts
  effect: 'Added `payload_notes: query.data.payload_notes` to the form.reset({...}) call made inside the
    render-time sync block that fires the first time (and every time) query.data changes, before the "ready"
    phase is returned.'
criteria:
- criterion: Where the identity read answers a capability whose payload_notes carries content, the form
    values use-capability-detail presents carry that same content for payload_notes.
  met: true
  how: form.reset in use-capability-detail.ts now assigns payload_notes from query.data.payload_notes,
    the same answer every other declared attribute in that reset call is read from.
- criterion: Where the identity read answers a capability carrying no payload_notes, the form values use-capability-detail
    presents state no payload_notes content.
  met: true
  how: query.data.payload_notes is `string | undefined` on the Capability type; where the answer carried
    none it is undefined, and form.reset assigns that undefined through verbatim -- no fallback or literal
    is supplied for this field, unlike name/version/nature/connector which default to "" and read-only.
- criterion: Where an existing capability is loaded into use-capability-form, the payload_notes that answer
    carried is the payload_notes that hook's form values hold.
  met: true
  how: useForm's defaultValues in use-capability-form.ts now reads `existing?.payload_notes`, on the same
    precedent as timeout's `existing?.timeout`.
- criterion: payload_notes holds the answered content from the first moment the form values stand, and
    not from a later moment inside the presentation.
  met: true
  how: The sync block in use-capability-detail.ts runs unconditionally during render and calls form.reset
    (now including payload_notes) before the function's own "ready" phase is returned, so the very first
    "ready" render already carries it; in use-capability-form.ts payload_notes is part of the same defaultValues
    object useForm is constructed with, so it is present before any render of the "ready" phase.
- criterion: The act that returns the surface's fields to the registration the surface last read returns
    payload_notes to the content that read answered.
  met: true
  how: 'The detail surface''s discard act (onDiscard in use-capability-detail-view.ts) calls detail.form.reset()
    with no arguments, which react-hook-form resolves to the form''s current default values -- the same
    object the sync block last set via form.reset({..., payload_notes: query.data.payload_notes}). No
    change to onDiscard itself was needed or made; adding payload_notes to that reset call was sufficient
    to reach it through this already-existing mechanism.'
- criterion: No payload_notes content is presented that the identity read's own answer did not carry.
  met: true
  how: Both edits assign payload_notes exclusively from query.data.payload_notes / existing?.payload_notes
    -- the Capability the identity read answered -- with no other source, default, or fallback value introduced
    for this field.
nodes:
- node: domain/integration/capability
  how: payload_notes was already declared optional on this node by the prior task; this task adds no attribute
    and changes no declaration, only the two frontend hooks' handling of the value that attribute's presence
    or absence already governs.
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  how: Answered for its payload_notes clause only, exactly as the task's own Notes scope it -- the detail
    surface's form values now state payload_notes exactly as read-capability-by-identity's answer carried
    it (present or absent), from the first moment the "ready" presentation stands, drawn from no other
    answer. The rule's clauses over the other eight attributes and its list-capabilities/read-capability/register-capability
    exclusions are unreached by this task per its own Notes.
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  how: Answered for its "sets every field of s to the content of the registration that read answered"
    clause, read over payload_notes only, per the task's own Notes. The discard act itself was already
    implemented and is untouched; adding payload_notes to the reset call the discard already relies on
    extends that existing mechanism to this one additional field.
  encoded_at:
  - src/hooks/use-capability-detail.ts
inferences:
- inferred: '"Form values" in the task''s criteria means react-hook-form''s tracked values (what useForm''s
    defaultValues seeds and what form.reset/getValues subsequently carry), not necessarily a value bound
    to a visible input control.'
  from: The inventory's own risk note that payload_notes has no rendering precedent yet, together with
    this task's criteria speaking exclusively of "form values" and never of a rendered field -- read together
    with the task's own REMAINDER notes, which scope every other attribute's presentation and the discard's
    UI-facing clauses to other tasks.
- inferred: The field is placed as the last key in each defaultValues/reset object literal, after concept.
  from: domain/integration/capability declares payload_notes last, after concept, in its attribute list,
    and both existing object literals already followed that same declared order for every other attribute.
preserved:
- Every other attribute's existing seeding, dirty-tracking, submission and discard behavior in use-capability-form.ts
  and use-capability-detail.ts is unchanged.
- The mutation request bodies in both hooks are untouched; payload_notes is not forwarded in either PUT
  body by this task, per its own Notes excluding register-capability's clauses from its scope.
- use-capability-detail-view.ts's onDiscard implementation is untouched; it already resets to whatever
  use-capability-detail.ts's form.reset last established.
deferred:
- what: Rendering a visible form control for payload_notes in capability-form-fields.tsx.
  why: No criterion of this task calls for a rendered control -- its criteria speak only of "form values,"
    and widening this task to add one would be adding UI work the task's own scope, read against its Notes,
    assigns elsewhere.
- what: Forwarding payload_notes in the two hooks' PUT request bodies.
  why: The task's own Notes explicitly exclude register-capability's clauses from this task's reach.
---
## What it is

use-capability-form.ts and use-capability-detail.ts now seed payload_notes into their form values from the same Capability the identity read answered, on the same pattern every other optional attribute already follows.
The detail surface's existing discard act reaches payload_notes for free, through the same form.reset() mechanism it already used for every other field.

## Notes

Rendering a visible control for the field, and forwarding it in either submitted body, are deferred to the sibling tasks the plan already cuts for them.
