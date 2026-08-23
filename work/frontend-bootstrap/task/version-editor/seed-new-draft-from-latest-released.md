---
title: Seed New Draft from the case's latest released version
summary: Changes the New Draft flow to pre-populate its blank form from the case's latest released version's own title, when_to_use, subject, fallback and consolidation_register, and to pass consolidation_register plus source_version explicitly in the create-draft POST.
rationale: >-
  Kept as one task, distinct from new-draft-creation itself (already delivered, never rewritten
  here), because seeding the form and widening the POST body are one falsifiable outcome -- what a
  new draft starts holding -- and one reason to change: naming the source version a new draft
  copies its manifest from, per rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-
  version, which new-draft-creation's own POST never named. It depends on new-draft-creation
  because it extends that task's own blank form and POST call rather than building a new one; on
  case-detail-timeline because finding "the case's latest released version" reads the same
  list-case-versions response that task already establishes; and on edit-draft-version because
  reading that version's own attributes reuses its GET /v1/cases/{slug}/versions/{version} call and
  case-version-record.ts shape rather than a new read.
  I kept the seeding criterion narrow to what the scope states -- title, when_to_use, subject,
  fallback and consolidation_register copied as attributes, source_version and
  consolidation_register named explicitly in the POST -- and left the manifest-copy itself
  unasserted: the scope's own text states the store already copies the named source version's
  manifest server-side, so no criterion here needs to inspect the created draft's own manifest to
  prove it.
objective: Opening "New draft" on a case that holds a released version pre-populates the blank form from that version's own attributes and submits both consolidation_register and source_version explicitly in the create-draft POST.
criteria:
  - Opening "New draft" on a case whose versions include at least one released version pre-populates the form's title, when_to_use, subject, fallback outcome/referral and consolidation_register fields from that case's latest released version, read via GET /v1/cases/{slug}/versions/{version}.
  - Opening "New draft" on a case with no released version yet leaves the form exactly as new-draft-creation already renders it -- blank, subject pre-set to the one glossary value -- with copy stating this is the case's first version.
  - Clicking Save on a form pre-populated from a released version issues POST /v1/cases with a body that additionally includes consolidation_register and source_version set to that released version's own version number.
  - Clicking Save on a first-ever draft's blank form issues POST /v1/cases with a body that includes neither consolidation_register nor source_version, exactly as new-draft-creation's own POST does today.
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
depends_on:
  - task/version-editor/new-draft-creation
  - task/cases-list-and-detail/case-detail-timeline
  - task/version-editor/edit-draft-version
sources:
  - intake/onda-7-scope.md
---

## What it is
The seeding and POST-body widening capability 2 of the onda-7 scope describes, layered on new-draft-creation's own blank-form flow rather than replacing it.

## Notes
The inventory's own risk on CreateDraftRequestBody's currently narrow typing (no consolidation_register or source_version, deliberate at new-draft-creation's own prior scope) applies here directly: widening that type and its literal builder is this task's own responsibility.
Whether a case's subject type may be changed once a draft already exists is left open by the scope's own "Explicitly open" section, for the plan's own blind judge to decide should it ever surface against a task's own criteria; no criterion of this task turns out to touch it -- pre-population sets subject from the released version's own value, and this task never asserts whether the curator may then change it -- so the question stays exactly as undecided as the scope found it, for a later scope to raise if it ever becomes a criterion.
REMAINDER, from the specification — rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version's statement has two clauses: the new draft's manifest is copied entry-for-entry from a specified-or-latest-released source version, and naming no source version defaults that source to the case's own latest released version. This task's criteria answer only the second clause -- the concept of "the case's own latest released version" and the source_version parameter it names. The first clause, the manifest actually being copied as the draft's starting content, answers to no criterion here; it belongs to the backend's own createDraft store operation (src/src/persistence/relational-case-store.repository.ts), already implemented and delivered under a prior, closed initiative -- not to any task in this frontend-only plan.
