---
title: Edit an existing draft version
summary: Replaces CaseVersionPlaceholder with a full-replace PATCH form over an existing draft's title, when_to_use, fixed subject, consolidation_register and glossary-backed fallback outcome/referral, driven by a clean/dirty/saving/conflict save state machine.
rationale: >-
  Kept as one task, distinct from originating a new draft, because editing an existing draft and
  creating one dispatch different HTTP verbs against different domain errors (409
  CaseVersionNotDraftError with its own conflict-banner wiring here, versus 409
  CaseAlreadyHasDraftError with toast+redirect there) -- a different reason to change even though
  both share one form component. I folded the save state machine, the glossary-backed dropdown
  population, and the 409/404 handling into this one task rather than splitting them further
  because all three are consequences of the same PATCH call and the same Save trigger, not
  separate objectives.
objective: Editing an existing draft case version and triggering Save persists the curator's entire re-submitted content via PATCH, with the form reflecting exactly what the backend answers for success, conflict and removal.
criteria:
  - Visiting an existing draft version's own route pre-populates the form's title, when_to_use, subject (shown fixed/disabled), consolidation_register and fallback outcome/referral fields from GET /v1/cases/{slug}/versions/{version}.
  - The fallback outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently returns.
  - The fallback referral dropdown's action and recipient options each offer exactly the terms GET /v1/glossary/action and GET /v1/glossary/recipient currently return.
  - Triggering Save, on blur or via the Save button, sends the form's entire current content as one PATCH /v1/cases/{slug}/versions/{version} request body, never a partial field.
  - A 200 response to that PATCH re-hydrates the form from the response body and marks the save with a "saved at HH:mm" indicator.
  - A 409 CaseVersionNotDraftError response to that PATCH blocks further editing of the form and renders the conflict banner with the stated wording, offering to start a new draft.
  - A 404 CaseNotFoundError response, whether loading the version or saving it, navigates to the Cases List route.
  - The form's own state moves clean to dirty on any field change, dirty to saving while the PATCH request is in flight, and saving to clean on a 200 response or saving to conflict on a 409 CaseVersionNotDraftError response.
implements:
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - contracts/glossary/glossary-query
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/case-terms-exist-in-the-glossary
depends_on:
  - task/cases-list-and-detail/dev-proxy-for-backend-api
sources:
  - intake/onda-3-scope.md
---

## What it is
The section 2.3 Version Editor the scope describes, over the real PATCH/GET endpoints and the real glossary vocabularies the inventory confirmed.
The first task in this epic issuing a real GET and the first PATCH this app performs at all, hence the dependency on the dev-proxy task.
It reuses the existing ConflictBanner component, error-to-UI-state mapping and telemetry hook already delivered in Onda 1, none of which needed building here.

## Notes
No MutationCache-level toast exists in the shared query client (per the inventory's own risk); this task's own 409/404 handling at the PATCH call site is what the failure criteria above hold it to, not a global mutation error handler.
This task is the first to import react-hook-form, zod and (if zodResolver is used) @hookform/resolvers; adding them to frontend/app/package.json is this task's own responsibility, per the standard's authorization, not a separate substrate task.
The exact conflict-banner wording named in criterion 6 is sourced from this task's own `sources` (intake/onda-3-scope.md, itself quoting docs/frontend-triage-console-proposal.md §2.3 verbatim) rather than from a specification node: an unstated-fact-decider, blind to this task, found the wording already `stated` in that material -- the proposal's own §6.1 analysis concluding it re-presents rules/knowledge/a-case-version-is-written-once ("revising a case's content composes the next draft version instead") rather than inventing a new fact -- and wrote no specification node, since only a `decided` outcome authorizes that write. Full disclosure at temp/frontend-console-decisions.md, Onda 3 section.
rules/knowledge/case-terms-exist-in-the-glossary's subject-type clause is not reached here: this task shows the case version's subject fixed and disabled, never selecting or validating a subject-type value against the glossary. That clause belongs to whichever task governs choosing a subject type at creation (new-draft-creation).
rules/knowledge/case-terms-exist-in-the-glossary's concept clause is not reached here either: editing title/when_to_use/subject/consolidation_register/fallback never touches the manifest or a hypothesis-revision's concepts. That clause belongs to the hypothesis-revision authoring and manifest-composition tasks (revise-hypothesis, place-hypothesis, remove-hypothesis), deferred to Onda 4.
