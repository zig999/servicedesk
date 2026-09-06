---
title: Connector configuration form action footer
summary: The connector-configuration form's action row rendered through the shared ButtonFooter, carrying Save, the screen's injected actions and a Cancel.
rationale: I cut this family apart from the capability family, although both migrate the same slot pattern, because each family's form-fields component and its two screens change for their own reason and each is demonstrable without the other.
sources:
- intake/scope.md
objective: The connector-configuration form's action row is rendered by the shared ButtonFooter, carrying Save, whatever the owning screen injects beside it, and a Cancel that leaves the authoring without registering anything.
criteria:
- connector-configuration-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
- Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save, and no second prop for appending buttons is introduced.
- Submitting the connector-configuration form issues the registration, and where it succeeds the operator is taken to the surface addressed by that configuration's own connector name.
- Where the registry answers a submission, the surface states the outcome — that the configuration was registered, naming the connector name submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
- On a connector-configuration detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
- The connector-configuration create surface, having read no registration, offers no such discard control.
- The footer carries a Cancel that leaves the authoring without registering anything, creating no configuration and leaving every registered configuration exactly as it stood, and returns the operator to the surface the authoring was reached from.
- Every reading of the connector-configuration create surface, and of the detail surface's ready phase, offers the operator a route to the connector-configurations listing.
implements:
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
depends_on:
- task/shared-action-footer/button-footer-component
---

## What it is
The connector-configuration create screen and detail ready view, both reaching their actions through the shared footer.
It carries the Cancel, the discard the specification now states, and the route to the listing that stands beside them.

## Notes
UNDERDETERMINED, from the specification — the route criterion narrows to the create surface and the detail surface's ready phase, while a-connector-configuration-surface-offers-a-route-to-the-listing owes it on every reading, naming the outstanding read, the refused read and the authoring surface.
The implementation that passes renders the route only once the read has answered and none while it is outstanding or after it failed.
UNDERDETERMINED, from the specification — no criterion holds the listing route to registering nothing, which a-connector-configuration-surface-offers-a-route-to-the-listing states, and which matters precisely because the route is placed inside the form's action footer.
The implementation that passes renders the route as a control that submits the form, issuing register-connector, before navigating to the listing.
UNDERDETERMINED, from the specification — the discard criteria exclude only the create surface, while a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface also withholds the act from surfaces whose read has not answered and whose read failed.
The implementation that passes offers the discard in the detail surface's outstanding and failed windows.
UNDERDETERMINED, from the specification — the outcome criterion says nothing about the interval before the registry answers, which a-submitted-registration-states-its-outcome-to-the-operator forbids either outcome being stated in.
The implementation that passes states the registered outcome at the moment Save is pressed and corrects it only where the registry refused.
REMAINDER, from the specification — the capability clauses of a-submitted-registration-states-its-outcome-to-the-operator and of a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface reach no criterion here.
They belong to the capability form's own action footer task.
REMAINDER, from the specification — a-presented-connector-configuration-states-an-outstanding-or-failed-read's three windows and its reattempt reach no criterion of this task, whose criteria lean on the detail surface's read phases without stating what each presents.
They belong to the connector configuration screen return route task.
ADVISORY, from the specification — contracts/integration/connector-configuration-registry is not implemented here: no criterion decides what the registry publishes or answers, only what the surface does around calls the implemented rules already name.
