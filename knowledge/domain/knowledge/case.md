---
type: aggregate-root
attributes:
  - name: slug
    type: string
    required: true
operations:
  - create-draft
---

## Description

A case's own stable identity, named once and never shared with another case.
It carries nothing beyond that name: every fact a curator once wrote directly onto "the case" — title, when-to-use, subject, fallback, its hypotheses — now belongs to a specific case version or to a hypothesis, each reached only through this identity.

## Responsibility

Name one case for as long as it exists, and originate a new draft version when a curator starts revising it.
