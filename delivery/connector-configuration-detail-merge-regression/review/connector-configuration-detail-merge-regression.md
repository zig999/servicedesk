---
title: connector-configuration-detail-merge-regression review
summary: What four passes found over the ready-phase render-lag fix in useCapabilityDetail, useConnectorConfigurationDetail
  and useConnectorConfigurationDetailView, and their tests.
reviewed:
- src/hooks/use-capability-detail.ts
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-detail-view.ts
- src/hooks/use-capability-detail.spec.ts
- src/hooks/use-connector-configuration-detail-view.spec.ts
- src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
tasks:
- task/ready-phase-state-lag/capability-and-connector-configuration-ready-lag
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the review's own captured run (run/connector-configuration-detail-merge-regression) passed
    with no failures, so there was nothing to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: The first render in which useCapabilityDetail reports phase "ready" carries the loaded capability's
    input_schema text in inputSchema.value.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: resolves the ready phase from its own direct GET, not from a capabilities list query the caller's
      cache already held for this same (name, version)
  - file: src/hooks/use-capability-detail.spec.ts
    name: is false immediately after load, before any edit
  why: Nothing in the set inspects inputSchema.value at the first render reporting "ready" specifically
    — the one test asserting the loaded value reads result.current after waitFor(() => phase === "ready"),
    which is satisfied by whatever render the poll observes; since inputSchemaValue is a per-render snapshot,
    a first-ready-render carrying the stale/empty value followed one render later by the loaded text would
    still pass. The render-log technique used elsewhere in this same file for output_schema and the form
    fields was never applied to input_schema.
- criterion: The first render in which useCapabilityDetail reports phase "ready" carries the loaded capability's
    output_schema text in outputSchema.value.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: carries outputSchema.value equal to the loaded output_schema in the render log's first ready
      entry
  - file: src/hooks/use-capability-detail.spec.ts
    name: resolves the ready phase with output_schema from its own direct GET as well, not from a capabilities
      list query the caller's cache already held with a different output_schema for this same (name, version)
      (an underdetermined note in this task)
- criterion: The first render in which useConnectorConfigurationDetail reports phase "ready" carries the
    loaded connector's configuration text in configuration.value.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
    name: carries configuration.value equal to the loaded configuration in the render log's first ready
      entry
  - file: src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
    name: carries the newly loaded connector's own name in form.getValues('connector'), not the previous
      connector's, in the render log's first ready entry that already shows the new configuration text
- criterion: Clicking Add attribute immediately after the connector configuration detail screen finishes
    loading (before any edit) reads the placeholders in the just-loaded configuration text, not an empty
    or stale registered baseline.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
    name: keeps reconciling against the last registered text after Configuration is edited but not saved
  - file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
    name: reconciles against the newly saved text the next time Add attribute is clicked after a successful
      save
  - file: src/hooks/use-connector-configuration-detail-view.spec.ts
    name: equals the just-loaded configuration text immediately after this connector's own record loads
  why: 'The pre-edit click is asserted only as the opening precondition of two tests written for other
    criteria; no test in the set stands as the proof of the immediately-after-load click on its own, so
    it is the assertion that changes the day those tests change. The hazard the criterion names is also
    unexercised: in both tests the click happens after `await screen.findByLabelText("Configuration")`
    resolves, a later tick than the first ready render, so a registered baseline that was empty or stale
    at the render that finished loading and was corrected one render later would still pass. The hook-level
    test asserting registeredConfigurationText after load reads it through the same waitFor(phase ===
    "ready") poll rather than the render log''s first ready entry, and never exercises Add attribute itself.'
findings:
- pass: standard
  file: src/hooks/use-capability-detail.ts
  where: lines 76-95 (the syncedCapabilityData/inputSchemaValue/outputSchemaValue sync block) and lines
    114-117 (mutation.onSuccess)
  cites: STA-01
  evidence: "const [syncedCapabilityData, setSyncedCapabilityData] = useState(query.data);\n  if (query.data\
    \ !== syncedCapabilityData) {\n    setSyncedCapabilityData(query.data);\n    if (query.data) {\n \
    \     ...\n      setInputSchemaValue(query.data.input_schema);\n      ...\n      setOutputSchemaValue(query.data.output_schema);\n\
    \      ...\n    }\n  }\n  ...\n  onSuccess: (_data, values) => {\n      form.reset(values);\n    \
    \  setInputSchemaBaseline(inputSchemaValue);\n      setOutputSchemaBaseline(outputSchemaValue);"
  cost: input_schema and output_schema are read once out of query.data and then kept in inputSchemaValue/outputSchemaValue/inputSchemaBaseline/outputSchemaBaseline,
    a set of useState copies distinct from the react-query cache. The mutation's own onSuccess discards
    the server's response (_data is never read) and re-derives the new baseline from the locally-held
    edited strings instead of from what the server actually stored, so if the PUT response differs at
    all from what was submitted, the textarea and isDirty comparison silently disagree with what invalidateQueries
    will later pull back into the cache.
  correction: Render inputSchema/outputSchema.value straight from query.data (with local edit state reset
    by key/identity rather than by manual reference comparison), and derive the post-save baseline from
    the mutation's response payload rather than from the submitted values.
