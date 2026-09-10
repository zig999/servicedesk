---
target: frontend
title: Review of the cached-load presentation correction on the connector configuration screen
summary: What four passes found over the hook, the test support and the spec the delivery of read-answer-is-presented-whenever-held
  wrote, read against the trace and the plan alike.
reviewed:
- src/hooks/use-connector-configuration-detail.ts
- src/routes/connector-configuration-detail-screen.test-support.ts
- src/routes/connector-configuration-detail-screen-cached-load.spec.ts
tasks:
- task/connector-configuration-read-presentation/read-answer-is-presented-whenever-held
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run run/connector-configuration-detail-cached-load-empty passed every one of the registry's
    eight steps, so there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
coverage:
- criterion: Where the read's answer is already held by the client before the screen's first render, the screen
    presents the connector name and the configuration exactly as the read answered them.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: presents the connector name and the configuration exactly as the held answer carries them, and states
      nothing to the effect the configuration is still being read, while a further read of the same configuration
      remains outstanding underneath -- an implementation that leaves the fields at their loading defaults, or that
      states the still-being-read condition alongside the held answer, would fail this
  why: 'The answer is seeded into the query cache before mount and the further read is held permanently pending,
    so both field assertions read the held answer and would fail against loading defaults. One confound worth recording
    rather than settling: the seeded answer''s connector equals the route parameter (`some-connector`), so the connector-name
    assertion would still pass were the name taken from the route rather than from the read''s answer; the configuration
    half has no such confound.'
- criterion: Where the read's answer arrives only after the screen's first render, the screen presents the connector
    name and the configuration exactly as the read answered them.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the connector's own identity and its configuration, both read from the GET this route's own hook
      issues
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: returns the configuration to what the surface's own further read most recently answered, once that read
      has landed with different content, rather than to the answer the screen was first presented holding -- an
      implementation that always discards back to the first-held answer, regardless of a later read, would fail
      this
  why: Nothing is seeded, so the fields are asserted against the answer only after it lands (`waitFor` on the configuration
    field, `findByRole` on the heading), and the second test additionally waits for a later-arriving answer with
    different content to be presented. The first test's closing `expect(fetchMock.mock.calls.some(...))` asserts
    that a request was issued rather than what is presented, and carries none of the criterion; the value assertions
    carry it.
- criterion: Where the read's answer is already held before the first render and it carries a well-formed JSON object,
    the screen states no malformed-configuration condition.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: shows the configuration exactly as held and no malformed-configuration warning, at the screen's first
      render
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: states the malformed-configuration warning for a held answer whose configuration is not well-formed JSON
      object text, distinguishably from the load-error reading -- an implementation staying silent about it, or
      stating it indistinguishably from an outstanding, failed, refused or returned reading, would fail this
  why: The absence assertion is on the exact warning text, and the second test asserts that same string present
    for a held answer that is not well-formed, so the negative cannot pass merely because the text was renamed out
    from under it.
- criterion: Where the read's answer is already held before the first render and the operator has not changed any
    field away from what the read answered, the screen offers no discard act and no register act.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: disables Save and Discard changes at the screen's first render, before the operator has touched any field
      -- an implementation whose dirtiness baseline is not seeded from the held answer would enable one or both
  why: Both acts are asserted to carry `disabled` at first render with no field touched, so a dirtiness baseline
    not seeded from the held answer fails the test. The test reads "offers no act" as "the control is present but
    disabled"; the criterion's wording does not distinguish an absent control from a disabled one, and the companion
    criterion-1 test in the same file asserts both controls present, so the pair fixes the reading as disabled-and-present.
- criterion: Where the read's answer is already held before the first render and the operator has changed the configuration
    away from what the read answered, the discard act, once the operator states in a further explicit act that it
    is to be performed, returns the configuration to exactly what the read answered.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: returns the configuration field to exactly what the held answer carried, once the operator edits it and
      confirms Discard
  why: 'The further explicit act is exercised, not merely assumed: `openDiscardDialog` awaits the dialog before
    the confirming click, so a discard performed without confirmation fails at that await. One confound: the held
    answer and the further read both carry `LOADED_CONFIGURATION`, so the test cannot distinguish a discard baseline
    taken from the held answer from one taken from the later read of identical content. Both are "what the read
    answered", so the criterion holds either way, and the sibling UNDERDETERMINED-note-4 test in the same file is
    where the two are separated.'
