---
title: "Which fallback a case resolves when nothing confirms"
summary: "The case's choice between the two fallback resolutions it declares, made from the results the collection returned and from nothing else."
rationale: "The decomposer cuts this out of the resolving behaviour: the choice between the two fallbacks changes for what tells one kind of non-conclusion from the other and reads the result each evidence carries, while the precedence reading changes for how a confirmed hypothesis wins and reads verdicts, so the two are two reasons to change and two inputs; the criteria enumerate one non-ok result per criterion because a selection reading only one of the three would otherwise pass; nothing here constructs an evidence, because the collection step that records one is outside this plan and the selection reads only the result each carries."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
objective: "A case in which no hypothesis confirms resolves to the no-data fallback it declares when any evidence of the investigation carries a result other than ok, and to the hypotheses-exhausted fallback it declares when every evidence carries ok."
criteria:
  - "A case in which no hypothesis confirms and whose every evidence carries ok resolves to the hypotheses-exhausted fallback it declares."
  - "A case in which no hypothesis confirms and one of whose evidences carries a timeout resolves to the no-data fallback it declares."
  - "A case in which no hypothesis confirms and one of whose evidences carries an unavailability resolves to the no-data fallback it declares."
  - "A case in which no hypothesis confirms and one of whose evidences carries a denial resolves to the no-data fallback it declares."
  - "A case in which no hypothesis confirms and one of whose evidences carries a result other than ok while every other carries ok resolves to the no-data fallback it declares."
  - "The resolution this selection yields is one of the two fallbacks the case declares."
  - "A case in which one hypothesis confirms yields no fallback from this selection."
depends_on:
  - task/published-case/case-structure
  - task/published-case/evaluation-record
nodes:
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/investigation/evidence
  - definition/investigation/evaluation
  - rule/knowledge/the-fallback-follows-what-the-collection-returned
  - rule/investigation/the-outcome-comes-from-the-case
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
unresolved:
  - question: "No candidate node says whether a concept the collection never attempted — a stage whose deadline was exhausted before it got a slot — is recorded as an evidence carrying a result other than ok or as no evidence at all. The selection reads only the evidences the investigation carries, so with none recorded a case that reached no data would satisfy every-evidence-carries-ok and resolve to the exhausted fallback, which is the distinction this task exists to make."
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "The selection reads the case's two declared fallbacks and the evidences' results; what sets a case's version never enters the choice, and no criterion names a version."
  - gap: definition/investigation/evidence#attributes.observation
    why: "The selection reads only the evidence's result, never what the observation carries, so the shape of the observed fact cannot change which fallback is chosen."
  - gap: definition/investigation/evidence#attributes.inputs
    why: "What an evidence was produced from is not read by this selection — only its result is — so the absent shape of the inputs bears on no criterion here."
  - gap: definition/investigation/evidence#attributes.retention
    why: "Retention and masking govern how long an evidence is kept and what may reach a prompt; this task neither stores nor renders an evidence, it compares results already recorded."
---

## What it is

The point at which an investigation that confirmed nothing says which kind of nothing it reached.
A choice between two resolutions the case itself declared, never a third composed from anything else.
A choice read from the results the collection returned, and from no other part of an evidence.

## Notes

Criterion 5 is what an implementation demanding that every evidence be non-ok fails while criteria 2, 3 and 4 still pass.
Criterion 6 is what an implementation composing a resolution of its own fails, and it is stated over the two the case declares rather than over any outcome.
Criterion 7 bounds the selection to the case in which nothing confirms, which is the only situation the base gives it.
Both fallbacks carry outcomes the base already enumerates, so no criterion here names an outcome a confirmable hypothesis would contribute.
From the binding — the outcome-comes-from-the-case rule also requires an assessment to carry what the case resolved, and that clause's remainder stays with the assessment task.
From the binding — the precondition that no hypothesis confirms rests on every declared hypothesis having a verdict, which is held over a construct outside these candidates; this task takes the evaluations as given.
From the binding — the inconclusive reason no-data is a neighbouring signal the bound rule deliberately does not use, because the selection reads only the results the collection returned.
From the binding — the selection copies a declared resolution whole rather than composing one, so the vocabularies inside it do not govern it.
