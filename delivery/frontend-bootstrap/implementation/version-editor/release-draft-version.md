---
title: Release a draft case version
summary: Adds a "Release…" control and its in-place confirmation Dialog to the Version Editor, with a
  client-computed pre-release checklist, a single POST .../release on confirm, and rendering for its 200/409/422
  outcomes.
task: sha256:07be5a801392f1b489bed91bcb785e9f786436a7e3c91cd66d5d99e1a9ea74c2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-onda-5-full-suite
files:
- path: src/hooks/use-edit-draft-version-form.ts
  effect: Widens CaseVersionRecord with optional state/manifest fields; adds ReleaseChecklistItem/ReleaseDialogContent/ReleaseControlState
    types and an optional release field on the "ready" phase; adds a useConceptOptions() read; adds an
    isolated releaseMutation (POST /v1/cases/{slug}/versions/{version}/release, no body) with its own
    onSuccess (marks the version released, invalidates the case-version and case-versions caches, fires
    telemetry.caseReleased) and onError (422 sets the verbatim violations list; 409 closes the Dialog
    and re-fetches; anything else toasts a generic failure); adds buildReleaseChecklist and extractReleaseViolations
    (later moved to services/release-checklist.ts, see below); folds "released" into the existing isBlocked
    gate that already disables every field and Save.
- path: src/routes/case-version-editor-ready-view.tsx
  effect: Renders the "Release…" control (only when state.release?.canRelease) inside a TUI Dialog composed
    the same way version-manifest-screen.tsx's own Remove flow is (Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose),
    showing the wireframe's own title/body/checklist copy, swapping to a verbatim violations list (role="alert"
    on its wrapping div) once one arrives, with a secondary Cancel and a primary Release confirm wired
    to the hook's own onConfirm/isConfirming.
- path: src/services/case-version-record.ts
  effect: New service module, extracted from use-edit-draft-version-form.ts to keep that file under this
    project's own ESLint max-lines rule (300). Holds CaseVersionManifestEntry and CaseVersionRecord, re-exported
    by the hook for use-new-draft-version-form.ts's own existing import so that file needed no change.
- path: src/services/release-checklist.ts
  effect: New service module, extracted from use-edit-draft-version-form.ts for the same max-lines reason.
    Holds ReleaseChecklistItem, ReleaseDialogContent, ReleaseControlState, buildReleaseChecklist and extractReleaseViolations,
    imported back into the hook.
criteria:
- criterion: The Version Editor renders a "Release…" control only while the currently loaded version's
    own state is draft.
  met: true
  how: use-edit-draft-version-form.ts computes canRelease = record.state === "draft" && !isReleased; case-version-editor-ready-view.tsx
    renders the whole Dialog block only when release !== undefined && release.canRelease.
- criterion: 'Clicking "Release…" opens an in-place TUI Dialog (no navigation) listing a checklist computed
    from already-loaded data: whether the manifest holds at least one entry, with its count; whether the
    loaded fallback''s own outcome, action and recipient terms still exist by re-reading GET /v1/glossary/outcome,
    GET /v1/glossary/action and GET /v1/glossary/recipient; and whether every manifested hypothesis-revision''s
    collected concepts accept the version''s own subject by re-reading GET /v1/glossary/concepts.'
  met: true
  how: The Dialog is local component state (isReleaseDialogOpen), never a navigate() call. Opening it
    (onOpenChange(true)) calls outcomeOptions.refetch()/actionOptions.refetch()/recipientOptions.refetch()/conceptOptions.refetch(),
    and buildReleaseChecklist composes exactly three items from record.manifest.length, the fallback's
    own outcome/referral.action/referral.recipient checked against those three re-read vocabularies, and
    every manifested hypothesis_revision.collects name checked against the re-read concepts list's own
    accepts.
- criterion: That checklist never renders a capability-readiness item, since no capability data is read
    by this task.
  met: true
  how: buildReleaseChecklist returns exactly the three items above; no capability endpoint or type is
    read or imported anywhere in this delivery.
