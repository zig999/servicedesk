---
title: Review of version-editor onda 5 (2 delivered tasks)
summary: 'Four-pass review of the 2 delivered version-editor tasks -- release-draft-version and discard-draft-version:
  coverage over their 15 criteria, specification conformance, standard conformance, and the failures pass
  (which did not run -- the captured run passed cleanly).'
tasks:
- task/version-editor/release-draft-version
- task/version-editor/discard-draft-version
reviewed:
- src/hooks/use-edit-draft-version-form.ts
- src/routes/case-version-editor-ready-view.tsx
- src/routes/case-version-editor-release.test-support.ts
- src/routes/case-version-editor-screen-discard.spec.ts
- src/routes/case-version-editor-screen-discard.test-support.ts
- src/routes/case-version-editor-screen-release-checklist.spec.ts
- src/routes/case-version-editor-screen-release-control.spec.ts
- src/routes/case-version-editor-screen-release-outcomes.spec.ts
- src/routes/case-version-editor-screen.tsx
- src/routes/new-case-draft-screen.tsx
- src/services/case-version-record.ts
- src/services/discard-confirmation.ts
- src/services/release-checklist.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/version-editor-onda-5-full-suite) passed all 8 steps with 226/226 tests
    passing; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: The Version Editor renders a "Release…" control only while the currently loaded version's
    own state is draft.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: renders the Release… control once the loaded version's own state is draft
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: renders no Release control when the loaded version's own state is released
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: renders no Release control when the loaded version carries no state field at all
- criterion: 'Clicking "Release…" opens an in-place TUI Dialog (no navigation) listing a checklist computed
    from already-loaded data: whether the manifest holds at least one entry, with its count; whether the
    loaded fallback''s own outcome, action and recipient terms still exist by re-reading GET /v1/glossary/outcome,
    GET /v1/glossary/action and GET /v1/glossary/recipient; and whether every manifested hypothesis-revision''s
    collected concepts accept the version''s own subject by re-reading GET /v1/glossary/concepts.'
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: opens an in-place Dialog (no navigation) listing exactly the three checklist items, every one
      satisfied by already-loaded data
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the manifest item unsatisfied with a zero count on an empty manifest, while the concept
      item stays satisfied vacuously
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: re-reads GET /v1/glossary/outcome when the Dialog opens, and marks the fallback item unsatisfied
      once the fallback's own outcome term is no longer offered
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the concept item unsatisfied when a re-read concept no longer accepts the version's own
      subject, independently of the other two items
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the concept item unsatisfied, never a distinct fourth item, when a manifested concept
      no longer exists at all in the freshly re-read glossary
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: treats a checklist dependency that fails every read as unsatisfied rather than crashing the
      Dialog
  why: the fallback-terms sub-fact names three re-reads (outcome, action, recipient) but only GET /v1/glossary/outcome
    is ever made to fail or shown to be re-issued on Dialog open; nothing in the set stops GET /v1/glossary/action
    or GET /v1/glossary/recipient from returning a term list missing the fallback's own action or recipient,
    so the fallback item's dependence on those two reads is unexercised.
- criterion: That checklist never renders a capability-readiness item, since no capability data is read
    by this task.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: opens an in-place Dialog (no navigation) listing exactly the three checklist items, every one
      satisfied by already-loaded data
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the manifest item unsatisfied with a zero count on an empty manifest, while the concept
      item stays satisfied vacuously
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the concept item unsatisfied when a re-read concept no longer accepts the version's own
      subject, independently of the other two items
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: marks the concept item unsatisfied, never a distinct fourth item, when a manifested concept
      no longer exists at all in the freshly re-read glossary
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: treats a checklist dependency that fails every read as unsatisfied rather than crashing the
      Dialog
- criterion: Confirming Release in the Dialog issues exactly one POST /v1/cases/{slug}/versions/{version}/release
    request with no body.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: issues exactly one POST to .../release with no body when Release is confirmed
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: issues exactly one POST even when Release is confirmed twice in quick succession
- criterion: A 200 response to that POST moves the loaded version's own state to released and disables
    every field and the Save control the form renders.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: 'moves the loaded version to released: hides the Release control and disables every field and
      Save'
  why: only the Title field and the Save changes control are checked for disabled after a 200; the form
    also renders when_to_use, subject, the fallback outcome/action/recipient fields and consolidation_register,
    none of which any test in the set checks, so "every field" is unexercised beyond Title.
- criterion: A 422 CaseVersionNotReleasableError response renders every string the response's own `violations`
    array holds, together and verbatim, in place of the pre-click checklist.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: renders every violation the response's own array holds, verbatim, in place of the checklist
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: renders an empty violations view rather than the checklist when the response's own violations
      array is empty
- criterion: A 409 CaseVersionNotDraftAtReleaseError response closes the Dialog and re-fetches the version
    rather than showing a violations list.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: closes the Dialog and re-fetches the version rather than showing a violations list, resetting
      for the next open
