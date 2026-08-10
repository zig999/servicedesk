---
title: Write-once investigation store
summary: A file-backed IInvestigationStore/FileInvestigationStore pair persists a built Investigation as one JSON file per id, refusing a write over an already-stored identity and reusing the shared JSON-file helpers for both the refusal check and the write itself.
task: sha256:379e9ed0db8a061831413100bcbb3e932d14e49b58522f810056064ed9187f1e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-investigation-store-build
files:
- path: src/investigation/investigation-store.port.ts
  effect: 'declares IInvestigationStore (write(investigation), read(id)) and StoredInvestigation ({ document: unknown, hash }), the domain-owned port a caller depends on without knowing how or where persistence happens'
- path: src/persistence/file-investigation-store.repository.ts
  effect: implements IInvestigationStore as FileInvestigationStore, one plain JSON file per investigation id at <directory>/<id>.json; write() reads for an existing file first and refuses via InvestigationAlreadyStoredError before ever calling the shared writer, otherwise persists via writeJsonFile; read() answers the stored document and its content hash, or undefined for an id never written
- path: src/errors/investigation-already-stored.error.ts
  effect: adds InvestigationAlreadyStoredError, the business refusal a write raises when the given investigation's id already has a stored file
- path: src/errors/investigation-store.error.ts
  effect: adds InvestigationStoreError, the data error a read (or write's own existence check) raises when an investigation file cannot be read or does not hold valid JSON
criteria:
- criterion: Writing an investigation whose identity is already stored is refused rather than overwriting the earlier file.
  met: true
  how: FileInvestigationStore.write reads for a file at the investigation's own id via readJsonFileOrAbsent before any write; when that read answers anything other than absence, write throws InvestigationAlreadyStoredError and writeJsonFile is never reached, so an already-stored identity is refused rather than overwritten.
- criterion: A written investigation is retrievable afterwards by its identity, whole and unchanged.
  met: true
  how: write persists the exact given Investigation object via writeJsonFile, and read(id) answers { document, hash } from the same file, JSON.parse of exactly the bytes that write serialized, so the retrieved document is structurally the same investigation, pinned by the sha256 of what the read actually found on disk.
- criterion: The store's write reuses the shared JSON-file writer rather than a second file-writing routine.
  met: true
  how: the only file-writing call anywhere in FileInvestigationStore is writeJsonFile from src/persistence/json-file.ts, the same helper FileCaseStore already calls; the pre-write existence check is a read (readJsonFileOrAbsent), never a second writer.
nodes:
- node: rules/investigation/an-investigation-is-written-once
  encoded_at:
  - src/investigation/investigation-store.port.ts
  - src/persistence/file-investigation-store.repository.ts
  - src/errors/investigation-already-stored.error.ts
  how: 'IInvestigationStore exposes only write and read, no update, patch or delete operation exists anywhere in its shape. FileInvestigationStore.write answers the written-once half directly by refusing, through InvestigationAlreadyStoredError, before touching the filesystem where the given investigation''s id already has a file. The rule''s other clause, that no intermediate domain state persists, is out of this task''s own scope per its Notes: satisfied trivially here by exposing no partial-write operation at all, but the guarantee that this store is invoked exactly once, only after the aggregate is whole, belongs to task/investigation-lifecycle/diagnose-entry-point.'
- node: constraints/the-mvp-persists-to-no-database
  encoded_at:
  - src/persistence/file-investigation-store.repository.ts
  how: FileInvestigationStore persists an investigation as one plain JSON file per id, read and written through node:fs via the shared readJsonFileOrAbsent/readJsonFileWithTextOrAbsent/writeJsonFile helpers; no database driver, ORM or embedded engine is introduced anywhere in this delivery.
inferences:
- inferred: IInvestigationStore.write takes the typed Investigation directly rather than an opaque unknown document, while read still answers the stored document opaquely as unknown (StoredInvestigation, mirroring StoredCaseVersion's document/hash split).
  from: the task's own ADVISORY note that this store persists an already-whole object as an opaque JSON document, mirroring the case module's own store/model split, and the further fact that unlike a case document, the only value this port's write ever receives is already validated by investigation-factory.ts, so there is no draft state that widening write to unknown would protect against, only weaker type safety at the one call site that exists. read stays opaque because this store, like FileCaseStore, neither parses nor validates what it reads back.
- inferred: write's pre-check-then-write is not atomically race-safe against a concurrent writer of the same id.
  from: the shared writeJsonFile helper offers no atomic exclusive-create primitive, and no criterion of this task asks for safety against a concurrent write.
- inferred: an investigation's file layout is one plain file per id at <directory>/<id>.json, with the .json ending kept as a private constant local to file-investigation-store.repository.ts rather than exported and shared the way case.ts exports CASE_DOCUMENT_ENDING.
  from: the case module's own per-record file-layout convention and the task's own suggested shape. Kept local because no specification node ties an investigation's identity to its file name, so no second call site anywhere in this tree needs to share the constant.
- inferred: the refusal is a distinct business-error class (InvestigationAlreadyStoredError) separate from the data-error class used for unreadable/invalid files (InvestigationStoreError).
  from: 'the same two-kind error split this codebase already draws elsewhere: ConceptAlreadyAnsweredError/DuplicateConceptAnswerError as business refusals versus CaseStoreError/CapabilityStoreError/GlossaryStoreError as data errors.'
divergences:
- cites: COR-02
  file: src/persistence/file-investigation-store.repository.ts
  departure: InvestigationAlreadyStoredError, which this repository raises, carries a name, a message and a context field, but no status.
  why: this tree serves no transport yet and holds no status map, COR-04 puts each error's status in one place once a transport arrives, and every existing error in this tree carries none, the same departure already disclosed for DuplicateConceptAnswerError, ConceptAlreadyAnsweredError, CaseStoreError, CapabilityStoreError and GlossaryStoreError in this project's own prior deliveries.
- cites: COR-02
  file: src/persistence/file-investigation-store.repository.ts
  departure: InvestigationStoreError, which this repository also raises, carries a name, a message and a context field, but no status.
  why: the same reason, consistent with CaseStoreError, CapabilityStoreError and GlossaryStoreError beside it, the mapping belongs to the one place COR-04 names once a transport exists.
deferred:
- what: a wiring factory under src/factories/ (e.g. investigation-store.factory.ts, mirroring case-store.factory.ts's createCaseStore) that constructs FileInvestigationStore from a data directory.
  why: this task's own What it is names only the port and its file-backed implementation, not a wiring point; no criterion of this task calls for one, and the composing task that will actually hold and call this store, task/investigation-lifecycle/diagnose-entry-point, is where wiring the whole lifecycle, including this store, belongs.
---

## What it is

The file-backed store that gives a written investigation nowhere to be overwritten. It reuses the same JSON-file read/write helpers every other file store in the tree already shares.

## Notes

None.
