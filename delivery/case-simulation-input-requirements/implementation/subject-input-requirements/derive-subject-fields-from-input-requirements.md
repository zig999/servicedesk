---
title: Derive the Subject region's fields from the case-input-requirements read
summary: useSimulationSubject and simulation-subject-derivation.ts now derive one editable field per case-input-requirement
  (attribute, required flag, and every currently-registered asking capability's own connector/input_schema)
  instead of scanning connector configuration text for ${subject:<name>} placeholders.
task: sha256:79810f483971ce178ef5040e6388a4400dc06f3b47d03c9bdd4ebcb3e575dcc9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-derive-and-present-build-5
files:
- path: src/services/simulation-subject-derivation.ts
  effect: Exports a new deriveSubjectFields({requirements, capabilities}) that maps every CaseInputRequirement
    to one DerivedSubjectField {attribute, required, capabilities}, resolving each requirement's own asking-capability
    references to the currently-registered Capability sharing its exact {name, version} identity (resolvedCapabilitiesFor),
    and annotating only the matches found with that capability's own connector and input_schema (as free
    text). deriveRequiredFields and collectionPlanFromManifest, and their private helpers capabilityForConcept/configurationForConnector,
    are removed entirely. subjectPlaceholderNamesInConfiguration and the private helpers it composes are
    kept byte-for-byte in behavior, unchanged, since hooks/use-test-connector-panel.ts still imports subjectPlaceholderNamesInConfiguration.
    The file's own header comment and every function-level comment are rewritten so none states the placeholder
    scan as the basis of the Subject field set; the header now says explicitly that the scan is kept only
    for its other caller.
- path: src/hooks/use-simulation-subject.ts
  effect: 'useSimulationSubject now takes (source: SimulationSubjectSource, slug: string, version: number)
    and composes useCaseInputRequirements(slug, version) and useCapabilities() instead of useConnectorConfigurations();
    its field set comes from deriveSubjectFields(requirements, capabilities). isLoadingRegistries/isRegistriesError
    now report exactly those two composed reads. SimulationSubjectSource no longer carries a manifest
    field (nothing in this file reads it once collectionPlanFromManifest is gone). isReady''s own formula,
    mergedAttributes, the curator-added-attribute state and the MNT-04 row-id minting are all left exactly
    as they were.'
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: Its one call site, useSimulationSubject(subjectSource), now passes slug and version (useSimulationSubject(subjectSource,
    slug, version)) -- the same slug/version this function already threads into useSimulateHypothesis(slug,
    version) -- and subjectSource's object literal no longer sets manifest. A one-comment, two-argument
    follow-on made necessary by the signature change above; no other logic in this file was touched.
criteria:
- criterion: One editable field is exposed per requirement the read names, required and optional alike.
  met: true
  how: deriveSubjectFields maps every entry of `requirements` (useCaseInputRequirements' own unfiltered
    read) to exactly one DerivedSubjectField, with no filter by `required` anywhere in the walk.
- criterion: Each exposed field carries its own requirement's required flag through unchanged.
  met: true
  how: 'deriveSubjectFields sets `required: requirement.required` directly, with no transformation.'
- criterion: An exposed field whose requirement names a capability present in the capabilities useCapabilities()
    has already composed, matched by that capability's own name-and-version identity, names that capability's
    connector.
  met: true
  how: 'resolvedCapabilitiesFor finds each requirement.capabilities[i] against `capabilities` by capability.name
    === reference.name && capability.version === reference.version, and for every match pushes {name,
    version, connector: match.connector, inputSchemaHint: match.input_schema} into the field''s own `capabilities`
    array -- every match, not only the first, honoring this task''s own UNDERDETERMINED note that a multiply-asked
    attribute must name every asker.'
- criterion: An exposed field that resolves to a capability among those useCapabilities() has already
    composed carries that same capability's input_schema through as free text, never parsed or validated
    as structured data.
  met: true
  how: The same push in resolvedCapabilitiesFor carries `match.input_schema` straight into `inputSchemaHint`
    with no JSON.parse or schema check anywhere in the walk.
- criterion: A requirement naming a capability the capabilities useCapabilities() has already composed
    do not currently hold is exposed as a field all the same.
  met: true
  how: deriveSubjectFields maps every requirement unconditionally; resolvedCapabilitiesFor returning an
    empty array for an unmatched reference does not remove the field, only leaves its `capabilities` list
    without that entry.
- criterion: No connector value and no input-schema hint is invented for an exposed field whose requirement
    resolves to no capability among those useCapabilities() has already composed.
  met: true
  how: resolvedCapabilitiesFor only ever pushes an entry built from an actual `match` found by find();
    an unmatched reference is skipped entirely, never contributing a partial entry with a placeholder
    connector or hint.
- criterion: An attribute the read names required that no connector configuration's own call embeds as
    a placeholder is exposed as a field.
  met: true
  how: The derivation no longer reads connector configuration text at all -- the field set comes straight
    from `requirements`, so an attribute is exposed purely because the case-input-requirements read names
    it, independent of any connector's own literal call text.
- criterion: No field in the exposed set is derived from a ${subject:<name>} placeholder read out of connector
    configuration text.
  met: true
  how: deriveSubjectFields never calls subjectPlaceholderNamesInConfiguration or any of its private helpers;
    that scan is retained in the same file solely for use-test-connector-panel.ts.
- criterion: The field set is derived for the case slug and version the cockpit pins, and a change to
    that pinned identity changes the set derived.
  met: true
  how: useSimulationSubject calls useCaseInputRequirements(slug, version), whose own query key is ["case-input-requirements",
    slug, version]; use-case-simulation-cockpit.ts threads its own pinned slug/version straight into useSimulationSubject's
    new parameters.
