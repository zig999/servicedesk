---
title: The shape of a hypothesis
summary: One falsifiable claim as a case declares it — its name, what it collects, what confirms it, and what follows when it holds.
rationale: The decomposition cut the hypothesis apart from the case because the base registers each as its own definition and a case holds a list of the other, so the two change for different reasons.
sources:
  - intake/scope.md
objective: A hypothesis is a declared shape holding a name, the concepts it collects, the criterion that confirms it, and the resolution that follows when it holds.
criteria:
  - A hypothesis value carries a name.
  - A hypothesis value carries the concepts it collects, as a list.
  - A hypothesis value carries the criterion that confirms it, as prose.
  - A hypothesis value carries the resolution that follows when it holds.
  - A hypothesis missing its criterion does not parse.
  - A hypothesis missing its resolution does not parse.
depends_on:
  - task/case-shape/resolution-and-referral
nodes:
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
---
## What it is

The shape of one hypothesis, holding the criterion as prose and everything else as structure.
It reuses the resolution shape rather than restating what follows when the hypothesis holds.

## Notes

Whether a hypothesis collects at least one concept and whether its name is unique in its case are checks, and they are cut in the validation epic.
UNDERDETERMINED, from the binding — criteria five and six make only the criterion and the resolution parse-refusing, while `definition/knowledge/hypothesis` declares all four attributes required and declares `collects` with a minimum of one.
UNDERDETERMINED passes — a parser that accepts a hypothesis whose name is absent and whose collects is absent or empty, refusing only a missing criterion and a missing resolution.
UNDERDETERMINED, from the binding — criterion two says only that the collected concepts are carried as a list, while the bound node declares `collects` as a by-identity binding, so what a hypothesis carries is the concept's identity and not the concept.
UNDERDETERMINED passes — a hypothesis carrying whole embedded concept values in `collects` instead of concept identities.
UNDERDETERMINED, from the binding — the criteria say a malformed hypothesis does not parse and say nothing about what the containing case's validation then does, where `rule/knowledge/a-validation-answers-with-every-refusal` requires every check to run whatever an earlier one decided and to be safe over a malformed case.
UNDERDETERMINED passes — a parser that aborts the whole case at the first hypothesis missing its criterion, so the curator receives one error instead of every refusal the case's checks produced.
UNDERDETERMINED, from the binding — no rule node of the base states that a hypothesis must declare a criterion or a resolution, that requiredness living only in the definition's attributes, so a refusal produced for criterion five or six has no rule identifier to name in the sense `definition/knowledge/refusal` and `rule/knowledge/two-positions-are-two-refusals` require.
UNDERDETERMINED passes — a parse failure carrying a bare missing-field message, with no rule identifier, no hypothesis name, no offended field and no text for the curator.
Decision, beyond the covers — stand: `rule/knowledge/a-validation-answers-with-every-refusal`, `definition/knowledge/refusal` and `rule/knowledge/two-positions-are-two-refusals` are `epic/case-validation`'s claim, where the refusal shape and the totality of a validation's answer are bound by `task/case-validation/refusal-and-accumulation`; this task declares a value shape and answers with no refusal.
REMAINDER, from the binding — a clause of `definition/knowledge/hypothesis` says two hypotheses of the same case never share a name, which nothing about a single hypothesis value can violate.
REMAINDER belongs — the task over the case's list of hypotheses, `task/case-shape/draft-case-shape`, and the check `task/case-validation/unique-hypothesis-name`.
REMAINDER, from the binding — three clauses of the bound nodes describe run-time behaviour rather than the declared shape, namely that an evaluation must cite a concept and a field the cited concept declares, that a resolution is never produced during an investigation, and that a referral may not be seen before the investigation has a record.
REMAINDER belongs — the investigation act, at `definition/investigation/evaluation`, `definition/investigation/citation` and `definition/investigation/assessment`.
Decision, beyond the covers — stand: `definition/investigation/evaluation`, `definition/investigation/citation` and `definition/investigation/assessment` belong to the investigation context, which no epic of this plan claims.
From the binding — the closure of a hypothesis value ends at by-identity references into `definition/glossary/concept`, `definition/glossary/outcome`, `definition/glossary/action` and `definition/glossary/recipient`, each of which declares its name as its identity, so the base holds what such a reference carries though no bound node states it.
Decision, beyond the covers — stand: `definition/glossary/concept`, `definition/glossary/outcome`, `definition/glossary/action` and `definition/glossary/recipient` are claimed by `epic/published-language-ports` and `epic/case-validation`, and this cut keeps this task at the reference and never at what identifies the referent.
From the binding — a clause of the bound hypothesis node says a criterion states exactly one falsifiable claim, and no criterion could be written for it, because `rule/knowledge/one-falsifiable-claim-per-criterion` states that no validator can check it.
Decision, beyond the covers — stand: `rule/knowledge/one-falsifiable-claim-per-criterion` is claimed by `epic/case-validation` and declared `uncovered` there, because this plan builds no check that reads a criterion's prose.
