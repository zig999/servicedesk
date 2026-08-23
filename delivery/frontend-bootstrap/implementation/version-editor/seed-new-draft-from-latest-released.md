---
title: Seed New Draft's blank form from the case's latest released version
summary: Widens the New Draft origination flow to pre-populate its blank form from the case's own latest
  released version (when one exists) and to name that version's own consolidation_register and source_version
  explicitly in the create-draft POST.
task: sha256:6d82c714f3abe8997660ff40cede2a651ad68b23d76573fa722d0a78b25bd69e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-seed-new-draft-from-latest-released-build-3
files:
- path: src/hooks/use-new-draft-version-form.ts
  effect: Reads the case's own version timeline through useCaseVersions (the same ["case-versions", slug]
    query task/cases-list-and-detail/case-detail-timeline established) to derive the case's own latest
    released version as the highest-numbered entry with state "released"; when one exists, reads its own
    record through GET /v1/cases/{slug}/versions/{version} (keyed ["case-version", slug, version], matching
    edit-draft-version's own read) and pre-populates the blank form's title, when_to_use, subject, fallback
    and consolidation_register from it via use-edit-draft-version-form.ts's own exported resetFormFrom;
    when none exists, leaves the blank-form/glossary-subject-default flow exactly as new-draft-creation
    delivered it. Widens CreateDraftRequestBody and the create mutation's POST body to additionally carry
    consolidation_register and source_version once seeded from a released version, sending neither field
    otherwise. Adds an isFirstVersion flag to the "ready" phase it returns, true exactly when no released
    version was found. Loading/error gating (isLoadingGlossary/isGlossaryError, and their retryLoad) is
    widened to also cover the version-list read and, once one is found, the source-version read, so the
    blank form never flashes before being re-populated. redirectToExistingDraft's own CaseVersionListItem/CaseVersionsPage
    types are now imported from use-case-versions.ts instead of being re-declared locally.
- path: src/hooks/use-edit-draft-version-form.ts
  effect: 'Exports resetFormFrom (previously a private helper) so use-new-draft-version-form.ts''s own
    seeding effect reuses this hook''s exact title/when_to_use/subject/fallback/consolidation_register
    mapping rather than a second, hand-copied one. Adds an optional isFirstVersion?: boolean field to
    EditDraftVersionFormState''s "ready" variant, following the same optional-field convention already
    established for release/discard: absent at this hook''s own call site, present only for use-new-draft-version-form.ts''s
    own blank-form object.'
- path: src/routes/new-case-draft-screen.tsx
  effect: Renders "This is the case's first version." next to the screen's heading when the hook's own
    ready state reports isFirstVersion true (criterion 2's own copy requirement); no other rendering change.
criteria:
- criterion: Opening "New draft" on a case whose versions include at least one released version pre-populates
    the form's title, when_to_use, subject, fallback outcome/referral and consolidation_register fields
    from that case's latest released version, read via GET /v1/cases/{slug}/versions/{version}.
  met: true
  how: useNewDraftVersionForm derives the case's own latest released version from useCaseVersions's list
    (the highest-numbered entry with state "released"), reads it through GET /v1/cases/{slug}/versions/{version},
    and resets the blank createForm from that record's title/when_to_use/subject/fallback/consolidation_register
    via resetFormFrom, all before the "ready" phase is ever returned (gated by isLoadingVersionSource).
- criterion: Opening "New draft" on a case with no released version yet leaves the form exactly as new-draft-creation
    already renders it -- blank, subject pre-set to the one glossary value -- with copy stating this is
    the case's first version.
  met: true
  how: 'When useCaseVersions''s list names no released entry, latestReleasedVersionNumber stays undefined:
    the seeding effect never fires (its own guard requires sourceVersionQuery.data, which stays disabled),
    the pre-existing glossary-subject-default effect runs unchanged (now additionally guarded on hasLoadedVersions
    and latestReleasedVersionNumber === undefined, which is exactly this branch), and the returned "ready"
    state carries isFirstVersion: true, which NewCaseDraftScreen renders as "This is the case''s first
    version." beside the heading.'
- criterion: Clicking Save on a form pre-populated from a released version issues POST /v1/cases with
    a body that additionally includes consolidation_register and source_version set to that released version's
    own version number.
  met: true
  how: 'createMutation''s mutationFn spreads { consolidation_register: values.consolidation_register,
    source_version: latestReleasedVersionNumber } onto the POST body exactly when latestReleasedVersionNumber
    !== undefined -- true only once a released version was found and the form seeded from it.'
- criterion: Clicking Save on a first-ever draft's blank form issues POST /v1/cases with a body that includes
    neither consolidation_register nor source_version, exactly as new-draft-creation's own POST does today.
  met: true
  how: The same spread in createMutation's mutationFn contributes nothing when latestReleasedVersionNumber
    is undefined, leaving the POST body's field set identical to new-draft-creation's own five fields
    (slug, title, when_to_use, authored_at, subject, fallback).
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: 'Honored rather than newly encoded: this frontend never assigns or persists next_version, but "the
    case''s own latest released version" is computed as the numeric maximum among released entries, which
    is only unambiguous because case-version numbers are never reused (this node''s own next_version guarantee)
    -- the assumption is stated in this file''s own comment on that computation.'
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  - src/hooks/use-edit-draft-version-form.ts
  how: The five declared attributes this task's criteria name (title, when_to_use, subject, fallback,
    consolidation_register) are exactly what resetFormFrom copies from the read source version onto the
    blank form, and exactly what the widened POST body's own added fields (consolidation_register, source_version)
    carry back out.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: The two-value vocabulary (draft/released) is read exactly via `item.state === "released"` to find
    the case's own latest released version among useCaseVersions's list.
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: The value copied from the source version's own record and, once copied, sent explicitly as the
    POST body's own consolidation_register field -- the vocabulary itself (formal/plain) is unchanged,
    already declared in case-version-form-schema.ts (not touched by this task).
