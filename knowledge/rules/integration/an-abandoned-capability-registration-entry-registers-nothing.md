---
type: invariant
statement: >-
  An operator authoring a capability registration may abandon the entry before submitting
  it: nothing is sent to the registry, no capability is created and none already registered
  is replaced, and the operator is returned to the surface the authoring entry was reached
  from.
expression: >-
  For an operator composing a capability registration entry e and abandoning e before
  submitting it: no register-capability call carries e; the set of capabilities currently
  registered is identical before and after the abandonment, in membership and in every
  registration's own declared contract; and what the operator is returned to is the surface
  from which the authoring of e was reached. This holds whether e was composed at a name and
  version no capability is currently registered at or at the identity of one that is, and it
  turns on nothing about that surface: the listing of registered capabilities is one such
  surface and holds no privilege among them.
constrains:
  - domain/integration/capability
---

## Description

`register-capability` is the one operation of `contracts/integration/capability-registry` that writes — creating a capability at a new name and version, or replacing whatever already stood at that identity — so an entry abandoned before submission makes no such call and leaves both outcomes unreached: an identity no capability stood at stays unregistered, and a capability already standing at the entry's identity keeps every attribute of its declared contract exactly as it was.

Nothing of the abandoned entry survives the abandonment, because the registry holds registrations and never entries: `read-capability`, `read-capability-by-identity` and `list-capabilities` all answer from what is currently registered, and an entry never submitted never entered that set. A half-composed registration is therefore not something a later read can find, and no refusal is owed for one — the registration rules the registry imposes (`a-capability-is-read-only`, `a-capability-declares-its-contract`, `a-capability-declares-well-formed-schemas`, `a-capability-input-schema-holds-a-well-formed-object`, `one-capability-answers-one-concept`) are all conditions on what a registration submits, and an abandoned entry submits nothing for them to judge.

Where the operator is returned is the surface the authoring was reached from, so getting out costs no more than getting in did, and an operator who opened an entry to reconsider is put back where they were reconsidering from rather than somewhere the registry finds convenient. An abandonment is the undoing of a step, and the step it undoes is the one that opened the entry.

Returning to the listing of registered capabilities instead would be a destination chosen for the registry rather than for the operator, and it would be wrong on exactly the readings that matter: an operator who reached the authoring entry from a capability's own surface, or from anywhere other than the listing, is moved somewhere they did not come from and loses the place they were working in. The listing remains reachable throughout — `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` owes a route to it on every reading of a surface presenting or authoring one capability, and that obligation is untouched here — so nothing is lost by landing the abandonment where the operator came from: the operator who did want the listing takes the route that is owed them anyway.

What the abandonment must never do is land on a read that cannot answer. A destination keyed on the entry's own identity would be exactly that, since `constraints/the-capability-identity-read-refuses-an-unregistered-identity` has `read-capability-by-identity` refusing a name and version nothing is registered at, which is what an abandoned creation leaves behind; the surface the authoring was reached from carries no such hazard, having answered once already.

This is not the discard of something that exists. `only-a-draft-case-version-may-be-discarded` removes a version that was created and persisted; abandonment here ends an entry that was never sent, so there is nothing to remove and nothing that was ever usable in its place.

Which control carries the abandonment, its wording and where it sits are form and belong to the interface, not here.
