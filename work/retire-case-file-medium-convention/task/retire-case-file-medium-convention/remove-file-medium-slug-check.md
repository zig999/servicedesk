---
title: Retire the case's file-medium slug convention
summary: Removes the file-name-matching structural check and the JSON-document framing that case.ts, parse-case-document.ts, case-query.service.ts and release.operation.ts still carry from before persistence moved to one relational store.
objective: A case version's structural parse, its read-case service, and its release operation no longer check or reference any relationship between the case's slug and a file name, since no node states one any longer.
criteria:
  - Reading a case version through case-query.service.ts's readCase no longer refuses it for any relationship between the case's slug and a file name — parse-case-document.ts's structural parse takes no fileName argument and runs no slug-equals-file-name check.
  - case.ts declares no CASE_DOCUMENT_ENDING export or any other file-name-medium constant.
  - case-query.service.ts's structuralCase calls parseCaseDocument with only the parsed document and the case's own already-known slug, never a synthesized file name.
  - release.operation.ts's release operation calls parseCaseDocument with only the parsed document and the case's own already-known slug, never a synthesized file name via CASE_DOCUMENT_ENDING.
implements:
  - rules/knowledge/a-slug-identifies-one-case
  - constraints/the-system-persists-to-one-relational-database
sources:
  - intake/scope.md
---

## What it is

A corrective increment: one wrong behavior observed by running /reconcile over case-management-http-api's post-closure code drift, answering to no criterion of any task under that closed plan — the file-name check and its two retired citations (constraints/a-case-is-stored-as-one-json-document, rules/knowledge/the-slug-matches-the-file-name) predate that plan's own tasks.

## Notes

None.
