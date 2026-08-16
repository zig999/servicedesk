---
type: policy
statement: Every concept a hypothesis-revision collects has a ttl defined in the glossary; a registration that states none takes the default of sixty seconds.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

The ttl is the strictest freshness tolerance among the cases using the concept; without it the cache has no bound to respect.
