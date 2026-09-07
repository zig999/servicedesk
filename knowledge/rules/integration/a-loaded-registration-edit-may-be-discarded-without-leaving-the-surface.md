---
type: policy
statement: >-
  An operator editing, on the surface that read it, the capability registered at a name and
  version or the connector configuration registered under a connector name is offered an act
  that returns every field of that surface to the content of the registration the surface
  last read, registering nothing and leaving the operator on that same surface; that act
  takes effect only where the operator states in a further, explicit act that it is to be
  performed, and where the operator does not so state the edit stands untouched. A surface
  holding no read registration — one authoring at an identity nothing is registered at, one
  whose read has not answered, one whose read failed — is offered no such act, having no
  content to return its fields to.
expression: >-
  For an operator on a surface s presenting the capability registered at a name and version
  that read-capability-by-identity of contracts/integration/capability-registry answered, or
  the connector configuration registered under a connector name that
  read-connector-configuration of contracts/integration/connector-configuration-registry
  answered, where that read has answered and the operator has changed one or more of s's
  fields away from what it answered: s offers an act d whose whole effect is to set every
  field of s to the content of the registration that read answered. Performing d carries no
  register-capability call and no register-connector call, so every capability and every
  connector configuration currently registered stands exactly as it stood, in membership and
  in every registration's own content; and d moves the operator to no other surface — the
  operator remains on s, editing. d takes effect only where the operator, having asked for d,
  states in a further act that d is to be performed; where the operator does not so state, no
  field of s changes and the edit stands exactly as the operator left it. d is offered on no
  surface authoring a registration at an identity nothing is currently registered at, on none
  whose read has not answered and on none whose read failed, those surfaces holding no read
  registration for d to return the fields to. Nothing here turns on how much of the edit was
  made, on which fields it touched, or on how the operator reached s.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

Each of these two registries publishes exactly one write — `register-capability` of `contracts/integration/capability-registry` and `register-connector` of `contracts/integration/connector-configuration-registry` — and each of them is a create-or-replace an operator submits from a surface that loaded the registration it is editing: `read-capability-by-identity` answers the capability standing at a name and version, `read-connector-configuration` answers the configuration standing under a connector name. Between that read and a submission the operator holds an edit that exists on the surface and nowhere else. No node stated whether the operator may put that edit down and take the read content back without leaving the surface. Left unstated, an operator who changed their mind about an edit had only the leaving, and whether the fields could be recovered at all fell to whatever a surface happened to offer.

The act is owed where a registration was read, because the way out this specification has already stated is a leaving and not a putting-down. `an-abandoned-capability-registration-entry-registers-nothing` and `a-connector-configuration-authoring-may-be-abandoned-without-registering` each give a way out that costs nothing, and each of them ends the operator's work at that surface by returning them to the surface the authoring was reached from. An operator who wants the read content back and wants to go on working at it is asking for something neither of those answers: leaving and coming back is the only route left them, and coming back directly is not owed — what `a-single-capability-surface-offers-a-route-to-the-capabilities-listing` and `a-connector-configuration-surface-offers-a-route-to-the-listing` owe from these surfaces is a route to the listing, so the return runs through the set to arrive at exactly the content the read already answered. The surface is holding that content already, so the recovery costs the registry nothing and its absence charges the operator navigation for it. What is recovered is real rather than nominal: a connector configuration is opaque text whose keys are the executing connector's own statement (`domain/integration/connector-configuration`), and a capability's declared contract carries an input schema and an output schema, none of which an operator who has edited over them can retype from memory.

A surface authoring at an identity nothing is registered at is offered nothing here, because it read nothing there is to go back to. Emptying such a surface's fields recovers no content — it is indistinguishable from the operator clearing them — and the identity itself is one `constraints/the-capability-identity-read-refuses-an-unregistered-identity` has the identity-keyed read refuse, which is the same reason `an-abandoned-capability-registration-entry-registers-nothing` refuses that identity as an abandonment's destination. The surfaces whose read has not answered or has failed are excluded for the same reason and by an existing statement: `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` hold that no attribute of any registration is presented as the content standing at that identity in either window, so there is no read content in hand for this act to restore.

The further, explicit act is owed because the discard destroys content held nowhere else and the specification publishes nothing that recovers it. An edit never submitted has entered no registry — `an-abandoned-capability-registration-entry-registers-nothing` states that the registry holds registrations and never entries, and `a-connector-configuration-is-tested-through-a-registered-capability` states that even a diagnostic exercises the configuration currently registered, never text an operator holds unsaved — so an edit discarded is an edit gone, with no operation of either contract able to answer it back. What distinguishes this from the abandonment, which takes no such act, is what follows it: an abandonment ends the operator's engagement with the content and shows itself by landing them somewhere they were not, while this leaves the operator exactly where they were and expecting to continue. The next act after a discard is another edit, made on top of content that silently went back to what was read, and where the lost edit was a partial change inside a long opaque configuration or a schema an operator may go on and submit content they did not intend over a write both registries make total — `domain/integration/connector-configuration` is replaced whole on every edit, and `register-capability` replaces whatever stood at the identity with the whole declared contract submitted. A second act by the operator is the least that separates the discard asked for from the discard mis-triggered, and this specification already reads a costly act as the operator's own to state rather than something a surface infers: `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` has the reattempt issued only on the operator's own act and never on the surface's.

One fact, decided once for both registries, on the reading `a-submitted-registration-states-its-outcome-to-the-operator` already took over the same pair: one write each, create-or-replace keyed on an identity the operator supplies, authored directly by an operator on surfaces this specification already governs together. Deciding it separately would answer one question twice and invite two answers, which is what the two abandonment rules' shared destination and this specification's own log already record as the failure to avoid.

Nothing here moves what either registry answers or where any other act lands. `a-successful-capability-registration-lands-on-the-capabilitys-own-surface` still decides where a submission that succeeded takes the operator, the two abandonment rules still decide where a leaving lands them, and the clause both route rules carry — that what becomes of content an authoring surface holds unwritten when the route is taken is no part of them — stays open, this stating only the act in which the operator does not go. No call is refused, no attribute is added to `domain/integration/capability` or `domain/integration/connector-configuration`, and no operation is published. Which control carries the discard, which carries the further act, their wording, where they sit and how the second is presented to the operator are form and belong to the interface, not here, exactly as this specification's other surface rules leave them.

Consistency is eventual because the content the fields are returned to is never held by the surface: it is what a read issued separately to a registry answered, and this act restores that answer rather than anything the surface owns.
