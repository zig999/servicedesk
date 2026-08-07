---
title: A refusal, and a validation that answers with every one
summary: What one refusal carries, and a validation that runs every check it holds and answers with all of the refusals.
rationale: The decomposition put the refusal shape and the accumulation of refusals in one task because what a refusal carries and how refusals collect are one decision, and one refusal per position is a condition on that same shape rather than a separate outcome. The criterion on position was re-cut into three conditional ones after a binder read the original as unconditional where the base is conditional.
sources:
  - intake/scope.md
objective: Validating a case runs every check it carries whatever an earlier one decided, and answers with one refusal per rule per position.
criteria:
  - A refusal carries the rule that refused.
  - A refusal carries the text written for the curator.
  - A refusal carries the hypothesis it refused at where the check that produced it refused inside a hypothesis.
  - A refusal carries the offended term where the check that produced it refused over a term the case named.
  - A refusal produced by a check that refused at neither a hypothesis nor a term carries neither, and is a refusal all the same.
  - A case that two rules refuse is answered with a refusal from each.
  - A case that one rule refuses at two positions is answered with one refusal per position, never one covering both.
  - A check that refused does not prevent a later check from running.
  - A case that no check refuses is answered with no refusal.
depends_on:
  - task/case-shape/draft-case-shape
nodes:
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
---
## What it is

The refusal every check in this plan produces, and the harness that runs the checks and collects them.
It is where the totality of a validation's answer is decided, not in any individual check.
Both position attributes are conditional here, because the base declares neither of them required.

## Notes

Each check is cut as its own task and registers with this harness; none of them decides whether a later one runs.
The check on a case that declares no hypothesis is the case where a refusal carries no position at all.
UNDERDETERMINED, from the binding — `definition/knowledge/refusal` states the position as the hypothesis by name and the term or field offended, so its offended term carries an offended field as well as an offended glossary term, while criterion four names only a term the case named and criterion five then sweeps a field-offended refusal into the class that must carry neither part of a position.
UNDERDETERMINED passes — a validation that, for a check refusing over an offended field rather than over a term the case named, answers with a refusal carrying neither the hypothesis nor the offended term, so the position is dropped and the curator is sent to hunt for it.
UNDERDETERMINED, from the binding — criterion one says a refusal carries the rule that refused, while the bound node says it names the rule by its identifier because the rule is the domain's language and outlives whatever check implements it.
UNDERDETERMINED passes — a refusal whose rule carries the rule's prose title, or a code the check mints for itself, rather than the rule node's identifier.
UNDERDETERMINED, from the binding — `rule/knowledge/a-validation-answers-with-every-refusal` requires each check to be safe over a malformed case, and criterion eight states only the other half of that clause, that a check which refused does not stop a later one.
UNDERDETERMINED passes — a validation that wraps every check in a catch-all and treats a check that failed over a malformed case as a check that refused nothing, so a check that blew up is answered exactly like a check the case passed.
REMAINDER, from the binding — the rest of `definition/knowledge/draft-case` reaches no criterion of this task, which binds it for one clause only, that a case under edit is what a publication check refuses.
REMAINDER belongs — `task/case-shape/draft-case-shape` for the case's own shape, and `task/case-publication/publish-transition` for the publication act.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim, and this task delivers the validation rather than the transition that invokes it.
From the binding — the bound rule's expression counts checks while criterion seven and `rule/knowledge/two-positions-are-two-refusals` count positions, so a case one rule refuses at two positions answers with two refusals and one check refused, and both bodies reconcile it in prose while the expression's wording does not.
From the binding — criteria six and eight cannot be exercised without at least two checks existing and this task binds no check rule, so the dependency edges run from each check to this task rather than the reverse, which is what keeps the plan free of a cycle.
From the binding — criterion three's position is a hypothesis by name, which locates one hypothesis only under `rule/knowledge/hypothesis-name-is-unique-in-its-case`, so over exactly the case that rule refuses two refusals can carry the same position.
