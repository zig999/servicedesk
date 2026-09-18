---
title: payload notes presented from the identity read's own answer
summary: Seed the form values both capability form hooks present from the payload_notes the identity read
  answered, absent where that answer carried none, and return the field to that content on discard.
rationale: Seeding from the read is one seam and submitting is another, and the inventory records that
  each hook builds its defaults and its request body independently; cutting by direction rather than by
  file keeps one outcome per task.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
objective: The payload notes an operator meets on a capability surface are the ones that capability's
  identity read answered, and no others.
criteria:
- Where the identity read answers a capability whose payload_notes carries content, the form values use-capability-detail
  presents carry that same content for payload_notes.
- Where the identity read answers a capability carrying no payload_notes, the form values use-capability-detail
  presents state no payload_notes content.
- Where an existing capability is loaded into use-capability-form, the payload_notes that answer carried
  is the payload_notes that hook's form values hold.
- payload_notes holds the answered content from the first moment the form values stand, and not from a
  later moment inside the presentation.
- The act that returns the surface's fields to the registration the surface last read returns payload_notes
  to the content that read answered.
- No payload_notes content is presented that the identity read's own answer did not carry.
depends_on:
- task/capability-payload-notes-surface/payload-notes-declared-in-the-frontend-capability-contract
implements:
- domain/integration/capability
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---
## What it is

use-capability-detail builds its defaultValues from the answered Capability, and payload_notes joins the attributes it reads from query.data.
use-capability-form builds its defaultValues from an existing Capability on the same pattern, so the create path reads the attribute the same way.
Discard on the detail surface returns every field to the content the surface last read, and payload_notes is one of those fields.

## Notes

An operator's own edit of the field is theirs and is no statement of this reading, so a criterion here is written over the content before any edit.

REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them also states its rule over name, version, nature, input_schema, output_schema, timeout, connector and concept, none from a list-capabilities page, a read-capability answer or a register-capability submission; no criterion of this task reaches those eight attributes, only payload_notes. Belongs to the task(s) presenting those required declared attributes from the identity read's own answer.
REMAINDER, from the specification -- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface also governs the connector configuration surface, requires the discard to carry no register-capability or register-connector call and to move the operator to no other surface, and requires a further explicit act before it takes effect; only its "sets every field to the content of the registration that read answered" clause, read over payload_notes, is reached here. Belongs to the tasks delivering the discard act itself.
REMAINDER, from the specification -- rules/integration/a-capability-declares-its-contract's clauses on required-attribute declaration, the timeout default, and the HTTP 422 refusal reach no criterion of this task, which only seeds and restores form values from a read's answer and refuses nothing. Belongs to the act of registering a capability through register-capability.
ADVISORY, from the specification -- this task can only be implemented against an identity-read answer that already carries payload_notes; if that operation's own response shape does not, the seam sits outside these candidates.
