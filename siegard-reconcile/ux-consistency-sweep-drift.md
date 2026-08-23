---
contract_version: siegard-reconcile/1
title: Code drift from the case-authoring-console UX-consistency sweep (EDG-02/API-04/ACC-07)
summary: >-
  Three corrective tasks (every-load-error-offers-retry, every-empty-collection-states-so,
  every-async-update-is-announced) legitimately added a Retry control, an explicit empty-state
  sentence, and an aria-live/role="alert" announcement across six screens, each already bound by
  earlier tasks (Ondas 1-6) -- a bind restamps only the delivering task's own nodes, leaving every
  other node already bound to these six files stale. The premise here is the delivered source
  itself: all three tasks already passed their own captured full-suite run
  (run/ux-consistency-sweep-full-suite, 8/8 steps, 308/308 tests); this reconciliation asks the
  narrower question of whether the specification still describes what these six files now state,
  for every node the trace currently binds to any of them.
target: frontend
files:
  - path: src/routes/case-detail-screen.tsx
    change: >-
      VersionsPanel's isError-or-no-data branch now renders a Retry Button wired to refetch();
      its success path computes rows/hasDraft unconditionally and renders an explicit
      "This case currently holds no version." sentence in place of the StatusTable when the
      version list is empty, without suppressing "New draft".
  - path: src/routes/cases-list-screen.tsx
    change: >-
      CasesListScreen's isError branch now renders a Retry Button wired to casesQuery.refetch();
      a new aria-live="polite" paragraph beside the search input announces the filtered row count.
  - path: src/routes/capabilities-browser-screen.tsx
    change: >-
      CapabilitiesBrowserScreen's isError branch now renders a Retry Button wired to
      useCapabilities()'s own refetch; CapabilityDetailPanel's conditional mount point is now
      wrapped in an aria-live="polite" div.
  - path: src/routes/case-version-editor-form-fields.tsx
    change: >-
      The save-status "Last saved …" span now carries aria-live="polite".
  - path: src/routes/case-version-editor-ready-view.tsx
    change: >-
      The Release Dialog's violations-kind branch now renders an explicit
      "No specific violation was returned." sentence inside the existing role="alert" div when
      the response's own violations array is empty, instead of an empty <ul>.
  - path: src/routes/version-manifest-screen.tsx
    change: >-
      RowActions' own moveErrorMessage paragraph now carries role="alert".
