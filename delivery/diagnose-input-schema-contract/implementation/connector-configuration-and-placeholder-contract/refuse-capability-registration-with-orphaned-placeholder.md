---
title: Refuse register-capability when its connector already holds an orphaning configuration
summary: registerCapability now refuses a capability registration whose named connector already
  holds a registered configuration embedding a Subject-attribute placeholder this registration's
  own input_schema properties does not declare, raising the same typed 422 error the reciprocal
  register-connector refusal already raises, naming every orphaned placeholder together with the
  capability being registered.
task: sha256:3f6394367db0e94ee744de85a654300cf1fe79c687ab2ecef3f48063d6e138d4
files:
- path: src/capability-registry/capability-registry.service.ts
  effect: registerCapability now calls a new private refuseOrphanedPlaceholders(capability) step
    right after heldCapability's own sync contract/well-formedness/read-only checks and before the
    store is ever read, reading every connector configuration currently registered through
    readRegisteredConnectorConfigurations, filtering to the ones naming this capability's own
    connector, and throwing ConnectorPlaceholderOutsideInputSchemaError over whatever the new
    module-level orphanedAcrossEveryConfiguration helper names as orphaned. That helper unions each
    filtered configuration's own orphanedPlaceholders answer (deduplicated by placeholder name) and
    pairs each surviving name with the one registering capability, named by connector and
    input_schema exactly as RegisteredCapabilityForPlaceholderCheck already shapes it — the same
    OrphanedPlaceholder type the reciprocal register-connector refusal already raises. An empty
    filtered list (a connector holding no registered configuration) answers no orphaned placeholder
    at all, so registerCapability proceeds unchanged. Also updates registerCapability's own
    doc-comment to name this refusal alongside the ones it already documented.
criteria:
- criterion: Registering a capability naming a connector that already holds a registered
    configuration whose call text embeds a Subject-attribute placeholder this registration's own
    input-schema properties does not declare is refused with an HTTP 422 response reporting
    ConnectorPlaceholderOutsideInputSchemaError.
  met: true
  how: refuseOrphanedPlaceholders reads every connector configuration registered against this
    registration's own connector and throws ConnectorPlaceholderOutsideInputSchemaError before any
    write once orphanedAcrossEveryConfiguration names at least one placeholder the registration's
    own input_schema properties does not declare; status-map.ts (already wired by the reciprocal
    sibling task) maps that same error class to HTTP 422.
- criterion: The refusal names every such orphaned placeholder together with the capability being
    registered.
  met: true
  how: orphanedAcrossEveryConfiguration's answer is one { placeholder, capabilities } entry per
    distinct orphaned placeholder name — union across every registered configuration for the
    connector, deduplicated — each paired with a one-element capabilities array holding the one
    registering capability, named by its own connector and input_schema; every orphaned placeholder
    a single registration surfaces is named together in one thrown error.
- criterion: Registering the same capability succeeds when its own input-schema properties
    declares the placeholder's attribute.
  met: true
  how: orphanedPlaceholders (reused unmodified from connector-registry/connector-placeholder-declaration-check.ts)
    filters a configuration's embedded placeholders against declaredInputSchemaShape's own reading
    of this registration's own input_schema; once its properties declares the attribute the name is
    absent from every configuration's own orphaned answer, the union stays empty, and
    refuseOrphanedPlaceholders throws nothing.
- criterion: Registering a capability naming a connector that holds no registered configuration is
    not refused by this check.
  met: true
  how: refuseOrphanedPlaceholders filters readRegisteredConnectorConfigurations()'s answer down to
    configurations naming this capability's own connector; an empty filtered list makes
    orphanedAcrossEveryConfiguration's loop never execute, so it answers no orphaned placeholder and
    the refusal never throws.