- criterion: The Dialog's Cancel control closes it without issuing any request.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: closes the Dialog and issues no request when Cancel is clicked
- criterion: The Version Editor renders a "Discard draft" control only while the currently loaded version's
    own state is draft.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: renders the Discard draft control once the loaded version's own state is draft
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: renders no Discard control when the loaded version's own state is released
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: renders no Discard control when the loaded version carries no state field at all
- criterion: Clicking "Discard draft" opens an in-place TUI Dialog (no navigation) stating that the case's
    hypotheses keep their content and that only this draft and its manifest are removed.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: opens an in-place Dialog (no navigation) stating that hypotheses keep their content and only
      this draft and its manifest are removed
- criterion: The Dialog's own "Discard draft" control stays disabled until the curator has typed the case's
    own slug, exactly, into the confirmation field.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: keeps the confirm control disabled while the confirmation field is empty
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: keeps the confirm control disabled for a typed value that is not an exact match
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: enables the confirm control once the confirmation field holds the slug typed exactly
- criterion: Confirming with the slug typed exactly issues one DELETE /v1/cases/{slug}/versions/{version}
    request with no body.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: issues exactly one DELETE against this version with no body when confirmed with the slug typed
      exactly
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: issues exactly one DELETE even when confirm is clicked twice in quick succession
- criterion: A 204 response to that DELETE navigates the curator to that case's own Case Detail route.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: navigates the curator to that case's own Case Detail route
- criterion: Any error response to that DELETE keeps the Dialog open, rendering that error's own message,
    rather than navigating away.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: keeps the Dialog open and renders that error's own message on a 404 response, rather than navigating
      away
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: renders a generic fallback message, rather than none at all, when the DELETE fails outside the
      backend's own typed error envelope
- criterion: The Dialog's "Keep draft" control closes it without issuing any request.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-discard.spec.ts
    name: closes the Dialog and issues no request when Keep draft is clicked
findings:
- pass: conformance
  file: src/services/release-checklist.ts
  where: buildReleaseChecklist — the fallbackTermsExist computation and the checklist item labelled "Fallback
    resolution is set"
  evidence: "// \"Fallback resolution is set\" (criterion 2): the field itself is always\n// present structurally\
    \ (CaseVersionRecord.fallback is required) -- what\n// can actually go stale is one of its own three\
    \ glossary-backed terms\n// having been removed since this version was authored ...\nconst fallbackTermsExist\
    \ =\n  outcomeOptions.options.some((option) => option.value === record.fallback.outcome) &&\n  actionOptions.options.some((option)\
    \ => option.value === record.fallback.referral.action) &&\n  recipientOptions.options.some(\n    (option)\
    \ => option.value === record.fallback.referral.recipient,\n  );\n...\n{ label: \"Fallback resolution\
    \ is set\", satisfied: fallbackTermsExist },"
  cost: The checklist tells a curator "! Fallback resolution is set" whenever this check fails, naming
    a fact -- the fallback is missing -- that domain/knowledge/case-version already guarantees can never
    be false (fallback is required). What the code actually tests, by the comment's own admission, is
    whether the fallback's outcome/action/recipient terms still exist in the glossary -- rules/knowledge/case-terms-exist-in-the-glossary's
    own fact. A curator reading "Fallback resolution is set" as unsatisfied is pointed at the wrong problem
    (an absent fallback) instead of the real one (a stale glossary term the fallback still references),
    with no correction available from the label shown.
  correction: Label this item for what it tests -- glossary-term validity of the fallback's outcome/action/recipient
    (rules/knowledge/case-terms-exist-in-the-glossary) -- rather than field presence, so the checklist
    names the rule it actually enforces.
- pass: conformance
  file: src/services/release-checklist.ts
  where: buildReleaseChecklist — the conceptsAcceptSubject computation and the checklist item labelled
    "Every collected concept accepts the case subject"
  evidence: "const conceptsAcceptSubject = manifestEntries.every((entry) =>\n  entry.hypothesis_revision.collects.every((conceptName)\
    \ => {\n    const concept = concepts.find((candidate) => candidate.name === conceptName);\n    return\
    \ concept !== undefined && concept.accepts.includes(record.subject);\n  }),\n);"
  cost: A concept the glossary no longer holds at all is a rules/knowledge/case-terms-exist-in-the-glossary
    violation, not a rules/knowledge/a-concept-accepts-the-declared-subject-type one -- the two name different
    facts (the term does not exist, versus the term exists but rejects this subject). Both are folded
    under the single label "Every collected concept accepts the case subject", so a curator told this
    item failed is told the concept rejects the case's subject even when the true cause is that the term
    has vanished from the glossary entirely; the fix the label implies (choose a concept that accepts
    this subject) is not the fix the actual failure needs (re-author the manifest entry against a concept
    that still exists).
  correction: Distinguish "concept no longer exists in the glossary" from "concept exists but does not
    accept this subject" -- either as two checklist rows naming the two rules separately, or a label that
    does not commit to one rule's wording when the other's violation is what actually occurred.
