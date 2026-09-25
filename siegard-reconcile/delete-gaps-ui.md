---
contract_version: siegard-reconcile/5
title: Delete-gaps-ui review
summary: The delete-gaps-ui initiative's 11 tasks (concept, capability and connector-configuration removal
  — the control gated by a further explicit act, the outcome disclosure, the post-removal landing, and
  the two per-entity error-recognition tasks) added a delete UI for all three entities where only backend
  DELETE routes existed before.
target: frontend
files:
- path: src/hooks/use-capability-detail-removal-outcome.spec.ts
  change: New hook-level tests over useCapabilityDetail's delete mutation, written by capability-removal-outcome-disclosure.
- path: src/hooks/use-capability-detail.ts
  change: Added a removeFailureMessage helper and wired deleteMutation's onSuccess/onError to toast.success/toast.error,
    by capability-removal-outcome-disclosure; capability-removal-landing and capability-removal-control
    also touch this file's deleteMutation and its confirmation dialog wiring.
- path: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  change: New hook-level tests over useConnectorConfigurationDetail's removeMutation, written by connector-configuration-removal-outcome-disclosure.
- path: src/hooks/use-connector-configuration-detail.ts
  change: 'Added a removalFailureMessage helper and wired removeMutation''s onSuccess/onError to toast.success/toast.error
    and navigate({ to: "/connectors" }), by connector-configuration-removal-outcome-disclosure and connector-configuration-removal-landing.'
- path: src/hooks/use-glossary-concepts.spec.ts
  change: Extended with tests over useRemoveGlossaryConcept's outcome disclosure, by concept-removal-outcome-disclosure.
- path: src/hooks/use-glossary-concepts.ts
  change: Added useRemoveGlossaryConcept() (DELETE mutation, toast.success/toast.error via removalFailureMessage,
    cache invalidation), by concept-removal-outcome-disclosure and concept-removal-landing.
- path: src/routes/capability-detail-ready-view.tsx
  change: Added a "Remove capability" destructive button and confirmation dialog, by capability-removal-control.
- path: src/routes/capability-detail-screen-removal-landing.spec.ts
  change: New tests proving capability-removal-landing's criteria.
- path: src/routes/capability-detail-screen-removal.spec.ts
  change: New tests proving capability-removal-control's criteria.
- path: src/routes/concept-removal-confirmation-dialog.tsx
  change: New Cancel/destructive-confirm dialog component, by concept-row-removal-control.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: Added a "Remove connector configuration" button and confirmation dialog, by connector-configuration-removal-control.
- path: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  change: New tests proving connector-configuration-removal-landing's criteria.
- path: src/routes/connector-configuration-detail-screen-remove.spec.ts
  change: New tests proving connector-configuration-removal-control's criteria.
- path: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  change: New tests proving concept-removal-landing's criteria.
- path: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  change: New tests proving concept-row-removal-control's criteria.
- path: src/routes/glossary-concepts-panel.tsx
  change: Added a per-row "Remove" button and the confirmation dialog wiring, by concept-row-removal-control.
- path: src/services/error-ui-state.spec.ts
  change: Extended with tests for the "concept-in-use" and "capability-cited-by-evidence" error kinds,
    by concept-in-use-refusal-recognition and capability-cited-by-evidence-refusal-recognition.
- path: src/services/error-ui-state.ts
  change: Added "concept-in-use" and "capability-cited-by-evidence" to UiErrorStateKind and to UI_STATE_BY_ERROR_CODE,
    by concept-in-use-refusal-recognition and capability-cited-by-evidence-refusal-recognition.
