---
title: "What a decided evaluation cites"
summary: "The citations a confirming or refuting evaluation rests on, each naming a concept its hypothesis collects and a field that concept declares."
rationale: "The obligation to cite falls only on an evaluation that decided, and it changes for what counts as evidence rather than for what a verdict records, so it is cut out of the evaluation record and joined to it by a dependency; an earlier criterion tying a citation to a capability was withdrawn by the decomposer, because a citation names a concept and a field and the capability is not what it holds; the declared-fields check is stated as one refusal and one non-refusal of this rule alone, because the governing statement forbids and the base may still refuse the same evaluation for reasons of its own; the concept record the field is checked against is taken from the glossary reading another task delivers rather than read again here, because writing a second reading of the glossary would rewrite an interface this plan already cuts once."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-retomada-revinculacao.md
objective: "An evaluation that confirms or refutes its hypothesis carries at least one citation, and every citation names a concept that hypothesis collects together with a field that concept declares."
criteria:
  - "An evaluation that confirms its hypothesis reads back at least one citation."
  - "An evaluation that refutes its hypothesis reads back at least one citation."
  - "An evaluation that confirms or refutes and carries no citation is refused."
  - "An evaluation whose verdict is inconclusive is not refused for carrying no citation."
  - "A citation reads back the concept and the field it cites, each by name."
  - "A citation carrying an identifier for the concept or the field it cites is refused."
  - "An evaluation citing a concept its hypothesis does not collect is refused."
  - "An evaluation citing a field the cited concept does not declare is refused."
  - "An evaluation whose every citation names a collected concept and a field that concept declares is not refused by this rule."
depends_on:
  - task/published-case/evaluation-record
  - task/case-validator/glossary-lookup
nodes:
  - rule/investigation/a-decided-evaluation-cites-evidence
  - definition/investigation/evaluation
  - definition/investigation/citation
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/glossary/observation-field
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl governs how stale the fact behind a concept may be, which bears on evidence freshness during collection; this task validates that a citation names a collected concept and a field that concept declares, and no criterion reads or compares a ttl, so its unit cannot change what any criterion demonstrates."
---

## What it is
The citation as the record of what a verdict rested on, held by the evaluation that decided.
The obligation that a decided verdict is never unsupported, and the absence of that obligation where the verdict is inconclusive.
The naming of what is cited, by the concept and the field and never by an identifier.
The tie from a citation back to what its hypothesis collects and to the fields that concept declares, so nothing is cited that the case never asked for and no field is cited that no answer carries.

## Notes
The obligation is asymmetric by the base's own division, so the criterion about an inconclusive verdict asserts only that this obligation does not refuse it.
The field a citation names is checked against the fields the cited concept declares, so the check reads the glossary's record of the concept and nothing outside the glossary.
Criterion 9 asserts non-refusal by this rule alone, never acceptance of the evaluation, which other rules may still refuse.
Nothing here decides what a fact was, or calls anything to obtain one; the citation is recorded, not produced.
UNDERDETERMINED, from the binding — the base disagrees with itself about what a cited field is checked against, the bound rule and its body placing the check on the fields the cited concept declares while the citation node's rules and the hypothesis's body still say the field must exist in the output schema of the capability that produced the evidence, a node outside the candidates and declared untouched by the epic; what passes is an implementation validating each citation's field only against the concept's declared fields, satisfying every criterion as written, while accepting a citation whose field the producing capability's schema does not carry, which the citation node's stale clause refuses; the stale clauses are the base's to correct through /analyse-domain.
REMAINDER, from the binding — the evaluation node's clause that an inconclusive evaluation says which of the three reasons it has reaches no criterion here, since criterion 4 only exempts an inconclusive evaluation from the citation requirement; it belongs to the task binding the inconclusive-reason rule, the evaluation-record task this one depends on.
