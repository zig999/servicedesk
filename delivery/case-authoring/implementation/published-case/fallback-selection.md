---
title: "Fallback selection between a case's two declared resolutions"
summary: "A pure selection that, given a published case, its evaluations and its investigation's evidence, yields no fallback where a hypothesis confirmed and otherwise the case's own hypotheses-exhausted or no-data resolution, chosen from the evidence results alone."
task: sha256:38766e1a770434290a875f7c82208874ee9b16599a40470df954efd751493114
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/investigation/evidence.ts
    effect: "declares EvidenceResult (ok | unavailable | denied | timeout) and the minimal Evidence shape this selection reads — concept and result, read-only, no constructor — deferring the node's remaining attributes to whichever task builds an evidence from a collection attempt"
  - path: src/knowledge/fallback-selection.ts
    effect: "declares selectFallback(publishedCase, evaluations, evidence), which returns undefined when any evaluation confirmed and otherwise returns publishedCase.hypothesesExhaustedFallback when every evidence carries ok or publishedCase.noDataFallback when any evidence carries a result other than ok"
criteria:
  - criterion: "A case in which no hypothesis confirms and whose every evidence carries ok resolves to the hypotheses-exhausted fallback it declares."
    met: true
    how: "everyEvidenceIsOk(evidence) returns true when every item's result is 'ok', and selectFallback returns publishedCase.hypothesesExhaustedFallback in that branch"
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a timeout resolves to the no-data fallback it declares."
    met: true
    how: "a single 'timeout' result makes evidence.every(...) false, so selectFallback falls through to publishedCase.noDataFallback"
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries an unavailability resolves to the no-data fallback it declares."
    met: true
    how: "the same .every check fails identically for a single 'unavailable' result, yielding publishedCase.noDataFallback"
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a denial resolves to the no-data fallback it declares."
    met: true
    how: "the same .every check fails identically for a single 'denied' result, yielding publishedCase.noDataFallback"
  - criterion: "A case in which no hypothesis confirms and one of whose evidences carries a result other than ok while every other carries ok resolves to the no-data fallback it declares."
    met: true
    how: "everyEvidenceIsOk uses Array.every, so it is false the moment one item fails the ok check regardless of how many others pass it — the implementation never requires every evidence to be non-ok, only that not all of them are ok"
  - criterion: "The resolution this selection yields is one of the two fallbacks the case declares."
    met: true
    how: "the only two return expressions in the non-confirmed branch are publishedCase.hypothesesExhaustedFallback and publishedCase.noDataFallback, read back unchanged from the case rather than constructed; nothing else is ever returned in that branch"
  - criterion: "A case in which one hypothesis confirms yields no fallback from this selection."
    met: true
    how: "anyHypothesisConfirmed(evaluations) checks evaluation.verdict === 'confirmed' across the list; selectFallback returns undefined immediately when it is true, before either fallback is considered"
nodes:
  - node: definition/knowledge/case
    how: "consumed via the existing src/knowledge/case.ts Case type; this delivery adds no field to it and reads only its two already-declared fallback resolutions unchanged. The version-derivation gap the task waives plays no part in this selection and is not touched"
  - node: definition/knowledge/resolution
    how: "consumed via the existing src/knowledge/resolution.ts Resolution type as selectFallback's return type; no new fact about a resolution is declared, and none is constructed — the function only chooses between two already-frozen instances the case holds"
  - node: definition/investigation/evaluation
    how: "consumed via the existing src/investigation/evaluation.ts Evaluation type to decide whether any hypothesis confirmed, reading only the verdict field; nothing here redeclares or reinterprets the evaluation shape"
  - node: definition/investigation/evidence
    encoded_at:
      - src/investigation/evidence.ts
    how: "declared to the minimal shape this selection needs — concept and the result vocabulary (ok, unavailable, denied, timeout) taken verbatim from the node's enum. The three waived gaps (observation, inputs, retention) are left undeclared, as is the capability-by-identity attribute, since no identity type for a capability exists anywhere in the tree yet and inventing one would be a fact this task was not asked to supply; the doc comment on the module says so and points the remaining shape at the task that builds an evidence from a collection attempt"
  - node: rule/knowledge/the-fallback-follows-what-the-collection-returned
    encoded_at:
      - src/knowledge/fallback-selection.ts
    how: "this is the rule the module's exported function implements directly: the branch on anyHypothesisConfirmed followed by the branch on everyEvidenceIsOk is exactly the rule's statement, and both returned values are resolutions the case declared rather than anything composed"
  - node: rule/investigation/the-outcome-comes-from-the-case
    how: "honored rather than encoded: selectFallback never produces an outcome or referral of its own, only reads back one of the two the case already declared. Its first clause reaches the assessment's construction and its confirmed-path clause belongs to the precedence task, both outside this task per its own binding notes; only the negative case (criterion 7) is answered here"
  - node: rule/investigation/one-evaluation-per-hypothesis
    how: "consumed as a guarantee, not enforced: anyHypothesisConfirmed trusts that the evaluations list is total over the case's hypotheses, which is what makes 'no hypothesis confirms' decidable from the list alone. Demonstrating that totality is the judgment station's recording obligation, outside this task per its binding notes"
  - node: rule/investigation/one-evidence-per-collected-concept
    how: "consumed as a guarantee, not enforced: everyEvidenceIsOk trusts that the evidence list is total over the concepts the case's hypotheses collect, which is what makes 'every evidence carries ok' mean every fact arrived. Demonstrating that totality is the collection station's recording obligation, outside this task per its binding notes"
  - node: rule/investigation/an-unattempted-concept-records-a-timeout
    how: "consumed as a guarantee, not enforced: the selection relies on a never-attempted concept already reading as a timeout result rather than as a missing evidence, so it needs no special case for an unattempted concept. Demonstrating that recording is the collection station's obligation, outside this task per its binding notes"
