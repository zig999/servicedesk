---
contract_version: siegard-reconcile/1
title: Onda 7 code drift over the version-editor and case-detail shared files
summary: >-
  Three separately-delivered, since-merged tasks (task/version-editor/view-released-version-read-only,
  task/version-editor/seed-new-draft-from-latest-released, task/cases-list-and-detail/case-attributes-at-a-glance)
  each restamped only their own specification nodes on the shared files they touched
  (use-edit-draft-version-form.ts, use-new-draft-version-form.ts, case-detail-screen.tsx,
  case-version-editor-form-fields.tsx, case-version-editor-ready-view.tsx), leaving every
  other node the trace binds to these same files -- stale ones reported by trace.py --check,
  and freshly-bound ones the delivering tasks' own binds already restamped -- owed a
  conformance reading. The human's premise is that this source is correct as it now stands;
  each file's own new material from this onda was already bound by its own delivery's own bind
  and is not this record's own concern, except where a delegation's reading surfaced a genuine
  finding against a bound node, reported below rather than silently passed over.
target: frontend
files:
  - path: src/hooks/use-edit-draft-version-form.ts
    change: >-
      gained an isReadOnly-driven render path and a wider manifest/isFirstVersion-carrying
      "ready" union, alongside its own pre-existing PATCH/release/discard logic, which is
      unchanged in substance
  - path: src/hooks/use-new-draft-version-form.ts
    change: >-
      seeds the blank form from the case's latest released version and widens the create-draft
      POST body with consolidation_register and source_version, alongside its own pre-existing
      subject-type pre-set and 409-conflict handling, which is unchanged in substance
  - path: src/routes/case-detail-screen.tsx
    change: >-
      gained a "View" action on a released row and a third "Attributes" tab, alongside its own
      pre-existing Versions/Hypotheses tabs and empty-state handling, which is unchanged in
      substance
  - path: src/routes/case-version-editor-form-fields.tsx
    change: >-
      gained an isReadOnly prop that omits the Save control and footer, alongside its own
      pre-existing glossary-backed field markup, which is unchanged in substance
  - path: src/routes/case-version-editor-ready-view.tsx
    change: >-
      gained a Manifest section rendered for read-only mode, alongside its own pre-existing
      conflict banner and Release/Discard dialogs, which is unchanged in substance
