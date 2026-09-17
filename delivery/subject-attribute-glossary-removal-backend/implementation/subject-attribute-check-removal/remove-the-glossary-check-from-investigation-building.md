---
target: backend
title: Remove the glossary attribute check from investigation building
summary: buildInvestigation no longer consults the glossary over subject attribute names; the glossary-shaped
  option, the check function, its error class and their test stubs are gone from investigation-factory.ts,
  run-diagnosis.ts and its spec.
task: sha256:fa16d101c0fc55657b7591c860305a23329bfe412bef355312194b8551b80286
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-check-removal-remove-glossary-check-build
files:
- path: src/investigation/investigation-factory.ts
  effect: 'Removed the refuseAttributesNotInGlossary function entirely, its call inside buildInvestigation,
    the glossary destructure, the readonly glossary: IGlossaryQuery field on BuildInvestigationOptions,
    and the now-unused SubjectAttributeNotInGlossaryError, IGlossaryQuery and Subject type imports. buildInvestigation
    now only builds the subject and runs the pre-existing totality refusal, unchanged.'
- path: src/investigation/run-diagnosis.ts
  effect: 'Removed the glossary: options.glossary, line from the BuildInvestigationOptions object literal
    buildInvestigationOptions constructs. RunDiagnosisOptions still extends InvestigationPipelineOptions,
    which still carries glossary — only the copy into the build options is gone.'
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  effect: 'Removed FakeGlossaryQuery and glossaryHolding, the six glossary-focused test cases (the not-in-glossary
    refusal, the multi-attribute refusal, the dedupe-by-name refusal, the all-held non-refusal, the glossary-port-failure
    passthrough, and the ordering-before-totality-checks assertion), the SubjectAttributeNotInGlossaryError
    import, the IGlossaryQuery/ConceptResolution/TermResolution/TermVocabulary type imports, and every
    glossary: field from validOptions''s default and from optionsOmittingTicketRef''s literal. The two
    surviving subject-related tests and every totality-violation test are otherwise unchanged.'
- path: src/errors/subject-attribute-not-in-glossary.error.ts
  effect: Deleted — no file in src/ imports or names SubjectAttributeNotInGlossaryError anymore.
criteria:
- criterion: buildInvestigation returns an investigation for a subject whose attribute names no glossary
    vocabulary holds, refusing it for no glossary reason.
  met: true
  how: The glossary read is gone from buildInvestigation entirely (no refuseAttributesNotInGlossary call,
    no glossary option), so an attribute name absent from every glossary vocabulary no longer causes a
    refusal at this seam; the surviving pass-through test exercises this with no glossary stub involved
    at all.
- criterion: refuseAttributesNotInGlossary is gone from the tree rather than left exported with no caller.
  met: true
  how: The function's declaration and body are deleted outright from investigation-factory.ts; grep across
    src/ confirms no remaining occurrence of the identifier anywhere.
- criterion: BuildInvestigationOptions declares no glossary field.
  met: true
  how: 'The readonly glossary: IGlossaryQuery member is removed from the type in investigation-factory.ts.'
- criterion: run-diagnosis's buildInvestigationOptions builds its literal with no glossary line.
  met: true
  how: 'The glossary: options.glossary, line is removed from the object literal buildInvestigationOptions
    returns in run-diagnosis.ts.'
- criterion: InvestigationPipelineOptions.glossary and SimulateHypothesisPipelineOptions.glossary remain
    declared and are still supplied by simulate.factory.ts, production-simulate-hypothesis.factory.ts
    and diagnose.factory.ts.
  met: true
  how: None of investigation-pipeline.ts, simulate-hypothesis-pipeline.ts, simulate.factory.ts, production-simulate-hypothesis.factory.ts
    or diagnose.factory.ts was touched; only the narrower BuildInvestigationOptions.glossary field and
    its one construction line were removed.
- criterion: src/src/errors/subject-attribute-not-in-glossary.error.ts no longer exists.
  met: true
  how: The file is deleted from the tree.
