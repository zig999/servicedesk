---
target: frontend
title: Subject-placeholder readiness statement proof
summary: Proves the pure judgment service's three-branch policy and its scoping boundaries at the
  service layer, and the surface's rendering of each branch plus its non-gating of Save and its
  single capability-registry read, through two new sibling spec files.
implementation: sha256:dedbcb358b9128f481022c53b760da7362741f6f05864c9e66b89509f66f4bac
run: run/configuration-readiness-subject-placeholder-statements-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: returns a declared statement when every capability in the list declares the placeholder's
    attribute name
  proves: Criterion 1 -- where every capability registered naming the connector declares the
    attribute name among its input schema properties, the surface states that the placeholder is
    declared.
  fails_when: the returned array is not exactly one declared entry naming account-id, or either
    capability's declaration is disregarded.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: returns an undeclared statement naming the one capability whose input schema properties
    omit the attribute
  proves: Criterion 2 -- where one such capability does not declare the attribute name, the
    surface states that placeholder and names the capability that does not declare it.
  fails_when: the kind is not undeclared, nonDeclaringCapabilityLabels is empty or wrong, or the
    declaring capability is wrongly implicated.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: returns a single cannot-be-checked entry regardless of how many distinct subject
    placeholders the configuration embeds
  proves: Criterion 3, whole -- where no capability is registered naming the connector, the
    surface states that the field's subject placeholders (plural) cannot be checked, as one
    statement rather than one per placeholder.
  fails_when: more than one entry is returned, or the returned entry is not exactly
    cannot-be-checked.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: returns no statements when the configuration embeds no subject placeholder at all, even
    with capabilities registered
  proves: The objective's own "for each subject placeholder" quantifier -- zero placeholders means
    zero statements.
  fails_when: any statement is returned for a configuration that embeds no ${subject:...}
    placeholder.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: 'ignores ${requester} and ${credential:<name>} placeholders, judging only the
    ${subject:...} one present alongside them'
  proves: The task's own REMAINDER note -- only the subject form is reached by this task.
  fails_when: a requester or credential placeholder is counted, misparsed as an attribute name, or
    changes the one expected declared entry.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: judges two distinct subject placeholders independently, one declared and one undeclared
  proves: Criteria 1 and 2 combined -- distinct placeholders are judged on their own attribute
    name rather than collapsed into a single verdict.
  fails_when: fewer than two entries are returned, or either entry's kind, attribute name or
    non-declaring labels is wrong.
- file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
  name: returns no statements, without throwing, for configuration text that is not well-formed
    JSON object text
  proves: The objective's own gating on well-formed content.
  fails_when: the call throws, or a non-empty array is returned for text that is not well-formed
    JSON object text.
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  name: renders the declared statement when every registered capability declares the placeholder's
    attribute
  proves: Criterion 1 as rendered.
  fails_when: the declared statement's own text fails to render for this input.
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  name: renders the undeclared statement, naming the capability that does not declare the
    placeholder's attribute
  proves: Criterion 2 as rendered.
  fails_when: the undeclared statement's own text, naming the one non-declaring capability, fails
    to render for this input.
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  name: renders the cannot-be-checked message when no capability is registered for the connector
  proves: Criterion 3 as rendered.
  fails_when: the cannot-be-checked message fails to render when no capability is registered for
    the typed connector.
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  name: leaves Save enabled while the undeclared subject-placeholder statement stands
  proves: The task's own UNDERDETERMINED entry -- refutes an implementation that also withholds or
    disables Save while the statement stands.
  fails_when: the Save button carries the disabled attribute merely because the undeclared
    subject-placeholder statement stands.
- file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  name: issues a single request to the capability registry despite repeated edits to the
    Configuration field
  proves: Criterion 5 -- no second read of the capability registry is added, observed as a single
    network call across repeated edits.
  fails_when: more than one request to /v1/capabilities is recorded after the Configuration field
    is edited a second time.
not_applicable:
- edge_case: Concurrent or overlapping computations.
  why: computeSubjectPlaceholderStatements is pure, synchronous and side-effect-free with no
    shared state.
- edge_case: A slow or failing capability-registry request.
  why: useCapabilities already defaults capabilities to [] on error or before it resolves; that
    degrades to exactly the no-capability-registered branch already exercised.
- edge_case: An absent or undefined configurationText or connectorCapabilities argument.
  why: computeSubjectPlaceholderStatements's own signature requires both as non-optional.
- edge_case: Whitespace-only or differently-formatted-but-equivalent JSON text.
  why: JSON.parse normalizes this before any placeholder extraction runs.
- edge_case: A capability whose input schema declares the attribute name with an unusual or
    complex property value.
  why: the implementation reads only Object.keys of the properties object; the property's own
    value never affects the verdict.
untested:
- domain/integration/connector-configuration -- honored rather than encoded.
- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms -- this
  task's own REMAINDER note reaches only the subject clause.
- rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
  -- its three clauses are mutually exclusive branches; no single test decides the fact whole,
  though each branch is protected by its own criterion test.
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  -- binds four statements at once; only this task's own slice is protected here.
- The implementation's own inference that a capability whose input_schema fails to parse
  declares no properties at all -- not a fact any criterion or node decides.
- The implementation's own inference to name every non-declaring capability rather than only the
  first one found -- criterion 2 as written addresses only the single-capability case.
---

## What it is
The proof of the three-branch reading, made over the field's own live content and one capability read.

## Notes
Suite round 1 failed one pre-existing test in connector-test-panel-capability-picker.spec.ts that
asserted no request to CAPABILITIES_PATH was issued on the routed create screen. That assertion's
premise no longer holds: this task's subject-placeholder readiness statement legitimately reads the
same connector-filterable capability list on the create screen too (a Configuration field can carry
a subject placeholder there just as on the ready detail view), independent of whether the Test
panel renders. Corrected the test's title and dropped the CAPABILITIES_PATH assertion, keeping the
SUBJECT_TYPE_PATH assertion (still exclusive to the Test panel) and the "no Test section" assertion
unchanged. Suite round 2 green.
