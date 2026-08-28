---
title: Proof for reword-criterion-6-comment
summary: Proves case-simulation-detail-panel.tsx's own Criterion 6 comment now separately attributes usage/elapsed_ms/prompt
  to domain/investigation/evaluation and model/prompt_version to domain/investigation/investigation, no
  longer groups the four as one "judgment" set, and that this rewording changed no executable code --
  following the same source-text-reading convention cases-list-screen-comment-cites-the-current-nodes.spec.ts
  already established for a comment-prose criterion.
implementation: sha256:b025558c64f1fb962521d88a1a86199cc0887e1d2ab2d331ba3c62d840c9e13e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/reword-criterion-6-comment-suite
tests:
- file: src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  name: case-simulation-detail-panel.tsx's own Criterion 6 comment > no longer groups model, prompt version,
    token usage and elapsed time as one undifferentiated set belonging to "the judgment"
  proves: The Criterion 6 paragraph in case-simulation-detail-panel.tsx's own header comment no longer
    groups model, prompt version, token usage and elapsed time as one undifferentiated set belonging to
    "the judgment".
  fails_when: the paragraph again contains the old conflating phrase ("the judgment's model, prompt version,
    token usage and elapsed time") or any reordering of that same undifferentiated grouping, or the extraction
    itself silently collapses to a string missing the still-present anchor phrase "renders inside the
    Evidence tab"
- file: src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  name: case-simulation-detail-panel.tsx's own Criterion 6 comment > states that usage, elapsed_ms and
    prompt are domain/investigation/evaluation's own call-level record, present per hypothesis evaluation
  proves: The corrected comment states that usage, elapsed_ms and prompt are domain/investigation/evaluation's
    own call-level record, present per hypothesis evaluation.
  fails_when: the paragraph stops naming domain/investigation/evaluation, or stops attributing usage/elapsed_ms/prompt
    to that node's own per-hypothesis call-level record in those terms
- file: src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  name: case-simulation-detail-panel.tsx's own Criterion 6 comment > states that model and prompt_version
    are domain/investigation/investigation's own investigation-wide facts, not a per-hypothesis one
  proves: The corrected comment states that model and prompt_version are domain/investigation/investigation's
    own investigation-wide facts, not a per-hypothesis one.
  fails_when: the paragraph stops naming domain/investigation/investigation, stops attributing model/prompt_version
    to that node's own investigation-wide fact, or drops the "one pinned pair per whole investigation,
    never a per-hypothesis one" qualification
- file: src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  name: 'that separation stays consistent with toDetailJudgmentCall''s own already-disclosed inference
    (case-simulation-cockpit-adapters.ts) > still answers { called: false }, never fabricating a model
    or prompt_version value for either investigation-wide field'
  proves: 'the corrected comment''s attribution is consistent with toDetailJudgmentCall''s own already-disclosed
    inference in case-simulation-cockpit-adapters.ts that this screen''s judgment-call data always answers
    `{ called: false }`'
  fails_when: 'toDetailJudgmentCall() stops answering exactly `{ called: false }` -- e.g. it starts fabricating
    a model or prompt_version value that this delivery''s data never held'
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: (pre-existing, unmodified by this task) -- the full describe/it suite exercising CaseSimulationDetailPanel's
    rendered behavior
  proves: No line of executable code, no type, and no test in case-simulation-detail-panel.tsx or any
    sibling file changes -- this is a comment-wording correction only.
  fails_when: any executable line, type or JSX structure this suite exercises had actually changed
untested:
- That case-simulation-detail-panel.spec.ts's full suite actually re-executes green after this change
  was confirmed by the captured suite run (run/reword-criterion-6-comment-suite), not left to direct reading
  alone.
---

## What it is

The proof record for task/detail-panel-judgment-comment-fix/reword-criterion-6-comment. Follows
cases-list-screen-comment-cites-the-current-nodes.spec.ts's own established convention for proving
a JSDoc comment's own prose against the specification nodes it cites.

## Notes

None.
