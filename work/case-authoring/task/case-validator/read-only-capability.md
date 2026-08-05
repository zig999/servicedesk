---
title: "Every collected concept has a read-only capability"
summary: "The check that refuses a case collecting a concept no read-only capability answers, decided where the case is validated and without calling anything."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case collecting a concept that is not answered by a read-only capability is refused by this check, and a case whose every collected concept is answered by a read-only capability is not refused by it."
criteria:
  - "A case collecting a concept that no capability answers is refused by this check."
  - "A case collecting a concept whose answering capability is not read-only is refused by this check."
  - "A case whose every collected concept is answered by a read-only capability is not refused by this check."
  - "Deciding this check over a case invokes no capability."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/draft-case
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/integration/capability
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - gap: definition/integration/capability#attributes.output_schema
  - question: "The rule turns on a capability being registered, and no candidate node states what makes a capability registered \u2014 whether registration is a state a capability carries beyond being declared, and what a case's validation consults to find the capability answering a concept."
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: "The rule's clause is that a timeout is declared; this check reads the presence of the declaration and never a duration."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check matches a collected concept to a capability and its nature; staleness tolerance is a different check's."
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "Version is assigned by publication after this check decides; nothing in the decision reads it."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "The hash identifies the published value publication emits; this check decides over what the case collects, before either exists."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The fallback resolution collects no concept, so which non-conclusion outcome it holds cannot change this check's result."
---

## What it is
The check that holds the contract between curated knowledge and integration at the moment a case is validated.
A refusal decided from what is recorded about a capability, never from calling one.

## Notes

The last criterion is what the base's statement that the contract is checked when publishing and not when running amounts to as an observable property of this check.
BLOCKING, from the binding — criterion 3 is weaker than the rule, which refuses a case unless the answering capability is read-only and declares an output schema and a timeout; the last two clauses reach no criterion at all.
BLOCKING, from the binding — criterion 2 asserts a state no bound node admits, since the capability's nature has a single value and the node that refuses any other is outside the candidates.
BLOCKING, from the binding — the base decides which case this check is decided over, and no criterion names that input; every criterion says a case for both models.
From the binding — the publication act this check gates sits outside this epic's claim, and its two open gaps are therefore beyond this triage.
From the binding — that the collected concept exists in the glossary at all is a neighbouring check, deliberately unbound here.
