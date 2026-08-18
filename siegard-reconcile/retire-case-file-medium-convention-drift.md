---
contract_version: siegard-reconcile/1
title: Post-corrective code drift over the files retire-case-file-medium-convention's own bind left stale
summary: 'The corrective delivery (task/retire-case-file-medium-convention/remove-file-medium-slug-check)
  rewrote case.ts, parse-case-document.ts, case-query.service.ts and release.operation.ts under its own
  two nodes; this reconciliation covers the 38 other nodes the trace still binds across these and four
  sibling files, unchanged by that delivery, whose digests moved anyway because the same files were rewritten.
  The premise: every one of these files'' current behavior is correct as it stands.'
target: backend
files:
- path: src/case/case-query.service.ts
  change: structuralCase now calls parseCaseDocument with the case's own already-known slug rather than
    a synthesized file name; the case.js import is now type-only (CASE_DOCUMENT_ENDING no longer imported).
- path: src/case/case.ts
  change: No longer exports CASE_DOCUMENT_ENDING or any file-name-medium constant; the retired constraint
    citation is removed from its header comment.
- path: src/case/parse-case-document.ts
  change: parseCaseDocument's second parameter is now named slug (was fileName); slugProblems and heldFileName
    (the slug-equals-file-name equality check) are removed; slug flows only into InvalidCaseDocumentError's
    identity argument.
- path: src/case/release.operation.ts
  change: structuralOutcome now calls parseCaseDocument with assembled.slug rather than a synthesized
    file name via CASE_DOCUMENT_ENDING; the case.js import is now type-only.
- path: src/config/env.ts
  change: Declares the process env schema, DATABASE_URL among its fields, read once at startup.
- path: src/factories/diagnose-server.factory.ts
  change: Composes the diagnose HTTP server's dependencies from one DatabaseConnection built from env.DATABASE_URL.
- path: src/persistence/relational-case-store.repository.ts
  change: 'Implements ICaseStore over the relational schema: a durable next_version counter, a hypothesis-identity-once
    insert, a never-reused revision number, a position-unique manifest, and a read-whole assembly.'
- path: src/persistence/relational-glossary-store.repository.ts
  change: Implements IGlossaryStore, answering exactly the rows the database currently holds for each
    of the five term vocabularies and for concepts.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'relational-case-store.repository.ts states: assembleVersion answers a case version whole through
    the one connection runInTransaction checks out (constraints/a-case-is-read-whole) — an unstored slug/version
    answers undefined before any manifest entry is ever read, never a partial assembly. assembleWholeVersion
    returns undefined before readManifest runs when the version row is absent.'
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'env.ts states: carries DATABASE_URL, the one URL this process reaches its database through (constraints/the-database-is-externally-provisioned);
    this schema is the one place that URL is read. diagnose-server.factory.ts reads only env.DATABASE_URL
    to build the one connection.'
  encoded_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'relational-glossary-store.repository.ts states: readTerms and readConcepts each run a fresh read
    on every call and answer exactly the rows the database currently holds (constraints/the-system-persists-to-one-relational-database)
    — never a value remembered from an earlier call. diagnose-server.factory.ts builds one connection
    from env.DATABASE_URL and threads it into every store/query factory alike. case.ts and release.operation.ts
    no longer carry any file-medium framing after the corrective delivery.'
  encoded_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/case/case.ts
  - src/case/release.operation.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'release.operation.ts''s header states: release (contracts/knowledge/case-lifecycle, domain/knowledge/case-version''s
    own declared release operation): the one trigger that ever moves a version out of draft. ReleaseOperation.release
    refuses a non-draft version, revalidates, then calls caseStore.release(slug, version).'
  encoded_at:
  - src/case/release.operation.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'case-query.service.ts''s CaseQueryService implements exactly the five declared operations: readCase,
    listCases, listCaseVersions, listHypotheses, listHypothesisRevisions.'
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/system/case-authoring
  conforms: true
  how: release.operation.ts's releaseViolations collects every structural-or-coherence violation together
    so release refuses once naming all of them, matching the contract's own description.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
