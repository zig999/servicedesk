---
title: Cases List and Case Detail
summary: The two real, data-driven read screens Onda 2 lands over Onda 1's foundation -- a searchable list of every case and a per-case version timeline -- replacing CasesListPlaceholder and CaseDetailPlaceholder. Originating a new draft is deferred to Onda 3 (see Notes).
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
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
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
    why: This wave only lists cases and their versions; no task composes a draft's manifest or its own attributes, or releases it -- the capability's full promise is not delivered here.
  - node: rules/knowledge/a-case-version-is-written-once
    why: No task in this wave edits a version's own attributes or manifest, or attempts a write to a released version; the write-once invariant is never exercised.
  - node: rules/knowledge/a-case-version-number-is-never-reused
    why: The screens only display whatever version numbers the backend returns; no task assigns, reuses or verifies a version number.
  - node: constraints/a-case-is-read-whole
    why: Case Detail lists version metadata through list-case-versions only; no task in this wave reads a single version's own manifest and hypothesis-revisions whole.
  - node: rules/knowledge/validation-runs-at-every-read
    why: No task in this wave handles or displays a validation failure at read time; the screens assume the data GET /v1/cases and GET /v1/cases/:slug/versions return already reads back as valid.
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    why: This rule concerns the capability registry checked at diagnosis time; no task in this wave reads or displays anything from that registry.
  - node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    why: No task in this wave enacts or observes the release transition itself; case-detail-timeline and cases-list-screen only read and display whichever state a version already carries.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: Every task in this wave consumes a slug the backend already resolved (from a route parameter or a listing's own row) rather than asserting or enforcing slug uniqueness itself; that invariant is enforced where a case is originated, which no task in this wave implements.
  - node: contracts/knowledge/case-lifecycle
    why: The only task that would have exercised this contract's create-draft operation (case-detail-new-draft-action) was found infeasible as scoped and deferred to Onda 3; see this epic's own rationale and temp/frontend-console-decisions.md.
  - node: rules/knowledge/a-case-has-at-most-one-draft
    why: Exercising this policy requires actually originating a draft, which the deferred create-draft task would have done; no task in this wave attempts it.
sources:
  - intake/onda-2-scope.md
---

## What it is
Onda 2 replaces CasesListPlaceholder and CaseDetailPlaceholder with two real, read-only screens over Onda 1's router, API client and shared components.
Cases List reads every case from GET /v1/cases; Case Detail reads one case's versions from GET /v1/cases/:slug/versions and offers "Continue editing" on any draft version, with no precondition.
Originating a new draft (the "New draft" action, and the 409 CaseAlreadyHasDraftError race it can hit) is deferred to Onda 3, once its own Version Editor task exists to actually collect the content POST /v1/cases requires.

## Notes
Version Editor, Manifest Builder and every other screen the proposal describes past sections 2.1/2.2 stay out of this epic's scope; their own case-authoring nodes stay claimed only by the sibling case-authoring-console epic, which already declares them uncovered.
The fourth task originally cut for this epic, case-detail-new-draft-action, was removed rather than delivered: POST /v1/cases requires title/when_to_use/subject/fallback, none of which any screen in this wave holds or any specification node defaults -- see this epic's own rationale and temp/frontend-console-decisions.md for the full account. Onda 3 (Version Editor) is where a curator actually supplies that content, so "New draft" becomes that task's own entry point rather than a standalone POST here.
