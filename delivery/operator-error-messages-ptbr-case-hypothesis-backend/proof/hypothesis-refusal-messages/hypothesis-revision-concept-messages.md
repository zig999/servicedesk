---
target: backend
title: PT-br message proof for the three hypothesis-revision-collects refusals
summary: New unit tests over ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and HypothesisRevisionCollectsNoConceptError
  pin each class's PT-br message content, its fixed vocabulary, its unchanged name and context, and the
  three classes' mutual distinguishability and shared hypothesis/case opening.
implementation: sha256:5e08a67d6129526b31f95cd177b083e4c0218113a6797fac48f22873667126a2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-hypothesis-revision-concept-messages-suite-3
tests:
- file: src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the hypothesis, the case slug and the concepts
    the glossary does not hold
  proves: ConceptNotInGlossaryError's message is in PT-br, names the hypothesis, the case slug, and the
    concepts the glossary does not hold.
  fails_when: the message reverts to English, drops the hypothesis, the slug or a concept, or changes
    one of their values.
- file: src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
  name: names a hypothesis as "hipótese", a case as "caso" and a concept as "conceito", using no English
    domain noun
  proves: ConceptNotInGlossaryError's message uses the fixed PT-br nouns and no English domain noun.
  fails_when: the message stops containing "hipótese", "caso" or "conceito", or contains the English word
    "hypothesis", "case" or "concept".
- file: src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: ConceptNotInGlossaryError's name property still holds its unchanged class-name string.
  fails_when: error.name stops being "ConceptNotInGlossaryError".
- file: src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
  name: carries exactly the slug, hypothesis name and concepts in context, with no value moved into or
    out of it
  proves: ConceptNotInGlossaryError's context property holds exactly the properties and values it held
    before.
  fails_when: error.context stops being exactly { slug, hypothesis_name, concepts }.
- file: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the hypothesis, the case slug, the declared
    subject type and the concepts that refuse it
  proves: ConceptRefusesSubjectTypeError's message is in PT-br, names the hypothesis, the case slug, the
    subject type the case version declares, and the concepts that do not accept it.
  fails_when: the message reverts to English, drops the hypothesis, the slug, the subject type or a concept,
    or changes one of their values.
- file: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  name: names a hypothesis as "hipótese", a case as "caso" and a concept as "conceito", using no English
    domain noun
  proves: ConceptRefusesSubjectTypeError's message uses the fixed PT-br nouns and no English domain noun.
  fails_when: the message stops containing "hipótese", "caso" or "conceito", or contains the English word
    "hypothesis", "case" or "concept".
- file: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: ConceptRefusesSubjectTypeError's name property still holds its unchanged class-name string.
  fails_when: error.name stops being "ConceptRefusesSubjectTypeError".
- file: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  name: carries exactly the slug, hypothesis name, subject and concepts in context, with no value moved
    into or out of it
  proves: ConceptRefusesSubjectTypeError's context property holds exactly the properties and values it
    held before.
  fails_when: error.context stops being exactly { slug, hypothesis_name, subject, concepts }.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the hypothesis and the case slug, and stating
    that a revision collects at least one concept
  proves: HypothesisRevisionCollectsNoConceptError's message is in PT-br, names the hypothesis and the
    case slug, and states that a hypothesis revision collects at least one concept.
  fails_when: the message reverts to English, drops the hypothesis or the slug, or drops the at-least-one-concept
    fact.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: names a hypothesis as "hipótese", a case as "caso", a hypothesis revision as "revisão" and a concept
    as "conceito", using no English domain noun
  proves: HypothesisRevisionCollectsNoConceptError's message uses the fixed PT-br nouns and no English
    domain noun.
  fails_when: the message stops containing "hipótese", "caso", "revisão" or "conceito", or contains the
    English word "hypothesis", "case", "revision" or "concept".
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: HypothesisRevisionCollectsNoConceptError's name property still holds its unchanged class-name
    string.
  fails_when: error.name stops being "HypothesisRevisionCollectsNoConceptError".
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: carries exactly the slug and hypothesis name in context, with no value moved into or out of it
  proves: HypothesisRevisionCollectsNoConceptError's context property holds exactly the properties and
    values it held before.
  fails_when: error.context stops being exactly { slug, hypothesis_name }.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: is distinguishable from ConceptNotInGlossaryError by text alone, for the same hypothesis, case
    and concepts
  proves: the three messages are distinguishable from one another by their text alone -- the CollectsNoConcept/NotInGlossary
    pair.
  fails_when: the two classes construct an identical message string for the same hypothesis, case and
    concepts.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: is distinguishable from ConceptRefusesSubjectTypeError by text alone, for the same hypothesis,
    case and concepts
  proves: the three messages are distinguishable from one another by their text alone -- the CollectsNoConcept/RefusesSubjectType
    pair.
  fails_when: the two classes construct an identical message string for the same hypothesis, case and
    concepts.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: keeps ConceptNotInGlossaryError distinguishable from ConceptRefusesSubjectTypeError by text alone,
    for the same hypothesis, case and concepts
  proves: the three messages are distinguishable from one another by their text alone -- the NotInGlossary/RefusesSubjectType
    pair.
  fails_when: the two classes construct an identical message string for the same hypothesis, case and
    concepts.
