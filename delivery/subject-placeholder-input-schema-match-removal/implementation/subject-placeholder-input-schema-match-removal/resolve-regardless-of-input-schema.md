---
target: backend
title: Subject placeholder resolution drops the input_schema name match
summary: outcomeFor() in subject-placeholder-resolution.ts now resolves any candidate name to a ${subject:<name>}
  placeholder whenever at least one capability is registered for the connector, and the retired no-matching-input-schema-property
  reason is gone from both the resolver and the closed reason enumeration.
task: sha256:09deff1c08a7dc90e7db52518e3cb435b3fd365743ca70782893d759c1fa2853
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/resolve-regardless-of-input-schema-build
files:
- path: src/connector-registry/subject-placeholder-resolution.ts
  effect: outcomeFor() now returns a resolved ${subject:<name>} outcome for any name whenever the connector
    has at least one capability registered, and no-capability-registered otherwise; no longer inspects
    any capability's input_schema properties. The now-unused declaredInputSchemaShape import and the NO_MATCHING_INPUT_SCHEMA_PROPERTY
    constant are removed.
- path: src/connector-registry/connector-configuration-draft.ts
  effect: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS now holds the three-value closed set the domain
    node states (no-capability-registered, security-scheme-not-reducible-to-a-credential, drafted-key-occupied-by-another-security-scheme);
    'no-matching-input-schema-property' is no longer a member of ConnectorConfigurationDraftUnresolvedReason.
criteria:
- criterion: A parameter or request-body field name absent from every input schema of every capability
    currently registered against the connector still resolves as ${subject:<name>} in the draft's configuration,
    where at least one capability is registered for that connector.
  met: true
  how: outcomeFor() no longer reads any capability's input_schema at all; whenever registered.length >
    0 it returns a resolved outcome with value `${subject:<name>}` regardless of what any registered capability
    declares.
- criterion: No draft names a field in its unresolved list with reason no-matching-input-schema-property.
  met: true
  how: outcomeFor() has no code path left that produces that reason, and the value itself no longer exists
    in ConnectorConfigurationDraftUnresolvedReason's closed set, so no caller can construct an unresolved
    item carrying it.
- criterion: A connector configuration draft still refuses to resolve any candidate name, with reason
    no-capability-registered, where no capability is currently registered for that connector.
  met: true
  how: 'outcomeFor() still returns { resolved:false, reason: no-capability-registered } as its first branch
    when registered.length === 0, unchanged from before, and unresolvedItems() still collects every such
    outcome into the draft''s unresolved list.'
nodes:
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: unresolvedItems() still names each unresolved parameter or request-body field by its exact OpenAPI
    name paired with its one reason; this task changed only which reasons occur, not the item's shape,
    which was already conformant.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/subject-placeholder-resolution.ts
  how: the closed set in connector-configuration-draft.ts now matches the node's three enumerated values
    exactly, and outcomeFor() in subject-placeholder-resolution.ts only ever produces no-capability-registered
    from this file's own logic.
- node: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: outcomeFor() now tests only whether the set of capabilities registered for the connector is non-empty,
    exactly the rule's stated condition, and no longer tests whether any registered capability's input
    schema names the candidate.
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: 'unchanged by this task: when registered is empty every candidate name still resolves to { resolved:false,
    reason: no-capability-registered } and the draft still generates rather than refuses.'
- node: scenarios/integration/a-mismatched-parameter-name-resolves-regardless
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: a name like customerId now resolves to ${subject:customerId} the moment erp-http has any capability
    registered, whether or not that capability's input schema names customerId or the differently-spelled
    customer_id.
inferences:
- inferred: the retired string 'no-matching-input-schema-property' should be removed outright from CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS
    (the type's closed set), not merely left unproduced by outcomeFor().
  from: domain/integration/connector-configuration-draft-unresolved-reason's enumeration node lists exactly
    three values today and no longer lists this one; the type is where that domain fact's closed set lives
    in source, so leaving a fourth, now-meaningless string in it would mismatch the node it encodes.
preserved:
- outcomeFor() still returns no-capability-registered, unchanged, for every candidate name when no capability
  is registered for the connector
- 'distinctNames(), positionValue(), unresolvedItems(), substitutedPath(), recordFor()/recordForNames(),
  headersWithCookie() and cookieHeaderValue() are untouched: path/query/header/cookie/body placement,
  the Cookie header''s ''; ''-joined multi-parameter form, and a name occupying two positions resolving
  or refusing identically at both positions all continue exactly as before'
- resolveSubjectPlaceholders() still propagates a failure the injected capabilitiesReader raises rather
  than swallowing it
- RegisteredCapabilityForPlaceholderCheck's input_schema field is untouched and still read by connector-placeholder-declaration-check.ts
  and connector-configuration-registry.service.ts for the separate a-connector-placeholder-is-declared-by-its-capability
  refusal, which this task does not touch
---

## What it is

Removes the exact input_schema name-match requirement from `outcomeFor()` in
`subject-placeholder-resolution.ts`, and shrinks the closed reason vocabulary in
`connector-configuration-draft.ts` to the three values the revised specification now enumerates.

## Notes

Inferred that CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS should drop the retired value outright rather than leave it unproduced — the type is where the closed set lives in source, and a fourth unreachable string in it would mismatch the domain node it encodes.
