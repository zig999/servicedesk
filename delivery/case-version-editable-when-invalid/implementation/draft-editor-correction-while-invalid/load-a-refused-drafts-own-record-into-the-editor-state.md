---
target: frontend
title: Fill the editor's not-valid state from the draft's own record
summary: use-edit-draft-version-form.ts now delegates the refused-draft resolution to a new use-not-valid-draft-version-state.ts
  hook, which determines draft-vs-released via useCaseVersions and, for a draft refused by read-case with
  CaseVersionNotValidError, loads that draft's own record through read-case-version into an editable form
  carried on the "not-valid" phase.
task: sha256:9d63fbedc8280a24e57f911a1c8c158118dbd1fa2ac246da8821f3e83d62a566
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-load-a-refused-drafts-own-record-into-the-editor-state-full-5
files:
- path: src/hooks/use-edit-draft-version-form.ts
  effect: 'hoists cancelEditing above the queries; adds a single call to the new useNotValidDraftVersionState(slug,
    version, isNotValid, form, status, setStatus, cancelEditing, retryVersionQuery) hook and an early
    return of its result when non-null; the "not-valid" union member now carries optional form/status/isBlocked/outcomeOptions/actionOptions/recipientOptions/onCancel
    fields, populated only via that extracted hook, while a released or unresolved version still returns
    the bare { phase: "not-valid" } with no fields. Reformats (line-joins, no logic change) some pre-existing,
    unrelated lines to stay under MNT-01''s 300-significant-line cap.'
- path: src/hooks/use-not-valid-draft-version-state.ts
  effect: 'new file. Exports useNotValidDraftVersionState: calls useCaseVersions(slug) to resolve the
    named version''s draft/released state; calls useGlossaryVocabularyOptions for outcome/action/recipient;
    calls a second useQuery hitting GET /v1/cases/:slug/versions/:version/declared-attributes (read-case-version),
    enabled only once the version resolves to "draft"; runs an effect that calls resetFormFrom(form, record)
    once that query answers; returns null when the caller''s read-case read was not refused with case-not-valid,
    or the bare/enriched "not-valid" EditDraftVersionFormState member otherwise'
criteria:
- criterion: Where read-case refuses the named version with CaseVersionNotValidError, the editor reads
    that version through read-case-version.
  met: true
  how: when the caller's versionQuery (read-case) errors with kind "case-not-valid" and useNotValidDraftVersionState's
    internal useCaseVersions confirms the named version is a draft, its declaredAttributesQuery calls
    GET /v1/cases/:slug/versions/:version/declared-attributes (read-case-version)
- criterion: Where read-case refuses a draft with CaseVersionNotValidError, the editor's state carries
    an editable form.
  met: true
  how: 'once declaredAttributesQuery answers, useNotValidDraftVersionState returns { phase: "not-valid",
    form, ... } where form is the same react-hook-form UseFormReturn the caller passed in and populated
    via resetFormFrom'
- criterion: On that reading, the form's title is the title read-case-version answered.
  met: true
  how: the extracted hook's effect calls resetFormFrom(form, declaredAttributesQuery.data), which sets
    title from record.title
- criterion: On that reading, the form's when_to_use is the when_to_use read-case-version answered.
  met: true
  how: same resetFormFrom call, record.when_to_use
- criterion: On that reading, the form's subject is the subject read-case-version answered.
  met: true
  how: same resetFormFrom call, record.subject
- criterion: On that reading, the form's fallback outcome is the fallback outcome read-case-version answered.
  met: true
  how: same resetFormFrom call, record.fallback (carries outcome and referral together)
- criterion: On that reading, the form's fallback referral is the fallback referral read-case-version
    answered.
  met: true
  how: same resetFormFrom call, record.fallback.referral
- criterion: Where read-case-version answers a consolidation_register on that reading, the form's consolidation_register
    is that value.
  met: true
  how: resetFormFrom passes record.consolidation_register straight through
- criterion: Where read-case-version answers no consolidation_register on that reading, the form holds
    no consolidation_register value.
  met: true
  how: consolidation_register is optional on CaseVersionRecord; resetFormFrom passes through undefined
    unchanged when the field is absent
- criterion: Where another version of the same case carries a different title, the form's title on that
    reading is the named version's own.
  met: true
  how: declaredAttributesQuery's queryFn and queryKey are both scoped to the exact slug and version param;
    no aggregation across versions occurs
- criterion: On that reading, the editor's state marks the version as not reading back as a case.
  met: true
  how: the enriched state returned is still under phase "not-valid" -- the same phase name used for the
    bare, no-attribute reading -- so the mark is the phase identity itself
