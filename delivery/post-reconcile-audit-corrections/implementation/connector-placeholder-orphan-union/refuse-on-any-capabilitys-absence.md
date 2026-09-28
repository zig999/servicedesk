---
target: backend
title: Orphaned-connector-placeholder check refuses on any capability's absence
summary: Rewrites the connector-configuration registration's orphaned-placeholder computation from an
  intersection over every currently-registered capability's own orphaned set to a union, so a placeholder
  absent from any one capability sharing the connector is refused.
task: sha256:c51fa02ff0046536e11118bcbd13773a5f1ab84ad6569b4b40dcea3b18bfb750
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-placeholder-orphan-union-refuse-on-any-capabilitys-absence-build-2
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: Replaced orphanedAcrossEveryCapability (intersection -- a placeholder counted as orphaned only
    when absent from every registered capability's input schema) with orphanedAcrossAnyCapability, which
    unions each capability's own orphaned-placeholder set so a placeholder absent from any one capability
    sharing the connector's name is reported; the empty-capabilities short-circuit to no orphans is unchanged,
    and each orphaned entry still pairs the placeholder with the full capabilities array sharing the connector,
    declaring or not. Updated the sole call site in the private refuseOrphanedPlaceholders method to the
    renamed function.
criteria:
- criterion: Registering a connector configuration against a connector with two currently-registered capabilities,
    where a placeholder naming a Subject attribute is present in one capability's input schema properties
    and absent from the other's, is refused.
  met: true
  how: orphanedAcrossAnyCapability iterates every capability sharing the connector and adds a placeholder
    to the orphaned set the moment it is absent from any one capability's own orphanedPlaceholders() result,
    regardless of whether another capability declares it; refuseOrphanedPlaceholders throws ConnectorPlaceholderOutsideInputSchemaError
    whenever that set is non-empty.
- criterion: Registering a connector configuration whose every placeholder naming a Subject attribute
    is present in every currently-registered capability sharing that connector succeeds.
  met: true
  how: When every capability's own orphanedPlaceholders() call returns empty for every placeholder, the
    union set stays empty, orphaned.length is 0, and refuseOrphanedPlaceholders returns without throwing.
- criterion: Registering a connector configuration against a connector with no capability currently registered
    against it succeeds.
  met: true
  how: The capabilities array passed in is already filtered to the connector's own name by refuseOrphanedPlaceholders
    before the call; orphanedAcrossAnyCapability's capabilities.length === 0 guard returns [] immediately,
    unchanged from before this task.
- criterion: Registering a connector configuration whose placeholder names the requester or a credential,
    present or absent from any capability's input schema, is not refused on that account.
  met: true
  how: orphanedPlaceholders (unchanged by this task) filters configuration text through subjectAttributePlaceholderNamesIn
    before comparing against a schema's declared properties, so a requester or credential placeholder
    is never a candidate the union or the old intersection ever considered.
nodes:
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: The rule's first clause refuses a connector-configuration registration whose own text names a Subject
    attribute absent from "the properties the input schema of a capability currently registered against
    that connector's name declares" -- read, per the task's ADVISORY note and the decision log it cites,
    as any one such capability. orphanedAcrossAnyCapability now refuses on that any-one-capability reading
    instead of the prior all-of-them reading. The rule's second clause (a capability registration refused
    by an already-held connector configuration's embedded placeholder) reaches no criterion of this task
    and is left as it stood, per the task's REMAINDER note.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: The scenario's single-capability, single-orphaned-placeholder case is the base case this fix keeps
    correct (a placeholder absent from the one registered capability's properties is still refused, and
    the refusal still names the placeholder and pairs it with the capabilities sharing the connector)
    while generalizing the multi-capability case to match the rule's any-one-capability reading.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: The domain service's stated Responsibility -- refuse a registration whose own text embeds a placeholder
    naming a Subject attribute a capability already registered against that connector's name does not
    declare -- is carried out by registerConnector calling refuseOrphanedPlaceholders, now computing that
    refusal by the union rather than the intersection.
inferences:
- inferred: Each orphaned entry still pairs the placeholder with the full array of capabilities sharing
    the connector (declaring capabilities included, not only the failing ones), unchanged from the prior
    implementation.
  from: The task's UNDERDETERMINED note, which states this exact pairing is a pass condition still open
    elsewhere (rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder, not
    claimed by this task) and instructs leaving it as is.
- inferred: The rewritten function is renamed from orphanedAcrossEveryCapability to orphanedAcrossAnyCapability
    rather than kept under its old name with new behavior.
  from: MNT-03 and the project's own naming convention (CON-01) -- a function whose name states an intersection
    but performs a union misleads the next reader more than a rename costs; no node or criterion names
    the function's identifier, so this is a naming decision internal to the file the task already touches.
preserved:
- The capabilities.length === 0 short-circuit (criterion 3 and the "no capability at all" test case),
  unchanged.
- The requester/credential placeholder exemption implemented in orphanedPlaceholders/subjectAttributePlaceholderNamesIn,
  unchanged.
- The shape of ConnectorPlaceholderOutsideInputSchemaError and OrphanedPlaceholder, and the pairing of
  every orphaned entry with the full capabilities-sharing-the-connector array, unchanged.
- Every other ConnectorConfigurationRegistryService operation (removeConnector, readConnectorConfiguration,
  readConnectorConfigurationOrThrow, listConnectorConfigurations, readRegisteredCapabilities) and the
  well-formedness/registration-completeness checks in heldConfiguration, untouched.
deferred:
- what: The existing unit test "succeeds when at least one capability registered against the connector
    declares the placeholder attribute, even though another fails to" (src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts)
    asserted the intersection semantics this task reverses.
  why: Rewriting that assertion is the test-author's, in this same task's proof step -- this delivery
    rewrote the very file the assertion covers, so the test is this delivery's to answer rather than a
    proof-only re-delivery over another task.
---

## What it is

Rewrites the connector-configuration registration's orphaned-placeholder check from an intersection over every currently-registered capability sharing a connector to a union, so a placeholder absent from any one of them is refused rather than only one absent from all of them.

## Notes

The first build attempt (run/connector-placeholder-orphan-union-refuse-on-any-capabilitys-absence-build) failed its test-unit step against the pre-existing test named under `deferred` above, which encoded the old intersection semantics; cause: code, on a test this delivery's own file made obsolete, not a defect in the source above. That test was rewritten whole in this task's own proof step, per the reasoning the suite step's own contract gives for a test whose owning file this delivery rewrote, and the build run named above (`-build-2`) is the one taken after that rewrite, with no change to the source between attempts.
