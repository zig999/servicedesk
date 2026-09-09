---
type: policy
statement: 'A surface presenting the one capability registered at a name and version, or the one connector configuration registered under a connector name, offers the operator an act that registers nothing and lands them on the surface it was reached from.'
expression: 'For an operator on a surface s presenting a single registration — the capability that read-capability-by-identity of contracts/integration/capability-registry answers for a name and version, or the connector configuration that read-connector-configuration of contracts/integration/connector-configuration-registry answers for a connector name — s carries an act b whose whole effect is to land the operator on the surface s was reached from. Performing b issues no register-capability call and no register-connector call, so every capability and every connector configuration currently registered stands exactly as it stood, in membership and in every registration''s own content. Where the operator holds on s an entry not yet submitted, b is the act an-abandoned-capability-registration-entry-registers-nothing and a-connector-configuration-authoring-may-be-abandoned-without-registering already state, with the destination they already fix, and not a second act beside it.'
constrains:
- domain/integration/capability
- domain/integration/connector-configuration
consistency: eventual
---

## Description

Each of these two registries publishes one read that answers a single registration an operator names: `read-capability-by-identity` of `contracts/integration/capability-registry` answers the capability standing at a name and version, and `read-connector-configuration` of `contracts/integration/connector-configuration-registry` answers the configuration standing under a connector name.
Both are issued separately from the surface that presents them, so that surface is read in more than one situation, and this specification already holds those situations apart: `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` state what the surface tells the operator while the read is outstanding, where it failed, and where it answered.
What no node stated is whether the operator can get off such a surface the way they came onto it.
The four abandonment rules of this specification are each written over an operator authoring or editing — an entry composed and not submitted — so on a reading that holds no entry, because nothing has been read yet, because the read failed, or because the read answered that nothing is registered there, none of them reaches.
Left unstated, whether an operator standing on a surface that has nothing to show them could return to where they were fell to whatever control an interface happened to render on that reading.

Whether this act is offered on every reading of the surface, unconditionally, is `a-return-to-origin-routes-presence-turns-on-nothing-further`'s own.

It registers nothing, because `register-capability` and `register-connector` are the only writes the two registries publish and both are total — `domain/integration/connector-configuration` is replaced whole on every edit, and a capability registration replaces whatever stood at its identity with its own whole declared contract — so an act away that wrote what the surface was holding would make leaving indistinguishable from registering, the clause `a-connector-configuration-surface-offers-a-route-to-the-listing` already carries for its own route.
What becomes of content an authoring surface was holding unwritten when the operator leaves is no part of this, exactly as both route rules leave it.

Nothing here moves where any other act lands: `a-successful-capability-registration-lands-on-the-capabilitys-own-surface` and `a-successful-connector-registration-lands-on-the-configurations-own-surface` still decide where a submission that succeeded takes the operator.

What this act lands the operator on where no surface it was reached from exists is `a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing`'s own. Where a surface the operator was reached from does exist, the answer above stands exactly as it stands, so one gesture keeps one answer.

This is neither of the two acts these surfaces already owe, and it is not told apart from them by any property of a control.
The route both listing rules owe has the listing as its destination and this has the surface the operator came from, so wherever those two are not the same place the two acts are two acts, and the reattempt `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` stands in the failed window alone issues a read rather than going anywhere.
On a reading reached from nothing the two acts land the operator in the same place, and they stay two acts there for the same reason `an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` stays distinct from the routes it lands beside: a shared destination on one reading is not a shared obligation.
Which control carries this act, whether it stands among the surface's own actions or apart from them, its wording and where it sits are form and belong to the interface, not here, exactly as every other surface rule of this specification leaves them.

One fact, decided once for both registries, on the reading `a-submitted-registration-states-its-outcome-to-the-operator` and `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` each already took over this same pair.
Consistency is eventual because the surface never holds either registration: the readings this rule is stated over are the windows a read issued separately to a registry passes through.
