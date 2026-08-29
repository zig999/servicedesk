---
title: "Proof for evidence collection snapshots concept and field semantics"
summary: "Tests proving fields/concept_description snapshotting in collectEvidence and fieldSemanticsOf's own reader, plus the typecheck-fallout repairs the widened Evidence/CollectEvidenceOptions/InvestigationPipelineOptions/SimulateHypothesisPipelineOptions types required across the pre-existing suite."
implementation: "sha256:1c99440cb0aa6b285f3d0f727cfe1edcde66248ce4f1dd6f4c703abe6789d969"
run: "run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4"
tests:
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records fields as one entry per top-level property the resolved capability's own output schema declares, carrying each key's own type and description exactly where the schema states them as strings"
    proves: "Evidence for a concept whose capability currently resolves records fields — one entry per key its output schema's own top-level properties declares, each carrying that key's own type and description where the schema states them."
    fails_when: "collectEvidence stops setting fields from fieldSemanticsOf(capability.output_schema), or the resulting entries omit a declared key, or carry a type/description the schema did not state, or drop one the schema did state"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records concept_description exactly as the glossary held that concept's description at the moment of collection"
    proves: "Evidence for a collected concept records concept_description exactly as the glossary held that concept's description at the moment of collection."
    fails_when: "collectEvidence stops reading the glossary for a concept's description, or the recorded concept_description differs from what the glossary answered"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records concept_description as the empty string, never a refusal, for a concept the glossary holds with none — a legacy concept registered before it declared one"
    proves: "Evidence for a concept registered with no description records concept_description as the empty string, never a refusal."
    fails_when: "collectEvidence throws or rejects for a concept the glossary holds with an empty description, or records anything other than the empty string for it"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records concept_description on a denied ending too, not only where the observation itself answers ok — the description is snapshotted from resolving the concept, not from how the observation itself ended"
    proves: "Evidence for a collected concept records concept_description exactly as the glossary held that concept's description at the moment of collection — across every evidence-result ending, not only ok"
    fails_when: "a denied observation's own Evidence loses or blanks concept_description, even though the glossary held one for the concept"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records fields on a denied ending too, since the capability still resolved even though the observation itself was denied — fields is a fact of the resolved capability, not of how the observation ended"
    proves: "Evidence for a concept whose capability currently resolves records fields — one entry per key its output schema's own top-level properties declares — across every evidence-result ending a resolved capability can reach, not only ok"
    fails_when: "a denied observation's own Evidence loses its fields even though the producing capability resolved and declared an output schema"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records concept_description as the empty string for a concept the glossary has never held at all, the same honest degradation as one registered with none"
    proves: "the implementation's own recorded inference that a concept the glossary never held at all (never registered) snapshots concept_description as the empty string, the same honest degradation as a registered concept with none"
    fails_when: "collectEvidence throws or rejects, or records anything other than the empty string, for a concept the glossary was never asked to hold at all"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "settles the capability read and the glossary-concept read together, so a concept nothing currently answers is timed by whichever of the two takes longer, never their sum"
    proves: "the implementation's own recorded inference that the capability read and the glossary-concept read settle together, through Promise.all, rather than one strictly before the other"
    fails_when: "the two reads are awaited one after the other instead of together, which would measure this concept's own elapsed_ms as the sum of both delays (400ms) rather than the larger of the two alone (300ms)"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "propagates a genuine rejection from the glossary-concept read rather than swallowing it as an empty description"
    proves: "a dependency failure on the newly added glossary read is not silently degraded to an empty description — the same never-swallow posture this stage already keeps for a genuine rejection from observe-concept"
    fails_when: "collectEvidence catches the glossary's own rejection and answers a degraded Evidence instead of letting the failure propagate"
  - file: "src/__tests__/unit/investigation/evidence-collection-stage.spec.ts"
    name: "records fields as an empty array for a concept whose capability never resolved, there being no output schema to read"
    proves: "Evidence for a concept whose capability never resolved records fields as an empty array."
    fails_when: "collectEvidence records anything other than an empty array in fields for a concept nothing currently answers"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers one entry per top-level property key the schema declares, in the order the schema states them"
    proves: "fieldSemanticsOf answers one FieldSemantics entry per key the schema's own top-level properties object declares — the reader domain/investigation/field-semantics and criterion 1 both depend on"
    fails_when: "fieldSemanticsOf answers a different count of entries than the schema declares keys, or reorders them"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "carries a key's own type and description together when the schema states both as strings"
    proves: "fieldSemanticsOf carries a key's own declared type and description exactly where the schema states them as strings"
    fails_when: "fieldSemanticsOf drops or alters either value when the schema declares both as strings"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "carries only the type, with no description key at all, when the schema declares a type but no description"
    proves: "fieldSemanticsOf carries type/description only where the schema states them — never inventing a description key that is absent"
    fails_when: "fieldSemanticsOf adds a description key, of any value, for a schema that declared none"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "carries only the description, with no type key at all, when the schema declares a description but no type"
    proves: "fieldSemanticsOf carries type/description only where the schema states them — never inventing a type key that is absent"
    fails_when: "fieldSemanticsOf adds a type key, of any value, for a schema that declared none"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "carries neither type nor description for a key whose own declared value is an empty object"
    proves: "fieldSemanticsOf answers name alone, inventing neither type nor description, for a key declaring neither"
    fails_when: "fieldSemanticsOf invents a type or description for a key whose own declared value states neither"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers name alone for a key whose own declared value is not an object at all, never throwing over its shape"
    proves: "fieldSemanticsOf reads only what a key's own declared value states, never throwing over an unexpected shape — domain/investigation/field-semantics's own 'an operator's own hint, never enforced'"
    fails_when: "fieldSemanticsOf throws, or answers anything but name alone, for a key whose own declared value is not an object"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "never carries a key's own type when the schema declares it as a non-string value, since only a string is read as this key's own declared type"
    proves: "fieldSemanticsOf reads type only where the schema states it as a string, never coercing a non-string value"
    fails_when: "fieldSemanticsOf carries a non-string type value through, or coerces it to a string"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "never carries a key's own description when the schema declares it as a non-string value"
    proves: "fieldSemanticsOf reads description only where the schema states it as a string, never coercing a non-string value"
    fails_when: "fieldSemanticsOf carries a non-string description value through, or coerces it to a string"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "reads no content of the schema beyond each property key's own type and description, ignoring every other declared JSON Schema keyword"
    proves: "fieldSemanticsOf reads and validates nothing of a key's own declared value beyond type/description — domain/investigation/field-semantics's own 'no other content of that schema is read or validated'"
    fails_when: "fieldSemanticsOf's answer changes in the presence of another JSON Schema keyword such as minLength, pattern or enum"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for an undefined output schema"
    proves: "fieldSemanticsOf answers an empty array for an undefined schema, matching Evidence for a concept whose capability never resolved recording fields as an empty array"
    fails_when: "fieldSemanticsOf throws, or answers anything but an empty array, for undefined"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for a schema that is not parseable JSON at all, rather than throwing"
    proves: "a malformed schema is nothing declared, never a fault — the same posture citation-validation.ts's declaredFieldsOf and capability-input-schema-shape.ts's declaredInputSchemaShape already keep"
    fails_when: "fieldSemanticsOf throws instead of answering an empty array for unparseable text"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for the empty string, which is not parseable JSON"
    proves: "the empty string is treated as unparseable JSON, not as a special-cased default"
    fails_when: "fieldSemanticsOf throws or answers anything but an empty array for the empty string"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for a schema that parses to valid JSON holding no top-level properties object at all"
    proves: "a schema absent a top-level properties object declares nothing, never a fault"
    fails_when: "fieldSemanticsOf answers anything but an empty array for JSON holding no properties object"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array when the schema's own top-level properties is declared but is not itself an object — a string, say, rather than a map of keys"
    proves: "a malformed properties value is read the same as an absent one, never a fault"
    fails_when: "fieldSemanticsOf throws, or reads keys from a non-object properties value"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array when the schema declares a top-level properties object with no keys at all"
    proves: "an empty properties object declares no fields, answered as an empty array rather than a fault"
    fails_when: "fieldSemanticsOf answers anything but an empty array for an empty properties object"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for a schema that parses to a JSON array rather than an object"
    proves: "a schema that is valid JSON but not an object at its own top level declares nothing, never a fault"
    fails_when: "fieldSemanticsOf throws, or reads properties from a JSON array"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "answers an empty array for a schema that parses to a bare JSON scalar, such as a number"
    proves: "a schema that is valid JSON but a bare scalar declares nothing, never a fault"
    fails_when: "fieldSemanticsOf throws, or answers anything but an empty array, for a bare JSON scalar"
  - file: "src/__tests__/unit/investigation/field-semantics.spec.ts"
    name: "imports neither citation-validation.ts's own declaredFieldsOf nor capability-input-schema-shape.ts's own declaredInputSchemaShape, keeping this a third, independently-implemented structural reader rather than a shared one (this task's own recorded inference)"
    proves: "the implementation's own recorded inference that field-semantics.ts follows the deliberate-duplication convention rather than importing either existing schema reader"
    fails_when: "field-semantics.ts's own import specifiers come to include citation-validation.js or capability-input-schema-shape.js"
  - file: "src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts"
    name: "answers fields as an empty array and concept_description as the empty string for every read evidence item, since no migration yet backs either column"
    proves: "the implementation record's own encoding of domain/investigation/evidence at relational-investigation-store.repository.ts — the read path (evidenceOf(row)) answers the same honest-empty snapshot for every row today, there being no column yet for either attribute"
    fails_when: "the read path starts answering a non-empty fields array or a non-empty concept_description for a row that carries no such column"
  - file: "src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts"
    name: "never forwards fields or concept_description into the evidence insert's own params, even when the given evidence carries non-empty values for both — the insert still carries exactly its own twelve params"
    proves: "this task's own disclosed deferral — that the store's write path is left compile-preserving only, not extended to persist fields/concept_description, which is the sibling task investigation-store-persists-the-snapshot's own objective"
    fails_when: "the evidence insert's own params array grows beyond twelve, or a given evidence's fields/concept_description values leak into it"
