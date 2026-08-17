---
title: ICaseStore gains listHypotheses
summary: Adds a read-only listHypotheses operation to ICaseStore and RelationalCaseStore, returning every
  hypothesis a named case has ever originated, queried directly against the identity-only hypotheses table
  rather than scoped by any version's manifest.
task: sha256:17a6fa373b78c9a1ff27fbd4da0af9990bbb0bfc5dfb9c47f36e77a83740ca6c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
files:
- path: src/case/case-store.port.ts
  effect: declares HypothesisIdentity (name alone) and adds listHypotheses, documented as case-scoped
    by the hypothesis's own identity row and never by any one version's current manifest.
- path: src/persistence/relational-case-store.repository.ts
  effect: implements listHypotheses via listHypothesesPage, reusing requireCaseIdentity and pageCountOf,
    reading the hypotheses table directly by case_slug — never joined through case_version_hypotheses
    or any manifest.
- path: src/__tests__/unit/case/case-query.service.spec.ts
  effect: added a minimal listHypotheses stub to FakeCaseStore (unconditional empty page).
criteria:
- criterion: Calling listHypotheses with an existing slug returns every hypothesis that case currently
    holds, paginated per src/types/pagination.ts.
  met: true
  how: listHypotheses(slug, pagination) runs requireCaseIdentity, countHypotheses and hypothesesPageSelect
    through one transaction against the hypotheses table filtered by case_slug alone — never scoped through
    case_version_hypotheses or any manifest, per the task's own UNDERDETERMINED note.
- criterion: Calling listHypotheses with a slug that does not exist is refused with CaseNotFoundError.
  met: true
  how: listHypothesesPage opens by awaiting requireCaseIdentity(tx, slug), which throws CaseNotFoundError
    before any hypotheses row is ever read.
nodes:
- node: contracts/knowledge/case-query
  how: 'Answers this contract''s own declared list-hypotheses operation: the hypotheses of one named case
    — case-scoped.'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  how: The named slug is the case's own stable identity this task reads by; requireCaseIdentity checks
    exactly that identity row, independent of any version.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  how: 'Directly answers the task''s own UNDERDETERMINED note: a hypothesis is named uniquely within its
    case across every version — past, current or future. HypothesisIdentity carries only the node''s own
    declared name attribute.'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-case-is-read-whole
  how: Not exercised by this task (REMAINDER note) — listHypotheses reads no version and assembles nothing.
inferences:
- inferred: HypothesisIdentity's shape — the hypothesis's own bare name alone, no case_slug field.
  from: domain/knowledge/hypothesis's own one declared attribute beyond its case relationship, and the
    port's own sibling convention of a listing item carrying only what a listing states about each row.
- inferred: Reusing requireCaseIdentity and pageCountOf rather than writing new identity-check or page-count
    logic.
  from: MNT-03 and the file's own existing convention.
- inferred: Adding a minimal empty-page listHypotheses stub to FakeCaseStore rather than leaving that
    file untouched.
  from: the prior two sibling deliveries in this same file already established this as the convention
    for keeping an existing test double satisfying ICaseStore in full.
preserved:
- Every existing ICaseStore method's own signature and behavior — none touched.
- RelationalCaseStore's class-level docstring, unchanged.
- Every existing assertion in case-query.service.spec.ts.
---

## What it is

A new read-only ICaseStore method, listHypotheses, case-scoped rather than version-scoped per the task's own UNDERDETERMINED note.

## Notes

None.
