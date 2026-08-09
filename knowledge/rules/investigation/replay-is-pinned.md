---
type: invariant
statement: An investigation pins its replay — the case by slug, version and hash, the model, the prompt version and the evidence.
constrains:
  - domain/investigation/investigation
---

## Description

Judgment is non-deterministic and models and prompts change; the pins are what make an audit read what actually ran.
