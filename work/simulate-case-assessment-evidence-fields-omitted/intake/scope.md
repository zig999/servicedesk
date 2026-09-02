One wrong behavior observed in delivered code, found by this session's /reconcile over
corrective-batch-hotfixes-post-closure-drift: the SimulateCaseResponseDto's response schema in
src/http/dto/simulate-case.dto.ts omits fields the specification requires on every
case-simulation response.

Specifically, in src/http/dto/simulate-case.dto.ts:
1. assessmentSchema (lines ~91-96) declares only outcome, referral, determining_hypothesis, text
   -- it omits register, usage, elapsed_ms and prompt, which domain/investigation/assessment
   requires on every assessment (a consolidation call always runs and always settles on some
   register).
2. evidenceSchema (lines ~66-78) omits fields and concept_description, which
   domain/investigation/evidence requires as the item's own snapshotted semantics (the
   capability's declared field-by-field meaning and the concept's own description at collection
   time).

The reconciliation's own finding: "contracts/investigation/case-simulation exists to hand the
curator the detail a customer never sees ... This schema declares none of the four
[register/usage/elapsed_ms/prompt], so a caller typed against SimulateCaseResponseDto has no way
to read the consolidation call's register, token spend, duration or materialized prompt, even
though src/investigation/assessment.ts and the persisted record already carry all eight required
attributes." And for evidence: "fields and concept_description are the item's own snapshotted
semantics ... exactly the traceability a curator running simulate-case needs to judge what
grounded a verdict. Neither key is declared here."

Full reconciliation record: siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md --
the specific returns are at
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__http__dto__simulate-case.dto.ts.yaml.

The specification nodes already state these facts (domain/investigation/assessment,
domain/investigation/evidence) -- this is source drifting from an already-stated spec, not a
specification gap.
