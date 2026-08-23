---
title: Onda 7 -- case attribute management surface
summary: What four passes found over the three onda-7 deliveries (view-released-version-read-only, seed-new-draft-from-latest-released,
  case-attributes-at-a-glance), merged into one integrated change over the version-editor and case-detail
  screens.
reviewed:
- src/routes/case-detail-screen.tsx
- src/services/case-version-record.ts
- src/hooks/use-edit-draft-version-form.ts
- src/routes/case-version-editor-form-fields.tsx
- src/routes/case-version-editor-ready-view.tsx
- src/routes/case-detail-screen-view-released-action.spec.ts
- src/routes/case-version-editor-screen-view-released.spec.ts
- src/hooks/use-new-draft-version-form.ts
- src/routes/new-case-draft-screen.tsx
- src/routes/new-case-draft-screen-seed.spec.ts
- src/routes/new-case-draft-screen-seed-post.spec.ts
- src/routes/new-case-draft-screen.test-support.ts
- src/routes/new-case-draft-screen-conflict.spec.ts
- src/hooks/use-case-attributes-at-a-glance.ts
- src/routes/case-attributes-tab.tsx
- src/routes/route-tree.tsx
- src/services/error-ui-state.ts
- src/hooks/use-case-attributes-at-a-glance.spec.ts
- src/routes/case-attributes-tab.spec.ts
- src/routes/case-attributes-tab.test-support.ts
- src/routes/case-detail-screen-attributes-tab.spec.ts
- src/routes/route-tree.spec.ts
- src/services/error-ui-state.spec.ts
tasks:
- task/version-editor/view-released-version-read-only
- task/version-editor/seed-new-draft-from-latest-released
- task/cases-list-and-detail/case-attributes-at-a-glance
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (delivery/frontend-bootstrap/run/onda-7) passed all 8 steps clean -- 349/349
    tests -- so there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: A released version's row in the Versions tab renders a "View" action, where today it renders
    none.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-view-released-action.spec.ts
    name: renders a View action on a released version's row, where today it renders none
- criterion: A draft version's row continues to render only "Continue editing", never a "View" action.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-view-released-action.spec.ts
    name: renders only Continue editing on a draft version's row, never a View action
- criterion: Clicking "View" navigates to that version's own route, performing no additional request beyond
    the load the route itself triggers.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-view-released-action.spec.ts
    name: navigates to the released version's own route, issuing no request beyond the versions-list load
      already made
- criterion: Loading a version whose state is released renders its title, when_to_use, subject, fallback
    outcome/referral and consolidation_register fields, each disabled, from GET /v1/cases/{slug}/versions/{version}.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-view-released.spec.ts
    name: renders title, when_to_use, subject, fallback outcome/referral and consolidation_register from
      the GET response, each disabled
- criterion: The read-only render shows no Save, "Release…" or "Discard draft" control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-view-released.spec.ts
    name: shows no Save, Release… or Discard draft control when the loaded record's own state is already
      released
- criterion: The read-only render lists every manifest entry the response returns, in the order the response
    returns them, each showing its declared position, its hypothesis's name, its hypothesis-revision's
    own revision number and criterion.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-view-released.spec.ts
    name: lists every manifest entry in the response's own order, each with its declared position, hypothesis
      name, revision and criterion
- criterion: Opening "New draft" on a case whose versions include at least one released version pre-populates
    the form's title, when_to_use, subject, fallback outcome/referral and consolidation_register fields
    from that case's latest released version, read via GET /v1/cases/{slug}/versions/{version}.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-seed.spec.ts
    name: pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation register
      from the case's own latest released version, read via GET /v1/cases/{slug}/versions/{version}
  - file: src/routes/new-case-draft-screen-seed.spec.ts
    name: treats the case's own latest released version as the highest-numbered released entry, not the
      last entry the version list names nor a higher-numbered draft
- criterion: Opening "New draft" on a case with no released version yet leaves the form exactly as new-draft-creation
    already renders it -- blank, subject pre-set to the one glossary value -- with copy stating this is
    the case's first version.
  state: partial
  tests:
  - file: src/routes/new-case-draft-screen-seed.spec.ts
    name: leaves the form blank with the subject pre-set from the glossary and shows first-version copy
      when the case's version history holds no released version
  why: only the Title field's blank value is asserted, alongside the subject field's pre-set/disabled
    state and the first-version copy. The criterion's own word "blank" also covers when_to_use and the
    fallback outcome/action/recipient selections, and nothing in this test set asserts that those remain
    blank/unset in the no-released-version path, so a regression seeding them anyway would go undetected.
- criterion: Clicking Save on a form pre-populated from a released version issues POST /v1/cases with
    a body that additionally includes consolidation_register and source_version set to that released version's
    own version number.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-seed-post.spec.ts
    name: issues POST /v1/cases with consolidation_register and source_version set to the released version's
      own number when Save is clicked on a form seeded from it
