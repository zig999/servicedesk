---
target: frontend
title: Fix connector configuration screen presenting an empty configuration when the read's answer is already held
  at mount
summary: Corrects use-connector-configuration-detail.ts so its own-read sync mechanism runs on the very first render
  whenever a cached answer is already present, not only on a later render, fixing the empty-configuration defect
  while leaving the after-mount-arrival path untouched.
task: sha256:cfe2ff3388c19473fec555be4af761b612116652dbe5f68fbf474d84454877a7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-read-presentation-read-answer-is-presented-whenever-held-build
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Replaces the sync marker's initial value, previously seeded from query.data itself (so a cached answer
    already equal to it at mount never triggered the sync block), with a module-level sentinel symbol (UNSYNCED_CONFIGURATION_DATA)
    that can never equal an actual query.data value. The comparison `query.data !== syncedConfigurationData` therefore
    enters its body on the very first render whenever an answer is already held, populating form, configurationValue,
    configurationValid and configurationBaseline from that answer immediately; the outstanding-read case (query.data
    undefined at first render) and the arrives-after-mount case are unchanged, since the sentinel differs from undefined
    exactly as the prior seeded-undefined marker did once the first pass reduces it to undefined.
criteria:
- criterion: Where the read's answer is already held by the client before the screen's first render, the screen
    presents the connector name and the configuration exactly as the read answered them.
  met: true
  how: 'With the sentinel forcing entry into the sync block on the first render, `form.reset({ connector: query.data.connector
    })` and `setConfigurationValue(query.data.configuration)` run from the cached answer immediately, so the connector
    name and configuration are exactly what the read answered from the first render, not left at the `useState("")`
    / `useState({connector})` defaults.'
- criterion: Where the read's answer arrives only after the screen's first render, the screen presents the connector
    name and the configuration exactly as the read answered them.
  met: true
  how: On a render where query.data is still undefined, the sentinel comparison is true, the marker is set to undefined,
    but the inner `if (query.data)` guard is false so no field is populated; once the answer arrives on a later
    render, the marker (now undefined) differs from the newly defined query.data and the same reset runs. This is
    the same sequence the file already ran before this change, unmodified by it.
- criterion: Where the read's answer is already held before the first render and it carries a well-formed JSON object,
    the screen states no malformed-configuration condition.
  met: true
  how: '`setConfigurationValid(isValidConfigurationObject(query.data.configuration))` now runs against the real
    held answer at the same moment configurationValue is set, so for a well-formed object it evaluates true and
    connector-configuration-detail-ready-view.tsx''s `{!state.configuration.isValid && ...}` warning (untouched
    by this delivery) does not render.'
- criterion: Where the read's answer is already held before the first render and the operator has not changed any
    field away from what the read answered, the screen offers no discard act and no register act.
  met: true
  how: configurationValue and configurationBaseline are now set to the identical real answer at the same sync pass,
    and form.reset is called with the answer's connector, so `isDirty` (computed from `form.formState.isDirty` and
    a minified-value comparison of configurationValue against configurationBaseline, both unchanged by this delivery)
    evaluates false; connector-configuration-detail-ready-view.tsx's existing `disabled={!state.isDirty || state.isSubmitting}`
    on Discard and the form's own submit gating on isDirty therefore withhold both acts, without any change to that
    wiring.
- criterion: Where the read's answer is already held before the first render and the operator has changed the configuration
    away from what the read answered, the discard act, once the operator states in a further explicit act that it
    is to be performed, returns the configuration to exactly what the read answered.
  met: true
  how: configurationBaseline is now correctly seeded from the held answer at the first render; use-connector-configuration-detail-view.ts's
    onDiscard (untouched) resets the configuration field to configurationBaseline.value, which for a cached-load
    screen now holds the real answer rather than an empty string, so the confirmed discard (behind the existing
    further-explicit-act dialog in connector-configuration-detail-ready-view.tsx) restores exactly what the read
    answered.
- criterion: Where the read's answer is already held before the first render, the test surface derives its subject
    attributes from the placeholders of the configuration the read answered.
  met: true
  how: use-connector-configuration-detail-view.ts's own configurationBaseline state is copied from `detail.configuration.value`
    whenever the screen is not dirty, and registeredConfigurationText (handed to ConnectorTestPanel, which derives
    placeholders from it) is that same baseline; since detail.configuration.value now correctly carries the held
    answer's configuration from the first render, the text handed to the Test panel is the read's configuration
    rather than an empty string, none of that downstream wiring being touched by this delivery.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The fix touches only how an already-held answer is copied into the screen's own presentation state; it adds
    no attribute, changes no shape of the value object, and issues no new call against the registry.
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The returned-reading presentation (connector and configuration exactly as answered) now triggers whenever
    an answer is in hand, whether at mount or later, closing the gap where a cached answer was silently left unpresented;
    the outstanding-window presentation (loading phase, no value shown) and the failed-window presentation (load-error
    phase) are untouched, this delivery reaching only the moment the answer is copied into the screen's own fields
    once it is in hand.
- node: rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The corrected sentinel makes the hook copy query.data into its presentation state at the very first render
    whenever query.data is already truthy there, which is exactly the situation this rule describes, a screen first
    presented already holding an earlier read's answer, regardless of whether a further read of the same configuration
    is still outstanding underneath.
- node: rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: form.reset, setConfigurationValue and setConfigurationBaseline now run against the real answer on the same
    render in which the returned reading is entered, whether that answer was in hand before the screen was first
    presented or arrived afterward, so the operator's own editing and submitting fields carry the answer from that
    first moment rather than from a later render.
- node: rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: isValidConfigurationObject is now evaluated against the field's real content at the same moment that content
    is set, so the well-formedness judgment always reaches the content actually held rather than a stale empty default;
    the judgment function itself and its criterion are unchanged by this delivery.
- node: rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: Because configurationValue and configurationBaseline are now set to the same real answer in the same pass,
    isDirty correctly reads false when nothing has been edited, so the screen's existing discard and submit gating
    (in connector-configuration-detail-ready-view.tsx and use-connector-configuration-form.ts, neither touched here)
    withholds both acts on a cached-load screen exactly as it already did on an after-mount-arrival one.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: configurationBaseline now correctly holds the content of the read's answer from the first render, so the
    existing discard act (use-connector-configuration-detail-view.ts's onDiscard, unchanged) returns the configuration
    field to that answer; this delivery does not touch the discard's own further-explicit-act gating, its scope
    over the connector-name field, or its behavior once a further read has answered, all left exactly as they stood.
- node: rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: registeredConfigurationText, which the Test panel derives its Subject-attribute placeholders from, is copied
    from the screen's own configurationBaseline whenever the screen holds no edit; since that baseline is now correctly
    seeded from the read's answer on a cached-load screen, the collection reaches the presented answer's placeholders
    rather than an empty string. The statement owed for a divergence between the presented answer and the configuration
    read at the moment of the test is unreached by this delivery, as the task's own Notes record.
inferences:
- inferred: The mechanism for telling "not yet synced" apart from "synced with no answer yet" needed a value distinct
    from every possible query.data (including undefined), so a module-level Symbol constant was used as that sentinel
    rather than, e.g., a boolean ref or a second piece of state.
  from: The existing file's own established pattern of seeding a marker from query.data and comparing it every render
    to decide whether to copy a new answer into presentation state; the fix keeps that same shape and changes only
    what the marker starts as.
preserved:
- The case where the read's answer arrives only after the screen's first render, with fields at their loading defaults
  while query.data is undefined and populated exactly once query.data becomes defined, continues to work exactly
  as before this change.
- The discard act's further-explicit-act confirmation, its scope (restoring the configuration field without moving
  the connector-name field), and the submit and mutation flow are all left untouched.
- The malformed-configuration statement's own judgment function (isValidConfigurationObject) and its criterion are
  left untouched; only the moment it is evaluated against real content changed.
deferred:
- what: The failed-window presentation (explicit could-not-be-read statement, no connector or configuration value,
    an operator-initiated reissue action).
  why: The task's own Notes record this as a REMAINDER reaching no criterion here, belonging to the task covering
    the readings in which no answer stands.
- what: The same discard-and-restore behavior on the capability registration surface (domain/integration/capability).
  why: The task's own Notes record this as a REMAINDER; the discard policy is shared across both registries but
    this task is stated only over the connector configuration screen.
- what: The statement owed when the configuration read at the moment of a test names a different set of Subject
    attributes than the set collected against the presented answer.
  why: The task's own Notes record this as a REMAINDER belonging to the task covering the test's own issuance and
    what it states back to the operator, not the presentation of the answer at first render.
- what: The client-side sixty-second retention of a read answer that makes the already-held condition possible at
    all.
  why: The task's own Notes record this as a REMAINDER belonging to a separate task implementing that retention
    directly.
---

## What it is

One line changed in the hook behind the connector configuration detail screen: the marker that decides whether the read's answer has been copied into the screen's own state starts as a sentinel no answer can equal, instead of as the answer itself.
With that, a screen first rendered with the answer already in the query client copies it on that first render, and a screen whose answer arrives later behaves exactly as before.

## Notes

The sentinel is a module-level Symbol, an inference recorded above: the file's own pattern was kept and only the marker's starting value changed.
The task's two ADVISORY notes name a fact the specification does not state, whether such a screen issues a further read of its own; this delivery neither decided it nor needed to, because the hook's query configuration was not touched and whatever the query client does after mount is what it did before.
Four remainders the task names are deferred above and were not reached.
