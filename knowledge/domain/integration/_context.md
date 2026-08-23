---
strategic: generic
---

## Description

Access to the external systems: the registered capabilities, their registry, the connector configurations a capability's own connector may name, and the normalization that keeps source-system vocabulary out of the domain.
The systems behind a capability's connector are an open, variable set — one may start existing, another may stop — and nothing outside this context ever needs to know which one currently answers a concept.
Generic by construction — replaceable, and nothing in it is domain knowledge beyond the contract it promises.

## Responsibility

Execute read-only capabilities within the requester's authorization scope and deliver observations already translated to the glossary's vocabulary; hold what an operator registers directly — a capability, a connector configuration — and let one be exercised once, diagnostically, through a capability already committed read-only.
