---
type: policy
statement: >-
  An observation an HTTP connector configuration's call ends ok carries exactly those fields whose
  name is at once a key of that configuration's responseMap and a key of the producing
  capability's output schema's own top-level properties object and whose responseMap path resolves
  in the response body — a responseMap key naming no such property contributes nothing to the
  observation, and an output schema property no responseMap key names is absent from it.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
  - domain/investigation/evidence
consistency: eventual
---

## Description

A responseMap key is the name an observation carries a value under, and the capability's output schema is the vocabulary that observation is read in — the fields domain/investigation/field-semantics snapshots and a citation is held to.
A key outside that vocabulary is read from the body and then carried nowhere, so a configuration whose keys are the source system's own names observes nothing while ending ok, and nothing at registration refuses it.
This is why the operator authoring a responseMap names each key by the capability's field rather than by the document's property, and why a surface authoring one states which keys reach a capability field and which fields no key reaches.
