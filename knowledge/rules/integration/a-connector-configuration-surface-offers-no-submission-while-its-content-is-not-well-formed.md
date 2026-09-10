---
type: invariant
statement: >-
  A surface presenting or editing a connector configuration offers no act submitting a
  registration through register-connector while its own judgment finds the content its
  Configuration field currently holds not to be well-formed JSON object text, the statement
  that judgment owes standing in its place.
expression: >-
  For a surface s presenting or editing the connector configuration registered under a
  connector name n, or authoring one under n, and the content c its Configuration field holds
  at a given moment: where s's own judgment of c finds it not well-formed JSON object text, s
  offers no act submitting a registration through register-connector of
  contracts/integration/connector-configuration-registry, so no register-connector call
  leaves s while that judgment stands; where that judgment finds c well formed, whether the
  act is offered is decided by nothing here. Nothing here turns on how c came to be held, on
  which control would have carried the act, or on how s was reached.
constrains:
- domain/integration/connector-configuration
---

## Description

A surface authoring or editing a connector configuration judges its Configuration field's content by the registry's own criterion and states to the operator where it falls short, and no node said what the act submitting a registration does while that statement stands.
Left unstated, an operator could take the act and be told nothing, or take it and be refused by the registry a round trip later for the condition the surface was already stating.

The act is not offered, because its outcome is already known on the surface.
The judgment the surface makes is the registry's own criterion, so a submission carrying content that judgment finds short of it is one the registry refuses, and offering the act spends a call to tell the operator what the surface already states beside the field.
The statement standing in the act's place is what the operator has to go on: what is wrong with the content, rather than a refusal arriving after the fact.

This decides that the act is withheld while the judgment finds the content not well formed, and nothing beyond it.
What the surface states about the content is the judgment rule's own; whether the act is offered where the content is well formed but nothing was changed is decided by the rule over the surface that read a registration and holds no edit; what the registry answers a submission that does reach it stays the registry's own rules'; and which control carries the act, whether a withheld act is absent or carried by a control the operator cannot take, its wording and its placement are the interface's own.
