---
title: >-
  Proof that the evaluator port and its prompt carry the snapshotted per-item semantics
summary: >-
  Tests proving EvidenceItem's widened per-item field semantics and concept description reach the
  rendered judgment prompt inside the closed data block, are omitted correctly when a concept
  description is empty, and leave prompt assembly pure — plus the two pre-existing spec files'
  own EvidenceItem fixtures repaired so the tree type-checks against the widened port again.
implementation: sha256:5b3365a6255e48a3be675b3f53c084c1ec59e18da40cbaa7256d71d76a2deea9
run: run/pinned-evidence-semantics-full-suite-final-2
tests:
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "sends byte-identical prompt content across two calls carrying the same criterion, evidence (including its own field semantics and concept description) and case context"
    proves: >-
      "Prompt assembly remains a pure function of exactly the criterion, the evidence's own
      snapshotted semantics, and the pinned case's title and when_to_use." This pre-existing test
      is extended here so its two evidence fixtures each carry a non-empty fields array (with a
      field's own type and description) and a non-empty concept_description, rather than the old
      bare declaredFields list, so the purity guarantee is now asserted over the widened shape
      these new inputs add, not only over the narrower one this task replaces.
    fails_when: >-
      Two calls carrying structurally identical (but distinct-instance) criterion, evidence — its
      own fields and concept_description included — and case context render different prompt
      text, which would mean prompt assembly reads something beyond its own three parameters (a
      clock, a live registry or capability lookup, or any other mutable state).
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "carries the given criterion, evidence observation, its own concept description, its own field semantics, case title and case when_to_use inside one delimited block"
    proves: >-
      "The judgment prompt's evidence block names, for each item, its own field semantics and its
      concept's own description, inside the closed data block." This pre-existing test is rewritten
      here to construct an EvidenceItem carrying a marker fields entry (its own name, type and
      description) and a marker concept_description, and to assert each of those marker strings —
      not merely the old marker field name alone — reaches the rendered prompt content.
    fails_when: >-
      Any of the criterion, the evidence item's own observation, its own concept_description, its
      own field's name, type or description, the case title or the case when_to_use stops
      reaching the rendered <judgment_input> block.
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "renders each evidence item's own field semantics as its own <field> elements inside its own <fields>, each carrying its own name plus its own type attribute and description text exactly where the snapshot declared them, and never invented where it declared neither"
    proves: >-
      Both "EvidenceItem carries each item's own snapshotted field semantics (name, and type and
      description where declared) and its concept's own snapshotted description." and "The
      judgment prompt's evidence block names, for each item, its own field semantics and its
      concept's own description, inside the closed data block." Two evidence items are
      constructed — one carrying a fully-declared field (name, type and description) alongside a
      name-only field, the other carrying no fields at all — and the test reads each item's own
      isolated rendered block (via the itemBlockOf helper this test file adds) to assert that a
      field's own name, type and description are all read straight off the EvidenceItem the test
      itself constructed and rendered without invention, and that neither item's own fields reach
      the other's <fields> block.
    fails_when: >-
      itemBlock/fieldsBlock/fieldElement stop rendering one <field> element per snapshotted field
      carrying that field's own name (and its own type attribute and description text exactly
      where declared), invent a type or description value the snapshot did not declare, or let one
      item's own fields leak into a neighboring item's own <fields> block.
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "renders a field's own type attribute independently of its own description text — present for one without the other in either direction, and never coupling the two together"
    proves: >-
      "EvidenceItem carries each item's own snapshotted field semantics (name, and type and
      description where declared) and its concept's own snapshotted description." — read narrowly
      for the "where declared" clause: a field's own type and its own description are each
      independently optional, so a field carrying one without the other must render exactly that,
      never both or neither as a coupled pair.
    fails_when: >-
      fieldElement renders a field's own type attribute only when a description is also present
      (or vice versa) instead of treating field.type and field.description as two independently
      optional facts, each rendered — or omitted — on its own.
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "renders each evidence item's own concept description as its own <concept_description>, and the closed <evidence> block carries it alongside the item's own fields and observation"
    proves: >-
      "The judgment prompt's evidence block names, for each item, its own field semantics and its
      concept's own description, inside the closed data block." The test asserts, by index
      ordering over the raw rendered text, that the item's own <concept_description> element sits
      strictly between the <evidence> block's own opening and closing tags — not merely somewhere
      in the whole prompt.
    fails_when: >-
      An item's own concept_description stops being rendered as its own <concept_description>
      element, or that element is rendered outside the <evidence>...</evidence> span (for example,
      hoisted to sit beside <criterion> or <case_title> instead of inside the item it names).
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "omits the <concept_description> tag entirely for an item whose concept_description is the empty string, naming that item by its concept alone with no stated meaning, while still carrying its own fields and observation"
    proves: >-
      "The judgment prompt's evidence block for an item whose concept_description is empty names
      that item by its concept alone, with no stated meaning." The item's own isolated rendered
      block (via itemBlockOf) is asserted to contain no "concept_description" substring at all —
      not an empty tag, not a whitespace-only one — while its own <field> element and its own
      <observation> are still present and unaffected.
    fails_when: >-
      An item whose concept_description is the empty string still renders a <concept_description>
      tag of any kind (empty or otherwise), or the empty concept_description otherwise suppresses
      that item's own fields or observation instead of leaving them exactly as given.
  - file: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts"
    name: "escapes reserved XML characters in an item's own concept_description and field name/type/description, so none of them can break out of the closed data block"
    proves: >-
      The closed data block's own security posture (constraints/the-judgment-prompt-is-closed, as
      the implementation record's own `nodes` entry for it states) is preserved for the two new
      per-item facts this task adds: an item's own concept_description and a field's own name,
      type and description each pass through the same escaping discipline every other piece of
      evidence-carried text already had to. This bears on "The judgment prompt's evidence block
      names, for each item, its own field semantics and its concept's own description, inside the
      closed data block." too — content that could break the block open is not "inside" it in any
      meaningful sense.
    fails_when: >-
      Any of an item's own concept_description, field name, field type or field description is
      rendered without passing through escapeForXmlText/escapeForXmlAttribute, letting a reserved
      character (<, >, & or, for an attribute, ") reach the rendered prompt unescaped.
not_applicable:
  - edge_case: >-
      Two fields sharing the same name within one item's own fields array (a duplicate field
      name).
    why: >-
      No bound node requires the port or the adapter to deduplicate or validate uniqueness among
      an item's own field names — both render exactly the FieldSemantics[] they are handed, in
      order, without judging its content. Any deduplication, if it happens at all, is
      field-semantics.ts's own concern at collection time (a different, already-delivered task),
      never this task's port or prompt-assembly.
  - edge_case: >-
      Two evaluate() calls racing each other concurrently.
    why: >-
      buildUserPrompt and every function it calls (evidenceBlock, itemBlock,
      conceptDescriptionLines, fieldsBlock, fieldElement) are synchronous, side-effect-free
      functions of exactly their own parameters, reading no shared mutable state (SYSTEM_PROMPT and
      DEFAULT_MAX_TOKENS are both read-only module constants) — so two concurrent calls cannot
      observe or corrupt each other's rendering. This is exactly what the purity test already
      establishes per call; nothing about running two calls at once introduces a new failure mode
      this task's own criteria raise.
  - edge_case: >-
      An EvidenceItem whose fields property is absent entirely, rather than an empty array.
    why: >-
      fields is a required (non-optional) readonly FieldSemantics[] on the widened EvidenceItem
      type, so TypeScript itself refuses a literal that omits it — there is no runtime path to
      reach fieldsBlock with an undefined fields value. The boundary this task's own criteria
      actually raise is the zero-length array, which the field-semantics rendering test above
      exercises directly (concept-two's empty fields array).
  - edge_case: >-
      A field whose own name is the empty string.
    why: >-
      No bound node states that a field's own name must be non-empty, and whether such a value is
      ever produced is field-semantics.ts's own concern at collection time (a sibling,
      already-delivered task), not something this port or adapter polices or this task's own
      criteria describe. Testing it here would assert a shape neither the port nor the adapter
      makes any claim about.
untested:
  - >-
    "The project's configured PROMPT_VERSION value for judgment differs from its value before this
    change." src/.env is listed in .gitignore and is untracked, so no test in this suite (or any
    suite) can read or assert its line-for-line content, and no git diff of this delivery will ever
    show the v1→v2 change the implementation record describes. The implementation record's own
    `files` entry for `.env` and its own `criteria` entry for this exact criterion are the only
    record of that change this delivery can carry; this proof cannot add a behavioral test over an
    untracked local value and does not attempt one.
---

## What it is
Tests prove EvidenceItem's widened field-semantics and concept-description shape renders inside the judgment prompt's closed data block, and that an empty concept_description is omitted rather than stated. Pre-existing fixtures across both this task's own test files are updated to the widened EvidenceItem shape.

## Notes
Criterion 5 (the PROMPT_VERSION change) cannot be proven by any test, since src/.env is gitignored and untracked — the implementation record's own disclosure is the only record of that change.
