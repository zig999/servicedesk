---
target: frontend
title: ResponseMap capability-coverage statement, over the field's text and a stated draft's
  configuration
summary: Proves the pure coverage service's four-outcome classification, the fsm-http/tech-profile
  scenario whole, and the surface's rendering of every outcome over both the Configuration field's
  content and a stated draft's configuration, together with its single capability-registry read and
  its refusal to gate Save, through one new service spec and two new sibling route spec files.
implementation: sha256:1139f5f20882a022e902c597b2f57e602d1aa60a430c801f03aefefb074627dc
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-response-map-capability-coverage-suite-3
tests:
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: classifies a matching responseMap key as read by the capability that declares it, and a
    non-matching key as read by none
  proves: Criteria 1 and 2.
  fails_when: the "covered" key's read entry omits or misnames the declaring capability, or the
    "orphan" key's entry is not exactly read-by-none.
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: lists only the output-schema property no responseMap key names, excluding the one a key
    does name
  proves: Criterion 3, whole.
  fails_when: the covered property appears in expectedFieldStatements, the uncovered property is
    missing from it, or the wrong capability is named.
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: returns cannot-be-read for an empty capability list regardless of the responseMap's own
    keys
  proves: Criterion 4.
  fails_when: the return value is not exactly cannot-be-read for an empty capability list.
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: returns null when the configuration is well-formed JSON object text declaring no
    responseMap key
  proves: The rule's own gating clause.
  fails_when: a non-null coverage value is returned for well-formed text declaring no responseMap
    key.
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: returns null, without throwing, for configuration text that is not well-formed JSON object
    text
  proves: The rule's own gating clause.
  fails_when: the call throws, or a non-null value is returned for not-well-formed text.
- file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
  name: states every one of the scenario's three findings from a single call
  proves: The governing scenario, whole (tech-profile registered for fsm-http, declaring login and
    installations; responseMap keys id, installations, syncEvents).
  fails_when: installations is not stated as read by tech-profile, id or syncEvents is not stated
    as read by none, or login is not stated as an expected field tech-profile expects that no key
    names.
  demonstrates: scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
- file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
  name: renders all three findings for a representative configuration typed into the field
  proves: Criteria 1, 2, 3 and 5 as rendered.
  fails_when: any one of the three statement texts fails to render for this configuration typed
    into the field.
- file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
  name: renders the cannot-be-read message when no capability is registered for the typed
    connector
  proves: Criterion 4 as rendered.
  fails_when: the cannot-be-read message fails to render when no capability is registered for the
    typed connector.
- file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
  name: leaves Save enabled while a key is read by no capability and an expected field stands
    unnamed
  proves: The task's own UNDERDETERMINED entry -- refutes an implementation that also disables or
    hides Save while a responseMap key is read by no capability or an expected field has no key.
  fails_when: the Save button carries the disabled attribute merely because a read-by-none key or
    an unnamed expected field stands stated.
- file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
  name: issues a single request to the capability registry despite repeated edits to the
    Configuration field
  proves: Criterion 7.
  fails_when: more than one request to /v1/capabilities is recorded after the Configuration field
    is edited a second time.
- file: src/routes/connector-configuration-helper-fields-response-map-capability-coverage.spec.ts
  name: renders the read statement for a responseMap key the draft's own configuration declares
  proves: Criterion 6 -- the statement is made over the configuration of a draft the surface
    states, not only over the field's content.
  fails_when: the read statement tied to the draft's own responseMap key fails to render beside
    the drafted configuration.
not_applicable:
- edge_case: Concurrent or overlapping computations.
  why: computeResponseMapCapabilityCoverage is pure, synchronous and side-effect-free with no
    shared state.
- edge_case: A slow or failing capability-registry request.
  why: useCapabilities already defaults capabilities to [] on error or before it resolves, which
    degrades to the cannot-be-read branch already exercised.
- edge_case: An absent or undefined configurationText or connectorCapabilities argument.
  why: the service's own signature requires both as non-optional.
- edge_case: Whitespace-only or differently-formatted-but-equivalent JSON text, or a responseMap
    with a JS-level duplicate key.
  why: JSON.parse normalizes formatting and collapses a duplicate key before any key extraction
    runs.
- edge_case: A capability whose output schema declares a property with an unusual or complex
    value.
  why: the implementation reads only Object.keys of the properties object.
untested:
- domain/integration/connector-configuration -- honored rather than encoded.
- rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
  -- states a general policy over every configuration text a surface presents; no single test
  decides that generality whole, though each of its four outcomes is protected by its own test.
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  -- binds four statements at once; only this task's own responseMap-coverage slice is protected
  here.
- The implementation's own inference to name every capability whose output schema declares a
  shared responseMap key, rather than only the first one found.
- The implementation's own inference that a capability whose output_schema fails to parse, or
  lacks a usable properties object, contributes no properties at all.
- The implementation's own inference to return null when at least one capability is registered
  but neither the responseMap nor any such capability's output schema exposes anything to state.
contested:
- what: The implementation's own "preserved" claim that ConnectorConfigurationDraftDisclosure's
    other sections, the stale-draft message and the Apply button are untouched beyond the new
    statement.
  why: The new statement calls useResponseMapCapabilityCoverage unconditionally whenever the
    outcome is drafted, and that hook calls useCapabilities(), which requires a QueryClientProvider
    ancestor. Several already-delivered Helper-area spec files rendered
    ConnectorConfigurationHelperFields directly with a drafted outcome and no QueryClientProvider;
    those broke on the first suite run and were corrected (see the implementation record's own
    Notes) by wrapping each affected render in a QueryClientProvider with a stubbed empty-capabilities
    fetch, never weakening any assertion. The claim now holds as corrected.
---

## What it is
The proof of the coverage judgment, made twice -- over the field's own text and over a stated draft's configuration -- and of the fixes the second surface's new dependency required of pre-existing Helper-area tests.

## Notes
None.
