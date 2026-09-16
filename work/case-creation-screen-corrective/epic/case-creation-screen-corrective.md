---
title: Case-creation screen correction
summary: Builds the missing case-creation capability in the frontend, wiring the disabled
  "Create case" button on cases-list-screen.tsx to an actual /cases/new screen and
  route.
rationale: A wrong behavior found directly by the user running the system, in code
  this project already delivered — the corrective route, per this framework, gets
  its own epic rather than reopening a delivered one.
sources:
- intake/scope.md
covers:
- contracts/knowledge/case-query
- domain/knowledge/case
- domain/knowledge/case-summary
- domain/knowledge/case-version-state
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- domain/knowledge/case-version
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
- rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
- rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
uncovered:
- node: domain/knowledge/case-summary
  why: This correction adds a case-creation control, route and screen; it states nothing about how an existing case's summary (current_state, version_count, last_updated, title, when_to_use, released_version) is presented. That belongs to the task that presents the cases listing's per-case summary.
- node: domain/knowledge/case-version-state
  why: Same as domain/knowledge/case-summary — this task derives no case summary and presents no version state; it belongs to the task that presents the cases listing's per-case summary.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: No criterion of this task reaches any clause of this rule's derivation (current_state, version_count, last_updated, title, when_to_use, released_version, or their stated absences); it belongs to the task that presents the cases listing's per-case summary.
---
## What it is

The missing "create a new case" capability in the frontend: a screen, a `/cases/new` route,
and wiring the existing disabled "Create case" button on the cases list to it.

## Notes

None.