not_applicable:
  - edge_case: "two collectEvidence calls racing to collect the same concept at once, or one concept collected twice within a single plan"
    why: "collection concurrency and collectionPlan's own per-plan deduplication are this stage's pre-existing behavior, already proven by this file's own existing tests, and unaffected by this task's addition of fields/concept_description — no criterion here states anything about concurrent or duplicate collection"
  - edge_case: "a numeric boundary on how many fields a schema may declare, or how long a concept_description may be"
    why: "no criterion states a range or limit; fieldSemanticsOf reads every key the schema's own properties object declares, however many, and concept_description is carried through verbatim, however long — there is no boundary to test at either end"
  - edge_case: "an operation against a state that forbids collection, over the new fields/concept_description attributes specifically"
    why: "criterion 3 is exactly this dismissal stated as a criterion — a concept registered with no description is collected normally rather than refused — and is proven directly above rather than dismissed here"
untested:
  - "Whether collectEvidence's own required glossary dependency threads through to a real, working glossary-query instance in production composition (investigation-pipeline.ts's InvestigationPipelineOptions consumed by simulate.factory.ts's createSimulationRunner, and simulate-hypothesis-pipeline.ts's SimulateHypothesisPipelineOptions consumed by production-simulate-hypothesis.factory.ts's createProductionHypothesisSimulationRunner) is proven here only by typecheck — the interface now requires glossary, and every fixture in the touched spec files supplies one. No test in this proof exercises either factory's own construction of a real glossary-query instance from a database connection: doing so reaches into files this delivery's own fallout list does not name (simulate.factory.spec.ts, production-simulate-hypothesis.factory.spec.ts), and confirming it against a live connection is outside what a fake-based unit proof can exercise."
