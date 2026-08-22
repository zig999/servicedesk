---
title: New Draft origination flow, over the Version Editor's shared form
summary: Adds a "New draft" entry point to Case Detail that opens a blank instance of the Version Editor whose first Save issues POST /v1/cases, then switches in place into edit-draft-version's own PATCH-based edit-mode flow, and handles the 409 CaseAlreadyHasDraftError race with a toast plus a redirect to the case's existing draft.
task: sha256:93a8b6cf2b4aa1491715168deff42bed77daa119ea44dd83713d3d2690837af9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-onda-3-full-suite
files:
  - path: src/hooks/use-glossary-vocabulary.ts
    effect: >-
      Widens GlossaryVocabulary from "outcome"|"action"|"recipient" to also include
      "subject-type", so useGlossaryVocabularyOptions can read GET /v1/glossary/subject-type for
      the blank form's own pre-set field.
  - path: src/hooks/use-edit-draft-version-form.ts
    effect: >-
      Widens useEditDraftVersionForm's `version` parameter to `number | null` and adds an
      optional `seedRecord` parameter; when a seed is supplied (or version is still null) the
      internal versionQuery is disabled and seeded from `initialData` instead of fetching, so the
      same hook can now be reused, unmodified in its PATCH/conflict/telemetry behavior, by a
      caller that has just created a draft rather than loaded one. Also exports the previously-
      private `CaseVersionRecord` type and `errorStateKind` helper for that same reuse.
  - path: src/hooks/use-new-draft-version-form.ts
    effect: >-
      New file. The New Draft origination hook -- a blank react-hook-form instance pre-set from
      the subject-type vocabulary, a POST /v1/cases mutation, 409 handling (toast +
      GET-list-case-versions-resolved redirect to the existing draft), and delegation to
      useEditDraftVersionForm (unconditionally called, seeded once a draft exists) so the screen
      renders the identical edit-mode state and markup once created.
  - path: src/routes/case-version-editor-ready-view.tsx
    effect: >-
      New file. Factors the Version Editor's "ready" phase markup (conflict banner +
      CaseVersionEditorFormFields) out of case-version-editor-screen.tsx into its own component,
      so both the existing edit route and this task's new create route render through the
      identical markup rather than a second, hand-copied one.
  - path: src/routes/case-version-editor-screen.tsx
    effect: >-
      Unchanged behavior; now composes CaseVersionEditorReadyView instead of inlining the
      conflict-banner-plus-form-fields JSX, and drops its own now-unused
      CONFLICT_BANNER_TITLE/MESSAGE constants (moved into the shared view).
  - path: src/routes/new-case-draft-screen.tsx
    effect: >-
      New file. The routed screen for "/cases/$slug/versions/new" -- composes
      useNewDraftVersionForm's loading/load-error/ready phases, rendering the ready phase through
      the same CaseVersionEditorReadyView the edit route uses.
  - path: src/routes/route-tree.tsx
    effect: >-
      Registers a new static leaf route "/cases/$slug/versions/new" (component
      NewCaseDraftScreen) alongside the existing "/cases/$slug/versions/$version" route; the
      router's own specificity-based matching (static segments rank over the "$version" param)
      keeps the two from colliding regardless of order.
  - path: src/routes/case-detail-screen.tsx
    effect: >-
      Renders a "New draft" Link (to the new route, params={{slug}}) immediately after the
      heading, only when none of the fetched versions has state "draft".
  - path: src/shared/components/app-shell.tsx
    effect: adds a "New Draft" breadcrumb label for the new route's id in ROUTE_LABELS.
