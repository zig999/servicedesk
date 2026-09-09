---
target: frontend
title: Fix the ready-phase render lag in the capability and connector configuration detail hooks
summary: use-capability-detail.ts, use-connector-configuration-detail.ts and use-connector-configuration-detail-view.ts
  now populate every field their ready phase exposes synchronously in the same render where phase first
  reads "ready", instead of one render later inside a useEffect.
task: sha256:b9028afb47ebc4635f62a4fedf21d4629e29a311db7dbab5ff7bbdf134b4b11c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/ready-phase-state-lag-capability-and-connector-configuration-ready-lag-build
files:
- path: src/hooks/use-capability-detail.ts
  effect: Replaces the useEffect gated on [query.data] with the same render-time "adjust state when a
    prop changes" comparison the file's own connector-configuration sibling already used for validity
    — a syncedCapabilityData useState holding the last-seen query.data reference, compared each render,
    and on change calling form.reset({name, version, nature, timeout, connector, concept}) and setting
    inputSchemaValue/inputSchemaValid/inputSchemaBaseline/outputSchemaValue/outputSchemaValid/outputSchemaBaseline
    synchronously, all before this same render commits. Removes the now-unused useEffect import.
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Extends the render-time sync block already used for configurationValid to also call form.reset({connector})
    and set configurationValue and configurationBaseline, folding the former separate useEffect into that
    same synchronous block (reordered so form exists before the block runs). Removes the now-unused useEffect
    import.
- path: src/hooks/use-connector-configuration-detail-view.ts
  effect: Converts the configurationBaseline derivation (the state registeredConfigurationText and the
    discard act read from) from a useEffect keyed on [isReady, currentIsDirty, currentConfigurationValue,
    currentConfigurationValid] to an unconditional per-render check with the identical guard (isReady
    && currentIsDirty === false), writing only when the computed value differs from what is already stored
    — eliminating the one-render lag between the base hook's own configuration.value reaching the loaded
    text and this view's own baseline catching up. The justSaved effect is untouched.
criteria:
- criterion: The first render in which useCapabilityDetail reports phase "ready" carries the loaded capability's
    input_schema text in inputSchema.value.
  met: true
  how: inputSchemaValue is now set inside the render-time sync block in use-capability-detail.ts, which
    runs during the same render pass as the phase computation, before that render commits — so the very
    first render where phase reads "ready" already has inputSchemaValue equal to query.data.input_schema.
- criterion: The first render in which useCapabilityDetail reports phase "ready" carries the loaded capability's
    output_schema text in outputSchema.value.
  met: true
  how: Same render-time sync block sets outputSchemaValue from query.data.output_schema in that same pass.
- criterion: The first render in which useConnectorConfigurationDetail reports phase "ready" carries the
    loaded connector's configuration text in configuration.value.
  met: true
  how: configurationValue is now set inside the render-time sync block in use-connector-configuration-detail.ts
    (the same block already used for configurationValid), so the first "ready" render already carries
    query.data.configuration.
