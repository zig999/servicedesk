---
type: invariant
statement: A surface authoring a new case issues no read against the slug the curator has typed before submitting create-draft; the curator's own typed slug is the only thing the surface holds about the case's identity until create-draft answers.
constrains:
  - domain/knowledge/case
---

## Description

There is nothing such a read could tell the surface that would change what it does. rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug already settles both branches create-draft can take on the slug the curator names: where no case holds it, create-draft creates one; where a case already holds it, create-draft originates that case's next draft instead — neither branch is a refusal, so a slug the curator typed never has a wrong answer for the surface to warn about in advance. A read that answered "no case holds this slug" would confirm exactly what submitting achieves; a read that answered "a case already holds this slug" would name a condition the act already handles rather than one the curator has to avoid.

Reading anyway would cost the surface a call whose answer changes nothing it does, and would put the surface in the business of judging a slug's availability — a judgment rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug already places entirely on create-draft itself. This rule states only that no such read is issued; what the surface withholds while required content is absent, and how it withholds it, are rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent's own.
