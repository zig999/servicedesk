---
subject: rules/knowledge/a-concept-accepts-the-declared-subject-type
given:
  - a case declares subject type customer
  - one of its hypotheses collects equipment-state, which accepts only contract
when:
  - the case is read for validation
then:
  - the validation refuses the case, naming the concept and the subject type that disagree
involves:
  - domain/knowledge/case
  - domain/glossary/concept
---

## Description

The coherence check runs where the curator is, at reading, never first at execution during a customer call.