- file: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  name: names the hypothesis and the case in the same order and with the same PT-br wording as ConceptNotInGlossaryError
    and ConceptRefusesSubjectTypeError
  proves: the three messages name the hypothesis and the case in the same order and with the same PT-br
    wording as one another.
  fails_when: any of the three messages stops opening with the identical `a hipótese "..." do caso "..."`
    fragment for the same hypothesis and slug.
not_applicable:
- edge_case: an empty-string slug or hypothesis name, or an empty concepts array, passed to any of the
    three constructors
  why: no criterion or node distinguishes behavior by the shape of these values; every constructor interpolates
    whatever it receives verbatim, validated upstream.
- edge_case: absent slug, hypothesis-name, subject or concepts argument
  why: every constructor declares these as required, non-optional parameters under the project's strict
    compiler configuration.
- edge_case: a boundary at each end of a numeric or size range
  why: none of the three constructors take a numeric or ranged argument.
- edge_case: a duplicate value where uniqueness is claimed
  why: no criterion or node claims uniqueness over these classes' concepts list.
- edge_case: an operation attempted against state that forbids it, or two operations against one subject
    at once
  why: all three classes are plain, synchronous, side-effect-free Error subclasses with no shared mutable
    state.
- edge_case: a dependency that fails, is unavailable or answers slowly
  why: none of the three classes perform I/O or call a dependency.
untested:
- 'Criterion ''No message states a fact its English original did not state...'' is not decidable by a
  runtime test: the English original text was overwritten and no artifact of it remains in the tree to
  compare against.'
- Criterion 'The suite under src/src/__tests__ passes with no test file changed' is an operational, delivery-level
  claim, not a behavior a Vitest test can assert.
- Criterion 'status-map.ts is unchanged...' is already evidenced by the pre-existing, unmodified status-map.spec.ts;
  no duplicate test was added for it here.
- rules/knowledge/case-terms-exist-in-the-glossary -- this task encodes only the concept clause; the wider
  clause is a disclosed REMAINDER, and the enforcement that raises ConceptNotInGlossaryError lives outside
  the files this task touched.
- rules/knowledge/a-concept-accepts-the-declared-subject-type -- this task rewrites only the message text;
  the enforcement lives in the hypothesis-revision service, outside the files this task touched.
- rules/knowledge/a-hypothesis-collects-at-least-one-concept -- this task rewrites only the message text;
  the enforcement lives outside the files this task touched.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- system-wide fitness; this
  task advances only three of the many mapped classes.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- same system-wide
  scope.
---
## What it is
Unit tests proving the three hypothesis-revision-collects refusals' PT-br message content,
vocabulary, preserved name/context, mutual distinguishability, and shared hypothesis/case opening.

## Notes
Two fixture defects were found and fixed during this proof's own review cycle: hypothesis-name and
concepts fixture values ("another-hypothesis", "a-concept") both contained the literal English
substring their own negative regex checked for, producing false failures the diagnosed suite run
traced to the test fixtures, not the implementation.
