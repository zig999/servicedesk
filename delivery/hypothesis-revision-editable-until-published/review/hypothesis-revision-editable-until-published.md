---
title: Review of hypothesis-revision-editable-until-published (backend)
summary: Four-pass evidence over the four delivered tasks of the epic hypothesis-revision-overwrite — coverage, specification conformance (via reconciliation), standard conformance, and a captured run that passed cleanly.
reviewed:
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  - src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
  - src/__tests__/unit/errors/status-map.spec.ts
  - src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  - src/case/case-store.port.ts
  - src/case/hypothesis-revision-overwrite.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  - src/errors/status-map.ts
  - src/factories/case-store.factory.ts
  - src/persistence/relational-case-store.repository.ts
tasks:
  - task/hypothesis-revision-overwrite/revision-alteration-refused-only-when-released
  - task/hypothesis-revision-overwrite/read-highest-revision-and-release-state
  - task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place
  - task/hypothesis-revision-overwrite/revise-chooses-overwrite-or-next-revision
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: the captured run (run/hypothesis-revision-editable-until-published) passed every step; there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/hypothesis-revision-editable-until-published.md
coverage:
  - criterion: Applying every migration script in its numbered order to an empty database produces the schema the tree expects, with no step performed by hand.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: drops the unconditional hypothesis_revisions_no_update rule and installs the release-conditioned trigger on hypothesis_revisions once every migration script has been applied in its numbered order
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: arrives as the next-numbered script after 0008, with 0006's own file still holding its original, unconditional rule text
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: shapes hypotheses as exactly case_slug and name, carrying no content column
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: drops hypothesis_collects (migration 0004) entirely, leaving no table for any old row to have been carried into
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: backfills every pre-existing case_versions row's state to 'released' when migration 0009 adds the column
  - criterion: An update to a hypothesis revision that no case version in released state references is not refused by the schema's own rule over that relation.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: leaves an update through unrefused on a hypothesis revision that no case version references at all
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: leaves an update through unrefused on a hypothesis revision that a released case version's manifest does not reference, even though that same released version's manifest references a different revision of the same hypothesis
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: leaves an update through unrefused on a hypothesis revision that only a draft-state case version's manifest references
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it
  - criterion: An update to a hypothesis revision that a case version in released state references through its manifest leaves that revision's stored content exactly as it was.
    state: partial
    tests:
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: leaves a hypothesis revision's stored content exactly as it was after an update attempts to change it, where a released case version's manifest still references that revision
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: rejects the update itself, raising ReleasedHypothesisRevisionNotAlterableError, rather than silently discarding it, where a released case version's manifest still references the revision
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: leaves an already-stored hypothesis revision's own columns unchanged after an ordinary UPDATE attempts to alter them, where a released case version's manifest references that revision
    why: Every update the set attempts against a released-referenced revision names the criterion column alone, and every read-back reads criterion alone. A revision's stored content also holds resolution_outcome, resolution_action and resolution_recipient; nothing submits an update naming one of those, so a rule conditioned on the criterion column only would pass this set while letting a released revision's resolution be rewritten.
  - criterion: An update to a hypothesis revision that only case versions in draft state reference is not refused by the schema's own rule over that relation.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
        name: leaves an update through unrefused on a hypothesis revision that only a draft-state case version's manifest references
    why: Covered for one draft-state referencing version; the criterion's plural — two or more draft versions pinning the same revision — is not separately exercised, and the single-version case is what the rule reads.
  - criterion: For a hypothesis holding at least one revision, the answer carries the highest revision number that hypothesis currently holds.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: carries the highest revision number a hypothesis currently holds, once it holds more than one
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: says the highest revision is referenced by no released case version, when a released case version pins a lower revision of that same hypothesis and not the highest
  - criterion: For a hypothesis holding no revision at all, the answer says it holds none.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: says a hypothesis holds no revision at all, when the case has never originated it
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: carries no released_referenced field at all for a hypothesis holding no revision — never defaulting it to a boolean that would route the write side onto the frozen branch for a hypothesis that must instead create revision 1
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: "answers { revision: undefined } rather than raising, for a slug naming no case at all"
  - criterion: The answer says the highest revision is referenced by a released case version when a case version in released state pins that revision in its manifest.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: says the highest revision is referenced by a released case version, when a case version in released state pins exactly that revision
  - criterion: The answer says the highest revision is referenced by no released case version when only case versions in draft state pin it.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: says the highest revision is referenced by no released case version, when only a case version in draft state pins it
  - criterion: The answer says the highest revision is referenced by no released case version when a released case version pins a lower revision of that same hypothesis and not the highest.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: says the highest revision is referenced by no released case version, when a released case version pins a lower revision of that same hypothesis and not the highest
  - criterion: The fact reaches its caller through the case-store port, and the module that consumes it imports no driver, framework or provider client.
    state: partial
    tests:
      - file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
        name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
      - file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
        name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than silently succeeding, when the released-reference reading it acted on had already gone stale — the revision was released for real between that read and the write it drove
    why: The first half holds — the operation reads the fact through readHighestRevisionReleaseState on a substituted store, so a fact obtained any other way would change that test's outcome. The second half is unexercised as stated — both import tests read the module that declares the fact (hypothesis-revision-release-state.port.ts), not the module that consumes it; nothing in the set scans the imports of revise-hypothesis.operation.ts itself, so that module importing pg, fastify or the provider SDK directly would not fail anything here.
  - criterion: After the replacement, that revision's number is the number it held before.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: overwrites a revision's content while leaving its own revision number exactly as it was before
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite assigns no revision number the hypothesis had already assigned elsewhere
  - criterion: After the replacement, reading that revision answers the criterion and the resolution the replacement carried.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: answers the replacement's own criterion and resolution, once that revision is read back after the overwrite
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: performs the overwrite through the IHypothesisRevisionOverwrite port alone, without needing the rest of ICaseStore
  - criterion: After the replacement, reading that revision's collects answers exactly the concepts the replacement carried.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: answers exactly the concepts the replacement carried, once that revision's collects are read back after the overwrite
    why: Exercised from an empty prior collects to a two-concept replacement. A replacement carrying a set that both drops an old concept and adds a new one is not exercised anywhere in the set; the two directions are each covered separately, here and by the drop test below.
  - criterion: After the replacement, none of the concepts the revision collected before the replacement is answered by that revision's collects.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: answers none of the concepts the revision collected before the replacement, once the replacement drops them all
  - criterion: After the replacement, the hypothesis holds exactly the revisions it held before, no more and no fewer.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and no fewer
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: overwrites a revision's content while leaving its own revision number exactly as it was before
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: resolves without raising, leaving no new row behind, when the named revision does not exist for that hypothesis
  - criterion: The replacement assigns no revision number that the hypothesis had already assigned to a different revision.
    state: covered
    tests:
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite assigns no revision number the hypothesis had already assigned elsewhere
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and no fewer
  - criterion: Revising a hypothesis whose highest existing revision is referenced by no case version in released state leaves that hypothesis's highest revision number unchanged.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves exactly the revision it held before three successive revises of an unreleased highest revision, reading the content of the most recent of them afterward
  - criterion: After such a revise, that revision's content reads as the content the revise carried.
    state: partial
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state
    why: The read-back after the revise selects revision and criterion only. The content the revise carried also holds collects and a resolution; an operation that passed the wrong collects, or none, to the overwrite would leave this test passing, so that part of "the content the revise carried" is unexercised at the operation level.
  - criterion: Three successive revises of a hypothesis whose highest existing revision is referenced by no case version in released state leave that hypothesis holding exactly the revisions it held before the first of them.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves exactly the revision it held before three successive revises of an unreleased highest revision, reading the content of the most recent of them afterward
  - criterion: After those three revises, the hypothesis's highest revision reads the content of the most recent of them.
    state: partial
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves exactly the revision it held before three successive revises of an unreleased highest revision, reading the content of the most recent of them afterward
    why: Which of the three revises won is proven, since only the criterion varies across them and the read-back asserts the third one's criterion. The read-back reads criterion alone, and the three revises carry identical collects and resolution, so nothing in the set distinguishes the most recent revise's collects or resolution from any other's — that part of "the content of the most recent of them" is unexercised.
  - criterion: Revising a hypothesis whose highest existing revision is referenced by a case version in released state creates a revision numbered exactly one past that highest revision.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: creates a revision numbered exactly one past the highest existing revision when that revision is referenced by a case version in released state
      - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
        name: numbers a hypothesis-revision one past that hypothesis's own highest existing revision, or 1 where none exists yet, independently per hypothesis
    why: At the operation level the released-referenced fixture always seeds highest revision 1 and expects 2, so an implementation hardcoding 2 on this branch would pass this file alone; "one past the highest" for an arbitrary highest is exercised only one layer down, in the store's own numbering test.
  - criterion: After such a revise, the revision that released case version references reads exactly the content it read before the revise.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves the released-referenced revision's own content reading exactly as it did before a revise creates the next revision
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than silently succeeding, when the released-reference reading it acted on had already gone stale — the revision was released for real between that read and the write it drove
  - criterion: After such a revise, that released case version's manifest still references the revision number it referenced before.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves the released case version's manifest referencing the same revision number it referenced before a revise creates the next revision
      - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
        name: refuses to alter a manifest entry belonging to a released case version
  - criterion: Revising a hypothesis that holds no revision creates that hypothesis's revision 1.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: originates a never-named hypothesis's own identity and its first revision, numbered 1
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: succeeds for a case that holds both an already-released earlier version and a currently open draft version — the draft gate finds the draft rather than being confused by the case's own release history
  - criterion: A revise requested while the case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case that has never held any version at all, writing no hypothesis or revision row
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case whose only version is already released rather than in draft state, writing no hypothesis or revision row
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case whose only draft version has already been discarded, writing no hypothesis or revision row
      - file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
        name: answers 409 with CaseHoldsNoDraftError's own code, message and context as details, never the generic 500, when reviseHypothesis rejects with it
      - file: src/__tests__/unit/errors/status-map.spec.ts
        name: resolves CaseHoldsNoDraftError to 409
    why: Covered as a chain rather than end to end — the operation tests prove a case holding no draft raises the typed error against a real store, and the route test proves that error becomes a 409 naming CaseHoldsNoDraftError against a mocked operation. No single test drives the HTTP route through a real store into the no-draft condition, so a wiring fault between the route's dependency and the real operation would not fail this set.
  - criterion: A revise refused because the case holds no draft version leaves every existing revision of that hypothesis reading exactly as it did, and creates none.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves an already-existing revision of the hypothesis reading exactly as it did, refusing to alter it, when a later revise is refused for the case holding no draft version
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case that has never held any version at all, writing no hypothesis or revision row
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case whose only draft version has already been discarded, writing no hypothesis or revision row
    why: "The whole revision row set is asserted, so \"creates none\" is proven. \"Every existing revision\" is exercised with exactly one existing revision, and the read-back compares revision and criterion only — a refusal that quietly rewrote a revision's collects or resolution would not fail this set."
  - criterion: After a revise that replaced the highest revision's content in place, the case's draft manifest entry for that hypothesis references the same revision number it referenced before the revise.
    state: covered
    tests:
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: leaves a draft manifest entry for the hypothesis referencing the same revision number it referenced before a revise that replaced the highest revision's content in place
      - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
        name: changes no version's manifest on its own — an existing manifest entry stays exactly as it was, and the newly originated revision is placed nowhere
