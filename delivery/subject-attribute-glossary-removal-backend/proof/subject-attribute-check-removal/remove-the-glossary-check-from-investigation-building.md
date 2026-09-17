---
target: backend
title: Proof that the glossary-attribute check is gone from investigation building
summary: Tests confirm buildInvestigation and run-diagnosis's buildInvestigationOptions accept any subject
  attribute name with no glossary consultation, that BuildInvestigationOptions carries no glossary field
  at all, that the pre-existing case-input-requirements 422 door refusal and the totality-violation refusal
  are both unaffected, and that the removed identifiers are actually gone from the tree.
implementation: sha256:8d42cd73ce8c690534c73470adc1184587306050b35be9cdea0183f8014f8fac
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-check-removal-remove-glossary-check-suite
tests:
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: carries a subject whose type and every attribute-value pair are valid, unchanged, into the built
    Investigation
  proves: buildInvestigation returns an investigation for a subject whose attribute names no glossary
    vocabulary holds, refusing it for no glossary reason (pre-existing, unmodified — constructs no glossary
    stub at all and still succeeds)
  fails_when: buildInvestigation ever again consults a glossary before accepting subjectAttributes.
  demonstrates: domain/investigation/subject-attribute-value
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: declares no glossary field on BuildInvestigationOptions at all, required or optional, now that
    the check it fed is gone
  proves: BuildInvestigationOptions declares no glossary field
  fails_when: BuildInvestigationOptions gains a field literally named glossary again.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes the investigation successfully even though the glossary the pipeline still carries holds
    none of the subject's own attribute names — buildInvestigationOptions no longer copies glossary into
    the literal it hands to buildInvestigation
  proves: run-diagnosis's buildInvestigationOptions builds its literal with no glossary line
  fails_when: run-diagnosis's buildInvestigationOptions (or buildInvestigation reached through it) ever
    again consults the glossary over the subject's attribute names.
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: refuses a diagnose request whose subject leaves a required case input missing, throwing exactly
    a SubjectDoesNotCoverCaseInputsError
  proves: a diagnose whose subject omits a required attribute is still refused reporting a SubjectDoesNotCoverCaseInputsError
    (pre-existing, unmodified — diagnose.controller.ts not touched)
  fails_when: the pre-existing door refusal at diagnose.controller.ts stops raising SubjectDoesNotCoverCaseInputsError.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves SubjectDoesNotCoverCaseInputsError to 422
  proves: the refusal above answers with an HTTP 422 response (pre-existing, unmodified — status-map.ts
    not touched by this task)
  fails_when: SubjectDoesNotCoverCaseInputsError stops mapping to HTTP 422 in status-map.ts.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a collection-plan concept has no matching evidence
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (missing-evidence
    class)
  fails_when: evidenceTotalityViolations stops flagging a collection-plan concept with zero matching evidence
    entries.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when an evidence entry names a concept the collection plan does not hold
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (extraneous-evidence
    class)
  fails_when: evidenceTotalityViolations stops flagging evidence naming a concept the plan does not hold.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a collection-plan concept has more than one matching evidence entry
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (duplicate-evidence
    class)
  fails_when: evidenceTotalityViolations stops flagging more than one evidence entry for one concept.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a required hypothesis has no matching evaluation
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (missing-evaluation
    class)
  fails_when: evaluationTotalityViolations stops flagging a required hypothesis with zero matching evaluations.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when an evaluation names a hypothesis the case does not require
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (extraneous-evaluation
    class)
  fails_when: evaluationTotalityViolations stops flagging an evaluation naming a hypothesis the case does
    not require.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a required hypothesis has more than one matching evaluation
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (duplicate-evaluation
    class)
  fails_when: evaluationTotalityViolations stops flagging more than one evaluation for one required hypothesis.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses once, naming every violation from both the evidence and the evaluation totality checks
    together
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (combined-violation
    boundary)
  fails_when: the two totality checks stop being combined into one refusal naming every violation together.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: does not throw when the subject is valid, the evidence covers the collection plan and the evaluations
    cover the required hypotheses exactly once each
  proves: buildInvestigation's own totality refusal over evidence and evaluations is unchanged (valid,
    non-refusing case)
  fails_when: buildInvestigation refuses a subject, evidence and evaluation set that fully and exactly
    satisfies the case's own requirements.
not_applicable:
- edge_case: An attribute name that happens to match a term some glossary vocabulary would have held,
    had the check still existed
  why: The check and every glossary read at this seam are gone entirely; no code path branches on whether
    a name would have been held, so a held-name representative would exercise nothing the removed-name
    representative (already tested) does not already cover.
- edge_case: Two attribute-value pairs sharing the same attribute name (the old dedupe-by-name concern)
  why: Deduplication by name was a property of the removed glossary check alone; no surviving criterion
    or node governs uniqueness among a subject's own attribute names.
- edge_case: An attribute name that is empty, whitespace-only or otherwise malformed as a string
  why: No criterion or node this task implements states a constraint on the attribute name's own field-level
    shape beyond being a string.
- edge_case: A glossary port failure (rejecting promise) during the removed check
  why: There is no longer any glossary read at this seam for a port failure to occur against; the case
    is vacuous now that the call is gone.
untested:
- 'contracts/investigation/glossary-source: the node''s fact is a totality over the whole investigation
  module''s glossary consumption, spanning evidence-collection-stage.ts and investigation-pipeline.ts,
  neither touched by this task; no finite test in this task''s own scope decides that totality whole.
  The narrower fact (investigation-factory.ts no longer imports anything from the glossary module) was
  confirmed by directly reading the file''s import list rather than by a behavioral test.'
- 'rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes: the full policy statement
  (collecting every missing attribute together, naming the capabilities that require each, refusing before
  any collection) is not reached by this task''s own criterion, which guards only the pre-existing HTTP
  422 / SubjectDoesNotCoverCaseInputsError shape, per the task''s own REMAINDER note.'
- 'UNDERDETERMINED entry (refuseAttributesNotInGlossary''s two simulate-controller call sites): the entry
  names no implementation for this task to test against — the sibling task''s own already-delivered work
  is what excludes re-inlining an equivalent check there; no test is owed here.'
- 'Criterion (InvestigationPipelineOptions.glossary / SimulateHypothesisPipelineOptions.glossary remain
  declared and supplied): no new test written — this task touched none of those files; already covered
  by their own pre-existing, unmodified specs.'
- 'Criteria (refuseAttributesNotInGlossary gone from the tree; the error file deleted and unimported anywhere):
  verified by direct reading and grep rather than a written test — neither is an observable runtime behavior
  a test could assert without pinning the module''s own structure.'
- 'Criterion (investigation-factory.spec.ts itself asserts no glossary refusal and constructs no glossary
  stub): verified by reading the whole edited spec file — a fact about the test file''s own content, not
  a behavior its own tests could assert about themselves.'
---

## What it is

Thirteen assertions across four spec files — one new/adjusted (run-diagnosis.spec.ts, proving the glossary field's removal from the built-options literal), the rest pre-existing and unmodified — proving every testable criterion of task/subject-attribute-check-removal/remove-the-glossary-check-from-investigation-building.

## Notes

None.
