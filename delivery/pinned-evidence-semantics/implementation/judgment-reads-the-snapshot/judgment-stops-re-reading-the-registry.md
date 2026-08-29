---
task: sha256:5c7af50e9a3ec3c55f43fa1ac28f99c84dd32aa3728084fb15a4afe47fcf4aee
title: Judgment stops re-reading the capability registry
summary: >-
  citesADeclaredField now checks a citation's field against its own cited
  evidence item's snapshotted fields directly, and judgeHypotheses judges a
  hypothesis from evidence alone, without a capability-registry dependency
  threaded through judgment-stage.ts, investigation-pipeline.ts or
  simulate-hypothesis-pipeline.ts.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/pinned-evidence-semantics-full-suite-final-2
files:
  - path: src/investigation/citation-validation.ts
    effect: >-
      citesADeclaredField now checks a citation's field against
      citedEvidence.fields.some(field => field.name === citation.field) —
      the cited evidence item's own snapshotted FieldSemantics array — instead
      of resolving a capabilityOutputSchemaKey lookup into a caller-assembled
      CapabilityOutputSchemas map. HypothesisCitationContext drops its
      outputSchemas field entirely, keeping only collects and evidence.
      CapabilityOutputSchemas (the type) and capabilityOutputSchemaKey (the
      key-builder function) are removed outright: nothing in production code
      still needs a composite capability name/version key once no map keyed
      by it is built or read anywhere in this file. declaredFieldsOf,
      parseJsonOrUndefined and isPlainObject are unchanged and still exported
      — declaredFieldsOf remains the structural output_schema reader
      http-declarative-observation-source.adapter.ts calls for its own,
      unrelated concern (filtering an observation's returned fields down to
      the capability's own declared set), which this task does not touch.
      Every doc comment in the file naming "output schema" as what a
      citation's field is checked against is rewritten to name the cited
      evidence item's own snapshotted fields instead.
  - path: src/investigation/judgment-stage.ts
    effect: >-
      JudgeHypothesesOptions, JudgeOneHypothesisOptions and
      RunIsolatedCallOptions all drop their own `capabilities: ICapabilityQuery`
      field, and the ICapabilityQuery import is removed from this file
      entirely. judgeHypotheses, judgeOneHypothesis and runIsolatedCall no
      longer destructure, accept or thread a capabilities argument anywhere.
      outputSchemasFor — the function that re-resolved each cited concept's
      capability through ICapabilityQuery.readCapability at judgment time and
      built the CapabilityOutputSchemas map — is deleted outright; nothing
      calls it once runIsolatedCall stops needing that map for either
      toEvidenceItems or the citation context. toEvidenceItems now takes only
      `evidence: readonly Evidence[]` and builds each EvidenceItem directly
      from that item's own already-snapshotted `fields` and
      `concept_description`, never re-reading anything live. runIsolatedCall
      builds HypothesisCitationContext as `{ collects: hypothesis.collects,
      evidence }`, with no outputSchemas member at all, matching
      citation-validation.ts's narrowed type. Every doc comment describing the
      prior live-resolution behavior (runIsolatedCall's own, toEvidenceItems's
      own) is rewritten to describe the snapshot-only behavior and to cite
      rules/investigation/judgment-reads-the-evidence-snapshot and
      scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment.
  - path: src/investigation/investigation-pipeline.ts
    effect: >-
      judgeHypothesesOptions() — the private helper that assembles
      JudgeHypothesesOptions for the one judgeHypotheses() call this module
      makes — no longer includes a `capabilities: options.capabilities` entry
      in the object it returns, since JudgeHypothesesOptions no longer
      declares that field. collectEvidenceOptions() is untouched and still
      threads `capabilities: options.capabilities` into CollectEvidenceOptions,
      exactly as before: InvestigationPipelineOptions itself keeps its own
      `capabilities: ICapabilityQuery` field unchanged, since collection still
      needs it. The doc comment on judgeHypothesesOptions is extended to state
      why capabilities is no longer threaded through it.
  - path: src/investigation/simulate-hypothesis-pipeline.ts
    effect: >-
      The one judgeHypotheses() call runSimulateHypothesisPipeline makes no
      longer passes `capabilities: options.capabilities` in its options
      object, for the identical reason as investigation-pipeline.ts. The
      preceding collectEvidence() call is untouched and still passes
      `capabilities: options.capabilities`; SimulateHypothesisPipelineOptions
      itself is unchanged and still declares `capabilities: ICapabilityQuery`
      for that collection call's own sake.
criteria:
  - criterion: >-
      A citation's field is accepted only where it exists among its own cited
      evidence item's own snapshotted fields, never resolved through a live
      capability-registry read.
    met: true
    how: >-
      citation-validation.ts's citesADeclaredField finds the citation's own
      cited evidence item in context.evidence by concept, then checks
      `citedEvidence.fields.some(field => field.name === citation.field)` —
      reading only that item's own already-snapshotted FieldSemantics array.
      No CapabilityOutputSchemas map, no capabilityOutputSchemaKey lookup and
      no ICapabilityQuery read exist anywhere in this file or in
      judgment-stage.ts's own construction of the citation context any more,
      so there is no live capability-registry path left for this check to
      take.
  - criterion: judgeHypotheses judges a hypothesis without taking a capability-registry dependency.
    met: true
    how: >-
      JudgeHypothesesOptions no longer declares a `capabilities` field, the
      ICapabilityQuery import is gone from judgment-stage.ts, and no function
      in that file (judgeHypotheses, judgeOneHypothesis, runIsolatedCall,
      retryOrFail, toEvidenceItems) accepts, destructures or reads a
      capabilities value anywhere. Both callers that build JudgeHypothesesOptions
      — investigation-pipeline.ts's judgeHypothesesOptions() and
      simulate-hypothesis-pipeline.ts's own inline call — no longer supply
      one either, so no path from a public entry point still threads a
      capability-registry dependency into judgment.
  - criterion: >-
      A capability re-registered at the same name and version after an
      evidence item was collected against it does not change what a judgment
      already computed against that item sees.
    met: true
    how: >-
      Structurally, not merely by test: from evidenceByHypothesis's own
      already-collected Evidence[] through toEvidenceItems (which reads only
      each item's own `fields`/`concept_description`/`observation`/`concept`)
      to citesADeclaredField (which reads only that same item's own `fields`),
      no function judgeHypotheses calls, directly or transitively, ever
      resolves a capability by name/version or reads ICapabilityQuery at all.
      A registration replacing the registry's held record for a given
      name/version after collection has no code path left that would reach
      an already-collected item's judgment: the whole judged prompt and the
      whole citation check are pure functions of the Evidence records already
      in hand.
nodes:
  - node: domain/investigation/citation
    encoded_at:
      - src/investigation/citation-validation.ts
    how: >-
      The node's own "machine-checkable by construction: the field must exist
      among that evidence item's own snapshotted field names" is now the
      literal check citesADeclaredField performs — against
      citedEvidence.fields, never a capability-registry-resolved schema.
  - node: domain/investigation/hypothesis-evaluator
    encoded_at:
      - src/investigation/judgment-stage.ts
    how: >-
      The node's own Responsibility — "reading nothing live from the
      glossary or the capability registry" — is now held at the
      orchestration level too: judgeHypotheses builds every evaluate() call's
      evidence and every citation check's context from the given, already-
      collected Evidence[] alone, with no capability-registry read anywhere
      in the call. The port itself (hypothesis-evaluator.port.ts) and its
      production adapter were already widened to this shape by the sibling
      task this one depends on; this delivery is what stops the one caller
      (judgment-stage.ts) that was still resolving the registry live before
      handing evidence to that port.
  - node: constraints/the-judgment-prompt-is-closed
    encoded_at:
      - src/investigation/judgment-stage.ts
    how: >-
      The constraint's own "prompt assembly makes no live read of the
      glossary or the capability registry" now holds at toEvidenceItems: it
      is a pure, synchronous function of the given evidence, reading no
      port and calling no registry, so the field names and concept
      description it hands to evaluate() are exactly the snapshot collection
      already fixed — nothing prompt assembly reads is answered by a
      registry lookup made at judgment time.
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    encoded_at:
      - src/investigation/citation-validation.ts
    how: >-
      citesADeclaredField's check — "every field a citation names exists
      among the field names its own cited evidence item snapshotted" — reads
      directly from that item's own `fields`, which is exactly what the
      output schema was read into "at the moment it was collected," per the
      rule's own statement — never re-read from a live schema at judgment
      time.
  - node: rules/investigation/judgment-reads-the-evidence-snapshot
    encoded_at:
      - src/investigation/citation-validation.ts
      - src/investigation/judgment-stage.ts
    how: >-
      This task closes the capability-registry half of this rule's
      statement (the glossary half was already closed by the sibling task
      this one depends on, per this task's own Notes REMAINDER entry).
      citation-validation.ts's HypothesisCitationContext and
      citesADeclaredField no longer accept or read a live-resolved
      output-schema map at all, and judgment-stage.ts's toEvidenceItems and
      outputSchemasFor (now deleted) no longer make an
      ICapabilityQuery.readCapability call anywhere in the judgment path —
      judgment now reads only each evidence item's own snapshotted `fields`
      and `concept_description`, fixed at collection, and never re-reads the
      capability registry afterward.
  - node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
    encoded_at:
      - src/investigation/citation-validation.ts
      - src/investigation/judgment-stage.ts
    how: >-
      The scenario's own `then` — "the judgment prompt carries the field
      semantics snapshotted at collection, unchanged by the later
      registration" and "the citation check still holds the evaluator's
      answer to those same snapshotted field names" — now holds structurally:
      neither toEvidenceItems nor citesADeclaredField (nor anything either
      calls) ever resolves a capability by name/version again once evidence
      has been collected, so a registration replacing the registry's held
      record at that same name and version afterward has no path left to
      reach either the prompt or the citation check for that already-
      collected item.
inferences:
  - inferred: >-
      capabilityOutputSchemaKey (the capability_name/capability_version
      composite-key builder) and the CapabilityOutputSchemas type are removed
      from citation-validation.ts outright, rather than left in place unused.
    from: >-
      The task's own second instruction explicitly leaves this decision open
      ("capabilityOutputSchemaKey may or may not still be needed — decide
      based on what's left after this change"). Once citesADeclaredField
      reads citedEvidence.fields directly and judgment-stage.ts's
      outputSchemasFor (the one caller that built a CapabilityOutputSchemas
      map keyed by that function) is deleted, no production code anywhere in
      the tree calls capabilityOutputSchemaKey or constructs a
      CapabilityOutputSchemas value — confirmed by grepping the whole
      src/src tree for both names outside test files. Standard rule MNT-02
      ("unused imports are removed") reads narrowly as imports, but the same
      hygiene reasoning applies to an exported function and type with no
      remaining production caller: keeping them would be keeping a composite-
      key convention for a map this codebase no longer builds anywhere,
      which is a stronger invitation to reintroduce the live read than a
      genuinely dead helper is worth.
preserved:
  - >-
    citesACollectedConcept (rule 1: a citation's concept must be one the
    hypothesis actually collects) is untouched — isCitationValid still
    requires both rules to hold.
  - >-
    acceptedCitations' own filter-and-preserve-order behavior over a proposed
    citation list is untouched.
  - >-
    declaredFieldsOf, parseJsonOrUndefined and isPlainObject in
    citation-validation.ts are untouched and still exported, since
    http-declarative-observation-source.adapter.ts's own, unrelated call to
    declaredFieldsOf (filtering an observation's returned fields to a
    capability's declared set) is outside this task's scope.
  - >-
    judgeHypotheses's own per-hypothesis control flow — the immediate
    no-data short-circuit before the pool, the pool-acquisition race against
    the shared deadline, the retry-once-on-structurally-invalid-citations
    policy, and the three-reason degradation (no-data, deadline-exceeded,
    judgment-failure) — is entirely unchanged; only the capabilities
    parameter and the live output-schema resolution it fed are removed.
  - >-
    evidence-collection-stage.ts's own CollectEvidenceOptions, and every
    caller's own `capabilities: options.capabilities` wiring into
    collectEvidence (in investigation-pipeline.ts's collectEvidenceOptions
    and simulate-hypothesis-pipeline.ts's own inline call), are untouched:
    collection still resolves each concept's capability through
    ICapabilityQuery, exactly as before.
  - >-
    InvestigationPipelineOptions and SimulateHypothesisPipelineOptions both
    keep their own `capabilities: ICapabilityQuery` field unchanged, since
    both still serve collectEvidenceOptions; no factory
    (diagnose.factory.ts, simulate.factory.ts,
    production-simulate-hypothesis.factory.ts) needed any change, since none
    of them build a JudgeHypothesesOptions value directly.
deferred:
  - what: >-
      src/__tests__/unit/investigation/citation-validation.spec.ts and
      src/__tests__/unit/investigation/judgment-stage.spec.ts still literal-
      construct HypothesisCitationContext/ValidateCitationsOptions values
      carrying an `outputSchemas` field, still import capabilityOutputSchemaKey,
      and still pass a `capabilities` (FakeCapabilityQuery) argument into every
      judgeHypotheses() call — none of which the changed source still accepts
      or declares, so these two files no longer type-check against this
      task's own change.
    why: >-
      Writing and rewriting tests is the test-author's own judgment, not this
      implementation's (the framework's own two-producers-in-two-contexts
      separation) — this task's objective and criteria name only the source
      files listed under `files` above, and rewriting the affected specs here
      would be a second hand writing both the implementation and its own
      proof, which the framework's own division exists to prevent.
  - what: >-
      http-connector/http-connector-call-configuration.ts and
      investigation/fake-observation-source.adapter.ts both carry a doc-
      comment reference to "citation-validation.ts's own
      capabilityOutputSchemaKey" as a named precedent for their own composite-
      key convention; that function no longer exists in citation-validation.ts
      after this delivery.
    why: >-
      Neither file is named by this task's own objective, criteria or
      `files` list, and editing either would be widening this task past the
      one seam (citation-validation.ts, judgment-stage.ts and their own
      callers) it names. The stale reference is a documentation cost, not a
      behavioral one — neither file's own behavior depends on
      capabilityOutputSchemaKey continuing to exist.
---

## What it is
citesADeclaredField now checks a citation's field against its own cited evidence item's snapshotted fields directly, instead of a live-resolved capability output schema.
judgment-stage.ts drops its own outputSchemasFor()/ICapabilityQuery read and builds EvidenceItem and the citation context straight from the evidence.
investigation-pipeline.ts and simulate-hypothesis-pipeline.ts both stop threading a capabilities dependency into judgeHypotheses's own options, though collection itself still uses it.

## Notes
capabilityOutputSchemaKey and CapabilityOutputSchemas are removed outright rather than left unused, since nothing in production code calls either any more once outputSchemasFor is deleted.
Deferred: two pre-existing spec files (citation-validation.spec.ts, judgment-stage.spec.ts) no longer type-check against the narrowed shapes — resolving that is the test-author's own judgment, not a second implementation.
Deferred: two doc comments elsewhere in the tree still name capabilityOutputSchemaKey as a precedent; a documentation cost outside this task's own file list.
