---
contract_version: siegard-reconcile/1
title: Remaining post-closure code drift
summary: 'The remaining 15 files bound in the trace to specification nodes across several past deliveries
  of this codebase, whose digests moved without a rebind. The premise: every one of these files'' current
  behavior is correct as it stands.'
target: backend
files:
- path: src/__tests__/integration/seed.spec.ts
  change: Proves seed.ts seeds the two non-conclusion outcomes, every concept and capability, and the
    curated case, idempotently on a second run.
- path: src/capability-registry/capability-query.port.ts
  change: Declares ICapabilityQuery.readCapability, resolving one concept to the capability currently
    answering it.
- path: src/capability-registry/capability-registry.service.ts
  change: Registers a capability held to its complete declared contract, refuses a non-read-only nature,
    and refuses a concept two held capabilities both answer.
- path: src/case/case-query.port.ts
  change: Declares ICaseQuery's read operations, including replayCase pinned by slug and version alone.
- path: src/case/case-resolution.ts
  change: Resolves a case's outcome by precedence order, falling back to the case's own fallback outcome
    and referral when no hypothesis is confirmed.
- path: src/case/case-store.port.ts
  change: Declares ICaseStore's storage primitives, one per case-lifecycle operation, plus the read-whole
    assembly contract.
- path: src/case/parse-case-document.ts
  change: Runs the structural checks a parsed case document must pass, including referral and criterion
    validation.
- path: src/case/revise-hypothesis.operation.ts
  change: Revises a hypothesis only against its case's own draft, refusing an empty collects list, an
    unknown concept, or a concept that rejects the draft's declared subject type.
- path: src/errors/case-version-not-draft.error.ts
  change: The typed refusal every write-once guard raises once a version is no longer draft, and only-a-draft-case-version-may-be-discarded's
    own refusal.
- path: src/fixtures/case/intermittent-connection-outage/1.json
  change: The one curated case document seed.ts and its own tests author against.
- path: src/glossary/glossary-query.port.ts
  change: Declares IGlossaryQuery's term and concept reads.
- path: src/glossary/glossary-store.port.ts
  change: Declares IGlossaryStore's persistence primitives, with no infrastructure import of its own.
- path: src/glossary/glossary.service.ts
  change: Answers every vocabulary term and concept currently held, defaulting a concept's ttl and topping
    the outcome vocabulary up with the two non-conclusion outcomes on every read.
- path: src/http/read-case.controller.ts
  change: Maps one validated read-case request to ICaseQuery.readCase and the resolved case back to the
    wire response.
- path: src/vitest-global-setup.ts
  change: Applies every pending migration script to the test database once, before any test file in the
    suite runs.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'case-store.port.ts''s assembleVersion is documented to assemble one version of a case whole: its
    own attributes, its manifest in declared-position order, and each manifest entry''s own adopted hypothesis-revision
    and its collects, in one transaction, whole or not at all — matching the node''s statement exactly.'
  encoded_at:
  - src/case/case-store.port.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: seed.spec.ts's header states its run is against a real, externally provisioned PostgreSQL database;
    vitest-global-setup.ts reads only DATABASE_URL to apply migrations against it.
  encoded_at:
  - src/vitest-global-setup.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: glossary-store.port.ts declares an interface with no driver or framework import — the domain declares
    it, infrastructure implements it.
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: vitest-global-setup.ts runs applyPendingMigrations(connection, MIGRATIONS_DIRECTORY), applying
    every pending script under migrations/ to the database before any test.
  encoded_at:
  - src/vitest-global-setup.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: revise-hypothesis.operation.ts opens by citing revise-hypothesis as one of this contract's declared
    operations; nothing in the file adds an operation the contract does not declare.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: case-store.port.ts's assembleVersion and read-case.controller.ts's mapping to ICaseQuery.readCase
    both answer to the contract's read-case operation, validated whole.
  encoded_at:
  - src/case/case-store.port.ts
  - src/http/read-case.controller.ts
- node: domain/glossary/action
  conforms: true
  how: seed.spec.ts's own assertions treat action as a bare glossary name with no attribute beyond it.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/concept
  conforms: true
  how: glossary.service.ts's concepts() answers each name exactly once, each declaring its accepted subject
    types and its ttl in seconds; glossary-query.port.ts declares the same shape.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/glossary-query.port.ts
- node: domain/glossary/outcome
  conforms: true
  how: seed.spec.ts's own assertions treat outcome as a bare glossary name with no attribute beyond it,
    consistent with the non-conclusion-outcomes rule.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/recipient
  conforms: true
  how: seed.spec.ts's own assertions treat recipient as a bare glossary name with no attribute beyond
    it.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-type
  conforms: true
  how: seed.spec.ts's own assertions treat subject-type as a bare glossary name with no attribute beyond
    it.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/integration/capability
  conforms: true
  how: capability-query.port.ts's CapabilityResolution/readCapability answer the capability's full declared
    attribute set with nothing added.
  encoded_at:
  - src/capability-registry/capability-query.port.ts
- node: domain/integration/capability-registry
  conforms: true
  how: capability-registry.service.ts states the registry's two operations — register-capability and resolve-concept
    — matching the node's declared operations and responsibility exactly.
  encoded_at:
  - src/capability-registry/capability-query.port.ts
  - src/capability-registry/capability-registry.service.ts
