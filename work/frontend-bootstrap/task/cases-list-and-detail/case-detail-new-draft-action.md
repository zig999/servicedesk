---
title: Case Detail new-draft action and 409 race handling
summary: Adds the "New draft" action to Case Detail when no version is in draft state, posting to /v1/cases and treating a 409 CaseAlreadyHasDraftError response as an expected race -- a toast plus a redirect to the existing draft, never an error.
rationale: >-
  Split from the timeline task for the reason recorded there. It depends on that task, rather
  than on the dev-proxy task directly, because demonstrating that "New draft" appears exactly
  when no draft is present requires the same screen's version data already loading and
  rendering, which the timeline task delivers; the proxy dependency is already satisfied
  through that edge.
objective: When a case's version timeline holds no draft, a curator can originate one from Case Detail, and a concurrent draft created by someone else between the read and the click is handled as a redirect rather than a failure.
criteria:
  - A "New draft" action is offered in place of "Continue editing" exactly when no version returned for that case is in draft state.
  - Triggering "New draft" issues POST /v1/cases for that case's slug.
  - A successful POST /v1/cases navigates to the newly created draft's own route.
  - A 409 CaseAlreadyHasDraftError response to that POST is presented as a toast, not as an error state, and redirects to the case's existing draft rather than remaining on the current screen.
depends_on:
  - task/cases-list-and-detail/case-detail-timeline
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - rules/knowledge/a-case-has-at-most-one-draft
sources:
  - intake/onda-2-scope.md
---

## What it is
The write half of the Case Detail screen the scope's section 2.2 describes: the "New draft" action and the 409 race the backend's own at-most-one-draft rule makes possible, treated as an expected redirect rather than a bug.

## Notes
The binder confirmed against the real backend (src/src/http/create-draft.{routes,controller}.ts, src/src/errors/case-already-has-draft.error.ts, status-map.ts, error-handler.middleware.ts, src/src/case/create-draft.operation.ts) that: POST /v1/cases succeeds with 201 and body { slug, version }; a 409 CaseAlreadyHasDraftError's response body carries only { error: { code, message, details: { slug } } } -- no draft version number. Redirecting to "the case's existing draft" (criterion 4) therefore requires resolving that draft's own version number through the already-published case-query read (e.g. re-reading GET /v1/cases/:slug/versions, which case-detail-timeline already fetches and can supply), not from the 409 response itself.
