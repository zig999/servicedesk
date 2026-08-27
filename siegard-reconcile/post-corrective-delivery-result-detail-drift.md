---
contract_version: siegard-reconcile/1
title: evidence-collection-stage.ts re-checked after the corrective result_detail delivery
summary: The corrective delivery bea2d2a (task/evidence-collection-stage-result-detail-fix/report-the-required-error-name)
  rewrote this file to fix one node (rules/integration/an-unresolvable-observation-ends-unavailable),
  already freshly bound by that delivery. The other 12 nodes bound to this same file now carry stale digests
  since a bind restamps only the nodes a delivery implements — the rest of the file's behavior is unchanged
  beyond what that delivery documented.
target: backend
files:
- path: src/investigation/evidence-collection-stage.ts
  change: unavailableEvidence() now reads CapabilityNotResolvedForObservationError(concept).name instead
    of composing a free-text sentence; every other function unchanged
nodes:
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'collectEvidence(): `const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline
    - now));`'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: collectEvidence()/collectOneEvidence() call observationSource.observeConcept for each concept.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: evidenceOf() returns every declared attribute (concept, inputs, observation, observed_at, ttl,
    origin, result, result_detail, capability_name, capability_version).
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: settledEvidence() maps ok/unavailable/timeout/denied to the declared endings unchanged.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/investigation/subject
  conforms: true
  how: collectOneEvidence() passes the subject through unfiltered to observeConcept.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: 'settledEvidence()''s own docstring cites this node honestly as honored rather than encoded here:
    denied and timeout endings answered by observe-concept itself carry no result_detail today and stay
    unchanged.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: 'unavailableEvidence() now sets resultDetail: new CapabilityNotResolvedForObservationError(concept).name,
    matching the rule''s required error name (already freshly bound by the corrective delivery; rebound
    here for consistency with the rest of this record).'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: COLLECTION_STAGE_BUDGET_MS = 7_000 and effectiveBoundMsFor bound each call by the smaller of the
    capability's timeout and the stage ceiling.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: the requester is passed straight through to every observe-concept call, never substituted.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: raceObservation()/settledEvidence()'s TIMED_OUT branch answers a timeout ending rather than throwing.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: collectEvidence() runs exactly one collectOneEvidence per concept in the collection plan.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: settledEvidence()'s TIMED_OUT branch records the evidence-recording half of the scenario.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: effectiveBoundMsFor bounds the call by the smaller of the capability's timeout and the stage ceiling.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
notes: 'Judgment shape: one specification-conformance-reviewer delegation over the one file, handed its
  full 13-node bound set (no additional candidates named). All 13 conform; nothing stands unbound. The
  judge also noted, without treating it as a finding: capabilities.readCapability''s boolean `held` may
  conflate ''no capability answers'' with ''more than one currently answers'' for this rule''s purposes,
  but that type lives in capability-query.port.ts outside this file set, and the file''s own comment explicitly
  limits its pre-check to the single condition it names — worth a future reconciliation over that port
  file, not acted on here.'
---
