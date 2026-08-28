---
title: Reword the Detail panel's Criterion 6 comment to separate the per-hypothesis fact from the investigation-wide
  fact
summary: Corrects case-simulation-detail-panel.tsx's own header comment, which grouped model, prompt version,
  token usage and elapsed time as one undifferentiated "judgment" set, into two correctly-attributed facts.
task: sha256:4f5f518f659ecb181a6b0d91edd2722b34e763f58dd5753382ad52eda746c11e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/reword-criterion-6-comment-suite
files:
- path: src/routes/case-simulation-detail-panel.tsx
  effect: reworded only the Criterion 6 sentence of the component's header comment, separating usage/elapsed_ms/prompt
    (domain/investigation/evaluation's own per-hypothesis record) from model/prompt_version (domain/investigation/investigation's
    own investigation-wide facts). No other paragraph, no type, no runtime code changed.
criteria:
- criterion: The Criterion 6 paragraph in case-simulation-detail-panel.tsx's own header comment no longer
    groups model, prompt version, token usage and elapsed time as one undifferentiated set belonging to
    "the judgment".
  met: true
  how: the paragraph no longer names a single "judgment" set holding all four fields; it now names two
    separately-attributed groups joined by a semicolon, each naming its own owning specification node,
    proven by src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts.
- criterion: The corrected comment states that usage, elapsed_ms and prompt are domain/investigation/evaluation's
    own call-level record, present per hypothesis evaluation.
  met: true
  how: the paragraph's first clause reads "usage, elapsed_ms and prompt are domain/investigation/evaluation's
    own call-level record, present per hypothesis evaluation", matching the node's own Description.
- criterion: 'The corrected comment states that model and prompt_version are domain/investigation/investigation''s
    own investigation-wide facts, not a per-hypothesis one, consistent with toDetailJudgmentCall''s own
    already-disclosed inference in case-simulation-cockpit-adapters.ts that this screen''s judgment-call
    data always answers `{ called: false }`.'
  met: true
  how: the paragraph's second clause reads "model and prompt_version are domain/investigation/investigation's
    own investigation-wide facts -- one pinned pair per whole investigation, never a per-hypothesis one",
    matching the node's own attribute list; toDetailJudgmentCall's own {called:false} inference is left
    standing, unreferenced by this correction.
- criterion: No line of executable code, no type, and no test in case-simulation-detail-panel.tsx or any
    sibling file changes -- this is a comment-wording correction only.
  met: true
  how: only the JSDoc header comment's Criterion 6 sentence was edited; imports, VERDICT_CELL, the CaseSimulationDetailPanel
    function body and every other file are unchanged, confirmed by the unmodified sibling suite (case-simulation-detail-panel.spec.ts)
    continuing to pass.
nodes:
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  how: the corrected comment now names usage, elapsed_ms and prompt as this node's own call-level record,
    present per hypothesis evaluation, matching the node's Description.
- node: domain/investigation/investigation
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  how: the corrected comment now names model and prompt_version as this node's own investigation-wide
    facts -- one pinned pair per whole investigation, matching the node's own attribute list.
preserved:
- the rest of the header comment's own content -- the reference/inference note about this task's own placement
  choice, the Criterion 7 paragraph, and the Stale-indicator paragraph
- all runtime code (imports, VERDICT_CELL, the CaseSimulationDetailPanel component body and JSX) and all
  types in this file
- every sibling file, untouched
---

## What it is

An implementation record for task/detail-panel-judgment-comment-fix/reword-criterion-6-comment.
A documentation-only correction to case-simulation-detail-panel.tsx's own header comment.

## Notes

None.
