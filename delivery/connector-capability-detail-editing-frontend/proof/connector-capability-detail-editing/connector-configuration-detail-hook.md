---
title: Connector configuration detail hook, proven directly through renderHook
summary: 14 tests over useConnectorConfigurationDetail proving its own GET independence
  from the list cache, its loading/load-error/ready phase union, isDirty against a
  re-seeded loaded-or-saved baseline (including the minified-JSON comparison and the
  react-hook-form field), re-baselining and dual invalidation on a successful save,
  and a typed retry action on load failure -- with shared fixtures and helpers extracted
  to use-connector-configuration-detail.test-support.ts so the spec file stays under
  this project own max-lines rule.
implementation: sha256:1efb69ca0fd98aec38fd8cc0ab40b99c7b59d59a96824b7a7caea61054d94e0e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-connector-configuration-detail-hook-suite-3
tests:
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: resolves the ready phase from its own direct GET, not from a connector-configurations
    list query the caller's cache already held for this same connector
  proves: The hook issues its own GET for the connector configuration identified by
    connector, independent of any list screen having already fetched it.
  fails_when: the hook reads or falls back to the value already seeded under the connector-configurations
    list query key instead of consuming its own GET.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: reports loading before the GET resolves, then ready once it does
  proves: The hook exposes a loading | load-error | ready phase union, mirroring use-edit-draft-version-form.ts's
    shape.
  fails_when: the phase is anything other than loading while the GET is pending, or
    never transitions to ready once it resolves.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: isDirty is false immediately after load, before any edit
  proves: In the ready phase, isDirty is true only when at least one form field or
    the configuration JSON text differs from the values most recently loaded or saved.
  fails_when: isDirty reads true immediately after the record loads, before any field
    has been touched.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: isDirty becomes true once the configuration JSON text is edited to a materially
    different value
  proves: In the ready phase, isDirty is true only when at least one form field or
    the configuration JSON text differs from the values most recently loaded or saved.
  fails_when: isDirty stays false after the configuration text is changed to a value
    that differs, once minified, from the loaded baseline.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: isDirty becomes true once the connector form field is edited away from its
    loaded value, even while configuration stays unchanged
  proves: In the ready phase, isDirty is true only when at least one form field or
    the configuration JSON text differs; and the inference that connector is tracked
    as a react-hook-form field.
  fails_when: isDirty stays false after only the connector field's react-hook-form
    value is changed away from its loaded baseline.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: does not read as dirty when the configuration text is only reformatted to
    an equivalent pretty-printed value
  proves: the inference that isDirty's configuration comparison reads both sides through
    getJsonTextareaMinifiedValue rather than comparing raw strings.
  fails_when: isDirty reads true after the configuration text is only re-formatted
    to a pretty-printed value that parses to the same JSON as the loaded baseline.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: clears isDirty once the configuration text is edited back to its exact loaded
    value
  proves: Returning every field, including configuration, to its most recently loaded
    or saved value flips isDirty back to false.
  fails_when: isDirty stays true after the configuration text is edited back to exactly
    its loaded value.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: clears isDirty once the connector form field is edited back to its exact loaded
    value
  proves: Returning every field, including configuration, to its most recently loaded
    or saved value flips isDirty back to false.
  fails_when: isDirty stays true after the connector field is set back to exactly
    its loaded value.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: clears isDirty right after a successful save, with no further edits
  proves: A successful save re-baselines the originally loaded values, including configuration,
    to what was just saved, so isDirty is false immediately after a save with no further
    edits.
  fails_when: isDirty stays true immediately after onSubmit's mutation succeeds, with
    no edit made after the save.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: keeps the submitted configuration text as the new baseline even when the PUT
    response answers configuration as an object rather than the submitted string
  proves: the inference that the baseline is re-seeded from the values just submitted
    rather than from the PUT response body.
  fails_when: the hook reads the PUT response's own configuration field to re-baseline
    instead of using the submitted text.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: invalidates both the connector-configurations list query and its own connector-configuration
    query once the save succeeds
  proves: A successful save invalidates or updates both the "connector-configurations"
    list query and this hook own single-record query; and the query-key inference.
  fails_when: invalidateQueries is not called with both keys once the save succeeds.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: reports the load-error phase, with a retryLoad function, when the GET fails
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified connector configuration does not exist.
  fails_when: the phase is not load-error after the GET fails, or the load-error state
    carries no callable retryLoad.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: reports the load-error phase when the identified connector configuration does
    not exist
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified connector configuration does not exist.
  fails_when: the phase is anything other than load-error when the GET answers a 404.
- file: src/hooks/use-connector-configuration-detail.spec.ts
  name: reissues the GET when retryLoad is called, resolving to ready once the failure
    clears
  proves: The hook reports a load-error phase, with a typed retry action, when the
    GET fails or the identified connector configuration does not exist.
  fails_when: calling retryLoad does not issue a new GET, or the phase never reaches
    ready once that retried GET succeeds.
not_applicable:
- edge_case: a save refused because the configuration text is not syntactically valid
    JSON
  why: this task's own Notes assign showing that refusal to the operator to the later
    connector-configuration-detail-route task; none of this hook's seven criteria
    describe a refused-save phase or state.
- edge_case: two connector identities loaded through two concurrent instances of this
    hook
  why: no criterion or the contract this hook implements states cross-instance behavior;
    each instance's query is keyed by its own connector.
- edge_case: an empty collection returned where one is expected
  why: this hook loads and saves exactly one record by identity, never a list.
untested:
- onSubmit becoming a no-op while the configuration text is not valid JSON -- the
  hook's own code guards this before calling mutation.mutate, but none of the seven
  criteria state it and the implementation record does not list it as an inference,
  so no test here demonstrates that a submit attempt over invalid JSON text issues
  no PUT.
- a second onSubmit call arriving before the first one's mutation has settled (the
  isSubmittingRef double-submit guard) -- present in the hook's own code, but named
  by none of this task's criteria and recorded as no inference, so it is left unproven
  here.
---

## What it is

Proves the seven criteria and the four recorded inferences for useConnectorConfigurationDetail, using renderHook and stubbing only the global fetch boundary.

## Notes

Shared setup was extracted to use-connector-configuration-detail.test-support.ts so the spec file stays under this project own max-lines rule; no test assertion was weakened, deleted or narrowed to do so.
Two earlier suite attempts were red before this one: run/connector-capability-detail-editing-connector-configuration-detail-hook-suite failed lint (max-lines over the spec file, cause code, fixed by extracting the test-support helper); run/connector-capability-detail-editing-connector-configuration-detail-hook-suite-2 failed lint (a missing explicit return type on the test-support helper, cause code, fixed with a type-annotation-only change).
