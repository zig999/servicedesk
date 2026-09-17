---
target: frontend
title: Compose the subject from case-input-requirements alone
summary: Proves that useSimulationSubject exposes no curator-added attribute state, composes the subject's
  attributes from requiredFields alone (paired, deduplicated first-wins, empty-skipping), and that isReady
  stays exactly requester-non-empty-and-at-least-one-pair, driven through the hook's own spec and both
  missing-requirement specs with no call to a removed member.
implementation: sha256:593cbc37721236d7a8b1495491ad67757e57207d00f399aa6fe04170da684922
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-union-compose-subject-hook-suite-2
tests:
- file: src/hooks/use-simulation-subject.spec.ts
  name: exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange member
  proves: SimulationSubjectState exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange
    member.
  fails_when: the hook's returned state carries any of those four members
- file: src/hooks/use-simulation-subject.spec.ts
  name: composes one {attribute, value} pair per filled requirement input, each holding that field's own
    typed value
  proves: The composed subject's attributes are exactly the requirement inputs holding a non-empty value,
    one attribute-value pair each.
  fails_when: a filled requirement input's pair is missing, mismatched, reordered, or the pair stops being
    a single {attribute, value} object
  demonstrates: domain/investigation/subject-attribute-value
- file: src/hooks/use-simulation-subject.spec.ts
  name: carries only one attribute-value pair when two requirement inputs name the same attribute
  proves: The composed subject carries at most one value per attribute name.
  fails_when: two requirement inputs sharing an attribute name both contribute a pair
- file: src/hooks/use-simulation-subject.spec.ts
  name: omits the attribute for a requirement input left empty, while still pairing a sibling field that
    was filled
  proves: A requirement whose input is empty contributes no attribute-value pair to the composed subject.
  fails_when: the empty sibling field contributes a pair, or the filled field's own pair is dropped instead
  demonstrates: rules/investigation/an-empty-attribute-input-is-no-attribute-value
- file: src/hooks/use-simulation-subject.spec.ts
  name: stays not-ready while the requester is empty, even once the one derived required field holds a
    value
  proves: isReady is true exactly when the requester is non-empty and the composed subject carries at
    least one attribute-value pair.
  fails_when: isReady turns true while the requester is still empty
- file: src/hooks/use-simulation-subject.spec.ts
  name: turns ready once every derived required field and the requester hold a non-empty value
  proves: isReady is true exactly when the requester is non-empty and the composed subject carries at
    least one attribute-value pair.
  fails_when: isReady stays false once both conditions hold
- file: src/hooks/use-simulation-subject.spec.ts
  name: never turns ready for a subject holding zero attribute-values, even once the requester is filled,
    for a version whose case-input-requirements read names no field
  proves: isReady is true exactly when the composed subject carries at least one attribute-value pair.
  fails_when: isReady turns true while the subject carries zero attribute-value pairs
- file: src/hooks/use-simulation-subject.spec.ts
  name: computes the same subject and the same readiness from two independently mounted instances given
    the same pinned case version, registries and typed values
  proves: preservation of the prior task's own criterion that one subject and its readiness are shared
    identically between a full-case and a single-hypothesis run.
  fails_when: two independently mounted instances, given identical inputs, compute a different subject
    or readiness
- file: src/hooks/use-simulation-subject.spec.ts
  name: derives a different field set once the pinned version changes, with the same source and the same
    registries
  proves: The requiredFields member is unchanged and the case-input-requirements read it derives from
    is not modified.
  fails_when: requiredFields stops changing when the pinned version changes
- file: src/hooks/use-simulation-subject.spec.ts
  name: exposes a required field for an attribute the read names, with no capability resolving for it
    at all
  proves: requiredFields is unchanged.
  fails_when: requiredFields stops naming or exposing that attribute, or drops its required flag
- file: src/hooks/use-simulation-subject.spec.ts
  name: resolves cleanly, with its derived field intact, even though the stubbed backend answers nothing
    at all for a connector-configuration endpoint
  proves: The case-input-requirements read is not modified.
  fails_when: the hook now reads, or requires an answer from, a connector-configuration endpoint
