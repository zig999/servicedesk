---
type: invariant
statement: >-
  An operator whose submitted connector configuration registration succeeds — whether the
  submission created a configuration under a connector name nothing was registered under or
  replaced the configuration that already answered to that name — is taken to the surface
  addressed by that configuration's own connector name, the surface
  read-connector-configuration answers, and neither to the listing of registered connector
  configurations nor left on the authoring surface the registration was submitted from.
expression: >-
  For an operator submitting a connector configuration registration r naming connector
  name c, where the register-connector call carrying r succeeds: what that operator is
  taken to is the surface addressed by c, the one read-connector-configuration of
  contracts/integration/connector-configuration-registry answers. It is that surface in
  both branches of register-connector's own create-or-replace — a connector name nothing
  was registered under and a name a configuration already answered to — and it turns on
  nothing about the surface the authoring of r was reached from. It is not the listing
  list-connector-configurations answers, and it is not the authoring surface r was
  submitted from.
constrains:
  - domain/integration/connector-configuration
---

## Description

`register-connector` is the one operation of `contracts/integration/connector-configuration-registry` that writes, and a submission it answers successfully leaves a connector configuration standing under the connector name the registration carried — created there, or put in place of whatever answered to that name before. The one surface the specification addresses by exactly that name is the one `read-connector-configuration` answers, the surface `a-presented-connector-configuration-states-an-outstanding-or-failed-read` already governs across its three readings. Landing the operator there lands them where what they just registered now stands.

A destination keyed on the registration's own connector name is safe here for the reason it is unsafe elsewhere. `a-connector-configuration-authoring-may-be-abandoned-without-registering` refuses that destination for an abandonment and returns the operator to the surface the authoring was reached from, because `a-connector-configuration-read-by-an-unregistered-name-is-refused` has `read-connector-configuration` refuse a connector name nothing has registered, which is exactly what an abandoned authoring leaves behind. A successful submission leaves the opposite behind: the name is registered when the operator arrives, in both branches of the create-or-replace, so the read the destination rests on answers. The two acts take different destinations because they leave different things standing — an abandonment undoes the step that opened the authoring and leaves nothing to show, while a submission that succeeded leaves a registration, and the surface addressed by it is where that registration is.

That this registry states its unregistered-name refusal in a rule of its own while the capability registry states its own in `constraints/the-capability-identity-read-refuses-an-unregistered-identity`, and that the two name different conditions, bears on where each refusal is recorded and what it tells a caller — not on whether the read answers once a registration stands under the name it is asked for. On the only question this rule turns on, the two registries read alike, so `a-successful-capability-registration-lands-on-the-capabilitys-own-surface` and this state one answer rather than two.

Leaving the operator on the authoring surface would make a submission that succeeded indistinguishable from one not yet made. This specification has refused that shape wherever it has met it — `a-presented-connector-configuration-states-an-outstanding-or-failed-read` holds three readings of one surface apart because each asks a different act of whoever meets it, and `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained sameness over a stored set — and the sameness costs more here than a misreading: `domain/integration/connector-configuration` is replaced whole on every edit, so the act the authoring surface still offers is another `register-connector` under the same name, which after the first success replaces the whole of what was just registered rather than creating what the operator thought they were creating.

The listing is not the destination either. `constraints/listings-are-paged` answers `list-connector-configurations` one page at a time, and which page the new registration falls on is that constraint's own answer and not this one's, so the listing is a destination on which the operator's own registration is not reliably in view. Nothing is lost by not landing there: `a-connector-configuration-surface-offers-a-route-to-the-listing` owes a route to that listing on every reading of the very surface this lands on, so the operator who wanted the set takes the route already owed them.

This states where the operator lands and nothing further. What that surface then states about its own read — the read still outstanding, the read that failed, the configuration read and shown — is `a-presented-connector-configuration-states-an-outstanding-or-failed-read`'s own and is untouched. What the operator is told about the submission itself is `a-submitted-registration-states-its-outcome-to-the-operator`'s own, which states the registered and the refused outcomes for both registries and expressly leaves where the surface goes once a registration was made undecided; this decides that one question for this registry and moves nothing that rule holds. Nothing here refuses a call, moves what the registry answers, adds an attribute to `domain/integration/connector-configuration` or publishes an operation, and the registration rules the registry imposes on what a submission carries — `a-connector-configuration-holds-a-well-formed-object`, `a-connector-configuration-names-its-connector`, `a-connector-placeholder-is-declared-by-its-capability` — stand exactly as they did. It states nothing about a submission the registry refuses, which registers nothing and reaches none of this.

Which control carries the submission, its wording and where it sits are form and belong to the interface, not here, the same reading `a-connector-configuration-authoring-may-be-abandoned-without-registering` and `a-connector-configuration-surface-offers-a-route-to-the-listing` already take over their own controls.

Both facts this rests on are that one element's own — that the submission succeeded and the connector name it succeeded under — so it constrains `domain/integration/connector-configuration` and holds immediately, inside one boundary, the shape `a-connector-configuration-authoring-may-be-abandoned-without-registering` already took for the other end of the same act.
