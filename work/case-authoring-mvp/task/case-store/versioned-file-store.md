---
title: Versioned case file store
summary: The file-backed store that holds every case version as one plain JSON document, pinned by content.
rationale: The scope stated the persistence without a database as one deliverable; the store is cut from the published read because how a version is kept and what a reading validates change for different reasons.
objective: Every version of every case persists as one plain JSON file and remains readable by slug and version, pinned by its content hash.
criteria:
  - The store holds exactly one JSON document per case version, and no second store holds any part of a case.
  - Storing a new version leaves every earlier version readable, the index keeping all versions rather than the last.
  - A stored case reads back by slug and version, and the hash it answers is the content identity of the document read.
  - Loading a case is reading one file.
  - The dependency manifest declares no database driver and the deployment provisions no database service.
depends_on:
  - task/case-model/case-document-model
implements:
  - rules/knowledge/every-case-version-remains-readable
  - contracts/knowledge/case-query
  - constraints/the-mvp-persists-to-no-database
  - constraints/a-case-is-stored-as-one-json-document
sources:
  - intake/scope.md
---
## What it is
The MVP's persistence: plain JSON files where a database would otherwise sit, with every version kept so old investigations stay reproducible.

## Notes
UNDERDETERMINED, from the specification — no criterion requires any validator rule to run when a case is read: the validation clause of rules/knowledge/validation-runs-at-every-read and of contracts/knowledge/case-query reaches no criterion here, and the rule is not in implements because a store record could never answer it, but nothing written excludes the wrong composition. Passes as written: exposing the store's raw file read as the knowledge context's read-case operation, running no validator rule, which the rule and the contract refuse for new diagnoses.
Advisory — constraints/a-case-is-stored-as-one-json-document states its fitness as exactly one JSON document per case while criterion 1 counts per case version; one document per version is the only reading under which all-versions-readable and the content pin both hold, but a reviewer applying the fitness literally would refuse the versioned store, and the fitness wording does not say per version.
Advisory — constraints/the-mvp-persists-to-no-database is system-scoped and this task demonstrates it for case versions only; the tasks that write the system's other records answer it for theirs.
Advisory — contracts/system/case-authoring is not implemented here: the capability governs authoring and validation this store neither performs nor demonstrates, and it leaves a seam — the capability's unit is an authored markdown file while this store's unit is one JSON document, and the step between them is located by no criterion of this task.
Advisory — no candidate states the content-identity function: criterion 3 and the contract pin by content, but which function produces that identity is stated nowhere, and whatever the store answers must be the same identity a replay pins, so the choice made here binds every task that pins.
