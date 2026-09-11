---
title: Offer the operations as a choice, not as two text fields
summary: ConnectorConfigurationHelperFields renders the offered operations through the Select control the app already has and renders no typed field for a path or a method.
objective: The Configuration Helper's fields offer the read operations as a selectable choice of path-and-method entries and carry no free-text field for an operation path or an operation method.
criteria:
  - The component renders a Select whose options are the entries the state offers, one option per entry.
  - An option's label states both the entry's path and the entry's method.
  - Choosing an option calls the state's operation choice with that entry.
  - The component renders no input accepting typed text for an operation path.
  - The component renders no input accepting typed text for an operation method.
  - Where the state offers no entries, no path or method value can be supplied through the component at all.
  - The OpenAPI document link field and the draft request control remain rendered on the same surface as before.
  - connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts build their hand-written state literal from the state shape this task leaves, and both suites pass.
depends_on:
  - task/connector-configuration-helper-operation-listing/helper-operation-choice-state
implements:
  - domain/integration/openapi-operation
  - domain/integration/openapi-document-operations
  - rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  - rules/integration/an-openapi-operations-method-is-upper-cased
  - rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
sources:
  - work/connector-configuration-helper-operation-listing-frontend/intake/scope.md
---

## What it is

The two Operation path and Operation method Inputs are replaced by one Select over the offered entries, wrapped the way connector-test-panel-fields.tsx and capability-form-fields.tsx already wrap Select.
After this task an operator can no longer type a path or a method into the helper at all.
The draft-application behaviour the apply spec covers is untouched.

## Notes

The Select control taking options, value and onChange already exists at @tui/ui/select and is not introduced here.
UNDERDETERMINED, from the specification — rules/integration/an-openapi-operations-method-is-upper-cased requires the listed method to be upper-cased whatever case the fetched document's path-item key used; no criterion demands the rendered option label's method be upper-cased, only that it state "the entry's method". A Select whose option labels interpolate the entry's method verbatim as the state holds it satisfies every criterion as written even if that value were not upper-cased.
ADVISORY, from the specification — no candidate states what the Configuration Helper discloses to the operator when the fetched document is read successfully but declares no operations at all; criterion 6 holds only that no path or method value can be supplied in that case. What, if anything, the surface tells the operator there is a seam left open.
REMAINDER, from the specification — the final clause of rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing's statement ("the draft request the helper then issues names the chosen pair's own path and its own method") and the then-steps of scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing are answered by the sibling task helper-operation-choice-state, not here.
REMAINDER, from the specification — the opening condition of the same rule (the helper offers the pairs once its named document link is fetched and parses as OpenAPI 3.x) reaches no criterion: nothing here states what is rendered before the read answers or when the read is refused. Belongs to: the task that wires the helper state's read of the document's operations and the task disclosing its refusals.
REMAINDER, from the specification — the second clause of rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper's statement ("requesting a draft issues no register-connector call") reaches no criterion of this task, which only holds the link field and the draft request control to remain rendered. Belongs to: the already-delivered task implementing the helper's draft request itself.
REMAINDER, from the specification — the four backend candidates (contracts/integration/openapi-document-operations' operation, rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read, rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document) and scenarios/integration/a-swagger-2-document-refuses-the-operations-read govern the backend read, not this component. Belongs to: the task implementing the backend read-openapi-document-operations operation and its two refusals.
REMAINDER, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend's fitness audits the frontend module for a direct fetch of the document's own URL; this component issues no fetch, so the constraint is answered where the read call is wired. Belongs to: the task that wires the Configuration Helper's state to the backend operations read.
