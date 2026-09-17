---
target: backend
title: The judgment call carries the snapshotted capability payload notes
summary: EvidenceItem gains a required capability_payload_notes attribute, and toEvidenceItems()
  carries it straight from the evidence snapshot into every item handed to the hypothesis
  evaluator.
task: sha256:8cabbc14e28fd9ffaab302b7672811b892a9cdc6b27cc88cec421870ebeb229e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-judgment-call-carries-payload-notes-build-2
files:
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: 'EvidenceItem gained a required capability_payload_notes: string attribute,
    alongside concept and fields, matching domain/investigation/hypothesis-evaluator''s
    stated shape for what judgment receives per item.'
- path: src/investigation/judgment-stage.ts
  effect: 'toEvidenceItems() now carries capability_payload_notes: item.capability_payload_notes
    onto every EvidenceItem it builds from a stored Evidence item, alongside the existing
    concept_description carry-through.'
- path: __tests__/unit/investigation/judgment-stage.spec.ts
  effect: Added capability_payload_notes to the two exact-equality assertions on evaluator.calls[].evidence,
    which the widened EvidenceItem shape would otherwise fail.
- path: __tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  effect: Added capability_payload_notes to the SOME_EVIDENCE fixture, now required
    by EvidenceItem.
- path: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  effect: Added capability_payload_notes to every EvidenceItem literal in the file,
    now required by EvidenceItem; no assertion, prompt or rendering behavior was changed.
    One test's two identical evidence/case-context literals were also factored into
    shared builder functions to stay under the project's max-lines-per-function lint
    rule after the new field was added.
criteria:
- criterion: The evidence item the evaluator receives carries capability_payload_notes
    holding exactly the value that item's stored snapshot holds.
  met: true
  how: toEvidenceItems() copies item.capability_payload_notes verbatim from the stored
    Evidence onto the EvidenceItem passed to evaluator.evaluate(), with no transformation.
- criterion: An evidence item whose snapshot holds an empty capability_payload_notes
    reaches the evaluator carrying that empty value, never omitting the attribute
    from the item.
  met: true
  how: capability_payload_notes is a required (non-optional) string on EvidenceItem
    and is always assigned in toEvidenceItems()'s object literal, so an empty-string
    snapshot is carried as the key present with value '', never absent.
- criterion: Assembling the judgment call issues no capability-registry read, so the
    value handed to the evaluator comes from the evidence snapshot alone.
  met: true
  how: toEvidenceItems() reads only the already-collected Evidence array passed into
    judgeHypotheses(); no capability-registry port or query is imported or called
    anywhere in judgment-stage.ts, unchanged by this task.
- criterion: A capability re-registered between collection and judgment does not change
    the capability_payload_notes the evaluator receives for an already-collected item.
  met: true
  how: The value flows from the Evidence item already snapshotted once at collection,
    through a pure field copy in toEvidenceItems() with no live lookup of any kind.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: toEvidenceItems() reads capability_payload_notes off the already-snapshotted
    Evidence element and carries it forward unchanged, treating it as an already-collected
    fact, never re-derived.
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: EvidenceItem, the port's own per-item shape, now declares capability_payload_notes
    as required alongside concept and field semantics, matching the node's stated
    Responsibility that judgment is given each item's own snapshotted concept, field
    semantics and capability payload notes; toEvidenceItems() is the one place that
    fills it.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/hypothesis-evaluator.port.ts
  how: The capability_payload_notes clause is encoded by toEvidenceItems() sourcing
    the value from the evidence snapshot alone (no capability-registry port exists
    in judgment-stage.ts's imports), and the port's widened EvidenceItem type is what
    lets that value reach evaluate() at all.
inferences:
- inferred: capability_payload_notes on EvidenceItem is required (non-optional string),
    mirroring concept_description's own shape on the same type.
  from: domain/investigation/hypothesis-evaluator's Responsibility line names it in
    the same breath as concept, field semantics (both already required on EvidenceItem),
    and criterion 2 explicitly forbids omitting the attribute for an empty value.
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: 'Widening EvidenceItem with a new required attribute broke TypeScript
    compilation and exact-equality assertions across three pre-existing test files
    (hypothesis-evaluator.port.spec.ts, anthropic-hypothesis-evaluator.adapter.spec.ts,
    judgment-stage.spec.ts) that construct or compare EvidenceItem-typed literals
    predating this attribute. Each was mechanically repaired by adding capability_payload_notes:
    '''' beside the existing concept_description field already present, and one test
    was refactored to stay under the project''s max-lines-per-function lint rule once
    the new field pushed it over. No assertion, prompt-rendering behavior or test
    intent was weakened or changed.'
  why: This is the identical situation and identical resolution already disclosed
    for the same reason in the sibling task evidence-snapshots-capability-payload-notes
    -- a required attribute added to a widely-used type necessarily ripples into every
    pre-existing literal of that type.
preserved:
- Every existing EvidenceItem attribute and the exact prompt-rendering behavior of
  both adapters (Anthropic and fake) -- neither adapter's rendering of capability_payload_notes
  was touched.
- toEvidenceItems()'s existing mapping of concept, result, observation, fields and
  concept_description, all left unchanged in shape and order of assignment.
- The single-read, no-live-lookup shape of judgeHypotheses()/toEvidenceItems() --
  no capability-registry or glossary port was introduced.
deferred:
- what: Rendering capability_payload_notes into the judgment prompt (a parallel function
    to conceptDescriptionLines(), wired into itemBlock() in anthropic-hypothesis-evaluator.adapter.ts)
    and any change to fake-hypothesis-evaluator.adapter.ts's handling of it.
  why: This task's own Notes state the port's item shape and the mapping that fills
    it are the whole of this task; what an adapter does with the value it now receives
    is a separate outcome.
---

## What it is

EvidenceItem, the shape the hypothesis evaluator's port receives per item, gains a required capability_payload_notes attribute, and toEvidenceItems() carries it straight from the already-collected evidence snapshot -- never a live registry read -- into every item handed to evaluate().

## Notes

Widening EvidenceItem broke several pre-existing test literals across three files; each was mechanically repaired by adding the missing field, mirroring the sibling task's own identical, already-disclosed fix for the same class of breakage.
Rendering the value into the judgment prompt is a sibling task's work, not this one's.
