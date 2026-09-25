---
title: Correcting a draft on the editor while it does not read back as a case
summary: The frontend editor presents a refused draft's own stored declared attributes
  and accepts an update-draft over them, and every surface for one named version
  routes to that editor on every reading.
rationale: The scope names three rules and states no grouping. Correction and discard
  are cut into two frontend epics, as the backend half was, because they change for
  different reasons. Correction adds a second read and a new state to the editor.
  Discard's gate already depends on state alone and only has to be reached. The
  routes to the editing surface are grouped here because they lead to the surface
  this epic makes usable. Both epic identifiers are new to this target, as the caller
  asked.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
covers:
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  - rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  - contracts/knowledge/case-query
  - constraints/a-successful-case-version-own-record-read-answers-with-http-200
  - domain/knowledge/case-version
  - rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  - rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  - rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  - rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  - rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  - rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  - rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  - rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - constraints/a-case-is-read-whole
  - rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  - constraints/a-malformed-request-is-refused-with-a-validation-error
  - rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  - rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
uncovered:
  - node: rules/knowledge/validation-runs-at-every-read
    why: The frontend evaluates no validator rule, and it learns the outcome only
      from read-case's refusal.
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    why: It appears here only as the scenario's given. Release still enforces it at
      the backend, and no task here reads an empty manifest as a case.
  - node: constraints/a-case-is-read-whole
    why: read-case stays the editor's whole read on a reading that validates, and
      nothing here changes what it assembles.
  - node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
    why: The editor's existing handling of read-case's 404 is unchanged.
      read-case-version is reached only after read-case has shown the version
      exists.
  - node: constraints/a-malformed-request-is-refused-with-a-validation-error
    why: The editor builds its request paths from its own route parameters, and no
      task here changes a request shape.
  - node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
    why: The manifest screen gains only a route. Placing a hypothesis and what that
      screen presents are untouched.
  - node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
    why: Every surface touched here is keyed by slug and version number. The
      slug-keyed case detail surface is untouched.
  - node: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
    why: This node deliberately leaves out the refused reading, saying only what
      a reading states while the version reads back as a case. No task here
      changes what the editor presents on a reading that validates; the refused
      reading is answered by an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
      instead.
---

## What it is

This epic holds the frontend work that lets a curator reach a draft's editor and correct it while that draft does not read back as a case.

## Notes

The inventory surveyed only the editor screen and its hook. The manifest and simulation screens' missing routes were read from frontend/app/src/routes/version-manifest-screen.tsx, case-simulation-screen.tsx and case-simulation-header.tsx directly, so the caller may want the surveyor to cover them.
The editor screen is the editing surface itself, so no route task is cut for it.
Two tasks here depend on tasks in the backend epic epic/draft-correction-while-invalid, because the backend route path and the shape of update-draft's answer do not exist until those tasks land.
contracts/knowledge/case-query says read-case-version answers only title, when_to_use, subject, fallback and consolidation_register, and no state. So on a refused reading the editor must learn draft or released from somewhere else. The tree's list-case-versions answers state without validating (src/src/case/case-query.service.ts:53-58).
The specification decides neither offering nor withholding release on a reading where the draft does not read back as a case. No criterion here decides it, and the caller has to settle it before implementation.
The specification does not say whether the editor must read the version again after an accepted update-draft on that reading. No criterion here decides it.
new-case-draft-screen.tsx also renders CaseVersionEditorReadyView, so it consumes any change to the ready state's shape.
