---
type: invariant
statement: A stored case version, draft or released, is read as a case only while every validator rule holds at the moment it is read; the validator rules are structural as much as coherence ones, so stored content that does not assemble into a whole, well-formed case version at that reading is a validator rule not holding and never a condition of its own; a replay reads the pinned version without revalidation.
constrains:
  - domain/knowledge/case-version
---

## Description

Validation is what decides whether a stored version exists as a case, and it runs at every read — while composing its manifest during authoring and at each load by the engine — with no intermediate gate.
This holds exactly the same way for a version still in draft as for one already released: an incomplete or incoherent draft simply does not read back as a case yet, whether previewed or released against — no separate field marks it "not ready," because failing this same validation already says so. Draft and released answer a different question entirely: not whether a version is coherent, but whether it may yet be diagnosed against (rules/investigation/only-a-released-case-version-is-diagnosed).
Both families of rule are this one validation, and neither is an edge of it. `a-release-refusal-with-no-named-violation-says-so` already names them together — "any structural or coherence rule" — and a read holds that same set: stored content naming a term the glossary does not hold fails a coherence rule, and stored content that does not assemble into a whole, well-formed case version at all — a required attribute the version does not carry, a manifest resolving to no entry, a stored value the declared model does not admit — fails a structural one. Reading the second as a condition of its own would send the composition state this rule already covers, a draft still short of what a case requires, out as something the system did not anticipate; and `a-case-is-read-whole` leaves nothing partial to answer with either way, so what such a read answers is one thing for both families, stated by `a-case-version-failing-validation-at-a-read-is-refused-by-name`.
Replay is the declared exception: an old investigation reads the exact version it pinned, because reproducibility pins content, not current validity.
