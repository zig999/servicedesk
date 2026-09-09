---
type: invariant
statement: 'Where the read of the connector configuration registered under one named connector is refused because nothing is registered under that connector name, the operator-facing screen presenting that configuration stands in a reading of its own and not in the reading a read that failed stands in: it states explicitly that nothing is registered under that connector name, presents no connector or configuration value, states nothing to the effect that the configuration could not be read, and offers no re-issue of that read.'
expression: 'For a connector name n and a screen presenting the connector configuration registered under n through read-connector-configuration of contracts/integration/connector-configuration-registry: where that read is refused because nothing is registered under n — the refusal a-connector-configuration-read-by-an-unregistered-name-is-refused states — the screen states that nothing is registered under n, states no value of connector or configuration, states nothing to the effect that the configuration could not be read, and carries no action that re-issues that read. This presentation is distinguishable to the operator from the presentation of a read that has not returned, from that of a read that failed, and from that of a read that returned, each as a-presented-connector-configuration-states-an-outstanding-or-failed-read states it, and none of those four presentations is presented as another.'
constrains:
- domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` reaches this screen in four situations, and only three of them were stated.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` states the read that has not returned, the read that failed and the read that returned.
The fourth is the registry's own definite answer: `a-connector-configuration-read-by-an-unregistered-name-is-refused` refuses a read by a connector name nothing has registered, with an HTTP 404 reporting a ConnectorConfigurationNotFoundError.
What that rule states is what a caller of the route gets; what the operator standing on the screen is told when that refusal comes back was stated nowhere.

That it is a reading of its own is how this specification already reads this very surface.
`a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` states its act over four readings of it by name — one whose read has not answered, one whose read failed, one whose read answered that nothing is registered under that connector name, and one presenting the registration that read answered — and reasons about the third in its own right, as the one reading on which the surface's own address will never answer anything, citing this registry's unregistered-name refusal for exactly it.
A rule presenting that reading as the failed window would leave one specification reading one surface two ways.

The acts asked of the operator are what make the two readings two.
The neighbouring rule tells its own unsettled windows apart because the next act differs across them — an outstanding read settles on its own and is worth waiting for, a failed one settles only if it is made again, which is why the failure is not merely stated but carries the read with it.
A read refused because nothing is registered under the name settles nothing by being made again: that refusal is what the registry answers for as long as nothing is registered under that name, so offering the read again would name an act that cannot change the answer.
Worse, the neighbouring rule states its failed window precisely so a reader can tell a far end that was briefly unavailable from one that is gone; presenting a name nothing has ever been registered under as that same window destroys the distinction the window exists to keep.
`a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` holds three readings of one keyed surface apart on this identical reasoning, and names the acts they ask of the reader: an absence is one to author for, a read that did not complete is one to attempt again.

It is stated explicitly, and no value accompanies it, for the reason both of the neighbouring rule's own windows are.
A connector configuration is opaque text an operator authors and edits, so a blank screen here reads to them like a configuration holding nothing — the one misreading that would have them edit over content the registry never answered.
Nothing partial is honestly presentable beside the statement either: the read was refused, not answered in part, so a connector name or configuration shown here would state as this name's content something nobody read.

This states what the screen states in that one reading and nothing beyond it.
What the route answers a caller stays `a-connector-configuration-read-by-an-unregistered-name-is-refused`'s own.
The acts the screen owes on a reading that shows no registration are neither extended nor narrowed: `a-connector-configuration-surface-offers-a-route-to-the-listing` owes the route to the listing on the reading whose read was refused by its own unconditional terms, `a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` owes the return to the surface this screen was reached from on this very reading, and `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` already offers its act on no reading that read no registration.
Whether the operator may author a configuration under that name from this reading is no part of this.
Which control carries the statement, its wording and where it sits are form and belong to the interface, exactly as every surface rule of this specification leaves them.
Whether this reading and the three the neighbouring rule states are distinguishable to the operator is `a-presented-connector-configurations-four-readings-are-mutually-distinguishable`'s own.

An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the shape and home `a-presented-connector-configuration-states-an-outstanding-or-failed-read` already takes for the three readings this fourth one is told apart from.
A new rule rather than the api contract, which cannot declare a presentation at all, and rather than the domain element, which declares what a configuration is and not what a screen states about reading one.
