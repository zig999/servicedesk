---
target: frontend
title: Present the refused draft on the editor screen -- proof
summary: New route-level tests mount CaseVersionEditorScreen for a draft version whose read is refused
  with CaseVersionNotValidError and that useCaseVersions reports as "draft", proving the enriched not-valid
  rendering's title, statement, distinctness, enabled fields, Save changes and Cancel presence, manifest
  route and absent-register statement, its silence in the ordinary ready reading, and its own no-leftover-attribute
  guard.
implementation: sha256:cc0454bbeff04a286c78f48814cb3e098c263d76568270c99bf88b5b0312b194
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-present-the-refused-draft-on-the-editor-screen-full-2
tests:
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- a refused draft carrying an editable form states explicitly that the
    version does not read back as a case... > renders the draft's own title and the explicit statement,
    never the load-error text or an attribute cached from an earlier successful read, and renders none
    of this once the same version reads back as a validated case
  proves: criteria 1, 2, 3, 9; UNDERDETERMINED entry 3 (no attribute left over from an earlier successful,
    now-cached read reaches the enriched not-valid rendering)
  fails_when: the title field is not filled from the draft's own declared-attributes record, or the not-reading-back
    statement is missing or equals the load-error text, or any attribute cached from an earlier successful
    read (title, when_to_use, state, authored_at, a manifest entry) leaks into this rendering, or the
    statement still appears once the same version reads back as a validated case
  demonstrates: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- the refused draft's own enriched reading presents every declared attribute,
    not merely the title (UNDERDETERMINED entry 1) > shows when_to_use, subject, the fallback outcome
    and referral, and a present consolidation_register exactly as the draft's own record, alongside the
    title
  proves: UNDERDETERMINED entry 1
  fails_when: the screen fills only the title and the absent-register statement while leaving when_to_use,
    subject, the fallback, or a present consolidation_register blank
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- the refused draft's own enriched reading states the absent consolidation
    register (criterion 8) > states that the version declares no consolidation register when the draft's
    own record answers none
  proves: criterion 8
  fails_when: the screen states nothing, or states something else, once the draft's own record carries
    no consolidation_register
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- the refused draft's own enriched reading leaves its form fields enabled
    (criterion 4) > renders the title, when_to_use, subject and fallback outcome controls without a disabled
    attribute
  proves: criterion 4
  fails_when: any of the draft's own form fields carries a disabled attribute on this reading
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- the refused draft's own enriched reading offers Save changes and Cancel
    (criteria 5, 6) > renders both Save changes and Cancel inside the button footer
  proves: criteria 5, 6
  fails_when: either control is absent from the rendered footer
- file: src/routes/case-version-editor-screen-refused-draft.spec.ts
  name: CaseVersionEditorScreen -- the refused draft's own enriched reading carries a route to this same
    version's manifest (criterion 7) > renders a Manifest link targeting this same version's own manifest
    route
  proves: criterion 7
  fails_when: no Manifest link is rendered, or it targets a different version's manifest route
not_applicable:
- edge_case: The enriched not-valid reading's own loading and load-error sub-states (the versions listing
    or the declared-attributes read still pending or failing).
  why: this task's 9 criteria describe only the resolved not-valid-with-form state; the pending and failed
    sub-states of reaching it belong to the depended-on hook task and are already proven at the hook level
    by use-edit-draft-version-form-not-valid-load.spec.ts and use-edit-draft-version-form-not-valid-actions.spec.ts
- edge_case: isBlocked === true on the enriched not-valid reading (fields disabled by a saving/conflict
    status).
  why: isBlocked is computed as status === "saving" || status === "conflict", and status only leaves "clean"
    through a working submit; Save changes is statically disabled and wired to no-op onSubmit/onFieldBlur
    handlers on this reading, so this branch is unreachable here and no criterion requires exercising
    it
- edge_case: Double-clicking Save changes, or clicking it while a request is already in flight, on this
    reading.
  why: the control is unconditionally disabled and issues no request at all on this reading, so there
    is no in-flight request to double against; the concurrency question this edge case probes does not
    arise here
untested:
- rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading -- this
  task's own REMAINDER note scopes its proof to the refused enriched reading alone (tested above, criterion
  7); the full 'every reading' fact spans the loading, load-error and ready readings too, which the task's
  own note says 'must not be narrowed by this task' and which the pre-existing case-version-editor-screen-not-valid.spec.ts
  and the editor's other route-level specs already exercise. No single test in this proof decides the
  whole 'every reading' fact.
- rules/knowledge/an-abandoned-case-version-edit-writes-nothing -- this task's own REMAINDER note scopes
  its proof to the Cancel control's mere presence (tested above, criteria 5, 6), leaving the writes-nothing
  and return-to-origin clauses to 'the editor's already-delivered Cancel act' -- case-version-editor-screen-cancel.spec.ts,
  which exercises the same cancelEditing function this reading's onCancel reuses, against the ready phase.
  No test in this proof exercises writes-nothing or return-to-origin for the enriched not-valid reading
  specifically.
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case's
  own update-draft-acceptance clause, and the third then-clause of scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  (submitting a correction on this reading and having it accepted) -- this task's own proof does not decide
  either whole. UNDERDETERMINED entry 2 states that an implementation where Save changes is present with
  enabled fields but issues no update-draft satisfies this task's own stated criteria, and the plan cut
  a separate dependent task, save-a-correction-on-the-refused-reading (which depends on this one), to
  own working submission on this reading. No test in this file asserts a PATCH from Save changes; see
  the contested entry below for the disagreement over whether the node's own fact, as distinct from this
  task's criteria, is satisfied without one.
contested:
- what: Whether this task, by deferring working submission to save-a-correction-on-the-refused-reading,
    leaves rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case's
    own update-draft-acceptance clause, and the third then-clause of scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing,
    unproven by any task, or whether it is fully answered once that dependent task lands.
  why: the node's own statement requires the surface to accept an update-draft over the draft's attributes
    'on this same reading, whichever validator rule is the one failing', and the scenario's third then-clause
    requires the same submission to be accepted; both nodes are named in this task's own implements list
    without qualification, and neither node's text itself carries a deferral. As delivered here, the Save
    changes control is rendered statically disabled and wired to no-op onSubmit/onFieldBlur handlers,
    so no update-draft is issued on this reading. The task's own UNDERDETERMINED entry 2 anticipated exactly
    this outcome as satisfying this task's stated criteria, and the plan cut save-a-correction-on-the-refused-reading,
    which depends on this task, specifically to own the working-submission behavior -- so this is not
    a defect against what this task was asked to deliver. It is, however, a real gap in the two nodes'
    own full facts that this task's proof alone does not close; nothing in this proof asserts a working
    submission, and the disagreement is recorded here -- over where the specification meant that closing
    to land -- rather than as a defect in the delivered code, and without pinning a test to either reading
    of it. Whether the dependent task, once delivered, in fact closes both nodes' whole facts is for that
    task's own proof to show.
---

## What it is

Route-level tests over CaseVersionEditorScreen's new enriched not-valid rendering, proving the task's 9 criteria; a producer disagreement over whether the node's own update-draft-acceptance fact is fully closed by this task alone is disclosed, not resolved, and left to the dependent task's own proof.

## Notes

None.
