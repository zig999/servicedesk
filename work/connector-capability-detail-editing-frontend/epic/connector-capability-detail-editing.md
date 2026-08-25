---
title: Connector configuration and capability detail/edit routes
summary: Replaces the connector-configuration and capability popup edit dialogs with dedicated, directly-loadable detail/edit routes, isDirty-gated saving, discard, save acknowledgement, JSON pretty-printing, and a warning for already-invalid stored JSON.
rationale: The scope states desired end-state screen behavior, not a task or epic cut; one epic was chosen because both routes share one convention (phase-shape hook, form.watch isDirty, isSubmittingRef, JSON-field-outside-react-hook-form comparison) and one JSON-textarea fix, so splitting them into separate epics would only duplicate the same covers/uncovered accounting twice. Several nodes in the given impact set are claimed but left uncovered because their invariant is enforced by backend domain-service or registry code this frontend plan does not write, or because they describe a different, untouched consumer.
covers:
  - domain/integration/capability
  - domain/integration/connector-configuration
  - contracts/integration/capability-registry
  - contracts/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - rules/integration/a-capability-declares-well-formed-schemas
  - domain/integration/capability-nature
  - domain/integration/capability-registry
  - domain/integration/connector-configuration-registry
  - contracts/integration/connector-diagnostics
  - contracts/knowledge/capability-check
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - rules/integration/one-capability-answers-one-concept
  - domain/glossary/concept
  - constraints/no-route-enforces-authentication
uncovered:
  - node: domain/integration/capability-nature
    why: The nature field's Select UI and its read-only invariant are already rendered by capability-form-fields.tsx and reused unchanged; this plan adds no new nature-related behavior.
  - node: domain/integration/capability-registry
    why: Registration and concept-resolution invariants are backend domain-service logic; this frontend plan calls register-capability and read-capability only through the published contract and implements none of the registry's own enforcement.
  - node: domain/integration/connector-configuration-registry
    why: Replace-whole-on-edit and registration-refusal invariants are backend domain-service logic; this frontend plan calls register-connector and read-connector-configuration only through the published contract.
  - node: contracts/integration/connector-diagnostics
    why: ConnectorTestPanel, which exercises test-connector, is folded into the new connector-configuration route unchanged; this plan changes no test-connector behavior.
  - node: contracts/knowledge/capability-check
    why: This contract describes the knowledge context's own consumption of read-capability for contract checking, a different consumer than this admin UI; this plan touches no behavior of that consumer.
  - node: rules/integration/a-capability-declares-its-contract
    why: capability-form-fields.tsx already requires and renders every declared contract attribute; this plan folds it into a new route unchanged and adds no new attribute-completeness behavior.
  - node: rules/integration/a-capability-is-read-only
    why: Enforcement of the read-only invariant happens at the registry on register-capability; this plan changes no client-side nature validation.
  - node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    why: This policy is already implemented by the existing ConnectorTestPanel, which this plan folds into the new route unchanged.
  - node: rules/integration/one-capability-answers-one-concept
    why: Concept resolution is a registry-internal policy; this plan's screens display and edit a capability's declared concept field but implement no resolution logic.
  - node: domain/glossary/concept
    why: The concept field is rendered by the existing, unchanged capability-form-fields.tsx; this plan adds no new concept-selection or validation behavior.
  - node: constraints/no-route-enforces-authentication
    why: This constraint's fitness function binds the backend service's API layer; the new routes added here are client-side routing, not backend routes, so nothing in this plan bears on it.
sources:
  - intake/scope.md
---

## What it is

This epic replaces the popup Dialog for editing an existing connector configuration with a dedicated, directly-loadable route, and does the same for capabilities.
It covers the isDirty gating, discard affordance, save acknowledgement, JSON pretty-printing, and already-invalid-JSON warning the scope asks for on both routes.
It covers the two edited aggregates and the published contracts the new routes consume, and leaves the backend registries' own enforcement and two untouched, unrelated contracts explicitly uncovered.

## Notes

The backend fix for connector configuration (returned as a JSON string rather than an object) and the new by-(name, version) capability read route both belong to the sibling connector-capability-detail-editing-backend plan; this epic's tasks are cut as if those land, and each affected task's own notes say so.
