---
title: Connector configuration, call assembly, and the placeholder reconciliation
summary: The connector-configuration registry, the HTTP connector's call assembly
  and degrade behavior, and the two-point placeholder-declared-by-its-capability reconciliation
  across both registries.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
covers:
- domain/integration/capability
- domain/integration/capability-registry
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- domain/investigation/evidence
- domain/investigation/evidence-result
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- contracts/integration/capability-registry
- contracts/integration/connector-configuration-registry
- contracts/integration/connector-diagnostics
- contracts/integration/concept-observation
- contracts/investigation/observation-source
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
uncovered:
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: The test action's own preconditions and refusals (404 capability-not-registered,
    409 connector-mismatch) already stand; this plan only adds a diagnostic report
    alongside them, never altering this rule's own statement.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: The well-formed-JSON-object refusal for a connector configuration's own text
    is unchanged by this increment.
- node: rules/integration/a-connector-configuration-names-its-connector
  why: The connector-name-required refusal is unchanged by this increment.
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  why: Credential masking on the diagnostic response is unrelated to how a call is
    assembled or degraded, and this increment does not touch it.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: Normalization to the glossary vocabulary is unrelated to call assembly or degrade,
    and unchanged by this increment.
- node: domain/investigation/evidence
  why: The evidence shape carries no new field; this plan only widens when its existing
    result and result_detail apply.
- node: domain/investigation/evidence-result
  why: '''unavailable'' already exists as a value; this plan applies it to circumstances
    that previously propagated as an unhandled exception, without changing the enumeration.'
rationale: 'This epic groups everything that answers for a connector configuration''s
  own registration, its call assembly at observation time, and the reconciliation
  between a connector''s placeholders and a capability''s declared properties — including
  the capability-registration side of that same reconciliation, since it is the same
  rule read from the other registry. domain/integration/capability, domain/integration/capability-registry
  and contracts/integration/capability-registry overlap with the capability-input-schema-contract
  epic deliberately: the capability-registration-side refusal this reconciliation
  adds sits in the same registry the other epic already covers.'
---

## What it is
The connector-configuration registry's registration refusal pipeline.
The HTTP connector's call assembly, and the fix that degrades every one of its typed assembly failures to an 'unavailable' evidence result instead of an unhandled exception.
The two-point reconciliation: a connector configuration's placeholder must be declared by some capability's input-schema properties, checked at either registration, and reported (never refused) when a connector configuration is tested through its capability.

## Notes
None.