- node: domain/knowledge/resolution
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: The fallback outcome+referral pair is copied from the source version's own record via resetFormFrom
    and resent unchanged on the widened POST, through the same CaseVersionFormValues["fallback"] shape
    new-draft-creation already used.
- node: domain/knowledge/referral
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: The action+recipient pair nested under the copied fallback, carried through the same resetFormFrom/POST-body
    path as domain/knowledge/resolution above.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: The create-draft operation's own POST /v1/cases call, already dispatched by new-draft-creation,
    is widened here to additionally name consolidation_register and source_version once the blank form
    was seeded from a released version.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: Reuses the list-case-versions read (useCaseVersions, GET /v1/cases/{slug}/versions) to find the
    case's own latest released version, and reads that version whole through the same read-case-by-slug-and-version
    call (GET /v1/cases/{slug}/versions/{version}) edit-draft-version's own hook already issues.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  how: 'Encodes only the rule''s second clause -- naming no source version defaults the copy source to
    the case''s own latest released version -- by computing that version and naming it explicitly as source_version
    on the POST once it exists. The rule''s first clause, the new draft''s manifest actually being copied
    entry-for-entry from that source version, is not reached by this delivery: per this task''s own Notes
    (REMAINDER), that copy is performed server-side by the backend''s own createDraft store operation
    (src/src/persistence/relational-case-store.repository.ts), already implemented and delivered under
    a prior, closed initiative, and no criterion of this frontend-only task asks this delivery to inspect
    the created draft''s own manifest to prove it.'
inferences:
- inferred: '"The case''s own latest released version" is the highest-numbered entry among the case''s
    version list that carries state "released" -- not, e.g., the one with the most recent released_at,
    which the list-case-versions response does not even carry per item.'
  from: domain/knowledge/case's own next_version guarantee (a version number is never reused, always greater
    than every version the case has ever held) plus rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version's
    own text naming "the case's own latest released version" as the default source -- with version numbers
    monotonic and never reused, the numeric maximum among released entries is exactly that version, and
    no other field the list response holds distinguishes recency.
