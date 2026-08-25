---
title: Proof for the capability single-record edit hook (useCapabilityDetail)
summary: Renders useCapabilityDetail directly through renderHook against a stubbed
  global fetch, proving all seven criteria, all three recorded inferences, and the
  double-submit edge case, split across three .spec.ts files plus one shared test-support.ts
  to stay under this project's own max-lines rule from the start.
implementation: sha256:f5cc1c4cbeb20e90f28896fcd894e6f54af7d06ac48c3092f684e90443d81f8b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-capability-detail-hook-suite
tests:
- file: src/hooks/use-capability-detail.spec.ts
  name: resolves the ready phase from its own direct GET, not from a capabilities
    list query the caller's cache already held for this same (name, version)
  proves: The hook issues its own GET for the capability identified by both name and
    version, independent of any list screen having already fetched it.
  fails_when: the hook reads its ready-phase values from the capabilities list cache
    instead of the response of its own GET.
- file: src/hooks/use-capability-detail.spec.ts
  name: reports loading before the GET resolves, then ready once it does
  proves: The hook exposes a loading | load-error | ready phase union, mirroring use-edit-draft-version-form.ts's
    shape.
  fails_when: the hook reports anything other than loading while its GET is pending,
    or never transitions to ready once it resolves.
- file: src/hooks/use-capability-detail.spec.ts
  name: isDirty is false immediately after load, before any edit
  proves: In the ready phase, isDirty is true only when at least one form field, input_schema,
    or output_schema differs from the values most recently loaded or saved.
  fails_when: isDirty reads true immediately after a fresh load with no edit made.
- file: src/hooks/use-capability-detail.spec.ts
  name: isDirty becomes true once the input_schema text is edited to a materially
    different value
  proves: In the ready phase, isDirty is true only when at least one form field, input_schema,
    or output_schema differs from the values most recently loaded or saved.
  fails_when: isDirty stays false after input_schema is changed to a value that differs
    in content from its loaded baseline.
- file: src/hooks/use-capability-detail.spec.ts
  name: isDirty becomes true once the output_schema text is edited to a materially
    different value
  proves: In the ready phase, isDirty is true only when at least one form field, input_schema,
    or output_schema differs from the values most recently loaded or saved.
  fails_when: isDirty stays false after output_schema is changed to a value that differs
    in content from its loaded baseline.
- file: src/hooks/use-capability-detail.spec.ts
  name: isDirty becomes true once a form field is edited away from its loaded value,
    even while both JSON fields stay unchanged
  proves: isDirty also reads react-hook-form own dirty tracking rather than only the
    two schema comparisons.
  fails_when: isDirty stays false after the connector field is set away from its loaded
    value.
- file: src/hooks/use-capability-detail.spec.ts
  name: clears isDirty once the input_schema text is edited back to its exact loaded
    value
  proves: Returning every field, including input_schema and output_schema, to its
    most recently loaded or saved value flips isDirty back to false.
  fails_when: isDirty stays true once input_schema is edited back to the exact string
    it was loaded with.
- file: src/hooks/use-capability-detail.spec.ts
  name: clears isDirty once the output_schema text is edited back to its exact loaded
    value
  proves: Returning every field, including input_schema and output_schema, to its
    most recently loaded or saved value flips isDirty back to false.
  fails_when: isDirty stays true once output_schema is edited back to the exact string
    it was loaded with.
