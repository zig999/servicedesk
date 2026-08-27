---
title: NewCaseDraftScreen's subject-field tests match the shared component's corrected behavior
summary: Four stale test assertions in two pre-existing spec files, still asserting the pre-fix "subject
  permanently disabled/labeled (fixed)" behavior, now match case-version-editor-form-fields.tsx's current,
  correct behavior (disabled={isBlocked}, labeled "Subject type").
task: sha256:3853ffaf5d2ee1e30023770b971e6c0017d7bb2131f122e1ff79d5a4d4e91104
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/new-case-draft-screen-stale-subject-tests-subject-tests-match-shared-fix-build-2
files:
- path: src/routes/new-case-draft-screen-seed.spec.ts
  effect: the two subject-input assertions (in "pre-populates title, when_to_use, subject, fallback outcome/referral
    and consolidation register" and in "leaves the form blank with the subject pre-set from the glossary
    and shows first-version copy") now expect hasAttribute("disabled") to be false, matching the shared
    field's disabled={isBlocked} with isBlocked false while the create form is idle; every other assertion,
    describe block and test is unchanged
- path: src/routes/new-case-draft-screen.spec.ts
  effect: the subject-input assertion in "renders a blank form with no version's content pre-loaded" now
    expects hasAttribute("disabled") to be false; the field lookup in "does not pre-set the subject field
    when the subject-type vocabulary currently returns no terms" now uses findByLabelText("Subject type")
    instead of the removed "Subject type (fixed)"; every other assertion, describe block and test is unchanged
criteria:
- criterion: Given the "pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation
    register" test in new-case-draft-screen-seed.spec.ts, the subject input assertion no longer expects
    `disabled` to be present while the create form is idle.
  met: true
  how: line 39 of new-case-draft-screen-seed.spec.ts now reads expect(subjectInput.hasAttribute("disabled")).toBe(false);,
    matching case-version-editor-form-fields.tsx's disabled={isBlocked} where useNewDraftVersionForm's
    isBlocked is createMutation.isPending, false while this scenario's form sits idle
- criterion: Given the "leaves the form blank with the subject pre-set from the glossary" test in new-case-draft-screen-seed.spec.ts,
    the subject input assertion no longer expects `disabled` to be present while the create form is idle.
  met: true
  how: line 86 of new-case-draft-screen-seed.spec.ts now reads expect(subjectInput.hasAttribute("disabled")).toBe(false);,
    for the same reason above — this scenario's create form is likewise idle
- criterion: Given the "renders a blank form with no version's content pre-loaded" test in new-case-draft-screen.spec.ts,
    the subject input assertion no longer expects `disabled` to be present while the create form is idle.
  met: true
  how: line 28 of new-case-draft-screen.spec.ts now reads expect(subjectInput.hasAttribute("disabled")).toBe(false);,
    for the same reason above
- criterion: Given the "does not pre-set the subject field when the subject-type vocabulary currently
    returns no terms" test in new-case-draft-screen.spec.ts, the field lookup uses the label "Subject
    type" rather than "Subject type (fixed)".
  met: true
  how: line 53 of new-case-draft-screen.spec.ts now reads await screen.findByLabelText<HTMLInputElement>("Subject
    type"), matching case-version-editor-form-fields.tsx's FormField label="Subject type" wrapping the
    subject Input — the "(fixed)" suffix task/subject-field-fixed-bug/subject-follows-isblocked already
    removed from that label
nodes:
- node: domain/knowledge/case-version
  how: this task encodes no new fact about domain/knowledge/case-version. The subject attribute's own
    correction behavior — free while draft, per the node's Description ("While in draft, its own declared
    attributes may likewise be corrected, as many times as curation needs") — is already encoded in case-version-editor-form-fields.tsx's
    disabled={isBlocked} on the subject Input, delivered by the sibling corrective task task/subject-field-fixed-bug/subject-follows-isblocked.
    This task only corrects four test assertions in new-case-draft-screen-seed.spec.ts and new-case-draft-screen.spec.ts,
    delivered under the closed frontend-bootstrap initiative, that still asserted the pre-fix behavior
    those files exercise through the shared component; no source file changed
preserved:
- 'every other assertion, it()/describe() block and test in new-case-draft-screen-seed.spec.ts and new-case-draft-screen.spec.ts,
  unchanged: the released-version seeding scenarios (title/when_to_use/fallback/consolidation_register
  pre-population, highest-numbered-released selection, loading-placeholder sequencing, load-error/retry
  phases), the blank-form subject pre-set from the glossary vocabulary, the loading/failure placeholders,
  and the blocked-submission (no POST before required fields are filled) test'
---

## What it is

A corrective increment answering to no criterion any task holds: four stale test assertions,
delivered under the closed frontend-bootstrap initiative, corrected to match the subject field's
now-current, correct behavior — established by a sibling corrective task's own delivery, not by
anything decided here.

## Notes

This task's whole content is a mechanical correction to two pre-existing spec files, not new
behavior: task-implementer wrote these two corrections directly, over the corrective-increment
route's own "one wrong behavior in code already delivered" — test code delivered under a closed
initiative is code already delivered, the same as any other. Every other assertion in both files
is unchanged, listed under `preserved`.
