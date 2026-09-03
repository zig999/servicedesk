---
title: Overwriting a hypothesis revision's content in place
summary: Integration tests against RelationalCaseStore.overwriteHypothesisRevision proving all six task
  criteria, the record's own inferences, and that the write distinguishes a released-referenced refusal
  from an ordinary write failure.
implementation: sha256:32102468294aab45466386577158c95236e13fdc500a706741b9de0eddc08052
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-suite-3
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: overwrites a revision's content while leaving its own revision number exactly as it was before
  proves: After the replacement, that revision's number is the number it held before.
  fails_when: overwriteHypothesisRevision changes the row's own revision number, or replaces the row by
    deleting it and inserting a new one under a different number
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the replacement's own criterion and resolution, once that revision is read back after
    the overwrite
  proves: After the replacement, reading that revision answers the criterion and the resolution the replacement
    carried.
  fails_when: the stored criterion or any of the three resolution columns is not overwritten with what
    the replacement carried
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers exactly the concepts the replacement carried, once that revision's collects are read back
    after the overwrite
  proves: After the replacement, reading that revision's collects answers exactly the concepts the replacement
    carried.
  fails_when: a concept named by the replacement is missing from, or a spurious one is present in, the
    collects read back afterward
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers none of the concepts the revision collected before the replacement, once the replacement
    drops them all
  proves: After the replacement, none of the concepts the revision collected before the replacement is
    answered by that revision's collects.
  fails_when: a concept the revision held before the overwrite is still answered by its collects after
    the replacement dropped it
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and
    no fewer
  proves: After the replacement, the hypothesis holds exactly the revisions it held before, no more and
    no fewer.
  fails_when: overwriteHypothesisRevision inserts or deletes a hypothesis_revisions row instead of updating
    the one named
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite
    assigns no revision number the hypothesis had already assigned elsewhere
  proves: The replacement assigns no revision number that the hypothesis had already assigned to a different
    revision.
  fails_when: overwriting one revision alters the number or content of a different, sibling revision of
    the same hypothesis
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: resolves the overwrite with undefined rather than echoing back a revision number the way inserting
    one does
  proves: the inference the implementation recorded — overwriteHypothesisRevision returns Promise<void>
    rather than echoing back the revision number, unlike insertHypothesisRevision's Promise<number>
  fails_when: the resolved value of overwriteHypothesisRevision is anything other than undefined
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: performs the overwrite through the IHypothesisRevisionOverwrite port alone, without needing the
    rest of ICaseStore
  proves: the inference the implementation recorded — the overwrite capability is exposed as a new port,
    IHypothesisRevisionOverwrite, rather than as a method added to ICaseStore, so a caller holding only
    that narrower port can still perform and observe the write
  fails_when: RelationalCaseStore stops satisfying IHypothesisRevisionOverwrite, or a call made through
    a reference typed to that port alone fails to persist the replacement
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: resolves without raising, leaving no new row behind, when the named revision does not exist for
    that hypothesis
  proves: the inference the implementation recorded — the UPDATE performs no existence check of its own,
    no read-before-write and no typed 'revision not found' error, before writing into the named revision
  fails_when: overwriteHypothesisRevision throws for a revision number the hypothesis never held, or a
    row is created for that never-held number
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses an overwrite attempt against a revision a released case version still references through
    a distinguishable error, rather than surfacing it as an undifferentiated write failure
  proves: the inference the implementation recorded — overwriteRevision's own error raiser recognizes
    migration 0019's trigger-raised ReleasedHypothesisRevisionNotAlterableError and re-raises it as the
    same-named typed error, rather than letting it fall through as the generic 'a write against the case
    store failed'
  fails_when: the rejection a caller sees for this exact scenario carries the generic write-failure message
    instead of a distinguishable one
not_applicable:
- edge_case: two overwrites of the same revision issued at once
  why: no criterion or bound node states an ordering or isolation guarantee for two concurrent writes
    to one revision; the outcome is ordinary UPDATE last-writer-wins semantics, which no criterion here
    distinguishes from a single write
- edge_case: a replacement whose collects list names the same concept more than once
  why: 'neither the task''s criteria nor domain/knowledge/hypothesis-revision (which declares collects
    only as "many: true", stating no uniqueness) claims any behavior for a duplicate; whether it succeeds,
    errors, or dedupes is not this task''s stated concern'
- edge_case: overwriting a revision naming a case_slug or hypothesis_name that never existed at all, as
    opposed to a revision number that never existed
  why: revisionOverwriteStatement's WHERE clause is one equality check across case_slug, hypothesis_name
    and revision together with no branch specific to any one column, so this is the same code path as
    "resolves without raising ... when the named revision does not exist"; a separate test would exercise
    nothing the existing one does not already cover
untested:
- 'the consequence of overwriting a revision number that does not exist while the replacement''s own collects
  is non-empty: the DELETE no-ops but the following INSERT then violates hypothesis_revision_collects_revision_fkey,
  surfacing as a generic CaseStoreError from within the same transaction — no criterion addresses this
  composite case, and the behavior is a byproduct of a schema constraint (migration 0009) that predates
  this task rather than a decision it made'
- that OverwriteHypothesisRevisionInput is declared inside case-store.port.ts beside its sibling HypothesisRevisionInput,
  rather than independently in hypothesis-revision-overwrite.port.ts — a file-location decision with no
  runtime-observable consequence, so nothing distinguishes it behaviorally from the alternative the implementation
  record considered and rejected
- that hypothesis-revision-overwrite.port.ts imports only a type from case-store.port.ts, so a caller
  depending on the port alone pulls in no driver, framework or provider client — an import-graph fact
  checkable only by reading the file or a build's module graph, not by anything overwriteHypothesisRevision's
  runtime behavior can distinguish
- whether the distinguishable ReleasedHypothesisRevisionNotAlterableError this write now raises is ever
  mapped to the rule's stated HTTP 409 response — that mapping is deferred, by the implementation record's
  own account, to the revise-hypothesis endpoint task; this proof only shows the store's own rejection
  is distinguishable by class
---

## What it is
Integration tests exercising RelationalCaseStore.overwriteHypothesisRevision against a real database, one per task criterion plus the implementation's own disclosed inferences.

## Notes
run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-suite failed at its lint step over this file's own function-length rule (max-lines-per-function), fixed by shortening the released-referenced test's setup. run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-suite-2 failed at its test step because the worktree's own .env.test (untracked, shared across worktrees) was absent — an environment gap unrelated to either producer's work, fixed by supplying it. The implementation's own error raiser was also revised, ahead of these runs, to distinguish the release-referenced refusal from an ordinary write failure, once the two producers' original disagreement over whether this task's own write was already required to do so was resolved. run/hypothesis-revision-overwrite-overwrite-a-revisions-content-in-place-suite-3 is the run that passed and is what this record pins.
