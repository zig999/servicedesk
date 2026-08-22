---
title: Originate a new draft from Case Detail
summary: Adds the "New draft" entry point to Case Detail, opening the same field form in a blank state whose first Save calls POST /v1/cases rather than PATCH, handling the 409 CaseAlreadyHasDraftError race and the empty-manifest read-back gap.
rationale: >-
  Kept as one task because the button's visibility, the blank-form trigger, and the POST/201/409
  handling all serve one objective -- originating a draft -- and change for one reason: how a
  curator starts a new version. It depends on edit-draft-version because the scope states both
  flows share exactly the same form and field validation, differing only in which verb Save
  dispatches; it depends on case-detail-timeline because the "New draft" button's visibility is
  computed from the same version list that task already renders. I decided the post-create state
  is seeded from the just-submitted content and the response's own version number rather than a
  follow-up GET, because the inventory's own risk stands: GET /v1/cases/:slug/versions/:version's
  response schema requires manifest.min(1), and a freshly created draft holds zero manifest
  entries until the curator composes it in the Manifest Builder (Onda 4) -- a follow-up GET here
  would not read back as a case yet, per rules/knowledge/validation-runs-at-every-read, and the
  client already holds everything that response would have told it.
objective: Clicking "New draft" on a case with no draft in progress creates a persisted draft case version via POST /v1/cases, populated from curator-entered content in the same form the editor already offers for editing, and lands the curator in that draft's own edit flow.
criteria:
  - >-
    "New draft" is rendered in Case Detail only when none of that case's existing versions is
    currently in draft state.
  - Clicking "New draft" opens the Version Editor with no version's content pre-loaded, and the subject field pre-set to the one subject-type value GET /v1/glossary/subject-type currently returns.
  - Clicking Save on that blank form issues POST /v1/cases with { slug, title, when_to_use, authored_at, subject, fallback } built from the curator's entered content, the case's own slug from the route, and a client-side authored_at timestamp captured at the moment of that save.
  - A 201 response to that POST switches the form into the same edit-mode flow edit-draft-version delivers for an existing draft, addressed by the version number the response returns.
  - That switch to edit mode seeds the form from the content just submitted and the returned version number, without issuing a follow-up GET /v1/cases/{slug}/versions/{version}.
  - A 409 CaseAlreadyHasDraftError response to that POST shows a toast stating a draft already exists for the case and navigates to that case's existing draft version, resolved by reading GET /v1/cases/{slug}/versions.
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/glossary/subject-type
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - contracts/glossary/glossary-query
  - rules/knowledge/a-case-has-at-most-one-draft
depends_on:
  - task/version-editor/edit-draft-version
  - task/cases-list-and-detail/case-detail-timeline
sources:
  - intake/onda-3-scope.md
---

## What it is
The New Draft origination flow deferred from Onda 2's case-detail-new-draft-action, now feasible because the field form it needs (edit-draft-version) exists.
The 409 CaseAlreadyHasDraftError race Onda 2 documented but never implemented, handled here exactly as originally intended: toast plus redirect to the existing draft.

## Notes
The inventory flags that GET /v1/cases/:slug/versions/:version's response schema requires manifest.min(1), so a freshly created draft (zero manifest entries) may not be readable back through that same endpoint immediately after creation. The decision made here is not to attempt that GET at all: the POST's own { slug, version } response plus the content the editor already holds (it is exactly what was just submitted) is enough to seed the edit-mode state, so the empty-manifest gap is never exercised by this task.
This task is the second to rely on react-hook-form/zod (added to package.json by edit-draft-version); no further dependency addition is needed here.
domain/knowledge/consolidation-register is deliberately not implemented here even though the shared form carries the field: the decision log (entries at knowledge/decision-log.md around lines 378-382) settles that consolidation_register was added to update-draft specifically so a curator corrects it after create-draft, not as part of origination itself -- which is also why criterion 3's POST body omits it. Correcting it belongs to edit-draft-version, exercised on the draft this task just created.
rules/knowledge/validation-runs-at-every-read is invoked informally in this task's own rationale above (it is the reason no follow-up GET is issued after the 201), but no criterion of this task actually asserts or exercises that a stored case version reads as a case only while every validator rule holds -- the execution-contract-binder, on a fresh rereading of the fully expanded candidate set, excluded it from `implements` on that ground and it now stands as an explicitly uncovered node on the epic's own covers list, with that same reasoning recorded there.