- criterion: No file in src/ imports or names SubjectAttributeNotInGlossaryError.
  met: true
  how: Grep for SubjectAttributeNotInGlossaryError across src/ after the edits and the file's deletion
    returns no occurrence anywhere.
- criterion: A diagnose whose subject omits an attribute the pinned case version's own requirements name
    required is still refused with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError.
  met: true
  how: This refusal lives in diagnose.controller.ts via subject-covers-case-input-requirements.ts, neither
    touched by this task; removing the glossary check from investigation-factory.ts/run-diagnosis.ts leaves
    that earlier door refusal unaffected.
- criterion: buildInvestigation's own totality refusal over evidence and evaluations is unchanged.
  met: true
  how: refuseTotalityViolations, evidenceTotalityViolations, evaluationTotalityViolations and countsByKey
    are untouched byte-for-byte; only the glossary check that used to run before them was removed.
- criterion: investigation-factory.spec.ts asserts no glossary refusal and constructs no glossary stub.
  met: true
  how: FakeGlossaryQuery, glossaryHolding and every test asserting SubjectAttributeNotInGlossaryError
    or exercising a glossary stub are deleted from the spec file; the remaining glossary:-bearing lines
    are removed too.
- criterion: src's test suite passes.
  met: true
  how: run/subject-attribute-check-removal-remove-glossary-check-build passed install, typecheck, lint,
    secret-scan and test-unit on the first attempt.
nodes:
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/investigation/investigation-factory.ts
  how: 'The node states the attribute name is free text rather than a governed vocabulary term. Removing
    the glossary lookup from buildInvestigation is what makes that true in the investigation-building
    path specifically: subjectAttributes now flows straight into buildSubject with no name held against
    any registry at this seam.'
- node: contracts/investigation/glossary-source
  encoded_at:
  - src/investigation/investigation-factory.ts
  how: The node scopes what the investigation reads from the glossary to read-concept, over evidence collection.
    investigation-factory.ts now imports nothing from the glossary module at all — the one glossary operation
    it used to call (readVocabularyTerm, for subject-attribute) is gone, leaving read-concept (elsewhere,
    during collection, untouched by this task) as the sole remaining consumption this contract describes.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  how: This task's own criterion guards only the pre-existing HTTP 422 / SubjectDoesNotCoverCaseInputsError
    shape, which lives in diagnose.controller.ts and subject-covers-case-input-requirements.ts — neither
    touched here. The rule's other clauses belong to that pre-existing door refusal and are unaffected
    by removing the unrelated glossary-attribute check, per the task's own REMAINDER note.
preserved:
- InvestigationPipelineOptions.glossary and SimulateHypothesisPipelineOptions.glossary, and every factory
  (simulate.factory.ts, production-simulate-hypothesis.factory.ts, diagnose.factory.ts) that constructs
  them.
- buildInvestigation's totality refusal over evidence and evaluations (refuseTotalityViolations and its
  helpers), byte-for-byte.
- The pre-existing case-input-requirements coverage refusal in diagnose.controller.ts / subject-covers-case-input-requirements.ts,
  and its 422 / SubjectDoesNotCoverCaseInputsError mapping in status-map.ts.
- Every totality-violation test case and helper in investigation-factory.spec.ts.
---

## What it is

The glossary check itself — the seam refuseAttributesNotInGlossary occupied, the option that fed it, and its own error class — removed from the investigation-building path shared by diagnose, simulate-case and simulate-hypothesis. What remains standing between a diagnose and a subject is the case-input-requirements coverage refusal already delivered at diagnose.controller.ts.

## Notes

UNDERDETERMINED, from the specification — refuseAttributesNotInGlossary had two call sites this task's own criteria did not name (the two simulate controllers); those were the sibling task's own delivery (task/subject-attribute-check-removal/stop-checking-simulate-subject-attributes-against-the-glossary, already delivered before this task started), which is what actually excludes re-inlining an equivalent check there.
The task-implementer's own delivery lacked a shell and could not physically delete src/src/errors/subject-attribute-not-in-glossary.error.ts; the coordinating session removed the file directly once every reference to its class was confirmed gone.