- inferred: The exact copy text rendered for criterion 2, "This is the case's first version.", since no
    node or reference names this wording.
  from: The criterion's own phrasing ("copy stating this is the case's first version") and this app's
    own established practice, seen throughout case-version-editor-ready-view.tsx, of writing UI copy not
    given verbatim by any node and disclosing that inference in the delivery record rather than treating
    it as a domain fact.
- inferred: isFirstVersion is exposed as a new optional field on the shared EditDraftVersionFormState
    "ready" variant, read by the route component rather than computed a second time there.
  from: 'The convention the inventory (version-editor-terminal-actions.md) and this same union''s own
    header comment already document for release and discard: a fact only one call site needs is added
    as an optional field, absent at every call site it does not apply to, rather than that call site deriving
    the same fact a second time or the union growing a second literal shape (TYP-04).'
- inferred: The blank form must not render before it is known whether a released version exists to seed
    it from (and, once one is found, before that version's own record has loaded) -- otherwise a curator
    would briefly see a blank form that then visibly re-populates.
  from: EDG-01's own "every view that awaits a network response renders an explicit loading state before
    data arrives" and this hook's own pre-existing isLoadingGlossary/isGlossaryError gating convention,
    extended to the two new reads rather than left to race the form's own first render.
preserved:
- 'The blank-form origination flow for a case with no released version: blank title/when_to_use, subject
  pre-set from GET /v1/glossary/subject-type, fallback blank until chosen.'
- The create POST's exact five-field body (slug, title, when_to_use, authored_at, subject, fallback) for
  a first-ever draft, with no consolidation_register or source_version field present at all.
- The switch into the exact same edit-mode flow useEditDraftVersionForm delivers after a 201, seeded from
  the content just submitted and the returned version number, issuing no follow-up GET.
- The 409 CaseAlreadyHasDraftError toast-plus-redirect path, including its deliberately uncached, best-effort
  GET /v1/cases/{slug}/versions read that never surfaces a second, generic QueryCache-level toast alongside
  the domain-specific one.
- The double-click Save guard (isSubmittingRef) issuing exactly one POST, and the absence of any blur-triggered
  auto-save on the blank form.
- 'edit-draft-version''s own call site of useEditDraftVersionForm and case-version-editor-screen.tsx:
  unaffected, since `release`, `discard` and the new `isFirstVersion` all stay absent there.'
deferred:
- what: Whether a case's subject type may be changed once a draft already exists, once seeded from a released
    version's own subject.
  why: The task's own Notes leave this exactly as undecided as the onda-7 scope found it, for the plan's
    own blind judge to decide should it ever surface against a task's own criteria; no criterion of this
    task asserts whether the curator may change subject after pre-population, so nothing here decides
    it either.
---

## What it is
The seeding and POST-body widening capability the onda-7 scope describes, layered on new-draft-creation's own blank-form flow rather than replacing it.

## Notes
The build required two environment fixes this worktree did not carry over from the main tree: initializing the frontend/tui git submodule (git worktree checkouts do not clone submodules automatically) and running npm ci inside frontend/tui/frontend for its own vendored dependencies (react, class-variance-authority, lucide-react, the Radix packages) that its source files import and frontend/app's tsconfig paths resolve straight into. Neither fix touched any file this record's files list names; both fixes are recorded rather than worked around, per the earlier build run's own typecheck.log.
CreateDraftRequestBody's own type widening (adding consolidation_register and source_version) is this task's own responsibility per the inventory's own noted risk; it now matches the four attributes new-draft-creation left narrow deliberately at its own prior scope.
Whether a case's subject type may be changed once a draft already exists stays exactly as undecided as the onda-7 scope found it, per this task's own Notes; no criterion here touches it.
