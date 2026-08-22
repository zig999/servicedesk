---
title: Review of version-editor onda 3 (2 delivered tasks)
summary: 'Four-pass review of the 2 delivered version-editor tasks: coverage over their 14 criteria, specification
  conformance, standard conformance, and the failures pass (which did not run -- the captured run passed
  cleanly).'
tasks:
- task/version-editor/edit-draft-version
- task/version-editor/new-draft-creation
reviewed:
- src/services/case-version-form-schema.ts
- src/hooks/use-glossary-vocabulary.ts
- src/hooks/use-edit-draft-version-form.ts
- src/hooks/use-new-draft-version-form.ts
- src/routes/case-version-editor-form-fields.tsx
- src/routes/case-version-editor-ready-view.tsx
- src/routes/case-version-editor-screen.tsx
- src/routes/case-version-editor-screen.spec.ts
- src/routes/case-version-editor-screen.test-support.ts
- src/routes/case-version-editor-screen-save.spec.ts
- src/routes/new-case-draft-screen.tsx
- src/routes/new-case-draft-screen.spec.ts
- src/routes/new-case-draft-screen.test-support.ts
- src/routes/new-case-draft-screen-save.spec.ts
- src/routes/new-case-draft-screen-conflict.spec.ts
- src/routes/route-tree.tsx
- src/routes/route-placeholders.tsx
- src/routes/case-detail-screen.tsx
- src/routes/case-detail-screen.spec.ts
- src/routes/route-tree.spec.ts
- src/shared/components/app-shell.tsx
- package.json
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/version-editor-onda-3-full-suite) passed all 8 steps with 125/125 tests
    passing; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Visiting an existing draft version's own route pre-populates the form's title, when_to_use,
    subject (shown fixed/disabled), consolidation_register and fallback outcome/referral fields from GET
    /v1/cases/{slug}/versions/{version}.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen.spec.ts
    name: pre-populates title, when_to_use, the fixed/disabled subject, consolidation register and fallback
      outcome/referral from the loaded version
- criterion: The fallback outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently
    returns.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/outcome currently returns in the fallback outcome
      dropdown
  - file: src/routes/case-version-editor-screen.spec.ts
    name: renders no options in the fallback outcome dropdown when the glossary currently holds no outcome
      terms
- criterion: The fallback referral dropdown's action and recipient options each offer exactly the terms
    GET /v1/glossary/action and GET /v1/glossary/recipient currently return.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/action currently returns in the fallback referral
      action dropdown
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/recipient currently returns in the fallback referral
      recipient dropdown
- criterion: Triggering Save, on blur or via the Save button, sends the form's entire current content
    as one PATCH /v1/cases/{slug}/versions/{version} request body, never a partial field.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends the entire form content as one PATCH request when Save is clicked, never only the changed
      field
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends the entire form content as one PATCH request when a field is blurred while dirty, never
      only the changed field
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends exactly one PATCH request when blur and the Save button both fire from one edit
- criterion: A 200 response to that PATCH re-hydrates the form from the response body and marks the save
    with a "saved at HH:mm" indicator.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: re-hydrates the form from the PATCH response and shows a 'Last saved HH:mm' indicator on a 200
      response
  why: the test checks rehydration and a timestamp indicator matching /^Last saved \d{2}:\d{2}$/; the
    criterion's own quoted phrase is "saved at HH:mm", worded differently from the implementation's "Last
    saved" text. Recorded rather than settled -- whether the criterion names the exact string or only
    the HH:mm format is ambiguous from the task's own wording.
- criterion: A 409 CaseVersionNotDraftError response to that PATCH blocks further editing of the form
    and renders the conflict banner with the stated wording, offering to start a new draft.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: blocks further editing and shows the conflict banner on a 409 CaseVersionNotDraftError response
      to Save
