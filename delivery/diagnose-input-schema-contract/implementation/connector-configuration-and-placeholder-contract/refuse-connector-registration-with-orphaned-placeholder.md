---
title: Refuse register-connector when a placeholder escapes every capability's properties
summary: registerConnector now refuses a connector-configuration registration or edit whose call text
  embeds a Subject-attribute placeholder that no capability currently registered against that connector's
  name declares in its input schema properties, raising a new typed 422 error naming every orphaned placeholder
  together with the capabilities that fail to declare it.
task: sha256:2cb2d37a53c391464e995ec7c5f9df84d8d6cf28bf5f568fd8ec06ab5f90fe28
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-refuse-connector-registration-with-orphaned-placeholder-build
files:
- path: src/errors/connector-placeholder-outside-input-schema.error.ts
  effect: new typed domain error ConnectorPlaceholderOutsideInputSchemaError, carrying context.orphaned
    as an array of { placeholder, capabilities } — one entry per Subject-attribute placeholder a connector
    configuration embeds that no capability registered against its connector declares, paired with every
    one of those capabilities (by connector and input_schema); also exports the OrphanedPlaceholder type.
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: registerConnector now calls a new private refuseOrphanedPlaceholders(configuration) step, after
    heldConfiguration's own completeness/well-formedness checks and before any store write, for both a
    new registration and an edit. It reads every capability through capabilitiesReader.readRegisteredCapabilities(),
    filters to those naming the connector being configured, and intersects each capability's own orphanedPlaceholders
    answer via orphanedAcrossEveryCapability — a placeholder survives only when every one of those capabilities
    fails to declare it — throwing ConnectorPlaceholderOutsideInputSchemaError over whatever survives.
    An empty filtered list answers no orphaned placeholder, so the write proceeds.
- path: src/errors/status-map.ts
  effect: STATUS_BY_ERROR_CLASS now maps ConnectorPlaceholderOutsideInputSchemaError to 422; the header
    narrative updated to include it.
- path: src/http/register-connector.controller.ts
  effect: doc-comment-only update naming the new error alongside the two refusals already documented as
    propagating unchanged; no behavior change.
criteria:
- criterion: Registering a connector configuration whose call text embeds a placeholder naming a Subject
    attribute that no capability currently registered against that connector's name declares in properties
    is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
  met: true
  how: registerConnector's new refuseOrphanedPlaceholders step throws ConnectorPlaceholderOutsideInputSchemaError
    before any write once orphanedAcrossEveryCapability names at least one placeholder no capability declares;
    status-map.ts maps that class to 422.
- criterion: The refusal names every such orphaned placeholder together with the capability that fails
    to declare it.
  met: true
  how: ConnectorPlaceholderOutsideInputSchemaError's context.orphaned carries one { placeholder, capabilities
    } entry per orphaned placeholder, with capabilities holding every capability that fails to declare
    it; every orphaned placeholder in one registration is named together.
- criterion: Registering the same connector configuration when at least one capability currently registered
    against that connector's name declares the placeholder's attribute in properties succeeds.
  met: true
  how: orphanedAcrossEveryCapability intersects each capability's own orphanedPlaceholders answer; a placeholder
    that at least one capability declares is absent from that capability's own orphaned set and never
    survives the intersection.
- criterion: A placeholder naming the requester or a credential is never checked against any capability's
    properties by this refusal.
  met: true
  how: the check runs entirely through orphanedPlaceholders, which extracts candidates via subjectAttributePlaceholderNamesIn
    — a walk that names only Subject-attribute placeholders and never a requester or credential one.
- criterion: Editing an existing connector configuration is held to the same refusal as registering a
    new one.
  met: true
  how: registerConnector is the one operation for both creating and replacing a connector configuration
    whole; refuseOrphanedPlaceholders runs unconditionally before the replace-by-identity write, with
    no branch distinguishing a new connector name from one already registered.
nodes:
- node: domain/integration/capability
  how: honored, not encoded here — refuseOrphanedPlaceholders reads a capability's own connector and input_schema
    attributes to find which capabilities are registered against the connector, without redeclaring the
    element.
- node: domain/integration/connector-configuration
  how: honored — the refusal reads the registration's own held configuration text (JSON object text) to
    extract embedded placeholders, without changing how a connector configuration is authored or held.
