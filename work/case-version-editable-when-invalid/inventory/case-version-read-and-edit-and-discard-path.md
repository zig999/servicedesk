---
title: Backend read/validate/edit/discard path for an invalid case-version draft
summary: Surveys the case module and its HTTP layer where readCase throws instead of
  returning a violation list, blocking the editing surface the scope requires while
  discard already bypasses it.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
area:
  - src/src/case
  - src/src/http
  - src/src/errors
modules:
  - name: parse-case-document
    path: src/src/case/parse-case-document.ts
    role: touched
  - name: case-query-service
    path: src/src/case/case-query.service.ts
    role: touched
  - name: case
    path: src/src/case/case.ts
    role: adjacent
  - name: case-version-not-valid-error
    path: src/src/errors/case-version-not-valid.error.ts
    role: touched
  - name: status-map
    path: src/src/errors/status-map.ts
    role: adjacent
  - name: read-case-controller
    path: src/src/http/read-case.controller.ts
    role: touched
  - name: read-case-routes
    path: src/src/http/read-case.routes.ts
    role: adjacent
  - name: read-case-dto
    path: src/src/http/dto/read-case.dto.ts
    role: touched
  - name: update-draft-controller
    path: src/src/http/update-draft.controller.ts
    role: touched
  - name: update-draft-dto
    path: src/src/http/dto/update-draft.dto.ts
    role: adjacent
  - name: case-store-port
    path: src/src/case/case-store.port.ts
    role: depends-on
  - name: discard-controller
    path: src/src/http/discard.controller.ts
    role: adjacent
  - name: discard-operation
    path: src/src/case/discard.operation.ts
    role: adjacent
must_not_duplicate:
  - what: The violation list shape a refused read already carries
    at: src/src/errors/case-version-not-valid.error.ts (context.violations, readonly string[])
  - what: The five draft-attribute fields an editing surface corrects
    at: src/src/http/dto/update-draft.dto.ts:21-27 (updateDraftBodySchema — title, when_to_use, subject, fallback, consolidation_register)
risks:
  - risk: update-draft's own response path calls readCase() a second time to build its DTO, so an update that leaves the draft still failing validation throws from inside the update path itself, before the caller ever sees the updated draft.
    consumers:
      - src/src/http/update-draft.controller.ts
  - risk: The existing read-response DTO schema requires a non-empty manifest (and a non-empty collects on each hypothesis-revision), so it cannot represent a draft whose manifest is empty or otherwise invalid without a shape decision.
    consumers:
      - src/src/http/dto/read-case.dto.ts
      - src/src/http/read-case.controller.ts
---

## What it is

