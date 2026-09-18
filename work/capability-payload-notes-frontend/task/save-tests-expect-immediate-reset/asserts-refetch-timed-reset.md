---
title: The two save tests assert the refetch-timed reset, not an immediate one
summary: use-capability-detail-save.spec.ts and capability-detail-screen-save.spec.ts each
  rewritten to assert isDirty/Save stays in its submitted state until the invalidated
  identity-keyed query's own refetch answers, then clears/re-disables.
rationale: The wrong assertions were observed in delivered test code, outside any live task's
  criteria; the claim is seeded mechanically from trace.py --encodes over
  use-capability-detail.ts and capability-detail-screen.tsx, the files whose legitimate
  correction falsified these assertions.
sources:
- work/capability-payload-notes-frontend/intake/save-tests-expect-immediate-reset.md
objective: The two pre-existing save tests assert isDirty/Save's actual, refetch-timed clearing
  rather than the removed synchronous one.
criteria:
- use-capability-detail-save.spec.ts's test asserts isDirty stays true (fields hold the
  submitted content) immediately after a successful save, and clears only once the invalidated
  identity-keyed query's own refetch has answered with matching values.
- capability-detail-screen-save.spec.ts's test asserts the Save control stays enabled
  immediately after a successful save, and re-disables only once that same refetch has
  answered.
implements:
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
---
## What it is

Rewrites both pre-existing tests' assertions to match the refetch-timed reset
presents-the-registrys-answer's delivery introduced, in place of the removed synchronous one.

## Notes

REMAINDER, from the binder over rules/integration/a-capability-keyed-surface-states-a-successful-registration-without-waiting-for-its-own-read:
this node's own statement (the outcome statement's timing) reaches neither criterion here — both
assert isDirty/Save, not the outcome statement — and stays owned by the sibling task
detail-surface-presents-submitted-values-after-save/presents-the-registrys-answer, already
delivered.