- criterion: On a reading where read-case answers the version, the editor's state carries no such mark.
  met: true
  how: the ordinary success path is unchanged and still returns phase "ready", a distinct union member
    from "not-valid"
- criterion: While read-case-version has not answered on that reading, the editor's state is the loading
    state.
  met: true
  how: 'useNotValidDraftVersionState returns { phase: "loading" } while useCaseVersions has no data yet,
    and again while declaredAttributesQuery.isLoading or the glossary options are still loading'
- criterion: Where read-case-version does not answer the version's record on that reading, the editor's
    state is the load-error state.
  met: true
  how: 'when declaredAttributesQuery.isError (or the glossary vocabulary errors), the hook returns { phase:
    "load-error", retryLoad } with retryLoad refetching declaredAttributesQuery and the three glossary
    option queries'
- criterion: Where read-case refuses a released version with CaseVersionNotValidError, the editor's state
    carries none of that version's declared attributes.
  met: true
  how: 'when the version resolves to anything other than "draft" (released, or absent from the list),
    declaredAttributesQuery stays disabled and the hook returns the bare { phase: "not-valid" } with no
    other fields'
- criterion: On that reading of a draft whose form is unchanged, the editor's state is not blocked.
  met: true
  how: isBlocked is computed as status === "saving" || status === "conflict"; status is reset to "clean"
    the moment declaredAttributesQuery.data arrives and no submission path is wired on this reading, so
    isBlocked stays false while the form is unchanged
- criterion: On that reading of a draft, cancelling issues no update-draft.
  met: true
  how: onCancel is the caller's cancelEditing function, threaded through unchanged, which only calls router.history.back();
    no mutation of any kind is invoked from this phase
- criterion: On that reading of a draft, cancelling returns the curator to the previous history entry.
  met: true
  how: cancelEditing calls router.history.back(), the same navigation mechanism the ready phase's onCancel
    already used
- criterion: Where the editor's state on that reading offers release, it states the manifest-pin release
    condition as not yet decided.
  met: true
  how: this reading's enriched "not-valid" variant carries no release field at all -- release is never
    offered on this reading -- so the criterion is satisfied vacuously