- node: domain/knowledge/case
  conforms: true
  how: case-store.port.ts's CaseIdentity carries slug alone (plus next_version, the identity's own counter);
    read-case.controller.ts, case-resolution.ts and the fixture case all treat the case's identity as
    exactly that, nothing added.
  encoded_at:
  - src/case/case-store.port.ts
  - src/http/read-case.controller.ts
  - src/case/case-resolution.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/case-version
  conforms: true
  how: revise-hypothesis.operation.ts, read-case.controller.ts and seed.spec.ts all treat a case version
    as exactly the node's declared attribute set, nothing added.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/http/read-case.controller.ts
  - src/__tests__/integration/seed.spec.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: case-store.port.ts declares CaseVersionState = 'draft' | 'released', the node's own two enumerated
    values, restated as a type rather than a second vocabulary.
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: The fixture case's own consolidation_register is 'formal', one of the node's two closed values.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: case-store.port.ts's HypothesisIdentity carries name alone; revise-hypothesis.operation.ts and
    the fixture case both treat a hypothesis's identity as exactly that.
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: case-store.port.ts's HypothesisRevisionContent carries hypothesis_name, revision, criterion, collects,
    resolution — exactly the node's relationship plus its declared attributes.
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: case-store.port.ts's ManifestEntry is { position, hypothesis_revision }, matching the node's one
    attribute and its one relationship exactly.
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/referral
  conforms: true
  how: case-resolution.ts's ResolvedOutcome, parse-case-document.ts's referralProblems, and the fixture
    case's own referrals all carry exactly action and recipient.
  encoded_at:
  - src/case/case-resolution.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
  - src/case/parse-case-document.ts
- node: domain/knowledge/resolution
  conforms: true
  how: case-resolution.ts and the fixture case both pair outcome with referral exactly as the node declares,
    never one without the other.
  encoded_at:
  - src/case/case-resolution.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: glossary.service.ts's withNonConclusionOutcomes ensures the two non-conclusion outcomes exist on
    every outcome read, matching the rule's own statement.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: capability-registry.service.ts's contract-completeness refusal and timeout default match the rule's
    own statement exactly.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: capability-registry.service.ts throws CapabilityNotReadOnlyError whenever a registration's nature
    is not read-only, matching the rule exactly.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: capability-registry.service.ts's refuseAnsweredConcept and readCapability's duplicate-answer check
    both enforce the one-to-one fact the rule states.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: case-query.port.ts states a case is pinned by slug and version alone, never by a digest over its
    stored bytes, matching the rule exactly.
  encoded_at:
  - src/case/case-query.port.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: The fixture case's own manifest holds two entries, satisfying the rule's at-least-one requirement.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: seed.spec.ts's own assertions exercise the seeded case only through its published lifecycle operations,
    never altering a released version's content directly.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: case-store.port.ts's CaseVersionState and case-version-not-draft.error.ts's refusal both match
    the rule's initial/terminal/transition statement exactly.
  encoded_at:
  - src/case/case-store.port.ts
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: glossary.service.ts's concepts() answers ttl defaulted to sixty seconds for every concept whose
    registration states none, matching the rule's own default statement.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: revise-hypothesis.operation.ts's refuseConceptsRefusingSubject and the fixture case's own concepts
    (exercised against its declared subject without refusal) both match the rule exactly.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: revise-hypothesis.operation.ts's refuseEmptyCollects and the fixture case's own non-empty collects
    lists both match the rule exactly.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: The fixture case's own two hypothesis entries each declare a non-empty criterion.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: case-store.port.ts's findDraftVersion is documented for exactly the read revise-hypothesis.operation.ts's
    refuseWithoutDraft performs, matching the rule that revision is anchored to the case's current draft.
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: The fixture case's own two hypothesis names are distinct.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: revise-hypothesis.operation.ts's refuseUnknownConcepts and the fixture case's own concepts (seeded
    into the glossary before use) both match the concept slice of the rule.
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: case-store.port.ts's assembleVersion is reachable for any stored version number, and listCaseVersions
    lists every version the case currently holds — the store keeps every version, not only the latest.
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: The fixture case's own fallback and both manifest entries each carry a complete resolution.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: case-resolution.ts's byPrecedence sorts ascending by position, never by array arrangement; the
    fixture case's own two entries declare positions 1 and 2.
  encoded_at:
  - src/case/case-resolution.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: The fixture case's own two criteria each read as one falsifiable claim; nothing in the validator
    attempts to split or count claims within a criterion string, consistent with the rule being verified
    by human review, not the validator.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: case-version-not-draft.error.ts's refusal, raised wherever a discard is attempted against a non-draft
    version, matches the rule exactly.
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: case-resolution.ts's resolveOutcome returns the fallback's outcome and referral with no determining
    hypothesis named when none confirms, matching the scenario's given/then exactly.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: case-resolution.ts's resolveOutcome finds the first confirmed hypothesis in precedence order and
    answers its own resolution and name as determining, leaving every other hypothesis's verdict unmarked.
  encoded_at:
  - src/case/case-resolution.ts
notes: src/case/parse-case-document.ts is named in this file set and the trace does hold a binding for
  it, but that binding's one node, contracts/knowledge/author-case-version, no longer exists under the
  specification root — the trace itself reports it under the orphaned class. It is excluded from the nodes
  table above; its route is trace.py --prune, never this reconciliation.
---
