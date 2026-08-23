---
type: invariant
statement: A curator refused a release is always told why; where release finds no rule specifically violated, it says so explicitly rather than leaving the curator with an unexplained, empty refusal.
constrains:
  - domain/knowledge/case-version
---

## Description

Release aggregates every violated rule into the one refusal (contracts/knowledge/case-lifecycle) — a mechanism that presupposes there is always something to name. Where that assumption still fails and nothing is named, the refusal owes the curator an explicit statement that no specific violation was identified, never a bare, unexplained empty list standing in its place.