- criterion: Clicking Add attribute immediately after the connector configuration detail screen finishes
    loading (before any edit) reads the placeholders in the just-loaded configuration text, not an empty
    or stale registered baseline.
  met: true
  how: Two changes compose to satisfy this — the base hook's configuration.value is now correct at the
    first ready render (criterion 3's fix), and use-connector-configuration-detail-view.ts's own registeredConfigurationText
    (what Add attribute derives its placeholder names from, via ConnectorTestPanel's configurationText
    prop) is now derived by the same render-time comparison rather than a useEffect that previously only
    caught up one render after the base hook's own state did. Both hand the just-loaded text to Add attribute
    in the same committed render the ready view first mounts with.
nodes:
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: The render-time sync block populates inputSchema/outputSchema text and baseline and calls form.reset
    with name, version, nature, timeout, connector and concept, all synchronously in the render where
    phase first reads "ready" — so every attribute the rule names as required from the first moment of
    this presentation (not only the two schemas the task's own criteria reach) is stated from read-capability-by-identity's
    own answer, never left absent, empty or at a pre-load value for a further render.
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The same render-time technique now sets configuration.value and configurationBaseline, and calls
    form.reset({connector}), in the render where phase turns "ready" — so the read-and-shown presentation
    this rule's third window governs carries the exact configuration text read-connector-configuration
    answered, from that presentation's first moment, never the empty string an effect had not yet populated.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  encoded_at:
  - src/hooks/use-connector-configuration-detail-view.ts
  how: registeredConfigurationText — the text Add attribute reads its ${subject:<attribute-name>} placeholder
    names from — is derived by the same render-time comparison instead of a useEffect, so it reflects
    the currently-registered configuration from the very first ready render; the unchanged guard (isReady
    && currentIsDirty === false) keeps it never reflecting unsaved edit text, exactly as before.
inferences:
- inferred: Extended the render-time "adjust state when a prop changes" pattern already shipping in use-connector-configuration-detail.ts
    (for configurationValid alone) to every other value the ready state exposes for both hooks — the schema/configuration
    text and baseline state, and the form.reset() call itself — rather than adding a second, narrower
    fix beside the effect-based one.
  from: The task's "What it is" section, which names this exact pattern as what commit 1c643a65 already
    applied to configurationValid while deferring configuration.value and leaving inputSchema/outputSchema
    untouched; and the rule's own explicit language ("carries all of them from the moment that presentation
    begins... at no point does an attribute stand absent, stand empty").
- inferred: Moved form.reset() itself (not only the plain useState value/baseline pairs) into the synchronous
    sync block, so nature, timeout, connector and concept for the capability hook are also correct at
    the first ready render, even though no stated criterion tests those fields directly.
  from: The task's own UNDERDETERMINED note over rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them,
    which names exactly this gap ("leaves nature, timeout, connector, concept or name/version at the empty
    or pre-load value for one further render") as a way a narrower fix would still pass criteria 1 and
    2 while failing the rule and the objective's "every field the ready state exposes."
- inferred: The connector-configuration hook's own "connector" form field and the capability hook's own
    "name"/"version" fields carry no lag regardless of reset timing, since useForm's defaultValues already
    seed them from the route identity (connector, name, version) itself, which is always the same value
    an identity-keyed read answers back — so no further change was needed for those three fields specifically.
  from: Reading useConnectorConfigurationDetail's and useCapabilityDetail's own useForm({ defaultValues
    }) calls, which pass the hook's own identity parameters rather than anything read asynchronously.
- inferred: Converting use-connector-configuration-detail-view.ts's configurationBaseline effect to a
    render-time check was necessary for criterion 4, since the base hook's own fix alone leaves this view-layer
    effect as a second, still-lagging hop between "the base hook's configuration.value is correct" and
    "the view's own registeredConfigurationText catches up."
  from: Tracing registeredConfigurationText's data flow — it is fed by this view hook's own configurationBaseline,
    set only inside its own effect, never directly from the base hook's already-fixed state.
deferred:
- what: use-capability-detail-view.ts's own onDiscard baseline (inputSchemaBaselineRef/outputSchemaBaselineRef)
    still synchronizes inside a useEffect, so a Discard taken immediately after the capability detail
    screen's own load resolves (before that effect has run) could still reset fields to their pre-load
    values rather than the loaded schemas.
  why: No criterion of this task reaches the capability screen's discard act, and the epic's own binder
    run explicitly marks rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
    uncovered by this task — this sits outside what this correction was cut to fix.
- what: use-connector-configuration-detail-view.ts's own onDiscard reads the same configurationBaseline
    this task's fix to registeredConfigurationText already made render-time-correct, so a Discard immediately
    after this screen's load now also returns to the just-loaded configuration text rather than an empty
    one — but this was not implemented as an answer to a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface,
    which the epic also marks uncovered by this task; it is a side effect of the one state both the Add-attribute
    reconciliation and the discard act share, not a criterion this record claims to satisfy.
  why: Recorded so a later reading does not mistake this incidental improvement for coverage of a node
    this task's own binder run declared uncovered.
---

## What it is

Fixes the render lag `1c643a65` ("hook-computes-validity-before-ready") applied only to
`configurationValid` and explicitly left deferred for `configuration.value`, and left untouched
for `useCapabilityDetail`'s `inputSchema`/`outputSchema` — the same shape of defect, now closed the
same way for every field. Each hook's schema/configuration text state now syncs at render time,
inside the same "adjust state while rendering" block already used for validity, rather than one
render later inside a `useEffect`. The view-layer hook feeding `Add attribute` its placeholder
source had its own, second lag on top of the base hook's, and is fixed the same way.

## Notes

None.