- file: src/hooks/use-simulation-subject.spec.ts
  name: stays true while the case-input-requirements read is still pending, even once the capabilities
    read has already resolved
  proves: isLoadingRegistries is unchanged.
  fails_when: isLoadingRegistries turns false before both reads have settled
- file: src/hooks/use-simulation-subject.spec.ts
  name: turns true when the case-input-requirements read fails, without throwing out of the hook itself
  proves: isRegistriesError is unchanged.
  fails_when: isRegistriesError stays false after that read fails, or the hook throws
- file: src/hooks/use-simulation-subject.spec.ts
  name: turns true when the capabilities read fails, without throwing out of the hook itself
  proves: isRegistriesError is unchanged.
  fails_when: isRegistriesError stays false after that read fails, or the hook throws
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: stays ready with the required field's own input still empty, as long as another requirement input
    and the requester are filled, and stays ready once that same required field is filled in afterwards
    too
  proves: The hook's specs drive readiness/dispatch-hold through requirement inputs alone, still asserting
    the dispatch hold.
  fails_when: isReady turns false while the required field's own input is empty
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: stays ready with a required requirement and an optional requirement both left completely empty,
    as long as a third requirement input and the requester are filled
  proves: a requirement's mere presence is never by itself a reason readiness is refused.
  fails_when: isReady turns false merely because a required or optional requirement's own input is empty
- file: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  name: 'still reports required: true for the requirement the read names required, while that same field''s
    own input stays empty and readiness is true'
  proves: a requirement's own required flag is still carried through even though the gate stopped reading
    it.
  fails_when: the required flag disappears or reports false for a requirement named required
- file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  name: issues the /v1/simulate request once the requester and a second requirement input are filled,
    with the one required field still empty
  proves: the simulate-case dispatch is not refused by the required field's own empty input.
  fails_when: onSimulateCase issues no request, or more than one, under those conditions
- file: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  name: issues the /v1/simulate/hypothesis request once the requester and a second requirement input are
    filled, with the one required field still empty
  proves: the simulate-hypothesis dispatch is not refused by the required field's own empty input.
  fails_when: onSimulateHypothesis issues no request, or more than one, under the same conditions
not_applicable:
- edge_case: more than two requirement inputs sharing the same attribute name
  why: the obligation only changes behavior at the 'more than one' boundary, which the two-duplicate test
    already crosses
- edge_case: requiredFields being null or undefined at the composedAttributes call site
  why: deriveSubjectFields always returns an array and useCaseInputRequirements defaults to [], so requiredFields
    is always an array
- edge_case: two onChange calls racing outside of React's own batching
  why: every write is a plain useState setter invoked synchronously inside act(); there is no asynchronous
    path for two writes to interleave
untested:
- 'rules/investigation/a-subject-holds-one-value-per-attribute''s tie-break direction is not observable
  through useSimulationSubject''s public interface: two requiredFields entries sharing an attribute name
  always carry an identical value at any given render (both keyed by the same values[attribute]), so only
  the ''at most one'' half is decided; first-recorded-wins mechanics stay a reading of the source.'
- domain/knowledge/case-input-requirement's whole fact (attribute name, required flag, 1..* currently-registered
  capability) is computed by useCaseInputRequirements and deriveSubjectFields, neither modified by this
  task nor exercised by this proof's own files as their subject.
- rules/investigation/a-composed-subject-presents-every-case-input-requirement's third clause (only a
  required flag gates the call) reaches no criterion of this task per its own REMAINDER note, and belongs
  to the already-delivered hold-the-simulate-dispatch-open task.
- The implementation's whitespace-as-empty inference is not pinned by any test here, since neither the
  criterion nor the new node states it explicitly.
---

## What it is

Nineteen tests across three spec files proving every testable criterion of task/composed-subject-attribute-inputs/compose-the-subject-from-case-input-requirements-alone.

## Notes

None.
