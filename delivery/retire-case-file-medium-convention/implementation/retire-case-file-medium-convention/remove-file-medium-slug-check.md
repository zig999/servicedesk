---
title: Retire the case's file-medium slug convention
summary: Removes the fileName-based slug-equals-file-name structural check and the CASE_DOCUMENT_ENDING
  JSON-document-medium constant from parse-case-document.ts, case.ts, case-query.service.ts and release.operation.ts,
  so parseCaseDocument's second parameter is the case's own already-known slug used only to identify a
  refusal.
task: sha256:d08a77e615e68d0639a69cb8a464a64066c8ad3148313e51788aa5599845a51b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/retire-case-file-medium-convention-remove-file-medium-slug-check-build
files:
- path: src/case/case.ts
  effect: Removed the CASE_DOCUMENT_ENDING export and its own header comment citing the retired constraints/a-case-is-stored-as-one-json-document;
    dropped the same retired citation from the module's top-of-file header comment.
- path: src/case/parse-case-document.ts
  effect: Removed the CASE_DOCUMENT_ENDING import; renamed parseCaseDocument's and refuseStructuralViolations's
    second parameter from fileName to slug; deleted slugProblems and heldFileName entirely, and the call
    to slugProblems inside documentProblems; slug now flows only into InvalidCaseDocumentError's identity
    argument.
- path: src/case/case-query.service.ts
  effect: Changed the case.js import to a type-only import (dropped CASE_DOCUMENT_ENDING). structuralCase
    now calls parseCaseDocument(assembledAsRawDocument(assembled), slug) — the case's own already-known
    slug, no synthesized file name.
- path: src/case/release.operation.ts
  effect: Changed the case.js import to a type-only import (dropped CASE_DOCUMENT_ENDING). structuralOutcome
    now calls parseCaseDocument(assembledAsDocument(assembled), assembled.slug) — no synthesized file
    name. Rewrote the module's header-comment paragraph accordingly, citing rules/knowledge/a-slug-identifies-one-case.
criteria:
- criterion: Reading a case version through case-query.service.ts's readCase no longer refuses it for
    any relationship between the case's slug and a file name — parse-case-document.ts's structural parse
    takes no fileName argument and runs no slug-equals-file-name check.
  met: true
  how: parse-case-document.ts's parseCaseDocument/refuseStructuralViolations/documentProblems no longer
    declare or thread a fileName parameter, and slugProblems (the equality check) is deleted along with
    its only helper heldFileName; documentProblems no longer calls it. readCase → structuralCase → parseCaseDocument
    therefore runs no slug-equals-file-name check anywhere in the call chain.
- criterion: case.ts declares no CASE_DOCUMENT_ENDING export or any other file-name-medium constant.
  met: true
  how: The CASE_DOCUMENT_ENDING export and its own header comment (citing the retired constraints/a-case-is-stored-as-one-json-document)
    are deleted from case.ts in full; no replacement constant of any kind was added.
- criterion: case-query.service.ts's structuralCase calls parseCaseDocument with only the parsed document
    and the case's own already-known slug, never a synthesized file name.
  met: true
  how: structuralCase calls parseCaseDocument(assembledAsRawDocument(assembled), slug), where slug is
    structuralCase's own parameter — the case's already-known slug passed in by readCase — never ${slug}${CASE_DOCUMENT_ENDING}
    or any other synthesized string.
- criterion: release.operation.ts's release operation calls parseCaseDocument with only the parsed document
    and the case's own already-known slug, never a synthesized file name via CASE_DOCUMENT_ENDING.
  met: true
  how: structuralOutcome calls parseCaseDocument(assembledAsDocument(assembled), assembled.slug) — the
    assembled version's own already-known slug field, never a string built with CASE_DOCUMENT_ENDING (which
    is no longer imported).
nodes:
- node: rules/knowledge/a-slug-identifies-one-case
  how: The rule's own text states the slug 'stopped being kept unique by the file system the moment the
    file stopped being the medium' — no file-name convention governs slug identity any longer. This delivery
    removes the last code enforcing such a convention, leaving the slug as a bare, already-known identity
    value threaded through parseCaseDocument purely to name a refusal. Nothing here newly enforces slug
    uniqueness (that remains the store's own concern, per case-store.port.ts, untouched by this task);
    this task only retires the code that contradicted the rule's own stated history.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
  - src/case/case.ts
- node: constraints/the-system-persists-to-one-relational-database
  how: The constraint states no record is held in a file the deployment ships or writes. This delivery
    removes the JSON-document-medium framing still surviving in case.ts (the CASE_DOCUMENT_ENDING = '.json'
    constant and its doc comment, plus the stale citation of the already-retired constraints/a-case-is-stored-as-one-json-document)
    and in release.operation.ts's header comment. No file-medium vocabulary remains in the four touched
    files.
  encoded_at:
  - src/case/case.ts
  - src/case/release.operation.ts
inferences:
- inferred: 'parseCaseDocument''s second parameter, though no longer used for any equality check, is kept
    as a required slug: string parameter (renamed from fileName) rather than removed outright, because
    InvalidCaseDocumentError''s constructor still needs an identifying string to name the refused document
    in its message and no node states a different identity to use.'
  from: The task's own criteria 3 and 4 explicitly describe calling parseCaseDocument 'with only the parsed
    document and the case's own already-known slug' — naming the slug as the second argument, not zero
    arguments.
- inferred: Left InvalidCaseDocumentError's own field name (file) and constructor parameter name (file)
    unchanged in errors/invalid-case-document.error.ts, even though the value it now receives is a slug
    rather than a file name.
  from: 'The task names exactly four files to change and does not include the errors module; renaming
    a field there would widen the task beyond its stated scope, and the value passed still type-checks
    against the existing file: string parameter with no functional change.'
preserved:
- parseCaseDocument's structural-violation coverage over every other attribute and every manifest-entry
  rule is untouched — only the slug-equals-file-name check was removed, every other entry in documentProblems
  unchanged in the same declared order.
- InvalidCaseDocumentError's own shape (file, problems) and message format are untouched, so every existing
  catcher of it keeps working exactly as before — only the value passed into its first argument changed
  from a synthesized file name to the already-known slug.
- assembledAsRawDocument (case-query.service.ts) and assembledAsDocument (release.operation.ts), the two
  independent adapters projecting an AssembledCaseVersion into parseCaseDocument's flat raw document shape,
  are unchanged; only the call sites' second argument changed.
deferred:
- what: Test-file fallout from parseCaseDocument's signature change and CASE_DOCUMENT_ENDING's removal
    — src/__tests__/unit/case/parse-case-document.spec.ts, src/__tests__/unit/fixtures/case-fixture-shape.spec.ts,
    src/__tests__/unit/fixtures/case-fixture-observations.spec.ts, src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
    (all call parseCaseDocument with a file-name-shaped second argument, or reference the removed constant),
    and src/__tests__/unit/case/case-document-modules.spec.ts (header comment cites the retired constraint).
  why: This task writes source only; fixing tests to match the retired behavior and stale citations is
    the test-author's, in the next step.
---

## What it is

A corrective increment: one wrong behavior observed by running /reconcile over case-management-http-api's post-closure code drift, answering to no criterion of any task under that closed plan.

## Notes

This is a corrective increment (task/retire-case-file-medium-convention/remove-file-medium-slug-check): the survey and decomposition steps did not run, per the corrective-increment path — there was no tree to discover and nothing to decompose. The task was written directly from the /reconcile finding (siegard-reconcile/case-management-http-api-post-closure-drift.md) and bound by two execution-contract-binder passes, the second widening scope to include release.operation.ts after the first pass's own advisory note.
