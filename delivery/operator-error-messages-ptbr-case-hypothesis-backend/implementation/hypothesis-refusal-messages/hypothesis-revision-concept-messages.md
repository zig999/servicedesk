---
target: backend
title: PT-br messages for the three hypothesis-revision collects refusals
summary: ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and HypothesisRevisionCollectsNoConceptError
  now raise their message in Brazilian Portuguese, each naming the hypothesis and case in the same fixed
  wording and order.
task: sha256:0b18f74eecb509f81b1d347c84f33ee61487a5656b033128f3c3c54ddf2827eb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-hypothesis-revision-concept-messages-build-2
files:
- path: src/errors/concept-not-in-glossary.error.ts
  effect: The super() call now builds the PT-br sentence naming the hypothesis, case slug and the concepts
    the glossary does not hold; context, error.name and shape are unchanged.
- path: src/errors/concept-refuses-subject-type.error.ts
  effect: The super() call now builds the PT-br sentence naming the hypothesis, case slug, the declared
    subject type and the offending concepts; context, error.name are unchanged.
- path: src/errors/hypothesis-revision-collects-no-concept.error.ts
  effect: The super() call now builds the PT-br sentence naming the hypothesis and case slug and stating
    a revision collects at least one concept; context, error.name are unchanged.
criteria:
- criterion: ConceptNotInGlossaryError's message is in PT-br, names the hypothesis, names the case slug,
    and names the concepts the glossary does not hold.
  met: true
  how: The template literal interpolates hypothesisName, slug and the joined concepts into an all-PT-br
    sentence.
- criterion: ConceptRefusesSubjectTypeError's message is in PT-br, names the hypothesis, the case slug,
    the subject type the case version declares, and the concepts that do not accept that subject type.
  met: true
  how: The template literal interpolates hypothesis_name, slug, subject and the joined concepts.
- criterion: HypothesisRevisionCollectsNoConceptError's message is in PT-br, names the hypothesis and
    the case slug, and states that a hypothesis revision collects at least one concept.
  met: true
  how: The template literal interpolates hypothesisName and slug and states "não coleta nenhum conceito,
    e uma revisão coleta ao menos um".
- criterion: The three messages are distinguishable from one another by their text alone, so an operator
    reading one can tell which of the three conditions occurred.
  met: true
  how: Each message states a different condition in different words, sharing only the fixed hypothesis/case
    opening.
- criterion: The three messages name the hypothesis and the case in the same order and with the same PT-br
    wording as one another.
  met: true
  how: All three open with the identical construction `a hipótese "..." do caso "..."`.
- criterion: No message states a fact its English original did not state, and every interpolated value
    in each PT-br message also appeared in that class's English message.
  met: true
  how: Each PT-br sentence is a direct translation with no clause added or dropped, and the interpolated
    values match the English originals exactly.
- criterion: Each message uses "caso" for a case, "hipótese" for a hypothesis, "revisão" for a hypothesis
    revision and "conceito" for a concept, and uses no English domain noun.
  met: true
  how: All four fixed words are used where applicable; no English domain noun appears.
- criterion: Each of the three classes' name property still holds its unchanged class-name string.
  met: true
  how: this.name assignments were not touched by any edit.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the three classes to the
    HTTP status it mapped to before.
  met: true
  how: status-map.ts was not opened for writing.
- criterion: Each of the three classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: Every this.context assignment is untouched; only the super() template literal above it was edited.
- criterion: The suite under src/src/__tests__ passes with no test file changed.
  met: true
  how: A targeted search of the whole src/src/__tests__ tree (not just unit/errors, including error-handler.middleware.spec.ts)
    found no assertion pinning any of the three classes' literal message text; no test file was touched.
    The captured build's test-unit step passed on the second attempt (the first failure was an unrelated
    timing flake in anthropic-assessment-consolidator.adapter.spec.ts, confirmed by rerun).
nodes:
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/errors/concept-not-in-glossary.error.ts
  how: ConceptNotInGlossaryError's PT-br message states the policy's refusal condition for the concept
    clause of this rule; the wider clause about a case version's own subject type/outcome/action/recipient
    is a REMAINDER for sibling tasks.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/errors/concept-refuses-subject-type.error.ts
  how: ConceptRefusesSubjectTypeError's PT-br message states this policy's condition, naming the hypothesis,
    case, subject type and offending concepts.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  how: HypothesisRevisionCollectsNoConceptError's PT-br message states this invariant's condition.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/concept-not-in-glossary.error.ts
  - src/errors/concept-refuses-subject-type.error.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  how: All three messages are written entirely in Brazilian Portuguese.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/concept-not-in-glossary.error.ts
  - src/errors/concept-refuses-subject-type.error.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  how: Every occurrence of case/hypothesis/hypothesis-revision/concept uses the fixed word; no English
    word or raw lifecycle token appears.
inferences:
- inferred: '"subject type" is rendered as "tipo de sujeito" (not one of the nine fixed nouns).'
  from: The existing PT-br rendering already present in production code at src/case/parse-case-document.ts.
- inferred: '"glossary" is rendered as "glossário".'
  from: The plain Brazilian-Portuguese word; no existing precedent found in the tree.
- inferred: ConceptRefusesSubjectTypeError's clause "que a versão do caso declara" carries no version
    number, matching the English original.
  from: The English original's own wording and the constructor's context shape (no version field), plus
    the task's ADVISORY note.
deferred:
- what: Translating case-terms-exist-in-the-glossary's clause for a case version's own declared subject
    type/outcome/action/recipient.
  why: The task's Notes mark this REMAINDER, belonging to sibling tasks of this epic.
---
## What it is
Three hypothesis-revision-collects refusals rewritten whole in Brazilian Portuguese, sharing an
identical hypothesis/case opening so they read as one system.

## Notes
The first build attempt's test-unit step failed on an unrelated timing flake
(anthropic-assessment-consolidator.adapter.spec.ts asserting elapsed_ms >= 20, got 19); a rerun
passed clean with no code change, confirming it was not caused by this delivery.
