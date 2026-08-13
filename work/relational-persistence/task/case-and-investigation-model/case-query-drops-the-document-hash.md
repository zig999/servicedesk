---
title: The published case read stops carrying a document hash
summary: ReadCaseResult and readCase drop the hash field contracts/knowledge/case-query and rules/investigation/replay-is-pinned no longer provide for; run-diagnosis.ts's own header comment stops describing the case pin as content-based.
sources:
  - intake/case-query-and-run-diagnosis-drop-the-hash-pin.md
objective: "case-query.port.ts's ReadCaseResult and case-query.service.ts's readCase stop returning a document hash that the published contract and the replay rule no longer state, and run-diagnosis.ts's own module header comment stops describing the case this pipeline runs as pinned by content."
criteria:
  - ReadCaseResult (case-query.port.ts) declares no hash field, and readCase's return (case-query.service.ts) carries no hash.
  - Every real caller of readCase (diagnose.controller.ts, seed.ts) is unaffected, since none reads a hash off its result today.
  - run-diagnosis.ts's own module header comment describes the case this pipeline runs as pinned by slug and version, never by content.
implements:
  - contracts/knowledge/case-query
  - rules/investigation/replay-is-pinned
  - domain/investigation/investigation
---

## What it is

The reconciliation between a stale trace binding surfaced by `/reconcile` and the source it flagged: three files that outlived the delivery which last touched them still carry a document-hash pin the specification retired.
Two files drop a real field; the third corrects a comment that has been wrong since the pin itself changed.

## Notes

REMAINDER, from the specification — rules/investigation/replay-is-pinned's statement pins four things: the case by slug and version, the model, the prompt version and the evidence. This task's criteria reach only the case-by-slug-and-version clause; the other three are not touched by any criterion here — they are already the unchanged attributes task/case-and-investigation-model/investigation-record-shape's own delivery record states buildInvestigation already copies straight through.
ADVISORY, from the specification — criterion 3 is governed by domain/investigation/investigation and rules/investigation/replay-is-pinned, both already in this task's implements, which directly contradict run-diagnosis.ts's own "pinned by content" header language. That header also cites contracts/investigation/case-source, whose own Description states the exact phrase the header needs ("pinned by slug and version at the start of the request") more precisely than either of the two nodes above — and it is the node the reconcile judgment that surfaced this task actually flagged as non-conforming for run-diagnosis.ts — but it sits under epic/service-on-the-database's own covers, not this epic's.
Decision, beyond the covers — stand: contracts/investigation/case-source is named only to point at the more precise citation run-diagnosis.ts's header could carry; this task's own implements is satisfied by domain/investigation/investigation and rules/investigation/replay-is-pinned without reaching into service-on-the-database's claim, and the fix itself (rewriting "pinned by content" to "pinned by slug and version") does not require citing case-source specifically to be correct.
