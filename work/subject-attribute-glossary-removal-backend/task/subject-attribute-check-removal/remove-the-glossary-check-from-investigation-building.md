---
title: Remove the glossary attribute check from investigation building and delete its error
summary: buildInvestigation stops consulting the glossary, BuildInvestigationOptions drops the glossary
  field, run-diagnosis stops passing it, and refuseAttributesNotInGlossary and SubjectAttributeNotInGlossaryError
  leave the tree.
rationale: Cut as the second of two tasks over one check, taking the seam itself once its outside call
  sites are gone. The BuildInvestigationOptions.glossary field and run-diagnosis's object literal change
  together rather than as two tasks because run-diagnosis is that type's only construction site and TypeScript's
  excess-property check makes a delivery holding one without the other impossible to leave green.
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
objective: An investigation is built without any read of the glossary over its subject's attribute names,
  and no glossary-attribute refusal remains anywhere in src/.
criteria:
- buildInvestigation returns an investigation for a subject whose attribute names no glossary vocabulary
  holds, refusing it for no glossary reason.
- refuseAttributesNotInGlossary is gone from the tree rather than left exported with no caller.
- BuildInvestigationOptions declares no glossary field.
- run-diagnosis's buildInvestigationOptions builds its literal with no glossary line.
- InvestigationPipelineOptions.glossary and SimulateHypothesisPipelineOptions.glossary remain declared
  and are still supplied by simulate.factory.ts, production-simulate-hypothesis.factory.ts and diagnose.factory.ts.
- src/src/errors/subject-attribute-not-in-glossary.error.ts no longer exists.
- No file in src/ imports or names SubjectAttributeNotInGlossaryError.
- A diagnose whose subject omits an attribute the pinned case version's own requirements name required
  is still refused with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError.
- buildInvestigation's own totality refusal over evidence and evaluations is unchanged.
- investigation-factory.spec.ts asserts no glossary refusal and constructs no glossary stub.
- src's test suite passes.
depends_on:
- task/subject-attribute-check-removal/stop-checking-simulate-subject-attributes-against-the-glossary
implements:
- domain/investigation/subject-attribute-value
- contracts/investigation/glossary-source
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
---

## What it is
The check itself, its error class and the option field that existed only to feed it, removed from the investigation-building path that diagnose runs through.
What remains standing between a diagnose and a subject is the case-input-requirements coverage refusal already delivered at diagnose.controller.ts.

## Notes
run-diagnosis keeps receiving the pipeline's glossary through RunDiagnosisOptions, which extends InvestigationPipelineOptions; only the line copying it into the build options goes.
SubjectAttributeNotInGlossaryError has no entry in STATUS_BY_ERROR_CLASS, so deleting it removes no status mapping.
UNDERDETERMINED, from the specification — refuseAttributesNotInGlossary has two call sites this task's own criteria do not name (the two simulate controllers, changed by the sibling task this one depends on); nothing here alone excludes re-inlining an equivalent check there. Passes at: the sibling task's own delivery, which this task depends on and which removes both call sites.
REMAINDER, from the specification — rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes's clauses on collecting every missing attribute together, naming the capabilities that require each, and refusing before any collection are not reached by this task's own criterion (which guards only the HTTP 422 / SubjectDoesNotCoverCaseInputsError shape). Belongs to: the act that delivered that door refusal at diagnose.controller.ts, unchanged by this task.
ADVISORY, from the specification — the criterion holding buildInvestigation's totality refusal unchanged rests on rules/investigation/one-evidence-per-collected-concept and rules/investigation/one-evaluation-per-required-hypothesis, both outside this epic's covers.
Decision, beyond the covers — stand: rules/investigation/one-evidence-per-collected-concept and rules/investigation/one-evaluation-per-required-hypothesis govern the pipeline's own totality check, untouched by removing the glossary-attribute check; the criterion here is a regression guard on pre-existing, unaffected behavior, not a fact this task's claim needs to state.