inferences:
  - inferred: "Evidence's minimal shape carries concept and result only, omitting capability, observed_at, ttl, source and detail even though the base does not gap them"
    from: "the task's own instruction to declare Evidence's minimal shape with at least a result field, the task's binding waiving the three attributes the base does gap, and the precedent in src/integration/capability.ts of declaring a shape with no way to build one and no invented identity type where the base states an identity (name and version) that nothing in the tree yet binds by"
  - inferred: "selectFallback lives at src/knowledge/fallback-selection.ts rather than under src/investigation/, despite reading Evaluation and Evidence types from the investigation context"
    from: "the precedent of src/knowledge/required-evaluations.ts, which likewise encodes an investigation-context rule (one-evaluation-per-hypothesis) but sits under src/knowledge/ because it operates over a Case and answers a fact about the case's own resolving behavior — case.md itself states that resolving which fallback applies is the case's own behaviour"
  - inferred: "selectFallback takes the full list of evaluations (rather than a precomputed boolean) and returns undefined, rather than throwing or returning an optional wrapper, when some hypothesis confirmed"
    from: "criterion 7 states the selection 'yields no fallback' rather than that it refuses or errors, and definition/knowledge/resolution and definition/investigation/assessment both already model an optional slot (Case#curatorNotes, Assessment#determiningHypothesis) as an absent value with no sentinel, which src/investigation/assessment.ts's own convention already follows"
deferred:
  - what: "the rest of definition/investigation/evidence's shape — the capability it was produced by (bound by identity to a type this tree has never declared), when it was observed, its ttl, its source, and the two attributes the base leaves without a stated shape (observation, inputs) and the one it leaves without a stated policy (retention)"
    why: "none of it is read by this selection, the task's own binding waives the three base-declared gaps as irrelevant to it, and constructing an evidence at all is explicitly outside this plan; extending the shape belongs to the task that builds an evidence from a collection attempt"
  - what: "which resolution and assessment a case yields when a hypothesis does confirm — the precedence between hypotheses, and building the assessment from the case's positive answer"
    why: "the task's own binding notes leave the case's positive answer, the precedence rule, and the assessment's construction to a separate, deliberately unbound task; this selection only answers the negative case (criterion 7)"
  - what: "pairing each of the case's two declared fallback outcomes to the two pre-existing non-conclusion outcomes the outcome vocabulary already holds"
    why: "the task's binding notes name this as a seam left for the reviewer's eye and state this selection does not need it, since it yields whichever resolution the case already declared rather than composing or validating one against the outcome vocabulary"
---

## What it is

The point at which an investigation that confirmed nothing says which kind of nothing it reached — a choice between two resolutions the case itself declared, never a third composed from anything else, read from the results the collection returned and from no other part of an evidence.

## Notes

Criterion 5 is what an implementation demanding that every evidence be non-ok fails while criteria 2, 3 and 4 still pass.
Criterion 6 is what an implementation composing a resolution of its own fails, and it is stated over the two the case declares rather than over any outcome.
Criterion 7 bounds the selection to the case in which nothing confirms, which is the only situation the base gives it.
The standard was read in full and no rule reaching these files was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
