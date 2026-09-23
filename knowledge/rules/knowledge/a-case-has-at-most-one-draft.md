---
type: policy
statement: A case has at most one version in draft state at a time; create-draft asked of a case that already holds a draft is refused with an HTTP 409 response reporting a CaseAlreadyHasDraftError, whose message names the case slug and whose details carry that slug and nothing else.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A case's next version number is assigned the moment its draft is created, not at release; two drafts open at once would have nothing to decide which claims that number.
Revising a case is therefore always one working copy at a time, resolved to released or discarded before another draft may begin.

What the refusal discloses stands here rather than in the code alone: a curator who meets it learns which case already holds a draft, and what this system tells whoever asked is a fact of the business rather than a detail nobody outside a file could otherwise find.
The slug alone is that disclosure because it is the whole of the case's identity to the curator who named it; the draft's own version number is nothing they must know to act, since the act open to them is to resolve the draft that case already holds, whichever number it carries.