- file: src/hooks/use-capability-detail.spec.ts
  name: clears isDirty once a form field is edited back to its exact loaded value
  proves: Returning every field, including input_schema and output_schema, to its
    most recently loaded or saved value flips isDirty back to false.
  fails_when: isDirty stays true once the connector form field is set back to its
    exact loaded value.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: clears isDirty right after a successful save, with no further edits
  proves: A successful save re-baselines the originally loaded values, including both
    JSON schema fields, to what was just saved, so isDirty is false immediately after
    a save with no further edits.
  fails_when: isDirty stays true after a successful save even though nothing was edited
    afterward.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: re-baselines both JSON fields to the values just submitted, not whatever the
    PUT response body's own schema fields carry
  proves: A successful save re-baselines the originally loaded values, including both
    JSON schema fields, to what was just saved.
  fails_when: the post-save baseline is derived from the PUT response body instead
    of the values just submitted.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: invalidates both the capabilities list query and its own capability query
    once the save succeeds
  proves: A successful save invalidates or updates both the "capabilities" list query
    and this hook own single-record query.
  fails_when: a successful save fails to invalidate either key.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reports the load-error phase, with a retryLoad function, when the GET fails
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified (name, version) capability does not exist.
  fails_when: a failing GET does not resolve to load-error, or the load-error state
    carries no callable retryLoad.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reports the load-error phase when the identified (name, version) capability
    does not exist
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified (name, version) capability does not exist.
  fails_when: a 404 response for the identified capability does not resolve to load-error.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reissues the GET when retryLoad is called, resolving to ready once the failure
    clears
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified (name, version) capability does not exist.
  fails_when: calling retryLoad issues no further request, or the hook never recovers
    to ready.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: exposes the concept vocabulary this hook itself reads, once both reads resolve
  proves: the inference that this hook also reads the glossary concept vocabulary
    and exposes it as conceptOptions.
  fails_when: the ready phase's conceptOptions does not carry the concepts this hook
    own GET returned.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reports the load-error phase when the concept vocabulary read fails, even
    though the identity GET succeeds
  proves: the inference that conceptOptions is gated into the same loading/load-error
    phases as the identity GET.
  fails_when: a failing concept-vocabulary read is not reflected as load-error when
    the identity GET alone succeeded.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: reissues the concept vocabulary read when retryLoad is called after only that
    read failed, resolving to ready once it succeeds
  proves: the inference that conceptOptions is gated into the same phases through
    the same retryLoad action.
  fails_when: retryLoad does not reissue the concept-vocabulary read, or the hook
    never recovers to ready once that read alone succeeds.
- file: src/hooks/use-capability-detail-load-error.spec.ts
  name: does not carry an isEditingIdentity property on its ready-phase state
  proves: the inference that this hook exposes no isEditingIdentity flag.
  fails_when: the ready-phase state object carries an isEditingIdentity property.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: returns isSubmitting to false and keeps the ready phase once the PUT fails,
    with isDirty still true
  proves: the inference that a save register-capability refuses is left to the mutation's
    own default onError-less settling.
  fails_when: isSubmitting stays stuck at true after a failed save, or the failed
    save reverts the edited input_schema value, or the phase leaves ready on a save
    failure.
- file: src/hooks/use-capability-detail-save.spec.ts
  name: dispatches only one PUT even when onSubmit is called twice before the first
    save has resolved
  proves: the double-submit guard the implementation own files effect describes.
  fails_when: calling onSubmit twice before the first save settles dispatches more
    than one PUT request.
not_applicable:
- edge_case: an absent or empty name/version identity
  why: this hook's own two parameters are always supplied by the router's already-validated
    path params; no criterion states behavior for an empty identity.
- edge_case: a duplicate (name, version) pair, or any other uniqueness constraint
  why: no criterion states a uniqueness rule this hook itself enforces; uniqueness
    at that identity is the registry's own concern.
- edge_case: an empty concept vocabulary collection
  why: useConceptOptions already defaults to an empty array on its own, unchanged
    by this task.
- edge_case: a numeric boundary on the timeout field
  why: bounds on timeout are capabilityFormSchema's own pre-existing validation from
    an earlier task.
untested:
- retryLoad own recovery when both the identity GET and the concept vocabulary read
  are failing at once -- each was tested failing alone, but not the combined case.
- the exact wire body a successful PUT dispatches -- no criterion states a wire shape,
  and every assertion is over the hook own returned state rather than the request
  body.
- isolation between two concurrently mounted instances of this hook for two different
  (name, version) identities -- no criterion addresses multi-instance behavior.
divergences:
- cites: TST-04
  file: src/hooks/use-capability-detail-save.spec.ts
  departure: the file own name carries a -save suffix beyond use-capability-detail
    plus .spec, because criteria 5-6, the refused-save inference and the double-submit
    edge case were split out to stay under this project own max-lines rule.
  why: the same rule and reasoning already establishes this exact pattern elsewhere
    in this codebase (new-case-draft-screen.spec.ts / -save.spec.ts / -conflict.spec.ts,
    whose own header comment cites the identical rule).
- cites: TST-04
  file: src/hooks/use-capability-detail-load-error.spec.ts
  departure: the file own name carries a -load-error suffix beyond use-capability-detail
    plus .spec, because criterion 7 and two inferences were split out to stay under
    this project own max-lines rule.
  why: the same reasoning and established precedent as the -save.spec.ts divergence
    above.
---

## What it is

Proves the seven criteria, three recorded inferences, and the double-submit edge case for useCapabilityDetail, split across three spec files plus a shared test-support.ts from the start to respect this project own max-lines rule.

## Notes

None.