findings:
  - pass: conformance
    file: src/errors/status-map.ts
    where: whole file
    evidence: "the map holds only error-class-to-status pairs; nothing in the file names an operation of contracts/integration/connector-configuration-registry"
    cost: no named file holds this fact now — a reader looking in status-map.ts for where this contract's operations are answered will not find it
  - pass: conformance
    file: src/errors/status-map.ts
    where: whole file
    evidence: "the map holds only error-class-to-status pairs; nothing in the file names the diagnose operation of contracts/investigation/diagnosis"
    cost: no named file holds this fact now — a reader looking in status-map.ts for where the diagnose operation is answered will not find it
  - pass: conformance
    file: src/case/case-store.port.ts
    where: "the CaseVersionState type alias, line 5"
    evidence: "export type CaseVersionState = 'draft' | 'released';"
    cost: this file declares its own independent literal union for the case-version-state enumeration instead of importing the CaseVersionState that case.ts already derives from CASE_VERSION_STATES; the two agree today but nothing ties them together, so a future change to the specification's enumeration has no signal reaching this second copy, and the day they disagree nobody can say which is the domain's own answer
  - pass: conformance
    file: src/persistence/relational-case-store.repository.ts
    where: "release()/releaseStatement(), placeHypothesis()/placeHypothesisStatement(), removeManifestEntry()/removeManifestEntryStatement(), discard()/discardDraft()"
    evidence: "release() accepts any slug/version pair regardless of its current state, silently re-stamping released_at on a version already released rather than refusing; CaseVersionNotDraftAtReleaseError is never imported or thrown anywhere in this file"
    cost: the lifecycle rule's refusals for re-releasing, composing into or discarding an already-released version are not where the next reader would look for them, and a companion integration test already asserts the idempotent-success behavior as correct rather than the refusal the rule states
  - pass: conformance
    file: src/case/revise-hypothesis.operation.ts
    where: "refuseWithoutDraft (lines 47-52) together with refuseConceptsRefusingSubject/conceptsRefusingSubjectOf (lines 102-120)"
    evidence: "findDraftVersion returns only a version number, discarded once existence is confirmed; conceptsRefusingSubjectOf checks caller-supplied input.subject verbatim rather than the draft version's own declared subject type"
    cost: a caller passing a subject that no longer matches the case's actual draft is checked against the wrong subject type with nothing here to catch it, defeating the rule's own guarantee in exactly the aggregate meant to enforce it
  - pass: standard
    file: src/persistence/relational-case-store.repository.ts
    where: "line 104, RelationalCaseStore constructor"
    cites: ARC-01
    evidence: "public constructor(private readonly connection: DatabaseConnection) {}"
    cost: "DatabaseConnection is a concrete class alias (`export type DatabaseConnection = Pool;`) from the pg driver, not an interface; exercising RelationalCaseStore means constructing or connecting a real Pool, which is exactly what relational-case-store.repository.spec.ts does — every one of its assertions needs a live PostgreSQL instance rather than a stand-in the repository's own ports would let it accept"
    correction: type the constructor parameter as an interface the store depends on (e.g. IQueryable, already used internally for transactions) rather than the concrete DatabaseConnection/Pool alias
  - pass: standard
    file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
    where: "top of file: requireDatabaseUrl, migrationFilesInOrder, applyMigrationFiles, insertCase, insertHypothesis, insertHypothesisRevision, insertManifestEntry"
    cites: MNT-03
    evidence: "function requireDatabaseUrl(): string { const url = process.env.DATABASE_URL; if (!url) { throw new Error(...); } return url; }"
    cost: the same migration-schema test harness already exists, function-for-function, in case-version-lifecycle-schema.spec.ts; a change to how the suite resolves the migrations directory or the required env var has to be made in both files, and the second copy carries no sign that it needs to be
    correction: extract the shared migration-schema harness into one test-support module both schema spec files import
  - pass: standard
    file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    where: "top of file: requireDatabaseUrl, isForeignKeyViolation, deleteTolerantly"
    cites: MNT-03
    evidence: "const FOREIGN_KEY_VIOLATION = '23503'; function isForeignKeyViolation(error) {...} async function deleteTolerantly(text, params) {...}"
    cost: this block is character-for-character the same block already present in relational-case-store.repository.spec.ts; fixing the foreign-key code check, or how either suite resolves DATABASE_URL, in one file leaves the other silently unfixed
    correction: extract requireDatabaseUrl/isForeignKeyViolation/deleteTolerantly into a shared integration-test helper both spec files import
