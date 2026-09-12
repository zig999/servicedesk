---
title: The apply confirmation itemises what it would change
summary: Before an unsubmitted edit is replaced, the confirmation names each top-level key and each statusMap,
  responseMap, query and headers key the apply would add, remove or change.
objective: The confirmation asked before applying a draft over an unsubmitted edit states, key by key,
  what applying it would change, or that this cannot be itemised.
criteria:
- Where the field's unsubmitted content and the draft's configuration are both well-formed JSON object
  text, the confirmation states each top-level key the apply would add.
- Under the same condition, the confirmation states each top-level key the apply would remove.
- Under the same condition, the confirmation states each top-level key whose value the apply would change.
- Under the same condition, the confirmation states each key of the statusMap, responseMap, query and
  headers objects the apply would add, remove or change in value.
- Where the field's content is not well-formed JSON object text, the confirmation states that what would
  change cannot be itemised.
- Where the operator does not confirm, the field's content stands exactly as it was.
sources:
- intake/scope.md
implements:
- rules/integration/an-apply-confirmation-states-what-the-draft-would-change
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
- rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text
- domain/integration/connector-configuration-draft
---

## What it is
The itemisation the confirmation dialog owes, in place of the fixed sentence it shows today.
A draft lists every field the document declares under the document's own names, while the edit it replaces may hold two keys the operator chose and renamed by hand.

## Notes
The draft is compared with what the operator already holds, and with nothing else -- it stays the same function of the operation whatever is registered or typed.
ADVISORY, from the specification -- rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text now states that a connector configuration draft's configuration is always well-formed JSON object text, closing the earlier unstated question this task's criteria raised (whether the draft side of criterion 5's exception could ever be reached). With it, the two branches the apply-confirmation rule draws -- both texts well-formed, and the field's content not well-formed -- are total over every draft the confirmation can meet, so criterion 5's naming only the field's content leaves no case unanswered.
REMAINDER, from the specification -- A clause of rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation's statement reaches no criterion here: that applying a draft to it is performed only where the operator, in a further explicit act, confirms that the unsubmitted edit is to be replaced. The criteria take only that clause's negative half (criterion 6); scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation's first then ("the surface asks the operator to confirm before replacing the field's content") is that unreached half. Belongs to the task implementing the confirmation gate itself.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text's statement is a guarantee over generation, for every operation of every document a draft is generated from. This task consumes that guarantee as the premise for itemising against the draft side without a not-well-formed branch, but no criterion here demonstrates it. Belongs to the task generating a connector configuration draft's configuration text from a chosen operation (the backend draft generation implementing contracts/integration/connector-configuration-draft's draft-connector-configuration-from-openapi).
ADVISORY, from the specification -- Criteria 1, 2 and 3 separate the added, the removed and the changed top-level keys, but neither they nor the apply-confirmation rule's statement asks that the three be stated apart from one another; the statement says only that the confirmation states the keys that applying would add, remove or change in value. A confirmation listing every affected key under one undifferentiated heading satisfies all four itemisation criteria while leaving the operator unable to read which keys they would lose.
