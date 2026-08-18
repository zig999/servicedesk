---
contract_version: siegard-reconcile/1
title: Post-closure code drift over case-management-http-api's own file set
summary: 22 files bound in the trace to specification nodes changed without a rebind across this and prior
  deliveries — the premise handed to this reconciliation is that each file's current behavior is correct
  as it stands, and the question below is whether the specification still states what each now does.
target: backend
files:
- path: src/__tests__/integration/seed.spec.ts
  change: proves seed.ts seeds the two non-conclusion outcomes, every concept and capability, and the
    curated case, idempotently on a second run against an already-seeded database.
- path: src/capability-registry/capability-query.port.ts
  change: declares ICapabilityQuery.readCapability, resolving one concept to the capability currently
    answering it.
- path: src/capability-registry/capability-registry.service.ts
  change: registers a capability held to its complete declared contract, refuses a non-read-only nature,
    and refuses a concept two held capabilities both answer.
- path: src/case/case-query.port.ts
  change: declares ICaseQuery's five read operations (readCase, listCases, listCaseVersions, listHypotheses,
    listHypothesisRevisions).
- path: src/case/case-query.service.ts
  change: implements readCase (structural parse plus coherence check on every read) and replayCase (pinned
    by identity, skipping both checks); synthesizes a file name from the slug to satisfy parseCaseDocument's
    own file-name check.
- path: src/case/case-resolution.ts
  change: resolves a case's outcome by precedence order, falling back to the case's own fallback outcome
    and referral when no hypothesis is confirmed.
- path: src/case/case-store.port.ts
  change: declares ICaseStore's storage primitives, one per case-lifecycle operation, plus the read-whole
    assembly contract.
- path: src/case/case.ts
  change: declares the Case, ManifestEntry, Referral and Resolution domain types, and exports CASE_DOCUMENT_ENDING
    ('.json') citing a since-retired storage-medium constraint.
- path: src/case/parse-case-document.ts
  change: runs every structural check a parsed case document must pass, including slugProblems, which
    still refuses a slug that does not equal the name of the file understood to hold it.
- path: src/case/revise-hypothesis.operation.ts
  change: revises a hypothesis only against its case's own draft, refusing an empty collects list, an
    unknown concept, or a concept that rejects the draft's declared subject type.
- path: src/config/env.ts
  change: declares the process env schema, DATABASE_URL among its fields, read once at startup.
- path: src/errors/case-version-not-draft.error.ts
  change: the typed refusal every write-once guard raises once a version is no longer draft.
- path: src/factories/diagnose-server.factory.ts
  change: composes the diagnose HTTP server's dependencies from one DatabaseConnection built from env.DATABASE_URL.
- path: src/fixtures/case/intermittent-connection-outage/1.json
  change: the one curated case document seed.ts and its own tests author against.
- path: src/glossary/glossary-query.port.ts
  change: declares IGlossaryQuery's term and concept reads.
- path: src/glossary/glossary-store.port.ts
  change: declares IGlossaryStore's persistence primitives, with no infrastructure import of its own.
- path: src/glossary/glossary.service.ts
  change: answers every vocabulary term and concept currently held, defaulting a concept's ttl and topping
    the outcome vocabulary up with the two non-conclusion outcomes on every read.
- path: src/http/read-case.controller.ts
  change: maps one validated read-case request to ICaseQuery.readCase and the resolved case back to the
    wire response.
- path: src/persistence/relational-case-store.repository.ts
  change: 'implements ICaseStore over the relational schema: a durable next_version counter, a hypothesis-identity-once
    insert, a never-reused revision number, a position-unique manifest, and a read-whole assembly, all
    through the schema''s own constraints.'
- path: src/persistence/relational-glossary-store.repository.ts
  change: implements IGlossaryStore, answering exactly the rows the database currently holds for each
    of the five term vocabularies and for concepts.