- pass: standard
  file: src/hooks/use-connector-configuration-detail.ts
  where: lines 77-86 (the syncedConfigurationData/configurationValue/configurationBaseline sync block)
    and lines 100-103 (mutation.onSuccess)
  cites: STA-01
  evidence: "const [syncedConfigurationData, setSyncedConfigurationData] = useState(query.data);\n  if\
    \ (query.data !== syncedConfigurationData) {\n    setSyncedConfigurationData(query.data);\n    if\
    \ (query.data) {\n      ...\n      setConfigurationValue(query.data.configuration);\n      ...\n \
    \     setConfigurationBaseline(query.data.configuration);\n    }\n  }\n  ...\n  onSuccess: () => {\n\
    \n      form.reset({ connector });\n      setConfigurationBaseline(configurationValue);"
  cost: configuration text is copied out of query.data into configurationValue/configurationBaseline,
    a UI-owned pair distinct from the cache. onSuccess ignores the mutation's own response entirely and
    sets the post-save baseline from the value that was submitted, so a server-side normalization of the
    JSON payload would leave this local baseline showing something the actual stored configuration (what
    a later refetch of the cache would return) does not match.
  correction: Read configuration.value from query.data directly and set the post-save baseline from the
    PUT response body instead of from the pre-submit local value.
- pass: standard
  file: src/hooks/use-connector-configuration-detail-view.ts
  where: lines 24-27 and 37-43 (the configurationBaseline state and its sync against detail.configuration)
  cites: STA-01
  evidence: "const [configurationBaseline, setConfigurationBaseline] = useState({\n    value: \"\",\n\
    \    isValid: true,\n  });\n  ...\n  if (isReady && currentIsDirty === false) {\n    const nextValue\
    \ = currentConfigurationValue ?? \"\";\n    const nextIsValid = currentConfigurationValid ?? true;\n\
    \    if (nextValue !== configurationBaseline.value || nextIsValid !== configurationBaseline.isValid)\
    \ {\n      setConfigurationBaseline({ value: nextValue, isValid: nextIsValid });\n    }\n  }"
  cost: detail.configuration.value is itself already a copy of the server cache (see use-connector-configuration-detail.ts);
    this hook copies it again into a third useState (configurationBaseline), exposed downstream as registeredConfigurationText.
    The resync is gated on currentIsDirty === false, so a render where dirty flips true right as a fresh
    load lands can leave registeredConfigurationText pointing at a configuration the cache has already
    moved past.
  correction: Expose the last loaded-or-saved text by reading it from the query cache / the underlying
    hook's own state rather than re-storing it a further layer up.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: isValidConfigurationObject, lines 16-23, gating configurationValid and the submit guard at lines
    136-138
  evidence: return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  cost: The registry's own definition of "well-formed" for a connector configuration (rules/integration/a-connector-configuration-holds-a-well-formed-object)
    — an object, with null and arrays excluded — is re-derived here as the frontend's own local criterion,
    and copied again in use-connector-configuration-form.ts, instead of being read from the registry's
    422 answer. A drift between this copy and the registry's own check would silently block a submission
    the registry would accept, or admit one it would refuse.
  correction: Read the well-formedness criterion from the registry's own 422 refusal rather than re-deriving
    it locally.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: the query.isError branch, lines 118-126
  evidence: "if (query.isError) {\n  return {\n    phase: \"load-error\",\n    retryLoad: () => {\n  \
    \    void query.refetch();\n    },\n    onCancel,\n  };\n}"
  cost: A read refused because nothing is registered under this connector name (rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read's
    fourth window) is reported identically to any other failed read, with the same retryLoad action offered;
    the sibling hook for capabilities already distinguishes this exact situation into its own not-registered
    phase with no retryLoad. An operator who opens a connector name nothing has ever been registered under
    is offered a retry that can never turn up anything different.
  correction: Recognise the registry's own not-found condition (query.error instanceof ApiError && query.error.code
    === "ConnectorConfigurationNotFoundError") and report it as its own phase, carrying no retryLoad,
    distinct from the generic load-error phase — the same pattern use-capability-detail.ts already uses.
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the useMutation onSuccess callback, lines 114-121
  evidence: "onSuccess: (_data, values) => {\n  form.reset(values);\n  setInputSchemaBaseline(inputSchemaValue);\n\
    \  setOutputSchemaBaseline(outputSchemaValue);\n\n  void queryClient.invalidateQueries({ queryKey:\
    \ [\"capabilities\"] });\n  void queryClient.invalidateQueries({ queryKey: [\"capability\", name,\
    \ version] });\n},"
  cost: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
    requires the read-and-shown presentation to state exactly what the identity-keyed read answered; after
    a successful save this handler resets from the submitted form values instead, while the invalidated
    query has only been marked stale, not yet refetched. If the registry normalizes or adjusts any attribute
    on write, the surface shows a value nobody ever read back.
  correction: Populate the ready-phase fields only from a read's own answer — the PUT response if it answers
    identically to read-capability-by-identity, or by waiting for the invalidated query to resolve — rather
    than from the submitted values.
reconciliation: siegard-reconcile/connector-configuration-detail-merge-regression.md
---

## What it is

Reviews the corrective delivery for task/ready-phase-state-lag/capability-and-connector-configuration-ready-lag
under initiative connector-configuration-detail-merge-regression: the ready-phase render-lag fix
in useCapabilityDetail, useConnectorConfigurationDetail and useConnectorConfigurationDetailView,
and the tests proving it.

## Notes

The failures pass did not run: the review's own captured run (run/connector-configuration-detail-merge-regression,
all 8 steps, including test) passed with no failures, so there was nothing to diagnose.

The conformance pass's staging found one node the delivery's own bind claimed —
rules/integration/a-connector-configuration-is-tested-through-a-registered-capability, bound to
src/hooks/use-connector-configuration-detail-view.ts — that no delegation, including the one that
read that exact file, found held anywhere in this file set. This is not a contradiction any
delegation reported; it is the trace's own prior claim finding no support once read fresh. It is
left unbound by this review's bind (`siegard-reconcile/connector-configuration-detail-merge-regression.md`),
and is not counted among the findings above because no delegation attributed it to a specific
statement in a file — see the reconciliation record's own entry for it.
