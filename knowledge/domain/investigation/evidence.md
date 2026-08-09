---
type: value-object
attributes:
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: inputs
    type: string
    required: true
  - name: observation
    type: string
    required: true
  - name: observed_at
    type: datetime
    required: true
  - name: ttl
    type: integer
    required: true
  - name: origin
    type: string
    required: true
  - name: result
    type: evidence-result
    required: true
  - name: result_detail
    type: string
relationships:
  - target: domain/integration/capability
    type: reference
    cardinality: "1"
---

## Description

What one collected concept returned, normalized to the glossary's vocabulary and identified within the investigation by its concept.
The absence of data is a recorded fact: a timeout, a denial or an unavailability arrives as a result, never as an exception.
The capability reference pins which registered capability, at which version, produced this observation.

## Responsibility

Record one observation per collected concept, with when it was observed, where it came from and how the collection ended.
