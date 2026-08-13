---
title: The curator submits a case version whole
summary: The command that takes one case version, answers every validator rule at that write, and stores nothing when any of them refuses.
rationale: The scope states the curator authors through the command this contract publishes and the inventory reports no authoring entry point exists in the tree; the validation refusals stay in this one task because they are one write's answer and the specification requires them to arrive together.
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/case-store
  - task/relational-stores/glossary-store
  - task/relational-stores/capability-store
  - task/case-and-investigation-model/case-aggregate-shape
objective: A case version submitted whole is stored exactly when every validator rule holds at that write, with every refusal arriving together.
criteria:
  - A submission of one valid case version stores it and answers with its slug and version.
  - A submission naming a slug and version already stored is refused rather than merged.
  - A submission that holds against every validator rule is not refused by this command.
  - A submission naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term.
  - A submission whose hypothesis collects a concept that does not accept the case's declared subject type is refused, naming the concept and the subject type.
  - A submission whose hypothesis collects a concept with no registered read-only capability declaring an output schema and a timeout is refused, naming the concept.
  - A collected concept whose glossary registration states no ttl is read with the default of sixty seconds rather than refusing the submission.
  - The capability check answers from the registration as it stands at this submission, never from one read earlier.
  - A submission violating several rules is refused once, naming every violation together.
  - Nothing is stored when a submission is refused.
implements:
  - contracts/system/case-authoring
  - contracts/knowledge/author-case-version
  - contracts/knowledge/vocabulary-terms
  - contracts/knowledge/capability-check
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - scenarios/knowledge/a-subject-mismatch-refuses-the-case
---

## What it is

The curator's entrance now that no file is the medium.
Knowledge improves by curation rather than by code, and a revision is the next version rather than an edit to the last.

## Notes

The structural validator at src/src/case/parse-case-document.ts and the coherence validator at src/src/case/validate-case-coherence.ts are called rather than reimplemented, per the inventory.
The specification names this command and the payload it carries and names no transport for it, so which transport publishes it is the project's arrangement rather than a domain fact.
UNDERDETERMINED, from the specification — criterion 3's totality rests on the five candidate cross-context rules alone; the case's own structural rules (hypothesis count, criterion, resolution, position and name uniqueness, precedence) sit outside this task's implements, and a command answering only the five candidates while storing a structurally invalid case would pass every criterion as written. Confirm those rules are answered by task/case-and-investigation-model/case-aggregate-shape, which this task calls.
UNDERDETERMINED, from the specification — "one case version whole" is the payload and no candidate here states its shape; domain/knowledge/case and domain/knowledge/hypothesis, which do, are outside this task's implements and are reached instead through the dependency on task/case-and-investigation-model/case-aggregate-shape.
Decision, beyond the covers — stand: domain/knowledge/case and domain/knowledge/hypothesis are named only to point at the task that owns their shape; this task's own criteria assert nothing about either.
UNDERDETERMINED, from the specification — criteria 1 and 10 turn on a store and its atomicity, which constraints/the-system-persists-to-one-relational-database and constraints/the-stored-schema-mirrors-the-declared-model state and this task does not implement; a command storing the root before its hypotheses without one transaction would pass every criterion as written, and a test must exclude it.
Decision, beyond the covers — stand: constraints/the-system-persists-to-one-relational-database and constraints/the-stored-schema-mirrors-the-declared-model are named only to identify the gap the test must exclude; they are answered by the store tasks this command depends on, not by this task's own criteria.
REMAINDER, from the specification — rules/glossary/the-non-conclusion-outcomes-precede-the-first-case reaches no criterion of this task, which reads the glossary but cannot seed it; it belongs to task/case-authoring/curated-data-seeded.
REMAINDER, from the specification — the second clause of rules/knowledge/validation-runs-at-every-read, "a replay reads the pinned version without revalidation", and the wider "at each load by the engine" reach no criterion here, since this task is the authoring write alone; they belong to the read path, served by contracts/knowledge/case-query.
Decision, beyond the covers — stand: contracts/knowledge/case-query is named only to point at where the remainder belongs; this task neither implements nor calls it.
ADVISORY, from the specification — contracts/knowledge/vocabulary-terms and contracts/knowledge/capability-check each name an upstream outside this task's implements (contracts/glossary/glossary-query, contracts/integration/capability-registry); criteria 4 through 8 cannot be exercised until those published sides exist.
Decision, beyond the covers — stand: contracts/glossary/glossary-query and contracts/integration/capability-registry are named only as the upstreams this task's two consumed contracts point to, so a reader can confirm the dependency exists; this task implements neither.
