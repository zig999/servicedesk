---
task: sha256:10775a6bfadc49535f9caaff451002128fb37fe7e953662522ee3bce64a46532
title: Evidence collection snapshots concept and field semantics
summary: >-
  The collection stage now reads the glossary alongside the capability
  registry and snapshots each concept's own declared description and its
  resolved capability's own declared field-by-field semantics onto every
  Evidence item it produces, honestly degraded where either source is
  absent.
files:
  - path: src/investigation/field-semantics.ts
    effect: >-
      New file. Declares FieldSemantics ({name, type?, description?}) and
      fieldSemanticsOf(outputSchema), a third structural reader of a
      capability's output_schema — deliberately independent of
      citation-validation.ts's declaredFieldsOf and
      capability-input-schema-shape.ts's declaredInputSchemaShape, with its
      own copy of the same defensive parseJsonOrUndefined/isPlainObject
      helpers — answering one FieldSemantics entry per key the schema's own
      top-level properties object declares, carrying that key's own type and
      description only where the schema states them as strings, and an
      empty array for a schema that is not parseable JSON or holds no
      top-level properties object.
  - path: src/investigation/evidence.ts
    effect: >-
      Evidence gains two new required attributes: fields (readonly
      FieldSemantics[]) and concept_description (string), both documented
      against domain/investigation/evidence's own honest-degradation
      language.
  - path: src/investigation/evidence-collection-stage.ts
    effect: >-
      CollectEvidenceOptions and CollectOneEvidenceOptions gain a required
      glossary: IGlossaryQuery. collectOneEvidence now reads the concept's
      capability and its glossary description together, through
      Promise.all, since neither answer depends on the other; a concept
      whose capability resolves gets its evidence's fields set from
      fieldSemanticsOf(capability.output_schema) (via the new resolvedBaseOf
      helper, split out to keep collectOneEvidence within the standard's
      max-lines-per-function rule); a concept nothing currently answers
      still gets its own concept_description snapshotted, but always an
      empty fields array, since there is no schema to read. The module's
      own header comment documents this addition and its collaborators.
  - path: src/investigation/investigation-pipeline.ts
    effect: >-
      InvestigationPipelineOptions gains a required glossary: IGlossaryQuery
      (no longer a persistence-only field, documented as such), threaded
      into collectEvidenceOptions() so runInvestigationPipeline's own call
      to collectEvidence supplies it.
  - path: src/investigation/simulate-hypothesis-pipeline.ts
    effect: >-
      SimulateHypothesisPipelineOptions gains a required glossary:
      IGlossaryQuery, threaded into its own collectEvidence call inside
      runSimulateHypothesisPipeline.
  - path: src/investigation/run-diagnosis.ts
    effect: >-
      RunDiagnosisOptions' own separately declared glossary field is removed
      now that it is inherited from InvestigationPipelineOptions (the same
      IGlossaryQuery instance now serves both buildInvestigation's
      subject-attribute check and collectEvidence's concept-description
      reads); the now-unused IGlossaryQuery import is removed. No behavior
      changes: this file's own callers already supply one glossary instance,
      unchanged.
  - path: src/factories/simulate.factory.ts
    effect: >-
      createSimulationRunner now also builds a glossary-query instance
      from the given connection (createGlossaryQuery), once per call to
      this outer factory, and threads it into every runInvestigationPipeline
      call; SimulationCall's Omit list widens to exclude 'glossary' the same
      way it already excludes 'capabilities'.
  - path: src/factories/production-simulate-hypothesis.factory.ts
    effect: >-
      createProductionHypothesisSimulationRunner now also builds a
      glossary-query instance from the given connection, once per call to
      this outer factory, and threads it into every runSimulateHypothesisPipeline
      call; ProductionHypothesisSimulationCall's Omit list widens to exclude
      'glossary' the same way it already excludes 'capabilities'.
  - path: src/persistence/relational-investigation-store.repository.ts
    effect: >-
      evidenceOf() (the read path) now supplies fields: [] and
      concept_description: '' on every assembled Evidence, so this file
      keeps compiling against Evidence's two new required attributes.
      Nothing is read from or written to a new column: no migration exists
      yet for either attribute (that is
      task/evidence-semantics-snapshot/investigation-store-persists-the-snapshot's
      own objective), so this is a disclosed, compile-preserving placeholder
      rather than an implementation of the round-trip, applying the same
      honest-empty-snapshot degradation the domain node already sanctions
      for an item collected before an attribute existed.