- node: domain/integration/connector-configuration-registry
  how: the Responsibility's second clause — a registration refused when its own text embeds a placeholder
    a capability already registered against that connector's name does not declare — is exactly what refuseOrphanedPlaceholders
    now enforces before any write.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: contracts/integration/connector-configuration-registry
  how: register-connector's published operation now also carries this refusal, surfaced as the same HTTP
    422 envelope every other typed refusal on this surface already uses.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/register-connector.controller.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  how: this task implements only the connector-configuration-registration direction of the rule — a registration
    or edit refused when its text embeds a placeholder no capability currently registered against its
    connector declares, with every orphaned placeholder named together with the capabilities that fail
    to declare it. The capability-registration direction is a REMAINDER left to the sibling task refuse-capability-registration-with-orphaned-placeholder.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/connector-placeholder-outside-input-schema.error.ts
  - src/errors/status-map.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  how: cited only for its placeholder-kind vocabulary (Subject attribute vs. requester vs. credential),
    reused unchanged through subjectAttributePlaceholderNamesIn. Every other clause is a REMAINDER left
    to task/connector-configuration-and-placeholder-contract/degrade-unresolved-connector-call-to-unavailable.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  how: reproduced directly — a capability naming connector erp-http whose input schema properties hold
    only contract_number, and an erp-http connector configuration registered with a call embedding a placeholder
    naming customer_document, is refused, naming customer_document as a placeholder the capability naming
    erp-http does not declare.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/connector-placeholder-outside-input-schema.error.ts
inferences:
- inferred: a capability that fails to declare an orphaned placeholder is named in the refusal by the
    identity RegisteredCapabilityForPlaceholderCheck already carries — connector and input_schema — rather
    than by a wider identity (name, version) added to that port.
  from: that port's shape was already fixed by the dependency task build-placeholder-declaration-check,
    already delivered; and the scenario's own then-clause names the failing capability by its connector,
    never by name or version.
- inferred: a placeholder is orphaned only when it is not declared by any capability currently registered
    against the connector — computed as the intersection of each capability's own orphanedPlaceholders
    answer — rather than being refused the moment any single capability fails to declare it.
  from: the task's own objective, explicit that a placeholder must be declared by at least one of them
    to not be orphaned.
- inferred: a connector no capability currently names is never refused over this check at all — the check
    is skipped entirely rather than running against an empty capability list.
  from: domain/integration/connector-configuration-registry's own Responsibility, which conditions the
    refusal on a capability already registered against that connector's name, and the rule's own Description,
    which states configuring a connector before any capability names it stays possible.
- inferred: the orphaned-placeholder refusal runs after heldConfiguration's own completeness and well-formedness
    checks, and before the store read/write, rather than interleaved with either.
  from: the inventory's own evidenced convention (contract-completeness first, then well-formedness, then
    any semantic refusal).
preserved:
- registerConnector constructed with the default (no) capabilities reader keeps succeeding regardless
  of any placeholder the configuration embeds, since the default answers an empty capability list.
- the existing completeness refusal (IncompleteConnectorConfigurationError) and well-formedness refusal
  (ConnectorConfigurationNotWellFormedError), and the replace-whole-by-connector-identity holding, are
  unchanged and still run, in the same order, ahead of this new check.
- readRegisteredCapabilities keeps answering exactly what the injected reader answers, defaulting to the
  empty array and propagating a reader's own failure unchanged.
deferred:
- what: the capability-registration direction of rules/integration/a-connector-placeholder-is-declared-by-its-capability.
  why: it is a separate entry point (register-capability) with its own already-cut task, task/connector-configuration-and-placeholder-contract/refuse-capability-registration-with-orphaned-placeholder.
- what: an-http-connector-configuration-declares-its-call's own clauses beyond the placeholder-kind vocabulary.
  why: they belong to observation-time call assembly, not connector-configuration registration; task/connector-configuration-and-placeholder-contract/degrade-unresolved-connector-call-to-unavailable
    covers that ground.
---

## What it is
registerConnector now refuses a connector-configuration registration or edit whose call text embeds a Subject-attribute placeholder that no capability currently registered against that connector's name declares in its input schema properties, raising a new typed 422 error naming every orphaned placeholder together with the capabilities that fail to declare it.

## Notes
None.
