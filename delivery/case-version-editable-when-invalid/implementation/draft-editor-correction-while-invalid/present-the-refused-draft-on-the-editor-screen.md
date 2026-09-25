---
target: frontend
title: Render the form over the not-valid state on the case version editor
summary: The editor screen now branches the "not-valid" phase on whether the hook's state carries an editable
  form, rendering the draft's own form, Save changes, Cancel and a manifest route with a non-blocking
  statement when it does, and leaving the existing bare dead-end untouched when it does not.
task: sha256:be2f1e6dc2c973c44997b14d59cea715a416780edde4ccb7e8c0bb53f2e3c7a4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-present-the-refused-draft-on-the-editor-screen-full-2
files:
- path: src/routes/case-version-editor-screen.tsx
  effect: the "not-valid" phase branch now checks isEnrichedNotValidState(state) first. When true it renders
    a section carrying the Manifest link and CaseVersionEditorNotValidView. When false, the exact previous
    bare dead-end (fixed statement + Manifest link) is rendered unchanged
- path: src/routes/case-version-editor-not-valid-view.tsx
  effect: new file. Exports isEnrichedNotValidState (the state.form !== undefined discriminator) and EnrichedNotValidState
    (the same "not-valid" state narrowed to its populated fields). Exports CaseVersionEditorNotValidView,
    which renders a ConflictBanner-modelled statement that the version does not read back as a case, the
    shared CaseVersionEditorFormFields bound to the state's own form/isBlocked/vocabulary options (savedAt
    null, onSubmit/onFieldBlur wired to no-ops), an absent-register statement read reactively via form.watch("consolidation_register"),
    and a ButtonFooter carrying a disabled Save changes control and a Cancel control wired to the state's
    own onCancel
criteria:
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the title
    field holding the state's title.
  met: true
  how: CaseVersionEditorNotValidView passes state.form straight into the shared CaseVersionEditorFormFields,
    whose title Input is register("title")-bound to that same form
- criterion: Where the editor's state carries the not-reading-back mark, the screen states that the version
    does not read back as a case.
  met: true
  how: CaseVersionEditorNotValidView renders a ConflictBanner with title "This version does not read back
    as a case" above the form, non-blocking
- criterion: That statement differs from the statement the screen presents where the version's read did
    not complete.
  met: true
  how: the load-error phase's own text ("Unable to load this version right now.") is untouched; the new
    banner's text is a distinct string
- criterion: Where the editor's state carries the not-reading-back mark, the screen's form fields are
    enabled.
  met: true
  how: CaseVersionEditorFormFields is called with isReadOnly left at its default (false) and isBlocked
    bound to state.isBlocked, which the hook computes as true only for "saving"/"conflict" status -- never
    set on this reading absent a working submit
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the Save
    changes control.
  met: true
  how: a Button type="submit" labelled "Save changes", associated to the form via CASE_VERSION_EDITOR_FORM_ID,
    is always rendered in the ButtonFooter -- statically disabled rather than wired to update-draft, which
    this task's own UNDERDETERMINED note explicitly leaves open
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the Cancel
    control.
  met: true
  how: a Button variant="secondary" labelled "Cancel" is always rendered in the ButtonFooter, wired to
    state.onCancel
- criterion: Where the editor's state carries the not-reading-back mark, the screen carries a route to
    the same version's manifest.
  met: true
  how: case-version-editor-screen.tsx's enriched not-valid branch renders the same Link to="/cases/$slug/versions/$version/manifest"
    pattern already used by every other phase branch
- criterion: Where the editor's state carries the not-reading-back mark and no consolidation_register,
    the screen states that the version declares no consolidation register.
  met: true
  how: CaseVersionEditorNotValidView reads state.form.watch("consolidation_register") reactively and renders
    "This version declares no consolidation register." whenever that value is null/undefined
- criterion: Where the editor's state carries no not-reading-back mark, the screen states nothing about
    the version not reading back as a case.
  met: true
  how: the loading, load-error and ready phase branches are unchanged, and case-version-editor-ready-view.tsx
    was not touched -- none of them render the new banner or its text
