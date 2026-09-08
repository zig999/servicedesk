---
title: Connector configuration OpenAPI draft, backend half
summary: The published draft-connector-configuration-from-openapi operation and everything
  behind it -- the document fetch and its refusal, the OpenAPI 3.x reading and its
  refusal, subject-placeholder resolution against a registered capability, credential-placeholder
  generation, the method comparison against what is registered, and the draft value
  the operation answers with.
rationale: The scope states one initiative -- the backend half of one capability --
  and every node it claims is answered by one operation and the reads that operation
  performs, so one epic holds the whole of it; splitting it would put the fetch, the
  reading and the resolution under separate groupings that share one deliverable and
  one specification slice.
sources:
- intake/scope.md
covers:
- contracts/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
- domain/integration/connector-configuration-draft-generated-credential
- domain/integration/connector-configuration-draft-method-mismatch
- domain/integration/capability
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-draft-response-carries-no-capability
- rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
- rules/integration/an-unfetchable-openapi-link-refuses-the-draft
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
- rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap
- rules/integration/a-connector-configuration-draft-registers-nothing
- rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
- rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
- rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- constraints/the-domain-depends-on-no-infrastructure
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
- scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
- scenarios/integration/a-swagger-2-document-refuses-the-draft
- scenarios/integration/a-mismatched-parameter-name-stays-unresolved
- scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
- scenarios/integration/an-api-key-scheme-becomes-a-generated-credential
- scenarios/integration/a-drafts-method-mismatches-what-is-registered
- scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/a-malformed-request-is-refused-with-a-validation-error
uncovered:
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  why: The rule governs a frontend authoring surface's own offer of a helper, and
    this epic delivers only the backend operation such a surface would call; the scope
    places that surface in a separate later initiative, so no task here writes a screen.
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  why: Applying a draft happens on the frontend authoring surface's local edit, and
    nothing in this epic applies a draft -- the operation answers a draft and stops
    there, so there is no local edit in this plan for the rule to hold.
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  why: The confirmation this rule requires is a frontend interaction over an unsaved
    edit, a state no backend node in this epic holds; it is covered here only because
    it constrains domain/integration/connector-configuration, which this epic's method
    comparison reads.
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  why: The scenario's subject is the frontend confirmation rule left uncovered above,
    and its given, when and then all sit on the authoring surface this epic does not
    deliver.
---

## What it is

The backend half of the connector-configuration-openapi-draft capability, from the operator-named document link through to the draft the published operation answers with.
It delivers one read: an OpenAPI document is fetched and read, one of its operations is turned into as much of a connector configuration as can be honestly resolved, and everything that could not be resolved is disclosed by name and reason.
It registers nothing, and it stops at the HTTP answer.

## Notes

The three frontend Configuration Helper rules and the confirmation scenario are covered here only so the epic reconciles honestly against nodes that constrain domain/integration/connector-configuration, and each is declared uncovered with its own why.
domain/integration/capability and domain/integration/connector-configuration are covered because two of this epic's scenarios name them under involves and the draft reads both live; nothing in this epic changes either model.
