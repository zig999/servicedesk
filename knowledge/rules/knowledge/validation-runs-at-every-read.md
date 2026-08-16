---
type: invariant
statement: A stored case version, draft or released, is read as a case only while every validator rule holds at the moment it is read; a replay reads the pinned version without revalidation.
constrains:
  - domain/knowledge/case-version
---

## Description

Validation is what decides whether a stored version exists as a case, and it runs at every read — while composing its manifest during authoring and at each load by the engine — with no intermediate gate.
This holds exactly the same way for a version still in draft as for one already released: an incomplete or incoherent draft simply does not read back as a case yet, whether previewed or released against — no separate field marks it "not ready," because failing this same validation already says so. Draft and released answer a different question entirely: not whether a version is coherent, but whether it may yet be diagnosed against (rules/investigation/only-a-released-case-version-is-diagnosed).
Replay is the declared exception: an old investigation reads the exact version it pinned, because reproducibility pins content, not current validity.
