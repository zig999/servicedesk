---
title: "What a decided evaluation cites"
summary: "The citations a confirming or refuting evaluation rests on, each naming a concept its hypothesis collects and a field within it."
rationale: "The obligation to cite falls only on an evaluation that decided, and it changes for what counts as evidence rather than for what a verdict records, so it is cut out of the evaluation record and joined to it by a dependency; an earlier criterion tying a citation to a capability was withdrawn by the decomposer, because a citation names a concept and a field and the capability is not what it holds."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "An evaluation that confirms or refutes its hypothesis carries at least one citation, and every citation names a concept that hypothesis collects together with a field within it."
criteria:
  - "An evaluation that confirms its hypothesis reads back at least one citation."
  - "An evaluation that refutes its hypothesis reads back at least one citation."
  - "An evaluation that confirms or refutes and carries no citation is refused."
  - "An evaluation whose verdict is inconclusive is not refused for carrying no citation."
  - "A citation reads back the concept and the field it cites, each by name."
  - "A citation carrying an identifier for the concept or the field it cites is refused."
  - "An evaluation citing a concept its hypothesis does not collect is refused."
depends_on:
  - task/published-case/evaluation-record
nodes:
  - definition/investigation/evaluation
  - definition/investigation/citation
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/integration/capability
  - rule/investigation/a-decided-evaluation-cites-evidence
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - gap: definition/integration/capability#attributes.output_schema
  - question: "No node states how a citation is tied to the capability or the evidence that produced the fact it cites, so the capability that produced that evidence cannot be resolved when a citation is validated."
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: "The timeout bounds how long collection may run, and nothing on this task's path reads it \u2014 a citation is checked after the evidence exists, and no criterion turns on a deadline."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl bounds how stale a collected fact may be, and this task only checks that a cited concept is one the hypothesis collects and that it is named rather than identified, neither of which reads freshness."
---

## What it is

The citation as the record of what a verdict rested on, held by the evaluation that decided.
The obligation that a decided verdict is never unsupported, and the absence of that obligation where the verdict is inconclusive.
The naming of what is cited, by the concept and the field and never by an identifier.
The tie from a citation back to what its hypothesis collects, so nothing is cited that the case never asked for.

## Notes

The obligation is asymmetric by the base's own division, so the criterion about an inconclusive verdict asserts only that this obligation does not refuse it.
Nothing here decides what a fact was, or calls anything to obtain one; the citation is recorded, not produced.
BLOCKING, from the binding — the rule's second clause, that every cited field must exist in the output schema of the capability that produced that evidence, reaches no criterion, and the schema itself is an open gap recorded above as unresolved.
BLOCKING, from the binding — the base states only in prose that citations are by name and never by identifier, no node states the refusal, and the cited field is a plain string with no stated form distinguishing an identifier from a name, so the field half of criterion 6 cannot be demonstrated without deciding that form here.
From the binding — the invariant governing an inconclusive evaluation's reason sits outside this claim, so criterion 4 covers only that such an evaluation is not refused for lacking a citation.
The pin was restated deliberately rather than re-bound: the base moved by three nodes and this task binds none of them — the case under edit closed its own gap, the published case gained three, and the capability's output-schema gap kept its field name and changed only its why. The validator's totality check over every bound node's open gaps is what holds that judgment, and it refuses this task if the reading is wrong.
