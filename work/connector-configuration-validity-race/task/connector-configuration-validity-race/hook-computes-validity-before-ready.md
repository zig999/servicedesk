---
title: The detail hook knows a configuration's validity before it reports ready
summary: useConnectorConfigurationDetail decides whether a loaded connector configuration is valid from
  the loaded text itself, so its ready outcome never carries a validity it has not yet computed.
objective: A consumer reading the connector-configuration detail hook's ready outcome observes an isValid
  that reflects the loaded configuration's own text at every reading, including the first, rather than
  a default the hook corrects afterwards.
criteria:
- At the moment the hook's outcome first reports the ready phase, the isValid it carries reflects the
  loaded configuration's own text rather than a value the hook has not yet corrected.
- A loaded connector configuration whose text does not parse to a plain object — a bare string, an array,
  a number, a boolean or null among them — is reported as not valid at every reading of the ready outcome,
  including the first.
- A loaded connector configuration whose text parses to a plain object is reported as valid at every reading
  of the ready outcome, including the first.
implements:
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- domain/integration/connector-configuration
sources:
- intake/scope.md
---

## What it is
The one task of a corrective increment: the connector-configuration detail hook computes a loaded configuration's validity from the loaded text rather than defaulting it and correcting it in an effect, so no consumer reads a validity the hook has not yet determined.
The wrong behavior was observed running the delivered system's own suite and answers to no criterion any delivered task holds.

## Notes
REMAINDER, from the specification — a-connector-configuration-holds-a-well-formed-object's statement is mostly a write-side refusal: the registry refusing an unparsable or non-object configuration with an HTTP 422 ConnectorConfigurationNotWellFormedError, refusing an absent value or one that is neither a string nor a plain object with an HTTP 422 IncompleteConnectorConfigurationError, and admitting a registration that supplies the configuration as text or as the object it parses to; no criterion of this task reaches any of those clauses, because this task reads an already-loaded configuration and never registers one.
Only the rule's own definition of well-formed — JSON object text, a null value and an array excluded — and the domain node's holding and answering it as JSON object text are answered here.
That clause belongs to the task delivering the connector-configuration registry's own register-connector write refusals, on the backend.
ADVISORY, from the specification — the configuration this hook loads reaches it through read-connector-configuration, published by contracts/integration/connector-configuration-registry, and an unregistered name is refused by rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused; neither is named in implements because no criterion of this task exercises the read itself, the criteria all speaking of an already-loaded configuration and of what the ready outcome carries.
If this task were intended to own the detail read's own outcomes, not-found among them, its criteria say nothing about them and the cut would have to be revisited.
ADVISORY, from the specification — criterion 2's condition, a loaded connector configuration whose text does not parse to a plain object, cannot arise from a registry-answered read as the specification stands, because a-connector-configuration-holds-a-well-formed-object refuses exactly that text at registration and at update, and no candidate node states a read-time posture for a configuration stored before that rule existed — unlike rules/integration/a-capability-input-schema-holds-a-well-formed-object, which states one explicitly for a capability's input schema.
The criterion is implementable and provable against the hook's own input, but a proof cannot obtain such a configuration from the published read, so the demonstration is expected to construct the loaded text directly.
Decision, beyond the covers — stand: rules/integration/a-capability-input-schema-holds-a-well-formed-object is named by the advisory above only as the contrasting node that does state a read-time posture, and the claim is deliberately not grown to it: nothing this correction writes touches a capability's input schema, and the binder named it to locate a silence rather than to govern this task.