---

## What it is

This proof holds up the implementation's own widening of Evidence (`fields`, `concept_description`), CollectEvidenceOptions/CollectOneEvidenceOptions (`glossary`), InvestigationPipelineOptions and SimulateHypothesisPipelineOptions (`glossary`), and the new `field-semantics.ts` reader. It has two parts: repairing the roughly fifteen pre-existing test files the widening broke at `npm run typecheck`, so the tree compiles and every pre-existing assertion still holds against the new required fields; and writing the real, new tests this task's own four criteria and the implementation's own recorded inferences require — nine in `evidence-collection-stage.spec.ts` (the natural home for `collectEvidence`'s own behavior), eighteen in a new `field-semantics.spec.ts` (no test file existed for `fieldSemanticsOf` before this task), and two in `relational-investigation-store.repository.spec.ts` isolating this store's own disclosed compile-preserving degradation.

Every repaired fixture supplies `fields: []`/`concept_description: ''` (or, for `evidence-collection-stage.spec.ts`, a fresh `FakeGlossaryQuery` holding no concept) as its own default — the honest-empty snapshot this task's own criteria already sanction for a concept nothing currently answers or the glossary does not hold, so no repaired test asserts a fact the criteria do not already state.

## Notes

Fallout files repaired to keep `npm run typecheck` and the suite green, none of them carrying a new test of their own (their own pre-existing assertions, and the tasks that wrote them, are unchanged):

- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts

The test author who wrote this proof held no shell and did not run the suite itself. The caller (this session's own orchestrator) ran `npm run typecheck` afterward and found three pre-existing `max-lines-per-function` standard violations in the new `evidence-collection-stage.spec.ts` tests (three arrow functions over the 30-line bound) — a mechanical extraction (pulling a repeated subject literal, an output-schema literal, and a rejecting-glossary stub each into a small named helper, changing no assertion) brought the file back under the bound. The cited run is a full, clean whole-suite capture (143 files, 1659 tests, zero failures) taken after that mechanical fix, confirming every test this proof names.
