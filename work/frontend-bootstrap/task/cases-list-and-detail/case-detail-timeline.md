---
title: Case Detail version timeline
summary: Replaces CaseDetailPlaceholder with a read-only rendering of a case's version timeline from GET /v1/cases/:slug/versions, offering "Continue editing" on a draft version with no additional precondition.
rationale: >-
  Split from the new-draft action because this task only reads and renders --
  list-case-versions, then a client-side navigation -- while originating a draft is a write
  with its own expected-race handling: a different reason to change and a different interface
  (GET versus POST), joined by a dependency rather than folded into one task. This is a
  decomposition choice the scope's prose did not itself spell out at this grain.
objective: Visiting a case's detail route renders every version GET /v1/cases/:slug/versions returns as a timeline, and offers to continue editing whichever one is in draft state.
criteria:
  - Visiting a case's detail route renders one row per version returned by GET /v1/cases/:slug/versions, each showing that version's number and its state as a { color, label } cell.
  - A version whose state is draft shows a "Continue editing" action.
  - Clicking "Continue editing" navigates to that version's own route immediately, performing no additional request first.
  - The timeline renders every version the endpoint returns, not only the most recently opened one.
depends_on:
  - task/cases-list-and-detail/dev-proxy-for-backend-api
implements:
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - contracts/knowledge/case-query
  - rules/knowledge/every-case-version-remains-readable
sources:
  - intake/onda-2-scope.md
---

## What it is
The read-only half of the Case Detail screen the scope's section 2.2 describes: the version timeline and the precondition-free "Continue editing" navigation.
It depends on the dev-proxy task because it is the first task to issue a real GET /v1/cases/:slug/versions from the browser.

## Notes
The binder confirmed against the real backend (src/src/http/list-case-versions.routes.ts, list-case-versions.controller.ts, and CaseVersionListItem in src/src/case/case-store.port.ts) that GET /v1/cases/:slug/versions returns exactly { version: number; state: CaseVersionState } per item -- both fields this task's first criterion needs.
