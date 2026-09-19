---
target: backend
title: Malformed HTTP configuration's result_detail states its malformed-key vocabulary
summary: unavailableFor's MalformedHttpConnectorConfigurationError branch now routes through a dedicated
  enrichment that appends the error's own already-computed problems to result_detail, keyed to exactly
  the key(s) actually malformed, mirroring unavailableForUnreachableConnector's established enrichment
  pattern.
task: sha256:9700b5373971b8f5e477a8f37ce805eb638d3a208375423f5a30ed460c833848
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/malformed-http-config-detail-fix-result-detail-states-vocabulary-build-2
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: 'Added unavailableForMalformedHttpConfiguration(error), which returns { result: ''unavailable'',
    result_detail: `${error.name}: ${error.context.problems.join(''; '')}` }, placed beside unavailableForUnreachableConnector
    following the same one-error-class enrichment shape. Changed the sole catch site for MalformedHttpConnectorConfigurationError
    in resolveHttpConnectorCallConfiguration to call this new function instead of the generic unavailableFor(error).
    unavailableFor itself, and every other catch site that still calls it, is untouched.'
criteria:
- criterion: A configuration whose method is not one of GET, POST, PUT, PATCH or DELETE, with its statusMap
    well-formed, ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError
    and the methods an HTTP connector configuration may declare, and does not state the evidence-result
    endings a statusMap may map a status to.
  met: true
  how: httpConfigurationProblems (unchanged) pushes only the method-vocabulary sentence when the method
    is invalid and the statusMap is well-formed, since each of the three checks is independent. The new
    function joins exactly that one-element problems array after the error's name.
- criterion: A configuration whose statusMap is not an object mapping a status to one evidence-result
    ending, with its method well-formed, ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError
    and the evidence-result endings a statusMap may map a status to, and does not state the methods an
    HTTP connector configuration may declare.
  met: true
  how: 'Symmetric to the method case: httpConfigurationProblems pushes only the statusMap-vocabulary sentence
    when only statusMap is malformed, and the join surfaces that sentence alone beside the error''s name.'
- criterion: A configuration whose responseMap is not a well-formed object of string values, with its
    method and statusMap both well-formed, ends unavailable with a result_detail that states MalformedHttpConnectorConfigurationError
    and states neither the methods vocabulary nor the evidence-result endings vocabulary.
  met: true
  how: The responseMap problem text carries no method or evidence-result vocabulary, so with method and
    statusMap well-formed the joined result_detail states only the error's name and that sentence.
- criterion: A configuration whose method and statusMap are both malformed ends unavailable with a result_detail
    that states MalformedHttpConnectorConfigurationError and both the methods vocabulary and the evidence-result
    endings vocabulary.
  met: true
  how: httpConfigurationProblems pushes both sentences independently when both keys are malformed, and
    problems.join('; ') concatenates both into result_detail alongside the error's name.
- criterion: A configuration reaching this rule's malformed branch, whatever key is malformed, issues
    no HTTP call before the observation ends unavailable.
  met: true
  how: 'Unchanged by this edit: resolveHttpConnectorCallConfiguration runs inside resolvePreparedCall,
    which returns before observeConcept ever reaches issueRequestOrUnreachable — the only place an HTTP
    call is issued.'
nodes:
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: unavailableForMalformedHttpConfiguration states the error's name and joins in exactly the problems
    httpConfigurationProblems computed for the keys actually malformed -- the methods vocabulary for a
    malformed method, the evidence-result endings vocabulary for a malformed statusMap, and neither for
    a malformed responseMap, which the rule's own vocabulary clause does not name.
inferences:
- inferred: 'The enrichment concatenates the error''s name and its joined problems as `${error.name}:
    ${error.context.problems.join(''; '')}`, reusing the same name: detail-shaped template unavailableForUnreachableConnector
    already established.'
  from: 'unavailableForUnreachableConnector''s existing result_detail: `${error.name}: ${connector}` in
    the same file -- the established convention this task''s own Notes calls out as the pattern to mirror.'
preserved:
- The catch sites for CapabilityNotResolvedForObservationError, DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError,
  ConnectorPlaceholderNotResolvedError and IncompleteConnectorCallDescriptorError keep calling the generic
  unavailableFor(error), stating only the error's name.
- httpConfigurationProblems and refuseHttpConfigurationDepartures are unchanged.
- The control flow that issues no HTTP call before this catch fires is unchanged.
deferred:
- what: Four pre-existing unit tests asserted the old (defective) bare-name result_detail for MalformedHttpConnectorConfigurationError.
  why: Editing tests is outside this delegation's grant under two-producer separation; the test author
    corrected them as part of writing this task's proof, disclosed as a divergence in the proof record.
---

## What it is

Adds unavailableForMalformedHttpConfiguration, enriching result_detail with exactly the
vocabulary of the malformed key(s), and rewires the sole MalformedHttpConnectorConfigurationError
catch site to use it instead of the generic unavailableFor.

## Notes

The first build attempt (run/malformed-http-config-detail-fix-result-detail-states-vocabulary-build)
failed at test-unit: 4 pre-existing tests asserted the old defective bare-name result_detail this
correction fixes. This record is stamped on the second build attempt (-build-2), captured after
the test author corrected those 4 assertions as part of writing this task's proof; source in this
record is unchanged between the two attempts.
