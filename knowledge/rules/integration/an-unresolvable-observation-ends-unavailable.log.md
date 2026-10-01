---
entries:
- field: statement
  unstated: What an observation records when no capability answers the concept or the capability's connector has no registered configuration.
  decided: No call is issued and the observation ends unavailable, with a result detail reporting CapabilityNotResolvedForObservationError or ConnectorConfigurationNotRegisteredError respectively.
  why: The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The delivered adapter throws both as faults. The evidence node says absence of data is a recorded fact, never an exception, and the connector-configuration node says a capability may be registered before its connector is configured, so the state is reachable in ordinary operation and must record an ending; the two names are kept as the result detail so the cause stays readable.
- field: statement
  unstated: 'Cross-check: one-capability-answers-one-concept refuses a concept read that finds two capabilities answering, while this policy decided only the case where none answers — an observation of a concept answered twice was decided by neither.'
  decided: The observation issues no call and ends unavailable, with a result detail reporting DuplicateConceptAnswerError.
  why: Inside an investigation the collection stage records endings and never raises (domain/investigation/evidence, no-stage-aborts-on-its-deadline), so the published read's refusal cannot be what an observation answers; the same ending the other two unresolvable cases take, carrying the same name the read reports, keeps the cause readable without a second vocabulary.
---
