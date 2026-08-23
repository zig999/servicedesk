---
title: Cases List and Case Detail
summary: The two real, data-driven read screens Onda 2 lands over Onda 1's foundation -- a searchable list of every case and a per-case version timeline -- plus a case-attributes-at-a-glance view reading the case's current version whole. Originating a new draft is deferred to Onda 3 (see Notes).
rationale: >-
  The plan-node contract requires an epic to declare at least one covered node. Onda 2's own
  screens surface domain/knowledge/case, case-version and case-version-state directly, and
  exercise the case-query contract and several of the rules governing a case's draft-versioning
  lifecycle -- none of which either sibling epic's covers list names. I cut a new epic rather
  than folding these tasks into case-authoring-console or frontend-console-foundation because
  Onda 2 answers to a different reason to change than either: case-authoring-console's
  territory is composing and releasing a draft's own content, still entirely unbuilt there;
  frontend-console-foundation's territory is cross-cutting shell/router/transport plumbing with
  no screen of its own. This epic is the first to actually read case-authoring data on a screen.

  Grown after the cases-list-screen skeleton's own binder found the Cases List wireframe's
  State/Versions/Updated columns answer to no node: neither the case aggregate nor a listing was
  stated to expose a case's current state, version count or last-updated timestamp. An
  unstated-fact-decider (blind to this cut) decided domain/knowledge/case-summary and the rule
  deriving it, disclosed in the decision log -- both now covered here, since cases-list-screen is
  exactly the task that reads them.

  Shrunk after the fourth task (create-draft, "New draft") was found infeasible as originally
  scoped: POST /v1/cases (case-store.port.ts's own CreateDraftInput, confirmed against
  create-draft.dto.ts's real Zod schema) requires title, when_to_use, subject and fallback, all
  non-optional -- a real form's worth of curator-supplied content, not a slug-only click the
  proposal's own wireframe (section 2.2) and this wave's original task skeleton both assumed.
  No specification node states a default for any of them, and inventing one would plant real
  domain content (a case-version's own initial title, subject and fallback outcome) in the
  frontend that nobody decided -- exactly what this framework refuses. Originating a draft is
  deferred to Onda 3 (Version Editor), which already has to build the same field set for
  update-draft's own full-replace PATCH; case-lifecycle and a-case-has-at-most-one-draft, the two
  nodes only that fourth task's own binder had cited, move to uncovered accordingly. Disclosed in
  full in temp/frontend-console-decisions.md.

  Onda 7 adds a third task, case-attributes-at-a-glance, landing here rather than in version-editor
  or a new epic because it is a new view on case-detail-screen.tsx, the exact screen
  case-detail-timeline already owns, and because the "current version" it reads is exactly
  domain/knowledge/case-summary's own already-covered current_state derivation (the highest-
  numbered version a case holds, draft or released) -- domain/knowledge/case-summary and
  rules/knowledge/a-case-summary-is-derived-from-its-existing-versions do not newly join this
  epic's covers, since Onda 2's cases-list-screen already put both there; this task reuses that
  same node from a second call site rather than introducing it. constraints/a-case-is-read-whole
  and rules/knowledge/validation-runs-at-every-read do not newly join this covers list either --
  both were already named here, marked uncovered since Onda 2 -- but this task's own two criteria
  (reading the current version's own whole assembled record via read-case rather than only
  list-case-versions' metadata, and rendering that whole-read's own coherence refusal as an
  explicit state rather than a generic load error) are the first in this epic to actually exercise
  either, so both move from uncovered to covered by this task. domain/knowledge/consolidation-
  register, domain/knowledge/resolution and domain/knowledge/referral newly join this epic's
  covers: this is the first task here to render a version's full declared-attribute set rather
  than only its state, version count and last-updated timestamp. None of this epic's other
  uncovered entries move: this task neither writes, transitions nor originates a version --
  every one of its links hands the write off to a task in a different epic (version-editor) --
  so contracts/system/case-authoring, a-case-version-is-written-once, a-case-version-number-is-
  never-reused, the-contract-check-reads-the-current-registration, a-case-version-moves-through-
  its-declared-lifecycle, a-slug-identifies-one-case, contracts/knowledge/case-lifecycle and
  a-case-has-at-most-one-draft all stay uncovered here for the same reasons already stated.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - contracts/system/case-authoring
  - rules/knowledge/a-case-has-at-most-one-draft
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  - rules/knowledge/a-case-version-number-is-never-reused
  - rules/knowledge/a-slug-identifies-one-case
  - rules/knowledge/every-case-version-remains-readable
  - constraints/a-case-is-read-whole
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - domain/knowledge/case-summary
  - rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
uncovered:
  - node: contracts/system/case-authoring
    why: No task in this epic composes a draft's manifest or its own attributes, or releases it -- the capability's full promise is not delivered here.
  - node: rules/knowledge/a-case-version-is-written-once
    why: No task in this epic edits a version's own attributes or manifest, or attempts a write to a released version; the write-once invariant is never exercised.
  - node: rules/knowledge/a-case-version-number-is-never-reused
    why: The screens only display whatever version numbers the backend returns; no task assigns, reuses or verifies a version number.
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    why: This rule concerns the capability registry checked at diagnosis time; no task in this epic reads or displays anything from that registry.
  - node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    why: No task in this epic enacts or observes the release transition itself; every task here only reads and displays whichever state a version already carries.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: Every task in this epic consumes a slug the backend already resolved rather than asserting or enforcing slug uniqueness itself; that invariant is enforced where a case is originated, which no task here implements.
  - node: contracts/knowledge/case-lifecycle
    why: The only task that would have exercised this contract's create-draft operation was found infeasible as scoped and deferred to Onda 3 (version-editor); no task added since issues create-draft from this epic either.
  - node: rules/knowledge/a-case-has-at-most-one-draft
    why: Exercising this policy requires actually originating or contending over a draft; every task in this epic, including Onda 7's attributes-at-a-glance view, only reads whichever draft or released version already exists and hands origination off to version-editor.
sources:
  - intake/onda-2-scope.md
  - intake/onda-7-scope.md
---

## What it is
Onda 2 replaces CasesListPlaceholder and CaseDetailPlaceholder with two real, read-only screens over Onda 1's router, API client and shared components.
Cases List reads every case from GET /v1/cases; Case Detail reads one case's versions from GET /v1/cases/:slug/versions and offers "Continue editing" on any draft version, with no precondition.
Onda 7 adds a case-attributes-at-a-glance view reading the case's current version whole via read-case.
Originating a new draft is delivered by version-editor instead, once its own Version Editor task exists to actually collect the content POST /v1/cases requires.

## Notes
Version Editor, Manifest Builder and every other screen past sections 2.1/2.2 stay out of this epic's scope; their own case-authoring nodes stay claimed by the sibling epics.
The fourth task originally cut for Onda 2, case-detail-new-draft-action, was removed rather than delivered; see this epic's own rationale for the full account.
