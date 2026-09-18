---
title: The capability detail save tests assert the refetch-timed reset, not an immediate one
summary: 'Corrective increment: use-capability-detail-save.spec.ts and
  capability-detail-screen-save.spec.ts each assert isDirty/Save clears synchronously at the
  registry''s answer, falsified by detail-surface-presents-submitted-values-after-save/
  presents-the-registrys-answer''s legitimate delivery.'
rationale: The wrong assertions were observed in test files this project already delivered
  (under a now-closed initiative), outside any live task's criteria; the claim is seeded
  mechanically from trace.py --encodes over use-capability-detail.ts and
  capability-detail-screen.tsx, the files whose legitimate correction falsified these
  assertions.
sources:
- work/capability-payload-notes-frontend/intake/save-tests-expect-immediate-reset.md
covers:
- rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
uncovered:
- node: rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read
  why: This node governs the outcome statement's own timing, which neither criterion of this task asserts
    anything about; that timing is already delivered and proven by the sibling task
    detail-surface-presents-submitted-values-after-save/presents-the-registrys-answer.
---
## What it is

Two pre-existing tests assert isDirty/Save clears synchronously right after a successful save.
Since presents-the-registrys-answer's delivery, that clearing now happens only once the
invalidated identity-keyed query's own refetch answers and the existing sync effect applies it.
Both tests are rewritten to assert the submitted-content-stands-until-refetch behavior instead.

## Notes

None.