- criterion: A 404 CaseNotFoundError response, whether loading the version or saving it, navigates to
    the Cases List route.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: navigates to the Cases List route when loading the version answers 404 CaseNotFoundError
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: navigates to the Cases List route when saving answers 404 CaseNotFoundError
- criterion: The form's own state moves clean to dirty on any field change, dirty to saving while the
    PATCH request is in flight, and saving to clean on a 200 response or saving to conflict on a 409 CaseVersionNotDraftError
    response.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: moves clean to dirty on edit, dirty to saving while the PATCH is in flight, and saving back
      to clean on a 200 response
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: blocks further editing and shows the conflict banner on a 409 CaseVersionNotDraftError response
      to Save
  why: the criterion states the clean-to-dirty transition holds on any field change, but only Title is
    exercised as that transition's trigger; when_to_use, consolidation_register and the fallback outcome/referral
    fields are never exercised as the trigger, so whether every field change dirties the form is unexercised.
- criterion: '"New draft" is rendered in Case Detail only when none of that case''s existing versions
    is currently in draft state.'
  state: covered
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders New draft as a link to the case's own new-draft route when none of the case's versions
      is a draft
  - file: src/routes/case-detail-screen.spec.ts
    name: does not render New draft when one of the case's versions is already a draft
  - file: src/routes/case-detail-screen.spec.ts
    name: renders New draft when the case currently holds no versions at all
- criterion: Clicking "New draft" opens the Version Editor with no version's content pre-loaded, and the
    subject field pre-set to the one subject-type value GET /v1/glossary/subject-type currently returns.
  state: partial
  tests:
  - file: src/routes/case-detail-screen.spec.ts
    name: renders New draft as a link to the case's own new-draft route when none of the case's versions
      is a draft
  - file: src/routes/new-case-draft-screen.spec.ts
    name: renders a blank form with no version's content pre-loaded, other than the subject field pre-set
      from the glossary
  - file: src/routes/new-case-draft-screen.spec.ts
    name: pre-sets the subject field to the one subject-type value GET /v1/glossary/subject-type currently
      returns
  why: nothing in this set actually clicks the New draft link and observes the Version Editor mount as
    a result. What is tested is only that the link's own href equals "/cases/some-slug/versions/new" (case-detail-screen.spec.ts,
    where the target route renders a stub component, not NewCaseDraftScreen), and separately that NewCaseDraftScreen,
    mounted directly at that path by its own test router, shows a blank form with the subject pre-set.
    Whether that href, followed in the running app, actually reaches NewCaseDraftScreen (route-tree.tsx's
    own wiring) is unexercised by this set.
- criterion: Clicking Save on that blank form issues POST /v1/cases with { slug, title, when_to_use, authored_at,
    subject, fallback } built from the curator's entered content, the case's own slug from the route,
    and a client-side authored_at timestamp captured at the moment of that save.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues POST /v1/cases with slug, the curator's entered content and a client-side authored_at
      timestamp when Save is clicked
- criterion: A 201 response to that POST switches the form into the same edit-mode flow edit-draft-version
    delivers for an existing draft, addressed by the version number the response returns.
  state: partial
  tests:
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues a PATCH to the created version's own URL, not another POST, when Save is clicked again
      after switching into edit mode
  why: the test proves that a save issued after the 201 is addressed to the returned version number via
    PATCH rather than another POST, but nothing in this set exercises whether the switched-in form actually
    behaves like edit-draft-version's own flow beyond that one fact -- blur-triggered auto-save, the 409
    conflict banner, and the "saved at" indicator are never triggered once the form has switched into
    edit mode, so the claim that it is "the same edit-mode flow" is unproven beyond PATCH-addressing.
- criterion: That switch to edit mode seeds the form from the content just submitted and the returned
    version number, without issuing a follow-up GET /v1/cases/{slug}/versions/{version}.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: seeds the switched-in form from the content just submitted and the returned version, issuing
      no follow-up GET, and leaves Save disabled (nothing new to save yet)
  - file: src/routes/new-case-draft-screen-save.spec.ts
    name: issues a PATCH to the created version's own URL, not another POST, when Save is clicked again
      after switching into edit mode
