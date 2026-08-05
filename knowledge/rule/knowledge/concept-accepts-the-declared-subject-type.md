---
title: A collected concept accepts the case's subject type
summary: A case cannot ask for a fact that does not apply to the kind of thing it investigates.
ddd: invariant
aggregate: cases
statement: Every concept a case collects MUST accept the type of subject that case declares.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/case
  - definition/glossary/concept
consistency: immediate
examples:
  - Given a case whose subject type is customer, when it collects the state of the equipment, then publication is refused.
---

## What it is

This is what keeps the subject a dimension of the case rather than a decision fixed for the whole system.
Whatever a capability needs to derive from the subject it derives internally, so the case never carries the derivation.

## Rules

None.