criteria:
  - criterion: >-
      "New draft" is rendered in Case Detail only when none of that case's existing versions is
      currently in draft state.
    met: true
    how: >-
      case-detail-screen.tsx computes `hasDraft = data.data.some((v) => v.state === "draft")` from
      the already-fetched list-case-versions response and renders the "New draft" Link only when
      `!hasDraft`.
  - criterion: Clicking "New draft" opens the Version Editor with no version's content pre-loaded, and the subject field pre-set to the one subject-type value GET /v1/glossary/subject-type currently returns.
    met: true
    how: >-
      the Link navigates to "/cases/$slug/versions/new" (NewCaseDraftScreen), whose
      useNewDraftVersionForm builds a fresh, all-blank react-hook-form instance and pre-sets only
      the subject field, via an effect keyed on the resolved value, from
      useGlossaryVocabularyOptions("subject-type")'s own first returned option.
  - criterion: >-
      Clicking Save on that blank form issues POST /v1/cases with { slug, title, when_to_use,
      authored_at, subject, fallback } built from the curator's entered content, the case's own
      slug from the route, and a client-side authored_at timestamp captured at the moment of that
      save.
    met: true
    how: >-
      createMutation's mutationFn (use-new-draft-version-form.ts) builds exactly that body --
      `slug` from the hook's own parameter (the route's slug), `authored_at` from
      `new Date().toISOString()` computed at submit time, and title/when_to_use/subject/fallback
      from the submitted form values -- and POSTs it to "/v1/cases".
  - criterion: A 201 response to that POST switches the form into the same edit-mode flow edit-draft-version delivers for an existing draft, addressed by the version number the response returns.
    met: true
    how: >-
      onSuccess stores `{ version: data.version, record }` in local state;
      useEditDraftVersionForm(slug, created?.version ?? null, created?.record) is called
      unconditionally every render, and once `created` is set this hook's own return value
      becomes exactly useEditDraftVersionForm's, so the screen (through the shared
      CaseVersionEditorReadyView) renders the identical PATCH-based save state machine, now
      addressed at the created version's own URL segment inside the PATCH request.
  - criterion: That switch to edit mode seeds the form from the content just submitted and the returned version number, without issuing a follow-up GET /v1/cases/{slug}/versions/{version}.
    met: true
    how: >-
      the record passed as `seedRecord` is built from the mutation's own `values` argument (what
      was just submitted), not from the POST response (which carries only `{ slug, version }`);
      useEditDraftVersionForm's versionQuery evaluates `enabled: version !== null && seedRecord
      === undefined` to false whenever a seed is present and uses `initialData: seedRecord`, so
      its queryFn (the GET) is never invoked.
  - criterion: >-
      A 409 CaseAlreadyHasDraftError response to that POST shows a toast stating a draft already
      exists for the case and navigates to that case's existing draft version, resolved by reading
      GET /v1/cases/{slug}/versions.
    met: true
    how: >-
      onError resolves the error through the shared errorStateKind/uiStateForApiError table; on
      kind "case-already-has-draft" it calls `toast.error('A draft already exists for the case
      "<slug>".')` and `redirectToExistingDraft()`, which reads "/v1/cases/{slug}/versions", finds
      the item whose state is "draft", and navigates to "/cases/$slug/versions/$version" with
      that version.
nodes:
  - node: domain/knowledge/case
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
    how: >-
      the case's own stable slug, read from the route, addresses both the create POST's body and
      the two list-case-versions reads this task adds (New-draft gating and 409 resolution).
  - node: domain/knowledge/case-version
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      the blank form's field set (title, when_to_use, subject, fallback) plus a client-captured
      authored_at mirror this aggregate's declared attributes for a version being originated, and
      the created version is thereafter addressed by the version number POST /v1/cases returns.
  - node: domain/knowledge/case-version-state
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      both New Draft's own visibility and the 409 redirect's own target selection key off a
      version's state value ("draft" vs "released").
  - node: domain/knowledge/resolution
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      the `fallback` field sent in POST /v1/cases's body is this value object ({ outcome,
      referral }), taken from the same shared field markup edit-draft-version already renders.
  - node: domain/knowledge/referral
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
    how: fallback.referral's own { action, recipient } shape travels inside the same create body and the same shared field markup.
  - node: domain/glossary/subject-type
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      the blank form's subject field is pre-set from GET /v1/glossary/subject-type's own returned
      term name, through the widened GlossaryVocabulary union and a dedicated preset effect keyed
      on that resolved value.
  - node: contracts/knowledge/case-lifecycle
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
    how: the published create-draft operation is invoked from the client exactly as this contract exposes it, through POST /v1/cases.
  - node: contracts/knowledge/case-query
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      list-case-versions (GET /v1/cases/:slug/versions) is read twice -- to compute Case Detail's
      own New-draft gating, and to resolve which version is the existing draft after a 409.
  - node: contracts/glossary/glossary-query
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      list-vocabulary-terms (GET /v1/glossary/{vocabulary}) is read for subject-type (this task's
      own addition) alongside the outcome/action/recipient vocabularies edit-draft-version already
      reads, through the same widened hook.
  - node: rules/knowledge/a-case-has-at-most-one-draft
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/hooks/use-new-draft-version-form.ts
    how: >-
      enforced twice on the client -- New Draft is hidden the moment a case already holds a draft,
      and the 409 CaseAlreadyHasDraftError the backend raises when that same rule is violated by a
      race is caught and turned into a toast plus a redirect to the draft that already exists.
