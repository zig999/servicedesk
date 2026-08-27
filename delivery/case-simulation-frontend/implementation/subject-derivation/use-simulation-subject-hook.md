---
title: use-simulation-subject hook
summary: A pure derivation service module plus a new hooks/use-simulation-subject.ts that resolves a case
  version's collection plan through the capability and connector-configuration registries into required
  subject fields, merges them with curator-added attributes and the requester, and reports readiness.
task: sha256:886f8745477e32e77b7d7345ca25efc19049617916b18f873b8e7e8afd114059
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-derivation-use-simulation-subject-hook-build-3
files:
- path: src/services/simulation-subject-derivation.ts
  effect: New pure module. Exports collectionPlanFromManifest (domain/knowledge/case-version's collection-plan
    operation, mirrored from the backend's own case-resolution.ts::collectionPlan — sort manifest entries
    by position, flatMap hypothesis_revision.collects, Set-dedupe), deriveRequiredFields (walks the collection
    plan's concepts, resolves each to the capability currently registered to answer it and that capability's
    declared connector, resolves each connector's own registered configuration, and returns one DerivedSubjectField
    per distinct `${subject:<attribute>}` placeholder found across that configuration's address/query/headers/body,
    annotated with connector, capability {name, version} and the capability's input_schema as a free-text
    hint — deduplicated globally, first-asker-wins), and the exported subjectPlaceholderNamesInConfiguration
    used to scan one connector configuration's own JSON text.
- path: src/hooks/use-simulation-subject.ts
  effect: 'New hook, useSimulationSubject(version: SimulationSubjectSource). Composes useCapabilities()
    and useConnectorConfigurations() (must_not_duplicate), memoizes deriveRequiredFields''s output against
    [version.manifest, capabilities, connectorConfigurations], and holds local component state for each
    required field''s own current value, the requester, and curator-added attribute rows (reusing use-test-connector-panel.ts''s
    own SubjectAttributeRow/SubjectAttributeValue shape). Returns requiredFields (each with value/onChange),
    requester/onRequesterChange, addedAttributes with add/remove/change handlers, the assembled subject
    ({type, attributes}), isReady, and isLoadingRegistries/isRegistriesError passed through from the two
    composed reads.'
criteria:
- criterion: For a version whose collection plan names one or more concepts, the hook resolves, for every
    concept, the capability currently registered to answer it and that capability's declared connector.
  met: true
  how: deriveRequiredFields (simulation-subject-derivation.ts) computes the collection plan via collectionPlanFromManifest,
    then for every concept in it calls capabilityForConcept (capabilities.find(c => c.concept === concept))
    and reads that capability's own .connector, resolving configurationForConnector against it — exactly
    this walk, for every concept the plan names.
- criterion: For every resolved connector whose configuration embeds one or more `${subject:<attribute>}`
    placeholders — in its address, query, headers or body — the hook returns one required field per distinct
    placeholder name, each annotated with the connector and the capability that asked for it.
  met: true
  how: subjectPlaceholderNamesInConfiguration parses the connector's own configuration JSON text and scans
    address, query, headers and body (in that order, body walked recursively for any shape) for `${subject:<attribute>}`
    tokens via the same PLACEHOLDER_PATTERN/kind-split grammar the backend's connector-request-resolver.ts
    uses, recognizing and skipping a requester or credential token rather than mistaking it for a subject
    attribute. deriveRequiredFields pushes one DerivedSubjectField per distinct attribute name (a Set-backed
    claimedAttributeNames guard), each carrying the connector name and the capability {name, version}
    that resolved to it.
- criterion: A required field's associated capability input_schema is carried through as a free-text hint,
    never parsed or validated as structured data.
  met: true
  how: DerivedSubjectField.inputSchemaHint is assigned capability.input_schema verbatim (deriveRequiredFields);
    no parsing, JSON.parse or validation is ever applied to it anywhere in either file.
