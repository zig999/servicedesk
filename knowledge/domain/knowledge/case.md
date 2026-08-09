---
type: aggregate-root
attributes:
  - name: slug
    type: string
    required: true
  - name: title
    type: string
    required: true
  - name: when_to_use
    type: string
    required: true
  - name: version
    type: integer
    required: true
  - name: hash
    type: string
    required: true
  - name: subject
    type: domain/glossary/subject-type
    required: true
  - name: fallback
    type: resolution
    required: true
relationships:
  - target: hypothesis
    type: composition
    cardinality: 1..*
operations:
  - collection-plan
  - requires-evaluation-of
  - resolve-outcome
---

## Description

One troubleshooting procedure, authored as one file versioned in git and identified by content: slug, version and hash.
Always published: no draft exists in the domain — work in progress is a git fact, a branch or a pull request, and there is no publication gate to pass.
The fallback is a disguised default hypothesis, explicit on purpose: a fallback claims nothing about the world.

## Responsibility

Declare the hypotheses in precedence order and own the resolution logic: the collection plan is the deduplicated union of every hypothesis's collects, requires-evaluation-of lists what totality demands, and resolve-outcome gives the first confirmed hypothesis in declared order its outcome, referral and determining role, with the fallback answering when none confirms.