inferences:
  - inferred: >-
      after a successful create, the browser stays addressed at "/cases/$slug/versions/new"
      rather than navigating to "/cases/$slug/versions/$version", even though
      intake/onda-3-scope.md's own prose describes the outcome as "navega para a versão
      recém-criada".
    from: >-
      this task's own rationale and Notes: GET /v1/cases/:slug/versions/:version's response
      schema requires manifest.min(1), and a freshly created draft's manifest is empty until the
      Manifest Builder (Onda 4) composes it. Navigating to the general edit route would make that
      forbidden GET reachable through an ordinary page refresh (CaseVersionEditorScreen always
      issues it on mount); staying addressed at the create route and threading the created
      version number only into the PATCH mutation and telemetry avoids that path entirely, which
      reads criterion 4's "addressed by the version number" as a fact about which resource Save
      now updates rather than about the browser's own location.
  - inferred: a successful create emits telemetry.caseDraftCreated({ slug, version }).
    from: >-
      use-telemetry.ts's own catalog documents this exact event as "a curator started a new draft
      for a case", and useEditDraftVersionForm already emits the analogous caseDraftUpdated on a
      successful PATCH -- no criterion of this task names it, but the catalog and the established
      call-on-success convention both point at it.
  - inferred: >-
      the Save button on the blank form is enabled from the moment the form renders (not gated on
      a prior edit, unlike edit-draft-version's own clean/dirty distinction), and disabled only
      while the POST is in flight.
    from: criterion 3 names only "clicking Save issues POST", with nothing to compare a first save against the way an existing draft's own clean/dirty state does.
  - inferred: >-
      the subject field is pre-set from the vocabulary's first returned option
      (`options[0]?.value`), read as "the one" value.
    from: criterion 2's own wording ("the one subject-type value ... currently returns") and the inventory's confirmed fixture data (exactly one subject-type term registered today).
  - inferred: >-
      "New draft" renders as a plain @tanstack/react-router Link (not a styled button), placed
      immediately after the Case Detail heading.
    from: case-detail-timeline's own established convention for its "Continue editing" action in the same file -- no reference was given for this task, so the existing sibling convention in the same screen is what settles the form.
  - inferred: >-
      a failure to resolve the 409 redirect's own target (the version-list read itself failing, or
      returning no item whose state is "draft") leaves the curator on the create screen, having
      already seen the "draft already exists" toast, rather than navigating anywhere else.
    from: no criterion of this task names a target for that secondary failure, and the 409 itself already told the curator a draft exists; inventing a further destination would be stating a fact the specification does not hold.
  - inferred: >-
      the 409 toast reads exactly `A draft already exists for the case "<slug>".`, and the generic
      mutation-failure toast reuses useEditDraftVersionForm's own wording ("Something went wrong
      while saving. Try again.").
    from: criterion 6 states only that the toast must state a draft already exists for the case, not its literal wording; the generic fallback mirrors the sibling hook's own established, already non-domain wording rather than inventing a second phrasing for the same situation.
preserved:
  - >-
    edit-draft-version's own PATCH-based edit flow for an existing draft (CaseVersionEditorScreen's
    two-argument call to useEditDraftVersionForm) behaves exactly as before -- version is always a
    real number and seedRecord is always undefined at that call site, so `enabled` evaluates to
    what it always did and the GET always fires.
  - >-
    case-detail-screen.tsx's existing version-timeline rendering (rows, color+label state cells,
    "Continue editing" links) for cases that already hold a draft is untouched; the new Link
    renders only in the complementary case.
  - the ten routes route-tree.tsx already registered, and their component wiring, are unchanged; the new route is an addition, not a replacement.
  - app-shell.tsx's breadcrumb labeling for the existing ten routes is unchanged; one entry was added for the new route.
deferred:
  - what: >-
      route-tree.spec.ts's own assertion ("registers a route at each of the ten proposal screens'
      paths, and no other") was stale after this task added an eleventh route,
      "/cases/$slug/versions/new" -- not one of the original ten proposal screens (2.1 through
      2.10) but architecturally required so the create flow and the edit flow mount as genuinely
      distinct component instances (avoiding a conditional-hook hazard a shared
      "$version === 'new'" branch inside one component would otherwise create).
    why: >-
      updating that test's own expectations is test-authorship, which this implementation record
      does not perform; the caller updated route-tree.spec.ts directly (it asserts router
      structure only, in Vitest's "node" environment, with no domain behavior of its own to
      author) before this task's own proof was written, so nothing here was left silently broken.
---

## What it is
The New Draft origination flow deferred from Onda 2's case-detail-new-draft-action, now feasible because the field form it needs (edit-draft-version) exists. The 409 CaseAlreadyHasDraftError race Onda 2 documented but never implemented, handled here exactly as originally intended: toast plus redirect to the existing draft.

## Notes
The inventory flags that GET /v1/cases/:slug/versions/:version's response schema requires manifest.min(1), so a freshly created draft (zero manifest entries) may not be readable back through that same endpoint immediately after creation. The decision made here is not to attempt that GET at all: the POST's own { slug, version } response plus the content the editor already holds (it is exactly what was just submitted) is enough to seed the edit-mode state, so the empty-manifest gap is never exercised by this task.
domain/knowledge/consolidation-register is deliberately not implemented here even though the shared form carries the field: the decision log settles that consolidation_register was added to update-draft specifically so a curator corrects it after create-draft, not as part of origination itself -- which is also why criterion 3's POST body omits it. Correcting it belongs to edit-draft-version, exercised on the draft this task just created.
rules/knowledge/validation-runs-at-every-read is invoked informally in this task's own rationale (it is the reason no follow-up GET is issued after the 201), but no criterion of this task actually asserts or exercises that a stored case version reads as a case only while every validator rule holds -- the execution-contract-binder, on a fresh rereading of the fully expanded candidate set, excluded it from `implements` on that ground, and it stands as an explicitly uncovered node on the epic's own covers list, with that same reasoning recorded there.
