---
target: frontend
title: Reading notes stated in the Configuration Helper's draft disclosure -- proof
summary: Proves the drafted answer's per-reading-note disclosure at both the projection layer and the
  rendered surface -- kind, subject and, where carried, detail always stated, the nine-kind vocabulary
  pairwise distinct, and no note the answer did not carry ever invented -- via two new sibling spec files.
implementation: sha256:5706dc89057b4df86d5b673bb676b5a69dd8e3d1c8c72bf8b60ccae8f51d0eab
run: run/drafted-answer-disclosure-reading-notes-stated-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
  name: copies kind and subject through unchanged for every note, carries a carried detail through, and
    carries no detail for a note naming none
  proves: Criteria 1, 2 and 3 at the projection layer -- kind, subject and, where carried, detail stated
    exactly as the note named them.
  fails_when: the projection drops, renames or alters a note's kind or subject, or fabricates/drops a
    carried detail instead of carrying it through exactly as the note carries it.
  demonstrates: domain/integration/connector-configuration-draft-reading-note
- file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
  name: produces nine pairwise-distinct labels for the nine closed-set kind values
  proves: Criterion 4, whole -- each of the nine kinds the draft's reading-note vocabulary holds is stated
    distinguishably from every other.
  fails_when: two or more of the nine kinds collapse onto the same label, so one is presented as another.
  demonstrates: domain/integration/connector-configuration-draft-reading-note-kind
- file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
  name: carries through an empty array rather than inventing a reading note
  proves: Criterion 5, at the projection layer, the empty case.
  fails_when: the projection synthesizes a reading note despite an empty reading_notes list.
- file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  name: renders each note's own subject paired with a translated kind label, and the detail only for the
    note that carries one
  proves: Criteria 1, 2 and 3 at the rendered surface, the general case -- each note's subject stated
    verbatim, its kind stated as a translated label rather than the raw token, and its detail stated
    beside the subject only where carried.
  fails_when: the rendered surface stops stating a note's own subject, states the raw kind token in place
    of a translated label, or renders a carried detail incorrectly or a detail for a note that carries
    none.
- file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  name: renders each note's own subject paired with a translated kind label, and the detail only for the
    note that carries one
  proves: The reading-notes clause of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
    -- every reading note the answer carries stated by its kind and its subject and, where carried, its
    detail, each kind apart from every other.
  fails_when: the surface stops stating a carried reading note's kind, subject or detail, or states a note
    the answer did not carry.
  demonstrates: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  name: renders each note's own subject paired with a translated kind label, and the detail only for the
    note that carries one
  proves: 'The reading-notes clause of scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
    (partial): the fixture''s second note reproduces the scenario''s own given (kind default-response-not-drafted,
    subject default) and the surface states it apart from every other note kind, exactly as the scenario''s
    then-clause requires.'
  fails_when: the surface stops stating the scenario's own default-response-not-drafted note by its subject
    default, distinguishably from its raw kind token.
- file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  name: renders no Reading notes section
  proves: Criterion 5 at the rendered surface, the empty case.
  fails_when: any reading-note text or a "Reading notes" heading renders when draft.readingNotes is empty.
not_applicable:
- edge_case: Two reading notes sharing the same kind and subject.
  why: Neither the rule, the domain node nor any criterion states uniqueness within one draft's reading_notes;
    each is treated positionally.
- edge_case: A reading note's detail carried as an empty string rather than omitted.
  why: No criterion or node treats an empty string specially for this optional attribute.
- edge_case: A reading-note kind value outside the nine the closed type admits.
  why: ConnectorConfigurationDraftReadingNoteKind is a closed nine-literal union; constructing such a fixture
    requires bypassing TypeScript, and the type's own closure (refusing a tenth kind) is already covered
    by the sibling task's own type-level test (draft-answer-parts-reach-the-surface).
- edge_case: Concurrent or overlapping draft requests changing reading_notes mid-render.
  why: No criterion or node of this task addresses concurrency; the outcome state machine's own stale-disclosure
    clearing is already covered by pre-existing tests this task does not touch.
untested:
- domain/integration/connector-configuration-draft's fact spans connector, configuration, unresolved,
  generated_credentials, method_mismatch, status_readings and response_fields as well as reading_notes;
  this task only consumes the already-grown reading_notes attribute unaltered.
- scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes, as a whole -- this
  task answers only its reading-notes then-clause, per its own Notes (the status-readings, response-fields
  and method-mismatch then-clauses belong to sibling tasks). The reading-notes clause specifically is
  exercised by the render test's second fixture note (matching the scenario's own given), but no single
  task's proof recomposes the scenario's full given/then in one test, so the scenario as a whole stays
  unproven here.
- The implementation's inference that reading_notes is read defensively with draft.reading_notes ?? []
  even though domain/integration/connector-configuration-draft's own attribute is declared required -- not
  a fact any node or criterion states (the node requires it present), so not pinned by a test.
- The implementation's inference that an unrecognized kind value falls back to the raw token via
  READING_NOTE_KIND_LABEL[kind] ?? kind, reused from the existing unresolvedReasonLabel convention -- the
  nine-value closed type already refuses a tenth kind at compile time, so no criterion or node reaches
  this runtime fallback path; recorded as an inference, not pinned.
- The implementation's inference that the nine kind labels are short paraphrases of connector-configuration-draft-reading-note-kind's
  own per-value prose rather than that prose verbatim or the raw token -- an inference about wording, not
  a fact any node states beyond requiring distinguishability (already proven); not pinned by a test.
- The task's ADVISORY note over criterion 4's presentation choice -- it observes that which control carries
  each kind's meaning, its wording, order and placement are left to the interface, rather than naming an
  implementation the specification refuses; no test is owed.
- The implementation's inference that each reading-note list item is keyed by `${note.kind}:${note.subject}`
  rather than array index -- an arrangement inference driven by the project's react/no-array-index-key
  rule, not a behavior fact; no test.
---

## What it is
The proof of the reading-notes statement -- projection and render, kind and subject and carried detail, the nine-kind vocabulary kept apart, and nothing invented.

## Notes
None.
