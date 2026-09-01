---
type: policy
statement: Every concept a hypothesis-revision collects has a ttl defined in the glossary; a registration that states none takes the default of sixty seconds; a stated ttl is a positive integer, and zero or less is refused the same way a non-integer one already is, distinct from the absent-ttl default.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

The ttl is the strictest freshness tolerance among the cases using the concept; without it the cache has no bound to respect.
