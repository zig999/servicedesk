---
title: A malformed HTTP connector configuration's result_detail states its vocabulary
summary: unavailableFor's handling of MalformedHttpConnectorConfigurationError enriches result_detail
  with exactly the vocabulary of the key(s) actually malformed, instead of stating only the error's class
  name.
objective: An observation ending unavailable over a MalformedHttpConnectorConfigurationError states, in
  result_detail, both the error's name and the vocabulary of every malformed key, and only the vocabulary
  of a key that is actually malformed, issuing no HTTP call.
criteria:
- A configuration whose method is not one of GET, POST, PUT, PATCH or DELETE, with its statusMap well-formed,
  ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError and the methods
  an HTTP connector configuration may declare, and does not state the evidence-result endings a statusMap
  may map a status to.
- A configuration whose statusMap is not an object mapping a status to one evidence-result ending, with
  its method well-formed, ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError
  and the evidence-result endings a statusMap may map a status to, and does not state the methods an HTTP
  connector configuration may declare.
- A configuration whose responseMap is not a well-formed object of string values, with its method and
  statusMap both well-formed, ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError
  and states neither the methods vocabulary nor the evidence-result endings vocabulary.
- A configuration whose method and statusMap are both malformed ends unavailable with a result_detail
  that states MalformedHttpConnectorConfigurationError and both the methods vocabulary and the evidence-result
  endings vocabulary.
- A configuration reaching this rule's malformed branch, whatever key is malformed, issues no HTTP call
  before the observation ends unavailable.
sources:
- intake/wrong-behavior.md
implements:
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
---

## What it is

A corrective increment enriching unavailableFor's MalformedHttpConnectorConfigurationError branch
with the error's own already-computed problems vocabulary, mirroring
unavailableForUnreachableConnector's own enrichment pattern for a different error, keyed to
every key actually malformed and no other, and issuing no call.

## Notes

ADVISORY, from the specification -- Criteria 2 and 4 require result_detail to state "the evidence-result endings a statusMap may map a status to", and the sole candidate names that vocabulary without enumerating it -- its Description defers the values to domain/investigation/evidence-result, which is not among this task's candidates. The implementer and reviewer read the four values (ok, unavailable, denied, timeout) from that node directly; the epic's claim is not grown for this, since the candidate node is still what governs the fact and nothing here contradicts or extends it.
ADVISORY, from the specification -- The decision log carries no entry locating rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary itself, though it is the node this task binds to and the node whose own Description states it, not rules/integration/an-http-connector-configuration-declares-its-call, owns the malformed-key vocabulary fact today. This is a pre-existing gap in the specification's own disclosure, not something this corrective increment introduces or is positioned to close.