- criterion: The hook accepts curator-added attributes alongside the derived ones and represents every
    attribute — derived or added — as one attribute name paired with one value, matching domain/investigation/subject-attribute-value.
  met: true
  how: useSimulationSubject exposes addedAttributes (SubjectAttributeRow[]) with onAddAttribute/onRemoveAttribute/onAttributeChange,
    mirroring use-test-connector-panel.ts's own row-editing convention. mergedAttributes builds a Map<attribute,
    value> from every required field holding a non-empty value, then every added row naming a non-empty
    attribute with a non-empty value, returning one {attribute, value} pair per distinct name — domain/investigation/subject-attribute-value's
    own shape exactly, never duplicated.
- criterion: The hook's reported readiness is false while the requester or any derived required field
    is empty, and true only once every derived required field and the requester hold a non-empty value.
  met: true
  how: isReady = requester.trim() !== "" && requiredFields.every(f => f.value.trim() !== "") && subject.attributes.length
    > 0 (use-simulation-subject.ts). The first two conjuncts are exactly this criterion; the third is
    criterion 6, layered on top without weakening this one (when at least one required field exists and
    all hold non-empty values, subject.attributes.length is already >= 1, so the third conjunct never
    blocks a case this criterion alone would call ready).
- criterion: The hook's reported readiness never turns true for a subject holding zero attribute-values,
    even for a version whose collection plan derives no required field and to which the curator has added
    none, satisfying rules/investigation/a-subject-carries-at-least-one-attribute.
  met: true
  how: 'The `subject.attributes.length > 0` conjunct in isReady is exactly this: with zero derived required
    fields, requiredFields.every(...) holds vacuously, so without this conjunct readiness would incorrectly
    turn true on an empty subject the moment the requester is filled. With it, isReady stays false until
    at least one attribute-value exists — from a filled required field or a curator-added row.'
