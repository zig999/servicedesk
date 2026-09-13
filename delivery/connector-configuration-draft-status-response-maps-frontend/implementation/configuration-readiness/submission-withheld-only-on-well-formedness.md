---
target: frontend
title: Bound the withheld-submission act to well-formedness alone, and close the one narrow
  statement gap
summary: Verified across all four sibling readiness statements and the request-draft/apply flows
  that only well-formedness withholds the registration act, and added the one missing statement
  for content that is valid JSON but not an object.
task: sha256:ef318221110fc750a19f29822e4299f6395f8e40c128064c2bae6e9130faf736
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-submission-withheld-only-on-well-formedness-build
files:
- path: src/services/connector-configuration-messages.ts
  effect: Adds CONFIGURATION_NOT_A_JSON_OBJECT_MESSAGE, a pt-BR statement text for the sub-case
    where the Configuration field's text parses as JSON but is not a plain object.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Imports isPlainRecord; adds a local configurationTextParsesToNonObject(text) defensive
    check and a ConfigurationNotAnObjectStatement component that renders the message only in that
    one sub-case; rendered once, directly under the JsonTextareaField and above the other five
    readiness statements. isSaveDisabled and every other gating expression in the file are
    untouched.
criteria:
- criterion: While the surface's own judgment finds the field's content not well-formed JSON
    object text, no act submitting a registration through register-connector is offered.
  met: true
  how: Already held by existing code, unchanged by this task. isValidConfigurationObject in
    use-connector-configuration-form.ts sets configuration.isValid on every onChange.
    isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false disables the Save
    button whenever the content is not well-formed. No code change was needed or made for this
    criterion.
- criterion: While that act is withheld, the statement that judgment owes stands in the act's
    place.
  met: true
  how: Two sub-cases existed. Text that fails JSON.parse itself was already stated by
    JsonTextareaField's own "Invalid JSON" error, unchanged. Text that parses successfully but is
    not a plain object previously stated nothing anywhere, though Save was already correctly
    disabled for it. Closed this one narrow gap by adding ConfigurationNotAnObjectStatement.
- criterion: A stated departure from what the HTTP connector requires does not withhold the act
    submitting a registration.
  met: true
  how: Verified by reading. HttpConnectorDeparturesStatement is rendered purely for display;
    httpConnectorDepartures is not read anywhere in isSaveDisabled or any other gating expression.
- criterion: A stated subject placeholder no registered capability declares does not withhold the
    act submitting a registration.
  met: true
  how: Verified by reading. SubjectPlaceholderStatements is rendered for display only;
    subjectPlaceholderStatements does not feed isSaveDisabled or any other gate.
- criterion: A stated credential placeholder does not withhold the act submitting a registration.
  met: true
  how: Verified by reading. CredentialPlaceholderStatements is rendered for display only;
    credentialPlaceholderStatements does not feed isSaveDisabled or any other gate.
- criterion: A stated responseMap key no registered capability reads does not withhold the act
    submitting a registration.
  met: true
  how: Verified by reading. ResponseMapCapabilityCoverageStatement is rendered for display only in
    both form-fields and helper-fields; responseMapCapabilityCoverage does not feed
    isSaveDisabled, and the Apply button in ConnectorConfigurationDraftDisclosure carries no
    disabled prop at all.
- criterion: A stated output schema property no responseMap key names does not withhold the act
    submitting a registration.
  met: true
  how: Verified by reading. The expectedFieldStatements branch of the same component is checked
    above. Also verified the configuration-helper's own request-draft gate depends only on
    outcome.kind === "pending", untouched by any of the four readiness computations.
nodes:
- node: rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-form-fields.tsx
  how: The rule's statement is encoded by the pre-existing isValidConfigurationObject/isSaveDisabled
    pairing for the withholding half, and by the new ConfigurationNotAnObjectStatement for the one
    sub-case where the statement half was missing.
- node: rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  how: Verified by reading every gating expression this task's scope reaches that none of the four
    sibling readiness statements' outputs are read by any of them.
- node: scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
  how: This scenario's second then ("the act submitting the registration stays offered") is
    criterion 3 of this task verbatim; confirmed by reading that HTTP-connector departures
    (including the ending-outside-vocabulary case) never reach isSaveDisabled.
inferences:
- inferred: The new statement belongs beside the Configuration field in
    connector-configuration-form-fields.tsx, worded to state only well-formedness, never why
    particular JSON fails to parse.
  from: The task's own ADVISORY notes ruling out both touching json-textarea-field.tsx and
    building any part of the out-of-scope judgment rule.
- inferred: The check reused is a local parse-and-classify function (isPlainRecord plus a local
    try/catch), not a call into use-connector-configuration-form.ts's private
    isValidConfigurationObject.
  from: The task's explicit instruction not to reach into the hook's private function, and the
    existing pattern in connector-configuration-http-departures.ts's parseConfigurationObject.
- inferred: The wording states only the well-formedness fact, with no attempt at syntax diagnosis
    or at replicating any sibling statement's vocabulary.
  from: The tone and register of the existing CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE
    and HTTP_CONNECTOR_STATUS_MAP_NOT_AN_OBJECT_MESSAGE.
preserved:
- isSaveDisabled's existing expression in connector-configuration-form-fields.tsx, unchanged, not
  widened.
- The five already-delivered readiness statements' own computation and rendering, read only, not
  edited.
- The configuration-helper's request-draft gate, operations-read states, stale-draft marking, and
  apply-confirmation diff, read only, not edited.
- json-textarea-field.tsx's own Invalid JSON error and Beautify behavior, untouched.
deferred:
- what: The judgment rule a-connector-configuration-surface-judges-its-configuration-fields-content
    and its own general-purpose explanation of non-well-formedness.
  why: Deliberately out of scope for this whole epic, per the epic's own uncovered declaration and
    this task's own ADVISORY note.
---

## What it is
The line between a statement and a refusal, drawn once over the whole panel.

## Notes
Build round 1 green on the first attempt.
