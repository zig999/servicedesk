---
title: The relational case store, reading a case whole and writing a version once
summary: Adds RelationalCaseStore, the database-backed implementation of ICaseStore, assembling a case's
  root, hypotheses, resolutions and referrals in one transaction and deciding write-once by case_versions'
  own primary key rather than by reading first.
task: sha256:f648f87ddd4e2d895d7f8e14f4be6ce2f1ac8f8affb453809863d0d29f384a07
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-case-store-build
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: new module — RelationalCaseStore implements ICaseStore against the shared database-access.ts/database-connection.ts
    seam. readVersion(slug, version) runs one transaction that SELECTs case_versions, then hypotheses,
    then hypothesis_collects for that key, answering undefined where case_versions holds no such row and
    otherwise assembling the whole Case-shaped document plus a sha256 content-identity hash. writeVersion(slug,
    version, document) maps the given document into an ordered list of statements — an idempotent case-identity
    insert, the case_versions insert whose primary key over (slug, version) refuses an already-stored
    version, then one insert per hypothesis immediately followed by one per concept it collects — and
    runs the whole list as one unit of work. listVersions(slug) runs one SELECT over case_versions, ordered
    by version
criteria:
- criterion: A read answers the case root together with its hypotheses and their resolutions and referrals,
    assembled in one transaction.
  met: true
  how: readVersion runs entirely inside runInTransaction's own checked-out connection — case_versions,
    then hypotheses, then hypothesis_collects are all read through the one connection one open transaction
    pins
- criterion: A read answers either a complete aggregate or nothing, and never a case missing a hypothesis,
    a resolution or a referral.
  met: true
  how: readWholeVersion answers undefined the moment case_versions holds no matching row, before any hypothesis
    is ever read; every hypothesis row already carries its own complete, flattened resolution and referral
    columns
- criterion: A read for a slug and version nothing was written under answers with absence as data rather
    than raising.
  met: true
  how: queryOneOrAbsent answers undefined for a case_versions SELECT matching no row, and readWholeVersion
    returns that undefined straight through
- criterion: A write of a slug and version already stored is refused through the case store's typed error,
    and the stored version is left exactly as it was.
  met: true
  how: the case_versions INSERT names no ON CONFLICT clause, so a duplicate fails the primary key; runInTransaction's
    own catch issues ROLLBACK before releasing, so nothing this write attempted is ever committed
- criterion: A write of a slug and version not already stored is not refused on that ground.
  met: true
  how: the case-identity insert is ON CONFLICT (slug) DO NOTHING, so an existing slug never blocks a new
    version under it, and the case_versions insert only ever fails on an already-existing pair
- criterion: A version stored earlier remains readable after later versions of the same slug are written,
    and the version list answers every version ever written under that slug.
  met: true
  how: writeVersion never updates or deletes a case_versions row, only ever inserts a new one; listVersions
    selects every version column for the slug, ordered, with nothing filtering it to the latest
- criterion: Every version the store holds under one slug belongs to one case, and no second case is admitted
    under a slug the store already holds.
  met: true
  how: every case_versions row is foreign-keyed to cases(slug), and cases.slug is that table's sole column
    and primary key, so there is exactly one cases row per slug
nodes:
- node: constraints/a-case-is-read-whole
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: readVersion's one runInTransaction call is the whole of how this store answers a case root together
    with its hypotheses, resolutions and referrals in one transaction or not at all
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: '"written once" is decided by case_versions'' own primary key rather than a read-first check. "Never
    altered" is unreached by this task: this store issues no UPDATE against case_versions at all; the
    schema''s own case_versions_no_update rule answers that half'
- node: rules/knowledge/a-slug-identifies-one-case
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: the case-identity statement's ON CONFLICT (slug) DO NOTHING lets a second version under a held
    slug succeed without ever creating a second cases row
- node: rules/knowledge/every-case-version-remains-readable
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: writeVersion only ever inserts a case_versions row, never updates or deletes one, so every version
    a slug ever gets keeps answering to readVersion and listVersions