- criterion: Clicking Save on a first-ever draft's blank form issues POST /v1/cases with a body that includes
    neither consolidation_register nor source_version, exactly as new-draft-creation's own POST does today.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-seed-post.spec.ts
    name: issues POST /v1/cases with a body carrying neither consolidation_register nor source_version
      when Save is clicked on a first-ever draft's blank form
- criterion: Case Detail renders a third view, alongside Versions and Hypotheses, surfacing the case's
    current version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab.spec.ts
    name: renders an Attributes tab beside the existing Versions and Hypotheses tabs, unselected by default
  - file: src/routes/case-detail-screen-attributes-tab.spec.ts
    name: renders CaseAttributesTab's own content, not the Versions tab's, once Attributes is selected
  - file: src/routes/case-detail-screen-attributes-tab.spec.ts
    name: re-mounts the Versions tab's own content when switching back to it from Attributes
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders the current version's own title, when_to_use, subject, fallback outcome/referral and
      consolidation_register
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders "Not set" for consolidation_register when the current version leaves it absent
- criterion: The current version resolved for that view is the case's own draft version when it holds
    one, otherwise its latest released version.
  state: covered
  tests:
  - file: src/hooks/use-case-attributes-at-a-glance.spec.ts
    name: resolves to the case's own draft version even when a released version numbered higher than it
      also exists, never to the plain highest-numbered item
  - file: src/hooks/use-case-attributes-at-a-glance.spec.ts
    name: resolves to the case's latest released version -- its highest-numbered item -- when the case
      holds no draft
- criterion: Where the current version is a draft, the view's action reads "Continue editing" and navigates
    to that draft's own route.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders only "Continue editing", navigating to that draft version's own route, when the current
      version is a draft
- criterion: Where the current version is released, the view renders "View released vX" (X its own version
    number) navigating to that version's own read-only route, and "New draft from vX" navigating into
    the New Draft flow, addressed by that same version's own number.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders both "View released vX" navigating to that version's own route, and "New draft from
      vX" navigating into the New Draft flow addressed by that same version's own number, when the current
      version is released
  - file: src/routes/route-tree.spec.ts
    name: coerces a numeric-string sourceVersion query value into a number, so 'New draft from vX' can
      address the flow by that version's own number
  - file: src/routes/route-tree.spec.ts
    name: parses an absent sourceVersion as {}, so the pre-existing blank 'New draft' entry point keeps
      resolving unaffected
- criterion: Where the current version's own read via read-case itself refuses -- e.g. a draft whose manifest
    currently holds no hypothesis -- the view renders that refusal as its own explicit named state, distinguishable
    from a generic load error, offering the same "Continue editing" link the draft's own state would otherwise
    show.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders an explicit, distinguishable state offering Continue editing to that same version when
      read-case refuses the current version's own coherence check
  - file: src/routes/case-attributes-tab.spec.ts
    name: renders the generic load-error state, not the case-not-valid state, when the current version's
      own read fails for an unrelated reason
  - file: src/hooks/use-case-attributes-at-a-glance.spec.ts
    name: resolves to the "case-not-valid" phase, carrying the version number, when read-case refuses
      the coherence check
  - file: src/hooks/use-case-attributes-at-a-glance.spec.ts
    name: resolves to the generic "load-error" phase, distinct from "case-not-valid", when the current
      version's own read fails for any other reason
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError to its own distinct case-not-valid state, no longer the shared generic-error
      fallback
findings:
- pass: conformance
  file: src/hooks/use-new-draft-version-form.ts
  where: the file's own header comment (lines 9-16), the seeding effect reading sourceVersionQuery.data
    into resetFormFrom (lines 226-230), and createMutation's body (lines 256-280)
  evidence: 'task/version-editor/seed-new-draft-from-latest-released widens both of those: the blank form
    is pre-populated from the case''s own latest released version''s own attributes when one exists (rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version''s
    own "naming no source version copies the case''s own latest released version instead" clause), and
    the create POST additionally carries consolidation_register and source_version once seeded that way'
  cost: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version states only that a new
    draft version's manifest is copied entry for entry from an existing version, naming no source version
    copying the latest released one instead -- its statement, description and decision reasoning never
    mention title, when_to_use, subject, fallback or consolidation_register. This hook nonetheless treats
    that same clause as licensing seeding those five declared attributes too, and whatever the curator
    leaves untouched is exactly what POST /v1/cases persists as the new draft's own content. A reader
    who wants to know why a brand-new case version can be created already holding a previous version's
    title or fallback will open that rule, find only the manifest addressed, and never find this decision
    stated anywhere but in this hook and the task that drove it.
  correction: the fact that a new draft's declared attributes, not only its manifest, default to the source
    version's own values needs its own place in the specification -- either widening rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version's
    own statement or a sibling rule naming the case-version attributes it covers -- decided during planning
    and disclosed in the decision log, rather than inferred inside this hook and cited against a rule
    that does not say it.
