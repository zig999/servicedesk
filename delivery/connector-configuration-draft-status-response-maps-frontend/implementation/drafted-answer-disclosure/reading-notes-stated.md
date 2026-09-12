---
target: frontend
title: Reading notes stated in the Configuration Helper's draft disclosure
summary: Adds a "Reading notes" section to the Configuration Helper's drafted-answer disclosure, stating
  each reading note's kind (as a distinguishable label), subject and, where carried, its detail, fed from
  the existing ConnectorConfigurationDraft.reading_notes array.
task: sha256:5b2a5dd01b9a192b5b07af7d71444c7a7cba6604b3c4d2a1d9f269e16819f1c5
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-reading-notes-stated-build-2
files:
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: Adds ReadingNoteDisclosure (kind, kindLabel, subject, detail), a READING_NOTE_KIND_LABEL
    dictionary mapping each of the nine ConnectorConfigurationDraftReadingNoteKind values to a distinct
    human-readable label (falling back to the raw kind for any unmapped value), a readingNoteKindLabel
    lookup, and a readingNotes field on DraftDisclosure populated by draftDisclosureFrom() mapping
    (draft.reading_notes ?? []) one-to-one with no filtering or reordering -- defaulting to an empty
    array so a caller's draft omitting the field does not crash the projection, following the same
    pattern already used for status_readings and response_fields.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Renders a "Reading notes" section (shown only when draft.readingNotes.length > 0, following
    the Status readings/Response fields convention) listing each note's subject, its kindLabel and, where
    carried, its detail in parentheses; each list item keyed by `${note.kind}:${note.subject}` rather than
    array index, per the project's react/no-array-index-key rule.
criteria:
- criterion: Each reading note the answer carries is stated with the kind that note names.
  met: true
  how: draftDisclosureFrom() copies note.kind into ReadingNoteDisclosure.kind unchanged and derives
    kindLabel from it via readingNoteKindLabel(); the section renders kindLabel for every note in
    draft.readingNotes.
- criterion: Each reading note is stated with the subject that note names, exactly as the answer named
    it.
  met: true
  how: note.subject is copied unchanged into ReadingNoteDisclosure.subject, and the section renders it
    verbatim as the note's leading span.
- criterion: Where a reading note carries a detail, that detail is stated beside its subject.
  met: true
  how: 'note.detail is carried through as string | undefined; the section renders "(detail: {detail})"
    immediately after the subject and kindLabel only when detail !== undefined.'
- criterion: Each of the nine kinds the draft's reading-note vocabulary holds is stated distinguishably
    from every other, none presented as another.
  met: true
  how: READING_NOTE_KIND_LABEL gives each of the nine ConnectorConfigurationDraftReadingNoteKind values
    (default-response-not-drafted, status-range-not-drafted, non-json-success-content-not-read,
    envelope-read-through, variants-united, repeated-field-name-path-not-taken, no-responses-declared,
    no-success-response-schema, success-schema-declares-no-properties) its own distinct label text, and
    an unmapped kind falls back to its raw token -- so no two kinds render the same string.
- criterion: No note the answer did not carry is stated.
  met: true
  how: the section maps only over draft.readingNotes, itself built only from draft.reading_notes with
    no synthetic or default entries added anywhere in the pipeline, and the whole section is omitted
    when that array is empty.
nodes:
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: This task answers exactly the rule's reading-notes clause -- every reading note the answer
    carries, each by its kind and its subject and, where carried, its detail, each kind apart from
    every other -- leaving every other clause to the sibling tasks the task's own Notes attribute
    them to.
- node: domain/integration/connector-configuration-draft-reading-note
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: ReadingNoteDisclosure mirrors the value object's three attributes one-to-one -- kind, subject
    and the optional detail -- and the render states all three.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: READING_NOTE_KIND_LABEL gives one distinguishable label per one of the enumeration's nine
    values, drawn from that node's own Description of each condition.
- node: domain/integration/connector-configuration-draft
  how: This task only consumes the already-grown reading_notes attribute of ConnectorConfigurationDraft
    exactly as declared, without altering its shape or that of any other attribute. Honored rather
    than encoded here.
- node: scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: Demonstrates the scenario's clause that the surface states each reading note with its kind
    and its subject, each kind apart from every other.
inferences:
- inferred: The nine kind labels are short paraphrases of domain/integration/connector-configuration-draft-reading-note-kind's
    own per-value prose rather than that prose verbatim or the raw machine token.
  from: The task's own Notes (ADVISORY) leave wording, order and placement to the interface, and the
    existing UNRESOLVED_REASON_LABEL convention in connector-configuration-draft-disclosure.ts already
    turns a machine-readable reason token into operator-facing prose in this same file.
- inferred: An unrecognized kind value falls back to the raw token via READING_NOTE_KIND_LABEL[kind] ??
    kind, the same fallback shape unresolvedReasonLabel already uses.
  from: The existing unresolvedReasonLabel function in the same file, reused as the convention for a
    lookup over a closed-but-string-typed machine vocabulary.
- inferred: The reading_notes field is read defensively with draft.reading_notes ?? [] even though
    ConnectorConfigurationDraft's own TypeScript type declares it required.
  from: The mandatory defensive-default convention established during status-readings-stated and
    response-fields-stated, given the pre-existing test fixtures that still omit these newer fields.
- inferred: Each list item is keyed by `${note.kind}:${note.subject}` rather than array index.
  from: The project's react/no-array-index-key lint rule, caught by the first build attempt
    (build-1, failed on lint); fixed by keying on the two fields a reading note is stated by.
preserved:
- The Status readings and Response fields sections, and everything else ConnectorConfigurationDraftDisclosure
  already rendered (configuration text, Apply button, Unresolved, Generated credentials, Method
  mismatch), untouched by this task.
- The existing UNRESOLVED_REASON_LABEL dictionary and unresolvedReasonLabel function, untouched.
deferred:
- what: The pt-BR wording of every English string this task adds (the section heading "Reading notes"
    and the nine kind labels).
  why: The task's own instructions name this a separate sibling task (pt-br-message-module), and plain
    English strings are explicitly stated as fine here.
---

## What it is
The statement of what the draft read past and what it read through -- a default response not drafted, a status range not drafted, a non-JSON success content not read, an envelope read through, variants united, a repeated field name whose path was not taken, and the three conditions met at the operation as a whole.

## Notes
Build round 1 failed lint: `react/no-array-index-key` on the reading-notes list item's key, which
combined `${note.kind}:${note.subject}:${index}`. Fixed by dropping the index, keying on
`${note.kind}:${note.subject}` alone -- the same two fields the note is stated by. Build round 2 green.
