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
  - name: usage
    type: usage
  - name: elapsed_ms
    type: integer
  - name: prompt
    type: string
---

## Description

One hypothesis's judgment, identified by the hypothesis name within the pinned case — a name and not a model reference, because a hypothesis lives inside the case aggregate and is reached only through its root.
Judgment is a non-deterministic domain operation; the guarantee the domain offers is not correctness but being cited and complete.
Usage, elapsed_ms and prompt are the call's own record — what the provider charged, how long the call took, and the judgment prompt as the call actually materialized it — present exactly when a call happened, absent when reason `no-data` means judgment was never called at all.

## Responsibility

Carry one verdict per hypothesis, its citations when decided and its reason when inconclusive.
