---
title: create-draft operation
summary: A thin ICreateDraft/CreateDraftOperation pair that originates a new draft version by delegating
  version assignment, the at-most-one-draft refusal and the manifest copy-source decision entirely to
  ICaseStore.createDraft.
task: sha256:e78d918072a89e5818d86e5d85d994d304d7e47f93c35ecb3a943540c3890219
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/create-draft.operation.ts
  effect: exports CreatedDraft, the ICreateDraft interface and CreateDraftOperation, whose createDraft(input)
    calls this.caseStore.createDraft(input) and answers { slug, version } — no local version tracking,
    no manifest logic and no re-decided refusal.
criteria:
- criterion: Creating a draft for a case with no open draft succeeds, assigned a version number greater
    than every version number the case has ever held, including a discarded one.
  met: true
  how: CreateDraftOperation.createDraft never computes or caches a version number itself; it awaits this.caseStore.createDraft(input),
    which RelationalCaseStore answers through one atomic UPDATE cases SET next_version = next_version
    + 1 ... RETURNING next_version - 1, so the value handed back is always the case's own durable counter
    freshly advanced, never a value discarding a draft could make available again.
- criterion: Creating a draft for a case that already holds an open draft is refused, naming that a draft
    already exists.
  met: true
  how: No catch surrounds the delegated call, so CaseAlreadyHasDraftError — which RelationalCaseStore's
    createDraft already raises from the schema's case_versions_one_draft_per_case constraint — propagates
    to the caller unchanged, naming the case's slug.
- criterion: A draft created naming no source version copies the manifest of the case's own latest released
    version, empty where the case holds no released version yet.
  met: true
  how: input.source_version is passed through to ICaseStore.createDraft untouched; where it is absent,
    RelationalCaseStore's own resolveSourceVersion reads the case's latest released version, or copies
    nothing where that query answers no row.
- criterion: A draft created naming a historical version copies that version's own manifest instead of
    the latest released one.
  met: true
  how: Where input.source_version is present, CreateDraftInput carries it through this operation unchanged,
    and RelationalCaseStore's resolveSourceVersion returns it directly.
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/create-draft.operation.ts
  how: This file is the create-draft operation the published contract declares among its six — a callable
    entrance a consumer reaches through ICreateDraft, composed alongside the other five operations by
    wire-and-retire-author-case-version.
- node: domain/knowledge/case
  encoded_at:
  - src/case/create-draft.operation.ts
  how: Case's own declared create-draft operation is this file's one method. The next_version invariant
    it names is honored by delegating version assignment entirely to ICaseStore.createDraft rather than
    reading or computing next_version here.
- node: domain/knowledge/case-version
  how: This operation originates a new case-version by handing CreateDraftInput to ICaseStore.createDraft
    whole and unmodified; every attribute the aggregate declares is already shaped by case-store.port.ts
    and case.ts from sibling tasks.
- node: domain/knowledge/manifest-entry
  how: The new draft's manifest entries are copied by ICaseStore.createDraft's own manifestCopyStatement,
    entry for entry, from whichever source version is resolved. This operation composes no manifest entry
    itself.
- node: rules/knowledge/a-case-has-at-most-one-draft
  how: 'Honored by delegation: this operation performs no independent draft-existence check of its own,
    and never swallows the refusal the store''s own unique-violation mapping raises.'
- node: rules/knowledge/a-case-version-number-is-never-reused
  how: This is the node the task's own UNDERDETERMINED note concerned. CreateDraftOperation reads no next_version
    value and caches none across invocations — every call reaches this.caseStore.createDraft afresh, so
    the counterexample the note describes cannot arise in this file.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  how: 'Honored by delegation: input.source_version is passed through unchanged and this operation makes
    no decision of its own about which version to copy from or when to copy nothing.'
inferences:
- inferred: create-draft's own answer shape is { slug, version } (CreatedDraft), mirroring author-case-version.service.ts's
    own AuthoredCaseVersion, rather than answering the bare version number ICaseStore.createDraft itself
    returns.
  from: No node names an output shape for create-draft. AuthorCaseVersionService already established the
    convention that a curator-facing write answers with the identity to continue authoring against, and
    no caller yet depends on any other shape.
preserved:
- ICaseStore's interface shape (case-store.port.ts) — untouched, read only.
- Every other lifecycle operation this task does not implement (discard, revise, place-hypothesis, remove-hypothesis,
  release) — untouched.
deferred:
- what: Wiring CreateDraftOperation into any composition root, factory or HTTP entrance.
  why: Reserved for task/case-lifecycle-operations/wire-and-retire-author-case-version, which composes
    all five sibling operations at once — completed later in this same delivery.
- what: The counter's own advancement across repeated createDraft calls (the task's own UNDERDETERMINED
    note) was closed by construction (no local state) rather than by an added test-time check.
  why: test-author's own integration proof for this task exercises a second draft creation on the same
    case explicitly, per this task's own note, and confirmed the counter genuinely advances.
---

## What it is

The one entrance to a new draft, whether starting fresh from the latest release or rolling back to an older one.
It never itself places or removes a manifest entry.

## Notes

This task's own build run reflects the whole epic's final green state (install, typecheck, lint, secret-scan), captured once every sibling task in this continuous delivery had also landed. No proof record is composed yet, per the human's own explicit instruction: implementation records close first, the suite is settled separately.
