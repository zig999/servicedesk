---
title: A hypothesis that collects nothing is refused
summary: The check that every hypothesis of a case collects at least one concept.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own.
sources:
  - intake/scope.md
objective: A validation refuses a hypothesis that collects no concept.
criteria:
  - A hypothesis collecting no concept is answered with a refusal naming this rule.
  - That refusal names the hypothesis it refused at.
  - A case whose two hypotheses each collect nothing is answered with two refusals.
  - A hypothesis collecting at least one concept is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
nodes:
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: rule/knowledge/hypothesis-collects-at-least-one-concept
    digest: sha256:abd47448fabd44ecaa627082d5e4a7d8cb8db6a3968c051bd1a1c32588de5b25
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: This task counts the entries of a hypothesis's collects list and reads nothing a concept declares. The ttl and its unit are read by the check that every collected concept declares a ttl, which is a sibling task, and no unit is needed to decide whether the list is empty.
---
## What it is

One check over the case's own content, applied to each hypothesis in turn.

## Notes

The criterion about two hypotheses is what holds this check to one refusal per position rather than one per case.
UNDERDETERMINED, from the binding — `rule/knowledge/two-positions-are-two-refusals` requires two refusals each naming its own position, and no criterion states that second half, since criterion three only counts two refusals and criterion two constrains only the single refusal of criterion one.
UNDERDETERMINED passes — a check that answers two refusals over a case with two empty hypotheses but writes the same hypothesis name in both, or leaves the hypothesis absent in both, which `definition/knowledge/refusal` permits.
UNDERDETERMINED, from the binding — `rule/knowledge/a-validation-answers-with-every-refusal` states in its rules that this very check walks a case with no hypothesis at all without failing and simply refuses nothing, and every criterion of this task speaks of hypotheses that exist.
UNDERDETERMINED passes — a check that raises or errors over a case whose hypotheses list is empty or absent, while the base requires the walk to complete and refuse nothing.
UNDERDETERMINED, from the binding — the first clause of that rule's statement, that every check runs whatever an earlier one decided, is reached by no criterion.
UNDERDETERMINED passes — a check that signals its refusals by raising out of the validation, so the validation ends carrying them and the checks after it never run.
UNDERDETERMINED, from the binding — `definition/knowledge/refusal` makes the text written for the curator required, and no criterion of this task mentions it.
UNDERDETERMINED passes — a check emitting refusals that carry the rule and the hypothesis with an empty or absent text.
REMAINDER, from the binding — the clauses of `definition/knowledge/draft-case` on publication reach no criterion of this task, which reads only a case under edit's hypotheses.
REMAINDER belongs — `task/case-publication/publish-transition`, which delivers the act of case publication.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim, and this task delivers the check rather than what invokes it.
REMAINDER, from the binding — `definition/knowledge/hypothesis` states that two hypotheses of the same case never share a name, which no criterion of this task reaches.
REMAINDER belongs — `task/case-validation/unique-hypothesis-name`, the sibling that binds that rule.
REMAINDER, from the binding — `definition/knowledge/hypothesis` states that a criterion holds exactly one falsifiable claim, and nothing in this task reads the confirming criterion.
REMAINDER belongs — `rule/knowledge/one-falsifiable-claim-per-criterion`, which this epic claims and declares `uncovered`, because no check this plan builds reads that prose.
REMAINDER, from the binding — `definition/knowledge/hypothesis` states that an evaluation must cite a concept and a field the cited concept declares, which is about judging a hypothesis during an investigation.
REMAINDER belongs — the investigation act, where `rule/investigation/a-decided-evaluation-cites-evidence` holds it.
Decision, beyond the covers — stand: `rule/investigation/a-decided-evaluation-cites-evidence` belongs to the investigation context, which no epic of this plan claims.
REMAINDER, from the binding — `definition/glossary/concept` is bound only because a collected entry is a concept name, and the concept node's own rules reach no criterion of this task.
REMAINDER belongs — the sibling tasks binding the terms, ttl and subject-type rules.
From the binding — the objective says a validation refuses while the bound rule's example says publication is refused, so as bound this task delivers the check and not what invokes it.
From the binding — criterion three counts one refusal per hypothesis and names are distinct only because the uniqueness rule refuses a case where they are not, so a case with two identically named empty hypotheses arrives here and the base does not say whether that is one position or two.
From the binding — criteria three and four need hypothesis fixtures carrying a resolution whose outcome, action and recipient names the base leaves open, and nothing a fixture writes into them may afterwards be read as a vocabulary the business stated.
