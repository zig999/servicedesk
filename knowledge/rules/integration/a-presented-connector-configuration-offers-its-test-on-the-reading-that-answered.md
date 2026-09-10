---
type: invariant
statement: >-
  An operator-facing screen presenting the one connector configuration registered under a
  connector name offers the operator the act that tests that configuration through a capability
  registered against that connector name on the reading where the read of that configuration
  returned, and on none of its three other readings — the read that has not returned, the read
  that failed, and the read refused because nothing is registered under that connector name.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered under n
  through read-connector-configuration of contracts/integration/connector-configuration-registry:
  where that read returned, s carries an act whose effect is to issue test-connector of
  contracts/integration/connector-diagnostics against a capability whose own connector attribute
  is n; where that read has not returned, where that read failed, and where that read was refused
  because nothing is registered under n, s carries no such act, so no test-connector call leaves s
  on any of those three readings. Nothing here turns on whether a capability naming n is in fact
  registered — the refusals a-connector-configuration-is-tested-through-a-registered-capability
  states are what answer that once the act is taken — on how s was reached, on whether that read's
  answer was in hand before s was first presented or arrived after it, or on which control an
  interface would have carried the act.
constrains:
  - domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` answers the configuration standing under a connector name, and `contracts/integration/connector-diagnostics` publishes `test-connector`, which exercises that configuration's own call once through a specific registered capability that names it. `a-connector-configuration-is-tested-through-a-registered-capability` states everything about what that act exercises — the already-registered capability whose own connector attribute must match, the configuration currently registered under that connector name read at the moment of the test rather than text an operator holds unsaved, the Subject attributes the registered configuration's own placeholders name, and the two refusals a missing or mismatched capability is answered with. What no node stated is whether the screen presenting that registration offers the operator the act at all, and on which of that screen's readings.

This screen is read in exactly four situations, and this specification already holds them apart by name: `a-presented-connector-configuration-states-an-outstanding-or-failed-read` states the read that has not returned, the read that failed and the read that returned, `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` states the refusal that nothing is registered under the name as a reading of its own, and `a-presented-connector-configurations-four-readings-are-mutually-distinguishable` holds the four apart to the operator. Left unstated, whether an operator could reach the diagnostic from the one place the configuration it exercises is presented fell to whatever control an interface happened to render on each of those readings.

The offer follows the one reading that holds a registration, because on the other three the act has nothing to be about. Those three readings each state that the screen presents no connector or configuration value — an outstanding read has answered nothing yet, a failed one never will unless it is made again, and a refused one is the registry's own definite answer that the name holds nothing — so a test offered there would name a configuration the operator is not being shown, and on the refused reading could only ever report back the absence that reading already states explicitly. This is the reading `a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission` already took over this same screen: an act with nothing to act on is withheld rather than offered and left to fail. It is equally why this act is not one of the two the screen owes unconditionally — the route to the listing (`a-connector-configuration-surface-offers-a-route-to-the-listing`) and the return to origin (`a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading`) are owed on every reading precisely because getting off a surface that has nothing to show is what an operator needs there most, and exercising a real call is not.

That the act is offered is a fact rather than form by this specification's own division: what a person using the system can learn or do is stated here, while which control carries it, whether it stands among the screen's own actions or apart from them, its wording and where it sits belong to the interface, exactly as every other surface rule of this specification leaves them.

What the act does once taken is untouched here. Which capability and which configuration it exercises, which Subject attributes the operator supplies values for, and how it refuses a missing or mismatched capability stay `a-connector-configuration-is-tested-through-a-registered-capability`'s own; what the response may not carry back stays `a-diagnostic-response-masks-a-resolved-credential`'s own; that nothing it returns is ever evidence stays the contract's own; and the acts the screen already owes or withholds on this same reading — the route, the return, the helper, the discard and the submission — are neither extended nor narrowed.

An invariant over the one element whose registration the screen presents, immediate and inside that one aggregate: a new rule rather than the api contract, which cannot declare a presentation at all, and rather than the domain element, which declares what a configuration is and not what a screen offers over reading one — the same home `a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` already took for its own reading of this screen.
