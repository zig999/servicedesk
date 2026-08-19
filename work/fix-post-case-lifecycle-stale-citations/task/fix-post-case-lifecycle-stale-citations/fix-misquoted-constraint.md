---
title: Fix judgment-stage.ts's misattributed constraint quotation
summary: Corrects one doc comment in already-delivered code that presents invented text as a verbatim quotation from a specification constraint node, when the node holds no such sentence.
objective: judgment-stage.ts's doc comment on judgeOneHypothesis no longer presents "a hypothesis denied a slot makes no call, so it costs nothing" as verbatim text of constraints/hypotheses-are-judged-in-isolated-parallel-calls, since that node holds no such sentence.
criteria:
  - "judgment-stage.ts's doc comment on judgeOneHypothesis (currently: \"...deadline-exceeded without ever calling evaluate() (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own \\\"a hypothesis denied a slot makes no call, so it costs nothing\\\").\") no longer quotes constraints/hypotheses-are-judged-in-isolated-parallel-calls for a sentence the node does not hold — either the comment states the consequence in its own voice without quotation marks, or it quotes the node's actual text verbatim."
  - "No runtime behavior in src/investigation/judgment-stage.ts changes: the existing test suite passes unchanged."
implements:
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
sources:
  - intake/third-finding.md
---

## What it is

A corrective increment, third task of the same initiative: /reconcile's third pass over the
prior two corrective deliveries surfaced a misquotation unrelated to the citation-identity
confusion those fixed.

## Notes

None.