criteria:
  - criterion: >-
      Evidence for a concept whose capability currently resolves records
      fields — one entry per key its output schema's own top-level
      properties declares, each carrying that key's own type and
      description where the schema states them.
    met: true
    how: >-
      resolvedBaseOf() (evidence-collection-stage.ts) sets fields:
      fieldSemanticsOf(capability.output_schema) whenever
      capabilities.readCapability(concept) answers held: true.
      fieldSemanticsOf (field-semantics.ts) reads the schema's own top-level
      properties object structurally, one FieldSemantics entry per key,
      carrying that key's own type/description only where the schema states
      them as strings.
  - criterion: >-
      Evidence for a collected concept records concept_description exactly
      as the glossary held that concept's description at the moment of
      collection.
    met: true
    how: >-
      collectOneEvidence reads glossary.readConcept(concept) once, at the
      start of this concept's own collection attempt (alongside, never
      after, the capability read), through the new conceptDescriptionOf()
      helper, and threads the answer into every Evidence branch this
      concept can settle on — unaffected by which of the four
      evidence-result endings it reaches.
  - criterion: >-
      Evidence for a concept registered with no description records
      concept_description as the empty string, never a refusal.
    met: true
    how: >-
      conceptDescriptionOf() answers resolution.concept.description
      directly where the glossary holds the concept, and GlossaryService's
      own concepts()/readConcept() (already delivered, unchanged by this
      task) already default an absent stored description to the empty
      string rather than refusing — so no description ever surfaces as a
      thrown error here. conceptDescriptionOf answers '' outright where the
      glossary does not hold the concept at all, the same honest-empty
      reading.
  - criterion: >-
      Evidence for a concept whose capability never resolved records fields
      as an empty array.
    met: true
    how: >-
      unavailableEvidence() (reached exactly when
      capabilities.readCapability(concept) answers held: false) passes
      fields: [] literally into evidenceOf() — there is no capability
      output schema to read for a concept nothing currently answers.
nodes:
  - node: domain/investigation/field-semantics
    encoded_at:
      - src/investigation/field-semantics.ts
      - src/investigation/evidence-collection-stage.ts
    how: >-
      field-semantics.ts's FieldSemantics type carries exactly the node's
      three attributes (name required; type and description present only
      where the schema states them), and fieldSemanticsOf reads them
      structurally off a capability's output schema's own top-level
      properties object, reading and validating nothing else of that
      schema — matching the node's own "an operator's own hint, never
      enforced." evidence-collection-stage.ts is where this concrete shape
      is actually produced and attached to an Evidence item, at the moment
      a concept's capability resolves.
  - node: domain/investigation/evidence
    encoded_at:
      - src/investigation/evidence.ts
      - src/investigation/evidence-collection-stage.ts
      - src/persistence/relational-investigation-store.repository.ts
    how: >-
      evidence.ts declares the two new required attributes, fields and
      concept_description, exactly as the node's own attributes section
      states them (field-semantics, many: true; string). Both are assembled
      by the collection stage at the moment it resolves each concept
      (evidence-collection-stage.ts), never re-read afterward, and degrade
      honestly exactly as the node's own description states: an evidence
      item whose capability never resolved carries no fields at all, and a
      concept collected before it declared a description (or one the
      glossary does not hold at all) carries the empty string.
      relational-investigation-store.repository.ts's own read path answers
      the same empty snapshot for every row today, since no column yet
      backs either attribute for a stored record — the sibling task
      investigation-store-persists-the-snapshot is where that round-trip
      itself is implemented; this delivery only keeps that file compiling
      against the node's now-required attributes.
inferences:
  - inferred: >-
      The capability read and the glossary-concept read settle together,
      through Promise.all, rather than one strictly before the other.
    from: >-
      The task's own "What it is" section states only that the glossary is
      read "once, at collection," not an ordering relative to the
      capability read; the two answers are independent (the glossary and
      the capability registry are separate vocabularies), and this stage
      already races and parallelizes elsewhere in its own body.
  - inferred: >-
      A concept the glossary does not hold at all (never registered, not
      merely registered with no description) also snapshots
      concept_description as the empty string, the same honest degradation
      as a registered concept with none.
    from: >-
      Criterion 3 and the node's own text address a concept "registered
      with no description," not an unregistered one, but draw no distinct
      behavior for the latter; glossary-query.port.ts's own ConceptResolution
      already treats an unheld concept as ordinary data rather than a fault,
      so the same empty-string reading extends naturally.
  - inferred: >-
      field-semantics.ts follows citation-validation.ts's own declaredFieldsOf
      and capability-input-schema-shape.ts's own declaredInputSchemaShape as
      a third, independently-implemented structural reader, with its own
      copy of parseJsonOrUndefined/isPlainObject, rather than importing
      either.
    from: >-
      The task's own Notes entry names both existing readers as the
      established deliberate-duplication convention this reader should
      follow, and the inventory's own must_not_duplicate entries name the
      identical convention explicitly.
  - inferred: >-
      collectEvidence's new required glossary dependency is threaded through
      every production composition that calls it — investigation-pipeline.ts,
      simulate-hypothesis-pipeline.ts, and the two factories that wire each
      (simulate.factory.ts, production-simulate-hypothesis.factory.ts) —
      each factory constructing its own glossary-query instance from the
      database connection it is already given, the same per-factory-call
      convention already used there for capabilities.
    from: >-
      Every Evidence item domain/investigation/evidence describes carries a
      real concept_description snapshot regardless of which composition
      produced it, and every production call site already holds a
      DatabaseConnection a glossary-query can be built from
      (createGlossaryQuery, already used identically by diagnose.factory.ts).
  - inferred: >-
      relational-investigation-store.repository.ts's read path answers a
      literal empty snapshot (fields: [], concept_description: '') for
      every row today, rather than reading real columns.
    from: >-
      No migration exists yet for either attribute — that is the sibling
      task investigation-store-persists-the-snapshot's own stated
      objective, whose own second criterion already commits to exactly
      this degradation for a row stored before its migration runs, and
      today every stored row is such a row.
