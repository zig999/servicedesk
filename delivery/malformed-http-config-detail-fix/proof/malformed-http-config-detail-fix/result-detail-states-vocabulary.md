---
target: backend
title: A malformed HTTP connector configuration's result_detail states its vocabulary
summary: Five tests in the adapter's existing spec file -- four corrected in place, one newly added --
  establish that unavailableForMalformedHttpConfiguration's result_detail states the error's name plus
  exactly the vocabulary of whichever key(s) are actually malformed, and issues no HTTP call.
implementation: sha256:e9b2fdc7abc0c548f95797f8e0086359c56033453003146abe41c1118fc44940
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/malformed-http-config-detail-fix-result-detail-states-vocabulary-suite
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError and the methods vocabulary,
    not the evidence-result endings vocabulary, issuing no call, when the connector's own configuration
    does not declare a recognized method
  proves: Criterion 1 -- a method-only-malformed configuration, with statusMap well-formed, ends unavailable
    stating MalformedHttpConnectorConfigurationError and the methods vocabulary, and does not state the
    endings vocabulary.
  fails_when: result_detail stops containing the error's name, stops containing the methods vocabulary
    phrase, starts containing the endings vocabulary phrase, or the HTTP client is called.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError and the evidence-result endings
    vocabulary, not the methods vocabulary, issuing no call, when the connector's own configuration does
    not declare a statusMap
  proves: Criterion 2 -- a statusMap-only-malformed configuration, with method well-formed, ends unavailable
    stating MalformedHttpConnectorConfigurationError and the endings vocabulary, and does not state the
    methods vocabulary.
  fails_when: result_detail stops containing the error's name, stops containing the endings vocabulary
    phrase, starts containing the methods vocabulary phrase, or the HTTP client is called.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError and neither vocabulary, issuing
    no call, when the connector's own configuration does not declare a responseMap
  proves: Criterion 3 -- a responseMap-only-malformed configuration (missing entirely), with method and
    statusMap both well-formed, ends unavailable stating MalformedHttpConnectorConfigurationError and
    neither vocabulary.
  fails_when: result_detail stops containing the error's name, or starts containing either the methods
    or the endings vocabulary phrase, or the HTTP client is called.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError and neither vocabulary, issuing
    no call, when the connector's own configuration declares a responseMap holding a non-string value
  proves: Criterion 3, over the distinct input class of a responseMap that is present but holds a non-string
    value rather than being absent.
  fails_when: result_detail stops containing the error's name, or starts containing either the methods
    or the endings vocabulary phrase, or the HTTP client is called.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming MalformedHttpConnectorConfigurationError and both the methods vocabulary
    and the evidence-result endings vocabulary, issuing no call, when the connector's own configuration
    malforms both its method and its statusMap
  proves: Criterion 4 -- a configuration whose method and statusMap are both malformed ends unavailable
    stating MalformedHttpConnectorConfigurationError and both vocabularies together.
  fails_when: result_detail stops containing the error's name, stops containing either vocabulary phrase,
    or the HTTP client is called.
untested:
- 'Criterion 5 (no HTTP call issued) is not given its own dedicated test: it is asserted by expect(httpClient).not.toHaveBeenCalled()
  inside each of the five tests above, since it holds identically across every malformed-key class.'
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary -- the node's
  fact is a finite transition set (method-only, statusMap-only, both) exhaustively covered by the union
  of the criterion-1, 2 and 4 tests, but no single test decides the fact whole per SPEC-004 R11, since
  each names only one cell of the transition table. A table-driven test spanning all three cells would
  decide the node whole, but writing one here would have meant restructuring the pre-existing, individually-named
  tests this task's own instructions directed be corrected in place rather than merged.
- The exact separator characters unavailableForMalformedHttpConfiguration composes result_detail with
  (a colon after the error's name, a semicolon between joined problems) are an implementation inference
  about formatting that no criterion or node states; every test asserts containment rather than exact-string
  equality on the whole composed value.
not_applicable:
- edge_case: A configuration where responseMap is malformed together with method and/or statusMap also
    malformed, or all three keys malformed at once.
  why: None of the task's five criteria states an expected result_detail for these combinations.
divergences:
- from: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  departure: In src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts,
    four pre-existing tests asserted result_detail equal to exactly MalformedHttpConnectorConfigurationError.name,
    with no vocabulary appended -- the pre-fix defect this node's fact and this task's criteria 1-4 explicitly
    refuse. Corrected each assertion in place (renaming each test to state what it now proves) instead
    of deleting or leaving them asserting the refused fact.
  why: These four tests previously made the specification's own refused fact pass. Correcting them in
    place is disclosed here, rather than left silent, since a reviewer holds this proof and the delivered
    code to the same node and would otherwise have no way to see that this proof's own prior version asserted
    the wrong fact.
---

## What it is

The proof for task/malformed-http-config-detail-fix/result-detail-states-vocabulary: four
pre-existing tests corrected to state the fixed behavior, plus one new test for the
both-malformed case.

## Notes

Suite ran clean over all six registry steps (install, typecheck, lint, secret-scan, test-unit,
test) before this record was written. The first build attempt failed test-unit over the four
stale assertions this proof corrects; the second attempt, captured after the correction, is what
both this record and the implementation record are stamped on.
