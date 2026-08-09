---
type: value-object
attributes:
  - name: hypothesis
    type: string
    required: true
  - name: verdict
    type: verdict
    required: true
  - name: reason
    type: evaluation-reason
  - name: citations
    type: citation
    many: true
---

## Description

One hypothesis's judgment, identified by the hypothesis name within the pinned case — a name and not a model reference, because a hypothesis lives inside the case aggregate and is reached only through its root.
Judgment is a non-deterministic domain operation; the guarantee the domain offers is not correctness but being cited and complete.

## Responsibility

Carry one verdict per hypothesis, its citations when decided and its reason when inconclusive.
