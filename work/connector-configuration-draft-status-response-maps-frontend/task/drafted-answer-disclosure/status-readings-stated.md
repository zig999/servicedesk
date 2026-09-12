---
title: The Helper states the draft's status readings
summary: Each status the answer carries is stated with the ending drafted for it and with what the document
  declared that status as.
rationale: Cut apart from the response fields and the reading notes because each is a distinct statement
  over a distinct part of the answer and each can be shown met over an answer carrying only that part.
objective: Every status reading an answered draft carries is stated to the operator with its status, its
  ending and its declared description.
criteria:
- Each status reading the answer carries is stated with the status that reading names.
- Each status reading is stated with the ending the draft mapped that status to.
- Where a status reading carries what the document declared that status as, that description is stated.
- A status reading's status and its ending are distinguishable from one another, neither standing for
  the other.
- No status the answer did not carry is stated.
depends_on:
- task/drafted-answer-disclosure/draft-answer-parts-reach-the-surface
sources:
- intake/scope.md
implements:
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft
- scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
---

## What it is
The statement of the drafted statusMap's provenance -- the document's own account of each status beside the ending the draft chose for it.
It is what lets the operator judge that ending before applying the draft.

## Notes
REMAINDER, from the specification -- The clause of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator requiring the surface to state the drafted configuration text reaches no criterion of this task. Belongs to the sibling task that brings the draft answer's parts to the surface (task/drafted-answer-disclosure/draft-answer-parts-reach-the-surface), together with whichever task of the epic covers the Configuration field standing untouched.
REMAINDER, from the specification -- The statement clauses covering every unresolved item (by name and by reason, each reason apart from every other reason domain/integration/connector-configuration-draft-unresolved-reason holds) and every generated credential (by its generated name and by its security scheme's own name) reach no criterion of this task. Belongs to the sibling task stating the draft's unresolved items and generated credentials.
REMAINDER, from the specification -- The statement clause covering every response field the answer carries -- its name, its path, the status it was read from and, where carried, its declared type, its declared required listing and its envelope -- reaches no criterion of this task, as does domain/integration/connector-configuration-draft-response-field. Belongs to the sibling task stating the draft's response fields.
REMAINDER, from the specification -- The statement clause covering every reading note the answer carries -- its kind, its subject and, where carried, its detail, each kind stated apart from every other kind domain/integration/connector-configuration-draft-reading-note-kind holds -- reaches no criterion of this task. Belongs to the sibling task stating the draft's reading notes.
REMAINDER, from the specification -- The statement clause covering the method mismatch -- the registered method together with the drafted operation's, neither standing for the other, and no mismatch stated where the answer carries none -- reaches no criterion of this task. Belongs to the sibling task stating the draft's method mismatch.
ADVISORY, from the specification -- Criterion 4 ("neither standing for the other") has no counterpart phrasing in rules/integration/an-answered-draft-request-states-its-draft-to-the-operator, which attaches an explicit distinguishability demand only to the unresolved reasons, the reading-note kinds and the method mismatch's registered/operation pair; for status readings it says only that the surface states the status, the ending and, where carried, the declared_as. The criterion is readable as a demonstration of that clause and is implemented as such here.
ADVISORY, from the specification -- The ending a status reading carries is typed as domain/investigation/evidence-result by domain/integration/connector-configuration-draft-status-reading, and that node is not among the candidates. Nothing in the criteria needs the ending's vocabulary, so no claim is grown on that account.
Decision, beyond the covers — stand: domain/investigation/evidence-result is an unrelated, unchanged element this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
