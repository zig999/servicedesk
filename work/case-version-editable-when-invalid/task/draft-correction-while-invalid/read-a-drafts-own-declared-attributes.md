---
title: Read a draft's own declared attributes from its stored record
summary: An operation answering a draft case version's title, when_to_use, subject,
  fallback and consolidation_register as its own stored record carries them, with no
  validator rule gating the answer.
rationale: The scope leaves the mechanism open; this read is cut as its own operation,
  separate from read-case, because rule 2 reads none of these attributes through
  case-query's whole-case assembly and read-case must keep refusing a failing version
  by name; it is also cut apart from its HTTP route because what the read answers and
  the route's shape change for different reasons.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
objective: A draft case version's own declared attributes are answered from its own
  stored record whatever validator rule of validation-runs-at-every-read fails over it.
criteria:
  - Over a draft whose manifest holds no entry, the read answers the draft's declared
    attributes instead of raising CaseVersionNotValidError.
  - Over a draft whose stored subject names a subject type the glossary does not hold,
    the read answers the draft's declared attributes instead of raising
    CaseVersionNotValidError.
  - Over a draft whose stored title is blank, the read answers the draft's declared
    attributes instead of raising CaseVersionNotValidError.
  - The answered title is the title the draft's own stored record carries.
  - The answered when_to_use is the when_to_use the draft's own stored record carries.
  - The answered subject is the subject the draft's own stored record carries.
  - The answered fallback outcome is the fallback outcome the draft's own stored record
    carries.
  - The answered fallback referral is the fallback referral the draft's own stored
    record carries.
  - Where the draft declares a consolidation_register, the answered
    consolidation_register is the one the draft's own stored record carries.
  - Where the draft declares no consolidation_register, the read answers no
    consolidation_register value for it.
  - Where another version of the same case carries a different title, the answered
    title is the draft's own stored title.
  - The read answers no manifest entry.
  - A slug and version that no case version answers makes the read raise
    CaseNotFoundError carrying that slug and version.
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case-version
  - rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
---

## What it is

This is the backend read the editing surface stands on: one draft's declared attributes, taken from its own stored record and gated by no validation.

## Notes

The inventory's must_not_duplicate names updateDraftBodySchema's five fields as the attribute set, and this read answers the same five.
UNDERDETERMINED, from the specification — contracts/knowledge/case-query publishes read-case-version as the read of a case version's own stored record by slug and version number, which covers any case version, not only a draft; every criterion of this task speaks only of a draft, so no criterion covers a released version. Passes despite: a read that answers only draft case versions and raises an error, or answers through the validated whole-case read, for a released version named by an existing slug and version.
REMAINDER, from the specification — rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's HTTP 404 clause, its slug-only reads and its lifecycle-operation clauses reach no criterion here, this task's criterion covering only the raised CaseNotFoundError carrying the slug and version. Belongs to: the HTTP route task that publishes read-case-version over HTTP, the tasks for the other case-query reads keyed by slug alone, and the tasks for the case-version lifecycle operations.
REMAINDER, from the specification — the editing-surface rule's clauses that the surface presents the attributes, states explicitly that v declares no consolidation_register where absent, and accepts an update-draft over them on this same reading reach no criterion here. Belongs to: the frontend task that builds the draft's own editing surface, and the task that answers update-draft's accepted call.
REMAINDER, from the specification — rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes does not govern this task; it states the answer of an accepted update-draft, a different act from this read. Belongs to: the task that implements update-draft's accepted answer.
ADVISORY, from the specification — constraints/a-successful-case-version-own-record-read-answers-with-http-200 and constraints/a-malformed-request-is-refused-with-a-validation-error are left out of implements because this task's criteria are all at the operation level and none speaks of an HTTP status; the caller should confirm a route task carries them.
ADVISORY, from the specification — scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing is left out of implements; this task's read operation is only one part of that end-to-end scenario and cannot demonstrate it alone.
