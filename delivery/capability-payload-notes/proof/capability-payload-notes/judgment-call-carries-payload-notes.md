---
target: backend
title: The judgment call's snapshotted capability payload notes reach the evaluator
summary: judgment-stage.spec.ts gains two tests proving toEvidenceItems() carries
  a non-empty capability_payload_notes value through unchanged and never omits the
  attribute when the snapshot holds none, alongside a third proving the assembly issues
  no capability-registry read.
implementation: sha256:f995f9ff34491a2ccbc49ddf62c585bef25b908cf8c3edc81a2aa6312e639974
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-judgment-call-carries-payload-notes-suite
tests:
- file: __tests__/unit/investigation/judgment-stage.spec.ts
  name: carries the evidence item's own snapshotted, non-empty capability_payload_notes
    into the EvidenceItem the evaluator receives, holding exactly the stored value
    regardless of a capability re-registered under that same name and version after
    collection
  proves: Criterion 1 (the evidence item the evaluator receives carries capability_payload_notes
    holding exactly the value that item's stored snapshot holds) and criterion 4 (a
    capability re-registered between collection and judgment does not change the capability_payload_notes
    the evaluator receives for an already-collected item) -- toEvidenceItems() has
    no channel to a live registry, so the only value it can hand the evaluator is
    the one the Evidence item already carried at collection.
  fails_when: toEvidenceItems() (or anything upstream of it) fails to copy the stored
    Evidence item's own capability_payload_notes verbatim onto the EvidenceItem passed
    to evaluator.evaluate() -- whether by transforming it, defaulting it, or deriving
    it from anything other than that same item's own stored attribute.
- file: __tests__/unit/investigation/judgment-stage.spec.ts
  name: reaches the evaluator with capability_payload_notes present as an empty string,
    never omitting the attribute, when the evidence item's own snapshot holds none
  proves: Criterion 2 -- an evidence item whose snapshot holds an empty capability_payload_notes
    reaches the evaluator carrying that empty value, never omitting the attribute
    from the item.
  fails_when: the EvidenceItem toEvidenceItems() builds for an evidence item whose
    stored capability_payload_notes is '' either omits the capability_payload_notes
    key entirely or carries anything other than the exact empty string.
- file: __tests__/unit/investigation/judgment-stage.spec.ts
  name: imports no ICapabilityQuery and reads no capability-registry port at all --
    judgeHypotheses takes only evidence already collected, never a registry to resolve
    live
  proves: Criterion 3 -- assembling the judgment call issues no capability-registry
    read, so the value handed to the evaluator comes from the evidence snapshot alone.
  fails_when: judgment-stage.ts's source starts importing ICapabilityQuery, a capability-query.port
    module, or calling outputSchemasFor -- any of which would mean capability_payload_notes
    (or any other item attribute) could be resolved live rather than read from the
    already-collected Evidence item.
not_applicable:
- edge_case: An evidence array with zero items, or containing only non-ok evidence,
    for a judged hypothesis
  why: toEvidenceItems() only ever maps ok evidence into an EvidenceItem; where none
    is ok there is no item at all, so there is no capability_payload_notes value for
    this task's criteria to say anything about.
- edge_case: Multiple evidence items in one hypothesis's evidence array, each with
    a different capability_payload_notes value
  why: toEvidenceItems() maps every item through the identical, independent per-item
    field copy; a second or third item exercises the same single-item mapping logic
    the one-item tests already exercise.
- edge_case: A concurrent judgment call, or a second collection of the same concept,
    changing capability_payload_notes mid-assembly
  why: capability_payload_notes is read once from an already-stored, immutable Evidence
    item into a plain object; this task introduces no write path and no shared mutable
    state for it to race against.
untested:
- domain/investigation/evidence's fact is the whole value-object -- concept, inputs,
  observation, observed_at, ttl, origin, result, result_detail, elapsed_ms, fields,
  concept_description, capability_payload_notes, and the reference to domain/integration/capability
  -- of which this task's tests exercise only capability_payload_notes's read-through
  into judgment. The remaining attributes are populated and stored by sibling tasks
  this task's own REMAINDER notes name.
- domain/investigation/hypothesis-evaluator's Responsibility bundles concept, field
  semantics and capability payload notes together with returning an evaluation that
  is cited and complete, never inferred, and reading nothing live from either the
  glossary or the capability registry. This task's own Notes state its criteria close
  only the capability_payload_notes clause and the registry half of the no-live-read
  clause; the rest is a sibling task's or adapter's concern.
- rules/investigation/judgment-reads-the-evidence-snapshot's statement binds judgment
  to snapshotted concept, field semantics and capability payload notes together, fixed
  at collection, and forbids re-reading both the glossary and the capability registry.
  This task's criteria and tests reach only the capability_payload_notes clause and
  the registry half of the no-live-read clause.
---

## What it is

Three tests prove judgment-stage.ts's toEvidenceItems() carries a stored evidence item's own capability_payload_notes -- present or empty -- into the EvidenceItem the hypothesis evaluator receives, immune to a later re-registration, and that assembling the judgment call issues no live capability-registry read.

## Notes

None.
