---
title: What the surface states about the Configuration field's own content
summary: The readiness side -- the entry's guidance, the HTTP-connector departures, the subject and credential
  placeholder statements, the responseMap-against-output-schema coverage, and the one act any of them
  is allowed to withhold.
rationale: Cut apart from the Helper because every statement here is read from the Configuration field's
  text and the connector's registered capabilities rather than from a draft answer, and each is owed over
  content the operator typed as much as over content they applied.
covers:
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it
- rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
- rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
- rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution
- rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
- rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
- rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
- scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
- scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
uncovered:
- node: rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
  why: This plan's tasks state readiness statements gated by this judgment and bound the one act it may
    withhold; the judgment itself -- deciding whether the Configuration field's content is well-formed
    JSON object text -- is not built by any task here, since no criterion of submission-withheld-only-on-well-formedness
    decides what counts as well-formed, only what withholding that judgment already justifies.
sources:
- intake/scope.md
---

## What it is
Everything the authoring and editing surface states about the configuration text standing in front of the operator, whichever way that text got there.
Four statements, each read from a different source -- the text alone, the registered capabilities' input schemas, nothing at all, and those capabilities' output schemas.
And the one bound around all four: which act, and only which act, any of them may stand in the place of.

## Notes
The connector-filterable capability list this area already holds is what two of these statements are read from; no second read of the capability registry is added.
The policy that an observation carries only the output-schema fields its responseMap reaches is what the coverage statement cites rather than what any task here delivers, so it is not claimed by this epic.
