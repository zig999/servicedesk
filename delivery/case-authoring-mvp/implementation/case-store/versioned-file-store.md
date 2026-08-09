---
title: Versioned file store for case versions
summary: A file-backed ICaseStore that persists every version of every case as its own JSON document under <slug>/<version>.json, and answers a read pinned by the sha256 content identity of the exact bytes it just read.
task: sha256:c2fc225e4b1c674c8afebc07569b091ef893db39dfd9842f363a9d15c9b456ea
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-store-versioned-file-store-build
files:
  - path: src/case/case-store.port.ts
    effect: declares ICaseStore (writeVersion, readVersion, listVersions) and StoredCaseVersion — the domain-owned port a case's persistence reaches through, naming no read-case operation and importing no infrastructure
  - path: src/persistence/file-case-store.repository.ts
    effect: implements ICaseStore as FileCaseStore — one plain JSON file per case version at <directory>/<slug>/<version>.json, an absent version answered as undefined, a read pinned by hashing the exact bytes it found, and the version index derived by listing the slug's directory rather than kept in a second file
  - path: src/errors/case-store.error.ts
    effect: adds CaseStoreError, the typed data error FileCaseStore raises for an unreadable or non-JSON version file or an unlistable case directory
  - path: src/factories/case-store.factory.ts
    effect: adds createCaseStore(dataDirectory), wiring FileCaseStore behind ICaseStore; wires no published query, since composing one is a later task's job
  - path: src/persistence/json-file.ts
    effect: adds readJsonFileWithTextOrAbsent (answers both a file's parsed data and its exact text, or undefined on absence) and exports isAbsence for reuse by a directory listing; readJsonFileOrAbsent now delegates to the new function but its own signature and behavior are unchanged
criteria:
  - criterion: The store holds exactly one JSON document per case version, and no second store holds any part of a case.
    met: true
    how: FileCaseStore.writeVersion persists the whole given document into exactly one file per (slug, version) via writeJsonFile; no manifest, index or metadata file is ever written anywhere, and listVersions derives the version set purely from the slug directory's own entries
  - criterion: Storing a new version leaves every earlier version readable, the index keeping all versions rather than the last.
    met: true
    how: each version's file sits at its own path; writeVersion only ever creates or overwrites the file for the version number it is given, never an earlier one's file, and listVersions re-reads the directory on every call, answering every version number present
  - criterion: A stored case reads back by slug and version, and the hash it answers is the content identity of the document read.
    met: true
    how: readVersion(slug, version) reads the one file at that path and answers { document, hash }, where hash is the sha256 hex digest of the exact text that read call found on disk — computed from the bytes just read
  - criterion: Loading a case is reading one file.
    met: true
    how: readVersion issues exactly one file read per invocation; no second file, index or store is consulted to answer a version
  - criterion: The dependency manifest declares no database driver and the deployment provisions no database service.
    met: true
    how: this delivery adds nothing to package.json — FileCaseStore uses only node:crypto, node:fs/promises and node:path — so the manifest is unchanged and still declares none of the excluded database drivers
nodes:
  - node: rules/knowledge/every-case-version-remains-readable
    encoded_at:
      - src/case/case-store.port.ts
      - src/persistence/file-case-store.repository.ts
    how: every version persists as its own file; writeVersion for one version never touches another version's file, and listVersions answers the full set of stored version numbers by reading the directory fresh each call, so the index keeps every version rather than the last
  - node: contracts/knowledge/case-query
    encoded_at:
      - src/case/case-store.port.ts
      - src/persistence/file-case-store.repository.ts
    how: this task builds only the storage primitive the operation's persistence half needs; it deliberately does not implement the published read-case operation itself — no validator rule runs here, and this store is not wired as the knowledge context's published query; composing this store with parseCaseDocument and validate-case-coherence into the actual read-case is task/case-store/read-case's job
  - node: constraints/the-mvp-persists-to-no-database
    encoded_at:
      - src/persistence/file-case-store.repository.ts
      - src/persistence/json-file.ts
    how: every case version lands as a plain JSON file under a caller-chosen data directory, written and read through node:fs/promises alone; package.json is unchanged and declares no database dependency
  - node: constraints/a-case-is-stored-as-one-json-document
    encoded_at:
      - src/persistence/file-case-store.repository.ts
    how: each stored unit — one case version — is exactly one JSON document at its own file; reading it back is exactly one file read, so loading a case version is reading one file and pinning it is hashing that one file's bytes; the fitness's per case is read here as per case version, the only reading under which this constraint and every-case-version-remains-readable hold together with criterion 1's per-version counting
inferences:
  - inferred: content identity is the sha256 hex digest of the exact UTF-8 bytes a read finds on disk — never a hash the document's own attributes might carry, and never a hash of a re-serialization of the parsed value
    from: the task file's own advisory that no candidate node states the content-identity function; sha256 is the algorithm this task's design guidance names, and hashing the exact text a read call returns ties the answer to precisely what readVersion just read
  - inferred: no version-list or manifest file is ever written; listVersions is answered by reading the slug's directory entries fresh on every call, never by a persisted index
    from: the storage constraint's fitness together with criterion 1 — a persisted file naming which versions exist would itself be a second store holding part of the case
  - inferred: the file layout is one JSON document per case version, at <dataDirectory>/<slug>/<version>.json, rather than one document per case with every version embedded inside it
    from: the task's own advisory that the fitness names exactly one JSON document per case while only a per-version reading lets every earlier version stay readable and content be pinned per version at once
  - inferred: the per-version file's ending reuses CASE_DOCUMENT_ENDING from src/case/case.ts, with the version number as the file's stem and the slug as the enclosing directory
    from: case.ts's own documented convention for the ending a case document carries, reused rather than restated
  - inferred: writeVersion answers nothing; only readVersion answers a hash
    from: criterion 3 constrains only what a read answers; no criterion asks write to compute or return one
preserved:
  - readJsonFileOrAbsent's existing signature and behavior for FileGlossaryStore and FileCapabilityStore — undefined on an absent file, the caller's raised error on an unreadable or non-JSON file
  - writeJsonFile's existing signature and behavior — the exact bytes it writes for FileGlossaryStore and FileCapabilityStore are unchanged
  - the existing file-glossary-store.repository.ts and file-capability-store.repository.ts modules compile unmodified against json-file.ts's exports
deferred:
  - what: the published read-case operation composing this store with structural and coherence validation into one refusal.
    why: it is task/case-store/read-case's objective, which depends on this task
---
## What it is
Pure storage for case versions: one JSON file per version, no separate index, content identity computed from exactly the bytes a read found — the primitive read-case will compose with the domain's parse and coherence checks.

## Notes
The directory listing IS the index — a persisted manifest would itself be a second store holding part of the case, which the storage constraint refuses.
The "per case" vs "per case version" reading of the storage constraint's fitness is resolved here as per-version, the only reading under which every-case-version-remains-readable and this constraint hold together.