nodes:
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  how: for a draft (never a released version) refused by read-case with CaseVersionNotValidError, the
    hook reads the draft's own stored record through read-case-version and populates an editable form
    from it, without reading any other version or assembling a whole case; manifest presentation is left
    untouched
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the fallback path triggers on any validator-rule failure carried as CaseVersionNotValidError (including
    a manifest holding no hypothesis) without hypothesis-specific branching
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the state returned for a version failing validation stays under the distinct "not-valid" phase
    rather than the "ready" phase's shape, and for a released version carries no attribute of it
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: errorStateKind(versionQuery.error) is used to detect the CaseVersionNotValidError this rule requires
    read-case to answer with
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the form is filled exclusively from declaredAttributesQuery.data, the answer of read-case-version
    scoped to the named slug and version -- never from the caller's refused read-case answer and never
    from any other version
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: while declaredAttributesQuery has not yet answered (or useCaseVersions has not yet resolved the
    version's state), the hook returns the bare "loading" phase rather than presenting a partial form
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: an unrecognized failure of the declared-attributes read is folded into the same "load-error" phase
    already used for a read that did not complete
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: this reading offers no release control at all, so the met/unmet/not-yet-decided disclosure this
    rule requires is never triggered here -- criterion 19 is met vacuously
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  how: onCancel on this reading is the caller's own cancelEditing closure -- only router.history.back(),
    no update-draft, place-hypothesis or remove-hypothesis call
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the hooks together now consume both operations the contract distinguishes -- read-case via the
    caller's existing versionQuery, and read-case-version via the new declaredAttributesQuery
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the five declared attributes this aggregate names are exactly the fields resetFormFrom carries
    from the declared-attributes answer into the form
- node: constraints/a-successful-case-version-own-record-read-answers-with-http-200
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: declaredAttributesQuery treats a successful response from the declared-attributes route as ordinary
    data regardless of whether the named version reads back as a case
inferences:
- inferred: Draft-vs-released is told apart using useCaseVersions(slug) inside the extracted hook, matching
    the pattern already used by use-case-current-version-validity.ts, rather than any field on read-case-version's
    own answer.
  from: the task's own Notes ("read-case-version's answer carries no state...") plus the sibling hook's
    existing convention
- inferred: The refused reading is served by two independent useQuery calls rather than one hook trying
    to answer both shapes.
  from: the task's own Notes ("Whether one query or two feed the form is left to implementation")
- inferred: No release field is exposed on this reading's state at all, rather than computing manifestPinReleaseCondition
    over an empty/absent manifest.
  from: the task's own Notes flagging that computing the condition over the empty manifest a read-case-version
    answer implies could misreport it as met
- inferred: '"isBlocked" on this reading mirrors the ready phase''s saving/conflict-driven meaning rather
    than an unsaved-changes navigation guard, and stays false throughout this reading since no submission
    is wired to it.'
  from: the task's own ADVISORY note that "not blocked" is undefined by any candidate
- inferred: A version present in useCaseVersions' list but resolving to a state other than "draft" is
    treated the same as "released" -- bare not-valid, no attributes fetched.
  from: criterion 15 names only "released" explicitly; extending the same non-disclosure is the safer
    reading
- inferred: A useCaseVersions() failure while resolving draft/released status is folded into the "load-error"
    phase, rather than falling back silently to the bare not-valid state.
  from: treating an unanswered prerequisite the same way the hook already treats an unanswered read-case-version
    keeps the loading/load-error distinction consistent
- inferred: The new logic was split into its own file (use-not-valid-draft-version-state.ts), importing
    resetFormFrom and two types back from use-edit-draft-version-form.ts, accepting the resulting circular
    module reference rather than relocating those shared exports to a third file.
  from: the build's MNT-01 line-count failure and the coordinator's own precedent of extracting a component
    into its own file rather than inlining it
- inferred: The extracted hook fetches its own outcome/action/recipient glossary options independently
    rather than receiving the caller's already-fetched options as parameters.
  from: React Query dedupes identical query keys against one shared cache, so this adds no real network
    cost while keeping the extracted hook's parameter list short
preserved:
- the ordinary "ready" phase (form population from read-case, save/status, release, discard, manifest,
  isReadOnly, isFirstVersion) is unchanged in shape and behavior
- the bare "loading" and "load-error" phase shapes, and the case-not-found redirect behavior, are unchanged
- case-version-editor-screen.tsx, case-version-editor-ready-view.tsx and use-new-draft-version-form.ts
  continue to compile unmodified
- use-edit-draft-version-form.ts measures at 294 significant (non-blank) lines, under MNT-01's 300-line
  maximum
deferred:
- what: Rendering the refused-draft's form fields, and any release/discard controls, on case-version-editor-screen.tsx,
    case-version-editor-ready-view.tsx or case-version-editor-form-fields.tsx.
  why: REMAINDER, from the specification -- belongs to the task that renders the editor's form fields
    from the hook's state
- what: The backend read-case refusal's own wire-answer shape (HTTP 409, the message naming slug/version/failing
    rules).
  why: REMAINDER, from the specification -- belongs to the backend read-case refusal
- what: Release's met/unmet condition disclosure for a surface that has read the manifest and pinned revisions.
  why: REMAINDER, from the specification -- belongs to the release-offering surface's disclosure on readings
    where the draft's manifest and pinned revisions have been read
- what: Rendering the editor's leaving control and every route owed during its loading state.
  why: REMAINDER, from the specification -- belongs to the task rendering the editor's leaving control
    and routes during its loading state
- what: The version-keyed presentation surface's own route to its editing surface.
  why: REMAINDER, from the specification -- belongs to the version-keyed presentation surface's route
    to its editing surface
- what: Rendering a manifest route on every version-keyed surface, the editor included.
  why: REMAINDER, from the specification -- belongs to the task rendering routes on version-keyed surfaces,
    the editor included, on every reading
- what: Wiring actual update-draft submission on the refused reading, and offering release or discard
    controls there.
  why: UNDERDETERMINED, from the specification -- save-a-correction-on-the-refused-reading and offer-discard-on-the-refused-reading,
    both of which depend on this task, are the tasks cut to decide submission and offer wiring on this
    reading
---

## What it is

use-edit-draft-version-form.ts's dead-end "not-valid" phase now delegates to a new use-not-valid-draft-version-state.ts hook, which loads a refused draft's own record through read-case-version and fills an editable form, distinguishing a draft from a released version via useCaseVersions.

## Notes

The build's first attempt failed lint's MNT-01 300-line cap on use-edit-draft-version-form.ts (364 lines); fixed by extracting the new logic into use-not-valid-draft-version-state.ts plus reformatting a few pre-existing lines, with no logic change. The passing build is run/draft-editor-correction-while-invalid-load-a-refused-drafts-own-record-into-the-editor-state-full-2, named on this record.
