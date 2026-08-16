---
subject: rules/knowledge/a-concept-accepts-the-declared-subject-type
given:
  - a case version declares subject type customer
  - one of its manifested hypothesis-revisions collects equipment-state, which accepts only contract
when:
  - the case version is read for validation
then:
  - the validation refuses the case version, naming the concept and the subject type that disagree
involves:
  - domain/knowledge/case-version
  - domain/glossary/concept
---

## Description

The coherence check runs where the curator is, at reading, never first at execution during a customer call.
