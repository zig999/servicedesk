---
target: backend
title: The judgment prompt renders each item's own capability payload notes
summary: Four tests prove the adapter states an item's own capability_payload_notes
  beside its observation when non-empty, omits the tag entirely when empty, never
  leaks one item's notes into another item's block, and that a field named only in
  payload notes still fails citation validation.
implementation: sha256:62b6eac9836090a6346a03b167d6349bc3d8f42b30ea91e0f0c28fd5dfc4e3cb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-judgment-prompt-renders-payload-notes-suite
tests:
- file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders an evidence item's own capability_payload_notes inside its own <capability_payload_notes>
    tag, holding exactly that item's snapshotted text
  proves: Criterion 1 -- the prompt block for an evidence item whose capability_payload_notes
    holds content states that text inside that item's own block.
  fails_when: capabilityPayloadNotesLines() stops emitting the <capability_payload_notes>
    tag for a non-empty value, or itemBlock() stops splicing that item's own line
    into its own block, or the tag's text stops matching the snapshotted value exactly.
- file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: omits the <capability_payload_notes> tag entirely for an item whose capability_payload_notes
    is the empty string, the same omission concept_description already takes when
    empty, while still carrying that item's own fields and observation
  proves: Criterion 2 -- the prompt block for an evidence item whose capability_payload_notes
    is empty states no payload-notes tag at all, the same omission concept_description
    already takes when empty.
  fails_when: capabilityPayloadNotesLines() emits a <capability_payload_notes> tag
    (empty or otherwise) for the empty-string case, or the item's own fields/observation
    stop being rendered alongside the omission.
- file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own capability_payload_notes into that item's
    own block alone, never another item's in the same prompt
  proves: Criterion 3 -- the payload notes stated in an item's block are that item's
    own, never another item's in the same prompt.
  fails_when: itemBlock() reads capability_payload_notes from shared or cross-item
    state, so one item's block ends up carrying another item's own payload-notes text
    instead of only its own.
- file: __tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a field that appears only inside the cited evidence
    item's own capability_payload_notes text and in no declared field, so the payload
    notes reaching the prompt widen no citation vocabulary
  proves: Criterion 4 -- an evaluation citing a field named only in a capability's
    payload notes and in no output schema is still refused, so the notes reaching
    the prompt widen no citation vocabulary.
  fails_when: citesADeclaredField() (or isCitationValid()) starts accepting a citation
    field that appears in the cited item's capability_payload_notes text rather than
    only in its own declared fields array.
not_applicable:
- edge_case: capability_payload_notes text containing reserved XML characters (&,
    <, >)
  why: Escaping is applied by the same generic escapeForXmlText() function already
    exercised, in this same suite, for concept_description, field name/type/description
    and the criterion.
- edge_case: capability_payload_notes holding whitespace-only text rather than the
    exact empty string
  why: capabilityPayloadNotesLines() branches on an exact === '' comparison, so any
    whitespace-only string falls in the same holds-content class as any other non-empty
    string, which Test 1 already covers.
- edge_case: an evidence item whose capability never resolved, snapshotting an empty
    capability_payload_notes alongside a non-ok result
  why: AnthropicHypothesisEvaluator.evaluate() returns the no-data outcome before
    ever building a prompt whenever any evidence item's result isn't 'ok'; the honest-empty
    case is exercised instead through an 'ok' item with an empty snapshot (Test 2).
- edge_case: concurrent or repeated calls to evaluate() with different evidence
  why: buildUserPrompt/itemBlock is a pure, synchronous string-building function reading
    only its own parameters, and the file's pre-existing byte-identical-prompt test
    already establishes no shared mutable state between calls.
- edge_case: an evidence array with zero items
  why: None of this task's four criteria discuss the evidence list's cardinality,
    only the content and isolation of one item's own capability_payload_notes tag.
untested:
- domain/investigation/evidence's fact spans the whole value-object -- twelve attributes
  plus its capability reference, and the honest-empty/honest-zero degradations each
  separately declares. This task's tests exercise only the capability_payload_notes
  attribute's consumption at prompt-assembly time; no finite test in this proof decides
  the node's fact whole.
- domain/investigation/hypothesis-evaluator's fact is the port's whole responsibility
  -- given a hypothesis's criterion, its full evidence and the case context, return
  a cited, complete, never-inferred evaluation reading nothing live, applicable across
  any adapter. This task's tests exercise only the payload-notes segment of one production
  adapter's prompt.
- domain/integration/capability's fact is the aggregate root's whole declared contract
  -- name, version, nature, both schemas, timeout, connector, concept and optional
  payload_notes -- and its responsibility to declare that contract completely. This
  task only reads one already-registered capability's payload_notes at prompt-assembly
  time.
- rules/investigation/judgment-reads-the-evidence-snapshot's stated invariant covers
  concept, field semantics and capability payload notes together, fixed at collection
  time, and requires that judgment never re-reads the glossary or the capability registry
  at all. This task's own four tests decide only the capability_payload_notes portion
  of the statement -- that it reaches judgment as context, is honestly omitted when
  empty, is scoped to its own item, and grounds no citation.
---

## What it is

Four tests prove the production judgment adapter renders each evidence item's own snapshotted capability_payload_notes into that item's own prompt block when non-empty, omits it entirely when empty, never leaks one item's notes into another's block, and that the notes reaching the prompt widen no citation vocabulary.

## Notes

None.