- criterion: Confirming Release in the Dialog issues exactly one POST /v1/cases/{slug}/versions/{version}/release
    request with no body.
  met: true
  how: 'onConfirm calls releaseMutation.mutate() once; mutationFn calls apiFetch(url, { method: "POST"
    }) with no body/headers key.'
- criterion: A 200 response to that POST moves the loaded version's own state to released and disables
    every field and the Save control the form renders.
  met: true
  how: onSuccess sets the sticky local isReleased flag immediately (before either invalidated query refetches);
    isBlocked now includes record.state === "released" || isReleased, and case-version-editor-form-fields.tsx's
    own pre-existing disabled={isBlocked}/Save wiring (unchanged) reads that same value.
- criterion: A 422 CaseVersionNotReleasableError response renders every string the response's own `violations`
    array holds, together and verbatim, in place of the pre-click checklist.
  met: true
  how: 'onError''s "case-version-not-releasable" branch calls extractReleaseViolations(error) (a guarded
    read of ApiError.details.violations, filtered to strings, no assertion) and stores it; releaseDialog
    then evaluates to { kind: "violations", violations }, and the ready-view renders that array verbatim,
    one li per string, instead of the checklist.'
- criterion: A 409 CaseVersionNotDraftAtReleaseError response closes the Dialog and re-fetches the version
    rather than showing a violations list.
  met: true
  how: onError's "case-version-not-draft-at-release" branch sets isReleaseDialogOpen false, clears any
    violations, and invalidates ["case-version", slug, version], which react-query refetches since that
    query stays enabled for the real edit flow.
- criterion: The Dialog's Cancel control closes it without issuing any request.
  met: true
  how: Cancel is a DialogClose asChild around a plain Button with no onClick handler; closing only runs
    onOpenChange(false), which clears local violations state and calls no mutation.
nodes:
- node: contracts/glossary/glossary-query
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's second and third items call this contract's own read-vocabulary-term/list-vocabulary-terms/list-concepts
    operations (GET .../outcome, .../action, .../recipient, .../concepts), explicitly re-read the moment
    the Dialog opens.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: Confirming Release dispatches this contract's own release operation, POST .../release with no body,
    exactly once per confirm.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The 409 branch re-reads the version through this contract's own read-case operation by invalidating
    the query that already wraps GET .../versions/{version}.
- node: domain/glossary/action
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's "Fallback resolution is set" item checks the loaded fallback's referral.action
    name against the freshly re-read action vocabulary.
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's third item reads each concept's own name and accepts (via use-concept-options.ts)
    to check every collected concept name against them.
- node: domain/glossary/outcome
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's second item checks the loaded fallback's own outcome name against the freshly re-read
    outcome vocabulary.
- node: domain/glossary/recipient
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's second item checks the loaded fallback's referral.recipient name against the freshly
    re-read recipient vocabulary.
- node: domain/glossary/subject-type
  how: The checklist's third item compares every collected concept's own accepts list against the already-loaded
    version's own subject value; this task reads that already-validated value rather than re-reading the
    subject-type vocabulary itself, which is out of this task's own scope.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: Release invokes this aggregate's own release operation via POST; the response (this node's own
    declared attributes) re-hydrates the form through the same resetFormFrom a successful PATCH already
    uses.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: canRelease reads record.state === "draft" exactly, never treating an unknown state as draft; the
    sticky isReleased flag and the invalidated query both track the move to "released".
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's first item reads record.manifest.length directly; the third item reads each entry's
    own hypothesis_revision.collects, both through the file's own narrower CaseVersionManifestEntry projection
    of this node's shape.
- node: domain/knowledge/referral
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The fallback's own referral.action/referral.recipient are exactly the two of the checklist's three
    glossary-backed terms that item 2 re-checks.