nodes:
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: false
  how: "no named file holds this fact now: src/hooks/use-capability-detail.ts read `nowhere` — return\
    \ {\n      phase: \"load-error\",\n      retryLoad: () => {\n        void query.refetch();\n     \
    \   conceptOptions.refetch();\n      },\n      onCancel,\n    };; src/hooks/use-connector-configuration-detail.ts\
    \ read `nowhere` — function removalFailureMessage(error: unknown): string {\n  if (error instanceof\
    \ ApiError) {\n    const state = uiStateForApiError(error);\n    return REMOVAL_FAILURE_MESSAGE_BY_KIND[state.kind]\
    \ ?? GENERIC_REMOVAL_FAILURE_MESSAGE;\n  }\n  return GENERIC_REMOVAL_FAILURE_MESSAGE;\n}; src/hooks/use-glossary-concepts.ts\
    \ read `nowhere` — return GENERIC_REMOVAL_FAILURE_MESSAGE;"
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-glossary-concepts.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: false
  how: "no named file holds this fact now: src/hooks/use-capability-detail.ts read `nowhere` — return\
    \ {\n      phase: \"load-error\",\n      retryLoad: () => {\n        void query.refetch();\n     \
    \   conceptOptions.refetch();\n      },\n      onCancel,\n    };; src/hooks/use-connector-configuration-detail.ts\
    \ read `nowhere` — function removalFailureMessage(error: unknown): string {\n  if (error instanceof\
    \ ApiError) {\n    const state = uiStateForApiError(error);\n    return REMOVAL_FAILURE_MESSAGE_BY_KIND[state.kind]\
    \ ?? GENERIC_REMOVAL_FAILURE_MESSAGE;\n  }\n  return GENERIC_REMOVAL_FAILURE_MESSAGE;\n}; src/hooks/use-glossary-concepts.ts\
    \ read `nowhere` — if (error instanceof ApiError && uiStateForApiError(error).kind === \"concept-in-use\"\
    ) {\n  return `Nothing was removed; something else in the glossary still names the concept \"${name}\"\
    .`;\n}\nreturn GENERIC_REMOVAL_FAILURE_MESSAGE;"
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-glossary-concepts.ts
- node: constraints/a-successful-capability-removal-answers-with-no-content
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at deleteMutation's mutationFn, which treats the DELETE\
    \ response as carrying nothing — mutationFn: () =>\n      apiFetch<void>(\n        `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,\n\
    \        { method: \"DELETE\" },\n      ),"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: constraints/a-successful-concept-removal-answers-with-no-content
  conforms: true
  how: "src/hooks/use-glossary-concepts.ts: held at the mutationFn of useRemoveGlossaryConcept, lines\
    \ 62-65 — mutationFn: (name: string) =>\n  apiFetch<void>(`/v1/glossary/concepts/${encodeURIComponent(name)}`,\
    \ {\n    method: \"DELETE\",\n  }),"
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `removeMutation`'s `mutationFn` —\
    \ mutationFn: () =>\n    apiFetch<void>(`/v1/connectors/${encodeURIComponent(connector)}`, {\n   \
    \   method: \"DELETE\",\n    }),"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the query.isError branch's specific-condition check\
    \ — if (query.error instanceof ApiError && query.error.code === \"CapabilityIdentityNotFoundError\"\
    ) {\n      return { phase: \"not-registered\", onCancel };\n    }"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'src/hooks/use-glossary-concepts.ts: held at the queryFn of useGlossaryConcepts, line 32 — queryFn:
    () => apiFetch<GlossaryConceptsPage>("/v1/glossary/concepts"),'
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the three apiFetch calls implementing read-capability-by-identity\
    \ (GET), register-capability (PUT) and remove-capability (DELETE) — queryFn: () =>\n      apiFetch<Capability>(\n\
    \        `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,\n      ),"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `query` and `mutation`/`removeMutation`\
    \ definitions — queryFn: () =>\n      apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),\n\
    src/routes/connector-configuration-detail-ready-view.tsx: held at the \"Remove connector configuration\"\
    \ dialog's confirm action and the \"Connectors\" link, lines 96-98 and 120-124 — <Button variant=\"\
    secondary\" asChild>\n  <Link to=\"/connectors\">Connectors</Link>\n</Button>"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: domain/glossary/concept
  conforms: true
  how: "src/hooks/use-glossary-concepts.ts: held at the GlossaryConcept type, lines 11-16 — export type\
    \ GlossaryConcept = {\n  readonly name: string;\n  readonly accepts: readonly string[];\n  readonly\
    \ ttl: number;\n  readonly description: string;\n};\nsrc/routes/glossary-concepts-panel.tsx: held\
    \ at toConceptRow (lines 38-66) and CONCEPTS_COLUMNS (lines 17-23), which render the value-object's\
    \ name, description, accepts and ttl attributes as table cells. — id: concept.name,\nname: concept.name,\n\
    description: toDescriptionCell(concept.description),\naccepts: concept.accepts.join(\", \"),\nttl:\
    \ formatTtl(concept.ttl),\n"
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  - src/routes/glossary-concepts-panel.tsx
- node: domain/integration/capability
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the form.reset block populating every declared attribute\
    \ from the read's own answer — form.reset({\n        name: query.data.name,\n        version: query.data.version,\n\
    \        nature: query.data.nature,\n        timeout: query.data.timeout,\n        connector: query.data.connector,\n\
    \        concept: query.data.concept,\n        payload_notes: query.data.payload_notes,\n      });"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the form's `defaultValues` and the `configuration`\
    \ field state — const form = useForm<ConnectorConfigurationFormValues>({\n    resolver: zodResolver(connectorConfigurationFormSchema),\n\
    \    defaultValues: { connector },\n  });\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the `!state.configuration.isValid` guard, lines 38-42 — {!state.configuration.isValid &&\
    \ (\n  <p role=\"alert\" className=\"text-sm text-destructive\">\n    {INVALID_CONFIGURATION_WARNING}\n\
    \  </p>\n)}"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for ConceptDescriptionRequiredError, line
    58 — ConceptDescriptionRequiredError: { kind: "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
  conforms: true
  how: "src/routes/glossary-concepts-panel.tsx: held at toDescriptionCell, lines 29-36 — if (description\
    \ === \"\") {\n  return { color: \"bg-muted-foreground\", label: \"Awaiting description\" };\n}\n"
  encoded_at:
  - src/routes/glossary-concepts-panel.tsx
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: "src/hooks/use-glossary-concepts.ts, the concept-in-use branch of removalFailureMessage, lines\
    \ 52-57: if (error instanceof ApiError && uiStateForApiError(error).kind === \"concept-in-use\") {\n\
    \  return `Nothing was removed; something else in the glossary still names the concept \"${name}\"\
    .`;\n} — An operator told the concept is \"still named\" by something \"in the glossary\" will look\
    \ inside glossary management — at other concepts or vocabulary terms — to find and clear the reference.\
    \ The rule that actually produces this refusal never fires for anything inside the glossary: it fires\
    \ because a registered capability answers the concept, a collected evidence item or its citation names\
    \ it, or a hypothesis-revision's own collects lists it — a capability, an investigation record, or\
    \ a knowledge artefact, none of them part of the glossary. The message sends the operator to the wrong\
    \ bounded context to resolve a refusal they cannot act on there."
  observed_at:
  - src/hooks/use-glossary-concepts.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: 'src/hooks/use-capability-detail.ts: held at the form''s resolver wiring, whose declared constraints
    live in the imported schema — resolver: zodResolver(capabilityFormSchema),'
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the submit guard checking both schema-validity flags\
    \ before mutating — const submit = form.handleSubmit((values) => {\n    if (!inputSchemaValid || !outputSchemaValid)\
    \ {\n      return;\n    }\n    mutation.mutate(values);\n  });\nsrc/routes/capability-detail-ready-view.tsx:\
    \ held at the two conditional warning paragraphs, lines 37-46 — {!state.inputSchema.isValid && (\n\
    \  <p role=\"alert\" className=\"text-sm text-destructive\">\n    {INVALID_INPUT_SCHEMA_WARNING}\n\
    \  </p>\n)}\n{!state.outputSchema.isValid && (\n  <p role=\"alert\" className=\"text-sm text-destructive\"\
    >\n    {INVALID_OUTPUT_SCHEMA_WARNING}\n  </p>\n)}\nsrc/services/error-ui-state.ts: held at the map\
    \ entry for CapabilitySchemaNotWellFormedError, line 53 — CapabilitySchemaNotWellFormedError: { kind:\
    \ \"capability-schema-not-well-formed\" },"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-ready-view.tsx
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for CapabilityNotReadOnlyError, line 52
    — CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the phase-branching over query.isError / isConceptsError\
    \ / query.isLoading before \"ready\" is reached — if (query.isError) {\n    if (query.error instanceof\
    \ ApiError && query.error.code === \"CapabilityIdentityNotFoundError\") {\n      return { phase: \"\
    not-registered\", onCancel };\n    }\n    return {\n      phase: \"load-error\",\n      retryLoad:\
    \ () => {\n        void query.refetch();\n        conceptOptions.refetch();\n      },\n      onCancel,\n\
    \    };\n  }\n  if (isConceptsError) {\n    return {\n      phase: \"load-error\",\n      retryLoad:\
    \ () => {\n        void query.refetch();\n        conceptOptions.refetch();\n      },\n      onCancel,\n\
    \    };\n  }\n  if (query.isLoading || isLoadingConcepts || !query.data) {\n    return { phase: \"\
    loading\", onCancel };\n  }"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `query.isLoading || !query.data`\
    \ guard, combined with the render-phase state sync — if (query.isLoading || !query.data) {\n    return\
    \ { phase: \"loading\", onCancel };\n  }"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `onCancel` — const onCancel = (): void\
    \ => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n      return;\n    }\n\
    \    void navigate({ to: \"/connectors\" });\n  };\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the \"Cancel\" button, lines 93-95 — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n\
    \  Cancel\n</Button>"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `isValidConfigurationObject` — function\
    \ isValidConfigurationObject(text: string): boolean {\n  const minified = getJsonTextareaMinifiedValue(text);\n\
    \  if (minified === null) {\n    return false;\n  }\n  const parsed: unknown = JSON.parse(minified);\n\
    \  return typeof parsed === \"object\" && parsed !== null && !Array.isArray(parsed);\n}\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the invalid-configuration warning banner, lines 38-42 — const INVALID_CONFIGURATION_WARNING\
    \ =\n  \"This connector configuration's stored value must be a JSON object. Correct it before Save\
    \ can succeed.\";\nsrc/services/error-ui-state.ts: held at the map entry for ConnectorConfigurationNotWellFormedError,\
    \ line 56 — the node's other named condition, IncompleteConnectorConfigurationError, has no entry\
    \ of its own and falls to the generic fallback along with every code the map does not name — ConnectorConfigurationNotWellFormedError:\
    \ { kind: \"connector-configuration-not-well-formed\" },"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the `testPanel` prop, lines\
    \ 50-55, fed `state.registeredConfigurationText` — testPanel={\n  <ConnectorTestPanel\n    connector={connector}\n\
    \    configurationText={state.registeredConfigurationText}\n  />\n}"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-first-presented-holding-an-answer-issues-a-further-read
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `useQuery` call, relying on its default\
    \ refetch-on-mount behaviour — const query = useQuery({\n    queryKey: [\"connector-configuration\"\
    , connector],\n    queryFn: () =>\n      apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),\n\
    \  });"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `configuration.isValid`, kept by `handleConfigurationChange`\
    \ and the state sync — const handleConfigurationChange = useCallback((value: string): void => {\n\
    \    setConfigurationValue(value);\n    setConfigurationValid(isValidConfigurationObject(value));\n\
    \  }, []);"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the \"Connectors\" link, lines\
    \ 96-98 — <Button variant=\"secondary\" asChild>\n  <Link to=\"/connectors\">Connectors</Link>\n</Button>"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the guard inside `submit` — const submit\
    \ = form.handleSubmit((values) => {\n    if (!configurationValid) {\n      return;\n    }\n    mutation.mutate(values);\n\
    \  });"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the \"ready\"-phase returned state, lines 221-244: isDirty,\n\
    \    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n    onSubmit,\n\
    \    onCancel,\n    isDeleting: deleteMutation.isPending,\n    onDelete: () => {\n      deleteMutation.mutate();\n\
    \    },\n  }; — An operator editing this capability who wants to put an edit down and keep working\
    \ has only `onCancel`, whose whole effect is to leave the surface (back, or to the capabilities listing);\
    \ there is no act here that returns the form and the two schema fields to the content of the surface's\
    \ own last read while keeping the operator on that surface, so recovering a schema an operator has\
    \ typed over costs a full leave-and-return through the listing rather than nothing.\nsrc/hooks/use-connector-configuration-detail.ts,\
    \ the object the `ready` phase returns, lines 188-207: return {\n    phase: \"ready\",\n    form,\n\
    \    configuration: {\n      value: configurationValue,\n      isValid: configurationValid,\n\n  \
    \    onChange: handleConfigurationChange,\n    },\n    isDirty,\n    isSubmitting: mutation.isPending,\n\
    \    isSubmitSuccessful: mutation.isSuccess,\n    onSubmit,\n    onCancel,\n    onRemove: () => {\n\
    \      removeMutation.mutate();\n    },\n    isRemoving: removeMutation.isPending,\n  }; — An operator\
    \ who has edited the connector name or the Configuration field away from what the read answered has\
    \ no act, anywhere in this hook, that returns the fields to that read content without leaving the\
    \ screen: `onCancel` navigates away (`router.history.back()` or to `/connectors`), and no field of\
    \ the returned state resets `configurationValue`/`configurationBaseline` or `form` to `query.data`.\
    \ Recovering from an unwanted edit to opaque configuration text an operator cannot retype from memory\
    \ costs a round trip through another screen instead of the in-place act the rule requires."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the sync block that sets every field, including both\
    \ schema fields, only from query.data — setInputSchemaValue(query.data.input_schema);\n      setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema)\
    \ !== null);\n      setInputSchemaBaseline(query.data.input_schema);\n      setOutputSchemaValue(query.data.output_schema);"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `loading`, `load-error` and `ready`\
    \ branches — if (query.isError) {\n    return { phase: \"load-error\", retryLoad: () => { void query.refetch();\
    \ }, onCancel };\n  }\n  if (query.isLoading || !query.data) {\n    return { phase: \"loading\", onCancel\
    \ };\n  }"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the exposed `isDirty` flag alongside\
    \ `onSubmit`, gating left to the caller — const isDirty =\n    form.formState.isDirty ||\n    getJsonTextareaMinifiedValue(configurationValue)\
    \ !== getJsonTextareaMinifiedValue(configurationBaseline);"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the render-phase state-sync block — if\
    \ (query.data !== syncedConfigurationData) {\n    setSyncedConfigurationData(query.data);\n    if\
    \ (query.data) {\n      form.reset({ connector: query.data.connector });\n      setConfigurationValue(query.data.configuration);\n\
    \      setConfigurationValid(isValidConfigurationObject(query.data.configuration));\n      setConfigurationBaseline(query.data.configuration);\n\
    \    }\n  }"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
  conforms: false
  how: "src/hooks/use-connector-configuration-detail.ts, the `ConnectorConfigurationDetailState` type's\
    \ `ready` phase (lines 47-59) and the object the hook returns for it (lines 188-207): | {\n    readonly\
    \ phase: \"ready\";\n    readonly form: UseFormReturn<ConnectorConfigurationFormValues>;\n    readonly\
    \ configuration: ConfigurationFieldState;\n    readonly isDirty: boolean;\n    readonly isSubmitting:\
    \ boolean;\n\n    readonly isSubmitSuccessful: boolean;\n    readonly onSubmit: (event?: BaseSyntheticEvent)\
    \ => void;\n    readonly onCancel: () => void;\n    readonly onRemove: () => void;\n    readonly isRemoving:\
    \ boolean;\n  }; — Nothing in this hook collects a test value per Subject attribute named by the presented\
    \ answer's own `${subject:<attribute-name>}` placeholders, and nothing detects or states a divergence\
    \ between the configuration a test would exercise and the one being presented; an operator running\
    \ the connector's test after the registered configuration has changed underneath them gets no signal\
    \ that the values they supplied were collected against a configuration they are no longer looking\
    \ at."
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the REMOVE_FAILURE_MESSAGE_BY_KIND mapping naming\
    \ the distinct refusal — const REMOVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>>\
    \ = {\n  \"capability-cited-by-evidence\":\n    \"Nothing was removed: collected evidence names this\
    \ capability.\",\n};"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the `mutation`'s `onSuccess`/`onError`\
    \ callbacks, which only run once the call resolves — onSuccess: () => {\n\n    form.reset({ connector\
    \ });\n    setConfigurationBaseline(configurationValue);"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  conforms: true
  how: "src/routes/capability-detail-ready-view.tsx: held at the unconditionally rendered \"Capabilities\"\
    \ control, lines 120-122 — <Button variant=\"secondary\" asChild>\n  <Link to=\"/capabilities\">Capabilities</Link>\n\
    </Button>"
  encoded_at:
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the onCancel function, returned on every phase of\
    \ CapabilityDetailState — const onCancel = (): void => {\n    if (router.history.canGoBack()) {\n\
    \      router.history.back();\n      return;\n    }\n    void navigate({ to: \"/capabilities\" });\n\
    \  };\nsrc/hooks/use-connector-configuration-detail.ts: held at `onCancel`, returned from every one\
    \ of the three phases — if (query.isError) {\n    return { phase: \"load-error\", retryLoad: () =>\
    \ { void query.refetch(); }, onCancel };\n  }\n  if (query.isLoading || !query.data) {\n    return\
    \ { phase: \"loading\", onCancel };\n  }\nsrc/routes/capability-detail-ready-view.tsx: held at the\
    \ unconditionally rendered \"Cancel\" control, lines 117-119 — <Button type=\"button\" variant=\"\
    secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the \"Cancel\" button, lines 93-95, rendered unconditionally — <Button type=\"button\" variant=\"\
    secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-submitted-capability-edit-stands-in-the-fields-until-that-surfaces-own-read-answers
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at the mutation's onSuccess, which only invalidates queries\
    \ and never touches form or schema state directly — onSuccess: () => {\n      void queryClient.invalidateQueries({\
    \ queryKey: [\"capabilities\"] });\n      void queryClient.invalidateQueries({ queryKey: [\"capability\"\
    , name, version] });\n    },"
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/hooks/use-capability-detail.ts, the update mutation's onSuccess/onError handlers, lines 134-140:\
    \ onSuccess: () => {\n      void queryClient.invalidateQueries({ queryKey: [\"capabilities\"] });\n\
    \      void queryClient.invalidateQueries({ queryKey: [\"capability\", name, version] });\n    },\n\
    \    onError: (error) => {\n      toast.error(saveFailureMessage(error));\n    }, — An operator who\
    \ submits an edit to this capability learns nothing from this file about whether the registration\
    \ was made or what now stands registered — only a bare `isSubmitSuccessful` boolean crosses the hook\
    \ boundary, carrying no identity and no content — while this same file's removal path, a few lines\
    \ below, states that outcome in full (\"`${name} ${version} is no longer registered.`\"). A reader\
    \ who wants to know what a successful capability edit tells the operator finds it stated for delete\
    \ and not for save.\nsrc/routes/connector-configuration-detail-ready-view.tsx, the `state.justSaved`\
    \ success message, lines 87-92: {state.justSaved && (\n\n  <p role=\"status\" className=\"text-sm\
    \ text-foreground\">\n    Saved.\n  </p>\n)} — An operator who submits an edit is told only \"Saved.\"\
    , never which connector configuration now stands registered. The node requires the surface to state\
    \ what was registered — the connector name the submission carried — alongside the fact that it registered;\
    \ this text carries no such content even though the connector name (the `connector` prop) is already\
    \ in scope of this component. An operator who has moved between several connectors' detail screens,\
    \ or returned to this one via the listing, has nothing in this confirmation to tie the \"Saved.\"\
    \ to the connector it was saved for."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  conforms: false
  how: "src/routes/capability-detail-ready-view.tsx, the trailingActions block, between the Remove capability\
    \ dialog (lines 87-111) and the Cancel/Capabilities controls — the only outcome-disclosure element\
    \ present is for the save operation, at lines 112-116: {state.justSaved && (\n  <p role=\"status\"\
    \ className=\"text-sm text-foreground\">\n    Saved.\n  </p>\n)} — An operator who confirms \"Remove\
    \ capability\" and has the removal refused — for instance because a collected evidence item still\
    \ names the capability — sees the confirmation dialog close and then nothing: this surface's only\
    \ outcome text is \"Saved.\", gated on state.justSaved, which reports the save operation alone. The\
    \ operator is left unable to tell whether the further explicit act they just took did anything, on\
    \ the one surface required to tell them."
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-glossary-concepts.ts
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the absence of any navigation call in\
    \ `mutation`'s `onSuccess` — onSuccess: () => {\n\n    form.reset({ connector });\n    setConfigurationBaseline(configurationValue);\n\
    \n    void queryClient.invalidateQueries({ queryKey: [\"connector-configurations\"] });\n    void\
    \ queryClient.invalidateQueries({ queryKey: [\"connector-configuration\", connector] });\n  },"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
  conforms: true
  how: 'src/hooks/use-capability-detail.ts: held at deleteMutation''s onSuccess navigate call — void navigate({
    to: "/capabilities" });

    src/hooks/use-connector-configuration-detail.ts: held at `navigate({ to: "/connectors" })` in `removeMutation`''s
    `onSuccess` — void navigate({ to: "/connectors" });

    src/hooks/use-glossary-concepts.ts: held at the onSuccess invalidateQueries call, line 68 — void queryClient.invalidateQueries({
    queryKey: ["glossary", "concepts-with-ttl"] });'
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-glossary-concepts.ts
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-capability-detail.ts read `nowhere` — export
    function useCapabilityDetail(name: string, version: string): CapabilityDetailState {; src/routes/capability-detail-ready-view.tsx
    read `nowhere` — the file''s only discard control addresses an existing capability''s own unsaved
    edit, not an unsubmitted registration entry: DISCARD_DIALOG_DESCRIPTION reads "Every unsaved change
    to this capability will be lost. This cannot be undone.", and its confirm button `<Button type="button"
    variant="destructive" onClick={state.onDiscard}>` sits inside a `DialogClose`, closing the dialog
    rather than landing the operator on a different surface'
  observed_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  conforms: true
  how: "src/hooks/use-capability-detail.ts: held at onCancel's fallback branch, taken when there is no\
    \ surface to return to — if (router.history.canGoBack()) {\n      router.history.back();\n      return;\n\
    \    }\n    void navigate({ to: \"/capabilities\" });\nsrc/hooks/use-connector-configuration-detail.ts:\
    \ held at `onCancel`'s fallback branch — void navigate({ to: \"/connectors\" });"
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at `onCancel`, which issues no mutation\
    \ of any kind — const onCancel = (): void => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n\
    \      return;\n    }\n    void navigate({ to: \"/connectors\" });\n  };"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for ConceptAlreadyAnsweredError, line 45
    — the node''s other named condition, DuplicateConceptAnswerError, has no entry of its own — ConceptAlreadyAnsweredError:
    { kind: "concept-already-answered" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for CaseVersionNotValidError, line 64 —
    CaseVersionNotValidError: { kind: "case-not-valid" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for HypothesisRevisionNotDraftAtReleaseError,
    line 43 — HypothesisRevisionNotDraftAtReleaseError: { kind: "hypothesis-revision-not-draft-at-release"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the generic fallback, line 30 and line 69 — const GENERIC_ERROR_STATE:
    UiErrorState = { kind: "generic-error" };

    ...

    return state ?? GENERIC_ERROR_STATE;'
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for ConceptDescriptionRequiredError, line
    58, kept distinct from the generic fallback — ConceptDescriptionRequiredError: { kind: "concept-description-required"
    },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the map entry for HypothesisRevisionNotDraftAtReleaseError,
    line 43, kept distinct from the generic fallback — HypothesisRevisionNotDraftAtReleaseError: { kind:
    "hypothesis-revision-not-draft-at-release" },'
  encoded_at:
  - src/services/error-ui-state.ts
unstated:
- file: src/hooks/use-glossary-concepts.spec.ts
  where: lines 311-330, the describe block "useRemoveGlossaryConcept -- the ConceptInUseError statement
    names the concept, never the reported reference (UNDERDETERMINED...)" and its single test
  evidence: "const capabilityMessage = await captureRemovalFailureMessage(\n  refusalResponse(capabilityReference,\
    \ 409),\n);\nconst evidenceMessage = await captureRemovalFailureMessage(\n  refusalResponse(evidenceReference,\
    \ 409),\n);\n\nexpect(evidenceMessage).toBe(capabilityMessage);"
  cost: The test pins, as a passing requirement, that the operator's toast never varies with whether a
    capability or an evidence item is what still names the concept -- rules/glossary/a-registered-concept-is-never-removed
    states that the refusal reports "a reference identifying what names it" precisely "so the person told
    to keep the concept knows what to look at," yet no node decides whether that reference reaches the
    operator-facing surface distinctly or is folded away. The describe block's own title labels this UNDERDETERMINED
    and cites a delivery-record inference rather than a specification decision; the next reader who opens
    the specification to learn why the reference is discarded finds nothing, because the choice was made
    in the test and a proof record, never decided into the specification's own decision log.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  where: the describe/it block at lines 115-128, "a refused removal leaves the operator on the capability's
    own surface (an underdetermined note in this task)"
  evidence: "describe(\"CapabilityDetailScreen -- a refused removal leaves the operator on the capability's\
    \ own surface (an underdetermined note in this task)\", () => {\n  it(\"stays at the capability's\
    \ own detail route when the removal answers with a refusal instead of HTTP 204\", async () => {\n\
    \    ...\n    await waitFor(() => expect(removeTriggerButton().hasAttribute(\"disabled\")).toBe(false));\n\
    \    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);"
  cost: 'The test fixes, as a hard requirement, that a refused removal leaves the operator on the capability''s
    own detail route with the control usable again. rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
    states what the surface discloses on a refusal but not where the operator is left able to act next,
    and no other node in this set settles it; a reader who needs to know what a refused capability removal
    leaves the operator able to do will find only this assertion, and the test''s own title admits the
    specification does not settle it: "(an underdetermined note in this task)".'
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  where: the describe/it block at lines 94-113, "the landing waits for the removal's own answer, never
    taken merely because the removal was issued (an underdetermined note in this task)"
  evidence: "describe(\"CapabilityDetailScreen -- the landing waits for the removal's own answer, never\
    \ taken merely because the removal was issued (an underdetermined note in this task)\", () => {\n\
    \  it(\"still presents the capability's own surface while the DELETE request is outstanding, navigating\
    \ to /capabilities only once it resolves with HTTP 204\", async () => {\n    ...\n    await waitFor(()\
    \ => expect(removeTriggerButton().hasAttribute(\"disabled\")).toBe(true));\n    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);"
  cost: 'The test fixes, as a hard requirement of the screen, that the remove control disables and navigation
    is withheld for the whole time the DELETE request is outstanding. No node in this file''s set, and
    none found elsewhere in the specification, decides whether a removal in flight disables its own control
    or what the surface shows meanwhile; the next reader who needs to know that will find only this test
    enforcing it, never a specification node — and the test''s own title concedes the gap it is filling:
    "(an underdetermined note in this task)".'
- file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  where: the third describe block, lines 89-112 ("no surface addressed by the removed identity survives
    the removal (underdetermined, from the specification)")
  evidence: 'describe("GlossaryBrowserScreen — no surface addressed by the removed identity survives the
    removal (underdetermined, from the specification)", () => { it("shows the removed concept''s own name
    nowhere on the screen once its removal answers 204, not only absent from the listing''s own rows",
    ... expect(await screen.findByRole("row", { name: /fraud-flag/i })).toBeTruthy(); expect(screen.queryByText("billing-dispute")).toBeNull();
    });'
  cost: The test asserts, as behavior a caller can depend on, that once a concept's removal answers 204
    no trace of the removed concept's own name survives anywhere on the whole screen — a stronger, more
    general guarantee than the specification decided. The decision log records only that a successful
    removal's destination is the listing and never the removed identity's own surface (rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing);
    it says nothing about every other place the removed name might still appear (a lingering dialog, a
    status message, or any other element). A reader who wants to know what a concept removal is required
    to purge from the screen will look in the specification and find only the narrower, decided fact —
    and the test's own title concedes as much by calling the guarantee it encodes "underdetermined, from
    the specification."
unbound:
- src/hooks/use-capability-detail-removal-outcome.spec.ts
- src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
- src/hooks/use-glossary-concepts.spec.ts
- src/routes/capability-detail-screen-removal-landing.spec.ts
- src/routes/capability-detail-screen-removal.spec.ts
- src/routes/concept-removal-confirmation-dialog.tsx
- src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
- src/routes/connector-configuration-detail-screen-remove.spec.ts
- src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
- src/routes/glossary-concepts-panel-removal-control.spec.tsx
- src/services/error-ui-state.spec.ts
notes: "Judged by 18 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/delete-gaps-ui.returns/.\nStaged by a review over files a delivery wrote:\
  \ every pair a delivery or a hand stamped was judged, and a pair was omitted only where a reconciliation's\
  \ judgment had cleared it at these very bytes; the plan's node(s) constraints/a-domain-error-unmapped-by-status-is-refused-generically,\
  \ constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/a-successful-capability-removal-answers-with-no-content,\
  \ constraints/a-successful-concept-removal-answers-with-no-content, constraints/a-successful-connector-configuration-removal-answers-with-no-content,\
  \ constraints/the-capability-identity-read-refuses-an-unregistered-identity, domain/glossary/concept,\
  \ domain/integration/capability, domain/integration/connector-configuration, rules/glossary/a-registered-concept-is-never-removed,\
  \ rules/integration/a-registered-capability-cited-by-evidence-is-never-removed, rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act,\
  \ rules/integration/a-submitted-removal-states-its-outcome-to-the-operator, rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing,\
  \ rules/integration/removing-a-connector-configuration-is-unconditional were read on every file and\
  \ answered for, and bound from nowhere here — a binding this record writes is one the trace already\
  \ held.\nA finding in src/hooks/use-connector-configuration-detail.ts names rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under,\
  \ which no file of this set is bound to: the `query.isError` branch, lines 153-161: if (query.isError)\
  \ {\n    return {\n      phase: \"load-error\",\n      retryLoad: () => {\n        void query.refetch();\n\
  \      },\n      onCancel,\n    };\n  } — A connector name nothing is registered under and a read that\
  \ failed for any other reason both resolve to the same `load-error` phase, both carrying `retryLoad`;\
  \ an operator who reaches an unregistered connector name is offered a retry that can never succeed instead\
  \ of being told plainly that nothing is registered there. Because `query.isError` returns before the\
  \ `ready` phase is ever reached, this hook can never present the authoring form under an unregistered\
  \ connector name either, so the create side of `register-connector` is unreachable from this screen..\
  \ It blocks nothing here; it is owed a route of its own.\nCandidates: 10 opened across 5 of 18 delegation(s);\
  \ each return lists its own under `candidates_opened`.\nUnstated: 4 fact(s) the source states that no\
  \ node holds, over 3 file(s), listed under `unstated`. They block no binding here and no rebind closes\
  \ them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/delete-gaps-ui.returns/`, which are the evidence behind every entry above.
