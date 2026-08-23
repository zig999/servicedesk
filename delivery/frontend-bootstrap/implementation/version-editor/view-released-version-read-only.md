---
title: View a released case version read-only
summary: Adds a "View" action to a released row on Case Detail's Versions tab and a distinct, control-free
  read-only render (fields plus manifest) to the Version Editor for a released version, reusing the exact
  GET the editor already issues.
task: sha256:de060613eef655ff1ac2714f478cf9dad3faf46f097c9eacfaa1e269e4971920
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-view-released-version-read-only-build-2
files:
- path: src/routes/case-detail-screen.tsx
  effect: The Versions tab's actions cell now renders "View" (a router Link to "/cases/$slug/versions/$version")
    for a released row instead of nothing, through a new top-level actionsForRow() function; a draft row
    still renders only "Continue editing", to the identical route. toRow() now delegates to actionsForRow().
    No other tab (Hypotheses, Attributes) is touched.
- path: src/services/case-version-record.ts
  effect: CaseVersionManifestEntry is widened from a collects-only projection to also carry position,
    hypothesis_revision.hypothesis.name, hypothesis_revision.revision and hypothesis_revision.criterion
    (matching read-case.dto.ts's own manifestEntrySchema for these four fields), so a reader of CaseVersionRecord.manifest
    can render a manifest entry's declared position, hypothesis name, revision number and criterion from
    this one shared type. collects stays present (release-checklist.ts's own read is unaffected); resolution
    stays unread.
- path: src/hooks/use-edit-draft-version-form.ts
  effect: 'The "ready" phase of EditDraftVersionFormState gains two more optional fields, populated in
    the hook''s own return: isReadOnly (record.state === "released", deliberately independent of isBlocked/isReleased
    so a version released mid-session keeps rendering its existing disabled-but-present Save control unchanged)
    and manifest (record.manifest, unchanged data, now typed through the widened CaseVersionManifestEntry).
    No existing field, mutation, or return path was altered.'
- path: src/routes/case-version-editor-form-fields.tsx
  effect: CaseVersionEditorFormFieldsProps gains an optional isReadOnly prop (default false). When true,
    the <form>'s own onSubmit/onBlur wiring is omitted and the entire footer (the "Last saved" indicator
    and the Save button) is not rendered at all, rather than merely disabled -- every other caller (draft
    editing, the blank New Draft form) is unaffected since neither sets the prop.
- path: src/routes/case-version-editor-ready-view.tsx
  effect: 'Reads state.isReadOnly and passes it through to CaseVersionEditorFormFields. When true, additionally
    renders a "Manifest" section: every entry of state.manifest, in the response''s own order, through
    the existing generic StatusTable (columns Position/Hypothesis/Revision/Criterion, rows built by a
    new top-level toManifestRow()), or an explicit empty-collection sentence if the array holds none.
    The existing Release/Discard Dialog blocks are untouched -- both already render nothing for a released
    record through their own pre-existing canRelease/canDiscard gates.'
criteria:
- criterion: A released version's row in the Versions tab renders a "View" action, where today it renders
    none.
  met: true
  how: actionsForRow() in case-detail-screen.tsx now returns a Link labeled "View" for any row whose version.state
    is not "draft" (the only other value domain/knowledge/case-version-state names is "released").
- criterion: A draft version's row continues to render only "Continue editing", never a "View" action.
  met: true
  how: 'The version.state === "draft" branch of actionsForRow() is unchanged from the prior implementation:
    it renders exactly one Link, labeled "Continue editing".'
- criterion: Clicking "View" navigates to that version's own route, performing no additional request beyond
    the load the route itself triggers.
  met: true
  how: '"View" is a plain @tanstack/react-router Link (client-side navigation, no fetch of its own) to
    "/cases/$slug/versions/$version" -- the exact route CaseVersionEditorScreen already renders through
    useEditDraftVersionForm''s own single GET, the same route "Continue editing" already targets for a
    draft row.'
- criterion: Loading a version whose state is released renders its title, when_to_use, subject, fallback
    outcome/referral and consolidation_register fields, each disabled, from GET /v1/cases/{slug}/versions/{version}.
  met: true
  how: CaseVersionEditorFormFields already renders exactly these six fields (subject unconditionally disabled,
    the other five gated by isBlocked), and isBlocked already includes record.state === "released" (delivered
    by release-draft-version) -- so a released version's own load already disables every one of them,
    sourced from the same versionQuery GET this hook always issues.
- criterion: The read-only render shows no Save, "Release…" or "Discard draft" control.
  met: true
  how: Save is now omitted outright (not merely disabled) when isReadOnly is true, via the new isReadOnly
    prop on CaseVersionEditorFormFields. Release and Discard already render nothing for a released record
    through their own pre-existing canRelease/canDiscard gates (record.state === "draft"), which this
    task did not need to change.
- criterion: The read-only render lists every manifest entry the response returns, in the order the response
    returns them, each showing its declared position, its hypothesis's name, its hypothesis-revision's
    own revision number and criterion.
  met: true
  how: CaseVersionEditorReadyView renders state.manifest (unchanged array order) through StatusTable,
    one row per entry via toManifestRow(), showing position, hypothesis_revision.hypothesis.name, hypothesis_revision.revision
    and hypothesis_revision.criterion -- fields the widened CaseVersionManifestEntry type now carries.
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/services/case-version-record.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/case-version-editor-form-fields.tsx
  how: The read-only render surfaces this aggregate's own declared attributes (title, when_to_use, subject,
    fallback, consolidation_register) and its manifest, all read whole from one GET, matching the node's
    own "released ... never altered again" description with no control capable of altering any of it.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
  how: isReadOnly is computed directly from this enumeration's own "released" value; the Versions tab's
    own two-branch action mapping (actionsForRow) is likewise exhaustive over exactly this enumeration's
    two values.
