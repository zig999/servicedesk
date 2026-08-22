---
title: Review of manifest-hypothesis-authoring onda 4 (3 delivered tasks)
summary: 'Four-pass review of the 3 delivered manifest-hypothesis-authoring tasks: coverage over their
  28 criteria, specification conformance, standard conformance, and the failures pass (which did not run
  -- the captured run passed cleanly).'
tasks:
- task/manifest-hypothesis-authoring/revise-hypothesis-form
- task/manifest-hypothesis-authoring/manifest-builder
- task/manifest-hypothesis-authoring/hypotheses-tab
reviewed:
- src/services/hypothesis-revision-form-schema.ts
- src/hooks/use-concept-options.ts
- src/hooks/use-hypothesis-revision-form.ts
- src/routes/hypothesis-revision-form-fields.tsx
- src/routes/hypothesis-revision-screen.tsx
- src/routes/new-hypothesis-screen.tsx
- src/routes/revise-hypothesis-screen.tsx
- src/routes/route-tree.tsx
- src/shared/components/app-shell.tsx
- src/routes/route-tree.spec.ts
- src/routes/hypothesis-revision-screen.spec.ts
- src/routes/hypothesis-revision-screen.test-support.ts
- src/routes/hypothesis-revision-screen-submit.spec.ts
- src/routes/hypothesis-revision-screen-errors.spec.ts
- src/hooks/use-manifest-builder.ts
- src/routes/version-manifest-screen.tsx
- src/services/api-client.ts
- vite.config.ts
- src/routes/version-manifest-screen.test-support.ts
- src/routes/version-manifest-screen-load.spec.ts
- src/routes/version-manifest-screen-reorder.spec.ts
- src/routes/version-manifest-screen-remove.spec.ts
- src/routes/version-manifest-screen-conflict.spec.ts
- src/services/api-client.spec.ts
- src/hooks/use-case-versions.ts
- src/hooks/use-case-hypotheses.ts
- src/hooks/use-hypothesis-revisions.ts
- src/routes/case-hypotheses-tab.tsx
- src/routes/hypothesis-revision-history.tsx
- src/routes/case-detail-screen.tsx
- src/routes/case-detail-screen-hypotheses-tab.spec.ts
- src/routes/case-hypotheses-tab.spec.ts
- src/routes/case-hypotheses-tab.test-support.ts
- src/routes/hypothesis-revision-history.spec.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/manifest-hypothesis-authoring-onda-4-full-suite) passed all 8 steps with
    189/189 tests passing; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: The "New hypothesis" entry point and the "Revise" entry point resolve to two distinct routes,
    so a hypothesis literally named "new" is addressed by the Revise route rather than being captured
    by the New-hypothesis route.
  state: partial
  tests:
  - file: src/routes/route-tree.spec.ts
    name: renders the New-hypothesis route and the Revise route through two distinct screens (criterion
      1)
  - file: src/routes/route-tree.spec.ts
    name: registers a route at each of the twelve proposal-plus-origination screens' paths, and no other
  - file: src/routes/route-tree.spec.ts
    name: assigns no two of the twelve routes the same path
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: is addressed by the Revise route's own code path -- fetching its revisions and rendering the
      Revise UI -- rather than the blank New-hypothesis form
  why: 'No test exercises the one literal URL the two entry points share (".../manifest/hypotheses/new")
    against the production route tree with a hypothesis actually named "new". The proof''s own record
    discloses this as `contested`: TanStack Router''s static-over-dynamic ranking would resolve that shared
    literal URL to the New-hypothesis route instead, the opposite of the criterion''s literal wording,
    for the same reason "versions/new" already ranks over "versions/$version".'
- criterion: Visiting the New-hypothesis route renders a blank form with the current draft's own subject
    type shown fixed and non-editable, and no hypothesis name pre-filled.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: renders a blank form with the draft's own subject type fixed and non-editable, and no hypothesis
      name pre-filled
