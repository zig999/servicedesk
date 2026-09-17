---
target: backend
title: The judgment prompt states an item's payload notes
summary: The Anthropic hypothesis-evaluator adapter now renders each evidence item's
  own snapshotted capability_payload_notes into that item's own prompt block, omitted
  where the snapshot is empty, exactly the way concept_description already is.
task: sha256:5a8dbe190af4d3c9a2ca274482ef62f79a0626185274959cbb9abcb8220f5d52
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-judgment-prompt-renders-payload-notes-build
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: itemBlock() now emits a per-item capabilityPayloadNotesLines(item.capability_payload_notes)
    segment after the item's <fields> block and before its <observation>, mirroring
    conceptDescriptionLines()'s omit-tag-when-empty rendering; SYSTEM_PROMPT's own
    description of what one <item> carries was extended to name the new <capability_payload_notes>
    element and state it is context grounding the observation, never a fact to verify
    and never a citable field name.
criteria:
- criterion: The prompt block for an evidence item whose capability_payload_notes
    holds content states that text inside that item's own block.
  met: true
  how: capabilityPayloadNotesLines() emits <capability_payload_notes>${escapeForXmlText(capabilityPayloadNotes)}</capability_payload_notes>
    whenever the value is non-empty, and itemBlock() splices that line into the specific
    item's own array before joining it into that item's block.
- criterion: The prompt block for an evidence item whose capability_payload_notes
    is empty states no payload-notes tag at all, the same omission the concept description
    already takes when empty.
  met: true
  how: capabilityPayloadNotesLines() returns an empty array when capabilityPayloadNotes
    === '', the identical branch shape conceptDescriptionLines() already uses for
    concept_description.
- criterion: The payload notes stated in an item's block are that item's own, never
    another item's in the same prompt.
  met: true
  how: evidenceBlock() maps itemBlock over each EvidenceItem independently, and itemBlock()
    reads capabilityPayloadNotesLines(item.capability_payload_notes) off that same
    closed-over item parameter with no module-level or cross-item state.
- criterion: An evaluation citing a field named only in a capability's payload notes
    and in no output schema is still refused, so the notes reaching the prompt widen
    no citation vocabulary.
  met: true
  how: citation-validation.ts's citesADeclaredField() accepts a citation's field only
    when it matches a name in the cited evidence item's own fields array; this task
    adds no read of capability_payload_notes anywhere in that validation path.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The node's capability_payload_notes snapshot is now read at prompt-assembly
    time and rendered per item, honoring the node's own honest-empty description --
    an item whose capability never resolved or predates the attribute snapshots the
    empty string, which capabilityPayloadNotesLines() renders as no tag at all.
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The port's stated responsibility -- given each item's own snapshotted concept,
    field semantics and capability payload notes alongside its observation, return
    a cited, complete evaluation reading nothing live -- is answered by the production
    adapter now placing capability payload notes into the same per-item block as the
    other snapshotted semantics.
- node: domain/integration/capability
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The node states payload_notes is an operator's own hint, "never enforced and
    never read by anything that resolves a call or admits a citation"; this task's
    rendering only ever writes the value as prompt text and touches no code path that
    resolves a call or admits a citation.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The rule states capability_payload_notes reaches judgment "as context grounding
    the observation, never as a fact anything validates or a vocabulary any citation
    is held to"; the SYSTEM_PROMPT now says exactly that about the new <capability_payload_notes>
    element, and the rendering reads only the already-snapshotted EvidenceItem field.
inferences:
- inferred: The rendered tag is named <capability_payload_notes>, matching the EvidenceItem
    attribute name exactly.
  from: The existing <concept_description> tag already mirrors its own attribute's
    name one-for-one, and the inventory's must_not_duplicate entry names conceptDescriptionLines()
    as the established convention for this exact omit-when-empty case.
- inferred: The <capability_payload_notes> line is placed after the item's <fields>
    block and before its <observation>.
  from: domain/investigation/hypothesis-evaluator's own listed order -- concept, field
    semantics and capability payload notes alongside its observation.
- inferred: SYSTEM_PROMPT's own descriptive sentence about what one <item> carries
    was extended to name <capability_payload_notes> and state its non-citable, context-only
    nature to the model.
  from: rules/investigation/judgment-reads-the-evidence-snapshot's statement that
    the notes are context grounding the observation, never a fact anything validates
    or a vocabulary any citation is held to.
preserved:
- The omit-tag-when-empty rendering for <concept_description>, unchanged and untouched
  by this edit.
- Reserved-character XML escaping across every rendered field, concept_description,
  criterion and now capability_payload_notes value.
- The closed <judgment_input> block's fixed shape and the no-tools provider call.
- The byte-identical, side-effect-free prompt assembly across repeated calls with
  the same inputs.
- citesADeclaredField()'s existing bound to only the cited item's own fields array,
  left untouched by this task.
---

## What it is

The production judgment adapter renders each evidence item's own snapshotted capability_payload_notes into that item's own prompt block, omitted where the snapshot is empty, mirroring the existing concept_description rendering exactly -- context for the model, never a fact anything validates or a citable field.

## Notes

None.
