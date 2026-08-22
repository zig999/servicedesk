---
title: Cases List and Case Detail
summary: The two real, data-driven screens Onda 2 lands over Onda 1's foundation -- a searchable list of every case and a per-case version timeline with an at-most-one-draft creation flow -- replacing CasesListPlaceholder and CaseDetailPlaceholder.
rationale: >-
  The plan-node contract requires an epic to declare at least one covered node. Onda 2's own
  screens surface domain/knowledge/case, case-version and case-version-state directly, and
  exercise the case-lifecycle and case-query contracts and several of the rules governing a
  case's draft-versioning lifecycle -- none of which either sibling epic's covers list names.
  I cut a new epic rather than folding these tasks into case-authoring-console or
  frontend-console-foundation because Onda 2 answers to a different reason to change than
  either: case-authoring-console's territory is composing and releasing a draft's own content,
  still entirely unbuilt there; frontend-console-foundation's territory is cross-cutting
  shell/router/transport plumbing with no screen of its own. This epic is the first to actually
  read and originate case-authoring data on a screen. I declare uncovered the capability node
  itself and the rules/constraint this wave's read-only listing and single create-draft action
  never exercises -- composing or releasing a draft's own content, a released version's
  immutability, version-number non-reuse, the whole-version read, read-time revalidation, and
  the capability-registry freshness check -- because no task in this increment attempts any of
  them.

  Grown after the cases-list-screen skeleton's own binder found the Cases List wireframe's
  State/Versions/Updated columns answer to no node: neither the case aggregate nor a listing was
  stated to expose a case's current state, version count or last-updated timestamp. An
  unstated-fact-decider (blind to this cut) decided domain/knowledge/case-summary and the rule
  deriving it, disclosed in the decision log -- both now covered here, since cases-list-screen is
  exactly the task that reads them.
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
    why: This wave only lists cases and originates a draft; no task composes a draft's manifest or its own attributes, or releases it -- the capability's full promise is not delivered here.
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
    why: No binder ended up citing this rule -- none of this wave's tasks enacts or observes the release transition itself; case-detail-timeline and cases-list-screen only read and display whichever state a version already carries, and case-detail-new-draft-action creates a new draft (create-draft) rather than transitioning an existing version.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: No binder ended up citing this rule -- every task in this wave consumes a slug the backend already resolved (from a route parameter or a listing's own row) rather than asserting or enforcing slug uniqueness itself; that invariant is enforced where a case is originated, which this wave's create-draft task does not implement.
sources:
  - intake/onda-2-scope.md
---

## What it is
Onda 2 replaces CasesListPlaceholder and CaseDetailPlaceholder with two real screens over Onda 1's router, API client and shared components.
Cases List reads every case from GET /v1/cases; Case Detail reads one case's versions from GET /v1/cases/:slug/versions and originates a new draft through POST /v1/cases when none exists.
The 409 CaseAlreadyHasDraftError race the backend's own at-most-one-draft rule makes possible is handled as an expected redirect, never an error.

## Notes
Version Editor, Manifest Builder and every other screen the proposal describes past sections 2.1/2.2 stay out of this epic's scope; their own case-authoring nodes stay claimed only by the sibling case-authoring-console epic, which already declares them uncovered.
