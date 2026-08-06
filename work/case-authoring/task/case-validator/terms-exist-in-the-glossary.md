---
title: "A case names only published terms"
summary: "The check that refuses a case naming a term the glossary does not publish under the kind the case uses it as."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case naming any term the published glossary does not publish under the kind the case uses it as is refused by this check, and a case whose every named term is so published is not refused by it."
criteria:
  - "A case collecting a concept the glossary does not publish is refused by this check."
  - "A case whose resolution names an outcome the glossary does not publish is refused by this check."
  - "A case whose referral names an action the glossary does not publish is refused by this check."
  - "A case whose referral names a recipient the glossary does not publish is refused by this check."
  - "A case declaring a subject type the glossary does not publish is refused by this check."
  - "A case whose every named term the glossary publishes under the kind the case uses it as is not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - definition/knowledge/draft-case
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/knowledge/a-validation-answers-with-every-refusal
base: sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads the terms a case names — subject type, concepts, outcomes, actions, recipients — and the version is what publication adds afterwards; how the version is derived changes nothing about whether a named term is published in the glossary."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check tests only that a named concept exists in the glossary; the ttl, its unit and its values belong to the ttl check, not to term existence."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The check tests membership against whatever the glossary publishes at validation time; the vocabulary being discovered with the first cases changes what populates it, never the membership test this task builds."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Outcomes beyond the two non-conclusion entries are contributed by cases, and the check compares a named outcome against the published entries whatever they are; the open enumeration does not bear on the existence test."
  - gap: definition/glossary/action#attributes.name.values
    why: "The actions of the first case are unnamed in the base, but the check compares against the glossary's published entries at validation time; which actions those turn out to be does not change the test."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The real operational queues are unnamed in the base, but the check compares a named recipient against the published entries at validation time; which queues those turn out to be does not change the test."
---

## What it is
The vocabulary check standing behind the base's statement that a case speaks only the published language.
One refusal covering every position in which a case names a term, so nothing a case names is invented in place.

## Notes

The criteria enumerate the positions a case names terms in, not the terms themselves, because the members of each vocabulary are the glossary's to publish.
The check decides against the glossary it is given through the shared lookup and holds no vocabulary of its own.
REMAINDER, from the binding — both statement clauses of the every-refusal rule, that a validation runs every check whatever an earlier one decided and answers with every refusal produced, govern the composition and not this single check; the rule is bound for its per-check obligation of safety over a malformed case, and the composition belongs to the validation-run task.
REMAINDER, from the binding — the bound structure and glossary definitions carry obligations these criteria do not reach, the minimum of one hypothesis, the content-hash coverage, the ttl declaration, the declared observation fields, the subject-type acceptance and the read-only capability requirement; each is restated by a dedicated rule node this task deliberately does not bind, and each belongs to the sibling task that binds it.
From the binding — the objective's under-the-kind clause is grounded by the typed references rather than by the rule's sentence, since every position a case names a term from is a by-identity ref with a typed target, so a term published only under another vocabulary does not resolve and a pooled name-lookup across vocabularies would contradict the targets.
From the binding — per the every-refusal rule's body this check walks a malformed case without failing, refusing nothing for the absent parts, since other checks own those absences.
From the binding — the recipient-is-a-role rule, a candidate not bound, states that role-versus-person holds over the glossary's own entries and that a check over a case tests only existence, confirming criterion 4's scope.
From the binding — the named-term positions include both fallbacks, since the case and the case under edit each declare the no-data and the hypotheses-exhausted fallback as embedded resolutions, so criteria 2 to 4 range over every hypothesis's resolution and both fallback resolutions; the case under edit is bound as what a publication check reads and refuses, the published case as what the rule constrains.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