- criterion: Where the read's answer is already held before the first render, the test surface derives its subject
    attributes from the placeholders of the configuration the read answered.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
    name: names the added Attribute row after the placeholder embedded in the held answer's configuration
  why: 'Only the single-placeholder case is exercised: the held configuration carries one placeholder (`${subject:account-id}`),
    one Attribute row is added, and its value is asserted. The criterion is stated over "the placeholders" plural,
    and nothing in the set offers a held configuration carrying more than one, so whether the surface derives an
    attribute per placeholder, and in which correspondence, is unexercised; the assertion is structurally single-valued
    (`getByLabelText("Attribute")` throws on more than one row) and so could not carry the plural case as written.
    Also unexercised: a held configuration carrying no placeholder, where nothing states what the added row derives
    from.'
findings:
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: against rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
    — the `query.isError` branch, lines 122-130
  evidence: "if (query.isError) {\n  return {\n    phase: \"load-error\",\n    retryLoad: () => {\n      void query.refetch();\n\
    \    },\n    onCancel,\n  };\n}"
  cost: A read refused because nothing is registered under the connector name and any other read failure are shown
    as the identical "load-error" state, both carrying the same retryLoad action. An operator on a connector name
    nothing is registered under is told nothing about that, and is offered a retry that will be refused identically
    every time it is taken, unable to tell a name that will never resolve from a read that is merely down right
    now.
  correction: Distinguish the refusal reported for an unregistered connector name from any other read failure, and
    for that case return a state that carries no retry action and states explicitly that nothing is registered under
    the connector name.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: against rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface — the
    "ready"-phase return object, lines 157-171 (no discard/reset handler exists anywhere in the hook)
  evidence: "return {\n  phase: \"ready\",\n  form,\n  configuration: {\n    value: configurationValue,\n    isValid:\
    \ configurationValid,\n\n    onChange: handleConfigurationChange,\n  },\n  isDirty,\n  isSubmitting: mutation.isPending,\n\
    \  isSubmitSuccessful: mutation.isSuccess,\n  onSubmit,\n  onCancel,\n};"
  cost: 'An operator who has changed the connector name or configuration away from what the read answered has no
    act anywhere in this state that returns those fields to the read content while remaining on the screen: onCancel
    leaves the surface entirely and onSubmit registers. Recovering the read content costs the operator the leave-and-return
    navigation the specification''s own reasoning says this act exists to spare them, over a configuration an operator
    cannot retype from memory.'
  correction: Expose a discard action, gated by its own further explicit confirmation, that resets the form's connector
    field and configurationValue/configurationValid back to configurationBaseline without leaving the screen or
    issuing a register-connector call.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: against rules/integration/a-connector-configuration-read-answering-over-an-unsubmitted-edit-leaves-that-edit-standing
    — the render-time sync block, lines 82-90
  evidence: "if (query.data !== syncedConfigurationData) {\n  setSyncedConfigurationData(query.data);\n  if (query.data)\
    \ {\n    form.reset({ connector: query.data.connector });\n    setConfigurationValue(query.data.configuration);\n\
    \    setConfigurationValid(isValidConfigurationObject(query.data.configuration));\n    setConfigurationBaseline(query.data.configuration);\n\
    \  }\n}"
  cost: Whenever the query's data reference changes — a background refetch after invalidateQueries, a window refocus,
    a reconnect — every field is unconditionally overwritten with the newly arrived answer, with no check for an
    edit the operator has composed and not submitted. An operator mid-edit of a long opaque configuration can have
    that edit silently replaced by content they never asked to have written in, with no further act of theirs involved
    and no way to get the discarded edit back.
  correction: Gate the sync so an arriving answer changes no field while the operator holds an edit the read has
    not answered and no register-connector submission has been made from it, applying the new answer only where
    the operator explicitly asks for it.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: against rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
    — the `configuration` field of the "ready"-phase return object, lines 160-165
  evidence: "configuration: {\n  value: configurationValue,\n  isValid: configurationValid,\n\n  onChange: handleConfigurationChange,\n\
    },"
  cost: Nothing this hook returns distinguishes the configuration the presented read answer carries from the current,
    possibly operator-edited, field content — both are the same configurationValue string. A test panel built against
    this hook's return value has no way to collect Subject-attribute values against the presented answer rather
    than the field, and no way to detect that the two have diverged, exactly the confusion the rule requires be
    told apart and stated to the operator.
  correction: Expose the configuration the presented read answer carries (e.g. the last-synced query.data.configuration)
    separately from the editable field value, so a consumer can derive tested Subject attributes from the answer
    and detect divergence from the field.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: a fact no node holds — the `submit` callback, lines 139-144
  evidence: "const submit = form.handleSubmit((values) => {\n  if (!configurationValid) {\n    return;\n  }\n  mutation.mutate(values);\n\
    });"
  cost: The hook decides, on its own, that a submission whose configuration content it judges not well-formed is
    withheld from the registry entirely — no register-connector call is made and nothing is stated about why the
    submit act did nothing. No node in the specification states whether such a submission is withheld here or left
    to the registry's own refusal; a reader asking why a Save here is a no-op finds that decision only in this hook,
    never in the specification.
