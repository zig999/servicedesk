---
title: Save dispatches the capability registration
summary: The capability authoring screen's save control reaches the registry, in the DOM shape the running application actually
  has.
objective: An operator's save on the capability registration screen, in the DOM shape the running application has, issues
  a register-capability request carrying the whole contract the entry declares, and on a registration the registry answers
  as made the operator is taken to that capability's own surface.
criteria:
- With the footer slot present, so the portal the application takes is taken, the screen's save control has the screen's own
  form as its form owner.
- With the footer slot present and every field of the entry filled, activating the save control issues a register-capability
  request carrying the whole contract the entry declares — its name, its version, its nature, both of its schemas, its timeout,
  its connector and its concept — with no declared attribute dropped.
- With the footer slot present and the registry answering that the registration was made, the operator is taken to the surface
  addressed by the name and version the entry carried, and not left on the authoring surface.
- With the footer slot present, an entry composed, and the authoring reached from another surface, activating the abandon
  control issues no register-capability request, leaves the set of registered capabilities exactly as it was, and returns
  the operator to the surface the authoring was reached from.
implements:
- contracts/integration/capability-registry
- domain/integration/capability
- rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
sources:
- intake/scope-capability-registration-save.md
---

## What it is

The second corrective increment of this initiative, over the same defect at a second site: the Save control on the capability authoring screen is a submit control that owns no form, because the app shell's footer portal moves it out of the form's DOM subtree, so no submit event is ever fired and no registration is ever issued.
The proof owed must mount the screen with the footer slot present, so the portal the application takes is actually taken.

## Notes

The criteria were re-cut twice before this file was written, both times to close a hole a binding found rather than to fit a judgment: criterion 2 first enumerated the contract without its timeout, which would have let a save register the sixty-second default instead of the budget the operator entered, and criterion 4 first stated no condition on an entry being composed or on the authoring having been reached from anywhere, which opened a silence the decision log already records as noticed and not decided.
The epic's claim was grown once, by contracts/integration/capability-registry and domain/glossary/concept, after a binding returned both as facts this task must have and could not read.

UNDERDETERMINED, from the specification — no criterion reaches what the save control does when the registry refuses the submission, though rules/integration/a-submitted-registration-states-its-outcome-to-the-operator states that the submitting surface states that nothing was registered and which refusal answered it, the condition the registry's answer named held apart from every other condition that route can name and from a refusal carrying no named condition, and that where the registration was made the surface states that it was made naming the capability at the name and version submitted, which criterion 3's navigation does not itself state.
Passes: a save dispatch that issues register-capability, navigates to the identity surface when the registry answers that the registration was made, and on every refusal leaves the operator on the authoring surface with nothing stated — no named condition, no statement that nothing was registered, no unrecognised-failure statement.

UNDERDETERMINED, from the specification — criterion 4 conditions the abandon control on the authoring having been reached from another surface, so no criterion reaches an abandonment on an authoring surface opened at its own address or reloaded, where no reached-from surface exists; rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing fixes that landing as the listing list-capabilities answers, with nothing registered and neither the authoring surface itself nor a read keyed on the identity being authored as the destination.
Passes: an abandon control that returns the operator to the reached-from surface where one exists and, where the authoring address was opened directly or reloaded, leaves them on the authoring surface or navigates to a read keyed on the entry's own unregistered name and version.
Decision, beyond the covers — stand: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing stays outside this epic's claim, because the wrong behavior this increment corrects is a save that dispatches nothing, and the no-origin branch of abandonment is a reading that works today and is governed by a node this correction does not touch.

REMAINDER, from the specification — rules/integration/a-capability-declares-its-contract, rules/integration/a-capability-declares-well-formed-schemas, rules/integration/a-capability-is-read-only and rules/integration/one-capability-answers-one-concept each state a condition the registry imposes on a submitted registration and the HTTP refusal it answers with, together with the sixty-second default for a registration stating no timeout and the reading that an absent or empty-string attribute is undeclared, and no criterion of this task reaches any of those clauses.
Belongs: the task delivering register-capability's own refusals inside the capability registry, not this frontend save dispatch.

REMAINDER, from the specification — rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it requires the surface offering entry of a capability registration's output schema to state five claims at that entry about what the system reads out of it, and rules/glossary/a-description-states-meaning-never-policy is one of the two nodes those claims are bounded to; no criterion here reaches what the authoring surface states beside that entry.
Belongs: the task over what the capability authoring surface states at its output schema entry.

REMAINDER, from the specification — rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading states its act over a surface presenting the one capability registered at a name and version, across all four of that surface's readings, and no criterion of this task is over that surface; its one clause touching an authoring entry defers to an-abandoned-capability-registration-entry-registers-nothing rather than owning it, which the decision log's entries for both nodes confirm.
Belongs: the task over the capability surface keyed on a name and version, the one read-capability-by-identity answers.

ADVISORY, from the specification — criterion 1, and the footer-slot precondition every criterion carries, rest on facts no covered node states and none is owed: both governing rules close by leaving which control carries the submission or the abandonment, its wording and where it sits to the interface, so the save control's form owner, the footer slot and the portal are decided by the running application's own DOM, recorded in the scope, and this task names no reference layout.
