---
title: The answered draft stated whole
summary: The statement a drafted outcome makes to the operator -- its input_schema, its output_schema, and every unresolved item by the name and the reason the answer gave it, each reason held apart from the other.
rationale: I cut the draft's statement apart from the refusal's because they read different halves of the outcome and would change for different reasons -- one if the draft's own attributes change, the other if the operation's refusal vocabulary does.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: A drafted outcome is stated to the operator whole -- both schemas and every unresolved item by name and by reason -- and states nothing the answer did not carry.
criteria:
- Where the outcome is a drafted one, the surface states that answer's input_schema text.
- Where the outcome is a drafted one, the surface states that answer's output_schema text.
- Every unresolved item the answer carried is stated, each by the name that answer gave it.
- Each stated unresolved item carries the reason the answer named for it.
- An item whose reason is schema-not-reducible-to-a-type is stated apart from an item whose reason is name-claimed-by-another-parameter, neither read as the other and neither collapsed into a single undifferentiated reason.
- Where the answer carries one name under both reasons, both items are stated, each under its own reason.
- The surface states no unresolved name the answer did not carry.
- The surface states no unresolved reason the answer did not carry for the item it is stated against.
- Where the answer carried no unresolved item, no unresolved name and no reason stands stated.
depends_on:
- task/schema-helper-request-and-statement/helper-offered-on-the-authoring-surface
reference:
- frontend/app/src/hooks/use-draft-capability-schema-from-openapi.ts
- frontend/app/src/routes/capability-schema-helper-fields.tsx
- frontend/app/src/routes/connector-configuration-helper-fields.tsx
implements:
- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
---

## What it is

What the operator reads when the operation answers with a draft: the two schema texts and the disclosure of everything the draft could not honestly resolve.
The unresolved list is what lets the operator judge each gap against what the document itself declared, so it is stated beside the two schemas and never in their place.

## Notes

This task states the draft; it writes into no field of the form.
UNDERDETERMINED, from the specification -- No criterion locates where the draft is stated; rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator states that the surface holding the Schema Helper is what states the draft, and rules/integration/a-capability-authoring-surface-offers-a-schema-helper states the helper is never a separate screen or a dialog of its own, but every criterion here says only "the surface", which any surface satisfies.
ADVISORY, from the specification -- The criterion over one name under both reasons is demonstrable only over an answer carrying one name twice; that construct is held by rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason, not a candidate here.
Decision, beyond the covers — stand: rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason is the already-delivered backend increment's own claim; this task states whatever the answer carries rather than re-deriving which names collide.
ADVISORY, from the specification -- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator's Description carries the restraint that the Input schema and Output schema fields' own content stand untouched by this answer's arrival, located in rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival, not a candidate here.
Decision, beyond the covers — stand: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival is the sibling epic's own claim, implemented by this initiative's other epic's tasks; this task states the draft and writes into no field, so it honors that restraint by never reaching for one.
REMAINDER, from the specification -- Every clause of rules/integration/a-capability-authoring-surface-offers-a-schema-helper's statement reaches no criterion of this task, which begins at an answer already in hand.
REMAINDER, from the specification -- Every clause of rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator's statement reaches no criterion of this task, whose criteria all condition on the outcome being a drafted one.
REMAINDER, from the specification -- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers's clause reaches no criterion of this task.
REMAINDER, from the specification -- Every clause of rules/integration/a-pending-schema-draft-request-is-not-dispatched-again's statement reaches no criterion of this task.
REMAINDER, from the specification -- constraints/the-openapi-document-is-fetched-by-the-backend is not reached by any criterion of this task, which states an answer already fetched and generated by the backend.
