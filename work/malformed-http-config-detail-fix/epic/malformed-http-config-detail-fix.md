---
title: Malformed HTTP connector configuration detail fix
summary: 'A corrective increment: unavailableFor discards the malformed-configuration vocabulary its own
  error already computed.'
covers:
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/the-domain-depends-on-no-infrastructure
- contracts/integration/concept-observation
- contracts/integration/corporate-records-source
- contracts/investigation/observation-source
- contracts/system/corporate-records
- domain/integration/capability
- domain/investigation/evidence-result
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/an-unclassified-status-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- rules/investigation/collection-has-its-own-budget-within-the-total
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/no-stage-aborts-on-its-deadline
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
uncovered:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: contracts/integration/concept-observation
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: contracts/integration/corporate-records-source
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: contracts/investigation/observation-source
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: contracts/system/corporate-records
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: domain/integration/capability
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: domain/investigation/evidence-result
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/an-unreachable-connector-ends-unavailable
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: The trace's --encodes claim for http-declarative-observation-source.adapter.ts binds this node
    because the file participates in the observation source it governs; this correction touches only unavailableFor's
    handling of MalformedHttpConnectorConfigurationError's result_detail, not the behavior any of these
    nodes state.
---

## What it is

A corrective increment: `unavailableFor` in `src/investigation/http-declarative-observation-source.adapter.ts`
discards `MalformedHttpConnectorConfigurationError`'s own `context.problems`, so `result_detail`
states only the error's class name instead of also stating the vocabulary the malformed key was
held to.

## Notes

`covers` is seeded mechanically from `trace.py --encodes src src/investigation/http-declarative-observation-source.adapter.ts`,
per the corrective-increment route, with one addition:
`rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary` is
added by hand because its own statement is exactly what this correction answers to, and the trace
currently binds that node only to a frontend file (`frontend/app/src/services/connector-configuration-http-departures.ts`)
-- a pre-existing gap in this file's own binding, not something `--encodes` could surface. Every
other node the mechanical seed returned is declared in `uncovered` with a why, since this
correction reaches only one function's result_detail enrichment.