- path: src/seed.ts
  change: seeds outcomes first, then every concept, capability and the curated case, driving the case
    only through the published case-lifecycle operations.
- path: src/vitest-global-setup.ts
  change: applies every pending migration script to the test database once, before any test file in the
    suite runs.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'case-store.port.ts states assembleVersion "Assembles one version of a case whole: its own attributes,
    its manifest in declared-position order, and each manifest entry''s own adopted hypothesis-revision
    and its collects, in one transaction, whole or not at all (constraints/a-case-is-read-whole)"; relational-case-store.repository.ts''s
    assembleWholeVersion reads the version row then the manifest through one transaction and returns undefined
    before any manifest entry is read on absence.'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'env.ts states "Carries DATABASE_URL, the one URL this process reaches its database through (constraints/the-database-is-externally-provisioned
    ...): this schema is the one place that URL is read", and declares no host/port/service field of its
    own.'
  encoded_at:
  - src/config/env.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'case.ts, parse-case-document.ts and case-resolution.ts import only each other''s types; case-store.port.ts
    and glossary-store.port.ts declare interfaces with no driver import ("The domain declares it and infrastructure
    implements it (constraints/the-domain-depends-on-no-infrastructure): no vocabulary module opens a
    file, and no framework, driver or client is imported here").'
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/case/case-resolution.ts
  - src/case/case-store.port.ts
  - src/glossary/glossary-store.port.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: vitest-global-setup.ts's setup() runs once, before any test file, applying every pending script
    under migrations/ to the database DATABASE_URL names via applyPendingMigrations(connection, MIGRATIONS_DIRECTORY).
  encoded_at:
  - src/vitest-global-setup.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: false
  how: 'case.ts still states the opposite of what this node holds: "The ending a case''s one JSON document
    carries (constraints/a-case-is-stored-as-one-json-document) — the medium''s, not the name''s" and
    CASE_DOCUMENT_ENDING = ''.json'', naming a document medium. parse-case-document.ts repeats it: "all
    read from the one document, never from a second store (constraints/a-case-is-stored-as-one-json-document)".
    The cited constraint does not exist in knowledge/ today; the live constraint says the opposite — everything
    the system records persists in one transactional relational store, no record held in a file.'
  observed_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/factories/diagnose-server.factory.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: revise-hypothesis.operation.ts's header cites it directly; case-store.port.ts declares one storage
    primitive per every operation the contract lists (createDraft, insertHypothesisRevision, placeHypothesis,
    removeManifestEntry, updateDraft, release, discard); seed.ts drives the case only through createDraft,
    reviseHypothesis, placeHypothesis, release, in that order.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/case-store.port.ts
  - src/seed.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: case-query.port.ts's ICaseQuery declares exactly the contract's five operations — readCase, listCases,
    listCaseVersions, listHypotheses, listHypothesisRevisions — and case-query.service.ts implements each;
    read-case.controller.ts consumes readCase alone through the interface.
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/read-case.controller.ts
- node: contracts/system/case-authoring
  conforms: true
  how: case-query.service.ts cites it for the joint refusal contract ("joining a structural refusal into
    the one joint error type read-case promises (contracts/system/case-authoring)"), consistent with composing
    freely as draft and releasing only once every rule answers together.
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/glossary/action
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES maps action to 'public.actions'; case.ts's
    Referral.action is a plain string by its glossary action name.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  - src/case/case.ts
- node: domain/glossary/concept
  conforms: true
  how: glossary.service.ts's concepts() answers each name exactly once, each declaring its accepted subject
    types and its ttl in seconds, matching the concept's declared attributes exactly.
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/glossary/glossary-query.port.ts
- node: domain/glossary/outcome
  conforms: true
  how: glossary.service.ts's withNonConclusionOutcomes and NON_CONCLUSION_OUTCOMES treat outcome as a
    bare-named term; case.ts's Resolution.outcome carries it as a plain string by name, consistent with
    the value-object's sole name attribute.
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/case/case.ts
- node: domain/glossary/recipient
  conforms: true
  how: case.ts's Referral.recipient is the operational queue the referral addresses, by its glossary recipient
    name; relational-glossary-store.repository.ts's VOCABULARY_TABLES maps recipient to 'public.recipients'.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES maps subject-attribute to 'public.subject_attributes';
    seed.spec.ts asserts the seeded glossary holds exactly the fixture's own subject-attribute name.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-type
  conforms: true
  how: case.ts's Case.subject is the kind of subject the case examines, by its glossary subject-type name;
    relational-glossary-store.repository.ts's VOCABULARY_TABLES maps subject-type to 'public.subject_types'.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/integration/capability
  conforms: true
  how: capability-registry.service.ts's heldCapability constructs exactly the eight declared attributes
    — name, version, nature, input_schema, output_schema, timeout, connector, concept.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability-query.port.ts
- node: domain/integration/capability-registry
  conforms: true
  how: capability-registry.service.ts implements the registry's two operations — register-capability holding
    every registration to its declared contract, resolve-concept the one lookup from a concept to the
    capability answering it.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/knowledge/case
  conforms: true
  how: relational-case-store.repository.ts's assignNextVersion is assigned by incrementing its own durable
    counter, never MAX(version) over existing rows, matching the case identity's attributes (slug, next_version)
    and its create-draft responsibility; the fixture's own document carries a slug and every other declared
    attribute of a case version.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/case/case-store.port.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/case-version
  conforms: true
  how: case.ts's Case type declares exactly the node's attributes — version, title, when_to_use, authored_at,
    subject, fallback, consolidation_register (optional), state, released_at (optional), manifest.
  encoded_at:
  - src/case/case.ts
  - src/case/case-store.port.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: case.ts declares CASE_VERSION_STATES = ['draft', 'released'] as const, and case-store.port.ts's
    CaseVersionState mirrors the same two values, with no third state introduced anywhere.
  encoded_at:
  - src/case/case.ts
  - src/case/case-store.port.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: parse-case-document.ts's consolidationRegisterProblems refuses a declared value outside the two
    closed values (formal, plain) and treats absence as no problem; the fixture's own consolidation_register
    is "formal", one of the two closed values.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'case-store.port.ts''s HypothesisIdentity = { name: string } and relational-case-store.repository.ts''s
    hypothesisIdentityStatement match the aggregate''s sole attribute (name) and its revise operation;
    the fixture''s own manifest names two distinct hypotheses (customer-equipment-fault, area-network-outage),
    each by name alone.'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: case.ts's HypothesisRevision type declares hypothesis, revision, criterion, collects, resolution
    exactly as the node states; relational-case-store.repository.ts's tables persist that same content,
    referencing the hypothesis by (case_slug, hypothesis_name).
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: case.ts's ManifestEntry = { position, hypothesis_revision } mirrors the node's declared attribute
    and its one relationship; relational-case-store.repository.ts's case_version_hypotheses table pins
    position to (case_slug, case_version, hypothesis_name, revision).
  encoded_at:
  - src/case/case.ts
  - src/case/case-store.port.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'case.ts''s Referral type declares exactly action and recipient, both by glossary name; the fixture''s
    own fallback and each resolution''s referral carry exactly those two fields (e.g. { "action": "escalate-to-specialist",
    "recipient": "tier-two-support-queue" }).'
  encoded_at:
  - src/case/case.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/resolution
  conforms: true
  how: case.ts's Resolution type pairs outcome and referral exactly as the node declares, and relational-case-store.repository.ts's
    resolutionOf/referralColumns never construct one half without the other; the fixture's own fallback
    and every manifest entry's resolution carry both fields together.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-case-store.repository.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: seed.ts calls seedOutcomes before every other vocabulary, every concept, every capability and the
    case itself; glossary.service.ts's withNonConclusionOutcomes tops the two names up on every outcome
    read as the eventual-consistency backstop.
  encoded_at:
  - src/seed.ts
  - src/glossary/glossary.service.ts
  - src/__tests__/integration/seed.spec.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: capability-registry.service.ts's heldCapability refuses a registration that does not declare its
    contract completely, defaulting the timeout where the registration stated none.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: capability-registry.service.ts's heldCapability throws CapabilityNotReadOnlyError for any non-read-only
    nature before any write.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: capability-registry.service.ts's refuseAnsweredConcept refuses a registration naming a concept
    another held capability already answers; readCapability throws DuplicateConceptAnswerError where a
    holding answers a concept more than once.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability-query.port.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: case-query.service.ts's replayCase resolves without reading any digest over the case's content
    — slug and version alone name one content because a version is written once and never altered.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: parse-case-document.ts's manifestProblems answers a not-enough-hypothesis problem where the manifest
    is absent or empty, refusing structurally at every read; the fixture's own manifest holds two entries.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: relational-case-store.repository.ts's raiseCreateDraftFailure maps the schema's case_versions_one_draft_per_case
    unique-violation to CaseAlreadyHasDraftError.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/case/case-store.port.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: case-version-not-draft.error.ts states a released version and its manifest are never altered again,
    so each caller refuses here rather than leaving it to a schema rule; relational-case-store.repository.ts's
    updateDraftVersion enforces exactly that guard before any UPDATE.
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: relational-case-store.repository.ts's releaseStatement is the only transition, moving state from
    draft to released and recording released_at; no code path writes any third state or transitions released
    back to draft.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/case/case-store.port.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: relational-case-store.repository.ts's nextVersionUpdateStatement increments a durable counter and
    never derives a version from MAX(version) over existing rows, so a discarded draft's number is never
    reissued.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/case/case-store.port.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: glossary.service.ts's concepts() answers ttl defaulted to sixty seconds for every concept whose
    registration states none.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: revise-hypothesis.operation.ts's conceptsRefusingSubjectOf filters held concepts whose accepts
    does not include the input's subject, and refuseConceptsRefusingSubject raises ConceptRefusesSubjectTypeError
    for every one found; the fixture's own two concepts (equipment-status, network-outage-flag) are exercised
    against its declared subject (contract) throughout this codebase's own integration suite without that
    refusal firing.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: revise-hypothesis.operation.ts's refuseEmptyCollects throws HypothesisRevisionCollectsNoConceptError
    on an empty collects list; parse-case-document.ts's collectsProblems refuses the same emptiness structurally
    at read time; the fixture's own two hypotheses each collect exactly one concept, never zero.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: parse-case-document.ts's manifestEntryProblems refuses an absent, non-string or empty criterion
    for every manifested hypothesis-revision; the fixture's own two entries each declare a non-empty criterion
    string.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: revise-hypothesis.operation.ts's refuseWithoutDraft reads the case's own draft first and throws
    CaseHoldsNoDraftError where the case holds none, before any concept check or write.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/case-store.port.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: relational-case-store.repository.ts's hypothesisIdentityStatement inserts on conflict (case_slug,
    name) do nothing, never creating a second identity row for an already-held name; the fixture's own
    two hypothesis names (customer-equipment-fault, area-network-outage) are distinct.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: relational-case-store.repository.ts's raisePlaceHypothesisFailure maps a unique-violation on the
    position constraint to ManifestPositionOccupiedError.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: relational-case-store.repository.ts's revisionInsertStatement computes the new revision as one
    past the max revision scoped to (case_slug, hypothesis_name), never reusing a number that hypothesis
    has already held.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: relational-case-store.repository.ts's resolveSourceVersion falls back to the latest released version
    when none is named, and manifestCopyStatement copies that source version's manifest entry for entry
    into the new draft.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/case/case-store.port.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: The live node states bare uniqueness only, and the decision log records that file-based identity
    is deliberately unstated now that no file is the medium. Yet parse-case-document.ts's slugProblems
    still enforces the retired rule verbatim — refusing a slug that does not equal 'the name of the file
    that holds it' — and case-query.service.ts's structuralCase manufactures exactly the file name that
    check needs for a case that is never in a file. No node states this file-name-equality fact any longer,
    so the source states a domain rule the specification does not hold.
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/case-query.service.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: revise-hypothesis.operation.ts's refuseUnknownConcepts throws ConceptNotInGlossaryError for every
    named concept the glossary does not currently hold; the fixture's own concepts, actions and recipients
    (equipment-status, network-outage-flag, escalate-to-specialist, tier-two-support-queue, etc.) are
    the ones seed.ts registers into the glossary before this case is seeded.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: relational-case-store.repository.ts's discard() removes only a draft's own row and manifest entries
    — a released version is never removed — and assembleVersion answers any (slug, version) ever stored.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: parse-case-document.ts's resolutionProblems requires both an outcome and a referral for the fallback
    and for every manifest entry's resolution, never accepting one half alone; the fixture's own fallback
    and both manifest entries each carry a complete resolution.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: case-resolution.ts's byPrecedence sorts the manifest by position, and both collectionPlan and resolveOutcome
    consult only that ordering; relational-case-store.repository.ts's manifestSelect orders by position
    to match; the fixture's own two entries declare positions 1 and 2.
  encoded_at:
  - src/case/case-resolution.ts
  - src/persistence/relational-case-store.repository.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: Nothing in the file set attempts to parse or count claims within a criterion string — parse-case-document.ts's
    stringProblems checks only that criterion is a non-empty string, consistent with this being verified
    by human review, not the validator; the fixture's own two criteria each read as one falsifiable claim.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: case-store.port.ts and relational-case-store.repository.ts's discardDraft remove a draft version
    and its own manifest entries, never any hypothesis-revision they referenced; a released version is
    never removed.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: capability-query.port.ts's readCapability is documented as read through the store on every call,
    never remembered; case-query.service.ts composes ICapabilityQuery fresh on every readCase call.
  encoded_at:
  - src/capability-registry/capability-query.port.ts
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: case-query.service.ts's readCase runs the structural parse and the coherence check at the moment
    of every reading, while replayCase is the declared exception, answering the pinned version's exact
    stored content without either check.
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: case-resolution.ts's resolveOutcome, when no hypothesis is confirmed, returns the fallback's outcome
    and referral with no determining hypothesis named.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: case-resolution.ts's resolveOutcome finds the first entry in precedence order whose verdict is
    confirmed and answers its own resolution and name as determining; every other hypothesis's verdict
    is only read, never written.
  encoded_at:
  - src/case/case-resolution.ts
notes: 'src/seed.ts is named in this file set and the trace does hold a binding for it, but that binding''s
  one node, contracts/knowledge/author-case-version, no longer exists under the specification root — the
  trace itself reports it under the orphaned class, over which no bind can be repaired. It is excluded
  from the nodes table above rather than forced into a node reference that would not resolve, or into
  unbound (which is for a file the trace holds no binding for at all, not this file''s case); the route
  for that specific stale entry is trace.py --prune, never this reconciliation. Two nodes above did not
  clear — constraints/the-system-persists-to-one-relational-database and rules/knowledge/a-slug-identifies-one-case
  — both converging on the same fact: case.ts and parse-case-document.ts still treat a case as one JSON
  document whose slug must equal the file name that holds it, citing a constraint (constraints/a-case-is-stored-as-one-json-document)
  and a rule (rules/knowledge/the-slug-matches-the-file-name) that no longer exist under the specification
  root — retired, per decision-log.md, the moment persistence moved to one relational store. Because these
  two nodes did not clear, nothing in this record is bound, per this skill''s own rule that a partial
  bind reads exactly like a whole one.'
---
