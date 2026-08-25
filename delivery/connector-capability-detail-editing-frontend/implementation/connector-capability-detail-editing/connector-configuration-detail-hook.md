---
title: Connector configuration single-record edit hook
summary: A new hook, useConnectorConfigurationDetail, that GETs one connector configuration
  by identity, tracks isDirty against a re-seeded loaded-or-saved baseline (including
  the configuration JSON text), and re-baselines/invalidates on a successful save.
task: sha256:ccecc59920c94bdcac80048c0ef45823cf52e6c6eae1d8ee7359f0d58846450a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-connector-configuration-detail-hook-build-2
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: exports useConnectorConfigurationDetail(connector), a hook returning a loading
    | load-error | ready phase union; issues its own GET /v1/connectors/{connector};
    in the ready phase exposes a react-hook-form form for the (always-disabled) connector
    field, a configuration field-state pair matching use-connector-configuration-form.ts
    own shape, a derived isDirty, isSubmitting, and onSubmit that PUTs the full configuration,
    re-baselines to what was just submitted, and invalidates both the connector-configurations
    list query and its own connector-configuration query on success.
criteria:
- criterion: The hook issues its own GET for the connector configuration identified
    by connector, independent of any list screen having already fetched it.
  met: true
  how: a dedicated useQuery keyed ["connector-configuration", connector] calls apiFetch
    GET /v1/connectors/{connector} directly; nothing in this file reads use-connector-configurations.ts
    own list cache or an already-loaded row.
- criterion: The hook exposes a loading | load-error | ready phase union, mirroring
    use-edit-draft-version-form.ts's shape.
  met: true
  how: ConnectorConfigurationDetailState is a three-member discriminated union with
    the same phase names; the ordering (isError first, then isLoading, then ready)
    mirrors that file own guard sequence.
- criterion: In the ready phase, isDirty is true only when at least one form field
    or the configuration JSON text differs from the values most recently loaded or
    saved.
  met: true
  how: isDirty is form.formState.isDirty OR the minified configuration text differing
    from the minified baseline -- react-hook-form's own dirty tracking covers the
    connector field, and the configuration comparison reads both sides through the
    same minifying function the save path already uses.
- criterion: Returning every field, including configuration, to its most recently
    loaded or saved value flips isDirty back to false.
  met: true
  how: react-hook-form's own formState.isDirty clears once the connector field value
    matches its last reset baseline again; the configuration comparison clears once
    its minified text matches the baseline minified text again.
- criterion: A successful save re-baselines the originally loaded values, including
    configuration, to what was just saved, so isDirty is false immediately after a
    save with no further edits.
  met: true
  how: the mutation onSuccess calls form.reset({connector}) and setConfigurationBaseline(configurationValue)
    -- the values just submitted, so isDirty reads false right after a save with no
    further edits.
- criterion: A successful save invalidates or updates both the "connector-configurations"
    list query and this hook's own single-record query so neither screen is left reading
    stale data.
  met: true
  how: onSuccess calls queryClient.invalidateQueries for both ["connector-configurations"]
    and ["connector-configuration", connector].
- criterion: The hook reports a load-error phase, with a typed retry action, when
    the GET fails or the identified connector configuration does not exist.
  met: true
  how: 'query.isError (true for any non-2xx response, including a not-found refusal,
    since apiFetch throws an ApiError uniformly) returns {phase: "load-error", retryLoad}
    before the loading/ready checks are reached.'
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: the hook reads and writes exactly the two declared attributes (connector, configuration)
    by name, through the shared ConnectorConfiguration type; the save path always
    sends the full configuration text on PUT, honoring replacing it whole on every
    edit rather than merging into what stood before.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: the hook's own GET and PUT are the read-connector-configuration and register-connector
    operations this contract publishes, addressed by connector identity exactly as
    the contract states.
inferences:
- inferred: isDirty's configuration comparison reads both the current text and the
    baseline through getJsonTextareaMinifiedValue rather than comparing the two raw
    strings.
  from: json-textarea-field.tsx's own pretty-print-on-load effect (already delivered)
    updates the displayed text a tick after this hook's own load effect has already
    set the baseline to the server's raw text, which a raw-string comparison would
    read as dirty immediately after every load; minifying both sides reuses the same
    canonicalization use-connector-configuration-form.ts already performs to decide
    what a save persists.
- inferred: on a successful save, the baseline is re-seeded from the values just submitted
    rather than from the PUT response body.
  from: register-connector.controller.ts's own response type still answers configuration
    as an object rather than the JSON-string wire shape only GET was fixed to; re-baselining
    from the PUT response would tie this hook to a wire shape the sibling backend
    plan has not corrected for this endpoint.
- inferred: connector is tracked as a react-hook-form field (always disabled at the
    call site, never a create mode) rather than a plain read-only value.
  from: use-connector-configuration-form.ts's own field shapes, which this task's
    own instructions name to mirror, so the later route task can hand this hook's
    form straight to the existing connector-configuration-form-fields.tsx markup unchanged.
- inferred: the single-record query is keyed ["connector-configuration", connector],
    singular and distinct from the list's ["connector-configurations"].
  from: the sibling case-version (singular, keyed by identity) versus case-versions
    (plural, list) naming already established by use-edit-draft-version-form.ts and
    its list counterpart.
deferred:
- what: wiring the save mutation's onError to surface the well-formedness refusal
    to the operator.
  why: this task's own Notes assign showing that refusal to the connector-configuration-detail-route
    task, which owns the screen the operator sees it on; this task's criteria cover
    only the loading phases and the successful-save re-baseline/invalidation.
- what: the routed screen that consumes this hook.
  why: the connector-configuration-detail-route task is the separate, later task this
    hook was explicitly split from; this task own scope is the data layer alone.
---

## What it is

A new hook, exposing one connector configuration by identity through a loading/load-error/ready phase union, with isDirty computed against a re-seeded baseline and re-baselined on every successful save.
No existing file was touched -- the popup dialog, its hook, and the list hooks stay exactly as they were.

## Notes

None.