nodes:
  - node: contracts/glossary/glossary-query
    conforms: true
    how: >-
      use-edit-draft-version-form.ts calls useGlossaryVocabularyOptions("outcome"/"action"/
      "recipient") and useConceptOptions(); use-new-draft-version-form.ts calls
      useGlossaryVocabularyOptions("subject-type"). Both still read this contract's own
      vocabulary listings exactly as before.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
  - node: contracts/knowledge/case-lifecycle
    conforms: true
    how: >-
      the PATCH/release/discard calls in use-edit-draft-version-form.ts, and the create-draft
      POST dispatch (`apiFetch<CreatedDraft>("/v1/cases", { method: "POST", ... })`) in
      use-new-draft-version-form.ts, are both unchanged in substance from what this contract
      already governed.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
  - node: contracts/knowledge/case-query
    conforms: true
    how: >-
      use-edit-draft-version-form.ts's versionQuery (GET .../versions/{version}) and
      use-new-draft-version-form.ts's own version-record and version-list reads both match this
      contract's read-case and list-case-versions operations; case-detail-screen.tsx's own
      header comment and its VersionsPanel/Attributes-tab delegation likewise name exactly
      list-case-versions and read-case, matching the contract's own Description of a case read
      "whole" and listings "a curator browses by."
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
  - node: domain/glossary/action
    conforms: true
    how: >-
      `useGlossaryVocabularyOptions("action")` in use-edit-draft-version-form.ts, and the
      "Fallback referral (action)" Select bound to actionOptions.options in
      case-version-editor-form-fields.tsx, both unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/glossary/concept
    conforms: true
    how: "`const conceptOptions = useConceptOptions();` in use-edit-draft-version-form.ts, unchanged in substance."
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
  - node: domain/glossary/outcome
    conforms: true
    how: >-
      `useGlossaryVocabularyOptions("outcome")` in use-edit-draft-version-form.ts, and the
      "Fallback outcome" Select bound to outcomeOptions.options in
      case-version-editor-form-fields.tsx, both unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/glossary/recipient
    conforms: true
    how: >-
      `useGlossaryVocabularyOptions("recipient")` in use-edit-draft-version-form.ts, and the
      "Fallback referral (recipient)" Select bound to recipientOptions.options in
      case-version-editor-form-fields.tsx, both unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/glossary/subject-type
    conforms: true
    how: >-
      resetFormFrom's `subject: record.subject` in use-edit-draft-version-form.ts, and
      use-new-draft-version-form.ts's pre-set from the one subject-type value
      GET /v1/glossary/subject-type returns, both unchanged in substance: subject-type is read
      purely as a discovered, listed vocabulary value in both files.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
  - node: domain/knowledge/case
    conforms: true
    how: >-
      `slug` is consumed as the case's own identity throughout use-edit-draft-version-form.ts,
      use-new-draft-version-form.ts (including its own next_version-derived "highest released
      entry is unambiguous" reasoning), case-detail-screen.tsx (`useParams`) and
      case-version-editor-ready-view.tsx (the Discard dialog's typed-slug confirmation) --
      unchanged in substance in all four.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
      - src/routes/case-version-editor-ready-view.tsx
  - node: domain/knowledge/case-version
    conforms: false
    how: >-
      Cleared independently in four of its five bound files (use-edit-draft-version-form.ts's
      resetFormFrom/CaseVersionRecord-typed state; use-new-draft-version-form.ts's
      CreateDraftRequestBody; case-detail-screen.tsx's toRow/version-state fields;
      case-version-editor-ready-view.tsx's manifest section and Release dialog's version
      number), but case-version-editor-form-fields.tsx's own rendering of this node's
      declared attributes departs from it: every other declared attribute the node lists
      (title, when_to_use, consolidation_register, fallback) is rendered disabled only while
      `isBlocked` -- correctable through a draft's own life, per the node's own "While in
      draft, its own declared attributes may likewise be corrected, as many times as curation
      needs" -- but `subject` is rendered unconditionally `disabled` (`<Input {...register("subject")}
      disabled />`, labeled "Subject type (fixed)"), with no path to correct it in draft at all.
      decision-log.md's own entry for this node's `operations` field names update-draft as
      letting a curator correct title, when_to_use, subject, fallback and consolidation_register
      after create-draft -- subject included -- which this one file's own rendering contradicts.
      Because a node the trace binds to more than one file conforms only where every file
      that carries it cleared, this one file's departure holds the whole node's binding back
      across all five files it is bound to, not only this one.
    observed_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
      - src/routes/case-version-editor-form-fields.tsx
      - src/routes/case-version-editor-ready-view.tsx
  - node: domain/knowledge/case-version-state
    conforms: true
    how: >-
      use-edit-draft-version-form.ts's `record.state` comparisons, use-new-draft-version-form.ts's
      `.filter((item) => item.state === "released")`, and case-detail-screen.tsx's
      STATE_CELL/actionsForRow mapping all compare only against this node's own two declared
      values ("draft", "released"), exhaustively and with no third value or fallback.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
  - node: domain/knowledge/consolidation-register
    conforms: true
    how: >-
      use-new-draft-version-form.ts's CreateDraftRequestBody field and POST-body pass-through,
      and the CONSOLIDATION_REGISTER_OPTIONS list plus "Consolidation register" Select in
      case-version-editor-form-fields.tsx, are both unchanged in substance from what this node
      already governed.
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/manifest-entry
    conforms: true
    how: >-
      the widened `manifest?: readonly CaseVersionManifestEntry[]` field in
      use-edit-draft-version-form.ts, and toManifestRow's own reading of one entry's position
      and its hypothesis-revision's fields in case-version-editor-ready-view.tsx, both still
      carry exactly this node's own declared shape (a manifest line referencing one
      hypothesis-revision) -- only projected wider than before to include position, hypothesis
      name, revision and criterion -- with no fact beyond what this node declares asserted.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-ready-view.tsx
  - node: domain/knowledge/referral
    conforms: true
    how: >-
      `fallback: record.fallback` in use-edit-draft-version-form.ts, the fallback field's
      CreateDraftRequestBody type in use-new-draft-version-form.ts, and the paired
      action/recipient controls under "fallback.referral" in case-version-editor-form-fields.tsx,
      all unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/resolution
    conforms: true
    how: >-
      `fallback: record.fallback` (typed as resolution) in use-edit-draft-version-form.ts, the
      blank form's own default fallback shape in use-new-draft-version-form.ts, and the fallback
      field group pairing outcome with referral in case-version-editor-form-fields.tsx, all
      unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    conforms: true
    how: >-
      honored indirectly in use-edit-draft-version-form.ts by supplying `record` to the
      externally-built release checklist, never checked in this file directly -- unchanged in
      substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
  - node: rules/knowledge/a-case-has-at-most-one-draft
    conforms: true
    how: >-
      use-new-draft-version-form.ts's 409 case-already-has-draft toast-and-redirect, and
      case-detail-screen.tsx's `hasDraft` gate on the "New draft" link, both unchanged in
      substance.
    encoded_at:
      - src/hooks/use-new-draft-version-form.ts
      - src/routes/case-detail-screen.tsx
  - node: rules/knowledge/a-case-version-is-written-once
    conforms: true
    how: >-
      `record.state === "released"` feeding both `isBlocked` and the new `isReadOnly` field in
      use-edit-draft-version-form.ts; the isReadOnly-gated onSubmit/onBlur wiring and Save
      footer in case-version-editor-form-fields.tsx; and the isReadOnly-gated Manifest section
      in case-version-editor-ready-view.tsx -- all three implement this rule's UI consequence
      (no further edit offered on a released version) without asserting the rule itself
      differently than before.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
      - src/routes/case-version-editor-ready-view.tsx
  - node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    conforms: true
    how: "`canRelease = record.state === \"draft\" && !isReleased` in use-edit-draft-version-form.ts, unchanged in substance."
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
  - node: rules/knowledge/a-concept-accepts-the-declared-subject-type
    conforms: true
    how: >-
      honored indirectly in use-edit-draft-version-form.ts by feeding `record`/`concepts` into
      the externally-built release checklist, never evaluated in this file directly -- unchanged
      in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
  - node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
    conforms: false
    how: >-
      This rule's own statement draws a line between an explicitly-named source_version (a
      rollback's own signature) and naming none (ordinary creation, where the server applies
      its own default -- the case's own latest released version). use-new-draft-version-form.ts's
      createMutation always sends source_version explicitly, computed as the latest released
      version, whenever one exists (`...(latestReleasedVersionNumber !== undefined ? {
      consolidation_register: ..., source_version: latestReleasedVersionNumber } : {})`) -- this
      hook implements only the ordinary new-draft flow (there is no UI here for choosing an
      earlier version to continue from), yet it erases the one signal the rule uses to
      distinguish ordinary creation from a deliberate rollback by sending that signal on every
      ordinary creation too.
    observed_at:
      - src/hooks/use-new-draft-version-form.ts
  - node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
    conforms: true
    how: >-
      the violations-list branch of the Release dialog in case-version-editor-ready-view.tsx
      ("No specific violation was returned." where the 422's own violations array is empty) is
      unchanged in substance.
    encoded_at:
      - src/routes/case-version-editor-ready-view.tsx
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    conforms: true
    how: >-
      the four glossary-backed vocabulary reads re-fetched before the release checklist renders
      in use-edit-draft-version-form.ts, and the three Select controls constrained to
      vocabulary-sourced option lists in case-version-editor-form-fields.tsx, both unchanged in
      substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
  - node: rules/knowledge/every-case-version-remains-readable
    conforms: true
    how: >-
      case-detail-screen.tsx's Versions tab still renders every version the response's own data
      page carries, now with the added "View" link on a released row -- the row-building logic
      itself (`data.data.map(...)`) is unchanged in substance.
    encoded_at:
      - src/routes/case-detail-screen.tsx
  - node: rules/knowledge/only-a-draft-case-version-may-be-discarded
    conforms: true
    how: >-
      the discard control's gate (`canDiscard: record.state === "draft" && !isReleased`) in
      use-edit-draft-version-form.ts is unchanged in substance.
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
  - node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
    conforms: true
    how: >-
      the empty-rows branch of VersionsPanel in case-detail-screen.tsx ("This case currently
      holds no version.") is unchanged in substance.
    encoded_at:
      - src/routes/case-detail-screen.tsx
notes: >-
  Ten specification-conformance-reviewer delegations ran in total: five per-file passes over
  the nodes trace.py --check reported as stale, followed by five supplementary per-file passes
  covering nodes the same five files also answer to but that were already fresh (bound by this
  onda's own three deliveries) rather than stale, located by reading siegard-trace.json's own
  bindings directly rather than trusting the drift report alone. All ten ran independently, one
  file per delegation, together rather than in sequence.

  Two nodes carry a genuine finding and are not bound. domain/knowledge/case-version's
  departure (the subject field hard-disabled in case-version-editor-form-fields.tsx, contra
  decision-log.md's own recorded update-draft scope) predates this onda entirely -- the field
  has rendered this way since task/version-editor/edit-draft-version, and this onda's three
  tasks left it untouched. rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version's
  departure (source_version always sent explicitly rather than only for a deliberate rollback)
  was introduced by this onda's own task/version-editor/seed-new-draft-from-latest-released,
  whose own criterion 3 asked for exactly this behavior -- the tension is between that task's
  own stated criterion and a stricter reading of the rule's naming/silence distinction.

  One incidental, out-of-scope observation surfaced twice (independently, by the ready-view
  judge in both the first and second pass): case-version-editor-ready-view.tsx's toManifestRow
  doc comment credits domain/knowledge/manifest-entry with the guarantee that a manifest's own
  position is unique within one version, when that invariant is actually stated by
  rules/knowledge/a-hypothesis-position-is-unique-within-its-case. Neither node is part of this
  file's own bound-node set, so nothing here binds or unbinds either on that account; it is a
  doc-comment citation worth correcting, not drift this record answers to.
---
