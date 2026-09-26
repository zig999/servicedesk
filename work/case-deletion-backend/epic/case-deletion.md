---
title: Case deletion
summary: The delete act of the Case aggregate, accepted for a case that holds no version
  and refused for one that holds any.
rationale: The scope asks for one operation on one aggregate, so one epic groups it.
  Its covers are the nodes the scope names, plus the system constraints that decide
  how the operation's refusals and its domain module are shaped.
sources:
- intake/scope.md
covers:
- domain/knowledge/case
- domain/knowledge/case-version
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- scenarios/knowledge/a-case-holding-no-version-is-deleted
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/the-domain-depends-on-no-infrastructure
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- constraints/a-successful-case-deletion-answers-with-no-content
---

## What it is

The backend half of ending a case's identity once every draft it held has been discarded.
It covers the refusal that names a case still holding a version, the store's removal of a case that holds none, and the delete act published on the case-lifecycle surface.

## Notes

The frontend affordance for this act is a separate scope under case-deletion-frontend and is not claimed here.
