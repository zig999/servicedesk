---
target: frontend
title: Submission withheld only on well-formedness -- the bound over all five readiness
  statements
summary: Proves the one closed well-formedness statement gap and its Save-withholding partition
  (parse-failure, parses-to-non-object, well-formed), plus one combined test showing an HTTP
  departure, an undeclared subject placeholder, a credential placeholder, a responseMap key read
  by no capability and an unnamed output-schema property all standing at once withhold nothing,
  and one Helper-area test showing the responseMap-coverage statement leaves the draft-request and
  Apply acts untouched, through two new sibling spec files.
implementation: sha256:1cd5147a2b916b12c72a5409a340ec7400a58402258f9c148e094a6cef345cbc
run: run/configuration-readiness-submission-withheld-only-on-well-formedness-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: withholds Save and states the not-an-object message for a JSON array
  proves: Criteria 1 and 2 -- the parses-to-non-object sub-case, JSON array representative.
  fails_when: the not-an-object message fails to render for a JSON array, or Save lacks the
    disabled attribute while it stands.
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: withholds Save and states the not-an-object message for a JSON number
  proves: Criteria 1 and 2 -- the parses-to-non-object sub-case, JSON number representative.
  fails_when: the not-an-object message fails to render for a JSON number, or Save lacks the
    disabled attribute while it stands.
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: withholds Save and states the not-an-object message for JSON null
  proves: Criteria 1 and 2 -- the parses-to-non-object sub-case's null boundary.
  fails_when: the not-an-object message fails to render for JSON null, or Save lacks the disabled
    attribute while it stands.
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: renders only the Invalid JSON error, withholds Save, and renders no not-an-object statement
  proves: Criteria 1 and 2 -- the fails-to-parse sub-case, and that it never doubles up with the
    parses-to-non-object statement.
  fails_when: JsonTextareaField's own Invalid JSON error fails to render, the not-an-object message
    renders alongside it, or Save lacks the disabled attribute.
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: renders neither not-well-formed statement and leaves Save enabled for well-formed JSON
    object text
  proves: The well-formed boundary neither criterion 1 nor criterion 2 reaches.
  fails_when: either not-well-formed statement renders for well-formed JSON object text, or Save
    carries the disabled attribute despite it.
- file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: leaves Save enabled despite all four sibling readiness statements standing at once over one
    well-formed configuration
  proves: Criteria 3 through 7, combined -- an HTTP-connector departure, an undeclared subject
    placeholder, a credential placeholder, a responseMap key read by no capability and an
    output-schema property no key names, all stated at once, withhold nothing.
  fails_when: Save carries the disabled attribute despite the field's content being well-formed
    JSON, merely because one or more of the five confirmed statements stands, or any one of the
    five statement texts fails to render for this fixture.
- file: src/routes/connector-configuration-helper-fields-submission-withheld-only-on-well-formedness.spec.ts
  name: leaves the request-draft button and the Apply button both enabled while a responseMap key
    read by no capability stands stated over the drafted configuration
  proves: The task's own UNDERDETERMINED entry -- refutes an implementation that also withholds or
    disables the configuration-helper's own draft-request or Apply act while a responseMap key no
    capability reads stands stated over the stated draft's configuration.
  fails_when: the request-draft button or the Apply button carries the disabled attribute merely
    because the read-by-none responseMap statement stands stated.
not_applicable:
- edge_case: Empty or whitespace-only Configuration field text.
  why: JSON.parse throws for both, the same fails-to-parse class the malformed-text representative
    already tests.
- edge_case: A JSON boolean (true/false) as the field's top-level value.
  why: typeof "boolean" is not "object", the same primitive-scalar class the JSON-number
    representative already tests.
- edge_case: A well-formed object literal containing a duplicate top-level key.
  why: JSON.parse collapses the duplicate to its last value before any check ever sees it, so it
    behaves exactly as the well-formed baseline already tests.
- edge_case: Concurrent or overlapping edits to the Configuration field.
  why: every computation this task's tests touch is pure, synchronous and side-effect-free.
- edge_case: A slow or failing capability-registry request during the combined criteria-3-through-7
    test.
  why: useCapabilities already defaults capabilities to [] on error or before it resolves; already
    covered by the sibling tasks' own proofs, and this task introduces no new capability read.
untested:
- rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
  -- a totality over every possible Configuration field content; no single test decides it whole,
  though each class this proof distinguishes is protected by its own test.
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  -- binds all four readiness statements at once, over every configuration text and every
  combination they could stand in; this proof's own combined test protects one representative
  instance, not the totality.
- scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write --
  already demonstrated whole by an existing test in the http-departure-statements task's own
  proof; not re-tested here to avoid redundancy.
- The task's own UNDERDETERMINED entry's other named triggers (a subject placeholder no capability
  declares, an HTTP-connector departure) against the configuration-helper's own draft-request act
  -- no live code path exists for those pairings, since only the responseMap-coverage statement is
  computed against the Helper's own drafted configuration.
---

## What it is
The proof that only well-formedness withholds the act, and that the one narrow statement gap it left is now closed.

## Notes
None.