`src/src/case/parse-case-document.ts:41-51` (`parseCaseDocument`) calls `refuseStructuralViolations` (throws `InvalidCaseDocumentError` on any `documentProblems()`, including the missing-manifest/`NO_HYPOTHESIS_PROBLEM` check at line 133/140) before `heldCase()` ever runs, so a document that is structurally parseable but has no manifest entries never becomes a `Case` today.
`src/src/case/case.ts:66` types `Case.manifest` as `readonly ManifestEntry[]`, a plain array with no non-empty constraint, so nothing at the type level stops a `Case` from holding an empty manifest.
`src/src/case/case-query.service.ts:34-39` (`readCase`) calls `structuralCase()` then `refuseIncoherence()`, and both `structuralCase()` (149-158, catching `InvalidCaseDocumentError` and rethrowing `CaseVersionNotValidError`) and `refuseViolations()` (86-90, called from `refuseIncoherence`/`refuseGlossaryIncoherence`) throw instead of returning — there is no path in `readCase()` today that returns a constructed `Case` together with its violation list.
`CaseVersionNotValidError` (`src/src/errors/case-version-not-valid.error.ts`) already carries `context.violations: readonly string[]`, currently only ever thrown, never carried alongside a successful return.
`src/src/errors/status-map.ts:61` maps `CaseVersionNotValidError` to HTTP 409; `InvalidCaseDocumentError` has no entry in `STATUS_BY_ERROR_CLASS` — genuine structural corruption surfaces only via the `CaseVersionNotValidError` rethrow in `structuralCase()`.
`src/src/http/read-case.controller.ts:9-15` (`handleReadCaseRequest`) awaits `caseQuery.readCase()` directly and only reaches `toReadCaseResponse()` (17-31) on success, so any violation throws before a response DTO is built; `toReadCaseResponse()` today assembles its DTO from a fully valid `Case` only.
`src/src/http/read-case.routes.ts:13-25` is the only route wired to `readCase` — `GET /v1/cases/:slug/versions/:version` — the same route rule 1 requires to always offer the editing-surface route, including on a refused reading.
`src/src/http/update-draft.controller.ts:12-20` (`handleUpdateDraftRequest`) calls `caseStore.updateDraft()` then immediately calls `caseQuery.readCase()` again to build its response DTO via `toReadCaseResponse` — so an update that leaves the draft still failing some `validation-runs-at-every-read` rule throws `CaseVersionNotValidError` from inside the update-draft response path itself, before the caller ever sees the updated draft.
`src/src/http/dto/update-draft.dto.ts:21-27` (`updateDraftBodySchema`) already accepts exactly the five attributes rule 2 names — title, when_to_use, subject, fallback, consolidation_register — nothing else.
`src/src/case/case-store.port.ts:145` declares `updateDraft(slug, version, attributes: UpdateDraftInput): Promise<void>` on `ICaseStore`, an existing store-level primitive for writing draft attributes directly, not through the whole-case-read assembly.
`src/src/http/discard.controller.ts:8-9` (`handleDiscardRequest`) and `src/src/case/discard.operation.ts:7-16` (`discardCaseVersion`) read the assembled version straight from `ICaseStore.assembleVersion()` and check only `assembled.state !== 'draft'` — neither calls `parseCaseDocument`, `structuralCase`, or `readCase`, so discard today is already not blocked by `validation-runs-at-every-read`; it only enforces draft state (`CaseVersionNotDraftError`, mapped 409) and, per the route wiring in `discard.routes.ts`, the further explicit act separately.
`src/src/http/dto/read-case.dto.ts:39-51` (`readCaseResponseSchema`) requires `manifest: z.array(manifestEntrySchema).min(1)` — a non-empty manifest — so the existing read-response DTO shape cannot represent a draft whose manifest is empty or otherwise invalid; the scope's DTO shape for rule 2 is left to implementation.

## Notes

The distinction the scope draws — "document not parseable" (`InvalidCaseDocumentError`, must stay blocking) vs. "document parseable but violating a validation rule" (must become an inspectable return) — is drawn today by `parseCaseDocument`'s early throw at `src/src/case/parse-case-document.ts:42`, which folds `NO_HYPOTHESIS_PROBLEM` (an empty or absent manifest) into the same structural-refusal path as genuine type corruption; separating them is the crux of what rules 1 and 2 require.
`CaseVersionNotValidError`'s existing `context.violations` shape is reusable as the violation list rule 2's editing surface needs, rather than inventing a new shape, if `readCase` is changed to return rather than throw it.
`update-draft.controller.ts`'s second `readCase()` call is the same chokepoint as the plain read path — fixing `readCase()` to return violations rather than throw would need to also change how this controller builds its response, since it currently assumes `toReadCaseResponse()` only ever runs on a valid `Case`.
`discard.operation.ts` and `discard.controller.ts` were not found to import `parseCaseDocument`, `structuralCase`, or `readCase` anywhere in the files read; no further investigation surfaced a path where discard is blocked by validation today, consistent with the scope's own suspicion that it may already work.
`readCaseResponseSchema`'s `.min(1)` on `manifest` and on `collects` inside `hypothesisRevisionSchema` are both existing non-empty constraints a reused DTO path could conflict with if rule 2's editing-surface response is built by extending this schema rather than a new one — the scope leaves this shape undecided.