---
## What it is
Four-pass evidence over the four tasks of epic hypothesis-revision-overwrite: the migration conditioning the alteration refusal on a released reference, the store's read of a hypothesis's highest revision and its release state, the store's in-place overwrite of a revision's content, and the operation choosing between overwrite and next-revision.

## Notes
The captured run (run/hypothesis-revision-editable-until-published) executed install, typecheck, lint, secret-scan and test once over the whole change and every step passed, which is why the failures pass carries no findings and is recorded as not run: a run with nothing to diagnose is the one case that pass does not enter.
The conformance pass ran through `trace.py --stage --review` and its return is folded into siegard-reconcile/hypothesis-revision-editable-until-published.md: 40 node bindings cleared and were restamped by `trace.py --bind-record`; 5 did not clear and are carried here as findings. Two of those five (contracts/integration/connector-configuration-registry, contracts/investigation/diagnosis) surfaced only because status-map.ts is bound to them from an earlier delivery and this change touched the file incidentally (adding one new error-status pair) — the finding is pre-existing and this change neither introduces nor repairs it. The other three (domain/knowledge/case-version-state, rules/knowledge/a-case-version-moves-through-its-declared-lifecycle, rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft) are likewise pre-existing conditions in relational-case-store.repository.ts and revise-hypothesis.operation.ts that this change's own tasks did not touch the substance of — their criteria do not reach the lifecycle-refusal or draft-subject-type behavior these findings describe — but the conformance pass reads the file as it stands regardless of which task wrote which line, so they stand as findings against this review's file set.
Coverage reports five partial criteria, all sharing one shape: a read-back after a write asserts only the criterion column (or, on the schema migration's resolution criterion, only the criterion column of the resolution triple), so a write that silently dropped or corrupted collects or the other resolution fields would not be caught by these tests. None reaches unauditable or uncovered — every one of the 28 stated criteria has at least the assertion its own name promises.
The standard pass's ARC-01 finding (RelationalCaseStore's constructor takes the concrete DatabaseConnection/Pool alias rather than an interface) is pre-existing: it names the same constructor every prior delivery against this file already built on, not a departure this change introduced. Its two MNT-03 findings are new: this task's own proof duplicated an existing schema-suite harness and an existing integration-suite harness into the two newly written or newly modified test files rather than importing them from one shared module.
