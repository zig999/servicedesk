---
title: Proof for observation-port-unavailable-endings
summary: HttpDeclarativeObservationSource answers an unavailable ending naming its cause via result_detail
  for each of the four presently-unresolvable conditions, issuing no HTTP call, verified by rewriting
  the three pre-existing tests that asserted the old throwing behavior for these same conditions and adding
  what those tests did not cover.
implementation: sha256:0f21eb99ba0b1c1a71a43eaa469311189173b92d632db63d47805ccac2f5db78
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-observation-port-unavailable-endings-suite-2
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming CapabilityNotResolvedForObservationError, issuing no call, when no
    capability currently answers the concept
  proves: Observing a concept no registered capability currently answers returns an unavailable ending
    with result_detail CapabilityNotResolvedForObservationError, without raising an exception. — together
    with "None of the four cases issues an HTTP call."
  fails_when: 'observeConcept rejects instead of resolving for this condition, or the resolved outcome''s
    result and result_detail are not exactly {result: ''unavailable'', result_detail: ''CapabilityNotResolvedForObservationError''},
    or the injected httpClient is called'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming CapabilityNotResolvedForObservationError, issuing no call, when no
    capability currently answers the concept
  proves: the inference that result_detail is read from the raised error's own .name
  fails_when: result_detail carries anything other than the raised error class's own name
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming DuplicateConceptAnswerError, issuing no call, when more than one registered
    capability currently answers the concept
  proves: Observing a concept more than one registered capability currently answers returns an unavailable
    ending with result_detail DuplicateConceptAnswerError, without raising an exception. — together with
    "None of the four cases issues an HTTP call."
  fails_when: 'observeConcept rejects with DuplicateConceptAnswerError instead of resolving, or the resolved
    outcome is not exactly {result: ''unavailable'', result_detail: ''DuplicateConceptAnswerError''},
    or the injected httpClient is called'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming DuplicateConceptAnswerError, issuing no call, when more than one registered
    capability currently answers the concept
  proves: the inference that the duplicate-concept fix catches the throw locally inside this adapter's
    own resolveCapability
  fails_when: this adapter no longer degrades a DuplicateConceptAnswerError thrown by its own ICapabilityQuery
    dependency to the unavailable ending, letting it propagate instead
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming ConnectorConfigurationNotRegisteredError, issuing no call, when the
    capability's own connector names no configuration currently registered
  proves: Observing a concept whose capability names a connector no configuration is registered under
    returns an unavailable ending with result_detail ConnectorConfigurationNotRegisteredError, without
    raising an exception. — together with "None of the four cases issues an HTTP call."
  fails_when: 'observeConcept rejects instead of resolving for this condition, or the resolved outcome
    is not exactly {result: ''unavailable'', result_detail: ''ConnectorConfigurationNotRegisteredError''},
    or the injected httpClient is called'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the
    connector's own configuration does not declare a recognized method
  proves: Observing a concept whose connector configuration does not declare method, responseMap or statusMap
    returns an unavailable ending with result_detail MalformedHttpConnectorConfigurationError, without
    raising an exception. — the method-missing exemplar, together with "None of the four cases issues
    an HTTP call."
  fails_when: 'observeConcept rejects instead of resolving for an unrecognized method, or the resolved
    outcome is not exactly {result: ''unavailable'', result_detail: ''MalformedHttpConnectorConfigurationError''},
    or the injected httpClient is called'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the
    connector's own configuration does not declare a responseMap
  proves: the responseMap-missing exemplar of criterion 4
  fails_when: 'observeConcept rejects, or resolves to anything other than {result: ''unavailable'', result_detail:
    ''MalformedHttpConnectorConfigurationError''}, or the injected httpClient is called, when responseMap
    is absent'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the
    connector's own configuration does not declare a statusMap
  proves: the statusMap-missing exemplar of criterion 4
  fails_when: 'observeConcept rejects, or resolves to anything other than {result: ''unavailable'', result_detail:
    ''MalformedHttpConnectorConfigurationError''}, or the injected httpClient is called, when statusMap
    is absent'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: still throws MalformedHttpConnectorConfigurationError from the exported asHttpConnectorCallConfiguration
    itself, unwrapped, for a caller that narrows a configuration directly rather than through observeConcept
  proves: the inference that the exported asHttpConnectorCallConfiguration keeps throwing rather than
    becoming non-throwing itself, so test-connector.controller.ts's own direct call still receives a thrown
    refusal
  fails_when: calling asHttpConnectorCallConfiguration directly with a malformed configuration resolves
    or returns instead of throwing MalformedHttpConnectorConfigurationError
not_applicable:
- edge_case: two of the four unresolvable conditions applying to the same call at once
  why: observeConcept resolves capability, then connector configuration, then the HTTP-narrowed fields
    strictly in sequence, short-circuiting on the first Resolution that fails — a later step is structurally
    unreachable once an earlier one fails
- edge_case: two concurrent observeConcept calls each hitting one of the four unresolvable conditions
  why: no criterion or bound node states a concurrency guarantee specific to the four unavailable endings;
    the adapter's general concurrency behavior is already proven, unmodified, by this file's own pre-existing
    concurrent-call test
- edge_case: an empty-string or malformed concept argument
  why: no criterion of this task distinguishes an empty/malformed concept from any other concept no capability
    currently answers
- edge_case: the capability registry or connector-configuration registry itself being slow or failing
    to answer
  why: outside this task's four named conditions, which are all about what a registry's own successful
    read comes back holding
---

## What it is

Nine tests over the production adapter proving the four unavailable-ending criteria and that no HTTP call is issued in any of the four cases, plus one guarding the exported asHttpConnectorCallConfiguration's continued throwing behavior for its other caller.

## Notes

The first suite attempt (run/observation-endings-and-collection-budget-observation-port-unavailable-endings-suite) failed on a pre-existing, unrelated domain-boundary false positive (cause: test, diagnosed by failure-diagnostician), fixed by the sibling corrective task/domain-boundary-scan-fix/narrow-bypass-mention-scan. This suite run (run/observation-endings-and-collection-budget-observation-port-unavailable-endings-suite-2) passed clean.
