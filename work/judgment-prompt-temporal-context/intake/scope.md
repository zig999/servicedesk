# Scope — corrective increment

## Wrong behavior

The judgment prompt `AnthropicHypothesisEvaluator` sends to the model for every hypothesis
evaluation does not state the relationship between an evidence item's `<observation>` — the
data being validated — and its `<fields>`, `<concept_description>` and
`<capability_payload_notes>`, which exist only to help read that data. It also gives the
judging model no temporal reference at all: no current date/time, and no per-item
observed-at/freshness information, even though that information is already collected and
already shown to a human reviewer on the Simulate screen's EVIDENCE tab. A criterion that
depends on recency, staleness, or how long an observation has been considered fresh cannot be
judged correctly today, because the model is never told when "now" is or when the observation
was captured.

## Reproduction

1. Open `http://localhost:5199/cases/perfil-mobile-tecnico-probe/versions/5/simulate`.
2. Fill the subject fields and click SIMULATE CASE.
3. Select a hypothesis with a result and open its PROMPT tab.
4. Read the `<judgment_input>` sent as the user message, and the fixed system prompt
   (`SYSTEM_PROMPT` in the file below) sent alongside it: neither states what `<observation>`
   is for relative to the rest of the block, and neither carries any date/time.

## File

`src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts`

## Approved proposal

The full analysis and the proposed corrected `SYSTEM_PROMPT` text, reviewed and approved by the
human, is at `intake/proposal.md` (copied from `temp/2026-09-18-judgment-system-prompt-proposal.md`
at the time this increment was opened).
