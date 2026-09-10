---
contract_version: siegard-reconcile/5
title: Connector configuration screen files after the cached-load correction and the deliveries before
  it
summary: 'The human states these seven files are correct as committed. One, use-connector-configuration-detail.ts,
  was rewritten by the delivery of connector-configuration-detail-cached-load-empty, which rebound only
  its own task''s eight nodes and left nine other bindings on the file stale. The other six changed under
  earlier deliveries and merges without a rebind: connector-configuration-openapi-helper, connector-capability-create-detail-route,
  connector-test-panel-* and connector-configuration-save-does-not-submit each rewrote parts of this screen''s
  hooks and routes while binding only their own nodes. Every file passed the frontend registry''s full
  suite in the run captured under delivery/connector-configuration-detail-cached-load-empty/run/.'
target: frontend
files:
- path: src/hooks/use-connector-configuration-detail.ts
  change: Seeds its sync marker with a sentinel no answer can equal instead of query.data, so a read answer
    already held by the query client at mount is copied into the screen's fields on the first render;
    the mutation, cancel, dirtiness and validity wiring the nine stale nodes bind to is otherwise as it
    stood.
- path: src/hooks/use-connector-configuration-form.ts
  change: Drives the create screen's registration form; since its last bind it gained the configuration-validity
    gate before dispatch, the double-dispatch guard, and the distinguishable not-well-formed save failure
    message.
- path: src/hooks/use-test-connector-panel.ts
  change: Drives the test panel; since its last bind it reads the registered configuration text handed
    down by the detail view rather than the operator's edited field, derives the subject attributes from
    that text's placeholders, and tracks dispatch state.
- path: src/routes/connector-configuration-create-screen.tsx
  change: Renders the create screen; since its last bind it composes the shared form fields component
    with the configuration helper and offers the return-to-origin and listing routes.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: Renders the detail screen's returned reading; since its last bind it hands the test panel the
    registered configuration text, gates Save and Discard on dirtiness, and states the well-formedness
    warning and the saved acknowledgement.
- path: src/routes/connector-configurations-screen.tsx
  change: Lists the registered connector configurations; since its last bind each row routes to the configuration's
    own detail screen instead of opening the retired form dialog.
