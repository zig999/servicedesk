---
type: invariant
statement: >-
  The content of the Configuration field a-connector-configuration-authoring-surface-offers-a-configuration-helper
  states stands exactly as it stood when a draft's answer arrives, whether that answer is a draft
  or a refusal: its arrival writes nothing into that field, whose content changes only where the
  operator themselves applies the draft.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The Configuration field is untouched by the answer's arrival because applying is the operator's own act and nothing else. `applying-a-drafted-configuration-changes-only-the-local-edit` makes applying the operator carrying their own review into the field they are already editing, and `an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation` refuses even that act over an unsubmitted edit absent a further explicit confirmation, which `scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation` records. A helper writing the drafted text into the field the moment the answer arrived would perform, on its own initiative, the act those two rules hold to the operator: it would destroy an edit held nowhere else, and it would do it before the operator had read the unresolved items and the mismatch the review exists for.
