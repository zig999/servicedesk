---
type: aggregate-root
attributes:
  - name: slug
    type: string
    required: true
  - name: next_version
    type: integer
    required: true
operations:
  - create-draft
---

## Description

A case's own stable identity, named once and never shared with another case.
Almost everything a curator once wrote directly onto "the case" — title, when-to-use, subject, fallback, its hypotheses — now belongs to a specific case version or to a hypothesis, each reached only through this identity. The one exception is next_version: the number this case's next draft is assigned, always greater than every version number this case has ever held, including one later discarded — a fact of the identity itself, since it must survive the deletion of any one case version without ambiguity.

## Responsibility

Name one case for as long as it exists, hold the one counter that assigns its next draft's version number, and originate a new draft version when a curator starts revising it.
