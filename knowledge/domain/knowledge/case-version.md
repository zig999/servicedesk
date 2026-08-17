---
type: aggregate-root
attributes:
  - name: version
    type: integer
    required: true
  - name: title
    type: string
    required: true
  - name: when_to_use
    type: string
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
  - name: state
    type: case-version-state
    required: true
  - name: released_at
    type: datetime
  - name: manifest
    type: manifest-entry
    required: true
    many: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
operations:
  - collection-plan
  - requires-evaluation-of
  - resolve-outcome
  - place-hypothesis
  - remove-hypothesis
  - update-draft
  - release
  - discard
---

## Description

One numbered attempt at a case's troubleshooting procedure, referencing the case it belongs to.
While in draft, its manifest may be freely composed: a hypothesis may be placed at a position, pointing at any of that hypothesis's own revisions, or removed again.
While in draft, its own declared attributes may likewise be corrected, as many times as curation needs — the same freedom its manifest already holds.
Once released, it is never altered again: its own attributes, and every manifest entry's position and referenced revision, stay exactly as they were at the moment of release.
The fallback is a disguised default hypothesis, explicit on purpose: a fallback claims nothing about the world.
The curator may author a consolidation register alongside the hypotheses; absent, the consolidation step keeps whatever register its own adapter defaults to.
released_at is present only once released.

## Responsibility

Compose, through its manifest, the hypothesis revisions this version of the case uses, in precedence order; correct its own declared attributes while draft state holds; and own the resolution logic over the manifest: the collection plan is the deduplicated union of every manifested revision's collects, requires-evaluation-of lists what totality demands, and resolve-outcome gives the first confirmed hypothesis in declared order its outcome, referral and determining role, with the fallback answering when none confirms.