- criterion: Visiting the Revise route for an existing hypothesis pre-populates the form's criterion,
    collects, resolution outcome, and referral action/recipient fields from that hypothesis's current
    revision, with the hypothesis name shown fixed and non-editable.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: pre-populates criterion, collects, resolution outcome and referral action/recipient from the
      hypothesis's own current (highest-numbered) revision, with the hypothesis name fixed and non-editable
- criterion: The Collects field offers only concepts whose own accepts list, read from GET /v1/glossary/concepts,
    includes the draft version's declared subject type.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: offers only the concepts whose own accepts list includes the draft's declared subject type
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: renders no Collects checkboxes when no concept in the glossary accepts the draft's declared
      subject type
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: groups the Collects checkboxes under one accessible group named "Collects"
- criterion: The resolution outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently
    returns, and the referral action and recipient dropdowns each offer exactly the terms GET /v1/glossary/action
    and GET /v1/glossary/recipient currently return.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/outcome currently returns in the resolution outcome
      dropdown
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/action currently returns in the referral action dropdown
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/recipient currently returns in the referral recipient
      dropdown
- criterion: Submitting the form with no concept checked in Collects is refused before any request is
    sent.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-submit.spec.ts
    name: refuses to submit before any request is sent when no concept is checked in Collects
- criterion: Submitting the form with an empty criterion is refused before any request is sent.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-submit.spec.ts
    name: refuses to submit before any request is sent when the criterion is left empty
- criterion: Submitting the form with no resolution outcome selected, or no referral action or recipient
    selected, is refused before any request is sent.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-submit.spec.ts
    name: refuses to submit before any request is sent when $label is left unselected
- criterion: Submitting a form that passes those checks issues POST /v1/cases/{slug}/hypotheses with a
    body of exactly { hypothesis_name, criterion, collects, resolution, subject } built from the form's
    own current content and the draft's own subject type.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-submit.spec.ts
    name: issues POST /v1/cases/{slug}/hypotheses with a body of exactly { hypothesis_name, criterion,
      collects, resolution, subject } built from the form's own content and the draft's own subject type
- criterion: A 201 response renders the returned hypothesis_name and revision, and offers a control that
    navigates to the Manifest Builder for the current draft version.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-submit.spec.ts
    name: renders the returned hypothesis_name and revision on a 201, and navigates to the Manifest Builder
      for the current draft version when its own control is used
- criterion: A CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError, ConceptNotInGlossaryError,
    ConceptRefusesSubjectTypeError, or any other error response to that POST renders one shared generic
    failure message, never a per-concept highlight.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-errors.spec.ts
    name: renders the one shared generic failure message for a %s response, with no per-concept highlight
- criterion: Visiting an existing draft version's manifest route renders every manifest entry from GET
    /v1/cases/{slug}/versions/{version}'s own manifest, ordered by its declared position, each showing
    its own hypothesis name and referenced revision number.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-load.spec.ts
    name: renders every manifest entry ordered by its own declared position, with its own hypothesis name
      and revision number, regardless of the response's own array order
- criterion: The up control is disabled on the entry holding the lowest position, and the down control
    is disabled on the entry holding the highest position.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-load.spec.ts
    name: disables the up control on the lowest-position entry and the down control on the highest-position
      entry, leaving the middle entry's both enabled
- criterion: Clicking an enabled up or down control issues PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
    naming the target position, and a 204 response re-renders the list in the new order.
  state: partial
  tests:
  - file: src/routes/version-manifest-screen-reorder.spec.ts
    name: issues one PUT naming the neighbor's own current position when an enabled up control is clicked,
      and a 204 re-renders the list in the new order
  why: Only the up control is exercised end-to-end; no test clicks an enabled down control and asserts
    the PUT/204/re-render sequence for it. The set's other two down-control interactions only check its
    disabled attribute, without firing a request.