- path: src/routes/connector-test-panel.tsx
  change: Renders the test panel; since its last bind it receives the registered configuration text as
    a prop, presents placeholder-derived attribute rows read-only, and reflects dispatch state on its
    controls.
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the query and mutation definitions, lines\
    \ 68-72 and 92-103 — queryFn: () =>\n    apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`),\n\
    ...\nmutationFn: (values: ConnectorConfigurationFormValues) =>\n    apiFetch<ConnectorConfiguration>(\n\
    \      `/v1/connectors/${encodeURIComponent(values.connector)}`,\n      { method: \"PUT\", headers:\
    \ { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ configuration: getJsonTextareaMinifiedValue(configurationValue)\
    \ }) },\n    ),\nsrc/hooks/use-connector-configuration-form.ts: held at the mutation's mutationFn,\
    \ which issues the register-connector call — apiFetch<ConnectorConfiguration>(\n        `/v1/connectors/${encodeURIComponent(values.connector)}`,\n\
    \        {\n          method: \"PUT\",\n          headers: { \"Content-Type\": \"application/json\"\
    \ },\n          body: JSON.stringify({\n            configuration: getJsonTextareaMinifiedValue(configurationValue),\n\
    \          }),\n        },\n      ),"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: "src/hooks/use-test-connector-panel.ts: held at the mutation definition and dispatch handler that\
    \ issue one test-connector call per click, assembling the subject fresh from form state rather than\
    \ reading any stored one — const mutation = useMutation({\n  mutationFn: (body: TestConnectorRequestBody)\
    \ =>\n    apiFetch<TestConnectorResult>(\"/v1/test-connector\", {\n      method: \"POST\",\n     \
    \ headers: { \"Content-Type\": \"application/json\" },\n      body: JSON.stringify(body),\n    }),\n\
    });"
  encoded_at:
  - src/hooks/use-test-connector-panel.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-connector-configuration-form.ts,
    src/hooks/use-test-connector-panel.ts, src/routes/connector-configurations-screen.tsx, and src/routes/connector-test-panel.tsx
    read `nowhere` — export type ConnectorTestPanelProps = { readonly connector: string; readonly configurationText:
    string; }; const state = useTestConnectorPanel(connector, configurationText); — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-configurations-screen.tsx
  - src/routes/connector-test-panel.tsx
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: "src/hooks/use-connector-configuration-form.ts: held at the client-side well-formedness gate before\
    \ mutate, and the refused-write message mapping — if (!configurationValid) {\n        return;\n  \
    \    }\n      mutation.mutate(values);"
  encoded_at:
  - src/hooks/use-connector-configuration-form.ts
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at onCancel, lines 55-61 — const onCancel\
    \ = (): void => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n      return;\n\
    \    }\n    void navigate({ to: \"/connectors\" });\n  };"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: "src/hooks/use-connector-configuration-form.ts, SAVE_FAILURE_MESSAGE_BY_KIND, lines 44-47: const\
    \ SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {\n  \"connector-configuration-not-well-formed\"\
    :\n    \"This configuration is not syntactically valid JSON.\",\n}; — The governing node states explicitly\
    \ that a null value and an array are both syntactically valid JSON and are refused for a different\
    \ reason — not being an object. An operator whose configuration was e.g. `[1,2,3]` or `null` parses\
    \ without any syntax error, so being told \"This configuration is not syntactically valid JSON\" misnames\
    \ the actual refusal: they will look for a JSON syntax mistake that is not there, instead of learning\
    \ the value must be an object."
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-test-connector-panel.ts, and src/routes/connector-test-panel.tsx\
    \ read `nowhere` — const state = useTestConnectorPanel(connector, configurationText); return (\n \
    \ <section className=\"flex flex-col gap-4 pt-4 border-t border-border\">\n    <h3 className=\"text-lg\
    \ font-semibold text-foreground\">Test</h3>\n    <ConnectorTestPanelFields state={state} />\n    <ConnectorTestPanelResult\
    \ testOutcome={state.testOutcome} />\n  </section>\n); — a binding asserts the file answers for the\
    \ node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped\
    \ here"
  observed_at:
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-test-panel.tsx
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at the trailingActions button linking\
    \ to the connector-configuration listing, rendered alongside the form fields — <Button variant=\"\
    secondary\" asChild>\n  <Link to=\"/connectors\">Connectors</Link>\n</Button>\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the trailing \"Connectors\" button, lines 91-93 — <Button variant=\"secondary\" asChild>\n\
    \  <Link to=\"/connectors\">Connectors</Link>\n</Button>"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: "the fact left part of its ground: still held in src/routes/connector-configuration-detail-ready-view.tsx,\
    \ and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,\
    \ handleSaved); ... <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n\
    </Button> — the hook is invoked with `null`, so this surface authors a configuration at an identity\
    \ nothing is currently registered under; the file carries no field-reset act here, which is what the\
    \ node's own exclusion (no such act on a surface authoring at an identity nothing is registered at)\
    \ calls for. — a binding asserts the file answers for the node, so the pair that stopped holding it\
    \ is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: false
  how: "src/hooks/use-connector-configuration-detail.ts, the phase branching that returns `load-error`,\
    \ lines 122-133 (the `query.isError` check runs ahead of, and without regard to, whether `query.data`\
    \ already holds an answer): if (query.isError) {\n  return {\n    phase: \"load-error\",\n    retryLoad:\
    \ () => {\n      void query.refetch();\n    },\n    onCancel,\n  };\n}\nif (query.isLoading || !query.data)\
    \ {\n  return { phase: \"loading\", onCancel };\n} — An operator already presented with a connector's\
    \ configuration — reached, for instance, after this same hook invalidates and refetches the query\
    \ on a successful save — is switched into the load-error phase and loses the presented connector,\
    \ configuration and any in-place edit the moment any further read of that same configuration fails,\
    \ even one that fails only in the background. The node bound to this file states that a screen already\
    \ holding an earlier answer \"stays in the returned window presenting that held answer\" through a\
    \ failed further read, and reserves the failed window for a screen that holds no earlier answer; this\
    \ branch does not distinguish the two and empties the screen either way."
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail.ts: held at isSubmitting/isSubmitSuccessful drawn
    straight from mutation state, lines 167-168 — isSubmitting: mutation.isPending,

    isSubmitSuccessful: mutation.isSuccess,'
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at onCancel returned from every phase —\
    \ loading, load-error and ready — if (query.isLoading || !query.data) {\n  return { phase: \"loading\"\
    , onCancel };\n}\n...\nreturn {\n  phase: \"ready\",\n  ...\n  onCancel,\n};\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the \"Cancel\" button, lines 88-90 — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n\
    \  Cancel\n</Button>"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/routes/connector-configuration-detail-ready-view.tsx, the `state.justSaved` success message,\
    \ lines 82-87: {state.justSaved && (\n\n              <p role=\"status\" className=\"text-sm text-foreground\"\
    >\n                Saved.\n              </p>\n            )} — the operator who just submitted this\
    \ registration is told only \"Saved.\", never which connector configuration now stands registered\
    \ — the next reader looking for where the specification requires the registered identity to be stated\
    \ will find this surface silent on it, and an operator who has the page open beside others of the\
    \ same shape has nothing in the statement itself to confirm which connector's configuration succeeded"
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at the mutation's onSuccess handler, lines\
    \ 104-111 (no navigation away from the surface) — onSuccess: () => {\n      form.reset({ connector\
    \ });\n      setConfigurationBaseline(configurationValue);\n      void queryClient.invalidateQueries({\
    \ queryKey: [\"connector-configurations\"] });\n      void queryClient.invalidateQueries({ queryKey:\
    \ [\"connector-configuration\", connector] });\n    },"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail.ts: held at onCancel''s fallback branch, line 60
    — void navigate({ to: "/connectors" });'
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  conforms: true
  how: "src/hooks/use-connector-configuration-detail.ts: held at onCancel, lines 55-61 (no call to mutation.mutate)\
    \ — const onCancel = (): void => {\n    if (router.history.canGoBack()) {\n      router.history.back();\n\
    \      return;\n    }\n    void navigate({ to: \"/connectors\" });\n  };"
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
unstated:
- file: src/hooks/use-connector-configuration-detail.ts
  where: the submit gate inside `submit`, lines 139-144
  evidence: "const submit = form.handleSubmit((values) => {\n    if (!configurationValid) {\n      return;\n\
    \    }\n    mutation.mutate(values);\n  });"
  cost: 'When the surface''s own local judgment marks the Configuration field content as not well-formed,
    pressing submit silently does nothing: no register-connector call is ever issued, and neither of the
    outcomes an operator is owed on submitting — registered, or refused with a named condition — is ever
    stated, because none was submitted. Nothing in the specification decided that this is what should
    happen to such an attempt; the one rule that governs the surface''s own well-formedness judgment expressly
    leaves this open ("Whether the surface withholds a submission of content its judgment finds short
    of the criterion... [is] no part of this"), so the silent no-op is a decision this file made on its
    own rather than one the specification recorded.'
- file: src/routes/connector-configurations-screen.tsx
  where: the "New connector configuration" Button, placed in the outer return ahead of `{renderBody()}}`,
    together with the comment above it
  evidence: "\"New connector configuration\" renders unconditionally, ahead of\n        the loading/error/empty\
    \ branches above, so criterion 4 (this\n        task's own -- \"renders while the list is loading,\
    \ while it has\n        failed to load, and while it is empty, as it does today\") holds\n       \
    \ regardless of whichever of those three states the list itself is\n        currently in [...] hiding\
    \ a create action behind an unrelated read\n        failure would block authoring a connector configuration\
    \ for a\n        reason that has nothing to do with it."
  cost: The rule that authoring a new connector configuration must stay reachable no matter whether the
    listing is loading, has failed to load, or is empty lives only in this comment and in the JSX's structural
    placement of the button outside `renderBody()`. Nothing under the specification states this guarantee,
    though the specification does state its mirror image as an invariant (a single-configuration surface's
    route back to the listing "turns on nothing further"). The next person changing this screen has no
    spec text obliging them to keep the create action outside the loading/error/empty branch, and a reader
    looking for why it is placed there will not find the reason in the specification, only in this comment.
pairs_omitted:
- node: domain/integration/connector-configuration
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/hooks/use-connector-configuration-form.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/hooks/use-connector-configuration-form.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  file: src/hooks/use-connector-configuration-form.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  file: src/routes/connector-configuration-create-screen.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 7 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-cached-load-code-drift.returns/.

  A finding in src/hooks/use-connector-configuration-form.ts names rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content,
  which no file of this set is bound to: the initial configurationValid state, line 76: const [configurationValid,
  setConfigurationValid] = useState(existing !== null); — An operator opening the edit form for a connector
  configuration whose already-registered content is not well-formed JSON object text (a null, an array,
  or any legacy value the registry never held to this criterion) is told nothing is wrong: validity is
  set to true from the mere presence of `existing`, without ever running the same judgment (`isValidConfigurationObject`)
  applied to every keystroke afterward. The operator edits over content the registry will not take and
  learns of the problem only from a refused submission, or never learns it at all if they resubmit unchanged
  text the mutation happens to accept for other reasons — exactly the silence the governing rule requires
  the surface to close.. It blocks nothing here; it is owed a route of its own.

  Candidates: 8 opened across 4 of 7 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 2 fact(s) the source states that no node holds, over 2 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-cached-load-code-drift.returns/`, which are the evidence behind every entry above.
