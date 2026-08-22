---
title: Version Editor
summary: The full-replace draft-editing form (PATCH, with its own clean/dirty/saving/conflict state machine and 404/409 handling) plus the New Draft origination flow deferred from Onda 2, sharing one field form that differs only in which verb Save dispatches.
rationale: >-
  I cut a new epic instead of evolving cases-list-and-detail or folding into
  case-authoring-console because this onda's territory -- resolution, referral and the four
  glossary vocabularies feeding the fallback/subject fields -- is claimed by neither existing
  epic's covers list with an actual screen behind it: case-authoring-console claims that domain
  but has delivered only build tooling against it, and cases-list-and-detail is read-only by its
  own stated scope. contracts/knowledge/case-lifecycle and rules/knowledge/a-case-has-at-most-one-
  draft do appear in cases-list-and-detail's own covers too, marked uncovered there with the
  explicit note that origination was deferred to this onda -- the overlap is that deferral
  resolving, not an error.

  Grown after edit-draft-version's own binder found domain/knowledge/consolidation-register
  missing from its candidate set: the task's own consolidation_register field is a closed
  enumeration (formal/plain) declared by that node, which the original impact-set closure missed
  by not following case-version.md's own attribute-type reference outward. Added here so the
  binder can re-run against the complete candidate set.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - contracts/glossary/glossary-query
  - rules/knowledge/a-case-has-at-most-one-draft
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  - rules/knowledge/a-case-version-number-is-never-reused
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-slug-identifies-one-case
uncovered:
  - node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    why: No task in this wave triggers the release transition; both tasks only create or update a draft. Release is deferred to Onda 5.
  - node: rules/knowledge/a-case-version-number-is-never-reused
    why: No task discards a draft or reuses a version number; the backend assigns every version number this wave ever sees, and discard is deferred to Onda 5.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: Every task in this wave acts against an existing case's own already-known slug, read from Case Detail's route; no task originates a brand-new case identity or asserts slug uniqueness.
  - node: rules/knowledge/validation-runs-at-every-read
    why: >-
      Neither task's own criteria test or establish this rule. edit-draft-version's task rationale
      and new-draft-creation's task rationale both invoke this rule informally to justify a design
      choice -- new-draft-creation never issues a follow-up GET after POST /v1/cases because a
      freshly created draft's empty manifest could fail this rule's own validity condition -- but
      neither task's criteria assert that a stored case version reads as a case only while every
      validator rule holds, or exercise the read-time revalidation clause directly. Both this
      epic's execution-contract-binder runs, over the fully expanded candidate set, independently
      excluded it from `implements` on this ground. It belongs to whichever task actually renders
      GET /v1/cases/:slug/versions/:version's read-time behavior against a version whose validators
      may fail.
sources:
  - intake/onda-3-scope.md
---

## What it is
The Version Editor screen that replaces CaseVersionPlaceholder, editing an existing draft's full content via full-replace PATCH.
The New Draft origination flow deferred from Onda 2's case-detail-new-draft-action, folded in here because it needs the same field form.
The clean/dirty/saving/conflict UI state machine section 4 of the proposal describes, since the backend offers no optimistic concurrency of its own.

## Notes
Release and Discard (the wireframe's own "[ Release… ]" and "[ Discard draft ]" buttons) stay out of this epic, deferred to Onda 5.
Manifest Builder (the wireframe's "manifest holds N hypotheses [open →]" navigation link) stays out of this epic, deferred to Onda 4.
The inventory's own risk on GET /v1/cases/:slug/versions/:version's manifest.min(1) response constraint is answered inside the new-draft-creation task rather than papered over: see that task's own Notes.
