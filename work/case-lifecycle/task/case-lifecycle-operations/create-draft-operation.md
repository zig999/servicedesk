---
title: create-draft operation
summary: Originates a new draft version for a case, either from its own latest released version or from a named historical version, honoring the at-most-one-draft and never-reused-number rules.
rationale: The scope's §3.3 states create-draft(slug) and create-draft(slug, fromVersion) as one operation with a rollback variant; I kept them as one task since both share the same objective and the same refusal.
sources:
- work/case-lifecycle/intake/scope.md
objective: A curator may originate a new draft version for a case, from its latest released version by default or from a named historical version, never while another draft is already open.
criteria:
- Creating a draft for a case with no open draft succeeds, assigned a version number greater than every version number the case has ever held, including a discarded one.
- Creating a draft for a case that already holds an open draft is refused, naming that a draft already exists.
- A draft created naming no source version copies the manifest of the case's own latest released version, empty where the case holds no released version yet.
- A draft created naming a historical version copies that version's own manifest instead of the latest released one.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- contracts/knowledge/case-lifecycle
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
---

## What it is

The one entrance to a new draft, whether starting fresh from the latest release or rolling back to an older one.
It never itself places or removes a manifest entry.

## Notes

UNDERDETERMINED, from the specification — every stated criterion of this task is checkable against a single draft-creation event; none exercises a second draft creation on the same case. A test must exclude: an implementation of create-draft that reads case.next_version and assigns its current value to the newly created draft's version number, without updating or persisting an advanced next_version for the case afterward — passing every one of this task's stated criteria for a single creation, while rules/knowledge/a-case-version-number-is-never-reused and domain/knowledge/case's own next_version attribute (always greater than every version number the case has ever held) refuse it the moment a second draft is created on the same case.