- node: domain/knowledge/consolidation-register
  how: 'Honored, not newly encoded here: the field was already rendered through a disabled, glossary-independent
    Select bound to CONSOLIDATION_REGISTERS (edit-draft-version''s own delivery); this task only adds
    that the Save control it sits beside is now omitted rather than disabled for a released version.'
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/services/case-version-record.ts
  - src/routes/case-version-editor-ready-view.tsx
  how: CaseVersionManifestEntry now carries this value-object's own declared position and its reference
    to a hypothesis-revision, widened from a narrower, collects-only projection; the manifest listing
    renders exactly those two facts per entry, in the response's own order.
- node: domain/knowledge/resolution
  how: 'Honored, not newly encoded here: the fallback''s own outcome+referral pairing was already rendered
    by CaseVersionEditorFormFields (edit-draft-version''s own delivery); this task changes only whether
    the Save control beside it renders.'
- node: domain/knowledge/referral
  how: Honored the same way as domain/knowledge/resolution above -- the fallback referral's action and
    recipient fields were already rendered, unchanged by this task beyond the surrounding Save control.
- node: domain/glossary/subject-type
  how: 'Honored: the subject field was already rendered, always disabled, independent of this task''s
    own changes.'
- node: domain/glossary/outcome
  how: 'Honored: the fallback outcome Select, backed by useGlossaryVocabularyOptions("outcome"), was already
    rendered and gated by isBlocked, unchanged by this task.'
- node: domain/glossary/action
  how: 'Honored: the fallback referral action Select was already rendered and gated by isBlocked, unchanged
    by this task.'
- node: domain/glossary/recipient
  how: 'Honored: the fallback referral recipient Select was already rendered and gated by isBlocked, unchanged
    by this task.'
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
  how: The read-only render is reached and populated entirely through the read-case operation's own existing
    GET (useEditDraftVersionForm's versionQuery); "View" navigates to the same route that GET already
    backs, issuing no second or different read.
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - src/routes/case-version-editor-form-fields.tsx
  - src/routes/case-version-editor-ready-view.tsx
  how: 'Only the first clause (a released version is never altered again) is reached by this task''s criteria:
    the read-only render offers no Save, Release or Discard control once record.state is "released", so
    nothing in this render path can alter it or its manifest. The second clause (revising a released case
    composes the next draft instead) answers to no criterion here, per this task''s own Notes -- it belongs
    to seed-new-draft-from-latest-released.'
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  how: 'Honored rather than newly encoded: the read-only render offers no transition-triggering control
    for a released (terminal) version, which is consistent with this state machine''s own declared terminal
    state, but this task adds no new fact of the state machine itself.'
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: 'Only the second clause (a released version is never removed) is reached by this task''s criteria:
    the Discard control''s own pre-existing canDiscard = record.state === "draft" && !isReleased gate
    (delivered by discard-draft-version) already renders no Discard control for a released version, unchanged
    and reconfirmed by this task''s own criterion 5. The first clause, about a draft''s own eligibility
    for discard, answers to no criterion here, per this task''s own Notes -- it belongs to discard-draft-version.'
inferences:
- inferred: The Versions-tab action's own label is "View" (rather than, e.g., "View released vX" or "Open").
  from: No specification node or reference names this exact wording; "View" is the shortest label consistent
    with this task's own title ("View a released case version read-only") and distinct from the sibling
    Attributes-tab action's own "View released vX" (case-attributes-tab.tsx, a different entry point to
    the same destination, already delivered).
