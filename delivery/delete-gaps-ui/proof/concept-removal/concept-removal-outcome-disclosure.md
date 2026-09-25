---
target: frontend
title: Concept removal's answered outcome, stated to the operator via toast
summary: Every stated criterion for useRemoveGlossaryConcept's outcome disclosure is backed
  by an existing test in use-glossary-concepts.spec.ts. Both UNDERDETERMINED notes are now
  proven against the implementation's own disclosed reading -- the merged, generic message
  for VALIDATION_ERROR/INTERNAL_ERROR/unrecognised codes, and the ConceptInUseError message
  that names the concept but never the reported reference -- rather than against a counterexample
  reading the implementation never took.
implementation: sha256:cedd39138903c53af0ea26e9a23a6189c5bc0aff2554538c9cd7fba3c6ffbb7c
tests:
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states success naming the removed concept's own name when the removal answers with
    HTTP 204 (criterion 1)
  proves: Criterion 1 -- a removal answered with HTTP 204 is stated as success naming the
    removed concept's name.
  fails_when: toast.success is not called, or its message omits the concept's name.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states that nothing was removed and that something still names the concept when refused
    with ConceptInUseError (criteria 2, 3)
  proves: Criteria 2 and 3 -- a ConceptInUseError refusal states that nothing was removed
    and that something still names the concept.
  fails_when: the toast.error message omits either "nothing was removed" or "still names".
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states a different message for a ConceptInUseError refusal than for an HTTP 400 VALIDATION_ERROR
    refusal (criterion 4)
  proves: Criterion 4 -- the ConceptInUseError statement differs from the VALIDATION_ERROR
    statement.
  fails_when: the two messages are identical.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states a different message for a ConceptInUseError refusal than for an HTTP 500 INTERNAL_ERROR
    refusal (criterion 5)
  proves: Criterion 5 -- the ConceptInUseError statement differs from the INTERNAL_ERROR statement.
  fails_when: the two messages are identical.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states that nothing was removed for $label (criteria 6, 7, 8; it.each over VALIDATION_ERROR,
    INTERNAL_ERROR, an unrecognised code)
  proves: Criteria 6, 7, 8 -- a refusal with VALIDATION_ERROR, INTERNAL_ERROR, or an error
    code the surface does not recognise each states that nothing was removed.
  fails_when: any of the three messages omits "nothing was removed".
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states a different message for a refusal with an unrecognised error code than for
    a ConceptInUseError refusal (criterion 9)
  proves: Criterion 9 -- the unrecognised-code statement differs from the ConceptInUseError
    statement.
  fails_when: the two messages are identical.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states neither success nor refusal while the removal has not been answered (criterion
    10)
  proves: Criterion 10 -- while the removal is pending, neither toast.success nor toast.error
    has been called; once answered, exactly one fires.
  fails_when: either toast fires before the request resolves.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: produces one identical generic statement for all three, keeping it apart only from
    ConceptInUseError's own statement
  proves: The UNDERDETERMINED note over a-submitted-removal-states-its-outcome-to-the-operator's
    own condition apart from every other condition -- proven against the implementation's
    own disclosed reading (concept-removal-outcome-disclosure.md's inferences) that VALIDATION_ERROR,
    INTERNAL_ERROR and an unrecognised code merge into one identical generic message, kept
    apart only from ConceptInUseError.
  fails_when: any two of the three merged messages differ from each other, or any of them
    equals the ConceptInUseError message.
- file: src/hooks/use-glossary-concepts.spec.ts
  name: states the identical message for a refusal reporting a capability reference and for
    one reporting an evidence reference
  proves: The UNDERDETERMINED note over a-registered-concept-is-never-removed's own reported
    reference -- proven against the implementation's own disclosed reading (concept-removal-outcome-disclosure.md's
    inferences) that the ConceptInUseError message names the concept by name and never distinguishes
    by the reported reference.
  fails_when: the capability-reference message differs from the evidence-reference message.
not_applicable:
- edge_case: A ConceptInUseError whose details omit reference or name entirely.
  why: No criterion requires reading either field beyond the concept's name, which is already
    supplied by the removal call's own argument, not by details.
- edge_case: Network- or transport-level failure distinct from a refused HTTP response.
  why: No criterion in this task's scope names a transport failure apart from an HTTP-carried
    refusal; fetch is mocked to resolve with a Response in every case.
untested:
- rules/glossary/a-registered-concept-is-never-removed's own four in-use conditions and the
  backend registering/refusing behavior behind them -- only the frontend's reading of ConceptInUseError's
  code and details.name is exercised here.
- Whether the reported reference (capability, evidence, citation, hypothesis-revision) is
  itself validated or normalised anywhere -- this proof only establishes that the implementation
  ignores it for messaging purposes, per its own disclosed choice.
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for stating a submitted concept removal's answered outcome to the operator via toast.

## Notes
Two UNDERDETERMINED-derived tests originally asserted readings the implementation never took (three-way-distinct refusal messages, and a reference-distinguishing ConceptInUseError message); the implementation's own disclosed choice merges all three refusal conditions into one generic message and never distinguishes by reported reference. Both tests were corrected to demonstrate the implementation's actual, legitimate reading rather than assert against it.