- criterion: The hook's own loading and error state reports the reads it now composes and no longer the
    connector-configuration read.
  met: true
  how: isLoadingRegistries = isLoadingCaseInputRequirements || isLoadingCapabilities and isRegistriesError
    = isCaseInputRequirementsError || isCapabilitiesError; useConnectorConfigurations is not imported
    or called anywhere in this file.
- criterion: deriveRequiredFields and collectionPlanFromManifest are gone from the tree rather than left
    as exports with no caller.
  met: true
  how: Both functions, and their now-orphaned private helpers capabilityForConcept/configurationForConnector,
    are deleted from simulation-subject-derivation.ts; a grep over frontend/app/src confirms no remaining
    reference outside comments and the pre-existing spec files this task does not touch.
- criterion: subjectPlaceholderNamesInConfiguration remains in place for use-test-connector-panel.ts,
    its other consumer.
  met: true
  how: The function and its private helper chain are unchanged byte-for-byte in behavior and still exported;
    use-test-connector-panel.ts's own import and its two call sites are untouched.
- criterion: No comment left in this path states the connector-placeholder scan as the basis of this hook's
    field set.
  met: true
  how: Every header and function comment in both files was rewritten for this task; the new header of
    simulation-subject-derivation.ts states the opposite explicitly.
nodes:
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  - src/hooks/use-simulation-subject.ts
  how: 'DerivedSubjectField mirrors this node''s own shape exactly (attribute, required, and every asking
    capability, never fewer than what the read names): a requirement''s own capabilities array is resolved
    to registered Capability entries by identity alone, restating none of a capability''s own declared
    facts beyond connector/input_schema, and an asking capability this derivation cannot currently find
    contributes nothing invented.'
- node: domain/integration/capability
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  how: resolvedCapabilitiesFor reads a matched capability's own connector and input_schema fields, verbatim
    and unparsed, and none of its other six declared fields (name/version aside, used only for the match
    itself); this task does not read or restate nature, output_schema, timeout or concept.
- node: contracts/knowledge/case-input-requirements
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: useSimulationSubject consumes the already-delivered useCaseInputRequirements(slug, version) hook's
    own `requirements` field as its whole authoritative source; `capabilitiesWithMalformedInputSchema`,
    the read's own second field, is deliberately left unread here -- REMAINDER, belongs to the sibling
    task disclosing malformed capabilities.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  - src/hooks/use-simulation-subject.ts
  how: One field per requirement, required and optional alike, each carrying its own required flag unchanged
    and naming every currently-registered asking capability this derivation finds, by name+version+connector
    together. This rule's own gating clause is REMAINDER per this task's own Notes and untouched here.
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  - src/services/simulation-subject-derivation.ts
  how: Because the field set now comes straight from the case-input-requirements read rather than from
    scanning any connector's own call text, an attribute like this scenario's own user_id -- required,
    but never literally embedded as a placeholder in any resolved connector's own configuration -- is
    still presented as a required input.
inferences:
- inferred: An unmatched capability reference contributes nothing to that field's own capabilities array,
    rather than a partial entry carrying bare identity with no connector.
  from: criterion 6's 'no connector value and no input-schema hint is invented', read together with the
    task's own UNDERDETERMINED note that a connector must always be named together with its own capability
    identity, never bare.
- inferred: slug/version are threaded into useSimulationSubject as two additional positional parameters
    after `source`, mirroring useSimulateHypothesis(slug, version)'s own plain-positional-argument convention.
  from: use-case-simulation-cockpit.ts's own established threading pattern.
- inferred: SimulationSubjectSource's manifest field is removed entirely rather than left present-but-unread,
    and its one construction site is updated in the same edit that adds slug/version.
  from: collectionPlanFromManifest's removal leaves nothing in useSimulationSubject to read manifest for.
preserved:
- mergedAttributes' own tie-break (a curator-added row overriding a derived field's own value for the
  same attribute name) -- untouched.
- isReady's own formula (requester non-empty, every requiredFields entry non-empty, subject.attributes
  non-empty) -- untouched, per this task's own dispatch-gating boundary.
- The MNT-04 stable-id keying for curator-added rows -- untouched.
- D7's one-shared-subject/readiness guarantee -- useSimulationSubject is still called exactly once, and
  its subject/requester still feed both onSimulateCase and onSimulateHypothesis unchanged.
- subjectPlaceholderNamesInConfiguration's own behavior for use-test-connector-panel.ts -- untouched,
  byte-for-byte.
deferred:
- what: case-simulation-subject-panel.tsx reads field.connector, field.capability.{name,version} and field.inputSchemaHint,
    none of which exist on the new field shape -- this file fails to typecheck until its rendering is
    updated.
  why: the task's own instructions name the panel's rendering as a sibling task's responsibility.
- what: isReady's own gating still evaluates every entry of requiredFields, which now also includes a
    requirement this read names optional, rather than gating only on entries whose required flag is true.
  why: this task's own Notes assign the rule's gating clause explicitly to the sibling task that gates
    the simulate-case/simulate-hypothesis dispatch on the composed fields.
- what: use-test-connector-panel.ts's own header comment on reconcileAttributeRows still cites deriveRequiredFields
    by name as the source of the first-wins-dedup convention it mirrors; that function no longer exists
    in the tree.
  why: the file sits outside this task's own target file set.
---

## What it is
The replacement of the Subject region's derivation source: the field set now comes from the case version's own derived requirements, and the capability registry read is kept only for the annotation the response deliberately does not repeat.

## Notes
None.