- node: domain/glossary/action
  conforms: true
  how: case.ts's Referral.action is documented as the recipient's action, by its glossary action name,
    matching the node's single required name attribute.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: case.ts's HypothesisRevision.collects names concepts by glossary name; relational-glossary-store.repository.ts's
    readWholeConcepts reads exactly name, ttl and accepted subject types, matching the node's declared
    attributes.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: true
  how: case.ts's Referral.recipient is documented as the operational queue the referral addresses, by
    its glossary recipient name, matching the node's single name attribute.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: relational-glossary-store.repository.ts's VOCABULARY_TABLES maps subject-attribute to public.subject_attributes,
    stored through the same generic insertTermStatement/readTerms that reads/writes only a name column.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: case.ts's Case.subject is documented as the kind of subject the case examines, by its glossary
    subject-type name; relational-glossary-store.repository.ts's subject-type table likewise holds only
    a name.
  encoded_at:
  - src/case/case.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/knowledge/case
  conforms: true
  how: relational-case-store.repository.ts's cases table holds one row per slug and nothing else, and
    assignNextVersion increments the durable next_version counter, never MAX(version) over existing rows,
    matching the identity's own attributes.
  encoded_at:
  - src/case/case.ts
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: case.ts's Case type declares exactly the node's attributes — version, title, when_to_use, authored_at,
    subject, fallback, consolidation_register, state, released_at, manifest.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: case.ts declares CASE_VERSION_STATES = ['draft', 'released'] as const, exactly the node's two enumerated
    values.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: parse-case-document.ts imports CONSOLIDATION_REGISTERS rather than re-listing the two values, and
    its consolidationRegisterProblems refuses a value that is not one of formal, plain.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: case.ts's HypothesisIdentity = { name } matches the node's own bare-identity description; relational-case-store.repository.ts's
    hypotheses table is now identity-only with no content column.
  encoded_at:
  - src/case/case.ts
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: case.ts's HypothesisRevision type carries exactly hypothesis, revision, criterion, collects, resolution,
    matching the node's declared attributes.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: case.ts's ManifestEntry = { position, hypothesis_revision } matches the node's position attribute
    plus its reference-by-nesting to one hypothesis-revision.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/referral
  conforms: true
  how: case.ts's Referral = { action, recipient } matches the node's two required attributes exactly.
  encoded_at:
  - src/case/case.ts
- node: domain/knowledge/resolution
  conforms: true
  how: case.ts's Resolution = { outcome, referral } matches the node's two required attributes exactly,
    paired so no position can declare one without the other.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: case-query.service.ts's replayCase resolves without reading any digest over the case's content
    at all — slug and version alone name one content, because a version is written once and never altered.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: parse-case-document.ts's manifestProblems refuses with 'the case declares no hypothesis' whenever
    manifest is undefined or empty.
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: relational-case-store.repository.ts maps a unique-violation on case_versions_one_draft_per_case
    to CaseAlreadyHasDraftError.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: release.operation.ts's refuseNonDraft throws CaseVersionNotDraftAtReleaseError before any validation
    runs wherever assembled.state !== 'draft'.
  encoded_at:
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: relational-case-store.repository.ts's assignNextVersion is assigned by incrementing its own durable
    counter, never MAX(version) over existing rows.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: parse-case-document.ts's collectsProblems refuses an undefined or empty collects list; case.ts
    documents collects as never empty.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: parse-case-document.ts's stringProblems refuses an empty criterion; case.ts documents criterion
    as never empty.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: relational-case-store.repository.ts's findDraftVersion reads the case's current draft, kept out
    of insertRevision itself and consumed by the gating operation, consistent with the policy.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: relational-case-store.repository.ts's hypothesisIdentityStatement idempotently claims the hypothesis's
    own identity row, never a second one for a name already held.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: relational-case-store.repository.ts maps a unique-violation on case_version_hypotheses_position_unique
    to ManifestPositionOccupiedError, and parse-case-document.ts's sharedPositionProblems refuses shared
    positions within one document/version.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: relational-case-store.repository.ts's revisionInsertStatement computes COALESCE(MAX(revision),
    0) + 1 atomically per hypothesis.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: relational-case-store.repository.ts's resolveSourceVersion falls back to the case's own latest
    released version when none is named, and copies its manifest entry for entry.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: case.ts documents slug as the case's identity, citing this rule; release.operation.ts states no
    file-name convention governs it any longer; relational-case-store.repository.ts's caseIdentityStatement
    enforces uniqueness via ON CONFLICT (slug) DO NOTHING against the cases table's own primary key, with
    no residual file-name matching anywhere in the four files the corrective delivery touched.
  encoded_at:
  - src/case/case.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: relational-case-store.repository.ts's discardDraft only ever deletes a version still in draft state;
    a released version's row and manifest entries are left in place by the schema's own release-conditioned
    delete rules.
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: parse-case-document.ts's resolutionProblems requires an outcome paired with a referral for the
    fallback and for every manifest entry's own resolution.
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: case.ts documents the manifest's precedence as each entry's own declared position, never the array
    arrangement; relational-case-store.repository.ts's manifestSelect orders rows by position.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: release.operation.ts's releaseViolations and case-query.service.ts's refuseIncoherence both call
    caseCoherenceViolations fresh at the moment of the read/release rather than from any cached value.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: case-query.service.ts's header states every validator rule holds at the moment of reading, with
    replayCase as the declared exception, skipping both parseCaseDocument's structural refusal and caseCoherenceViolations.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
notes: src/case/parse-case-document.ts also carries one orphaned binding, contracts/knowledge/author-case-version,
  which no longer exists under the specification root — excluded from this table per the trace's own orphaned
  class; its route is trace.py --prune, never this reconciliation. The judgment separately noted that
  parse-case-document.ts still names its accepted shape CaseDocument/ManifestEntryDocument and speaks
  of 'one case-version JSON document' — vocabulary left over from the retired file-medium convention,
  but every one of the eight files now feeds it either a freshly authored payload or a row-assembled projection
  rather than a stored file, so this reads as naming residue rather than a restated domain fact, and is
  a standard/code-quality matter, not a conformance finding.
---
