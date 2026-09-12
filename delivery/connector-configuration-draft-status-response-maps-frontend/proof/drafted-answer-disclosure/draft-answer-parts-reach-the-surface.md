---
target: frontend
title: The grown draft answer's parts round-trip through the frontend's reading, whole -- proof
summary: Four new tests over a new sibling spec file prove that status readings, response fields and reading
  notes each survive the reading with their required attributes always present and their optional ones
  present exactly when carried, and that the reading-note kind vocabulary is exactly the closed set of
  nine.
implementation: sha256:5b79dfa6a17e3f2beb67e26f0e68cd57e86735a1f3949d55ca7cdcb9e89df726
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-draft-answer-parts-reach-the-surface-suite-3
tests:
- file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
  name: carries declared_as through when the answer named one, and carries no declared_as key at all when
    it named none
  proves: A draft answer carrying status readings yields, on the frontend's reading of it, each status
    reading with its status, its ending and, where the answer carried it, what the document declared that
    status as.
  fails_when: pickConnectorConfigurationDraftFields drops status, ending or a carried declared_as from
    a status reading, or adds a declared_as key on a status reading whose answer never carried one.
  demonstrates: domain/integration/connector-configuration-draft-status-reading
- file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
  name: carries declared_type, declared_required and envelope through when the answer named them, and
    carries none of the three when it named none
  proves: A draft answer carrying response fields yields each response field with its name, its path and
    its status, and with its declared type, its declared required listing and its envelope where the answer
    carried them.
  fails_when: pickConnectorConfigurationDraftFields drops name, path, status, or a carried declared_type,
    declared_required or envelope from a response field, or adds any of those three optional keys on a
    response field whose answer never carried them.
  demonstrates: domain/integration/connector-configuration-draft-response-field
- file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
  name: carries detail through when the answer named one, and carries no detail key at all when it named
    none
  proves: A draft answer carrying reading notes yields each reading note with its kind and its subject,
    and with its detail where the answer carried one.
  fails_when: pickConnectorConfigurationDraftFields drops kind, subject, or a carried detail from a reading
    note, or adds a detail key on a reading note whose answer never carried one.
  demonstrates: domain/integration/connector-configuration-draft-reading-note
- file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
  name: carries all nine kinds through unmodified, in order, and refuses a tenth kind at the type level
  proves: The frontend's reading admits each of the nine kinds the draft's reading-note vocabulary holds
    and no kind outside it.
  fails_when: any of the nine kinds fails to round-trip unchanged through the reading, or a tenth, unnamed
    kind value ever type-checks as a ConnectorConfigurationDraftReadingNoteKind.
  demonstrates: domain/integration/connector-configuration-draft-reading-note-kind
not_applicable:
- edge_case: Two dispatches of a request whose answer carries status readings, response fields or reading
    notes, issued before the first settles.
  why: Concurrent dispatch is already governed by the pre-existing "a second dispatch while the first
    is in flight is ignored" test, which this task's type growth does not change; no criterion here states
    anything about concurrency.
- edge_case: Duplicate values among the nine reading-note kinds, or two response fields sharing one name
    or path.
  why: No criterion and no node states a uniqueness requirement over these arrays; the reading treats
    each array positionally and asserts nothing about repetition.
- edge_case: An answer omitting status_readings, response_fields or reading_notes entirely.
  why: Enforcing that a backend answer actually carries these required arrays is a backend contract-conformance
    concern, not something this task's criteria ask the frontend's own reading to detect or refuse.
untested:
- 'domain/integration/connector-configuration-draft: its declared fact spans how a draft is generated
  from an OpenAPI operation -- behavior this frontend-only task does not implement and a frontend test
  cannot decide whole. The criterion-5 half reachable here is already proven by pre-existing tests, but
  that is a part of the node''s fact, not the whole of it.'
- 'contracts/integration/connector-configuration-draft: its fact is that the published operation generates
  a draft and discloses the draft alone -- backend generation and classification semantics no frontend
  test reaches.'
- 'rules/integration/a-connector-configuration-draft-response-carries-no-capability: its invariant is
  that the answer''s shape is identical across all three capability-registration states, a backend-generation
  fact spanning inputs this frontend task never constructs. Honored here, and one corner already exercised
  by a pre-existing test, but that corner is not the whole invariant.'
- 'constraints/the-openapi-document-is-fetched-by-the-backend: its fact is that no frontend module, anywhere,
  fetches the OpenAPI document directly. This task touched one file, and the existing scoped test is the
  totality this proof may claim over that one file.'
- 'The implementation''s inference that a status reading''s ending is typed as an unconstrained string
  rather than as domain/investigation/evidence-result''s own enumeration: not a fact any node in this
  task''s implements list states, so not pinned by a test.'
- 'The task''s UNDERDETERMINED note over criterion 1''s ending vocabulary: the note itself records a decision
  (Decision, beyond the covers -- stand) rather than naming an implementation the specification refuses;
  no test is owed.'
---

## What it is
Proof that the grown draft type and allow-list admit each new part whole.

## Notes
Suite round 1 failed lint (the widened spec file exceeded the 300-line max, fixed by splitting the four new tests into a sibling file). Suite round 2 failed one unrelated test in case-version-editor-screen-save.spec.ts, diagnosed as an environmental/timing flake (a router transition racing waitFor, in a file this task never touched). Suite round 3 passed clean.
