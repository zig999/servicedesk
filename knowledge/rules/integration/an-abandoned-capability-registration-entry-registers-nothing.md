---
type: invariant
statement: >-
  An operator authoring a capability registration may abandon the entry before submitting
  it: nothing is sent to the registry, no capability is created and none already registered
  is replaced, and the operator is returned to the listing of registered capabilities.
expression: >-
  For an operator composing a capability registration entry e and abandoning e before
  submitting it: no register-capability call carries e; the set of capabilities currently
  registered is identical before and after the abandonment, in membership and in every
  registration's own declared contract; and what the operator is returned to is the listing
  of registered capabilities. This holds whether e was composed at a name and version no
  capability is currently registered at or at the identity of one that is.
constrains:
  - domain/integration/capability
---

## Description

`register-capability` is the one operation of `contracts/integration/capability-registry` that writes — creating a capability at a new name and version, or replacing whatever already stood at that identity — so an entry abandoned before submission makes no such call and leaves both outcomes unreached: an identity no capability stood at stays unregistered, and a capability already standing at the entry's identity keeps every attribute of its declared contract exactly as it was.

Nothing of the abandoned entry survives the abandonment, because the registry holds registrations and never entries: `read-capability`, `read-capability-by-identity` and `list-capabilities` all answer from what is currently registered, and an entry never submitted never entered that set. A half-composed registration is therefore not something a later read can find, and no refusal is owed for one — the registration rules the registry imposes (`a-capability-is-read-only`, `a-capability-declares-its-contract`, `a-capability-declares-well-formed-schemas`, `a-capability-input-schema-holds-a-well-formed-object`, `one-capability-answers-one-concept`) are all conditions on what a registration submits, and an abandoned entry submits nothing for them to judge.

Where the operator is returned is the listing of registered capabilities — `list-capabilities` of the same contract, the read over everything currently registered, which is precisely the set the abandonment left untouched. That is the read from which an authoring entry is reached, for a new capability and for a replacement alike, and it is answerable whatever the entry held: a read keyed on the entry's own identity could not be, since `constraints/the-capability-identity-read-refuses-an-unregistered-identity` has `read-capability-by-identity` refusing a name and version nothing is registered at, which is exactly what an abandoned creation leaves behind. `constraints/listings-are-paged` governs that listing here as it does every other reading of it.

This is not the discard of something that exists. `only-a-draft-case-version-may-be-discarded` removes a version that was created and persisted; abandonment here ends an entry that was never sent, so there is nothing to remove and nothing that was ever usable in its place.

Which control carries the abandonment, its wording and where it sits are form and belong to the interface, not here.
