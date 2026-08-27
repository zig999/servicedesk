---
title: NewCaseDraftScreen's subject-field tests match the shared component's corrected behavior
summary: Four test assertions in new-case-draft-screen-seed.spec.ts and new-case-draft-screen.spec.ts, still asserting the pre-fix "subject permanently disabled/labeled (fixed)" behavior, now match the shared field component's current, correct behavior.
objective: Every test in NewCaseDraftScreen's own spec files that names the subject field's disabled state or label asserts the current, correct behavior (disabled only while that screen's own isBlocked is true; labeled "Subject type"), not the pre-fix behavior task/subject-field-fixed-bug/subject-follows-isblocked already removed.
criteria:
  - Given the "pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation register" test in new-case-draft-screen-seed.spec.ts, the subject input assertion no longer expects `disabled` to be present while the create form is idle.
  - Given the "leaves the form blank with the subject pre-set from the glossary" test in new-case-draft-screen-seed.spec.ts, the subject input assertion no longer expects `disabled` to be present while the create form is idle.
  - Given the "renders a blank form with no version's content pre-loaded" test in new-case-draft-screen.spec.ts, the subject input assertion no longer expects `disabled` to be present while the create form is idle.
  - Given the "does not pre-set the subject field when the subject-type vocabulary currently returns no terms" test in new-case-draft-screen.spec.ts, the field lookup uses the label "Subject type" rather than "Subject type (fixed)".
rationale: A corrective increment answering to no criterion any task holds — found while delivering task/subject-field-fixed-bug/subject-follows-isblocked, whose suite run failed these four tests. The subject field's source is shared between CaseVersionEditorScreen and NewCaseDraftScreen through case-version-editor-form-fields.tsx (rendered by case-version-editor-ready-view.tsx, which both screens use); that source already conforms to domain/knowledge/case-version via the prior task's own delivery, so nothing here changes source, only the four stale assertions. The owning delivery (delivery/frontend-bootstrap/implementation/version-editor/{new-draft-creation,seed-new-draft-from-latest-released}.md) sits under the closed frontend-bootstrap initiative, so the ordinary proof-only re-delivery route does not apply — there is no live task to re-deliver against — and this corrective increment is where the correction lands instead.
implements:
  - domain/knowledge/case-version
sources:
  - intake/2026-08-27-new-case-draft-screen-stale-subject-tests.md
---

## What it is

A corrective increment: four pre-existing test assertions, delivered under a now-closed initiative, corrected to match source that a sibling corrective task already fixed. No source changes.

## Notes

None.
