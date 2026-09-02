One wrong behavior observed in delivered code, found by this session's /reconcile over
corrective-batch-hotfixes-post-closure-drift: src/http/dto/simulate-hypothesis.dto.ts's
evaluationSchema and evidenceSchema drift from the specification's own vocabulary and required
fields.

Specifically, in src/http/dto/simulate-hypothesis.dto.ts:
1. evaluationSchema's discriminated union (verdict: z.literal('confirmed') / 'refuted' /
   'inconclusive', at three separate branches) hardcodes the three verdict literals instead of
   deriving them from the shared VERDICTS vocabulary already exported by src/investigation/verdict.ts
   -- the same file already imports EVALUATION_REASONS and EVIDENCE_RESULTS from their own shared
   vocabularies for the identical purpose, so this is an inconsistency within the file's own
   pattern, not a new one.
2. evidenceSchema omits fields and concept_description, which domain/investigation/evidence
   requires as the item's own snapshotted semantics -- the same omission the batch's reconciliation
   found in the sibling src/http/dto/simulate-case.dto.ts.

The reconciliation's own finding on the verdict literals: "the verdict vocabulary already has one
declared home in this same codebase ... Typing the three verdicts as inline literals here instead
means a future change to VERDICTS has nothing forcing this schema to follow -- the two can silently
drift apart, and nobody reading this file would know its literals answer to a shared vocabulary at
all." On the evidence fields: the same domain/investigation/evidence departure as
simulate-case.dto.ts's own finding.

Full reconciliation record: siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md --
the specific return is at
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__http__dto__simulate-hypothesis.dto.ts.yaml.

The specification nodes already state these facts (domain/investigation/verdict,
domain/investigation/evidence) -- this is source drifting from an already-stated spec, not a
specification gap.