- criterion: Moving a hypothesis onto a position no other entry currently holds succeeds even though that
    position belonged to a different entry before the move; landing on a free position is never treated
    as a collision.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-reorder.spec.ts
    name: succeeds when the target position currently belongs to a different entry, without any client-side
      pre-check or blocking
- criterion: A 409 ManifestPositionOccupiedError response to that PUT reverts the attempted move and renders
    an inline message on the affected row.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-reorder.spec.ts
    name: reverts the attempted move and renders an inline message on the affected row when the PUT answers
      409 ManifestPositionOccupiedError, leaving the other rows unaffected
- criterion: The Remove control carries the tooltip "A case must keep at least one hypothesis" and is
    disabled exactly when the manifest holds one entry.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-remove.spec.ts
    name: disables Remove and carries the stated tooltip when the manifest holds exactly one entry
  - file: src/routes/version-manifest-screen-remove.spec.ts
    name: enables Remove and carries no tooltip when the manifest holds more than one entry
- criterion: Clicking an enabled Remove control issues DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name},
    and a 204 response removes that entry from the list.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-remove.spec.ts
    name: issues one DELETE against that hypothesis's own manifest entry once the confirmation dialog
      is confirmed, and a 204 removes it from the list
- criterion: A 422 ManifestWouldHoldNoHypothesisError response to that DELETE reloads the manifest from
    GET /v1/cases/{slug}/versions/{version} rather than trusting the client's own removed-entry state.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-remove.spec.ts
    name: reloads the manifest from the real GET rather than trusting the client's own removed-entry state
      when the DELETE answers 422 ManifestWouldHoldNoHypothesisError
- criterion: A 409 CaseVersionNotDraftError response to either the PUT or the DELETE renders the conflict
    banner and disables every reorder and remove control on the screen.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-conflict.spec.ts
    name: renders the conflict banner and disables every reorder and remove control when a reorder's own
      PUT answers 409 CaseVersionNotDraftError
  - file: src/routes/version-manifest-screen-conflict.spec.ts
    name: renders the conflict banner and disables every reorder and remove control when a removal's own
      DELETE answers 409 CaseVersionNotDraftError
- criterion: '"+ Add hypothesis" navigates to the New Hypothesis route for the current case and draft
    version.'
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-load.spec.ts
    name: renders + Add hypothesis as a router Link to the New Hypothesis route for the current case and
      draft version
  - file: src/routes/version-manifest-screen-load.spec.ts
    name: actually navigates to the New Hypothesis route's own path when clicked
- criterion: Case Detail renders a "Hypotheses" tab beside "Versions", using the existing tabs component,
    never as a top-level sidebar entry.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
    name: renders a Hypotheses tab beside the existing Versions tab, with Versions selected by default
  - file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
    name: renders the Hypotheses tab's own content in place of the Versions tab's when Hypotheses is selected
  - file: src/routes/case-detail-screen-hypotheses-tab.spec.ts
    name: re-mounts the Versions tab's own content when switching back to it from Hypotheses
  why: Nothing in the set inspects the sidebar/navigation to confirm Hypotheses is absent there; only
    the tab-strip half of the criterion is exercised.
- criterion: The Hypotheses tab lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the
    case, by name.
  state: covered
  tests:
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the case, by name
- criterion: Each listed hypothesis's Revisions count is the total GET /v1/cases/{slug}/hypotheses/{name}/revisions
    reports for that hypothesis, not the length of a single returned page.
  state: covered
  tests:
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: shows each hypothesis's Revisions count as the endpoint's own total, never the length of the
      page it returned
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: shows an em dash for a hypothesis's own Revisions count when that hypothesis's own revisions
      fail to load, without blocking the rest of the row
- criterion: Selecting a hypothesis row navigates to, or expands into, that hypothesis's own revision-history
    view.
  state: covered
  tests:
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: renders that hypothesis's own revision-history view when its row is selected
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: returns to the hypotheses list when Back to hypotheses is clicked from the revision-history
      view
