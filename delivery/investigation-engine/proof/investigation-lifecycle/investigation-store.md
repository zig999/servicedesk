---
title: Proof for the write-once investigation store
summary: Real-filesystem tests over FileInvestigationStore proving one JSON document per investigation id, refusal of an already-stored identity without touching the earlier file, and write's reuse of the shared JSON-file writer, plus the store's error classes exercised through both failure paths.
implementation: sha256:bfaffb898a5461d8b41a7cdf3fa381eaa16775e823dc9b919288f2cfaa812b7a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-investigation-store-suite
tests:
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: persists a written investigation as a plain JSON file at <id>.json directly under the data directory
  proves: the implementation's inference that an investigation's file layout is one plain file per id at <directory>/<id>.json
  fails_when: write() stops writing to <directory>/<id>.json, nests it under a per-id subdirectory, changes the file's ending, or the file's content stops matching exactly what was given
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: creates the data directory when it does not yet exist, the way the shared JSON-file writer does for every other file store
  proves: The store's write reuses the shared JSON-file writer rather than a second file-writing routine.
  fails_when: 'write() stops going through writeJsonFile''s own mkdir(dirname(file), { recursive: true })'
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: resolves write with nothing, leaving hashing to a subsequent read
  proves: IInvestigationStore.write's own declared Promise<void> contract
  fails_when: write starts resolving with a value instead of void
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: answers the written investigation by its id, whole and unchanged
  proves: A written investigation is retrievable afterwards by its identity, whole and unchanged.
  fails_when: read answers a document that differs from what was written, or write/read stops round-tripping the investigation faithfully
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: answers a stored investigation with a hash equal to the sha256 of the exact bytes its file holds
  proves: A written investigation is retrievable afterwards by its identity, whole and unchanged (the content-pin half).
  fails_when: read's hash stops matching an independently computed sha256 of the exact file bytes
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: answers read() with whatever valid JSON a file holds, without validating it against the Investigation shape
  proves: the implementation's inference that read still answers the stored document opaquely as unknown, parsing and validating nothing it reads back
  fails_when: read() starts refusing, or reshaping, a file whose content is valid JSON but does not match the Investigation shape
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: refuses to write an investigation whose id is already stored, rather than overwriting the earlier file
  proves: Writing an investigation whose identity is already stored is refused rather than overwriting the earlier file.
  fails_when: write() overwrites the earlier file with the second call's content instead of refusing, or refuses with anything other than InvestigationAlreadyStoredError
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: leaves the first write's file exactly as it was after a refused second write to the same id
  proves: Writing an investigation whose identity is already stored is refused rather than overwriting the earlier file (that the refusal happens before any write touches the existing file).
  fails_when: the refused second write changes the file's bytes at all instead of leaving exactly what the first write produced
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: answers undefined for an investigation id that was never written
  proves: the absent-input edge of criterion 2, an investigation never written is data, never a failure
  fails_when: read throws, or answers anything other than undefined, for an id that was never written
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: writes two different investigation ids independently, with neither affecting the other
  proves: no cross-id interference, two identities are two independent files
  fails_when: writing the second id fails because the first is already stored, or reading either id answers the other's document
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: answers a different content hash for two investigations written to two different ids
  proves: the hash is the content identity of the document read, not a constant or id-derived value
  fails_when: read answers the same hash for two ids holding different documents
- file: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
  name: refuses with an InvestigationStoreError when an investigation file does not hold valid JSON
  proves: the read failure path InvestigationStoreError exists for, a file whose content is not valid JSON is refused rather than silently misread
  fails_when: read throws something other than InvestigationStoreError, or resolves normally, over a file that is not valid JSON
not_applicable:
- edge_case: two write() calls against the same id at once
  why: no criterion or specification node states concurrent-write behavior; the implementation's own inference records that its check-then-write is not atomically race-safe and that no criterion of this task asks for safety against a concurrent writer.
- edge_case: an investigation file or data directory unreadable due to a filesystem permission failure
  why: reproducing a non-ENOENT read failure needs OS-level permission manipulation not portable across environments; the sibling file-case-store integration spec in this tree stops at the not-valid-JSON failure for the same reason.
- edge_case: an id containing characters unusual for a filesystem path (a path separator, "..")
  why: no criterion or node constrains the shape of an investigation's id; the store treats it purely as a path segment, and which id a request names is resolved upstream of this store.
- edge_case: an empty collection where one comes back
  why: this store exposes only write and read, no listing operation; nothing it answers is ever a collection.
- edge_case: absent or empty-string input to write()
  why: write() takes a typed Investigation whose id is required by the type itself; there is no runtime path to call it without one.
- edge_case: a slow filesystem dependency
  why: no criterion states degraded behavior under a slow or partially failing filesystem, and no sibling persistence spec in this tree tests it either.
untested:
- write's own pre-write existence check raising InvestigationStoreError when an already-stored id's existing file is corrupted rather than valid JSON, instead of ever reaching the InvestigationAlreadyStoredError check, the read() test above proves the same raiseReadFailure/InvestigationStoreError mechanism through read's own call path, but the identical failure through write's distinct pre-check call site is not separately exercised.
---

## What it is

Real-filesystem tests proving the write-once store's three criteria, plus cross-id independence, absence-as-data, and both error paths.

## Notes

None.
