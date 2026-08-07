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
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/glossary/action
    digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: rule/knowledge/case-terms-exist-in-the-glossary
    digest: sha256:4f3ff8e59ed4e0d1bc5808b7cc98a98d065e094650e493032a8aa309cdc376a1
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
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
