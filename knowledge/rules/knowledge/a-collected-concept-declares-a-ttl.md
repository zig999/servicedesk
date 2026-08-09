---
type: policy
statement: Every concept a case collects has a ttl defined in the glossary.
constrains:
  - domain/knowledge/hypothesis
  - domain/glossary/concept
consistency: eventual
---

## Description

The ttl is the strictest freshness tolerance among the cases using the concept; without it the cache has no bound to respect.