nodes:
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  how: this task implements the rule's second clause — the capability-registration direction —
    refusing a registration whose named connector already holds a configuration embedding a
    placeholder this registration's own input schema properties does not declare, with every
    orphaned placeholder named together with the capability that fails to declare it. The
    connector-configuration-registration direction was already delivered by the sibling task
    refuse-connector-registration-with-orphaned-placeholder and is untouched here.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/capability
  how: honored, not re-declared — refuseOrphanedPlaceholders reads the registering capability's
    own connector and input_schema attributes, both already required and validated by
    heldCapability before this check ever runs, to find which registered configurations to
    reconcile against and what to check them with; the element's own shape is unchanged.
- node: domain/integration/capability-registry
  how: the Responsibility's own "names a connector whose registered configuration already embeds a
    placeholder its own input schema does not declare" clause is exactly what
    refuseOrphanedPlaceholders now enforces inside registerCapability, before any write.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/connector-configuration
  how: honored, not re-declared — the check reads a currently held configuration's own text
    exactly as this element states it is held (opaque JSON object text) through the
    IConnectorConfigurationsReader port a prior sibling task already built, extracting embedded
    placeholders without changing how a connector configuration is authored, replaced or held.
- node: domain/integration/connector-configuration-registry
  how: honored, not re-declared — this task only reads that registry's current state through its
    own narrow reader; the registry's own register-connector responsibility and refusal pipeline
    are untouched here, having already been extended by the reciprocal sibling task.
- node: contracts/integration/capability-registry
  how: register-capability, the published operation this contract declares, now also carries this
    refusal — surfaced as the same HTTP 422 error envelope every other typed refusal on this
    surface already uses, through the status-map.ts entry the reciprocal sibling task already
    added for the same error class.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
inferences:
- inferred: the check iterates over every currently-registered connector configuration whose
    connector matches this registration's own connector, rather than assuming the filtered list
    holds at most one entry.
  from: IConnectorConfigurationsReader's own port states no uniqueness guarantee on what it
    answers, and the task's own wording ("for each one ... orphaned across ANY registered
    configuration for that connector") reads as a reconciliation over however many the reader
    answers, even though domain/integration/connector-configuration's own replace-whole-on-edit
    invariant means ordinary operation holds at most one configuration per connector name.
- inferred: refuseOrphanedPlaceholders runs immediately after heldCapability's own sync checks and
    before the store is ever read, ahead of the existing concept-uniqueness refusal
    (refuseAnsweredConcept) rather than after it.
  from: the inventory's own evidenced ordered-pipeline convention (contract-completeness, then
    well-formedness, then any semantic refusal) and the reciprocal register-connector task's own
    identical placement of its own orphaned-placeholder check right after its own sync shape check
    and before any store read.
- inferred: the registering capability is named in the refusal's context.orphaned by exactly the
    {connector, input_schema} shape RegisteredCapabilityForPlaceholderCheck already carries, in a
    one-element capabilities array, rather than widening OrphanedPlaceholder or adding a new field
    for a single-capability case.
  from: the connector-configurations reader port's own header comment ("that port carries no wider
    identity ... for this registry to name a capability by"), applied symmetrically here, and the
    task's own explicit instruction to follow the existing error class's established shape rather
    than invent a new one.
preserved:
- registerCapability's existing refusal order — contract completeness, malformed schema,
  malformed input-schema shape, the read-only-nature check, and the concept-already-answered
  check — runs unchanged, in the same relative order, around the new check.
- registerCapability constructed with the default (no) connector-configurations reader — every
  pre-existing single-argument construction of this class, including its own test suite and every
  other composition root with no use for this capacity — keeps succeeding regardless of any
  placeholder any configuration would embed, since the default answers an empty list.
- readRegisteredConnectorConfigurations keeps answering exactly what the injected reader answers,
  unchanged in signature and behavior, for every other consumer.
- registerConnector's own refuseOrphanedPlaceholders (the reciprocal direction, delivered by the
  sibling task refuse-connector-registration-with-orphaned-placeholder) is untouched.
---

## What it is
registerCapability now refuses a capability registration whose named connector already holds a registered configuration embedding a placeholder this registration's own input-schema properties does not declare.

## Notes
None.
