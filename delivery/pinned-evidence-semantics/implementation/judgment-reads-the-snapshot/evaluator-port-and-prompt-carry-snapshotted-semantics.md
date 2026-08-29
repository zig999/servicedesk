---
title: >-
  The evaluator port and its prompt carry the snapshotted semantics
summary: >-
  EvidenceItem widens to carry each item's own snapshotted field semantics and
  concept description in place of the bare declared-field list, and the
  production Anthropic adapter's prompt assembly renders them inside the
  closed data block, both unchanged in every other respect.
task: sha256:41689fb22ca372a54b58f3b9c128ef800853d58510ec0a6f57fc647f53123837
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/pinned-evidence-semantics-full-suite-final-2
files:
  - path: src/investigation/hypothesis-evaluator.port.ts
    effect: >-
      EvidenceItem no longer carries declaredFields (a bare field-name list);
      it now carries fields (readonly FieldSemantics[], each field's own name
      and, where declared, its own type and description) and
      concept_description (string, the empty string where none was snapshotted),
      alongside the concept and the reused ObservationOutcome shape. The
      module's own doc comments are rewritten to describe the new shape and
      to cite rules/investigation/judgment-reads-the-evidence-snapshot and
      the legacy-concept scenario for the empty-description case. No other
      exported type or the IHypothesisEvaluator interface itself changed.
  - path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    effect: >-
      SYSTEM_PROMPT's own prose is rewritten to describe the new per-item
      shape (a <concept_description>, present only where one is known; a
      <fields> block of <field> elements, each with its own name and, where
      known, its own type and description; and the item's own <observation>)
      and to point a citation's field at the name of one of an item's own
      <field> elements rather than at a flat "declared fields" list.
      evidenceBlock is rewritten into itemBlock/conceptDescriptionLines/
      fieldsBlock/fieldElement: itemBlock renders one <item> per evidence
      entry with its concept as an attribute, an optional escaped
      <concept_description> line (conceptDescriptionLines omits the tag
      entirely rather than rendering it empty, exactly where
      item.concept_description is the empty string), a <fields> block holding
      one <field name="..." type="..."> element per snapshotted field with
      its own escaped description as the element's text (the type attribute
      and the description text each omitted, not invented, where the
      snapshot declared neither), and an <observation> element carrying the
      escaped observation text. Every piece of item-carried text or attribute
      value passes through the existing escapeForXmlText/escapeForXmlAttribute
      helpers, unchanged, so the closed block's own security posture (data,
      never instruction; no way to break out of an attribute or a tag) is
      preserved exactly as before. buildUserPrompt's own doc comment and the
      module's own header comment are updated to describe prompt assembly as
      a pure function of the criterion, the evidence's own snapshotted
      semantics, and the pinned case's title and when_to_use, rather than of
      "five inputs" including a bare field-name list. No behavior of
      evaluate() itself, requestJudgment, parseJudgment, the no-data
      short-circuit, or the call-record (usage/elapsed_ms/prompt) handling
      changed.
  - path: .env
    effect: >-
      PROMPT_VERSION changes from v1 to v2 — the only line touched in this
      file. This file is listed in .gitignore (both .env and .env.test are),
      so this change is invisible to git diff and to any commit; it is
      disclosed here in prose because the file cannot otherwise be reviewed
      alongside the tracked source. No other line of this file was touched.