- criterion: A 409 CaseAlreadyHasDraftError response to that POST shows a toast stating a draft already
    exists for the case and navigates to that case's existing draft version, resolved by reading GET /v1/cases/{slug}/versions.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: shows a toast that a draft already exists for the case, and navigates to that case's existing
      draft version
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: stays on the New Draft screen without navigating when the version list read for the redirect
      names no draft
  - file: src/routes/new-case-draft-screen-conflict.spec.ts
    name: stays on the New Draft screen without throwing when reading the version list for the redirect
      itself fails
findings:
- pass: conformance
  file: src/routes/case-version-editor-form-fields.tsx
  where: lines 131-133, the Subject type field
  evidence: "<FormField label=\"Subject type (fixed)\" errorId=\"subject-error\">\n  <Input {...register(\"\
    subject\")} disabled />\n</FormField>"
  cost: A curator can never correct a draft's subject type through this screen, even though domain/knowledge/case-version
    states its own declared attributes may likewise be corrected, as many times as curation needs while
    draft, and the specification's own decision log records that update-draft was added expressly to let
    a curator correct a draft's own declared attributes (title, when_to_use, subject, fallback, consolidation_register)
    after create-draft -- subject named among them. The component's own header comment attributes the
    fixed/disabled choice to the wireframe's own field set (proposal §2.3) rather than to any specification
    node, so the one place that grants this correction is overridden by a reference, permanently, with
    nothing in the specification saying subject is the exception.
  correction: Render the subject field editable like the other glossary-backed dropdowns while the draft
    is open, or, if subject is genuinely meant to stay fixed once set, record that exception in the specification
    (case-version's own node or a rule) rather than only in this component's `disabled` attribute.
- pass: conformance
  file: src/routes/case-version-editor-ready-view.tsx
  where: lines 21-23, the conflict banner text constants
  evidence: "const CONFLICT_BANNER_TITLE = \"This version was released by someone else\";\nconst CONFLICT_BANNER_MESSAGE\
    \ =\n  \"Your changes were not saved. Reload to see the current state, or start a new draft.\";"
  cost: The exact words a curator reads at the conflict outcome -- that the version was released by someone
    else and that starting a new draft is the way forward -- live only in this component. This file's
    own comment discloses the source as docs/frontend-triage-console-proposal.md §2.3's own ASCII banner
    verbatim, not from a specification node. A reader who wants to know what a curator is told when a-case-version-is-written-once's
    own rule is hit has to open this file rather than the specification, and the wording can drift from
    what the business decided without the specification ever recording that change.
  correction: The fact conveyed at this outcome -- that the version is already released and the curator's
    path forward is a new draft -- would need a home in a specification node (e.g. a scenario over the
    knowledge context), with this banner reading its wording from there rather than from the intake reference.
- pass: conformance
  file: src/services/case-version-form-schema.ts
  where: lines 23-32, the CONSOLIDATION_REGISTERS constant and its comment
  evidence: 'The two-value closed vocabulary domain/knowledge/consolidation-register

    itself declares -- formal or plain, nothing else ...

    export const CONSOLIDATION_REGISTERS = ["formal", "plain"] as const;'
  cost: domain/knowledge/consolidation-register's own two-value vocabulary now has a second, hand-typed
    home in this frontend, admitted by the comment itself (declared here as this app's own copy of that
    domain fact). If the specification ever added a third register or renamed one of the two, this constant
    -- and the Select options it feeds -- would not follow; correcting the node would not correct this
    file, and the day the two disagree nobody would know which one was decided.
  correction: Read the register vocabulary at runtime the way the other glossary-backed fields already
    do, or otherwise derive this constant from the specification rather than typing it by hand a second
    time.
- pass: standard
  file: src/routes/case-version-editor-form-fields.tsx
  where: the save-status footer, just before the Save button
  cites: ACC-07
  evidence: "<span className=\"text-sm text-muted-foreground\">\n  {savedAt != null ? `Last saved ${savedAt}`\
    \ : null}\n</span>"
  cost: The save state machine moves saving -> clean and this text appears or changes with no page navigation
    and no aria-live region or focus management around it, so a screen-reader user who just clicked Save
    or blurred a field gets no confirmation the save happened -- they have to go looking for it.
  correction: Wrap the indicator in a live region (e.g. aria-live="polite") or otherwise announce the
    transition explicitly when a save completes.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: the component's return statement, rendering StatusTable directly over `rows`
  cites: API-04
  evidence: <StatusTable columns={CASE_VERSIONS_COLUMNS} rows={rows} />
  cost: When the version list comes back empty (a case with no versions -- exercised directly by this
    file's own spec, "renders no data rows when the endpoint returns no versions"), the screen renders
    only the table's header row with no explanatory text, so a curator cannot tell this case has no versions
    from a table that rendered wrong. (Also flagged in this same file by review/cases-list-and-detail-onda-2.md;
    still present.)
  correction: Render an explicit empty-state message when `rows.length === 0`, the same way the loading
    and error phases already get their own explicit branch.
---

## What it is
Reviews the 2 tasks Onda 3 delivered against the version-editor epic: edit-draft-version (full-replace PATCH form, save state machine, 409/404 handling) and new-draft-creation (blank-form origination via POST, switching into edit mode, 409 race handling).
Coverage: 11 of 14 criteria fully covered, 3 partial -- one wording ambiguity ("saved at HH:mm" vs the implementation's "Last saved" text), one integration gap (the New-draft link's href is checked but never actually clicked through route-tree.tsx's own wiring), and one scope gap (the switched-in edit-mode form is proven to PATCH the right URL but not proven to reproduce edit-draft-version's full behavior -- blur-save, conflict banner, saved-at indicator -- once switched in).
Conformance: 3 findings, all about a domain fact or a domain-granted capability living only in source -- the subject field's permanent disable, the conflict banner's exact wording, and a hand-typed duplicate of the consolidation-register vocabulary.
Standard: 2 findings -- a save confirmation with no screen-reader announcement (ACC-07), and an empty case-version list rendering no explanatory message (API-04, already flagged against this same file in the Onda 2 review and still present).
Failures: did not run -- the captured run (run/version-editor-onda-3-full-suite) passed all 8 steps, 125/125 tests.

## Notes
The trace (`trace.py --check frontend/app`) reports 9 code-drift findings over 121 bindings, 0 orphaned, 0 moved. 3 of the 9 are caused by this delivery: domain/knowledge/case-version and rules/knowledge/every-case-version-remains-readable on src/routes/case-detail-screen.tsx (bound by task/cases-list-and-detail/case-detail-timeline in Onda 2, now stale because new-draft-creation added the "New draft" link to that same file), and constraints/no-route-enforces-authentication on src/shared/components/app-shell.tsx (bound by an Onda 1 task, now stale because new-draft-creation added a breadcrumb label there). This is not a finding of any pass and settles nothing about the change -- it says the trace's link back to the specification no longer describes these two files, which no pass above asks. Neither this task's own bind-record call can repair it (a bind restamps only the delivering task's own nodes); the route is /reconcile over these two files, planned as the next step after this review. The remaining 6 code-drift findings, and the 3 orphaned-looking "no longer exists" entries under src/src/..., predate this delivery and are outside its file set (a different target's own history).
No suppression receipt: siegard.json declares no `edits_freely` targets, so every drift class is listed rather than counted.
The registry's own standard.json pass-name split (rules a reading decides vs. rules a tool decides) held all 33 tool-decided rules to the captured run's own 5 tool steps (typecheck, lint, style, a11y, secret-scan); all 5 passed, so those 33 rules are answered rather than merely unflagged.
All four passes ran as subagents in clean contexts, per the skill's own delegation discipline; none ran inline.
