---
title: Proof for POST /v1/cases
summary: Fastify inject()-driven proof, over a locally-assembled app registering createCreateDraftRoutesPlugin plus the shared
  error handler, that a valid request originates a draft and answers 201, that the UNDERDETERMINED reading is excluded, that
  an already-drafted case is refused, and that body validation runs before createDraft.
implementation: sha256:04fd9e79489b69ee05376004a0c7754d334020fc959438dba212fdb26f032832
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
tests:
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: answers 201 with the slug and version createDraft originated, calling createDraft with the parsed body exactly as
    sent
  proves: Criterion 1
  fails_when: the status is not 201, or createDraft is called with a body diverging from what was sent.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: still succeeds, originating the next draft, for a slug already naming an existing case that currently holds no open
    draft
  proves: the UNDERDETERMINED note's own defeated reading — createDraft is mocked to resolve, not reject, for an existing-slug-no-open-draft
    case, and the route must still answer 201.
  fails_when: an implementation adds a slug-existence pre-check that refuses this case outright, or the status is not 201.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: refuses with the status the status map assigns CaseAlreadyHasDraftError when the named case already holds an open
    draft
  proves: Criterion 2
  fails_when: the status/code/details do not match status-map.ts's own CaseAlreadyHasDraftError entry (409).
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: answers 400 for a body missing the required title attribute, without ever reaching createDraft
  proves: Criterion 3
  fails_when: the status is not 400, or createDraft was called.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: answers 400 for a body missing the required slug attribute, without ever reaching createDraft
  proves: Criterion 3 (a second required field, so validation is not accidentally scoped to title alone).
  fails_when: the status is not 400, or createDraft was called.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: succeeds when consolidation_register is omitted from the body entirely, calling createDraft with it absent rather
    than defaulted to some value
  proves: consolidation_register's true-optional handling, matching the implementation record's stated inference.
  fails_when: the status is not 201, or createDraft is called with a consolidation_register key present in any form.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: succeeds when source_version is omitted from the body entirely, calling createDraft with it absent rather than defaulted
    to some value
  proves: source_version's independent true-optional handling.
  fails_when: the status is not 201, or createDraft is called with a source_version key present in any form.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: answers 400 for a malformed fallback whose referral is missing its required recipient, without ever reaching createDraft
  proves: EDG-01/DTO-01 validation boundary for the nested fallback/referral shape.
  fails_when: the status is not 400, or createDraft was called.
- file: src/__tests__/unit/http/create-draft.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when createDraft rejects with a generic,
    non-domain error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- The actual CreateDraftOperation/case-store createDraft implementation (next-version assignment, manifest copy source selection,
  the CaseAlreadyHasDraftError guard itself) is out of scope for this route-level spec by design — per TST-03, CaseLifecycleOperations['createDraft']
  is stood in here as a boundary; that behavior is proved separately where create-draft.operation.ts and the underlying store
  were delivered.
---

## What it is

Nine Fastify-injected tests over POST /v1/cases, proving all three criteria plus the UNDERDETERMINED-defeating case.

## Notes

None.