- criterion: The revision-history view lists every revision GET /v1/cases/{slug}/hypotheses/{name}/revisions
    returns for that hypothesis, each rendered as a closed, non-editable block showing its own revision
    number, criterion and collects.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history.spec.ts
    name: lists every revision the endpoint returns, each showing its own revision number, criterion and
      collects, as a closed, non-editable block
- criterion: The revision holding the highest revision number is labeled "current"; every other revision
    is labeled "frozen".
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history.spec.ts
    name: labels the revision holding the highest revision number current and every other one frozen
- criterion: '"Revise ->" is rendered only on the revision labeled "current", and clicking it navigates
    to the Revise route pre-loaded with that hypothesis''s name and that revision''s own criterion, collects
    and resolution.'
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-history.spec.ts
    name: renders "Revise →" only on the revision labeled current
  - file: src/routes/hypothesis-revision-history.spec.ts
    name: addresses the Revise link with this hypothesis's own name and the case's own highest version
      number, regardless of the order the versions were returned in or which one is a draft
  - file: src/routes/hypothesis-revision-screen.spec.ts
    name: pre-populates criterion, collects, resolution outcome and referral action/recipient from the
      hypothesis's own current (highest-numbered) revision, with the hypothesis name fixed and non-editable
  why: The "rendered only on current" half and the link's own href are directly asserted, and pre-population
    once the Revise route is reached is proven separately by ReviseHypothesisScreen's own load test. But
    no test fires a click on "Revise →" and confirms the router actually navigated -- only the href is
    inspected, unlike the sibling "+ Add hypothesis" Link, which is proven both ways.
findings:
- pass: conformance
  file: src/routes/version-manifest-screen.tsx
  where: line 40, the REMOVE_DISABLED_TOOLTIP constant, rendered as the Remove control's tooltip
  evidence: const REMOVE_DISABLED_TOOLTIP = "A case must keep at least one hypothesis";
  cost: A curator reading this tooltip learns a rule about the case identity itself, but domain/knowledge/case
    carries no hypothesis-count fact at all -- its own attributes are slug and next_version, and the invariant
    this control actually enforces belongs to the case version's manifest (rules/knowledge/a-case-has-at-least-one-hypothesis
    constrains domain/knowledge/case-version and domain/knowledge/manifest-entry, never domain/knowledge/case).
    A reader trying to find where this rule is decided will not find it in the node the wording points
    at.
  correction: State the tooltip in the manifest-entry terms the rule actually governs -- a case version's
    manifest, not the case -- so the UI text tracks the node it is honoring.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: VersionsPanel, the `isError || !data` branch
  cites: EDG-02
  evidence: "if (isError || !data) {\n  return <p>Unable to load this case's version timeline.</p>;\n}"
  cost: A curator whose version timeline fails to load has no way to retry from this tab -- the screen
    degrades to a static sentence with no control, while the sibling Hypotheses tab in the very same file
    hits the identical failure shape and renders a Retry button, so the same task treats the same rule
    two different ways in one screen.
  correction: Render a retry control alongside the failure message, matching the pattern this file's own
    Hypotheses tab and every other screen's own load-error branch already establish.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: VersionsPanel's return, after the isLoading/isError checks
  cites: API-04
  evidence: 'const rows = data.data.map((version) => toRow(slug, version));

    const hasDraft = data.data.some((version) => version.state === "draft");'
  cost: A version list that comes back empty renders a header-only table and a "New draft" link with nothing
    saying there is nothing to show, while the Hypotheses tab this same screen composes handles the identical
    response shape with an explicit empty-state sentence.
  correction: Check `data.data.length === 0` before rendering the table and render an explicit empty-state
    sentence, the way CaseHypothesesTab already does for the same list shape.
