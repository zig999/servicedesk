---
title: Two hypotheses of one case never share a name
summary: The check that no two hypotheses of a case carry the same name.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. The criterion on position was re-cut to name the hypothesis the base holds rather than a position in general, for the same reason the refusal task's was.
sources:
  - intake/scope.md
objective: A validation refuses a case in which two hypotheses share a name.
criteria:
  - A case whose two hypotheses share a name is answered with a refusal naming this rule.
  - That refusal carries the hypothesis whose name repeats.
  - A case whose hypothesis names are all distinct is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
nodes:
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: rule/knowledge/hypothesis-name-is-unique-in-its-case
    digest: sha256:289d09e2bdc85e8277a0ebbfe746ac7205cd6419249425b8802f74436c085230
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
---
## What it is

One check over the case's own content, comparing the hypothesis names within one case.
It rests on the hypothesis name being what a hypothesis is identified by inside its case.

## Notes

UNDERDETERMINED, from the binding — `rule/knowledge/two-positions-are-two-refusals` is bound and no criterion reaches a case in which more than one name repeats, the criteria speaking of two hypotheses sharing a name in the singular.
UNDERDETERMINED passes — a check that answers one refusal per case however many names repeat, so a case whose hypotheses are named a, a, b, b is answered with a single refusal naming a.
UNDERDETERMINED, from the binding — the first clause of `rule/knowledge/a-validation-answers-with-every-refusal` carries the condition that a check be safe over a malformed case, and no criterion of this task reaches one.
UNDERDETERMINED passes — a check that raises, or refuses, over a case whose hypotheses list is empty or whose hypothesis carries no name.
REMAINDER, from the binding — the second clause of the same rule, that a validation answers with every refusal its checks produced, is about assembling one answer across checks and reaches no criterion of this task.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the case validation and answers the curator with every refusal.
From the binding — `rule/knowledge/hypothesis-name-is-unique-in-its-case` states its effect at publication in both its examples, while this task's objective states a validation, and the node tying the checks to the publish trigger sits outside the candidates.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim and is bound by `task/case-publication/publish-transition`, so where this check is invoked from is that task's and not this one's.
From the binding — `definition/knowledge/refusal` requires a text written for the curator and no bound node fixes any wording for this rule's refusal, and the node declares no gap over the field, so whatever text the delivery writes answers to no base node.
From the binding — `definition/knowledge/refusal` says its rule names the rule that refused by its identifier and the base states no vocabulary of rule identifiers apart from node identity, so criterion one is read here as the refusal carrying `rule/knowledge/hypothesis-name-is-unique-in-its-case`.
From the binding — `rule/glossary/a-lookup-matches-a-published-name-exactly` is left unbound, because it governs terms looked up in the glossary and the exact character comparison this task needs is stated by the bound uniqueness rule itself, though a delivery implementing name comparison in two places must not let the two diverge.