nodes:
  - node: contracts/knowledge/case-query
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's own module comment and useCaseVersions call ("read from
      GET /v1/cases/:slug/versions (contracts/knowledge/case-query's own list-case-versions
      operation)"), and at cases-list-screen.tsx's three apiFetch calls
      (`apiFetch<PaginatedResponse<CaseIdentity>>("/v1/cases")`). Neither file's own corrective
      addition (a Retry control, an aria-live count) touches this contract's own operations.
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/routes/cases-list-screen.tsx
  - node: domain/knowledge/case
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's `slug` identity (`useParams({ from: "/cases/$slug" })`),
      cases-list-screen.tsx's `CaseIdentity` type (`{ readonly slug: string }`), and
      case-version-editor-ready-view.tsx's `slug` prop rendered into the Discard Dialog's
      confirmation prompt. None of the three corrective additions touches the case identity.
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/routes/cases-list-screen.tsx
      - src/routes/case-version-editor-ready-view.tsx
  - node: domain/knowledge/case-version
    conforms: false
    how: >-
      Contradicted in case-version-editor-form-fields.tsx: the "Subject type (fixed)" field
      (`<Input {...register("subject")} disabled />`) permanently refuses to let a curator
      correct a draft's own subject, while domain/knowledge/case-version's own text states "While
      in draft, its own declared attributes may likewise be corrected, as many times as curation
      needs" -- subject named among those attributes -- and the decision log records update-draft
      being added specifically so a curator could correct "title, when_to_use, subject, fallback,
      consolidation_register" after create-draft. This is a pre-existing divergence (from Onda 3's
      own edit-draft-version delivery, already disclosed in review/version-editor-onda-3.md and
      never corrected), not introduced by this sweep -- but the sweep's own edit to this same file
      (wrapping the save-status indicator in aria-live) means this node's binding on
      case-version-editor-form-fields.tsx needed rejudging regardless, and the contradiction still
      stands. The other two files bound to this node (case-detail-screen.tsx's `toRow()`/
      `CASE_VERSIONS_COLUMNS`, reading only `version` and `state`; case-version-editor-ready-view.tsx's
      `release.version` rendered into the Release Dialog's title) conform on their own, but this
      node's own trace entry aggregates across every file it is bound to, and one contradiction
      leaves the whole node unclearable this round.
    observed_at:
      - src/routes/case-detail-screen.tsx
      - src/routes/case-version-editor-form-fields.tsx
      - src/routes/case-version-editor-ready-view.tsx
  - node: domain/knowledge/case-version-state
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's `STATE_CELL` (`draft`/`released` mapped to color+label) and
      cases-list-screen.tsx's `CaseVersionState` type (`"draft" | "released"`). Unchanged by
      either file's own corrective addition.
    encoded_at:
      - src/routes/case-detail-screen.tsx
      - src/routes/cases-list-screen.tsx
  - node: rules/knowledge/a-case-has-at-most-one-draft
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's `hasDraft` gate on the "New draft" link
      (`data.data.some((version) => version.state === "draft")`), unchanged by this sweep's own
      fix (which computes hasDraft unconditionally now, but the gate's own logic is identical).
    encoded_at:
      - src/routes/case-detail-screen.tsx
  - node: rules/knowledge/every-case-version-remains-readable
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's unfiltered `data.data.map((version) => toRow(slug,
      version))` -- every version still reaches a row, unchanged by this sweep.
    encoded_at:
      - src/routes/case-detail-screen.tsx
  - node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
    conforms: true
    how: >-
      Held at case-detail-screen.tsx's empty-state branch, `<p>This case currently holds no
      version.</p>`, rendered exactly when the fetched version list is empty -- matching the
      scenario's own `then`: "the read states explicitly that this case currently holds no
      version" / "it is never an empty listing with nothing said about why".
    encoded_at:
      - src/routes/case-detail-screen.tsx
  - node: domain/integration/capability
    conforms: true
    how: >-
      Held at capabilities-browser-screen.tsx's `Capability` type, `capabilityKey` (name+version
      identity), `formatTimeout` (the "in milliseconds" unit) and `CapabilityDetailPanel`
      (version/input_schema/output_schema) -- together covering exactly the node's eight
      attributes. Neither the new Retry control nor the aria-live wrapper around the detail panel
      touches the capability aggregate's own attribute set or identity claim.
    encoded_at:
      - src/routes/capabilities-browser-screen.tsx
  - node: domain/glossary/action
    conforms: true
    how: "Held at the \"Fallback referral (action)\" field, `options={actionOptions.options}` -- the vocabulary is drawn from a caller-supplied, glossary-backed source, not restated."
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/glossary/outcome
    conforms: true
    how: "Held at the \"Fallback outcome\" field, `options={outcomeOptions.options}` -- external, not restated."
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/glossary/recipient
    conforms: true
    how: "Held at the \"Fallback referral (recipient)\" field, `options={recipientOptions.options}` -- external, not restated."
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/consolidation-register
    conforms: true
    how: >-
      Held at the "Consolidation register" field, built from an imported `CONSOLIDATION_REGISTERS`
      constant declared outside this file; this file does not restate the enumeration itself.
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/referral
    conforms: true
    how: >-
      Held at the paired "Fallback referral (action)"/"Fallback referral (recipient)" fields,
      matching the value-object's one-action-one-recipient shape.
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/resolution
    conforms: true
    how: >-
      Held at the "Fallback outcome" and fallback-referral fields together
      (`fallback.outcome`, `fallback.referral.action`, `fallback.referral.recipient`), rendering
      outcome and referral as the two parts of one fallback resolution.
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    conforms: true
    how: >-
      Held at the three vocabulary-backed Select fields (outcome, action, recipient), each option
      set supplied by a glossary-sourced hook rather than declared in this component -- this file
      does not itself violate the policy, enforcement lives upstream of it.
    encoded_at:
      - src/routes/case-version-editor-form-fields.tsx
  - node: domain/knowledge/case-summary
    conforms: false
    how: >-
      domain/knowledge/case-summary declares current_state, version_count and last_updated all
      `required: true`, with no stated exception. cases-list-screen.tsx's own `CaseSummary` type
      (`{ readonly versionCount: number; readonly currentState?: CaseVersionState; readonly
      lastUpdated?: string; }`) makes current_state and last_updated optional, for the case a
      case currently holds zero versions -- a real, standing state per
      only-a-draft-case-version-may-be-discarded plus a-case-version-number-is-never-reused. The
      node states no exception for this case; the code needs one. Not this sweep's own
      introduction (the corrective task touched only this file's load-error branch and its own
      new aria-live count paragraph, neither of which reaches CaseSummary's own shape), but the
      node was read fresh per this route's own rule and the contradiction stands unresolved.
    observed_at:
      - src/routes/cases-list-screen.tsx
  - node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
    conforms: true
    how: >-
      Held at `fetchCaseSummary`'s own derivation (`const versionCount = probe.total; if
      (versionCount === 0) { return { versionCount }; } const highestOffset = versionCount - 1;`),
      matching the rule's own text that current_state/last_updated come from the highest-numbered
      version.
    encoded_at:
      - src/routes/cases-list-screen.tsx
  - node: domain/knowledge/hypothesis
    conforms: true
    how: "Held at toStatusRow's `hypothesis: \\`${row.hypothesisName} · rev ${row.revision}\\`` column."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: domain/knowledge/hypothesis-revision
    conforms: true
    how: "Held at the ` · rev ${row.revision}` suffix in that same column."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: domain/knowledge/manifest-entry
    conforms: true
    how: "Held at the position column and the up/down move controls in RowActions."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    conforms: true
    how: "Held at REMOVE_DISABLED_TOOLTIP and removeDisabled (`row.isOnlyEntry || disabled`) in RowActions."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: rules/knowledge/a-case-version-is-written-once
    conforms: true
    how: "Held at the ConflictBanner rendered when state.isBlocked, unchanged by this sweep's own role=\"alert\" addition elsewhere in the same file."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: rules/knowledge/hypotheses-are-ordered-by-precedence
    conforms: true
    how: "Held at the up/down move buttons in RowActions, driven by row.canMoveUp/row.canMoveDown."
    encoded_at:
      - src/routes/version-manifest-screen.tsx
  - node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
    conforms: true
    how: >-
      Held at the role="alert" branch taken when release.dialog.violations is empty, rendering
      "No specific violation was returned." -- matching the rule's own requirement that release
      say so explicitly rather than leaving an unexplained, empty refusal. The node states the
      requirement generically and pins no exact wording, so this phrasing is not a second home
      for a fact the node holds.
    encoded_at:
      - src/routes/case-version-editor-ready-view.tsx
notes: >-
  Six delegations, one per named file, each passed the nodes the trace already binds that file to
  plus the full node set across all six files as candidates for misattribution. One candidate-opened
  finding did not lead to a bind either way: cases-list-screen.tsx's own doc comment on its
  CaseSummary type states "an edge no governing node addresses" for the case a case currently holds
  zero versions -- which is no longer true now that scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  exists. This is a stale comment in a file the scenario is not itself bound to (only
  case-detail-screen.tsx is), not a contradiction of the scenario's own binding, which conforms
  cleanly where it is actually encoded; the comment's own staleness is disclosed here rather than
  silently absorbed into either node's bind, since correcting it is a hand edit to a comment, not a
  reconciliation this route resolves. Two nodes could not be cleared and are not bound by this
  record: domain/knowledge/case-version (contradicted by case-version-editor-form-fields.tsx's own
  permanently-disabled Subject field, a pre-existing Onda-3 finding never corrected -- either the
  field becomes editable while draft, matching the node, or the exception is decided into the
  specification) and domain/knowledge/case-summary (cases-list-screen.tsx's own optional
  current_state/last_updated contradicts the node's all-required attributes for a case holding zero
  versions -- either the node states that exception, or the screen represents that case as the
  absence of a case-summary rather than a partial one). Both are handed back without this record
  choosing between their own two resolution routes.
---
