---
title: Connector configuration OpenAPI draft, frontend half
summary: The Configuration Helper section on the connector configuration authoring
  and editing surface -- the request it makes to the published draft operation, the
  disclosure of the draft that operation answers, the apply into the Configuration
  field's own local edit, and the confirmation that keeps an unsubmitted edit from
  being overwritten.
rationale: One epic, because the scope delivers one section on one surface answering
  one slice of the specification -- the three surface rules and their grounding scenario
  -- and every task here changes the same shared form component and consumes the same
  published operation; splitting the request, the disclosure and the apply into separate
  epics would put one deliverable and one specification slice under separate groupings.
sources:
- intake/frontend-scope.md
covers:
- contracts/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
- domain/integration/connector-configuration-draft-generated-credential
- domain/integration/connector-configuration-draft-method-mismatch
- domain/integration/connector-configuration
- constraints/the-openapi-document-is-fetched-by-the-backend
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
- rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
---

## What it is

The frontend half of the connector-configuration-openapi-draft capability: the Configuration Helper section an operator authors or edits a connector configuration from.
It consumes the published draft-connector-configuration-from-openapi operation, discloses the draft that operation answers, and applies it to the Configuration field's own local edit.
It registers nothing: no task here issues a register-connector call, and no task here fetches an OpenAPI document.

## Notes

constraints/the-openapi-document-is-fetched-by-the-backend is covered here rather than by the backend epic's own claim on it, because its fitness is a network-call audit over the frontend module and the backend epic's http-surface task recorded that clause as a remainder.
The three surface rules and the confirmation scenario are covered here as this epic's own slice; the backend epic covers the same four nodes and declares each of them uncovered with its why.
The remainder of the impact set is not claimed by this epic: the draft-generation rules, the document-side refusals and the draft's capability reference are the backend epic's, and rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface contributes only the already-delivered dialog form the scope points the confirmation at.
