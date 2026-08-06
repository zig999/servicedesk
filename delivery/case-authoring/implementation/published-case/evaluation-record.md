---
title: "The evaluation of one hypothesis"
summary: "The evaluation value and its constructor: one verdict against one named hypothesis of a case, refused without a verdict, carrying why it could not decide when inconclusive, and frozen so the verdict it received is the verdict it reads back."
task: sha256:046836037b5cc383542cd3b637b9ae077e8567b950d3c9f93cbb39643a234edd
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/investigation/evaluation.ts
    effect: "declares the Evaluation value — one hypothesis name, the three-valued verdict, an optional inconclusive reason drawn from the base's three — and createEvaluation, which refuses a construction giving no verdict, refuses an inconclusive construction giving no reason, and returns a frozen value sharing nothing with the object handed in"
criteria:
  - criterion: "An evaluation reads back the name of the one hypothesis it decided."
    met: true
    how: "the hypothesis field is copied into the frozen value at construction and read back exactly as it was given"
  - criterion: "An evaluation carries exactly one hypothesis name."
    met: true
    how: "hypothesis is a single required HypothesisName scalar, not a list, and the shape declares no slot a second name could occupy"
  - criterion: "An evaluation constructed without a verdict is refused."
    met: true
    how: "createEvaluation checks the given verdict before building anything and throws when none was given, so no evaluation value without a verdict ever exists"
  - criterion: "An evaluation reads back the verdict it received."
    met: true
    how: "the verdict is copied into the frozen value at construction and read back unchanged; freezing is what keeps it the verdict that was received"
  - criterion: "An evaluation whose verdict is inconclusive reads back why it could not decide."
    met: true
    how: "an inconclusive construction giving no reason is refused, so every inconclusive evaluation carries one of the three declared reasons, and the frozen value reads it back"
  - criterion: "An evaluation reads back the verdict it received even when a hypothesis the case lists earlier has already confirmed."
    met: true
    how: "the evaluation takes no input about any other hypothesis and holds no reference to the case's ordering, so another hypothesis confirming has no channel into this record, and the frozen verdict cannot be marked superseded afterwards"
nodes:
  - node: definition/investigation/evaluation
    encoded_at:
      - src/investigation/evaluation.ts
    how: "the node's shape is the Evaluation type — the hypothesis bound by identity as its name, the required three-valued verdict, the optional reason with the node's three declared values — and the body's retention fact, precedence never marking a hypothesis as superseded, is honored by the value carrying no reference to other hypotheses and being frozen at construction; the citations attribute is deferred to the citations task per the task's own cut, and the clause that what cannot be deduced is inconclusive and never inferred governs the judging step, which the binding's REMAINDER note places outside this plan"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/investigation/evaluation.ts
    how: "honored through its identity: the evaluation binds its hypothesis by the name that node declares as the identity, holding the HypothesisName that src/knowledge/hypothesis.ts already exports rather than redeclaring it; the node's fact that two hypotheses of a case never share a name is what makes the name sufficient to say which hypothesis was decided, and it is relied on here, never re-checked"
  - node: rule/investigation/an-inconclusive-evaluation-declares-its-reason
    encoded_at:
      - src/investigation/evaluation.ts
    how: "the InconclusiveReason vocabulary is the rule's three values kept as three distinct literals, and createEvaluation refuses an inconclusive construction that declares no reason, so no inconclusive evaluation value exists in which an absent fact, a failed judgement and an exhausted deadline are indistinguishable"
inferences:
  - inferred: "a refused construction is a thrown Error naming what was absent, rather than an answered refusal value"
    from: "the criteria demand the refusal but no bound node or interface names its shape; the knowledge context's Refusal at src/knowledge/refusal.ts is one reason a case under edit did not pass validation, addressed to the curator, which this is not, and a thrown error is what keeps a refused construction from producing any value at all"
  - inferred: "the reason-declaring invariant is enforced at construction, so no inconclusive evaluation value ever exists without a reason"
    from: "the bound rule constrains the evaluation value itself and createEvaluation is the only place this module produces one; unlike the case, whose checks run in a separate act of publishing, no later validation act over evaluations exists among this task's bound nodes to hold the rule instead"
  - inferred: "a confirmed or refuted evaluation constructed with a reason reads it back rather than being refused"
    from: "the evaluation node marks reason optional and no bound rule reaches a decided verdict's reason, so the constructor carries what was given, the way createAssessment at src/investigation/assessment.ts carries an optional determining hypothesis"
deferred:
  - what: "the evaluation node's citations attribute and the obligation that a confirmed or refuted evaluation cites at least one concept and field — no citations slot is declared on the Evaluation type"
    why: "the task's criteria deliberately say nothing about citations and its Notes route the obligation to the citations task this record joins by dependency; declaring the slot here without the citation shape would state half of one rule in a second place"
  - what: "a runtime refusal of a construction that gives no hypothesis name, though the node marks the attribute required"
    why: "the criteria name exactly one refusal, the verdict's, and adding a second the task does not state would widen the task; the type already requires the name statically, and holding the case's declarations to their minimums is the publication checks' act, not this record's"
---

## What it is

The module src/investigation/evaluation.ts, holding the evaluation value — one verdict against one hypothesis of a case, bound by the name unique within that case — and the constructor that refuses a verdictless construction, refuses an inconclusive one that declares no reason, and freezes what it returns so the verdict received is the verdict read back.

## Notes

The citations attribute of the bound evaluation node is deliberately not declared here, exactly as the task cut it: the citing obligation is demonstrated once, in the citations task this record joins by dependency.
The retention criterion holds by construction because the evaluation takes no input about any other hypothesis.
The refusal's shape as a thrown error is an inference, recorded because no bound node names what a refused construction answers; the project standard was read in full and no rule reaching this file was departed from, though no toolchain exists to run its tool-decided rules.
