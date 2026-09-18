---
target: frontend
title: The two save-flow tests assert the refetch-timed reset, not the removed synchronous one
summary: use-capability-detail-save.spec.ts and capability-detail-screen-save.spec.ts each had one
  test rewritten so it asserts isDirty/Save stays in its submitted state right after a successful
  save and clears/re-disables only once the invalidated identity-keyed query's own refetch answers.
task: sha256:b5ac0649f00b28bba51f109284e5e1df9b4b0cbe1d8040f46f139c42bcdbb42f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/detail-surface-and-save-tests-corrections-suite-3
files:
- path: src/hooks/use-capability-detail-save.spec.ts
  effect: 'The describe block''s title and its first test were rewritten. The test, renamed to
    "keeps isDirty true immediately after a successful save, and clears it only once the
    invalidated query''s own refetch answers with matching values", now gates the second GET
    (the refetch the mutation''s onSuccess invalidateQueries triggers) behind a manually
    resolved promise, asserts isDirty is still true and inputSchema.value still holds the
    submitted UPDATED_INPUT_SCHEMA right after mutation.isSuccess flips, then resolves that
    gated GET with a capability carrying the same UPDATED_INPUT_SCHEMA and asserts isDirty
    only then becomes false. The file''s second, untouched test and both other describe
    blocks are unchanged.'
- path: src/routes/capability-detail-screen-save.spec.ts
  effect: 'One test was rewritten and renamed to "keeps Save enabled immediately after the save
    succeeds, and re-disables it only once the invalidated query''s own refetch answers". It no
    longer calls the shared mountReady() helper; it mounts the screen with its own fetch stub
    that gates the post-invalidation GET behind a manually resolved promise, asserts the Save
    button stays enabled right after "Saved." appears, then resolves that GET with a matching
    input_schema and asserts Save only then re-disables. Three new named imports (CAPABILITY_PATH,
    LOADED_CAPABILITY, jsonResponse) were added to reach the fixture''s own exports; every other
    test in the file is unchanged.'
criteria:
- criterion: use-capability-detail-save.spec.ts's test asserts isDirty stays true (fields hold
    the submitted content) immediately after a successful save, and clears only once the
    invalidated identity-keyed query's own refetch has answered with matching values.
  met: true
  how: The rewritten test asserts isDirty === true and inputSchema.value === UPDATED_INPUT_SCHEMA
    right after mutation.isSuccess/isSubmitSuccessful flips, while the refetch's own GET is still
    held pending by a promise this test controls; only after that promise is resolved with a
    capability carrying the same UPDATED_INPUT_SCHEMA does the test wait for isDirty to become
    false, and it then re-asserts the field still reads UPDATED_INPUT_SCHEMA.
- criterion: capability-detail-screen-save.spec.ts's test asserts the Save control stays enabled
    immediately after a successful save, and re-disables only once that same refetch has
    answered.
  met: true
  how: The rewritten test asserts the Save button's disabled attribute is false right after
    "Saved." renders, while the post-invalidation GET is held pending the same way; only once
    that pending GET is resolved (with a capability carrying the submitted input_schema) does the
    test wait for the button's disabled attribute to become true.
nodes:
- node: rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
  how: Honored, not newly encoded -- this delivery writes no production code. The fact is already
    encoded in src/hooks/use-capability-detail.ts (the sibling task that removed the onSuccess
    reset, and the pre-existing render-phase sync effect over query.data that is now the sole
    writer of the fields and baselines this node governs). The two rewritten tests exercise a
    slice of this fact -- one field's value and the Save control's enabled state, across exactly
    the interval this node names -- and would fail if that source stopped honoring it, but they
    do not reach every field this node covers or the alternate-source clauses (a list-capabilities
    page, read-capability for the concept, another identity's answer) it also states.
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  how: Honored, not newly encoded, for the same reason -- the pre-existing sync effect this task
    does not touch is what already draws every field exclusively from query.data, the identity
    read's own answer. The two rewritten tests confirm input_schema's value only changes once
    that read answers, and answers with matching content, consistent with this node; they do not
    exercise the other declared attributes (name, version, nature, output_schema, timeout,
    connector, concept, payload_notes) or the presentation's own opening moment, which this node
    also covers.
preserved:
- Both files' other describe blocks and tests are textually unchanged, including
  use-capability-detail-save.spec.ts's second test in the same describe block and its
  "invalidates both queries" and "a refused save" and "two operations against one subject"
  blocks, and capability-detail-screen-save.spec.ts's "criterion 4", "shows an inline success
  acknowledgement" and "clears the acknowledgement" tests.
- No production file (use-capability-detail.ts, use-capability-detail-view.ts, or any other) was
  read for editing or changed by this delivery.
deferred:
- what: use-capability-detail-save.spec.ts's second, untouched test in the same describe block,
    "re-baselines both JSON fields to the values just submitted, not whatever the PUT response
    body's own schema fields carry", waits for isDirty to clear and then asserts inputSchema.value
    still equals the submitted UPDATED_INPUT_SCHEMA. Its own mocked GET answers with the original,
    unmodified LOADED_CAPABILITY rather than a matching value, and the render-phase sync effect
    this task's sibling delivery made the sole writer of that field sets it unconditionally from
    whatever the refetch answers -- so this test's final assertion may no longer hold once that
    effect fires, independent of anything this corrective increment touches.
  why: The task's two named criteria and its Notes name only the two tests corrected here; this
    third test is neither one of them, and correcting a test the task did not name reaches past
    this corrective increment's own scope.
---
## What it is

use-capability-detail-save.spec.ts's and capability-detail-screen-save.spec.ts's one test each
that pinned the removed synchronous onSuccess reset are rewritten and renamed to assert the
refetch-timed reset instead: isDirty/Save stays in its submitted, enabled state right after a
successful save, and clears/re-disables only once the invalidated identity-keyed query's own
refetch answers with matching content. Both tests gate that refetch behind a promise the test
itself resolves, so the pre-refetch and post-refetch moments are each observed directly rather
than inferred from timing.

## Notes

None.