inferences:
- inferred: writeVersion trusts the given document as a Case via a bare type assertion, with no structural-validation
    guard
  from: this task's own ADVISORY note leaving the attribute mapping to case.ts's own types, together with
    case-query.service.ts's own trustedCase precedent for the identical trust boundary
- inferred: a failure while mapping the given document into statements is wrapped into CaseStoreError
    the same way a driver failure already is
  from: COR-02, which applies to this file
- inferred: StoredCaseVersion.hash is computed as sha256 of the JSON serialization of the document this
    read assembled, rather than of the exact bytes a read found on disk
  from: this task's own inventory note that a disk-bytes hash has no equivalent once the document is rows;
    the JSON-of-the-assembled-document hash preserves the same content-identity property
- inferred: the reconstructed document's hypotheses are ordered by declared position ascending, and each
    hypothesis's own collects are ordered by concept name ascending
  from: hypotheses' own position column is the precedence field the specification already makes authoritative
    over array order, and hypothesis_collects carries no ordinal column of its own
- inferred: the reconstructed document's slug and version are taken from the given key parameters, never
    from a column of case_versions itself
  from: case_versions carries no slug/version content columns beyond its own primary key, and FileCaseStore's
    own precedent already never reads either field off the document it stores
- inferred: case_versions.authored_at is read back as a JavaScript Date and converted with .toISOString()
    before it re-enters the Case shape
  from: node-postgres's own default behavior of parsing a timestamptz column into a Date object
- inferred: a stored consolidation_register is re-narrowed against the enumeration's own two declared
    values on read, raising this store's own typed error if a row somehow holds an outside value
  from: TYP-02, and relational-capability-store.repository.ts's own identical defensive-narrow precedent
preserved:
- persistence/file-case-store.repository.ts and its own proof keep behaving exactly as before — untouched;
  the production factory still wires FileCaseStore, unaffected by this task.
- case-query.service.ts's readCase and replayCase, and case-resolution.ts's collectionPlan/requiresEvaluationOf/resolveOutcome,
  keep reading against ICaseStore's own unchanged signatures.
- migrations/0001 through 0007 are untouched; this task adds no schema change.
- no-network-persistence.spec.ts and dependency-manifest.spec.ts keep passing as written.
- domain-depends-on-no-infrastructure.spec.ts's own sweep keeps passing unaffected.
divergences:
- cites: TYP-02
  file: src/persistence/relational-case-store.repository.ts
  departure: documentAsCase() asserts document as Case with no narrowing guard alongside it.
  why: a guard thorough enough to narrow unknown to Case here would re-implement parse-case-document.ts's
    own structural refusal, which validation-runs-at-every-read assigns to the read side; case-query.service.ts's
    own trustedCase already discloses the identical departure
- from: the ICaseStore port's own doc comment and FileCaseStore's own contentHash, both describing StoredCaseVersion.hash
    as sha256 of the exact bytes a read found on disk
  departure: this store's own contentHash instead hashes the JSON serialization of the document readVersion
    assembled from case_versions, hypotheses and hypothesis_collects.
  why: there is no file and no disk bytes once the content is rows; hashing the assembled document's deterministic
    serialization is the closest equivalent that keeps the same content-identity property
deferred:
- what: wiring RelationalCaseStore into src/factories/case-store.factory.ts in place of FileCaseStore.
  why: no task in this plan names that cutover yet, and this task's own objective is the store's behavior
    against the database, not which store production uses
- what: contracts/knowledge/case-query and the stale references still inside case-store.port.ts's and
    case-query.port.ts's own doc comments to two retired specification nodes.
  why: this task's own ADVISORY note leaves the published read out of scope, reconciled to a different
    task; correcting stale comments in a port file this task implements rather than replaces reaches past
    this task's own objective
---

## What it is

The case store, answering the read the knowledge context publishes: a case's root, hypotheses,
resolutions and referrals assembled in one transaction, and write-once decided by a key rather
than by looking first.

## Notes

StoredCaseVersion.hash is now sha256 of the assembled document's own JSON serialization, since
there is no file and no disk bytes once the content is rows — the inventory's own named gap,
closed with the closest equivalent that keeps the same content-identity property.
