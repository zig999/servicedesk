# Correct the Detail panel's Criterion 6 comment wording

`src/routes/case-simulation-detail-panel.tsx`'s own header comment (Criterion 6 paragraph, lines
23-24) reads "Criterion 6 (the judgment's model, prompt version, token usage and elapsed time)
renders inside the Evidence tab, beneath the evidence list" -- grouping model, prompt version,
token usage and elapsed time as one undifferentiated set belonging to "the judgment".

This is imprecise against the specification: `domain/investigation/evaluation` names only usage,
elapsed_ms and prompt as "the call's own record" -- a per-hypothesis fact. `model` and
`prompt_version` are `domain/investigation/investigation`'s own investigation-wide facts (one
pinned pair per whole investigation), not part of a per-hypothesis evaluation. A reader taking the
comment at its word looks for a per-hypothesis model/prompt-version field the specification never
put there.

## Where this came from

Surfaced by `siegard-reconcile/reconcile-hypothesis-evaluations-staleness-widening.md`'s own
finding against `domain/investigation/evaluation` (case-simulation-detail-panel.tsx, one of its
four files) -- see that record for the finding's own full text and evidence quotes.

## What this correction changes

A pure comment-wording correction: reword the Criterion 6 paragraph to state that usage,
elapsed_ms and prompt are the call's own per-hypothesis record (`domain/investigation/evaluation`),
and that model/prompt_version, where they appear on this screen, are the whole investigation's own
value (`domain/investigation/investigation`) rather than a per-hypothesis fact -- consistent with
`toDetailJudgmentCall`'s own already-disclosed inference in case-simulation-cockpit-adapters.ts
that this screen's judgment-call data always answers `{ called: false }` since neither dispatch
hook returns a model or prompt_version. No runtime behavior, no type, no test changes are
expected -- this is a documentation-only correction to already-delivered source.

## Human authorization

The human confirmed proceeding with this corrective increment after being shown the finding and
its explanation.
