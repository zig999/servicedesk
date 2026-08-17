---
title: Case management HTTP administration surface
summary: One HTTP route file and controller exist today (POST /v1/diagnose); the 18-endpoint admin surface, three port extensions, and the pagination/status-map infrastructure the standard requires are all new.
area:
  - src/src/http
  - src/src/case
  - src/src/glossary
  - src/src/capability-registry
  - src/src/factories
  - src/src/errors
  - src/src/persistence
sources:
  - work/case-management-http-api/intake/scope.md
modules:
  - name: http
    path: src/src/http
    role: touched
  - name: case
    path: src/src/case
    role: touched
  - name: glossary
    path: src/src/glossary
    role: touched
  - name: capability-registry
    path: src/src/capability-registry
    role: touched
  - name: factories
    path: src/src/factories
    role: touched
  - name: errors
    path: src/src/errors
    role: touched
  - name: persistence
    path: src/src/persistence
    role: depends-on
conventions:
  - statement: A new HTTP route is a thin Fastify plugin under /v1, a controller that constructs no dependency of its own, and a Zod DTO under a dto directory — never a fourth shape.
    seen_at: src/src/http/diagnose.routes.ts
  - statement: A domain refusal is raised as a typed error class carrying a distinct name and a context object, ready to key a status map by class.
    seen_at: src/src/errors/case-not-found.error.ts
  - statement: A draft-only mutation reads the version whole through assembleVersion and refuses explicitly through a typed error when state is not draft, before calling the store's own mutation primitive.
    seen_at: src/src/case/discard.operation.ts
  - statement: A relational store reaches Postgres only through the shared runStatement/runInTransaction helpers over one DatabaseConnection, never importing pg directly.
    seen_at: src/src/persistence/relational-case-store.repository.ts
  - statement: Each of the four case-store leaf factories is the one composition root a new controller's dependencies are wired through; no controller constructs its own store or query directly.
    seen_at: src/src/factories/case-lifecycle.factory.ts
must_not_duplicate:
  - what: The projection from an assembled case version to the raw document shape parseCaseDocument expects — already duplicated once, disclosed as an acknowledged divergence, between case-query.service.ts and release.operation.ts.
    at: src/src/case/release.operation.ts
  - what: The CaseLifecycleOperations closed object literal that wires the six existing case-lifecycle operations.
    at: src/src/factories/case-lifecycle.factory.ts
risks:
  - risk: error-handler.middleware.ts is the single shared error sink; adding status-map.ts changes the response shape of every existing and new route at once.
    consumers:
      - src/src/http/diagnose.routes.ts
  - risk: build-app.ts registers exactly one route plugin inline with no aggregation convention; adding the eighteen new routes without one risks a long, repetitive body.
    consumers:
      - src/src/http/build-app.ts
---

## What it is

`src/src/http/` holds exactly one route family today — `diagnose.routes.ts`, `diagnose.controller.ts`, `dto/diagnose.dto.ts` and the one shared `error-handler.middleware.ts` — and that middleware's own header comment states plainly that no domain error is mapped to a transport status anywhere in the codebase today, so every thrown domain error currently answers 500.
`src/src/case/case-store.port.ts` (`ICaseStore`) and `src/src/case/case-query.port.ts`/`case-query.service.ts` (`ICaseQuery`) declare no `updateDraft`, `listCases`, `listCaseVersions`, `listHypotheses` or `listHypothesisRevisions`.
`src/src/glossary/glossary-query.port.ts` (`IGlossaryQuery`) declares no `listVocabularyTerms` or `listConcepts`.
`src/src/capability-registry/capability-query.port.ts` (`ICapabilityQuery`) declares no `listCapabilities`.
Six case-lifecycle domain operations already exist and are already composed into one callable surface by `src/src/factories/case-lifecycle.factory.ts` — none is wired to any HTTP route.
No `src/types/` directory exists in the tree — `src/types/pagination.ts` is greenfield.
Domain refusal errors already exist and are typed per the standard's own COR-02 — `CaseNotFoundError`, `CaseAlreadyHasDraftError`, `ManifestPositionOccupiedError`, `CaseVersionNotDraftError`, `CaseVersionNotDraftAtReleaseError`, `CaseVersionNotReleasableError`, `ManifestWouldHoldNoHypothesisError` among them under `src/src/errors/` — each ready to key a status map by class.

## Notes

None.
