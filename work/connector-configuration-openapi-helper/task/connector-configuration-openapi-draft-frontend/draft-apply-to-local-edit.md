---
title: Apply a draft to the Configuration field's local edit
summary: The apply act that writes the drafted configuration text through the Configuration field's own local onChange and nothing else -- no save mutation, no request, no change to anything registered.
rationale: I cut the apply away from the confirmation that guards it because they are two rules with two reasons to change -- where the apply writes, and when the operator must confirm -- and the apply's write target is demonstrable on a field holding no unsubmitted edit.
sources:
  - intake/frontend-scope.md
depends_on:
  - task/connector-configuration-openapi-draft-frontend/configuration-helper-section
objective: Applying an answered draft replaces the Configuration field's own local, unsubmitted content with the draft's configuration text and changes nothing else on the surface or in the registry.
criteria:
  - Applying an answered draft sets the Configuration field's local value to that draft's configuration text.
  - Applying an answered draft invokes neither screen's save mutation and dispatches no request.
  - After an apply, every connector configuration currently registered stands exactly as it stood in membership and in content.
  - After an apply, the operator remains on the same surface with the applied text held unsubmitted.
  - Applying an answered draft leaves the Connector field's value exactly as it stood.
  - After an apply, the Configuration field's own validity reading is recomputed from the applied text the same way it is for text typed by hand.
  - No apply is offered where no draft has been answered.
implements:
  - rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-draft
---

## What it is

The operator carrying a reviewed draft into the field they are already editing.
It is a local write, and the operator still submits it or does not.

## Notes

The apply writes only the ConfigurationFieldState onChange the surface already passes into the form fields; the two screens' save mutations key off the same Connector value the apply leaves untouched, at frontend/app/src/hooks/use-connector-configuration-form.ts and frontend/app/src/hooks/use-connector-configuration-detail.ts.
UNDERDETERMINED, from the specification — this task's own criteria do not gate the apply on confirmation; that guard is the sibling unsaved-edit-apply-confirmation task's, and this task's delivery should be read together with that sibling's rather than on criterion 1 alone.
UNDERDETERMINED, from the specification — criterion 7 ("no apply is offered where no draft has been answered") is silent about a draft answered earlier still being offered after a later request was refused; rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator states no drafted part stands beside a refusal. Implementation: withdraw or disable the apply affordance for a prior draft once a subsequent request is refused, so a refused request never leaves an applicable stale draft standing.
REMAINDER, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper's offer clause, and every clause of the refusal/answer-disclosure rules, reach no criterion here.
REMAINDER, from the specification — rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation and scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation reach no criterion here. Belongs to the confirmation task.
ADVISORY, from the specification — criterion 6's validity-recomputation is dischargeable as equivalence with hand-typed text against whatever reading the surface already performs; no candidate states that a validity reading exists at all.