- pass: standard
  file: src/hooks/use-connector-configuration-detail.ts
  where: lines 79-90, the sync effect that seeds configurationValue and configurationBaseline from query.data, echoed
    by the onSuccess handler at lines 104-111
  cites: STA-01
  evidence: "if (query.data !== syncedConfigurationData) {\n    setSyncedConfigurationData(query.data);\n    if\
    \ (query.data) {\n      form.reset({ connector: query.data.connector });\n      setConfigurationValue(query.data.configuration);\n\
    \      setConfigurationValid(isValidConfigurationObject(query.data.configuration));\n      setConfigurationBaseline(query.data.configuration);\n\
    \    }\n  }"
  cost: configurationValue and configurationBaseline are React state copies of query.data.configuration, kept beside
    the react-query cache rather than read from it. The submit payload (`getJsonTextareaMinifiedValue(configurationValue)`)
    and the dirty check both read from this copy, and the mutation's onSuccess handler re-derives the baseline manually
    (`setConfigurationBaseline(configurationValue)`) instead of from the cache. If a background refetch or the invalidation
    triggered here (`invalidateQueries`) lands with content different from what the copy holds -- exactly the concurrent-edit
    scenario this hook's own test suite exercises -- the displayed value, the dirty flag and the eventual submit
    body can disagree with what the cache currently holds until this effect happens to re-run.
  correction: Read the configuration for display and for the dirty comparison directly from query.data on each render
    instead of mirroring it into configurationValue/configurationBaseline state that must be manually re-synced
    after every load and every successful mutation.
reconciliation: siegard-reconcile/connector-configuration-detail-cached-load-empty.md
---

## What it is

One review over the three files the delivery of read-answer-is-presented-whenever-held wrote, by four passes each in its own delegation: the coverage auditor over the six criteria, three specification-conformance judges one per file, the standard reviewer over the six reading rules in scope, and two certification audits over the nodes the proof offered tests for.
The failures pass did not run because the captured run passed every step of the frontend registry.

## Notes

Five conformance findings sit in the hook: four contradictions and one fact no node holds; two of the contradictions name nodes no file of this set is bound to, so they block no binding here and the reconciliation record says they are owed a route of their own.
The conformance judge read the hook alone and reported the discard act absent and the test panel's answer text undistinguished; both live in use-connector-configuration-detail-view.ts and connector-configuration-detail-ready-view.tsx, outside this file set, which is a fact for the reader and not a correction of the judge.
Both certifications the proof offered came back partial with a testable remainder, so both nodes stay decided by reading; the reconciliation record's notes carry the auditor's words.
The one standard finding cites STA-01 over the hook's mirroring of query data into local state, the same mechanism the correction under review lives in.
The coverage pass found five criteria covered and the sixth partial, only the single-placeholder case being exercised.
The standard pass looked past the URL built from the connector name as a fixed path template rather than a redirect or storage key; the conformance judges looked past the double-dispatch guard, the fixture URL paths and the page-size default as interface plumbing.
This framework reviews no performance, no accessibility beyond the a11y step the registry runs, no security beyond the rules the standard states, and no visual form.
