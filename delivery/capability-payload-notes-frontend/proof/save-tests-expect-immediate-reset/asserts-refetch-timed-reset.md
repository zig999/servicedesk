---
target: frontend
title: Corrective proof -- save tests assert the refetch-timed reset
summary: use-capability-detail-save.spec.ts and capability-detail-screen-save.spec.ts's two
  rewritten tests hold the registry's own write-answer and the invalidated identity query's own
  refetch-answer apart, proving isDirty/Save clear only at the latter.
implementation: sha256:e6ccfa7747d8acff558cc8dc532d421569917ec2f12322a92b6ccfc2437d179b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/detail-surface-and-save-tests-corrections-suite-3
tests:
- file: src/hooks/use-capability-detail-save.spec.ts
  name: keeps isDirty true immediately after a successful save, and clears it only once the
    invalidated query's own refetch answers with matching values
  proves: use-capability-detail-save.spec.ts's test asserts isDirty stays true (fields hold the
    submitted content) immediately after a successful save, and clears only once the invalidated
    identity-keyed query's own refetch has answered with matching values.
  fails_when: isDirty is false, or inputSchema.value is anything but the just-submitted
    UPDATED_INPUT_SCHEMA, at the moment isSubmitSuccessful first becomes true (before the
    deferred refetch is resolved); or isDirty stays true, or inputSchema.value keeps its
    pre-refetch content, after the refetch is resolved with a value matching what was submitted.
- file: src/routes/capability-detail-screen-save.spec.ts
  name: keeps Save enabled immediately after the save succeeds, and re-disables it only once the
    invalidated query's own refetch answers
  proves: capability-detail-screen-save.spec.ts's test asserts the Save control stays enabled
    immediately after a successful save, and re-disables only once that same refetch has
    answered.
  fails_when: 'the Save button carries the disabled attribute as soon as "Saved." appears (before
    the deferred refetch is resolved), or it still lacks the disabled attribute after the refetch
    is resolved with a value matching what was submitted.'
not_applicable:
- edge_case: the invalidated query's own refetch failing, rather than answering, after a
    successful save
  why: Both of this task's criteria, and the node they implement, speak only of the interval up
    to that read answering or standing outstanding; a failed refetch is a case neither criterion
    names.
- edge_case: the refetch answering with content that differs from what was submitted
  why: Both criteria this task states specify the refetch answering "with matching values"; the
    differing-answer case is the sibling task's own criterion 4, not this corrective task's.
untested:
- rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers's
  fact is not decided whole by either test -- the clause that no such field is ever drawn from
  any other answer (a list-capabilities page, read-capability-for-concept, or another identity's
  read) is not exercised.
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's
  fact is not decided whole either -- only input_schema and its own baseline are exercised, once,
  during the save flow, not the full set of declared attributes from the first moment the
  presentation begins.
---

## What it is

Both pre-existing tests were already rewritten (found already corrected in the tree) to hold the
registry's write-answer and the invalidated identity query's own refetch-answer apart, proving
this task's two criteria.

## Notes

A third, sibling test in the same use-capability-detail-save.spec.ts describe block, and
capability-detail-screen-save.spec.ts's own "shows an inline success acknowledgement..." test,
were found while verifying this task to make the same now-superseded assumption. Neither was
named by this task's own scope; both are corrected under the sibling task
detail-surface-presents-submitted-values-after-save/presents-the-registrys-answer's own proof
instead, alongside a genuine production fix that same record discloses (the sync block's
change-detection needed re-keying from query.data's own reference to query.dataUpdatedAt, since
React Query's structural sharing could otherwise mask a refetch whose answer is deep-equal to
what was already cached).
