---
title: Reword the Detail panel's Criterion 6 comment to separate the per-hypothesis fact from the investigation-wide
  one
summary: Corrects case-simulation-detail-panel.tsx's own header comment, which currently groups model,
  prompt version, token usage and elapsed time as one undifferentiated "judgment" set, into two correctly-attributed
  facts.
rationale: 'Cut as a corrective increment: siegard-reconcile/reconcile-hypothesis-evaluations-staleness-widening.md''s
  own conformance judgment found that this comment''s wording is imprecise against domain/investigation/evaluation
  (which names only usage, elapsed_ms and prompt as the call''s own per-hypothesis record) -- model and
  prompt_version are domain/investigation/investigation''s own investigation-wide facts, never named as
  such in the comment. This is a documentation-only fix answering to no criterion any prior task held,
  surfaced by reconciliation rather than by running the system.'
sources:
- intake/scope.md
objective: case-simulation-detail-panel.tsx's own Criterion 6 comment states, correctly and separately,
  which fields are a per-hypothesis fact (domain/investigation/evaluation) and which are the whole investigation's
  own value (domain/investigation/investigation), with no runtime, type or test change.
criteria:
- The Criterion 6 paragraph in case-simulation-detail-panel.tsx's own header comment no longer groups
  model, prompt version, token usage and elapsed time as one undifferentiated set belonging to "the judgment".
- The corrected comment states that usage, elapsed_ms and prompt are domain/investigation/evaluation's
  own call-level record, present per hypothesis evaluation.
- 'The corrected comment states that model and prompt_version are domain/investigation/investigation''s
  own investigation-wide facts, not a per-hypothesis one, consistent with toDetailJudgmentCall''s own
  already-disclosed inference in case-simulation-cockpit-adapters.ts that this screen''s judgment-call
  data always answers `{ called: false }`.'
- No line of executable code, no type, and no test in case-simulation-detail-panel.tsx or any sibling
  file changes -- this is a comment-wording correction only.
implements:
- domain/investigation/evaluation
- domain/investigation/investigation
---

## What it is

The corrective task rewording case-simulation-detail-panel.tsx's own Criterion 6 comment to
correctly separate a per-hypothesis fact from an investigation-wide one, per the finding
/reconcile surfaced against it.

## Notes

None.
