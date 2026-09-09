---
title: Confirm before an apply overwrites an unsubmitted edit
summary: The unsubmitted-edit reading on each screen and the confirmation dialog an apply passes through when one stands, with the field's content untouched until the operator confirms.
rationale: I cut the unsubmitted-edit reading into this task rather than its own because the reading and the confirmation are the one guard with the one reason to change, and the confirmation cannot be shown met without the reading it turns on.
sources:
  - intake/frontend-scope.md
depends_on:
  - task/connector-configuration-openapi-draft-frontend/draft-apply-to-local-edit
objective: An apply requested while the Configuration field holds an edit the operator has not submitted replaces that content only after the operator's own further explicit confirmation, and the content stands exactly as the operator left it until then.
criteria:
  - On the ready detail view, an apply requested while the Configuration field's content differs from the registered configuration the surface last read asks the operator to confirm before any content is replaced.
  - On the create screen, an apply requested while the Configuration field holds content the operator entered and has not submitted asks the operator to confirm before any content is replaced.
  - Where the operator does not confirm, no character of the Configuration field's content changes and no part of the draft's configuration text is written to it.
  - Where the operator confirms in a further act after having asked for the apply, the Configuration field's content is replaced with the draft's configuration text.
  - Where the Configuration field holds no unsubmitted edit, this rule's confirmation requirement does not refuse the apply.
  - Asking for the apply, on its own, replaces no content on either screen.
  - Neither asking for the confirmation, declining it nor confirming it issues a register-connector call.
implements:
  - rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  - rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  - scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
---

## What it is

The further explicit act that stands between a first gesture and an edit held nowhere else.
It reads whether an unsubmitted edit stands, on each of the two screens, and asks before an apply destroys one.

## Notes

The scope points the confirmation at the dialog pattern the existing "Discard changes" affordance uses, at frontend/app/src/routes/connector-configuration-detail-ready-view.tsx; that dialog exists only on the detail view, so the create screen needs its own instance.
isDirty is undefined on the create screen and a computed boolean on the detail view, so the unsubmitted-edit reading this task needs is its own comparison on each screen rather than a shared prop.
REMAINDER, from the specification — rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator reaches no criterion here; its Configuration-field-untouched clause governs a refusal, not an apply, and does not absorb or narrow this task's own confirmation fact.
UNDERDETERMINED, from the specification — criterion 1's baseline ("the registered configuration the surface last read") is stated by rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface, outside this epic's covers, not by the candidate confirmation rule itself; read as descriptive of the existing isDirty computation, not a new claim on that rule.
Decision, beyond the covers — stand: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface is named only descriptively, as the pre-existing rule the isDirty baseline this task reuses already comes from; no criterion here claims to implement it.
ADVISORY, from the specification — criterion 1's scoping to the detail view's "ready" reading rests on rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read's three-window distinction, outside this epic's covers; read descriptively, since the confirmation rule itself does not distinguish the windows.
Decision, beyond the covers — stand: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read is named only descriptively, as the pre-existing rule that already draws the "ready" reading this task's criterion 1 scopes to; no criterion here claims to implement it.
