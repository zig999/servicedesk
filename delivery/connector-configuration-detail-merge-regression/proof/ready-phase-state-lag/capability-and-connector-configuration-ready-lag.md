---
target: frontend
title: Ready-phase render-timing proof for useCapabilityDetail, useConnectorConfigurationDetail and useConnectorConfigurationDetailView
summary: Confirms the two pre-existing regression specs now pass and adds render-log-based tests proving
  every field this task's criteria and underdetermined notes name is already correct in the very first
  render reporting phase "ready", rather than lagging one render behind inside a useEffect.
implementation: sha256:24e92f1174b03c979c6591ae390a9d86324e4de34bab75d8105bb1165d9b1485
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/ready-phase-state-lag-capability-and-connector-configuration-ready-lag-suite-2
tests:
- file: src/hooks/use-capability-detail.spec.ts
  name: useCapabilityDetail -- issuing its own GET, independent of the list cache (criterion 1) > resolves
    the ready phase from its own direct GET, not from a capabilities list query the caller's cache already
    held for this same (name, version)
  proves: Criterion 1 — "The first render in which useCapabilityDetail reports phase \"ready\" carries
    the loaded capability's input_schema text in inputSchema.value." Pre-existing test named by this task's
    own reproduction as the one that failed against the merge regression.
  fails_when: inputSchema.value at the first render reporting "ready" is empty or stale because input_schema
    is still populated one render later inside a useEffect gated on query.data.
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationDetailReadyView — Add attribute reconciles against the registered configuration
    text, not an unsaved edit (criterion 3) > keeps reconciling against the last registered text after
    Configuration is edited but not saved
  proves: Criterion 4 — clicking Add attribute immediately after load (before any edit) reads placeholders
    from the just-loaded configuration text — and the underdetermined note over criterion 4's "before
    any edit" bound (the note naming an Add attribute that instead derives names from the live editable
    field on every click, still passing criterion 4's own before-any-edit check). Pre-existing test named
    by this task's own reproduction as the one that failed against the merge regression.
  fails_when: clicking Add attribute right after load finds no placeholders (registeredConfigurationText/configuration.value
    still empty at the first ready render), or clicking Add attribute after editing-but-not-saving Configuration
    picks up the live edited text's placeholders (["region"]) instead of the last registered ones (["account-id"]).
- file: src/hooks/use-capability-detail.spec.ts
  name: useCapabilityDetail -- issuing its own GET, independent of the list cache (criterion 1) > resolves
    the ready phase with output_schema from its own direct GET as well, not from a capabilities list query
    the caller's cache already held with a different output_schema for this same (name, version) (an underdetermined
    note in this task)
  proves: The underdetermined note over a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's
    sourcing clause, for the output_schema half — that outputSchema.value comes from read-capability-by-identity's
    own GET, never a list-capabilities page held in client state for the same identity.
  fails_when: outputSchema.value at the ready phase ever reflects a list-capabilities page's own output_schema
    instead of the identity-keyed GET's own answer.
- file: src/hooks/use-capability-detail.spec.ts
  name: useCapabilityDetail -- the very first render reporting the ready phase already carries the loaded
    output_schema text (criterion 2, this task) > carries outputSchema.value equal to the loaded output_schema
    in the render log's first ready entry
  proves: Criterion 2 — "The first render in which useCapabilityDetail reports phase \"ready\" carries
    the loaded capability's output_schema text in outputSchema.value."
  fails_when: the render log's first entry reporting phase "ready" carries outputSchema.value at "" or
    a stale value, because output_schema is still set one render later inside a useEffect.
- file: src/hooks/use-capability-detail.spec.ts
  name: useCapabilityDetail -- every form field the ready state exposes lands in the same render phase
    first reads ready, not one render later (an underdetermined note in this task) > carries nature, timeout,
    connector and concept in form.getValues() in the render log's first ready entry
  proves: The underdetermined note over a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
    observing that criteria 1 and 2 reach only the two schemas, leaving nature/timeout/connector/concept
    untested against a candidate that fills them one render later.
  fails_when: any of nature, timeout, connector or concept in form.getValues() at the first ready render
    still holds a pre-load or default value, because form.reset() with those fields runs one render later
    than the schema/text sync.
- file: src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
  name: useConnectorConfigurationDetail -- the very first render reporting the ready phase already carries
    the loaded configuration text (criterion 3, this task) > carries configuration.value equal to the
    loaded configuration in the render log's first ready entry
  proves: Criterion 3 — "The first render in which useConnectorConfigurationDetail reports phase \"ready\"
    carries the loaded connector's configuration text in configuration.value."
  fails_when: the render log's first entry reporting phase "ready" carries configuration.value at "" or
    stale text, because configurationValue is still set one render later inside a useEffect.