- criterion: The same derived subject and readiness are exposed identically whether the caller intends
    a full-case run or a single-hypothesis run — one subject, shared, per D7.
  met: true
  how: useSimulationSubject holds one instance of subject/isReady state per hook call and exposes no per-run-kind
    branching or parameter of its own; a screen composing it once and passing the same returned subject/isReady
    into both a full-case dispatch and a per-hypothesis dispatch (built by this epic's sibling tasks,
    outside this task's own candidate set) is what keeps the two runs reading the identical subject and
    readiness — this hook does nothing that could make them diverge.
nodes:
- node: domain/investigation/subject
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: 'SimulationSubject = {type: string, attributes: readonly SubjectAttributeValue[]} mirrors this
    value-object''s own two required attributes exactly; the hook assembles one instance per version from
    version.subject (the case-version''s own declared subject type, read through unchanged) and the merged
    attribute-value list.'
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: mergedAttributes returns {attribute, value} pairs — reusing use-test-connector-panel.ts's own SubjectAttributeValue
    type rather than redeclaring it — one governed attribute name paired with one free value, never two
    arrays kept in step.
- node: domain/glossary/subject-attribute
  how: Every attribute name this derivation produces or accepts (a placeholder's own argument, or a curator-added
    row's own typed name) is held and passed through as a plain string, matching this vocabulary's own
    single `name` attribute; the hook creates no structured shape around it and performs no glossary lookup
    of its own, honoring the vocabulary's shape without holding a membership check that belongs to a-subject-attribute-is-drawn-from-the-glossary
    (below) instead.
- node: domain/integration/capability
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  how: capabilityForConcept resolves a capability by its own declared concept (via the already-established
    useCapabilities() read, reused rather than re-fetched); deriveRequiredFields reads that capability's
    own connector, name, version and input_schema in full — every field this derivation needs of the eight
    this aggregate declares.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  how: configurationForConnector resolves one configuration by its own connector name (acknowledging,
    per this node's own Description, that the name may resolve to nothing — handled by contributing no
    required fields rather than inventing a resolution); subjectPlaceholderNamesInConfiguration reads
    .configuration as opaque JSON object text, parsed only far enough to read address/query/headers/body,
    never assuming any further structure this node does not itself declare.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  how: 'subjectPlaceholderNamesInConfiguration and its helpers implement exactly the placeholder half
    of this rule''s statement: a `${kind[:argument]}` token may sit inside address, query, headers or
    body; a "subject" kind names a required field, while a "requester" or "credential" kind (or any other)
    is recognized and skipped rather than misread. This is the resolved reading the task''s own Notes
    describe (the earlier BLOCKING conflict over address-only vs. all-four fields) — the derivation reads
    all four, matching this rule''s now-widened statement.'
- node: domain/knowledge/case-version
  encoded_at:
  - src/services/simulation-subject-derivation.ts
  - src/hooks/use-simulation-subject.ts
  how: collectionPlanFromManifest reimplements this aggregate's own collection-plan operation client-side
    ("the deduplicated union of every manifested revision's collects") from CaseVersionManifestEntry.hypothesis_revision.collects,
    sorted by each entry's own declared position — this task's own inference, below, since CaseVersionRecord
    exposes no separate collectionPlan field. SimulationSubjectSource narrows a version's read to exactly
    the two declared attributes (subject, manifest) this derivation needs.
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: isReady's `subject.attributes.length > 0` conjunct is this invariant, checked client-side before
    readiness (and therefore the ability to simulate) ever turns true — criterion 6.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  how: 'This hook performs no glossary-membership check of its own over any attribute name (derived or
    curator-added) — the same posture use-test-connector-panel.ts''s own established precedent already
    takes for its own hand-typed attribute rows. A derived name is never invented here: it is read verbatim
    out of a connector configuration whose registration this rule''s own consistency is eventual over,
    and a curator-added name is free text exactly as that existing precedent already allows. The delivery
    does not reach an enforcement of this policy; it honors the rule by adding no path that would let
    an ungoverned name reach a dispatch this hook itself performs (it performs none).'
- node: contracts/integration/capability-registry
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: Composes useCapabilities() (GET /v1/capabilities, list-capabilities) rather than re-implementing
    the read — the registry's own synchronous surface is reused whole, exactly as this task's own instructions
    and the inventory's must_not_duplicate require.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: Composes useConnectorConfigurations() (GET /v1/connectors, list-connector-configurations) the same
    way, for the same reason.
- node: contracts/knowledge/case-query
  how: This hook does not itself call read-case/list-case-versions; it accepts an already-resolved SimulationSubjectSource
    (subject, manifest) as a plain input, deliberately narrowed from CaseVersionRecord (case-version-record.ts),
    the shape this app's own existing read-case consumers (use-case-attributes-at-a-glance.ts) already
    establish. The delivery honors this contract by consuming its already-published response shape rather
    than adding a second reader of it; the actual GET call is left to the screen/ready-view this epic's
    sibling tasks build.
inferences:
- inferred: The version's collection plan is computed client-side, in this hook's own derivation module,
    as the deduplicated union of every manifest entry's hypothesis_revision.collects (sorted by position)
    — never read from a new `collectionPlan` field — rather than widening CaseVersionRecord/CaseVersionManifestEntry
    to carry one.
  from: The inventory's own risk entry naming this exact gap; domain/knowledge/case-version's own Responsibility
    text ("the collection plan is the deduplicated union of every manifested revision's collects"); and
    the backend's own case-resolution.ts::collectionPlan, read to confirm it performs precisely this same
    sort-flatMap-dedupe walk over the same field this app's case-version-record.ts already carries.
- inferred: Where two different connectors both name the same subject-attribute placeholder, the required
    field keeps the connector/capability annotation of whichever resolved first, in the collection plan's
    own declared concept order, then address before query before headers before body within one connector's
    own configuration (in each object's own key order) — never a second entry for the same attribute name,
    and never an invented ranking of its own.
  from: Criterion 2's own "one required field per distinct placeholder name" states the deduplication
    but names no tie-break for two different askers; the order chosen is the collection plan's own declared
    precedence (rules/knowledge/hypotheses-are-ordered-by-precedence), the only ordering any node here
    actually states.
- inferred: A connector configuration whose own registered text does not parse as a well-formed JSON object
    contributes zero placeholder names rather than throwing or surfacing an error state.
  from: domain/integration/connector-configuration's own Description states registration already holds
    every configuration to well-formedness (a-connector-configuration-holds-a-well-formed-object); this
    is a defensive read against that already-guaranteed invariant, so one connector's own malformed text
    (were the guarantee ever to fail) does not fail this derivation for every other connector this hook
    also needs to read.
- inferred: A concept with no capability currently registered to answer it, or a capability whose connector
    names no configuration currently registered, contributes zero required fields from that step of the
    walk, silently, rather than surfacing a distinct state of its own.
  from: domain/integration/connector-configuration's own Description ("nothing enforces that the name
    resolves to a configuration that exists") and capability-registry's own singular "the capability currently
    registered to answer a concept" — both name resolution as something that may find nothing, without
    stating what a caller should do about it; this derivation treats an unresolved step as contributing
    nothing further, the only behavior a pure mapping can have over an absent key without inventing one.
- inferred: A curator-added attribute row whose typed name equals an already-derived required field's
    own attribute name overrides that field's currently typed value in the assembled subject, rather than
    the two coexisting as two entries or the added row being silently dropped.
  from: Criterion 4's own "one attribute name paired with one value" forbids the former; no criterion
    or node states a tie-break of its own for this exact collision, so mergedAttributes resolves it deterministically
    (added rows applied after required fields) rather than leaving the outcome to object key order alone.
- inferred: SimulationSubjectSource narrows the version input to exactly {subject, manifest} rather than
    accepting the whole CaseVersionRecord.
  from: use-capabilities.ts's own header comment names the same narrowing convention (contrasted there
    against ConceptOption, which does narrow) as this app's established practice for a read this broad;
    this hook needs neither title, when_to_use, fallback nor consolidation_register.
- inferred: isLoadingRegistries and isRegistriesError, pass-through flags over the two composed registry
    reads' own isLoading/isError, are exposed on the hook's return even though no stated criterion names
    them.
  from: use-test-connector-panel.ts's own established convention of exposing isLoadingCapabilities/isCapabilitiesError
    for the identical underlying useCapabilities() read it also composes — a downstream screen composing
    this hook will need the same signal to satisfy EDG-01/EDG-02, and exposing it here is the same shape
    of addition that existing hook already makes for its own composed read.
- inferred: useSimulationSubject takes a fully-resolved SimulationSubjectSource unconditionally (never
    `| undefined`) and holds no loading/not-yet-available branch of its own for the version argument.
  from: 'This app''s own established screen/ready-view/hooks triad (case-version-editor-screen.tsx, case-version-editor-ready-view.tsx):
    a hook composing derived version data is only ever called from the ready-view component, which mounts
    solely once the version''s own read has already resolved — the same convention useCaseAttributesAtAGlance''s
    own "ready" phase already follows.'
---

## What it is

A pure derivation module (simulation-subject-derivation.ts) walks a case version's collection plan through the capability registry to the connector-configuration registry, and reads each resolved connector configuration's address, query, headers and body for `${subject:<attribute>}` placeholders.
A new hook (use-simulation-subject.ts) composes that derivation with the already-established useCapabilities()/useConnectorConfigurations() reads, holds the required fields' own typed values, the requester and curator-added attribute rows as local state, and assembles the one subject shared by both a full-case and a single-hypothesis run per D7.
Readiness is computed from three conjuncts: the requester is non-empty, every derived required field is non-empty, and the assembled subject holds at least one attribute-value — the last conjunct is what keeps readiness false for a subject with zero required fields and no curator additions.

## Notes

The BLOCKING conflict this task's own Notes describe was already resolved before this delivery began, by a prior /reconcile and /analyse — this delivery treated it as settled and read all four of address/query/headers/body for placeholders, per the rule's now-widened statement.
domain/investigation/investigation and contracts/investigation/case-simulation are not in this task's implements and are not read as facts this delivery encodes — the task's own Notes name them only as pointers to where the requester's shape and D7's shared-subject fact are stated.
No package was added to the manifest; package.json and package-lock.json are unchanged.
