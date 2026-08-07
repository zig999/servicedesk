---
title: "Which fallback a case resolves when nothing confirms"
summary: "The case's choice between the two fallback resolutions it declares, made from the results the collection returned and from nothing else."
rationale: "The decomposer cuts this out of the resolving behaviour: the choice between the two fallbacks changes for what tells one kind of non-conclusion from the other and reads the result each evidence carries, while the precedence reading changes for how a confirmed hypothesis wins and reads verdicts, so the two are two reasons to change and two inputs; the criteria enumerate one non-ok result per criterion because a selection reading only one of the three would otherwise pass; nothing here constructs an evidence, because the collection step that records one is outside this plan and the selection reads only the result each carries."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-revinculacao-cinco-decisoes.md
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
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/investigation/evaluation
    digest: sha256:1a83f3e12140dd16aff50c46eb1186d6dcdb9711378d045d971bd6f12d5c91de
  - node: definition/investigation/evidence
    digest: sha256:d424dcd74f287e99bebfb33c433785b58066b7dbc4f83ef8be02d6d6ddbc8875
  - node: rule/knowledge/the-fallback-follows-what-the-collection-returned
    digest: sha256:82526f2f2b1f34a5335cf16b85806777f8c196e7e86e834837b4eba6196d3412
  - node: rule/investigation/the-outcome-comes-from-the-case
    digest: sha256:fe6d313568bdc7eb9aaae70da1220bba3faddc2cf58285d0d9486a598d4ce12b
  - node: rule/investigation/one-evaluation-per-hypothesis
    digest: sha256:5c6cbf502b861b306a3ead92129e8d260e06b13dea90a924c54b5a92a6a2d825
  - node: rule/investigation/one-evidence-per-collected-concept
    digest: sha256:d49ec2f8f15ec3ae1c9bcc0bb531910511ad1bb2f3681d5647c24dbe0dfac4d0
  - node: rule/investigation/an-unattempted-concept-records-a-timeout
    digest: sha256:dcae4fb3aeed9dc969decb61d23d8198ebf7fc836b0eb2109edb504a06c933b2
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This selection runs inside one already-published case, pinned by content; what sets the version plays no part in reading the collection's results or choosing between the two fallbacks the case declares."
  - gap: definition/investigation/evidence#attributes.observation
    why: "The selection reads only each evidence's result field; the shape of the observation an ok evidence carries never reaches it."
  - gap: definition/investigation/evidence#attributes.inputs
    why: "The inputs an evidence was produced from are provenance for replay and review; the selection reads only the result and touches no input."
  - gap: definition/investigation/evidence#attributes.retention
    why: "Retention and masking govern how long an evidence is kept and what reaches a prompt; the selection reads the result at resolution time and neither stores nor prompts."
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
The evidence set this selection reads is now total by the base's own rules — one evidence per collected concept, a never-attempted one recording a timeout — so every-evidence-carries-ok means every fact arrived, and the earlier question over the never-attempted concept is settled in the base.
REMAINDER, from the binding — the statements of the one-evidence-per-collected-concept and unattempted-records-a-timeout rules are recording obligations on the collection, and this task consumes what they guarantee without demonstrating either recording clause; they belong to the collection station of the diagnose process, which this plan does not hold.
REMAINDER, from the binding — the one-evaluation-per-hypothesis statement is a recording obligation on the judgment, consumed here as what makes no-hypothesis-confirms decidable; it belongs to the judgment station of the diagnose process, which this plan does not hold.
REMAINDER, from the binding — the outcome rule's first clause, that an assessment carries what the case resolved, reaches the assessment's construction and no criterion here; its second clause answers criterion 6, and the first belongs to the task that builds the assessment from what the case resolved.
REMAINDER, from the binding — the case's positive answer when a hypothesis confirms reaches only criterion 7's negative here, and which confirmed hypothesis wins is the precedence rule's, deliberately left unbound; it belongs to the task that resolves the confirmed path.
From the binding — the referral, action, recipient and outcome nodes define the internals of the resolutions this selection passes through whole and are left unbound; one seam for the reviewer's eye, the outcome node holds the two pre-existing non-conclusion outcomes and no rule ties each declared fallback to its matching outcome, a pairing this selection does not need because it yields whichever resolution the case declared.
