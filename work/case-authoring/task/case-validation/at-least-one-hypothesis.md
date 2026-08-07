---
title: A case with no hypothesis is refused
summary: The check that a case declares at least one hypothesis, and the refusal it produces with nothing to point at.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. The criterion on position was inverted after a binder found that the base declares both position attributes optional and gives this very check as the reason.
sources:
  - intake/scope.md
objective: A validation refuses a case that declares no hypothesis, with a refusal carrying no hypothesis to name.
criteria:
  - A case declaring no hypothesis is answered with a refusal naming this rule.
  - That refusal carries no hypothesis, because the case declares none.
  - That refusal carries the text written for the curator.
  - A case declaring at least one hypothesis is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
nodes:
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/knowledge/case-has-at-least-one-hypothesis
    digest: sha256:ff3df5176e34b2bfdfd59d9a8231b195cc843ffc5d71fa23976715accbb63838
unresolved:
  - question: No base node states the text this refusal carries for the curator. definition/knowledge/refusal requires the text and says only that it is written for the curator, and it declares no gap over the wording, so criterion three cannot be delivered without writing a curator-facing sentence no node holds, and an invented one reads exactly like one the business stated.
  - question: No base node states whether the refusal produced when a case declares no hypothesis carries an offended term. definition/knowledge/refusal makes both position parts optional and its rationale reasons from this very case only about the hypothesis part, so the delivery must choose between naming the case's hypotheses field and naming nothing.
---
## What it is

One check over the case's own content, needing nothing outside the case.
It is the refusal that has no position to carry, and the second criterion holds it to that rather than to an invented one.

## Notes

UNDERDETERMINED, from the binding — the task says a case and the base holds two models of it, and no criterion says which one this check reads; only `definition/knowledge/draft-case` settles it, with its statement that a case under edit is what a publication check refuses because a published case is one that already holds.
UNDERDETERMINED passes — a check that counts hypotheses only over the published-case model, the one carrying a version and a content hash, and never over what a curator is still editing, which meets all four criteria while the base refuses the placement.
REMAINDER, from the binding — `rule/knowledge/a-validation-answers-with-every-refusal` states two clauses these criteria do not reach, that a validation runs every check whatever an earlier one decided and that it answers with every refusal those checks produced.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the validation rather than delivering a single check.
From the binding — `definition/knowledge/draft-case` declares its hypotheses list with a minimum of one while the validation rule requires each check to be safe over a malformed case, so the draft the validation reads must be representable with an empty list or this check can never run and criterion one is unreachable.
From the binding — `rule/knowledge/case-has-at-least-one-hypothesis` declares `definition/knowledge/case` in `constrains` while the validation this task delivers reads `definition/knowledge/draft-case`, and the binding stayed inside the candidates.
Decision, beyond the covers — stand: `definition/knowledge/case` is `epic/case-publication`'s claim, and this epic covers the case under edit deliberately, because a publication check refuses what a curator is still editing rather than what already holds.
From the binding — `definition/knowledge/hypothesis` is left unbound, because this check reads only the count of the hypotheses list and nothing inside an element.
