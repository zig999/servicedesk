---
title: PT-br messages for the three refusals about the concepts a hypothesis revision collects
summary: ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and HypothesisRevisionCollectsNoConceptError
  rewritten in PT-br, each naming the hypothesis, the case and the concepts at issue.
rationale: These three are cut together because they share one reason to change — how the collects of
  a hypothesis revision are told to an operator whose composition was refused — and all three name the
  same hypothesis and case in the same position.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
objective: The three refusals about a hypothesis revision's collected concepts carry PT-br messages stating
  the same fact their English text stated.
criteria:
- ConceptNotInGlossaryError's message is in PT-br, names the hypothesis, names the case slug, and names
  the concepts the glossary does not hold.
- ConceptRefusesSubjectTypeError's message is in PT-br, names the hypothesis, the case slug, the subject
  type the case version declares, and the concepts that do not accept that subject type.
- HypothesisRevisionCollectsNoConceptError's message is in PT-br, names the hypothesis and the case slug,
  and states that a hypothesis revision collects at least one concept.
- The three messages are distinguishable from one another by their text alone, so an operator reading
  one can tell which of the three conditions occurred.
- The three messages name the hypothesis and the case in the same order and with the same PT-br wording
  as one another.
- No message states a fact its English original did not state, and every interpolated value in each PT-br
  message also appeared in that class's English message.
- Each message uses "caso" for a case, "hipótese" for a hypothesis, "revisão" for a hypothesis revision
  and "conceito" for a concept, and uses no English domain noun.
- Each of the three classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the three classes to the HTTP status
  it mapped to before.
- Each of the three classes' context property holds exactly the properties and values it held before,
  with no value moved into or out of it.
- The suite under src/src/__tests__ passes with no test file changed.
---
## What it is
The three refusals a revision meets on account of what it collects: a concept the glossary does not publish, a concept that does not accept the case version's subject type, and no concept at all.
Two of the three end in a list of concept names, and the PT-br introduces that list the same way in both.

## Notes
The concept names these messages carry are glossary terms and are not translated.
None of the three is asserted against literal message text by any existing test.
ADVISORY, from the specification — ConceptRefusesSubjectTypeError also answers a revise whose draft's stored subject attribute names a subject type the glossary does not hold (a-revise-reads-its-drafts-declared-subject-type-...), which introduces no refusal of its own; the PT-br message must stay true in that branch too, so it must not describe the interpolated subject type as a term the glossary is known to hold.
REMAINDER, from the specification — case-terms-exist-in-the-glossary's wider clause (that a case version's own named subject type, outcome, action and recipient also exist in the glossary) belongs to sibling tasks of this epic that rewrite the glossary term refusals, not this task's three hypothesis-collects classes.
