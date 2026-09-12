---
title: The Helper states the draft's response fields
summary: Each field the answer carries is stated with its name, its path, the status it was read from
  and what the schema declared about it.
rationale: Cut apart from the status readings and the reading notes because it is a separate statement
  over a separate part of the answer, demonstrable over an answer carrying only response fields.
objective: Every response field an answered draft carries is stated to the operator with its name, its
  path, its status and the document's own account of it.
criteria:
- Each response field the answer carries is stated with the name that field names.
- Each response field is stated with the path drafted as its responseMap value.
- Each response field is stated with the success status it was read from.
- Where a response field carries its declared type, its declared required listing or the envelope it was
  read through, each of those the answer carries is stated.
- No field, path or status the answer did not carry is stated.
depends_on:
- task/drafted-answer-disclosure/draft-answer-parts-reach-the-surface
sources:
- intake/scope.md
implements:
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft
- scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
---

## What it is
The statement of the drafted responseMap's provenance -- each entry beside the type, the required listing and the envelope the document declared for it.
It carries what the drafted JSON text itself cannot.

## Notes
REMAINDER, from the specification -- The statement of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator also requires the drafted configuration text, every unresolved item by its name and its reason with the reasons of domain/integration/connector-configuration-draft-unresolved-reason held apart, every generated credential by its generated name and its security scheme's own name, the method mismatch's registered and operation methods where one is carried with none stated where none is, and the Configuration field's content unchanged by the answer's arrival. No criterion of this task reaches any of those clauses. Belongs to task/drafted-answer-disclosure/draft-answer-parts-reach-the-surface and the sibling tasks stating those parts.
REMAINDER, from the specification -- The clause requiring every status reading the answer carries to be stated by its status, its ending and what the document declared it as -- the fact domain/integration/connector-configuration-draft-status-reading holds -- reaches no criterion of this task; the task's rationale names the status readings as cut apart from it. Belongs to the sibling task of this epic stating the draft's status readings.
REMAINDER, from the specification -- The clause requiring every reading note the answer carries to be stated by its kind and its subject and, where carried, its detail, with the kinds of domain/integration/connector-configuration-draft-reading-note-kind each stated apart from every other, reaches no criterion of this task; the task's rationale names the reading notes as cut apart from it. Belongs to the sibling task of this epic stating the draft's reading notes.
ADVISORY, from the specification -- scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes is shared with the sibling tasks: of its then clauses only the response-fields one falls to this task, the drafted configuration text, the status readings, the note and the method mismatch falling to the tasks named above. The scenario is not demonstrable end to end by this task alone.
ADVISORY, from the specification -- rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes states that a stated draft is marked stale from the moment the surface's link, chosen operation or connector name differs from what it was generated for. No criterion of this task addresses how the stated response fields behave under that marking; it is a neighbour of the statement this task implements, not part of it.
