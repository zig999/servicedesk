---
title: Request a draft from the published operation
summary: The apiFetch-backed call from the authoring surface to draft-connector-configuration-from-openapi, and the outcome union that carries either the draft it answered or one stated failure back to the surface.
rationale: I cut the call away from the section that offers it because a task changing an interface and its consumers in one breath is two tasks -- this task's seam is the published operation's request and response, and the section's seam is the shared form component.
sources:
  - intake/frontend-scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-operation-http-surface
objective: A draft requested with a connector name, an OpenAPI document link and one named operation reaches the published draft-connector-configuration-from-openapi operation and is exposed to the surface as either the draft that operation answered or one classified failure the surface can state to the operator.
criteria:
  - A dispatched request names the connector the surface holds, the operator-supplied OpenAPI document link, and the operation's own path and HTTP method, in the body the published operation's route declares.
  - A dispatched request goes to the route of the published draft-connector-configuration-from-openapi operation and to no other route.
  - An answered draft is exposed with its connector, its configuration text, its unresolved list, its generated credentials and its method mismatch where one stands, each read from the response body without renaming, re-casing or reordering.
  - An answered draft whose unresolved list or generated credentials came back empty is exposed with that list empty rather than absent.
  - An answered draft is never exposed with a capability name, version or count, whatever the response body carries.
  - A request refused with OpenApiDocumentNotFetchedError is exposed as a failure distinguishable from the other two refusals, carrying the fetch-failure kind and the link the response named.
  - A request refused with OpenApiDocumentNotReadableError is exposed as a failure distinguishable from the other two refusals.
  - A request refused with OpenApiOperationNotFoundError is exposed as a failure distinguishable from the other two refusals, carrying the path and method the response named.
  - A request refused with none of those three error values is exposed as a failure distinguishable from all three named ones.
  - No failure exposed for a refused request carries any part of a draft.
  - No module of this request path issues a request to the operator-supplied OpenAPI document link, and nothing it calls does.
  - Requesting a draft issues no register-connector call and invokes neither screen's save mutation.
implements:
  - constraints/the-openapi-document-is-fetched-by-the-backend
  - contracts/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-generated-credential
  - domain/integration/connector-configuration-draft-method-mismatch
  - domain/integration/connector-configuration-draft-unresolved-item
  - rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  - rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
---

## What it is

The one place the frontend speaks to the published draft operation.
It is a read: it sends what the operator named and hands back what the operation answered.

## Notes

The dependency edge on the backend task is my decision and not the scope's: the criteria above name the published operation's own route and response body, and I chose to have them falsifiable against that route rather than against a stand-in this plan does not hold, over the alternative cut of unit-testing a mocked apiFetch alone.
domain/integration/connector-configuration-draft states that a draft is generated for one connector name, and the surface being authored or edited holds that name in its Connector field. The impact set states nothing about a draft requested from a surface whose Connector field holds no name.
The tree's own shape for a registers-nothing one-off POST is a bare apiFetch-backed useMutation with no queryKey, a hand-mapped outcome union, mutation.reset() before each dispatch and an isDispatchingRef guard, at frontend/app/src/hooks/use-test-connector-panel.ts.
UNDERDETERMINED, from the specification — the outcome union may legitimately drop the status code an OpenApiDocumentNotFetchedError names alongside status-outside-2xx, since the criterion only requires the kind and the link; if a later surface needs to state that status, this task's union must carry it.
UNDERDETERMINED, from the specification — no criterion bounds what the outcome union holds before the operation answers, so an implementation could default to an unrecognised-failure state while in flight; rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator forbids stating any refusal of a request the operation has not answered. Implementation: the outcome union's initial/pending state must be its own variant, distinct from every refusal variant.
UNDERDETERMINED, from the specification — no criterion here protects the Configuration field's own local content from being touched by this request path; rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator requires it stand exactly as it stood across every refusal reading. Implementation: this hook never writes to ConfigurationFieldState.
REMAINDER, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper's own offer clause (rendering the helper, taking the link and operation input) reaches no criterion here. Belongs to the task that places the Configuration Helper beneath the Configuration field.
REMAINDER, from the specification — rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator's operator-facing half (stating "no draft was generated", the three conditions apart from one another, the unrecognised-failure reading) reaches no criterion here, which stops at exposing one classified failure. Belongs to the task that renders the Configuration Helper's statement of a refused draft request.
ADVISORY, from the specification — domain/integration/connector-configuration-draft-unresolved-reason and domain/integration/connector-configuration are read as neighbouring rather than governing here; the reason value is passed through as an attribute, and no criterion turns on what a registered connector configuration is.
