---
title: Fix judgment-stage.ts's misattributed constraint quotation
summary: Corrects the doc comment on judgeOneHypothesis so it no longer presents invented text as a verbatim
  quotation of constraints/hypotheses-are-judged-in-isolated-parallel-calls, with no runtime change.
task: sha256:7046302dfb80c0e1276413d1e8305d8c6c8f7b5727cfbb3701a1a0c646c21459
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-misquoted-constraint-build
files:
- path: src/investigation/judgment-stage.ts
  effect: 'Rewrote the doc comment above judgeOneHypothesis: the parenthetical presenting "a hypothesis
    denied a slot makes no call, so it costs nothing" as a verbatim quotation of the node became the comment
    stating the same consequence in its own voice, unquoted, with a plain citation of the node.'
criteria:
- criterion: 'judgment-stage.ts''s doc comment on judgeOneHypothesis (currently: "...deadline-exceeded
    without ever calling evaluate() (constraints/hypotheses-are-judged-in-isolated-parallel-calls'' own
    \"a hypothesis denied a slot makes no call, so it costs nothing\").") no longer quotes constraints/hypotheses-are-judged-in-isolated-parallel-calls
    for a sentence the node does not hold — either the comment states the consequence in its own voice
    without quotation marks, or it quotes the node''s actual text verbatim.'
  met: true
  how: 'The comment now reads "...deadline-exceeded without ever calling evaluate(): a hypothesis denied
    a slot makes no call, so it costs nothing (constraints/hypotheses-are-judged-in-isolated-parallel-calls)."
    — stated in the comment''s own voice, unquoted, with the node cited plainly rather than quoted.'
- criterion: 'No runtime behavior in src/investigation/judgment-stage.ts changes: the existing test suite
    passes unchanged.'
  met: true
  how: The edit touched only text inside a comment block above the function declaration; no import, type,
    function body, control flow or exported signature was altered.
nodes:
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The comment's citation of this node is now a plain citation rather than a quotation, so the file
    no longer claims the node's text says something it does not.
inferences:
- inferred: The comment states the consequence in its own voice rather than quoting the node's actual
    text verbatim.
  from: The node's statement and fitness hold no sentence about a denied-slot hypothesis costing nothing
    to quote verbatim, so a verbatim-quotation fix was not available without inventing text a second time.
preserved:
- judgeOneHypothesis's control flow (no-data short-circuit, slot acquisition, isolated call, deadline-exceeded
  fallback) is unchanged.
- Every other citation in the surrounding comment blocks of judgment-stage.ts is unchanged.
---

## What it is

A corrective increment, third task of the same initiative: fixes one misattributed verbatim quotation surfaced by /reconcile's third pass over the prior two corrective deliveries.

## Notes

Third task under work/fix-post-case-lifecycle-stale-citations. No decision-log entry: this is a documentation correction removing a false verbatim attribution, not a new fact decided here.
