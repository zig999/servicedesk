---
title: A stated draft marked stale once its link or operation moves
summary: A stated draft carries the link and operation it was generated for and is stated as stale from the moment the helper's link or chosen operation differs from either, the act applying it still offered.
rationale: I cut staleness apart from the apply path because it changes for a different reason -- what the surface currently holds, not what a write does -- and because it is falsifiable with no field ever being written.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: A draft standing on the surface is stated as stale exactly when the helper's current link or chosen operation differs from the ones the draft was generated for, and applying it remains offered while stale.
criteria:
- A stated draft is marked with the link of the request that produced it, exactly as that request named it.
- A stated draft is marked with the operation of the request that produced it, exactly as that request named it.
- While the helper's link and its chosen operation both equal the ones the stated draft was generated for, that draft is not stated as stale.
- From the moment the helper's link differs from the one the stated draft was generated for, that draft is stated as stale.
- From the moment the helper's chosen operation differs from the one the stated draft was generated for, that draft is stated as stale.
- A draft stated as stale still offers the act applying its input_schema and the act applying its output_schema.
- Staleness is read by comparing the stated outcome's own recorded request against the helper's current link and chosen operation, and no separate stale flag is stored.
depends_on:
- task/schema-draft-applied-to-the-capability-edit/schema-fields-written-only-by-applying
reference:
- frontend/app/src/hooks/use-capability-schema-helper.ts
- frontend/app/src/hooks/use-connector-configuration-helper.ts
implements:
- rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
- scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale
---

## What it is

The marking that keeps an operator from reading a draft as an answer about an operation they have since moved away from, while leaving the draft itself and the act applying it exactly as they were.
The staleness reading is computed from what the outcome already records, the way the inventory records the sibling helper computing its own.

## Notes

The dependency on the apply task exists because one criterion here is about the apply act still being offered; it says nothing about when either task runs.
UNDERDETERMINED, from the specification -- scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale states that a stated draft stands marked stale while the helper holds no chosen operation at all, even where its link is the one the draft was generated for; no criterion of this task reaches that -- every criterion is phrased as the helper's link or chosen operation "differs from" the one the draft was generated for, which does not reach a helper holding none.
REMAINDER, from the specification -- Two clauses of the bound scenario -- that the helper holds no chosen operation from the moment its named link changes, and that the draft-request act is then withheld, stating that it waits on a chosen operation -- reach no criterion of this task; they are facts about the helper's own choice state and request gating, not about a stated draft's staleness marking.
ADVISORY, from the specification -- Criterion 7's "no separate stale flag is stored" is a derivation mechanism no candidate states; it contradicts nothing the bound rule fixes.
ADVISORY, from the specification -- What the two applying acts named in criterion 6 actually do is stated by rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit and rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival, both bound by the sibling apply task; this task owes only that the offers remain while stale, not the applying behavior itself.