criteria:
  - criterion: >-
      EvidenceItem carries each item's own snapshotted field semantics (name,
      and type and description where declared) and its concept's own
      snapshotted description.
    met: true
    how: >-
      hypothesis-evaluator.port.ts's EvidenceItem type now declares
      `fields: readonly FieldSemantics[]` (FieldSemantics, from
      field-semantics.ts, already carries name plus optional type and
      description) and `concept_description: string` in place of the
      removed `declaredFields: readonly string[]`.
  - criterion: >-
      The judgment prompt's evidence block names, for each item, its own
      field semantics and its concept's own description, inside the closed
      data block.
    met: true
    how: >-
      anthropic-hypothesis-evaluator.adapter.ts's itemBlock renders, for
      every evidence item inside <judgment_input><evidence>, its own
      <concept_description> (where known), its own <fields> holding one
      <field> per snapshotted field with that field's own name/type/
      description, and its own <observation> — all inside the same closed
      block buildUserPrompt already assembles.
  - criterion: >-
      The judgment prompt's evidence block for an item whose
      concept_description is empty names that item by its concept alone,
      with no stated meaning.
    met: true
    how: >-
      conceptDescriptionLines answers an empty array (no <concept_description>
      line at all, rather than an empty tag) whenever item.concept_description
      is the empty string, so that item's own <item> element carries only its
      concept attribute, its <fields> and its <observation> — named by
      concept alone, exactly as
      scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone's
      own `then` states.
  - criterion: >-
      Prompt assembly remains a pure function of exactly the criterion, the
      evidence's own snapshotted semantics, and the pinned case's title and
      when_to_use.
    met: true
    how: >-
      buildUserPrompt, evidenceBlock, itemBlock, conceptDescriptionLines,
      fieldsBlock and fieldElement are all synchronous, side-effect-free
      functions of exactly their own parameters — no clock read, no I/O, no
      port or client call, no module-level mutable state — so the same
      criterion, evidence and caseContext always render byte-identical text,
      the same guarantee the pre-existing
      "sends byte-identical prompt content across two calls" test already
      established for the narrower, five-input shape and which nothing in
      this change disturbs: every new function reads only the EvidenceItem
      it is given and renders it, never re-deriving or re-fetching anything.
  - criterion: >-
      The project's configured PROMPT_VERSION value for judgment differs
      from its value before this change.
    met: true
    how: >-
      src/.env's PROMPT_VERSION line changes from v1 to v2 — this is the
      value config/env.ts's envSchema reads into Env.PROMPT_VERSION and that
      diagnose-server.factory.ts threads into Investigation.prompt_version.
      This file is gitignored and untracked (see the .env entry in files[]
      above and this record's own Notes), so a git diff of this delivery
      will never show this specific line changing; it is disclosed here in
      prose instead.
nodes:
  - node: domain/investigation/hypothesis-evaluator
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    how: >-
      The node's own Responsibility text — "given one hypothesis's
      criterion, its own evidence — each item's own snapshotted concept and
      field semantics alongside its observation — and the pinned case's
      title and when_to_use" — is now the literal shape EvidenceItem
      declares and the literal content the Anthropic adapter's prompt
      assembly renders; the production adapter still reads nothing live from
      the glossary or the capability registry itself, unchanged from before
      this task.
  - node: constraints/the-judgment-prompt-is-closed
    encoded_at:
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    how: >-
      The closed block's own permitted content — "criterion, its own
      evidence ... and the pinned case's title and when_to_use, in a
      delimited data block, with no tool calling available to the model" —
      grows by exactly the two facts the constraint's own Description names
      ("again by the semantics domain/investigation/evidence now snapshots"):
      each item's own field semantics and its own concept description. Every
      value entering the block — concept, concept_description, each field's
      name/type/description, the observation, the criterion, the case title
      and when_to_use — passes through escapeForXmlText or
      escapeForXmlAttribute exactly as before, and the request still
      declares no tools field at all, so the block stays data the model
      reads and never an instruction it can act on.
  - node: rules/investigation/judgment-reads-the-evidence-snapshot
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    how: >-
      The port and the adapter now only ever see and render the fields and
      concept_description an EvidenceItem is handed — neither one reads the
      glossary or the capability registry, and neither one derives, refreshes
      or reshapes what it is given, so a caller that hands evaluate() a
      snapshot taken at collection time gets a prompt built from exactly that
      snapshot. This task's own scope is narrower than the rule's full
      statement, though: judgment-stage.ts's own construction of EvidenceItem
      (toEvidenceItems) still resolves each cited concept's capability
      through ICapabilityQuery.readCapability at judgment time and reads
      declaredFieldsOf(outputSchemas[key]) from that live resolution — the
      exact live read this rule forbids — because this task's own objective
      and criteria name only the port and the prompt, and stopping that live
      read is explicitly task/judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry's
      own objective (see deferred below). So this delivery makes the rule
      honorable but does not yet make it held, end to end.
  - node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
    encoded_at:
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    how: >-
      Given an EvidenceItem whose concept_description is the empty string
      (the given: "a concept registered before concepts declared a
      description holds an empty one"), conceptDescriptionLines/itemBlock
      render that item with no <concept_description> tag at all, so the
      prompt names it by its concept alone with no stated meaning — the
      scenario's own `then`. This task does not implement the collection-time
      snapshotting that produces such an item (that is the sibling
      evidence-semantics-snapshot task, already delivered and depended on
      here): what this delivery contributes is the port and the prompt
      honoring an already-empty snapshot correctly.
  - node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
    how: >-
      This scenario's own `then` — a judgment carries the field semantics
      snapshotted at collection, unchanged by a capability re-registered
      afterward — is not realized by this delivery alone. This task widens
      only the port and the prompt to accept and faithfully render whatever
      EvidenceItem they are handed, without ever re-deriving or re-fetching
      its semantics; but judgment-stage.ts's own toEvidenceItems, explicitly
      out of this task's scope (see the task's own "Do NOT touch" instruction
      and deferred below), still re-resolves each concept's capability
      through the live registry on every judgment call, so a re-registration
      made after collection still reaches the prompt today. Closing that gap
      is the sibling task judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry's
      own objective.
inferences:
  - inferred: >-
      fake-hypothesis-evaluator.adapter.ts needed no source change to keep
      type-checking against the widened EvidenceItem, so none was made.
    from: >-
      Reading the file's own body: FakeHypothesisEvaluator.evaluate accepts
      `_evidence: readonly EvidenceItem[]` and never reads or constructs a
      value of that shape (the parameter is unused, prefixed accordingly),
      so widening EvidenceItem's own declared shape changes nothing this file
      itself has to satisfy structurally. The task's own text anticipated
      this file "needs the same type widening so it still compiles" — reading
      the file shows the type import alone already carries that widening
      through, with no literal to update.
preserved:
  - IHypothesisEvaluator.evaluate's own three-parameter signature (criterion, evidence, caseContext) and its own never-throws-for-any-of-the-three-verdicts contract, unchanged.
  - The closed data block's own security posture — every value entering it escaped through escapeForXmlText/escapeForXmlAttribute, and no tools field ever declared on the provider request.
  - The no-data short-circuit (any evidence item whose result is not ok answers inconclusive/no-data without ever reaching the model), unchanged.
  - The call-record behavior — elapsed_ms and prompt always present once a call is attempted, usage present only where a provider response actually came back, all three absent on a no-data outcome — unchanged.
  - parseJudgment/outcomeFromModelText's own judgment-failure fallback for an unparseable, ungrounded or code-fence-wrapped model answer, unchanged.
  - FakeHypothesisEvaluator's own seeded-by-criterion behavior and its deterministic zero-valued usage/elapsed_ms on every answer, unchanged.
  - Prompt assembly's own purity and determinism — the same inputs always render byte-identical prompt text.
deferred:
  - what: >-
      judgment-stage.ts's own toEvidenceItems still constructs EvidenceItem
      as `{ concept: item.concept, result: 'ok', observation: item.observation,
      declaredFields: declaredFieldsOf(outputSchemas[key]) }` — a shape that
      no longer satisfies the widened EvidenceItem (missing fields and
      concept_description, carrying a declaredFields property the type no
      longer declares), so this file no longer type-checks against this
      task's own change. The same fallout reaches
      src/__tests__/unit/investigation/judgment-stage.spec.ts's own
      EvidenceItem-shaped assertions (e.g. `declaredFields: []`), and
      src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts and
      src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts's
      own EvidenceItem fixtures, all of which still literal-construct the old
      declaredFields shape.
    why: >-
      The task's own instructions state this exact fallout explicitly and
      forbid touching judgment-stage.ts here: that file's own switch to
      building EvidenceItem from the evidence's own snapshot is the sibling
      task judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry's
      own objective, which this task's own criteria and implements list do
      not name. Fixing the construction call site here would be inventing a
      translation this task was not asked to write, and rewriting the
      affected test fixtures is this task's own (and, for judgment-stage.spec.ts,
      the sibling task's own) proof pass to do, not this implementation
      record's.
---

## What it is
hypothesis-evaluator.port.ts's EvidenceItem now carries each evidence item's own snapshotted field semantics (`fields: readonly FieldSemantics[]`, each carrying its own name and, where declared, its own type and description) and its own snapshotted `concept_description: string`, in place of the bare `declaredFields: readonly string[]` list it carried before. anthropic-hypothesis-evaluator.adapter.ts's SYSTEM_PROMPT and its prompt-assembly functions (evidenceBlock, now itemBlock/conceptDescriptionLines/fieldsBlock/fieldElement) render that new shape inside the closed `<judgment_input>` data block — each item's own concept, its own `<concept_description>` where one is known (omitted entirely where it is the empty string), its own `<fields>` of `<field>` elements carrying name/type/description, and its own `<observation>` — with the same escaping discipline the block already kept. fake-hypothesis-evaluator.adapter.ts needed no change: it never constructs an EvidenceItem literal. src/.env's `PROMPT_VERSION` changes from `v1` to `v2`.

judgment-stage.ts's own construction of EvidenceItem was deliberately left untouched, per the task's own instruction — it no longer type-checks against the widened port, and that fallout is disclosed under `deferred` rather than worked around here.

## Notes
src/.env is listed in .gitignore alongside src/.env.test, so the PROMPT_VERSION change recorded here (v1 → v2) will never appear in a `git diff` of this delivery or in any commit built from it — it is a real, deliberate change to the file on disk, disclosed here in prose because the tracked tree cannot show it. Nothing else in that file was touched.

No specification node's material directed this delivery's own structural choices (the XML shape — `<concept_description>`, `<fields>`, `<field name="..." type="...">`, `<observation>` — is this delivery's own rendering decision, following the closed block's existing escaping conventions rather than any node's stated markup); no comment, README or commit message in the target tree was read as an instruction.
