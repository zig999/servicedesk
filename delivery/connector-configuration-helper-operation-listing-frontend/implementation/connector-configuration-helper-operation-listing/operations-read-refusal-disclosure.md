---
target: frontend
title: State a refused operations read to the operator
summary: Adds a disclosure module for the operations-read outcome and renders its refusal branch beside
  the draft's own inside the Configuration Helper.
task: sha256:fc1d575c5ed44630e448f45a1899cce779bbd328d6d904e08676abfcb2a658be
files:
- path: src/services/connector-configuration-operations-read-disclosure.ts
  effect: a pure function mapping an OpenApiDocumentOperationsReadOutcome to {kind:"none"} or {kind:"refused",
    message}, mirroring connector-configuration-draft-disclosure.ts
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: calls the new disclosure function and renders its refused branch as a role=alert, text-sm text-destructive
    paragraph inside the existing aria-live container, beside the draft's own refusal branch
criteria:
- criterion: An unfetchable-link outcome is stated as a message naming that the link named in the helper
    could not be fetched.
  met: true
  how: the openapi-document-not-fetched case states "the named OpenAPI document link could not be fetched"
- criterion: That message names which of network-failure, timeout or status-outside-2xx the answer carried,
    and names the answered status where it carried status-outside-2xx.
  met: true
  how: fetchFailureLabel() names each of the three failure kinds, and interpolates the numeric status
    for status-outside-2xx
- criterion: An unreadable-document outcome is stated as a message naming that the fetched document could
    not be read as an OpenAPI 3.x document.
  met: true
  how: the openapi-document-not-readable and openapi-document-declares-no-version cases both state "the
    fetched document could not be read as an OpenAPI 3.x document" — the latter is the same unreadable-document
    refusal family under a different reason, per the specification
- criterion: The unfetchable-link message and the unreadable-document message are different messages,
    and neither is stated for the other's outcome.
  met: true
  how: the two switch branches return distinct literal strings, each reached only by its own outcome kind
- criterion: An outcome naming neither of those two conditions is stated as neither of them.
  met: true
  how: the unrecognized-failure case states a third, distinct message naming that the request failed for
    an unrecognised reason
- criterion: While the operations read has not answered, no refusal of it is stated.
  met: true
  how: the idle, pending and operations cases all return {kind:"none"}, which the component renders nothing
    for
- criterion: The refusal is rendered inside the helper's aria-live container, in an element carrying role=alert
    and the same text-sm text-destructive classes the draft's refusal already uses.
  met: true
  how: the new branch sits inside the same aria-live="polite" div, as a <p role="alert" className="text-sm
    text-destructive"> identical in shape to the draft's own
- criterion: Every message connector-configuration-draft-disclosure.ts states for a draft outcome is unchanged
    by this task.
  met: true
  how: connector-configuration-draft-disclosure.ts was not modified; the new module is a separate file
nodes:
- node: rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: the disclosure function states the two named refusal messages and the unrecognised-failure fallback,
    and the component renders whichever applies
- node: rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
  how: idle and pending both map to {kind:"none"}, so nothing is rendered before the read answers
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
  how: the fetch-failure and unreadable-document outcomes are handled by separate switch cases stating
    separate messages; the HTTP-422 half of this rule is the backend's own, not reached here
inferences:
- inferred: openapi-document-declares-no-version is disclosed with the same message as openapi-document-not-readable,
    rather than a third distinct message.
  from: the specification states both are the same unreadable-document refusal family (OpenApiDocumentNotReadableError),
    distinguished only by reason in the backend's own answer; the task's criteria describe exactly two
    named conditions plus a fallback, not three
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-operations-read-refusal-disclosure-build
---

## What it is

A pure function, connector-configuration-operations-read-disclosure.ts, maps the operations read's outcome to nothing or one refusal message, exactly mirroring connector-configuration-draft-disclosure.ts's own shape. ConnectorConfigurationHelperFields calls it once and renders its refused branch beside the draft's own, inside the same aria-live container.

## Notes

None.
