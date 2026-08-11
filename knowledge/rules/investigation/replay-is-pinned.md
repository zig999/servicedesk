---
type: invariant
statement: An investigation pins its replay — the case by slug and version, the model, the prompt version and the evidence.
constrains:
  - domain/investigation/investigation
---

## Description

Judgment is non-deterministic and models and prompts change; the pins are what make an audit read what actually ran.
Slug and version name one content without a digest over it, because a case version is written once and never altered.
