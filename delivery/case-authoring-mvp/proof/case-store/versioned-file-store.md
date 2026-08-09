---
title: Proof for the versioned file case store
summary: Real-filesystem tests over FileCaseStore proving one JSON document per case version, a growing directory-derived index, content-pinned reads, single-file loads, and the manifest half of the no-database constraint by reuse.
implementation: sha256:e37a0eab9810f4046b99e60fcc111cd6b47a4092b48dc1cc2b4df8e2171e47f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-store-versioned-file-store-suite-2
tests:
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: persists a written case version as a plain JSON file at <slug>/<version>.json
    proves: "The store holds exactly one JSON document per case version, and no second store holds any part of a case. — the one-document half"
    fails_when: writeVersion stops creating that exact file, writes the document somewhere else, or the file's content stops matching what was given
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: writes no file anywhere in the data directory besides each version file itself
    proves: "The store holds exactly one JSON document per case version, and no second store holds any part of a case. — the no-second-store half"
    fails_when: any write ever produces an extra file — an index, a manifest, a per-slug metadata file — anywhere under the data directory
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: keeps every earlier version readable after later versions of the same case are written
    proves: "Storing a new version leaves every earlier version readable, the index keeping all versions rather than the last. — readability half"
    fails_when: writing version 2 or 3 overwrites, loses, or corrupts the document stored under an earlier version number
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: grows the list of versions with each write instead of keeping only the last
    proves: "Storing a new version leaves every earlier version readable, the index keeping all versions rather than the last. — index half"
    fails_when: listVersions ever answers only the most recently written version instead of the accumulated set
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: derives listVersions from the version files present on disk right now, not from a record kept beside them
    proves: the implementation's inference that no version-list or manifest file is ever written; listVersions is answered by reading the slug's directory entries fresh on every call
    fails_when: listVersions keeps answering a version whose file was removed directly from the filesystem
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: answers a stored version with a hash equal to the sha256 of the exact bytes its file holds
    proves: "A stored case reads back by slug and version, and the hash it answers is the content identity of the document read."
    fails_when: readVersion's hash stops matching an independently computed sha256 of the exact file bytes
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: answers undefined for a version that was never written
    proves: the absent-input edge of criterion 3 — an unwritten version is data, never a failure
    fails_when: readVersion throws, or answers anything other than undefined, for a version number that was never written
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: answers no versions for a case slug that was never written
    proves: the empty-collection edge behind criterion 2's index — an absent case reads as no versions
    fails_when: listVersions throws or answers anything other than an empty array for a slug with no files on disk
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: reads one version unaffected by another version file of the same case being unreadable
    proves: "Loading a case is reading one file."
    fails_when: reading a valid version starts failing or changing its answer because a sibling version's file is missing or holds invalid content
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: resolves writeVersion with nothing, leaving hashing to a subsequent read
    proves: the implementation's inference that writeVersion answers nothing; only readVersion answers a hash
    fails_when: writeVersion starts resolving with a value instead of void
  - file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    name: refuses with a CaseStoreError when a version file does not hold valid JSON
    proves: the read failure path CaseStoreError exists for — a version file whose content is not valid JSON is refused rather than silently misread
    fails_when: readVersion throws something other than CaseStoreError, or resolves normally, over a version file that is not valid JSON
not_applicable:
  - edge_case: two writeVersion calls against the same slug and version number at once
    why: no criterion or specification node states what a concurrent write to one version's own file resolves to
  - edge_case: a version file or case directory unreadable due to a filesystem permission failure
    why: reproducing a non-ENOENT read/readdir failure needs OS-level permission manipulation not portable across environments; every sibling persistence spec in this tree stops at the not-valid-JSON failure for the same reason
  - edge_case: a duplicate write to an already-stored version number
    why: no criterion states that the store enforces version-number uniqueness or refuses a repeat; the readability test already proves an earlier version's file is untouched by a later write
  - edge_case: version-number boundaries such as zero or a negative number
    why: nothing in this task's criteria constrains valid version identifiers; the store treats the version purely as a path segment
  - edge_case: a slow or unavailable filesystem dependency
    why: no criterion states degraded behavior under a slow or failing filesystem, and no sibling persistence spec in this tree tests it either
untested:
  - the task's UNDERDETERMINED note about exposing this store's raw read as read-case — no file this task writes performs or exposes that composition, so no test against this task's code could fail over the implementation the note names; settling it is task/case-store/read-case's
  - the deployment half of criterion 5 — no deployment artifact exists in this repository for a test to audit; the manifest half is proven by the existing dependency-manifest audit, reused rather than duplicated
divergences:
  - cites: TST-01
    file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts
    departure: the index-growth test interleaves act and assert three times (write, then check the list, repeated) rather than one arrange/act/assert pass.
    why: the claim under proof is that the index reflects each write's state right after that write, before any further write happens — a single final assertion could not distinguish an index that grew from one reset and rebuilt at the last write
---
## What it is
Twelve tests over the real filesystem: one document per version, an index that only grows and is read fresh from disk, hashes pinned to exactly what a read found, single-file loads, and the typed refusal for unparseable content.

## Notes
The suite's first run (run/case-store-versioned-file-store-suite) failed at typecheck on a readonly-array .sort() call in this proof's own test file — fixed by copying into a mutable array before sorting, with no change to what the test asserts. This record points at the run that followed, run/case-store-versioned-file-store-suite-2; the failed run's log stands as its own history.
The task's UNDERDETERMINED note about exposing this raw read as read-case is intentionally out of this proof's reach — this task's files never perform that composition, so no test here could exclude it; read-case's own proof carries that exclusion.
