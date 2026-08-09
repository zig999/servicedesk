---
type: policy
statement: Each concept resolves to exactly one capability.
constrains:
  - domain/integration/capability
  - domain/glossary/concept
consistency: eventual
---

## Description

One to one until a second source of the same concept appears; the fallback resolution plan was cut and stays cut until it hurts.
