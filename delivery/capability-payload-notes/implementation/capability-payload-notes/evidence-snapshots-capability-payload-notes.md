---
target: backend
title: Evidence snapshots the capability's payload notes
summary: Evidence gains a required capability_payload_notes attribute snapshotted
  from the producing capability at collection time, carried through the DTO, the relational
  store and a new additive migration.
task: sha256:124d4577f417feed6205ec1ef765c2bf113deb83956682e012eedbb4ec80ba99
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-evidence-snapshots-capability-payload-notes-build
files:
- path: src/investigation/evidence.ts
  effect: 'Added the required capability_payload_notes: string attribute to the Evidence
    type, alongside concept_description, matching domain/investigation/evidence''s
    declared shape.'
- path: src/investigation/evidence-collection-stage.ts
  effect: EvidenceBase gained a capabilityPayloadNotes field; resolvedBaseOf() snapshots
    it from capability.payload_notes ?? '' at the same resolution moment fields/conceptDescription
    are already snapshotted; unavailableEvidence()'s base literal supplies '' when
    the capability never resolved; evidenceOf() carries the snapshot onto every produced
    Evidence item as capability_payload_notes.
- path: src/http/dto/evidence.dto.ts
  effect: 'evidenceSchema gained capability_payload_notes: z.string(), mirroring the
    required-but-possibly-empty shape already used for concept_description, so a real
    Evidence item validated at this boundary is not silently stripped of the attribute.'
- path: src/persistence/relational-investigation-store.repository.ts
  effect: IEvidenceRow gained capability_payload_notes; evidenceStatement()'s INSERT
    text and params list it as a fifteenth column/value; the evidence SELECT names
    it; evidenceOf() maps row.capability_payload_notes onto the reconstructed Evidence.
- path: migrations/0025-investigation-evidence-capability-payload-notes.sql
  effect: New additive migration -- ALTER TABLE investigation_evidence ADD COLUMN
    capability_payload_notes TEXT NOT NULL DEFAULT '' -- giving investigation_evidence
    the one column pairing with the new attribute, backfilling every pre-existing
    row with the honest-empty reading, following the identical shape 0013's concept_description
    column already established.
- path: __tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anIntegrationEvidence fixture
    literal, and adjusted the exact-params toEqual assertion and the "thirteenth and
    fourteenth params" slice window, all downstream of Evidence''s new required attribute.'
- path: __tests__/unit/http/simulate-case.controller.spec.ts
  effect: 'Added capability_payload_notes: '''' to the inline evidence literal, now
    required by Evidence.'
- path: __tests__/unit/http/simulate-hypothesis.controller.spec.ts
  effect: 'Added capability_payload_notes: '''' to the inline evidence literal.'
- path: __tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  effect: 'Added capability_payload_notes: '''' to the SOME_EVIDENCE fixture.'
- path: __tests__/unit/investigation/assessment-consolidator.port.spec.ts
  effect: 'Added capability_payload_notes: '''' to the SOME_EVIDENCE fixture.'
- path: __tests__/unit/investigation/citation-validation.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: __tests__/unit/investigation/draft-assessment-text.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: __tests__/unit/investigation/investigation-factory.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: __tests__/unit/investigation/investigation-pipeline.spec.ts
  effect: 'Added capability_payload_notes: '''' to expectedOkEvidence().'
- path: __tests__/unit/investigation/judgment-stage.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: __tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  effect: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: __tests__/unit/investigation/run-diagnosis.spec.ts
  effect: 'Added capability_payload_notes: '''' to expectedOkEvidence().'
- path: __tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  effect: 'Added capability_payload_notes: '''' to both evidenceRow() (raw DB row
    fixture) and anEvidence() helper.'
- path: __tests__/unit/investigation/evidence-collection-stage.spec.ts
  effect: 'Added capability_payload_notes: '''' to expectedOkEvidence(), expectedNonOkEvidence()
    and expectedUnavailableEvidence() (untyped-return helpers compared via toEqual
    against real Evidence objects).'
- path: __tests__/unit/http/dto/evidence.dto.spec.ts
  effect: 'Added capability_payload_notes: '''' to aValidEvidenceItem(), now required
    by evidenceSchema.'
- path: __tests__/unit/http/dto/simulate-case.dto.spec.ts
  effect: 'Added capability_payload_notes: '''' to aValidEvidenceItem().'
- path: __tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  effect: 'Added capability_payload_notes: '''' to aValidEvidenceItem().'
criteria:
- criterion: An evidence item collected from a capability declaring payload notes
    carries capability_payload_notes holding that same text.
  met: true
  how: resolvedBaseOf() reads capability.payload_notes directly off the resolved Capability
    and carries it unchanged through evidenceOf() into the stored/returned Evidence.
- criterion: An evidence item collected from a capability declaring no payload notes
    carries capability_payload_notes as the empty string.
  met: true
  how: resolvedBaseOf() computes capability.payload_notes ?? '', so a Capability whose
    optional payload_notes is absent snapshots ''.
- criterion: An evidence item recorded for an observation whose capability never resolved
    carries capability_payload_notes as the empty string rather than ending the collection
    differently than it already ends.
  met: true
  how: 'unavailableEvidence()''s base object literal supplies capabilityPayloadNotes:
    '''' explicitly, alongside the existing empty-degradation fields, and reaches
    the same ''unavailable'' ending unchanged.'
- criterion: Re-registering the producing capability after collection leaves an already-collected
    evidence item's capability_payload_notes unchanged.
  met: true
  how: The value is read from the capability registry exactly once, at collectOneEvidence()'s
    single readCapability() call, and written once into the stored row; the store
    performs no UPDATE against investigation_evidence -- only INSERT.