nodes:
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  encoded_at:
  - src/routes/case-version-editor-not-valid-view.tsx
  how: presents title, when_to_use, subject, fallback and consolidation_register exactly as the state's
    own form carries them, states explicitly when consolidation_register is absent, and keeps the surface
    visibly open for correction rather than a dead end. The rule's "accepts an update-draft" clause is
    not wired to a working submit here, per this task's own UNDERDETERMINED note, deferred to save-a-correction-on-the-refused-reading
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/routes/case-version-editor-not-valid-view.tsx
  - src/routes/case-version-editor-screen.tsx
  how: states explicitly that the named version does not read back as a case; presents no attribute (state,
    authored_at, released_at, manifest entries) as the content standing at that identity -- only the draft's
    own form; the bare dead-end for a released version's refused reading is left byte-for-byte unchanged
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
  how: the enriched not-valid branch carries the same Manifest Link every other phase branch already carries
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  encoded_at:
  - src/routes/case-version-editor-not-valid-view.tsx
  how: renders the Cancel control on this reading, wired to state.onCancel -- the write-nothing, return-to-the-previous-entry
    act the depended-on hook task already delivers
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  encoded_at:
  - src/routes/case-version-editor-not-valid-view.tsx
  how: covers the scenario's first two then clauses -- the surface states that the version does not read
    back as a case, and also presents the version's title, when_to_use, subject, fallback and consolidation_register
    exactly as its own stored record carries them; the third clause (submit and accept) is deferred to
    save-a-correction-on-the-refused-reading
inferences:
- inferred: The sole discriminator between the bare dead-end and the enriched, editable not-valid reading
    is state.form !== undefined.
  from: the task's own "Existing code context" note naming this exact guard, corroborated by the sibling
    hook-level test file's own local isEnriched helper checking the same field
- inferred: The Save changes control is rendered present but statically disabled, and onSubmit/onFieldBlur
    are wired to no-ops rather than left undefined or wired to a working update-draft call.
  from: this task's own UNDERDETERMINED note explicitly passing either choice, and the not-valid state
    variant deliberately carrying no onSubmit/onFieldBlur/savedAt because working submission belongs to
    the later dependent task
- inferred: The consolidation_register absence check reads state.form.watch("consolidation_register")
    reactively rather than a static getValues() snapshot.
  from: the task's own note about resetFormFrom's async population possibly outrunning a static render-time
    read, and the existing hook's own use of form.watch(...) as the established reactive-read convention
- inferred: The enriched not-valid rendering was extracted into a new sibling file (case-version-editor-not-valid-view.tsx)
    rather than folded into case-version-editor-ready-view.tsx or case-version-editor-screen.tsx directly.
  from: the task's own MNT-01 budget note naming the same extraction pattern task 4 and task 6 already
    used in this initiative
- inferred: The banner's exact wording and its placement above the form.
  from: both implemented rule nodes' own Description sections state explicitly that wording and placement
    are form, left to the interface
preserved:
- the bare not-valid dead-end (fixed statement + Manifest link) for a version carrying the not-reading-back
  mark without an editable form (a released version refused for validation) -- unchanged, still gated
  by isEnrichedNotValidState returning false
- the "ready" phase rendering in case-version-editor-ready-view.tsx, entirely untouched
- the loading and load-error phase renderings in case-version-editor-screen.tsx, entirely untouched
deferred:
- what: Wiring an actual update-draft submission so the Save changes control on this reading issues a
    PATCH.
  why: this task's own UNDERDETERMINED and REMAINDER entries place working submission in the dependent
    task save-a-correction-on-the-refused-reading, which depends on this one
- what: Offering the Discard draft control on this reading.
  why: belongs to the sibling task offer-discard-on-the-refused-reading under epic draft-editor-discard-while-invalid;
    no criterion of this task names discard
- what: Extending the absent-consolidation-register statement (and the not-reading-back statement generally)
    to the "ready" phase view for a valid draft.
  why: this task's own criteria and UNDERDETERMINED note scope the statement to the not-reading-back-marked
    reading alone
---

## What it is

The editor screen's dead-end "not-valid" branch now renders the draft's own form (via a new CaseVersionEditorNotValidView) with a non-blocking statement, Save changes, Cancel and a manifest route, whenever the hook's state carries an editable form; the bare dead-end is unchanged for a released version's refused reading.

## Notes

None.