- node: domain/knowledge/resolution
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: record.fallback (outcome + referral) is read whole by the checklist's second item and carried unchanged
    through resetFormFrom on a successful release.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's first item is this rule's own client-side, best-effort echo, satisfied exactly
    when the manifest count is greater than zero; the rule's real authority stays the backend's own release.operation.ts,
    which this task never re-implements or bypasses.
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The isBlocked gate (record.state === "released" || isReleased) disables every field and Save once
    released, honoring "never altered again" at the UI layer. This task does not reach the rule's own
    second clause (revising composes the next draft version) -- per its own Notes, that belongs to new-draft-creation's
    already-delivered create-draft flow.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: Confirming Release is this task's own trigger for the rule's one declared transition (draft ->
    released); canRelease gates the control on the initial state, and a 409 (already moved by someone
    else) closes the Dialog and re-fetches rather than retrying the transition.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's third item is this rule's own client-side, best-effort echo -- a concept not found
    in the re-read list, or found but not accepting the subject, both count as unsatisfied.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The checklist's second item (fallback outcome/action/recipient) and the concept-existence half
    of the third item are this rule's own client-side echo over every term this version and its manifest
    name.
inferences:
- inferred: The Release Dialog's own title ("Release v{version}?"), body copy ("Once released, this version
    and every manifest entry it holds are frozen — permanently."), and the checklist's three item labels
    are the wireframe's own phrases, verbatim.
  from: This task's own sources, intake/onda-5-scope.md §2.6, itself quoting docs/frontend-triage-console-proposal.md's
    own ASCII mockup verbatim -- not a specification node, the same convention edit-draft-version's own
    ConflictBanner wording already follows from its own sources.
- inferred: A CaseVersionRecord with no state/manifest field (use-new-draft-version-form.ts's own seed
    literal, right after a 201) is treated as "not currently draft" for release purposes -- the Release
    control simply does not render for that call site.
  from: use-new-draft-version-form.ts and new-case-draft-screen.tsx are not files this task touches or
    is depended on by; guessing a fact this hook does not actually hold for that one call site would be
    indistinguishable from a business decision made in code.
- inferred: The release field is optional on the "ready" phase of EditDraftVersionFormState, rather than
    required.
  from: use-new-draft-version-form.ts's own blank-form "ready" object is a second, independent literal
    of this same union that this task does not touch; a required field would force that file to supply
    one too, which is outside this task's own scope.
- inferred: The Release trigger and the Dialog's own confirm button use TUI's default (primary) variant
    rather than "destructive".
  from: The epic's own rationale draws an explicit line between release ("só congelam") and discard ("apaga")
    as two different falsifiable outcomes; styling Release the same red as the codebase's one existing
    destructive-confirmation precedent would visually tell a curator the two carry the same risk, which
    rules/knowledge/a-case-version-is-written-once and discard's own erase semantics say they do not.
- inferred: Opening the Release Dialog explicitly calls .refetch() on the outcome/action/recipient/concepts
    queries, rather than relying on whatever those already-mounted queries happened to hold.
  from: Criterion 2's own wording, "by re-reading GET /v1/glossary/...", read literally as an action the
    click itself triggers rather than a description of how those four reads are already wired for Onda
    4's own purposes.
- inferred: A concept a manifested hypothesis-revision collects, that the freshly re-read glossary concepts
    no longer holds by name, is treated as "does not accept the subject" for the checklist's third item,
    never surfaced as a separate, fourth item.
  from: rules/knowledge/case-terms-exist-in-the-glossary and rules/knowledge/a-concept-accepts-the-declared-subject-type
    together, and the wireframe's own mockup, which shows exactly one row for this check.
- inferred: A role="alert" div wraps the 422 violations list (never the checklist itself), so assistive
    technology is told this Dialog's body content changed while it is already open and focused.
  from: ACC-09/ACC-07 of this project's standard and case-version-editor-form-fields.tsx's own existing
    field-error paragraphs, which already use role="alert" for the same reason.
- inferred: The Dialog's Cancel control is additionally disabled while a confirm is in flight (isConfirming).
  from: No criterion of this task requires it; use-manifest-builder.ts's own established policy of disabling
    every control while its one mutation is pending is the convention this mirrors.
