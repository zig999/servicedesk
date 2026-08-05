---
title: Every collected concept declares a ttl
summary: How stale a fact may be is stated by the concept, not assumed by whoever reads it.
ddd: invariant
statement: Every concept a case names MUST declare a ttl in the glossary.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/glossary/concept
examples:
  - Given a case naming a concept whose glossary entry has no ttl, when it is published, then publication is refused.
---

## What it is

The ttl is the strictest tolerance among the cases that use the concept, so a case more tolerant than that simply gets less benefit and never a staler fact than it accepts.

## Rules

None.
