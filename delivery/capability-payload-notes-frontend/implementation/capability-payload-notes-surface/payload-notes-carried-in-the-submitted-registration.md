---
target: frontend
title: payload notes forwarded from both capability form hooks' submitted bodies
summary: Each of the two capability form hooks now forwards payload_notes by name from its already-seeded
  form value into the PUT body it submits, exactly like the existing timeout precedent.
task: sha256:ba1f48ca2c405ad0a8657a030034a99d6b9d46192e9bb6c92a5d408151307e3c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-carried-in-the-submitted-registration-build
files:
- path: src/hooks/use-capability-form.ts
  effect: 'The PUT body the create-path mutation submits now includes `payload_notes: values.payload_notes`,
    forwarding the form value unchanged.'
- path: src/hooks/use-capability-detail.ts
  effect: 'The PUT body the edit-path mutation submits now includes `payload_notes: values.payload_notes`,
    forwarding the form value unchanged.'
criteria:
- criterion: The registration body use-capability-detail submits carries payload_notes as the form value
    holds it.
  met: true
  how: 'The mutationFn body object in use-capability-detail.ts now has `payload_notes: values.payload_notes`
    alongside the other by-name-forwarded fields (nature, timeout, connector, concept), reading straight
    from the same form values object react-hook-form validates and passes to mutation.mutate.'
- criterion: The registration body use-capability-form submits carries payload_notes as the form value
    holds it.
  met: true
  how: 'The mutationFn body object in use-capability-form.ts now has `payload_notes: values.payload_notes`
    alongside the same set of by-name-forwarded fields, forwarded from the create-path form values unchanged.'
- criterion: Where the operator declared no payload notes, the submitted body states payload_notes as
    absent or as an empty string and as no other content.
  met: true
  how: capabilityFormSchema declares payload_notes as z.string().optional(), so an operator who declared
    none leaves the form value undefined or an empty string if they typed and cleared it; values.payload_notes
    is forwarded as exactly that value with no fallback, transform or additional content, and JSON.stringify
    drops an undefined property from the serialized body rather than emitting null or any other placeholder.
- criterion: Where every required attribute is declared and payload notes is left undeclared, the contract
    rule does not refuse the submission and the register-capability call is issued.
  met: true
  how: No frontend-side gate was added on payload_notes -- inputSchemaValid/outputSchemaValid are the
    only conditions guarding mutation.mutate in both hooks, unchanged by this task -- so a submission
    with every other required field declared and payload_notes undefined reaches apiFetch's PUT call exactly
    as before; a-capability-declares-its-contract's own incomplete-contract refusal is a backend rule
    this task does not touch and the body it receives states payload_notes absent, which that rule already
    reads as undeclared rather than as a violation.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/hooks/use-capability-detail.ts
  how: Both hooks now forward the operator's own free-text payload_notes account (declared optional on
    the aggregate) into the PUT body by name, the same way every other declared contract attribute already
    reaches the registry from these two submission paths.
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/hooks/use-capability-form.ts
  - src/hooks/use-capability-detail.ts
  how: The rule reads an absent or empty payload_notes as undeclared rather than as an incomplete contract,
    since payload_notes is not among the rule's required attributes; forwarding the form value unchanged
    lets a submission with every required attribute present reach the registry without this rule's refusal,
    exactly as the task's own Notes state it asserts only that this rule does not refuse such a submission.
preserved:
- Every other field already forwarded in each PUT body (nature, input_schema, output_schema, timeout,
  connector, concept) is untouched, in the same order and shape as before the edit.
- The defaultValues seeding of payload_notes from the read answer in both hooks (delivered by a sibling
  task) was not touched, per the task's own instruction.
- The discard/reset behavior in use-capability-detail-view.ts, and the identity-read presentation on the
  detail-ready-view surface, were not touched -- both are out of this task's reach per its own Notes.
deferred:
- what: The specification's clause that payload_notes stands absent throughout a presentation exactly
    where the read's answer carried none.
  why: The task's own Notes mark this as a REMAINDER belonging to the task implementing the capability
    identity-read presentation of payload_notes on the detail surface, not this one.
- what: The requirement that a discard act return payload_notes to the last-read content.
  why: The task's own Notes mark this as a REMAINDER belonging to the discard-act task; this task touches
    neither the discard act nor its confirming act.
---
## What it is

Both capability form hooks now forward payload_notes by name into the PUT body they submit, on the exact precedent every other declared attribute already follows.
No frontend-side gate was added on the field, so a submission with every required attribute present and payload_notes left undeclared reaches the registry unchanged.

## Notes

Whether the registry accepts such a submission is decided elsewhere and is not claimed here, per the task's own Notes.