divergences:
- from: 'version-manifest-screen.tsx''s own Remove-flow Dialog convention, recorded by this task''s inventory
    verbatim: "Cancel as DialogClose(secondary) and the destructive action as DialogClose(destructive)".'
  departure: The "Release…" trigger and the Dialog's own "Release" confirm button both use TUI's default
    (primary) Button variant, never "destructive" -- only the Dialog/DialogTrigger/DialogContent/.../DialogClose
    composition and the secondary Cancel are reused as recorded.
  why: 'Release freezes a version rather than erasing anything, and the epic''s own rationale states this
    distinction explicitly as the reason release and discard are two separate tasks. Styling Release with
    the same destructive red the codebase''s one existing precedent uses for an erasing action would visually
    claim the same risk for both, which this task''s own bound nodes (a-case-version-is-written-once:
    "never altered again", never "removed") do not support.'
preserved:
- The existing save state machine (clean/dirty/saving/conflict) and its blur- and Save-button-triggered
  PATCH flow (patchMutation, unchanged).
- The 404-on-load navigation to Cases List, for both the version query and a save-time failure.
- use-new-draft-version-form.ts's own blank-form flow (POST /v1/cases, its 409 CaseAlreadyHasDraftError
  redirect) -- unmodified, and still type-checks against the widened EditDraftVersionFormState/CaseVersionRecord
  unions because every field this task added is optional.
- route-tree.tsx's versionReleaseRoute and route-placeholders.tsx's VersionReleasePlaceholder, left exactly
  as unreachable as before.
- case-version-editor-form-fields.tsx's own field markup and its pre-existing disabled={isBlocked}/Save
  wiring, read rather than duplicated for the new "released" condition.
deferred:
- what: task/version-editor/discard-draft-version's own "Discard draft" control and its own slug-typed
    confirmation Dialog.
  why: A separate, sibling task per the epic's own rationale -- a different failure vocabulary (CaseVersionNotDraftError,
    reused rather than release's own CaseVersionNotDraftAtReleaseError) and a different confirmation shape
    (typed slug rather than a checklist), independently demonstrable from this one.
- what: route-tree.tsx's versionReleaseRoute / VersionReleasePlaceholder.
  why: This task's own Notes state the epic's Dialog-in-place decision keeps that route and placeholder
    unretired; retiring them is not this task's objective.
- what: A curator who has just created a draft through new-draft-creation's own blank-form flow sees no
    "Release…" control until the page is reloaded, because that flow's own seed record never carries state/manifest.
  why: Fixing that interaction would touch use-new-draft-version-form.ts and/or new-case-draft-screen.tsx,
    neither named or depended on by this task, and no criterion of new-draft-creation's own task ever
    asked for a Release control on that screen.
---

## What it is
The section 2.6 Release confirmation the scope describes, over the real POST .../release endpoint the scope's own backend finding confirms (no request body, 200/409/422 only).
The pre-release checklist the scope's finding #3 authorizes as client-side best-effort, reusing use-glossary-vocabulary.ts and use-concept-options.ts exactly as use-edit-draft-version-form.ts already does.
The 422 violations rendering the scope's finding #2 requires: verbatim from the response's own array, never a fixed three-line text.

## Notes
The two mutually-exclusive violation halves the scope's finding #2 describes (structural, then coherence) never need distinguishing in this task's own rendering: both arrive in the same violations array and are shown the same way regardless of which half produced them.
"/cases/$slug/versions/$version/release" (VersionReleasePlaceholder) stays unreachable and unretired by this task, per the epic's own Dialog-in-place decision.
rules/knowledge/a-case-version-is-written-once's own second clause (revising a case's content composes the next draft version instead) is not reached here: this task only ever moves a loaded draft to released, never starts a new draft from an already-released version. That clause belongs to the task that lets a curator revise an already-released case (new-draft-creation's own create-draft flow, already delivered).
services/case-version-record.ts and services/release-checklist.ts are new files, extracted from use-edit-draft-version-form.ts purely to satisfy this project's own ESLint max-lines rule (300) after this task's own addition pushed the hook over it -- a mechanical split, no behavior moved with it.
