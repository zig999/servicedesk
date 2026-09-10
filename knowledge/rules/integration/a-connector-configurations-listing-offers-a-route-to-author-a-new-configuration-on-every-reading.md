---
type: invariant
statement: >-
  The listing of registered connector configurations offers the operator a route to author a
  new connector configuration on every reading of the listing — while its own read has not
  answered, where that read failed, where it answered no configuration, and where it answered
  some — and taking that route registers nothing.
expression: >-
  For the surface l presenting the listing list-connector-configurations of
  contracts/integration/connector-configuration-registry answers: l carries a route whose
  destination is a surface authoring a connector configuration at a connector name nothing is
  registered under, and that route is present at every reading of l, its presence turning on
  nothing about the read backing l, which may not yet have answered, may have failed, or may
  have answered an empty or a populated page. Taking that route from l issues no
  register-connector call and leaves every registered connector configuration exactly as it
  stood. Which control carries the route, its wording and its placement are not evaluated here.
constrains:
- domain/integration/connector-configuration
---

## Description

`list-connector-configurations` of `contracts/integration/connector-configuration-registry` answers the configurations currently registered, in pages, and the surface presenting that listing is where an operator arrives to find one or to author one.
No node said whether that surface offers a route to author a new configuration, nor whether the offer survives a listing whose own read has not answered, failed or came back empty.

The route is offered on every reading, because what the listing's read answers says nothing about whether a configuration may be authored.
A read of the registered set that is still outstanding, that failed, or that answered nothing is a fact about that read; authoring a configuration is a write to a registry the read never touched, and blocking it behind the read's state would refuse the operator an act for a reason unrelated to it.
The empty page is the case that makes this sharp: a registry holding no configuration yet is exactly where the operator most needs the route to author the first.

This decides that the route is offered, on which readings, and that taking it registers nothing, and nothing beyond it.
What the authoring surface then offers, states and refuses is its own rules'; what the listing states about its own read in each of its readings is stated by no node and not stated here; and which control carries the route, its wording and its placement are the interface's own.