- file: src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
  name: useConnectorConfigurationDetail -- the connector name lands together with the configuration text
    once a different connector's own record loads into the same hook instance (an underdetermined note
    in this task) > carries the newly loaded connector's own name in form.getValues('connector'), not
    the previous connector's, in the render log's first ready entry that already shows the new configuration
    text
  proves: The underdetermined note over a-presented-connector-configuration-states-an-outstanding-or-failed-read
    observing that criterion 3 reaches only configuration.value, leaving the connector-name half of "presents
    the connector name and the configuration exactly as the read answered them" untested against a candidate
    that leaves the connector name at the previous configuration's name for one further render.
  fails_when: the render that first exposes the newly loaded connector's own configuration text still
    carries the previous connector's name in form.getValues('connector'), because form.reset({connector})
    runs one render later than configurationValue does.
- file: src/hooks/use-connector-configuration-detail-view.spec.ts
  name: useConnectorConfigurationDetailView -- onDiscard already resets to the loaded configuration at
    the very first ready render, not an empty or stale baseline (an underdetermined note in this task)
    > resets configuration.value to the loaded text, not the empty string, when onDiscard is invoked from
    the render log's first ready entry
  proves: The underdetermined note over criterion 4's "registered baseline" clause, tied to a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
    — that the discard baseline this view hook feeds onDiscard from is already correct at the first ready
    render, not still holding its pre-load (empty) value.
  fails_when: invoking onDiscard captured from the render log's first ready entry resets configuration.value
    to the empty string or a stale value, because the view hook's own registered-configuration baseline
    had not yet synchronized with the base hook's already-correct configuration.value.
not_applicable:
- edge_case: A dependency that fails or answers slowly
  why: This task's fix concerns only how already-resolved query data populates ready-phase fields within
    a single render; it does not touch the loading or load-error phases, or the pending-submission path,
    all of which already have their own pre-existing, unaffected coverage (e.g. "reports 'loading' before
    the GET resolves...", the load-error retry tests, and "stays false while a save is still pending...").
- edge_case: Two operations against one subject at once (a concurrent submission)
  why: The fix touches only the render-time synchronization from query data to ready-phase state; the
    submission guard (isSubmittingRef) that governs concurrent submits is untouched by this task and already
    covered by existing tests.
- edge_case: An empty collection where one comes back, or a duplicate where uniqueness is claimed
  why: This task's criteria concern scalar text and form-field values (schema/configuration text, name/version/nature/timeout/connector/concept)
    synchronized at render time, never a collection or a uniqueness constraint.
- edge_case: A boundary at each end of a stated range
  why: No criterion here names a numeric or length boundary; the behavior is entirely about which render
    a value first appears in.
- edge_case: Absent or empty input
  why: The criteria concern an identity-keyed read that already resolved to a full record; an identity
    that resolves to nothing already routes to the pre-existing "not-registered" / "load-error" phases,
    which this task leaves untouched.
untested:
- Two of the three alternate sources the underdetermined note over a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  names for a wrongly-sourced input_schema/output_schema — read-capability's own concept-keyed answer,
  and the content a register-capability submission carried — are not tested here. Only the list-capabilities
  alternative was tested, mirroring the one already-precedented pattern this codebase uses (poisoning
  a sibling react-query cache entry); this codebase holds no client-side cache keyed by concept or by
  a register-capability submission that useCapabilityDetail could plausibly read from instead, so simulating
  those two alternatives would fabricate a code path nothing here has.
- use-capability-detail-view.ts's own onDiscard baseline (inputSchemaBaselineRef/outputSchemaBaselineRef)
  still synchronizes inside a useEffect, per the implementation record's own 'deferred' disclosure — a
  Discard taken immediately after the capability detail screen's own load resolves could still reset fields
  to their pre-load values. No criterion of this task reaches the capability screen's discard act, so
  no test was written against it; this mirrors exactly what the implementation record already discloses
  as out of scope.
- The reference-equality condition (query.data !== syncedCapabilityData / syncedConfigurationData) that
  gates each render-time sync block is pre-existing behavior from commit 1c643a65, shared with the already-shipped
  configurationValid sync, and no criterion or underdetermined note of this task reaches whether a refetch
  returning content-identical data under a new object reference re-triggers the sync correctly; left untested
  here as outside this task's own claims.
---

## What it is

Proves the fix in `implementation/ready-phase-state-lag/capability-and-connector-configuration-ready-lag.md`
by confirming the two pre-existing regression specs pass again and by adding render-log-based
tests for the fields the task's own underdetermined notes named as reached by the bound
specification nodes but not by any criterion.

## Notes

The first suite attempt (`run/ready-phase-state-lag-capability-and-connector-configuration-ready-lag-suite`)
failed at the `lint` step: `use-connector-configuration-detail.spec.ts` exceeded the standard's
300-line cap (MNT-01) at 340 lines. The two new tests over `useConnectorConfigurationDetail` were
relocated, unweakened, into a new sibling file `use-connector-configuration-detail-ready-render-timing.spec.ts`,
restoring the original file to its prior 310 lines. This record and `tests` reflect that layout.
