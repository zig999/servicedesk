---
title: Carry the chosen operation in the helper's state
summary: useConnectorConfigurationHelper composes the operations read over the link it already holds and turns a chosen entry into the path and method its draft request names.
objective: The helper's state carries the operations of the link currently named in it, and the entry the operator chooses is the path and the method the draft request the helper issues names.
criteria:
  - The state exposes, as the entries offered for choice, the operations read for the link currently named in the helper.
  - Naming a different link in the helper makes the offered entries those of the newly named link.
  - Choosing an offered entry makes the helper's path that entry's path.
  - Choosing an offered entry makes the helper's method that entry's method.
  - Given a read answering a document declaring /items with a get operation and a post operation, choosing the entry naming /items and POST makes the draft request the helper then issues name /items as its path and POST as its method.
  - The state exposes the operations read's own outcome as a value distinct from the draft request outcome it already exposes.
  - use-connector-configuration-helper.spec.ts's fetch stub answers the operations-read route as well as the draft route, and every assertion that file already makes about the draft request still holds.
depends_on:
  - task/connector-configuration-helper-operation-listing/openapi-document-operations-read
implements:
  - domain/integration/openapi-operation
  - domain/integration/openapi-document-operations
  - contracts/integration/openapi-document-operations
  - rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  - constraints/the-openapi-document-is-fetched-by-the-backend
  - scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
sources:
  - work/connector-configuration-helper-operation-listing-frontend/intake/scope.md
---

## What it is

The hook keeps holding the link the operator names and now passes it to the operations read.
The path and the method it composes into the draft request stop being values it was told to set and become the chosen entry's own two values.
The read's outcome is exposed beside the draft's so a consumer can state one without reading the other.

## Notes

This task adds the chosen-entry route into path and method; the free-text setters stay reachable until their last consumer is rewritten.
UNDERDETERMINED, from the specification — rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing states that the operator names one of the document's operations by choosing one of those pairs, never by typing a path or a method. No criterion of this task answers that clause: criteria 3 and 4 state only what choosing an entry makes the helper's path and method, and say nothing about the operator being unable to supply a path or a method free-hand — a helper that keeps its existing free-text path and method fields editable and merely prefills them from a chosen entry satisfies every criterion here while still letting the operator type a pairing the document never declares. The sibling task operation-choice-fields removes those free-text inputs entirely, which is where this clause is actually enforced.
UNDERDETERMINED, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend requires that no frontend module issue the fetch of the OpenAPI document's own URL. Criterion 7 requires only that the spec file's fetch stub answer the operations-read route; nothing in the criteria forces the hook's entries to actually come from that route rather than from a direct client-side fetch and parse of the operator-named link.
REMAINDER, from the specification — the final clause of rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing's statement ("the draft request the helper then issues names the chosen pair's own path and its own method") and the then-steps of scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing are demonstrated by this task's own criterion 5, so they are covered here, not left over.
REMAINDER, from the specification — the opening condition of the same rule, that the helper offers the pairs once its named document link is fetched and parses as OpenAPI 3.x, reaches no criterion: the task states what is offered once the read answers and nothing about the surface before the read answers or when it is refused. Belongs to: the tasks wiring the helper's outstanding and refused read states.
REMAINDER, from the specification — rules/integration/an-openapi-operations-method-is-upper-cased's casing transformation reaches no criterion of this task; the value is already upper-cased by the time it arrives here. Belongs to: the task implementing read-openapi-document-operations in the backend.
REMAINDER, from the specification — the fetch, parse, and refusal clauses of rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read and rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document reach no criterion here; this task only exposes the read's outcome as a distinct value. Belongs to: the task implementing the backend read-openapi-document-operations operation and its refusals, and the sibling frontend task disclosing them.
REMAINDER, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper's clauses about where the helper sits and that requesting a draft issues no register-connector call reach no criterion of this task, which governs the hook's state rather than the authoring surface. Belongs to: the already-delivered task placing the Configuration Helper on the connector configuration authoring surface.
