---
type: policy
statement: >-
  An operator-facing surface that submits a registration to the capability registry or to the
  connector configuration registry states to that operator the outcome the registry answered:
  where the registration was made, that it was made, naming what now stands registered — the
  capability at the name and version submitted, or the connector configuration under the
  connector name submitted; where the registry refused the submission, that nothing was
  registered and which refusal answered it, the condition the registry's answer named stated
  apart from every other condition that route can name and apart from a refusal whose
  condition the surface does not recognise.
expression: >-
  For an operator submitting a registration r through register-capability of
  contracts/integration/capability-registry or register-connector of
  contracts/integration/connector-configuration-registry, and the surface s from which r was
  submitted: where the registry answers that r registered, s states that r registered and
  states what it registered — for a capability, the name and version r carried; for a
  connector configuration, the connector name r carried. Where the registry refuses r, s
  states that r registered nothing and states which refusal answered it: where the registry's
  answer names a condition, s states that condition, distinguishably from every other
  condition that route can name and from a refusal carrying no named condition; where the
  registry's answer names no condition, s states that the submission failed for a reason it
  does not recognise, never as a named condition and never as a registration. s states neither
  outcome of a submission the registry has not answered. The two outcomes are distinguishable
  from one another to the operator, and neither is presented as the other.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

Each of these two registries publishes exactly one write: `register-capability` of `contracts/integration/capability-registry`, which creates a capability at a new name and version or replaces whatever stood at that identity, and `register-connector` of `contracts/integration/connector-configuration-registry`, which creates a connector configuration or replaces whatever answered to its name. Both are calls an authoring surface makes and waits on, so between the operator submitting and the registry answering there is an act taken and an outcome not yet in hand. No node stated what the operator is then told. Left unstated, an operator who submitted would learn what happened only by reading the registry again — or would learn nothing at all, and resubmit over a registration already made, or leave believing a refused submission had registered.

The registered outcome is owed because a create-or-replace write is exactly the one whose success an operator cannot infer from the surface they are standing on. Both writes are total: `domain/integration/connector-configuration` is replaced whole on every edit, and a capability registration replaces whatever stood at its identity with its own whole declared contract. A surface that looks after the submission exactly as it looked before it leaves the operator to distinguish a registration made from one that never left, and both `an-abandoned-capability-registration-entry-registers-nothing` and `a-connector-configuration-authoring-may-be-abandoned-without-registering` turn on that same distinction being real: an abandoned entry registers nothing, and an operator who cannot tell a submission from an abandonment cannot tell which of the two they just performed.

The refused outcome is owed in the same words this specification has already used twice. `scenarios/glossary/a-concept-with-no-description-is-refused` holds that the operator console tells the operator specifically what was wrong with a refused registration, never only a generic failure notice; `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` holds a named condition apart from the notice shown for a failure whose reason the interface does not recognise, on the reasoning that the two teach opposite things — one says there is nothing left to do, the other says the outcome is unknown and the act should be retried, reloaded or escalated. That is why the refusal here is not merely reported but carries which refusal answered it, and why a refusal the surface cannot name is stated as exactly that rather than dressed as a condition: `a-release-refusal-with-no-named-violation-says-so` already refuses an unexplained, empty refusal in favour of saying so explicitly.

What the routes themselves answer is untouched. `constraints/a-malformed-request-is-refused-with-a-validation-error` fixes the shape of a refusal over a request the route's own shape rejects, `constraints/a-domain-error-unmapped-by-status-is-refused-generically` fixes the generic refusal for a domain error the status map does not name, and the registration rules each route imposes — `a-capability-declares-its-contract`, `a-capability-declares-well-formed-schemas`, `a-connector-configuration-holds-a-well-formed-object`, `a-connector-configuration-names-its-connector`, `a-connector-placeholder-is-declared-by-its-capability`, `one-capability-answers-one-concept` — name their own conditions. This states only what the operator is told about whichever of those answered, and moves none of them. The generic refusal is precisely the branch in which no condition was named, so it is the branch this rule requires to be stated as unrecognised rather than left to read like a named one.

One fact, decided once for both registries. The two are the same shape in every particular that bears on it: one write each, create-or-replace keyed on an identity the operator supplies, authored directly by an operator on a surface this specification already governs (`a-single-capability-surface-offers-a-route-to-the-capabilities-listing`, `a-connector-configuration-surface-offers-a-route-to-the-listing`), and refusals carried on the same system-wide error surface. Deciding it separately would answer one question twice and invite two answers, which is what deciding it here once refuses.

This is about a write, and the sibling rules about a read stay where they are. `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` state what a surface says while it is loading a registration it did not write and what it says when that load fails; neither says anything about a submission the operator made. A read that failed is worth issuing again and those rules offer that act; a submission is not re-issued by anything stated here, because a write repeated is a second write and never a recovery of the first.

What follows a stated outcome is no part of this: where the surface goes after a registration was made, whether it stays, reloads or leaves, is not decided here. Whether either outcome is ever stated before the registry answers, or the two are ever presented alike, is `a-registration-outcome-is-never-stated-before-the-registry-answers`'s own. Which control carries either statement, its wording, where it sits and how long it stands are form and belong to the interface, exactly as every other surface rule of this specification leaves them.

Consistency is eventual because the surface performs no registration itself: what it states is the answer to a call issued separately to a registry that holds the registration, and the statement settles only when that call settles.
