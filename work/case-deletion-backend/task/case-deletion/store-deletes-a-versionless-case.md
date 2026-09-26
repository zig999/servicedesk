---
title: Store removal of a case holding no version
summary: The case-store port method and its relational implementation that remove
  a case identity only while it holds no version.
rationale: The scope states no cut. The port method and its one relational implementation
  change together, and the operation that calls them is a consumer across a seam,
  so the operation gets a separate task. The version check sits here because this
  is the transaction where a case's versions are read.
sources:
- intake/scope.md
objective: The case store removes a case that holds no case version, together with
  every hypothesis referencing it, every hypothesis-revision of those hypotheses and
  every collect those revisions hold, and refuses to remove a case that holds any
  version.
criteria:
- Deleting through the case store a case that holds no case version leaves the store
  holding no case under that slug.
- Deleting through the case store a case that holds no case version leaves the store
  holding no hypothesis referencing that slug.
- Deleting through the case store a case that holds no case version leaves the store
  holding no hypothesis-revision, draft or released, of a hypothesis that referenced
  that slug.
- Deleting through the case store a case that holds no case version leaves the store
  holding no collect of those hypothesis-revisions.
- Deleting through the case store a case that holds a draft case version is refused
  with a CaseHoldsVersionsError carrying that slug.
- Deleting through the case store a case that holds a released case version is refused
  with a CaseHoldsVersionsError carrying that slug.
- A delete the case store refuses leaves the case still held under its slug.
- A delete the case store refuses leaves every hypothesis referencing that slug, and
  every revision and collect of those hypotheses, still held.
- Deleting through the case store a slug no case holds is refused with a CaseNotFoundError
  carrying that slug.
depends_on:
- task/case-deletion/case-holds-versions-refusal
implements:
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
---

## What it is

A new delete method on ICaseStore and its RelationalCaseStore implementation.
The existence check reuses requireCaseIdentity, and DB failures inside the transaction go through raiseWriteFailure, as the inventory requires.
An accepted delete removes the case together with every hypothesis referencing it, every hypothesis-revision of those hypotheses (released ones included) and every collect those revisions hold, per rules/knowledge/a-case-holding-no-version-may-be-deleted's own statement.

## Notes

REMAINDER, from the specification — clauses describing the HTTP surface and the two errors' own shape (the 409 response, the message naming the slug, the details carrying the slug and nothing else; the 404 response) reach no criterion here. Belongs to task/case-deletion/case-holds-versions-refusal (the 409 shape) and task/case-deletion/delete-case-over-case-lifecycle (the 409 and 404 answers over the surface).
ADVISORY, from the specification — read literally, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's CaseNotFoundError also reaches a case that exists but holds no version; its own Description and the delete rule's own acceptance of that case both say otherwise, so the store's not-found test is whether any case holds the slug, never whether a version answers it. A person should still tighten that rule's wording through /analyse. Its statement also says CaseNotFoundError's details carry "the named slug and version", but a delete names no version — criterion 9's "carrying that slug" is the reading that fits, and no version should be invented to fill the field.
ADVISORY, from the specification — constraints/a-successful-case-deletion-answers-with-no-content (HTTP 204, no body) governs only the accepted branch of task/case-deletion/delete-case-over-case-lifecycle, not this store task.
