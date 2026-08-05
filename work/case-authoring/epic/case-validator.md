---
title: Case validator
summary: The validation of one case against the structural rules of a case and against the glossary's published vocabularies, refusing a case that does not hold together.
rationale: The scope named the validating rules as one half but left the cut inside it open, and this epic is drawn around what runs over one case and refuses it, claiming the glossary and integration definitions its checks read while leaving the investigation's own constructs out; the amendment's five nodes are not claimed here because no check reads a plan of collection, a citation or an assessment.
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
covers:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - definition/integration/capability
  - definition/investigation/subject
  - rule/knowledge/case-has-at-least-one-hypothesis
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
  - rule/knowledge/hypothesis-collects-at-least-one-concept
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/knowledge/concept-accepts-the-declared-subject-type
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
  - rule/knowledge/every-collected-concept-declares-a-ttl
  - rule/knowledge/one-falsifiable-claim-per-criterion
  - rule/glossary/recipient-is-a-role
uncovered:
  - node: definition/investigation/subject
    why: A subject is the one thing an investigation is about, named by type and identifier, and this plan runs no investigation; the case and every check over it speak only of the subject type the case declares, so nothing here names a subject instance.
  - node: rule/knowledge/one-falsifiable-claim-per-criterion
    why: The rule governs the authoring judgment behind a hypothesis's criterion rather than any structural property of the case, and a check for it would have to invent a mechanical reading of falsifiability that no node states, so this plan writes no check for it.
---

## What it is

The half of the scope that refuses rather than answers, drawn around one validation over one case.
One place where checks over a case are run and where a case any check refuses is refused.
One check per rule the scope named as structural or as vocabulary, each refusing for its own reason.
One reading of the published glossary and of what it records for a term, shared by the checks that need it.

## Notes

The cut is one task per rule because each rule refuses a different case for a different reason and each is demonstrable on its own, and grouping them would put several outcomes behind one objective.
The composition and the glossary reading are separate tasks because each is an interface the checks consume, and writing an interface and its consumers in one task joins two seams.
`rule/knowledge/hypothesis-name-is-unique-in-its-case` is claimed here and by the answering epic, where the case construct deliberately does not refuse a duplicate name, so the check in this epic has such a case to read.
`aggregate/knowledge/cases` is claimed here as well as by the answering epic because the aggregate states that a case and its hypotheses are validated as one thing, which is what the run over one case delivers.
The epic claims `definition/integration/capability` because the read-only capability rule reads what answers a collected concept, and that node is where what answers a concept is recorded.
No task here selects a language, a toolchain or a test harness, since the scope names none and the survey found an empty target, and each check's criteria are therefore stated as a refusal or a non-refusal observable from outside whatever is written.
