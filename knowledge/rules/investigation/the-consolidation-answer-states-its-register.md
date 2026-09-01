---
type: invariant
statement: A consolidation call's answer states the one register that call used to produce the text — the pinned case version's own declared register where it holds one, the register the consolidation adapter defaulted to where the version declares none — alongside the text and that call's own usage, elapsed_ms and prompt.
constrains:
  - domain/investigation/assessment-consolidator
  - domain/investigation/assessment
---

## Description

The register is settled inside the call: where the pinned case version declares one it is that one, and where it declares none only the adapter that ran knows which register it kept (`domain/knowledge/case-version`).
`domain/investigation/assessment` requires a register on every assessment, so an answer returning the text without naming the register it was written in leaves that required field unfillable in exactly the case the adapter's own default covers.
The register rides the same answer as the text, the usage, the elapsed_ms and the prompt — one answer carrying everything the one writing call produced — and it is stated in both cases, not only the default one, so a caller reads one answer shape rather than deducing which side supplied the register this time.
