---
title: Connector test panel placeholder attributes
summary: The connector test panel's Add attribute button reconciling its rows against
  the subject-attribute placeholders Configuration's own text currently holds, plus
  the shared parsing module and the prop route that behavior depends on.
sources:
- intake/scope.md
covers:
- contracts/integration/connector-diagnostics
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- domain/glossary/subject-attribute
- domain/investigation/subject-attribute-value
- domain/integration/connector-configuration
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/integration/capability
- domain/integration/connector-configuration-registry
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
uncovered:
- node: contracts/integration/connector-diagnostics
  why: The test-connector operation's own dispatch is unchanged; this plan only changes
    how attribute rows are populated in the panel before that operation is invoked.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: Capability lookup, the not-registered refusal and the connector-mismatch refusal
    for the test action are untouched; this plan changes only the attribute-row population
    step that precedes dispatch.
- node: domain/integration/capability
  why: No task reads a capability's own input_schema; the button derives attribute
    names by parsing Configuration's placeholder tokens directly, never a capability's
    declared schema.
- node: domain/integration/connector-configuration-registry
  why: No registration or edit of a connector configuration happens in this scope;
    the button only reads the Configuration text already held, never writes it.
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  why: This rule governs masking a resolved credential in the diagnostic response;
    this scope changes only the request-side attribute rows shown before dispatch,
    never the response.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  why: This scenario is about a connector-configuration registration write being refused;
    this scope never registers or edits a connector configuration, so no task exercises
    this refusal.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: Its statement governs connector-configuration/capability registration-time and
    edit-time refusal for a placeholder naming an attribute absent from a capability's
    input schema; every task in this epic is frontend UI behavior that reads
    Configuration's already-registered text and reconciles panel rows against it, never
    registers or edits a connector configuration or a capability, so no task exercises
    this rule's own refusal. The Description's aside distinguishing a Subject-attribute
    placeholder from a requester or credential placeholder is restated, more precisely,
    by rules/integration/an-http-connector-configuration-declares-its-call's own literal
    placeholder grammar, which the tasks below do implement.
---

## What it is
The Add attribute button on the connector test panel changing from "append one empty row" to "reconcile the panel's rows against every subject-attribute placeholder currently present in Configuration's own text".
The shared parsing primitives this reconciliation needs, extracted from the case-simulation feature's own already-proven module into a feature-neutral one.
The Configuration text itself, routed from the one production view that already holds it live down to the panel's own hook.

## Notes
None.
