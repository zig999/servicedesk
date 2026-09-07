---
title: Capability form action footer
summary: The capability form's action row rendered through the shared ButtonFooter, carrying Save, the screen's injected actions and a Cancel.
sources:
- intake/scope.md
objective: The capability form's action row is rendered by the shared ButtonFooter, carrying Save, whatever the owning screen injects beside it, and a Cancel that leaves the authoring without registering anything.
criteria:
- capability-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
- Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save, and no second prop for appending buttons is introduced.
- Submitting the capability form issues the registration, and where it succeeds the operator is taken to the surface addressed by that capability's own name and version.
- Where the registry answers a submission, the surface states the outcome — that the capability was registered, naming the name and version submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
- On a capability detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
- The capability create surface, having read no registration, offers no such discard control.
- The footer carries a Cancel that leaves the authoring without submitting it, registering nothing and replacing no registered capability, and returns the operator to the surface the authoring was reached from.
- Every reading of the capability create surface, and of the capability detail surface's ready phase, offers the operator a route to the capabilities listing.
implements:
- contracts/integration/capability-registry
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
depends_on:
- task/shared-action-footer/button-footer-component
---

## What it is
The capability create screen and the capability detail ready view, both reaching their actions through the shared footer.
It carries the Cancel the scope makes standard, the discard the specification now states, and the route to the listing that stands beside them.

## Notes
UNDERDETERMINED, from the specification — the route criterion reaches only two readings, while a-single-capability-surface-offers-a-route-to-the-capabilities-listing states the route is present on every reading and turns on nothing further, naming expressly the read that has not completed, that failed, and that answered no capability.
The implementation that passes renders the route only once the read has answered and offers none while it is outstanding, after it failed, or where the identity holds no capability.
UNDERDETERMINED, from the specification — the discard criteria exclude the control from the create surface only, while a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface withholds it from every surface whose read has not answered and every surface whose read failed.
The implementation that passes renders the discard control in the detail surface's read-outstanding and read-failed windows as well as after the read answered.
UNDERDETERMINED, from the specification — the outcome criterion is conditioned on the registry having answered and forbids nothing before that, while a-submitted-registration-states-its-outcome-to-the-operator states that neither outcome is stated of a submission the registry has not answered and that the two never read alike.
The implementation that passes states the registration was made at the moment the operator submits, before the call has answered, correcting it only if a refusal later arrives.
REMAINDER, from the specification — the connector-configuration clauses of a-submitted-registration-states-its-outcome-to-the-operator and of a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface reach no criterion here.
They belong to the connector configuration form's own action footer task.
REMAINDER, from the specification — every clause of a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed goes unreached, in particular the reattempt control standing in the failed window alone, which a footer is one plausible home for.
It belongs to the capability screen return route task, which delivers those windows.
ADVISORY, from the specification — the four connector-side rules and contracts/integration/connector-configuration-registry neighbour this task and govern none of it.
