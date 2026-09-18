---
title: Judgment prompt states observation semantics and carries temporal context
summary: Fixes the hypothesis-judgment system prompt and judgment_input assembly in AnthropicHypothesisEvaluator
  to state the observation-versus-interpretation relationship, isolate multiple evidence items, and carry
  current time plus each item's own observed-at/ttl.
objective: The hypothesis-judgment system prompt AnthropicHypothesisEvaluator sends states plainly that
  an evidence item's observation is the data validated against the criterion, that fields/concept_description/capability_payload_notes
  are only aids for reading that data, and that multiple evidence items are evaluated in isolation from
  each other; and the judgment_input it builds carries the current UTC time and each evidence item's own
  observed-at/ttl, so a criterion depending on recency or staleness becomes judgeable.
criteria:
- The system prompt states that an evidence item's <observation> is the data validated against the <criterion>,
  and that its <fields>, <concept_description> and <capability_payload_notes> exist only to help read
  that data, never as evidence in themselves.
- The system prompt states that <observation> is a JSON-encoded string to parse before checking its values
  against the criterion.
- The system prompt states that when <evidence> carries more than one <item>, each is evaluated independently,
  and a field's value from one item is never attributed to another item, even where both declare a field
  of the same name.
- The judgment_input the evaluator builds carries a top-level element stating the current date and time
  in UTC at the moment the judgment is requested.
- The judgment_input the evaluator builds carries, for each evidence item, the UTC instant that item's
  observation was captured and how many seconds it was considered fresh for, both taken from that same
  evidence item's own already-collected observed_at and ttl.
- The system prompt states that the current-time element and each item's own captured-at/freshness elements
  are context for reasoning about recency and staleness, used together whenever the criterion depends
  on either, and are never themselves citable evidence.
- 'Existing behavior is unchanged for a criterion that does not depend on recency or staleness: the response
  format contract (the three verdict shapes, and citation validity against an item''s own <field> elements)
  is untouched by this task.'
implements:
- constraints/the-judgment-prompt-is-closed
- domain/investigation/hypothesis-evaluator
- domain/investigation/evidence
- domain/investigation/citation
- domain/investigation/verdict
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/judgment-reads-the-current-instant-fresh
- rules/investigation/an-observation-is-recorded-as-json-object-text
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-decided-evaluation-cites-evidence
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
sources:
- intake/scope.md
- intake/proposal.md
---

## What it is

The corrective fix making the hypothesis-judgment system prompt state what an evidence item's
observation is for relative to its interpretive fields, isolating multiple evidence items from
each other, and carrying current time and each item's own observed-at/ttl into the judgment_input.

## Notes

UNDERDETERMINED, from the specification — rules/investigation/judgment-reads-the-current-instant-fresh's
clause "never one instant shared across two separate judgment requests for the same hypothesis" is not
reached by any criterion as written. Criterion 4 asks only that judgment_input carry the current date and
time in UTC at the moment the judgment is requested, which a single clock read per evaluate call satisfies
on the first request while the rule refuses the reuse on the second — the second request being real, since
rules/investigation/a-citation-stays-within-the-hypothesis-collects has the adapter refuse a foreign citation
and retry. An evaluator that reads the clock once per evaluate call, assembles judgment_input once, and
re-sends that same assembled input — carrying that same current-time element — on the retry that answers
a refused foreign citation satisfies every criterion as written while the specification refuses it: each
retry's own evaluate call must read the clock fresh for itself.
REMAINDER, from the specification — clauses of constraints/the-judgment-prompt-is-closed's statement that
reach no criterion of this task: that the prompt contains only one hypothesis's criterion, that it carries
the pinned case's title and when_to_use, that its content sits in a delimited data block with no tool calling
available to the model, and that prompt assembly makes no live read of the glossary or the capability registry.
Belongs to the already-delivered judgment-prompt assembly work in the investigation act (the closed-block,
case-context and no-live-read increments), not this corrective increment.
REMAINDER, from the specification — the clauses of rules/investigation/an-inconclusive-evaluation-declares-its-reason's
statement that distinguish a no-data reason citing evidence whose result is not ok, and that hold a well-formed
inconclusive verdict returned within its deadline to declare not-grounded rather than judgment-failure, reach
no criterion of this task: criterion 7 preserves only the three verdict shapes and citation validity as the
prompt states them, not the adapter's classification of how a judgment ended. Belongs to the already-delivered
judgment-invocation and failure-handling work in the investigation act.
ADVISORY, from the specification — rules/investigation/judgment-does-not-infer states that its instruction
(evidence grounds verdicts, absence of ground is a reason) is fixed in the judgment prompt, and no criterion
of this task preserves it. It is not named in implements because no criterion implements it, but the task
rewrites the very system prompt that carries it; a rewrite dropping the no-inference instruction would pass
every criterion as written.
ADVISORY, from the specification — domain/investigation/hypothesis-evaluator's own Responsibility text was
synchronized during this task's binding to also name each evidence item's observed_at and ttl and the current
instant, alongside the fields it already enumerated, so it no longer reads as drift left by the /analyse
widening this task's criteria required. No entry was added to the specification's own log of decided facts: nothing was decided, only
prose brought to agree with facts already stated elsewhere.
