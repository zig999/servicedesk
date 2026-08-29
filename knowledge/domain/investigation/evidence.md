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
  - name: elapsed_ms
    type: integer
    required: true
  - name: fields
    type: field-semantics
    required: true
    many: true
  - name: concept_description
    type: string
    required: true
relationships:
  - target: domain/integration/capability
    type: reference
    cardinality: "1"
---

## Description

What one collected concept returned, normalized to the glossary's vocabulary and identified within the investigation by its concept.
The absence of data is a recorded fact: a timeout, a denial or an unavailability arrives as a result, never as an exception.
The capability reference pins which registered capability, at which version, produced this observation.
elapsed_ms is how long the collection itself took, in milliseconds, whatever the result — the same unit `domain/investigation/durations` already keeps its own stage totals in. An evidence item collected before this attribute existed reads elapsed_ms as 0, meaning not measured, never a read failure and never an invented duration.
fields and concept_description are this item's own snapshotted semantics — the producing capability's own declared field-by-field meaning and the concept's own declared meaning — exactly as the capability registry and the glossary held them at the moment this item was collected, never re-read afterward. A concept collected before it declared a description snapshots an empty one; a concept whose capability never resolved snapshots no fields at all, the same honest degradation the result itself already records.

## Responsibility

Record one observation per collected concept, with when it was observed, where it came from, how the collection ended, and the semantics that grounded it at that moment.