- inferred: The manifest listing is composed over the existing, generic StatusTable (shared/components/status-table.tsx)
    rather than a bespoke table, with columns labeled "Position", "Hypothesis", "Revision", "Criterion",
    and an explicit "This version's manifest holds no entry." sentence for an empty array.
  from: No node or reference dictates this screen's own layout; StatusTable is this app's own established,
    data-driven table primitive, already reused by this same screen's own sibling, case-detail-screen.tsx,
    for a structurally similar list. The empty-collection sentence follows this codebase's own established
    convention (case-detail-screen.tsx's own "This case currently holds no version." precedent) even though
    this task's own Notes says the underlying empty-manifest case is unreachable in practice for an already-released
    version.
- inferred: isReadOnly is computed strictly from record.state === "released", never from the isReleased
    local flag a successful Release mutation sets this session.
  from: 'case-version-editor-screen-release-outcomes.spec.ts''s own already-passing test ("moves the loaded
    version to released: hides the Release control and disables every field and Save") asserts the Save
    button still exists, merely disabled, immediately after a session''s own Release succeeds -- before
    the invalidated ["case-version", slug, version] query has necessarily refetched a record whose own
    state agrees. Gating isReadOnly on record.state alone, rather than on isBlocked/isReleased, is what
    keeps that sibling behavior and its own proof unchanged while still satisfying this task''s own criterion
    5 for a version whose backend state is released at load.'
preserved:
- The draft-editing flow's own Save/Release/Discard controls, field validation, and save state machine
  (clean/dirty/saving/conflict) -- CaseVersionEditorFormFields renders exactly as before for every record
  whose state is not "released", and isReadOnly defaults to false wherever it is not explicitly set.
- 'case-version-editor-screen-release-outcomes.spec.ts''s own "moves the loaded version to released" scenario:
  the Save button and Title field stay present, merely disabled, immediately after a session''s own Release
  succeeds.'
- The Release and Discard Dialogs' own pre-existing visibility gates (canRelease, canDiscard), both already
  false for a released record.
- The Attributes tab (case-attributes-tab.tsx) and its own "View released vX" / "New draft from vX" actions,
  and the Hypotheses tab -- neither file was opened or changed.
- use-new-draft-version-form.ts's own blank-form "ready" literal, which supplies neither release, discard,
  isFirstVersion, isReadOnly nor manifest -- unaffected since all five stay optional.
deferred:
- what: The empty-manifest read-back refusal (CaseNotValidError, raised by case-query.service.ts's own
    coherence check) is not handled by this read-only render.
  why: Per this task's own Notes, a released version has already passed that coherence check at release
    time and stays valid once released, so this render path is never expected to hit it; the draft case
    that can still be incoherent is case-attributes-at-a-glance's own concern.
- what: A manifest entry's hypothesis name uniqueness, its hypothesis-revision's own numbering/immutability,
    and whether the declared order is the precedence the experts affirmed, are rendered exactly as the
    backend returned them, untested by this delivery.
  why: Per this task's own rationale, domain/knowledge/hypothesis and domain/knowledge/hypothesis-revision
    are deliberately outside version-editor's own covers; those facts are manifest-hypothesis-authoring's
    own tasks' concern.
---

## What it is
The read-only render capability 1 of the onda-7 scope describes, over the same read-case GET the editor already issues.
The Versions-tab entry point into it, filling the actions-cell gap the inventory found for a released row.

## Notes
The build's first run (run/version-editor-view-released-version-read-only-build) failed the project's own lint step (max-lines) after this task's own addition of isReadOnly and manifest to use-edit-draft-version-form.ts's "ready" union pushed the file to 301 lines; fixed by merging two groups of adjacent single-statement declarations onto one line each (the same convention the file already used elsewhere for this pressure), with no behavior, comment or JSDoc content removed. The passing run is run/version-editor-view-released-version-read-only-build-2.
The two sibling deliveries already merged into this base -- seed-new-draft-from-latest-released's own isFirstVersion optional field on the "ready" union, and case-attributes-at-a-glance's own third "Attributes" tab on Case Detail -- were read as they stood and left untouched; isReadOnly and manifest were added alongside isFirstVersion rather than replacing it, and the Versions tab's own actions-cell change sits entirely inside that tab's own content, never touching the Attributes tab.
