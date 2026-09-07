---
contract_version: siegard-reconcile/3
title: connector-configuration-detail-merge-regression review
summary: task/ready-phase-state-lag/capability-and-connector-configuration-ready-lag, under initiative
  connector-configuration-detail-merge-regression, fixed the ready-phase render lag in useCapabilityDetail,
  useConnectorConfigurationDetail and useConnectorConfigurationDetailView.
target: frontend
files:
- path: src/hooks/use-capability-detail.spec.ts
  change: Confirms the pre-existing regression spec passes again, and adds tests pinning output_schema
    and the remaining form fields to the render log's first ready entry.
- path: src/hooks/use-capability-detail.ts
  change: Replaces the useEffect gated on [query.data] with a render-time "adjust state when a prop changes"
    comparison, syncing inputSchemaValue/inputSchemaValid/inputSchemaBaseline/outputSchemaValue/outputSchemaValid/outputSchemaBaseline
    and form.reset synchronously in the render where phase first reads ready.
- path: src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
  change: 'New file: two tests relocated from use-connector-configuration-detail.spec.ts (to keep it under
    the standard''s 300-line cap) pinning configuration.value and the connector name to the render log''s
    first ready entry.'
- path: src/hooks/use-connector-configuration-detail-view.spec.ts
  change: Adds a test pinning the discard baseline to the render log's first ready entry.
- path: src/hooks/use-connector-configuration-detail-view.ts
  change: Converts the configurationBaseline derivation (registeredConfigurationText and the discard act)
    from a useEffect to an unconditional per-render check with the same guard, eliminating a second render-lag
    layered on top of the base hook's own fix.
- path: src/hooks/use-connector-configuration-detail.ts
  change: Extends the render-time sync block already used for configurationValid to also call form.reset({connector})
    and set configurationValue and configurationBaseline synchronously in the render where phase first
    reads ready.