- pass: standard
  file: src/services/case-version-record.ts
  where: lines 44 and 46, the CaseVersionRecord type's state and manifest fields
  cites: TYP-04
  evidence: 'readonly state?: "draft" | "released";

    ...

    readonly manifest?: readonly CaseVersionManifestEntry[];'
  cost: The record's own header comment names state as "domain/knowledge/case-version-state's own two
    values" -- a fixed, known set of shapes -- yet it is carried as an independently optional field alongside
    an independently optional manifest, so nothing in the type stops a caller from constructing a record
    with manifest populated and state absent, or the reverse, a combination neither of this file's two
    real callers (a fresh POST seed with neither field, a GET/POST-release response with both) ever produces
    but the compiler cannot refuse.
  correction: Model the two known shapes as a discriminated union -- a "not yet loaded" variant carrying
    neither field, and a "loaded" variant requiring both state and manifest together -- rather than two
    fields optional on their own.
- pass: standard
  file: src/hooks/use-edit-draft-version-form.ts
  where: lines 105 and 107, the "ready" phase's release and discard fields
  cites: TYP-04
  evidence: 'readonly release?: ReleaseControlState;

    ...

    readonly discard?: DiscardControlState;'
  cost: The file's own header comment names exactly two known "ready" shapes -- edit-draft-version's own
    call site, which always supplies both, and new-draft-version's blank-form call site, which supplies
    neither -- yet they are carried as two independently optional fields on one object type. Nothing in
    the type itself forbids a future "ready" value carrying release without discard or the reverse, a
    combination this codebase's own two callers never produce.
  correction: Model "ready" as a discriminated union between the two known shapes (with and without the
    release/discard controls) rather than as two optional fields on one shape.
- pass: standard
  file: src/routes/case-version-editor-ready-view.tsx
  where: the "violations" branch of the Release Dialog body
  cites: API-04
  evidence: "<div role=\"alert\">\n  <ul className=\"flex flex-col gap-1 text-sm text-destructive\">\n\
    \    {release.dialog.violations.map((violation) => (\n      <li key={violation}>! {violation}</li>\n\
    \    ))}\n  </ul>\n</div>"
  cost: When the 422 response carries an empty violations array -- a case this task's own test suite exercises
    deliberately ("renders an empty violations view rather than the checklist when the response's own
    violations array is empty") -- this renders an alert region holding an empty list and no text at all.
    A curator who reaches this state sees the Dialog body go blank with nothing said, indistinguishable
    from a broken render rather than an explicit statement that the backend returned no specific violation.
  correction: Render explicit copy for the empty-violations case (e.g. "No specific violation was returned")
    so the empty response is never presented as though nothing had happened.
---

## What it is
Reviews the 2 tasks Onda 5 delivered against the version-editor epic: release-draft-version (pre-release checklist, POST .../release, 200/409/422 handling) and discard-draft-version (slug-typed destructive confirmation, DELETE .../versions/{version}, 204/error handling).
Coverage: 13 of 15 criteria fully covered, 2 partial -- the release checklist's fallback item is exercised only against a stale outcome term, never action or recipient, and the 200-success "disables every field" claim is exercised only for Title and Save, not the form's other fields.
Conformance: 2 findings, both in release-checklist.ts -- the "Fallback resolution is set" label misnames what it actually tests (glossary-term validity, not field presence), and the concept-acceptance item conflates "concept no longer exists in the glossary" with "concept exists but rejects this subject", two different rules folded under one label.
Standard: 3 findings -- two TYP-04 findings where a known two-shape union (CaseVersionRecord's state/manifest; the "ready" phase's release/discard) is modeled as independently optional fields rather than a discriminated union, and one API-04 finding where an empty 422 violations array renders a blank alert region with no explanatory text.
Failures: did not run -- the captured run (run/version-editor-onda-5-full-suite) passed all 8 steps, 226/226 tests.

## Notes
The trace (trace.py --check frontend/app) reports 7 code-drift findings over 121+18+5 bindings, 0 orphaned, 0 moved. None of the 7 are caused by this delivery: both new implementations fully refreshed every node edit-draft-version (Onda 3) had bound on the shared files (use-edit-draft-version-form.ts, case-version-editor-ready-view.tsx), verified by comparing every prior binding's digest against the current file content before this review was written. One finding (constraints/no-route-enforces-authentication on src/shared/components/app-shell.tsx) is the same pre-existing, already-twice-disclosed drift siegard-reconcile/version-editor-onda-3-drift.md and siegard-reconcile/manifest-hypothesis-authoring-onda-4-drift.md both left unreconciled -- app-shell.tsx was not touched by either task this onda delivered. The remaining 6 findings (src/src/... paths no longer existing) predate this delivery and belong to the backend target's own history, outside this file set. No /reconcile invocation was needed for this onda.
No suppression receipt: siegard.json declares no edits_freely targets, so every drift class is listed rather than counted.
The registry's own standard.json pass-name split (rules a reading decides vs. rules a tool decides) held all 33 tool-decided rules to the captured run's own 5 tool steps (typecheck, lint, style, a11y, secret-scan); all 5 passed, so those 33 rules are answered rather than merely unflagged.
All four passes ran as subagents in clean contexts, per the skill's own delegation discipline; none ran inline.