- pass: standard
  file: src/hooks/use-edit-draft-version-form.ts
  where: lines 99-155, the `ready` branch of `EditDraftVersionFormState`
  cites: TYP-04
  evidence: 'readonly onSubmit: (event?: BaseSyntheticEvent) => void;

    readonly onFieldBlur: () => void;

    /** Absent only for use-new-draft-version-form.ts''s own blank-form "ready" object -- see this file''s
    own header comment. */

    readonly release?: ReleaseControlState;

    /** Absent for the same reason as `release` above (task/version-editor/discard-draft-version). */

    readonly discard?: DiscardControlState;'
  cost: 'The `ready` phase is one shape carrying five independently optional fields (`release`, `discard`,
    `isFirstVersion`, `isReadOnly`, `manifest`), each present or absent depending on which of three call
    sites produced the state (a blank origination form, an in-progress draft, or a released version''s
    read-only render). Nothing in the type stops a caller from constructing a combination none of those
    call sites ever produces -- `isReadOnly: true` alongside a `release` whose `canRelease` reads `true`,
    say -- so only the surrounding prose comments, not the compiler, say which combinations are real.'
  correction: Give each of the known call-site shapes its own tagged variant of the union (e.g. distinct
    phases for the blank-form, in-progress-draft and read-only-released cases) so a caller reading one
    field is guided by which variant it received rather than by which optional fields happen to be present.
- pass: standard
  file: src/services/case-version-record.ts
  where: lines 58-60, the trailing fields of `CaseVersionRecord`
  cites: TYP-04
  evidence: 'readonly state?: "draft" | "released";

    /** Optional for the same reason as `state` above. */

    readonly manifest?: readonly CaseVersionManifestEntry[];'
  cost: CaseVersionRecord models two distinct, known shapes -- a record read back from GET/POST-release
    (carrying `state` and `manifest`) and a record seeded locally from a just-submitted form (carrying
    neither, per this file's own header comment) -- as one type with two independently optional trailing
    fields rather than two shapes. A caller can construct a value carrying `manifest` but not `state`,
    or the reverse, and the compiler accepts it; only the header comment says that combination never actually
    occurs.
  correction: Model the two known origins as separate types (a narrower seeded-record type and the full
    read-back record) or as a discriminated union tagged by where the value came from, so a reader of
    `state` or `manifest` is answered by the type rather than by a comment.
---


## What it is
Four passes over the three onda-7 deliveries merged into one integrated change: coverage (do the tests prove the criteria), conformance (does the source state only what the specification holds), standard (does it follow the project's own registry), and failures (why anything failed) -- the last of which found nothing to diagnose, since the captured run passed clean.
Reads the reconciliation already recorded at siegard-reconcile/onda-7-drift.md as background rather than repeating it: that record's own two findings (the subject field hard-disabled even in draft, pre-existing; source_version always sent explicitly on seeded creation, introduced by this onda) are not restated here as this review's own findings, since neither pass below independently rediscovered them as its own citation -- the conformance pass's own finding below is a related but distinct observation, about the attribute-seeding fact itself rather than the source_version signal.

## Notes
The failures pass did not run: delivery/frontend-bootstrap/run/onda-7 passed all 8 steps (install, typecheck, lint, style, build, a11y, secret-scan, test -- 349/349 tests, 48 files) with nothing to diagnose.
The standard pass applied 24 of standards/frontend-typescript.yaml's 62 rules -- the ones its own registry marks as decided by reading over this file set (ARC-01, ARC-03, ARC-04, STA-01, STA-03, API-01 through API-04, EDG-01 through EDG-04, ACC-04, ACC-06, ACC-07, ACC-08, ACC-11, ENV-02, SEC-05, TYP-04, PRF-02, PRF-04, TST-02, TST-03) -- the other 38 are decided by a tool and already ran clean as steps of the captured run above.
trace.py --check over frontend/app reports 10 drift findings over 6 files, 123 bindings total: 0 orphaned, 0 moved, 10 code. Of those, 2 (both on domain/knowledge/case-version, over use-edit-draft-version-form.ts and case-detail-screen.tsx) are the reconciliation's own unresolved finding from siegard-reconcile/onda-7-drift.md, correctly left unbound. The remaining 8, over cases-list-screen.tsx, app-shell.tsx and two backend author-case-version files, predate this onda and are outside this review's own file set.
No suppression receipt applies: the project declares no target under `edits_freely`, so trace.py --check lists every `code` finding rather than counting one under a target.
The conformance pass looked past the STATE_CELL color/label mapping in case-detail-screen.tsx and the RELEASE_DIALOG_DESCRIPTION/DISCARD_DIALOG_DESCRIPTION copy in case-version-editor-ready-view.tsx, both restating an already-decided fact as presentation text disclosed in-file as the task's own inference rather than a node's wording -- a styling/copy judgment, not a second authority for the underlying rule.
The standard pass looked past route-tree.tsx's declared-but-never-read-back `sourceVersion` search field (disclosed in-file as deliberate, navigation-only) and the generic non-domain fallback toast strings duplicated across three mutations, neither of which any rule in this standard's scope reaches.
This review does not decide which of its three findings blocks anything, does not open corrective work, and does not choose between the two open routes the reconciliation record already named for its own two findings.
