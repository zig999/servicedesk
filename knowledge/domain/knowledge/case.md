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
  - name: authored_at
    type: datetime
    required: true
  - name: subject
    type: domain/glossary/subject-type
    required: true
  - name: fallback
    type: resolution
    required: true
  - name: consolidation_register
    type: consolidation-register
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

One troubleshooting procedure, identified by slug and version, each version written once and never altered, carrying when it was authored.
Always published: no draft exists in the domain, because a version that does not validate is not a case at all — validation at every read is the whole of the gate, and there is no publication state to set.
The fallback is a disguised default hypothesis, explicit on purpose: a fallback claims nothing about the world.
The curator may author a consolidation register alongside the hypotheses; absent, the consolidation step keeps whatever register its own adapter defaults to.

## Responsibility

Declare the hypotheses in precedence order and own the resolution logic: the collection plan is the deduplicated union of every hypothesis's collects, requires-evaluation-of lists what totality demands, and resolve-outcome gives the first confirmed hypothesis in declared order its outcome, referral and determining role, with the fallback answering when none confirms.