- criterion: The relation holding a collected evidence item has one column pairing
    with capability_payload_notes and no column pairing with no declared attribute.
  met: true
  how: Migration 0025 adds exactly one column, investigation_evidence.capability_payload_notes,
    pairing with the one new attribute domain/investigation/evidence declares.
- criterion: Applying the numbered migration scripts in order to an empty database
    produces that column with no step performed by hand.
  met: true
  how: 0025-investigation-evidence-capability-payload-notes.sql is a plain numbered
    .sql file beside its siblings, applied by the existing migration runner in filename
    order.
- criterion: An evidence row stored before that column existed reads capability_payload_notes
    as the empty string, never as a read failure.
  met: true
  how: The column is declared TEXT NOT NULL DEFAULT '', backfilling every pre-existing
    row with '' at migration time.
- criterion: The evidence representation's own validation does not refuse an evidence
    item carrying capability_payload_notes.
  met: true
  how: domain/investigation/evidence declares capability_payload_notes as a required
    string attribute; evidenceSchema in evidence.dto.ts accepts it as a plain z.string(),
    so a real Evidence item carrying it validates successfully.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/evidence.ts
  - src/investigation/evidence-collection-stage.ts
  - src/http/dto/evidence.dto.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  how: capability_payload_notes is declared as a required string attribute on Evidence,
    snapshotted once at collection from the producing capability's own payload_notes
    (or '' where the capability declared none or never resolved), carried through
    the DTO, and persisted/read via the new column.
- node: domain/integration/capability
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: resolvedBaseOf() reads the resolved Capability's own optional payload_notes
    attribute at the single moment it is snapshotted onto Evidence; no other read
    of it is introduced here.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  how: The migration adds exactly one column, investigation_evidence.capability_payload_notes,
    pairing with the one newly-declared required attribute.
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  how: The change is a single additive, numbered .sql script beside its siblings,
    replaying cleanly on an empty database through the existing filename-ordered migration
    runner.
inferences:
- inferred: capability_payload_notes should be added to evidence.dto.ts's evidenceSchema
    as a required (non-optional) z.string(), mirroring concept_description's own shape.
  from: The inventory's must_not_duplicate entry naming concept_description's own
    required-but-possibly-empty pattern as the convention to reuse, and the fact that
    evidenceSchema is what simulate-case.dto.ts/simulate-hypothesis.dto.ts actually
    validate a real Evidence item through at the HTTP boundary.
- inferred: The new migration is numbered 0025, placed immediately after 0024-capability-payload-notes.sql.
  from: The additive-migration-after-a-shipped-table convention the inventory names,
    applied to the next free sequence number.
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: 'Making capability_payload_notes a required attribute on Evidence broke
    TypeScript compilation and several runtime assertions across seventeen pre-existing
    test files that construct or compare raw Evidence-shaped literals (fixtures and
    toEqual/toMatchObject assertions predating this attribute, spanning investigation,
    HTTP DTO/controller and persistence tests). A general-purpose agent added capability_payload_notes:
    '''' to each affected fixture/assertion (mirroring exactly how concept_description
    already appears beside it in the same literals), and corrected two assertions
    in relational-investigation-store.repository.spec.ts (the exact INSERT params
    array, and a slice-window offset) to account for the new trailing column. No assertion
    was weakened; only the missing field and the shifted offsets were added/corrected.'
  why: Adding a required domain attribute necessarily ripples into every fixture of
    that type across the codebase; fixing each mechanically (adding the missing field,
    exactly mirroring the sibling concept_description field already present) preserves
    what every one of those pre-existing tests actually proves, and routing seventeen
    one-line additions through individual corrective increments would cost far more
    than this disclosed, uncontroversial sweep.
preserved:
- Every existing Evidence attribute, its JSON shape, and its honest-empty-on-legacy-row
  reading for elapsed_ms, fields and concept_description.
- The single-INSERT, no-UPDATE write path for investigation_evidence, which is what
  makes an already-collected row's capability_payload_notes immune to a later re-registration.
- The DEFAULT '' TEXT NOT NULL, kept-permanently-on-the-column shape 0011/0012/0013
  already established.
- toEvidenceItems() in judgment-stage.ts and EvidenceItem in hypothesis-evaluator.port.ts,
  both left untouched -- judgment's reading of this snapshot belongs to a different
  task.
deferred:
- what: Wiring hypothesis judgment (EvidenceItem, toEvidenceItems(), the Anthropic
    adapter's prompt assembly) to read capability_payload_notes from the evidence
    snapshot.
  why: rules/investigation/judgment-reads-the-evidence-snapshot governs that reach
    and no criterion of this task touches what judgment reads; assigned to the sibling
    task wiring hypothesis judgment to this snapshot.
- what: Any operator-facing presentation of payload_notes, including its absent-vs-empty
    reading on a capability-identity surface.
  why: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
    governs that presentation and no criterion here concerns it.
---

## What it is

Evidence gains a required capability_payload_notes attribute, snapshotted once at collection from the producing capability's own optional payload_notes (empty string where none, or where the capability never resolved), carried through the DTO boundary, the relational store, and a new additive migration column.

## Notes

Making the new attribute required broke TypeScript compilation and several exact-shape assertions in seventeen pre-existing test files unrelated to this task's own criteria; each was mechanically repaired (the missing field added, mirroring the sibling concept_description field already present in the same literal) rather than weakened, disclosed above as a divergence from the ordinary two-producer split.
Wiring the snapshot into hypothesis judgment and into any operator-facing presentation are each a sibling task's work, not this one's.