nodes:
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the useQuery queryFn and the useMutation mutationFn\
    \ — apiFetch<Capability>(\n  `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,\n\
    ),"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail-view.ts: held at the delegation to the wrapped hook,
    line 21 — this file issues no registry call of its own — const detail = useConnectorConfigurationDetail(connector);

    src/hooks/use-connector-configuration-detail.ts: held at the query (read-connector-configuration)
    and mutation (register-connector) definitions — queryFn: () => apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),

    ...

    apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(values.connector)}`, { method:
    "PUT", ... })

    '
  encoded_at:
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/integration/capability
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the form-reset block synced from query.data, and the\
    \ PUT request body — form.reset({\n  name: query.data.name,\n  version: query.data.version,\n  nature:\
    \ query.data.nature,\n  timeout: query.data.timeout,\n  connector: query.data.connector,\n  concept:\
    \ query.data.concept,\n});"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/hooks/use-connector-configuration-detail-view.ts: held at the onDiscard body, lines 65-67\
    \ — detail.form.reset({ connector });\n      detail.configuration.onChange(configurationBaseline.value,\
    \ configurationBaseline.isValid);\nsrc/hooks/use-connector-configuration-detail.ts: held at the sync\
    \ of query.data into form/configuration state, and the PUT body — form.reset({ connector: query.data.connector\
    \ });\nsetConfigurationValue(query.data.configuration);\n...\nbody: JSON.stringify({ configuration:\
    \ getJsonTextareaMinifiedValue(configurationValue) }),\n"
  encoded_at:
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the guard inside submit, using validity computed from\
    \ getJsonTextareaMinifiedValue — if (!inputSchemaValid || !outputSchemaValid) {\n  return;\n}"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the phase branches over query.isError and query.isLoading\
    \ — if (query.isLoading || isLoadingConcepts || !query.data) {\n  return { phase: \"loading\", onCancel\
    \ };\n}"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the onCancel function, offered from every\
    \ phase — const onCancel = (): void => {\n  if (router.history.canGoBack()) {\n    router.history.back();\n\
    \    return;\n  }\n  void navigate({ to: \"/connectors\" });\n};\n"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: "src/hooks/use-connector-configuration-detail.ts, the isValidConfigurationObject function, lines\
    \ 16-23: function isValidConfigurationObject(text: string): boolean {\n  const minified = getJsonTextareaMinifiedValue(text);\n\
    \  if (minified === null) {\n    return false;\n  }\n  const parsed: unknown = JSON.parse(minified);\n\
    \  return typeof parsed === \"object\" && parsed !== null && !Array.isArray(parsed);\n}\n — The definition\
    \ of a well-formed connector configuration — a JSON object that is neither an array nor null — now\
    \ lives twice, once in the registry the node describes and again in this hook's own gate; a reader\
    \ who needs to know what \"well-formed\" means for a connector configuration has two definitions to\
    \ reconcile, and if the registry's own criterion is ever revised only one of the two copies would\
    \ change, so this client gate could silently start refusing submissions the registry would now accept."
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: false
  how: "no named file holds this fact now: src/hooks/use-connector-configuration-detail-view.ts read `nowhere`\
    \ — return {\n    ...detail,\n    onDiscard: () => {...},\n    justSaved,\n    registeredConfigurationText:\
    \ configurationBaseline.value,\n  };"
  observed_at:
  - src/hooks/use-connector-configuration-detail-view.ts
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the useMutation onSuccess callback (lines 114-121): onSuccess:\
    \ (_data, values) => {\n  form.reset(values);\n  setInputSchemaBaseline(inputSchemaValue);\n  setOutputSchemaBaseline(outputSchemaValue);\n\
    \n  void queryClient.invalidateQueries({ queryKey: [\"capabilities\"] });\n  void queryClient.invalidateQueries({\
    \ queryKey: [\"capability\", name, version] });\n}, — After a save succeeds, the fields are reset\
    \ from the submitted form values — never from _data, the PUT response, and not from any fresh read\
    \ — while the invalidated [\"capability\", name, version] query has only been marked stale, not yet\
    \ refetched. query.isLoading stays false because stale data is already held, so the \"ready\" phase\
    \ does not lapse into \"loading\"; the operator keeps looking at exactly what they submitted, under\
    \ the same identity, for as long as the background refetch takes. If the registry normalizes, trims\
    \ or otherwise adjusts any attribute on write, the surface shows a value nobody ever read back, and\
    \ the next reader who wants to know what a \"ready\" capability screen shows will look at this hook\
    \ and find the read conflated with the write it is supposed to stay apart from."
  observed_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: false
  how: "src/hooks/use-connector-configuration-detail.ts, the query.isError branch of the phase computation,\
    \ lines 118-126: if (query.isError) {\n  return {\n    phase: \"load-error\",\n    retryLoad: () =>\n\
    \      void query.refetch();\n    },\n    onCancel,\n  };\n}\n — An operator opening this surface\
    \ for a connector name nothing is registered under is shown the identical \"load-error\" state, with\
    \ a retryLoad action, as any transient failure; the retry can never succeed while nothing is registered\
    \ under that name, so the operator is handed an act that promises a recovery that will never come,\
    \ and cannot tell a name that is merely unreachable right now from one nothing has ever been registered\
    \ under."
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the onCancel function, returned from every phase —\
    \ const onCancel = (): void => {\n  if (router.history.canGoBack()) {\n    router.history.back();\n\
    \    return;\n  }\n  void navigate({ to: \"/capabilities\" });\n};\nsrc/hooks/use-connector-configuration-detail.ts:\
    \ held at onCancel, returned unconditionally in the loading, load-error and ready phases — return\
    \ { phase: \"loading\", onCancel };\n...\nreturn { phase: \"load-error\", retryLoad: ..., onCancel\
    \ };\n...\nreturn { phase: \"ready\", ..., onCancel };\n"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the mutation's onError toast and the isSubmitSuccessful\
    \ field — onError: (error) => {\n  toast.error(saveFailureMessage(error));\n},\nsrc/hooks/use-connector-configuration-detail.ts:\
    \ held at the mutation's onError (toast) and the isSubmitSuccessful flag exposed on the ready phase\
    \ — onError: (error) => {\n  toast.error(saveFailureMessage(error));\n},\n...\nisSubmitSuccessful:\
    \ mutation.isSuccess,\n"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the mutation's onSuccess, which performs\
    \ no navigation and leaves the operator on the surface keyed by connector — onSuccess: () => {\n \
    \ form.reset({ connector });\n  setConfigurationBaseline(configurationValue);\n  void queryClient.invalidateQueries({\
    \ queryKey: [\"connector-configurations\"] });\n  void queryClient.invalidateQueries({ queryKey: [\"\
    connector-configuration\", connector] });\n},\n"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the same onCancel function, which issues no register-capability\
    \ call regardless of isDirty — const onCancel = (): void => {\n  if (router.history.canGoBack()) {\n\
    \    router.history.back();\n    return;\n  }\n  void navigate({ to: \"/capabilities\" });\n};"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  conforms: true
  how: 'src/hooks/use-capability-detail.ts: held at the else-branch of onCancel, landing on the capabilities
    listing when there is no history to return to — void navigate({ to: "/capabilities" });

    src/hooks/use-connector-configuration-detail.ts: held at the fallback branch of onCancel — void navigate({
    to: "/connectors" });

    '
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
unbound:
- src/hooks/use-capability-detail.spec.ts
- src/hooks/use-connector-configuration-detail-ready-render-timing.spec.ts
- src/hooks/use-connector-configuration-detail-view.spec.ts
notes: 'Judged by 6 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-detail-merge-regression.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them,
  rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read, rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 14 opened across 5 of 6 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-detail-merge-regression.returns/`, which are the evidence behind every entry above.
