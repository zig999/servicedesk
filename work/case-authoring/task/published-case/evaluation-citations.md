---
title: "What a decided evaluation cites"
summary: "The citations a confirming or refuting evaluation rests on, each naming a concept its hypothesis collects and a field that concept declares."
rationale: "The obligation to cite falls only on an evaluation that decided, and it changes for what counts as evidence rather than for what a verdict records, so it is cut out of the evaluation record and joined to it by a dependency; an earlier criterion tying a citation to a capability was withdrawn by the decomposer, because a citation names a concept and a field and the capability is not what it holds; the declared-fields check is stated as one refusal and one non-refusal of this rule alone, because the governing statement forbids and the base may still refuse the same evaluation for reasons of its own; the concept record the field is checked against is taken from the glossary reading another task delivers rather than read again here, because writing a second reading of the glossary would rewrite an interface this plan already cuts once."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-revinculacao-cinco-decisoes.md
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
base: sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl governs how stale the fact behind an evidence may be; no criterion of this task reads freshness — a citation is checked against the concept's declared observation fields and the hypothesis's collects list, and the ttl touches neither."
---

## What it is
The citation as the record of what a verdict rested on, held by the evaluation that decided.
The obligation that a decided verdict is never unsupported, and the absence of that obligation where the verdict is inconclusive.
The naming of what is cited, by the concept and the field and never by an identifier.
The tie from a citation back to what its hypothesis collects and to the fields that concept declares, so nothing is cited that the case never asked for and no field is cited that no answer carries.

## Notes
The obligation is asymmetric by the base's own division, so the criterion about an inconclusive verdict asserts only that this obligation does not refuse it.
Criterion 9 asserts non-refusal by this rule alone, never acceptance of the evaluation, which other rules may still refuse.
Nothing here decides what a fact was, or calls anything to obtain one; the citation is recorded, not produced.
From the binding — criterion 6's refused identifier is any reference that is not the declared name, since concept and observation field each declare identity by name and the citation binds by identity while its body states citations are by name and never by identifier, so by identity and by name coincide in the base; stated so the implementer does not invent a separate id construct to refuse.
REMAINDER, from the binding — the evaluation node's clause that an inconclusive evaluation says which of the three reasons it has reaches no criterion, criterion 4 only exempting an inconclusive evaluation from the citation requirement; it belongs to the task binding the inconclusive-reason rule, the evaluation-record task this one depends on.
REMAINDER, from the binding — the evaluation node's clauses that every hypothesis a case declares gets one evaluation and that what cannot be deduced is inconclusive and never inferred reach no criterion, this task judging only what a decided evaluation cites; they belong to the tasks binding the one-evaluation-per-hypothesis rule and the judging act of the diagnose process.
REMAINDER, from the binding — the hypothesis and concept nodes carry authoring and publication clauses no criterion here reaches, one falsifiable claim per criterion, unique names, glossary existence, subject-type acceptance and the unpublishable-without-a-capability clause; this task binds the hypothesis only for its collects list and the concept only for its declared fields, and those clauses belong to the validating epic's checks.
From the binding — the rule's body fixes where the field check's authority sits, in what the concept declares and never in a capability's schema, and the capability is declared untouched by the epic; stated so an implementation does not reach for a capability schema as the reference list.