preserved:
  - >-
    Every existing evidence-result ending (ok, denied, timeout, unavailable)
    keeps its existing observation/result_detail/elapsed_ms/origin/capability_name/capability_version
    content unchanged; fields and concept_description are additive to every
    branch, never a replacement of anything already there.
  - >-
    The stage's own parallel-collection, budget and deadline arithmetic
    (COLLECTION_STAGE_BUDGET_MS, effectiveBoundMsFor, raceObservation,
    the propagated now/deadline pair) is untouched.
  - >-
    elapsed_ms's own measurement (from attemptStartedAt to each ending's own
    determination) is untouched; the added glossary read never lengthens it
    in practice, since it settles through the same Promise.all as the
    capability read rather than after it.
  - >-
    The requester's own scope still passes straight through to every
    observe-concept call, unsubstituted.
  - >-
    citation-validation.ts's declaredFieldsOf/capabilityOutputSchemaKey and
    capability-input-schema-shape.ts's declaredInputSchemaShape are
    untouched, per the inventory's own must_not_duplicate entries.
  - >-
    GlossaryService's own existing description-defaulting behavior
    (concepts()/readConcept() answering '' for an absent stored description)
    is relied upon exactly as already delivered, never modified.
  - >-
    evidence-collection-stage.ts's own module-purity guarantee — every
    import specifier a relative path, no framework/driver/provider-client
    import — holds after adding the glossary-query port import, itself a
    relative, infrastructure-free type import.
deferred:
  - what: >-
      The relational investigation store's own migration and real read/write
      of fields and concept_description columns on investigation_evidence.
    why: >-
      Explicitly the sibling task's own objective
      (task/evidence-semantics-snapshot/investigation-store-persists-the-snapshot),
      cut apart from this one because persistence is its own reason to
      change (schema and read/write mapping) — this delivery only keeps
      the store's read path compiling against Evidence's widened type.
  - what: >-
      judgment-stage.ts's own live re-read of each cited capability's output
      schema through ICapabilityQuery at judgment time, rather than reading
      this snapshot off the evidence itself.
    why: >-
      Named as the judgment-reads-the-snapshot epic's own two sibling tasks
      (evaluator-port-and-prompt-carry-snapshotted-semantics,
      judgment-stops-re-reading-the-registry), which this task's own
      implements list does not name.
  - what: >-
      The simulate-case and simulate-hypothesis HTTP response DTOs
      (src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts)
      still validate/type an echoed evidence array against their own
      pre-existing evidenceSchema, which does not declare fields or
      concept_description.
    why: >-
      Neither DTO is named in this task's own criteria or in the inventory's
      touched-module list; extending an HTTP wire contract is a surface
      decision outside this task's own objective of what the collection
      stage snapshots in memory.
---

## What it is
The collection stage now reads the glossary alongside the capability registry and snapshots each concept's own declared description and its resolved capability's own declared field-by-field semantics onto every Evidence item it produces, honestly degraded where either source is absent.

## Notes
The relational investigation store's own read path is a disclosed, compile-preserving placeholder (fields: [], concept_description: '') since no migration exists yet for either attribute — the sibling task investigation-store-persists-the-snapshot is where that round-trip is implemented.
judgment-stage.ts's own live re-read of a cited capability's output schema is untouched — named as the judgment-reads-the-snapshot epic's own two sibling tasks, which this task's own implements list does not name.
The simulate-case and simulate-hypothesis HTTP response DTOs still validate their own pre-existing evidenceSchema, which does not declare fields or concept_description — extending an HTTP wire contract is a surface decision outside this task's own objective.
