---
title: payload notes carried in both submitted registration bodies
summary: Forward payload_notes by name from the form values into the registration body each of the two
  capability form hooks submits, leaving it undeclared where the operator declared none.
rationale: The submission body is a seam of its own with its own reason to change, separate from what
  a surface reads back, so it is cut apart from the read path.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
objective: A capability registration an operator submits carries the payload notes they declared, and
  carries payload notes as undeclared where they declared none.
criteria:
- The registration body use-capability-detail submits carries payload_notes as the form value holds it.
- The registration body use-capability-form submits carries payload_notes as the form value holds it.
- Where the operator declared no payload notes, the submitted body states payload_notes as absent or as
  an empty string and as no other content.
- Where every required attribute is declared and payload notes is left undeclared, the contract rule does
  not refuse the submission and the register-capability call is issued.
depends_on:
- task/capability-payload-notes-surface/payload-notes-declared-in-the-frontend-capability-contract
implements:
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
---
## What it is

Each hook builds its own PUT body from form values, so the attribute is forwarded by name in both of them.
a-capability-declares-its-contract reads an absent or empty attribute as undeclared, and payload_notes is the one attribute a registration may leave so.

## Notes

The last criterion asserts only that this rule does not refuse such a submission; whether the registry accepts it is decided elsewhere and is not claimed here.

REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's clause that payload_notes stands absent throughout a presentation exactly where the read's answer carried none, and never otherwise, reaches no criterion of this task: this task's criteria are about what the two form hooks put into the submitted body, and the rule's own statement holds that an operator's edit is no statement of that reading. Belongs to the task implementing the capability identity-read presentation of payload_notes on the detail surface.
REMAINDER, from the specification -- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface's requirement that the discard act return every field, payload_notes included, to the content of the registration the surface last read reaches no criterion of this task, which touches neither the discard act nor its confirming act. Belongs to the task implementing the discard act on the capability detail surface.