- pass: standard
  file: src/routes/version-manifest-screen.tsx
  where: RowActions, the moveErrorMessage paragraph
  cites: ACC-07
  evidence: "{row.moveErrorMessage !== null && (\n  <p className=\"text-sm text-destructive\">{row.moveErrorMessage}</p>\n\
    )}"
  cost: This message appears and disappears in place with no navigation, but carries no role or aria-live
    attribute, so a screen-reader user not focused on that row when a reorder is rejected gets no announcement,
    unlike the identical-purpose validation paragraphs this same task's own form renders with role="alert".
  correction: Give the paragraph role="alert" (or wrap the row's error region in an aria-live container),
    matching the convention this codebase already uses for its own validation messages.
---

## What it is
Reviews the 3 tasks Onda 4 delivered against the manifest-hypothesis-authoring epic: revise-hypothesis-form (shared New/Revise hypothesis form), manifest-builder (reorder/remove over the real manifest endpoints), and hypotheses-tab (a second Case Detail tab, hypothesis list plus revision history).
Coverage: 24 of 28 criteria fully covered, 4 partial -- an unexercised down-control reorder path, an unasserted sidebar-absence clause, an unexercised Revise-link click-through, and the disclosed literal-URL routing ambiguity for a hypothesis named "new" (already recorded as `contested` in revise-hypothesis-form's own proof).
Conformance: 1 finding -- the Remove-disabled tooltip states a manifest-composition rule in case-identity terms rather than manifest terms.
Standard: 3 findings -- two inconsistencies within case-detail-screen.tsx itself (no retry on the Versions tab's own load-error, no empty-state message on an empty version list) where the same file's own Hypotheses tab already handles the identical shape correctly, and one accessibility gap (no role="alert" on the manifest row's inline move-error message).
Failures: did not run -- the captured run (run/manifest-hypothesis-authoring-onda-4-full-suite) passed all 8 steps, 189/189 tests.

## Notes
The trace (`trace.py --check frontend/app`) reports 7 code-drift findings over 121 bindings, 0 orphaned, 0 moved. All 6 findings this onda's own tasks caused (case-detail-screen.tsx's 6 rebound nodes, from hypotheses-tab wrapping it in Tabs) were already reconciled and rebound (siegard-reconcile/manifest-hypothesis-authoring-onda-4-drift.md) before this review ran. 1 remaining finding -- constraints/no-route-enforces-authentication on app-shell.tsx -- is pre-existing (first found in Onda 3's own reconciliation) and unrelated to this onda's own change; the same reconciliation record re-judged it and again did not clear it. The remaining 6 findings (src/src/... paths, "no longer exists") predate this delivery and are outside its file set (a different target's own history).
No suppression receipt: siegard.json declares no `edits_freely` targets, so every drift class is listed rather than counted.
The registry's own standard.json pass-name split held all 33 tool-decided rules to the captured run's own 5 tool steps (typecheck, lint, style, a11y, secret-scan); all 5 passed, so those 33 rules are answered rather than merely unflagged.
The standard pass also disclosed two constructs it could not confirm or refute from this file set alone -- app-shell.tsx's hand-rolled Sidebar (ARC-01/04, justified in its own comment as no TUI sidebar/nav primitive existing) and the TUI Dialog's own Escape-dismiss/focus-return behavior in version-manifest-screen.tsx (ACC-11) -- both outside this file set (TUI's own vendored source).
A real product-level limitation was found and disclosed by manifest-builder's own implementation record, not a defect of this delivery: the backend refuses a single-PUT swap between two already-occupied manifest positions, so a normal tightly-packed manifest's up/down click will commonly hit a 409 on the first attempt -- already anticipated by the wireframe's own precondition text and covered by that task's own criteria 4/5.
Two real bugs were found and fixed during this onda's delivery, both disclosed as divergences in manifest-builder's own implementation record: apiFetch threw on any 204 response (both manifest endpoints answer 204), and TUI's Tooltip/Dialog crashed with a dual-React-copy "invalid hook call" since their own third-party dependencies resolved "react" from TUI's own separately-installed node_modules -- fixed via vite.config.ts aliases/deps.inline plus an environment-level symlink.
All four passes ran as subagents in clean contexts, per the skill's own delegation discipline; none ran inline.
