---
type: invariant
statement: >-
  An operator whose submitted capability registration succeeds is taken to the surface
  addressed by that capability's own name and version — the surface
  read-capability-by-identity answers — and neither to the listing of registered
  capabilities nor left on the authoring surface the registration was submitted from.
  This holds alike where the submission created a capability at a name and version
  nothing was registered at and where it replaced the capability that already stood at
  that identity.
expression: >-
  For an operator submitting a capability registration entry e naming name n and version
  v, where the register-capability call carrying e succeeds: what that operator is taken
  to is the surface addressed by (n, v), the one read-capability-by-identity of
  contracts/integration/capability-registry answers. It is that surface in both branches
  of register-capability's own create-or-replace — an identity nothing was registered at
  and an identity a capability already stood at — and it turns on nothing about the
  surface the authoring of e was reached from. It is not the listing
  list-capabilities answers, and it is not the authoring surface e was submitted from.
constrains:
  - domain/integration/capability
---

## Description

`register-capability` is the one operation of `contracts/integration/capability-registry` that writes, and a submission it answers successfully leaves a capability standing at the name and version the entry named — created there, or put in place of whatever stood there before. The one surface the specification addresses by exactly that identity is the one `read-capability-by-identity` answers, added to this contract for a surface keyed by a capability's own name and version that loads on first navigation or a refresh. Landing the operator there lands them where what they just registered now stands.

A destination keyed on the entry's own identity is safe here for the reason it is unsafe elsewhere. `an-abandoned-capability-registration-entry-registers-nothing` refuses that destination for an abandonment, because `constraints/the-capability-identity-read-refuses-an-unregistered-identity` has `read-capability-by-identity` refuse a name and version nothing is currently registered at, which is exactly what an abandoned creation leaves behind. A successful submission leaves the opposite behind: the identity is registered when the operator arrives, in both branches of the create-or-replace, so the read the destination rests on answers. The two acts take different destinations because they leave different things standing — an abandonment undoes the step that opened the entry and leaves nothing to show, while a submission that succeeded leaves a registration, and the surface addressed by it is where that registration is.

Leaving the operator on the authoring surface would make a submission that succeeded indistinguishable from one not yet made. This specification has refused that shape wherever it has met it — `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` holds three readings of one surface apart because each asks a different act of whoever meets it, and `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained sameness over a stored set — and the sameness costs more here than a misreading: the act the authoring surface still offers is another `register-capability` at the same identity, which after the first success is a replacement of what was just registered rather than the creation the operator thought they were making.

The listing is not the destination either. `constraints/listings-are-paged` answers `list-capabilities` one page at a time, and which page the new registration falls on is that constraint's own answer and not this one's, so the listing is a destination on which the operator's own registration is not reliably in view. Nothing is lost by not landing there: `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` owes a route to that listing on every reading of the very surface this lands on, so the operator who wanted the set takes the route already owed them.

This states where the operator lands and nothing further. What that surface then states about its own read — the read still outstanding, the read that failed, the registration read and shown — is `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed`'s own and is untouched. Nothing here refuses a call, moves what the registry answers, adds an attribute to `domain/integration/capability` or publishes an operation, and the registration rules the registry imposes on what a submission carries — `a-capability-is-read-only`, `a-capability-declares-its-contract`, `a-capability-declares-well-formed-schemas`, `a-capability-input-schema-holds-a-well-formed-object`, `one-capability-answers-one-concept` — stand exactly as they did. It states nothing about a submission the registry refuses, which registers nothing and reaches none of this.

Which control carries the submission, its wording and where it sits are form and belong to the interface, not here, the same reading `an-abandoned-capability-registration-entry-registers-nothing` and `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` already take over their own controls.

Both facts this rests on are that one aggregate's own — that the submission succeeded and the name and version it succeeded at — so it constrains `domain/integration/capability` and holds immediately, inside one boundary, the shape `an-abandoned-capability-registration-entry-registers-nothing` already took for the other end of the same act.
