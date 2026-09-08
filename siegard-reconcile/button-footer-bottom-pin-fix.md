---
contract_version: siegard-reconcile/3
title: Pin ButtonFooter flush to the page bottom on short content
summary: 'sticky bottom-0 only travels within a scrolling ancestor''s existing scroll distance -- with
  less content than the viewport, the shared ButtonFooter component sat right after the last field instead
  of the visible page bottom, leaving a blank gap below it. main was turned into a flex column and every
  screen''s own top-level wrapper (and, where ButtonFooter sits inside a <form>, that form too) into a
  flex-1 flex column, so each screen''s content always fills main''s height; ButtonFooter itself got mt-auto
  to be pushed to the bottom of that column when content is short, while sticky bottom-0 still keeps it
  glued to view when content overflows and the page scrolls. Every file in this set changed only a className
  string (flex layout classes); no behavior, no text, no control changed.

  '
target: frontend
files:
- path: src/routes/capability-create-screen.tsx
  change: 'The two top-level section wrappers'' className gained flex-1 (line 28 and the load-error branch''s
    nested section).

    '
- path: src/routes/capability-detail-ready-view.tsx
  change: The wrapping div's className gained flex-1.
- path: src/routes/capability-detail-screen.tsx
  change: All four top-level section wrappers' className gained flex-1.
- path: src/routes/capability-form-fields.tsx
  change: The <form>'s className gained flex-1.
- path: src/routes/case-version-editor-screen.tsx
  change: The top-level section wrapper's className gained flex-1.
- path: src/routes/connector-configuration-create-screen.tsx
  change: The top-level section wrapper's className gained flex-1.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: The wrapping div's className gained flex-1.
- path: src/routes/connector-configuration-detail-screen.tsx
  change: All three top-level section wrappers' className gained flex-1.
- path: src/routes/connector-configuration-form-fields.tsx
  change: The <form>'s className gained flex-1.
- path: src/routes/hypothesis-revision-form-fields.tsx
  change: The <form>'s className gained flex-1.
- path: src/routes/hypothesis-revision-screen.tsx
  change: The top-level section wrapper's className gained flex-1.
- path: src/shared/components/app-shell.tsx
  change: 'The <main> element''s className changed from "relative flex-1 overflow-y-auto p-4" to "relative
    flex flex-1 flex-col overflow-y-auto p-4", turning it into a flex column.

    '
- path: src/shared/components/button-footer.tsx
  change: The group div's className gained mt-auto.
nodes:
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: 'src/shared/components/app-shell.tsx: held at the `right` prop of the `StatusBar` inside `Topbar`,
    rendered by `AppShell` around every route''s `Outlet` — right={<span>No auth in this build</span>}'
  encoded_at:
  - src/shared/components/app-shell.tsx
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at handleSaved''s post-submit navigation to the
    capability''s own identity route — void navigate({ to: "/capabilities/$name/$version", params: { name,
    version } });'
  encoded_at:
  - src/routes/capability-create-screen.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,
    handleSaved); — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/routes/case-version-editor-screen.tsx: held at the Link offering the route into the simulate
    flow, lines 33-35 — <Link to="/cases/$slug/versions/$version/simulate" params={{ slug, version }}>\n        Simulate\n      </Link>'
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
- node: domain/glossary/action
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Referral action" Select bound to
    resolution.referral.action — name="resolution.referral.action" ... options={actionOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/concept
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Collects" fieldset''s Checkbox list,
    one per collectsOptions entry — key={concept.name} ... {concept.name}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Resolution outcome" Select bound
    to resolution.outcome — name="resolution.outcome" ... options={outcomeOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the "Referral recipient" Select bound
    to resolution.referral.recipient — name="resolution.referral.recipient" ... options={recipientOptions.options}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the read-only "Subject type (from draft,
    fixed)" field — <Input value={subjectType} disabled readOnly />'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/integration/capability
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at handleSaved's extraction of the aggregate's identity\
    \ fields from the submitted form — const name = values?.name ?? \"\"; const version = values?.version\
    \ ?? \"\";\nsrc/routes/capability-detail-screen.tsx: held at the heading and phase messages that identify\
    \ the capability by name and version — <h1 className=\"text-lg font-semibold text-foreground\">\n\
    \        Capability {name} {version}\n      </h1>\n\nsrc/routes/capability-form-fields.tsx: held at\
    \ the field set the form renders — Concept, Name, Version, Nature, Timeout (ms), Connector, Input\
    \ schema, Output schema — name=\"concept\" ... {...register(\"name\")} ... {...register(\"version\"\
    )} ... name=\"nature\" ... {...register(\"timeout\", { setValueAs: (value: string) => (value === \"\
    \" ? undefined : Number(value)), })} ... {...register(\"connector\")} ... id=\"input_schema\" ...\
    \ id=\"output_schema\""
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the Nature Select field, built from an imported
    vocabulary rather than one this file states — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature)
    => ({\n  value: nature,\n  label: nature,\n}));'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-registry
  conforms: true
  how: 'src/routes/capability-create-screen.tsx: held at the submission delegated to useCapabilityForm''s
    onSubmit — onSubmit={state.onSubmit}'
  encoded_at:
  - src/routes/capability-create-screen.tsx
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at the `configuration` prop forwarded\
    \ to ConnectorConfigurationFormFields and the `connector` field read in handleSaved — configuration={state.configuration}\n\
    src/routes/connector-configuration-detail-ready-view.tsx: held at the `state.configuration.isValid`\
    \ guard, lines 35-39, and `state.registeredConfigurationText`, line 42 — {!state.configuration.isValid\
    \ && (\n  <p role=\"alert\" className=\"text-sm text-destructive\">\n    {INVALID_CONFIGURATION_WARNING}\n\
    \  </p>\n)}\n\nsrc/routes/connector-configuration-detail-screen.tsx: held at the `connector` route\
    \ param carried as the identity and passed through to the child view; the configuration attribute\
    \ itself is not held in this file — const { connector } = useParams({ from: \"/connectors/$connector\"\
    \ }); ... <ConnectorConfigurationDetailReadyView state={state} connector={connector} />"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'no named file holds this fact now: src/routes/connector-configuration-create-screen.tsx read `nowhere`
    — const state = useConnectorConfigurationForm(null, handleSaved);'
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beside the Output schema field —
    Os nomes de campo lidos a partir dele são as chaves do próprio objeto <code>properties</code> de nível
    superior deste schema. O <code>type</code> e a <code>description</code>{" "} declarados por cada uma
    dessas chaves, onde o schema os declara, são lidos como a semântica declarada desse campo.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at nowhere — only its subject attribute''s
    value is displayed, opaquely — ''readonly subjectType: string'' consumed only as ''<Input value={subjectType}
    disabled readOnly />''

    src/routes/hypothesis-revision-screen.tsx: held at the version prop threaded into the form hook —
    readonly version: number;

    ...

    const state = useHypothesisRevisionForm(slug, version, hypothesisName);'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the hypothesis-name Input''s conditional
    editability — disabled={!hypothesisNameEditable || isSubmitting}'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the criterion, collects and resolution
    field groups — {...register("criterion")} and the collects Controller/fieldset and the resolution
    Controllers'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/referral
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the paired "Referral action" and "Referral
    recipient" fields under resolution.referral — name="resolution.referral.action" and name="resolution.referral.recipient"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at the outcome field plus the referral group,
    all under the resolution.* path prefix — name="resolution.outcome" alongside name="resolution.referral.action"'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the closing sentence of the same paragraph — Uma
    <code>description</code> aqui declara o que seu valor significa e não nomeia nenhuma decisão.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/routes/capability-detail-ready-view.tsx: held at the two alert paragraphs guarding on schema\
    \ validity, lines 34-43 — {!state.inputSchema.isValid && (\n  <p role=\"alert\" className=\"text-sm\
    \ text-destructive\">\n    {INVALID_INPUT_SCHEMA_WARNING}\n  </p>\n)}\n\nsrc/routes/capability-form-fields.tsx:\
    \ held at the save-disable guard — isSubmitting || !inputSchema.isValid || !outputSchema.isValid ||\
    \ isDirty === false;"
  encoded_at:
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — NATURE_OPTIONS
    presents every value CAPABILITY_NATURES holds, without restricting the Nature Select to read-only
    — the refusal this node states is the registry''s, not this component''s'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  conforms: true
  how: "src/routes/capability-detail-screen.tsx: held at the loading and load-error branches — <p>\n \
    \       Loading capability {name} {version}…\n      </p>\n...\n<p>Unable to load this capability right\
    \ now.</p>\n<ButtonFooter>\n        <Button type=\"button\" onClick={state.retryLoad}>\n         \
    \ Retry\n        </Button>\n"
  encoded_at:
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — <Button type="button" variant="secondary"
    onClick={state.onCancel}> — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the invalid-configuration warning,\
    \ lines 18-19 and 35-39 — const INVALID_CONFIGURATION_WARNING =\n  \"This connector configuration's\
    \ stored value must be a JSON object. Correct it before Save can succeed.\";\n\nsrc/routes/connector-configuration-form-fields.tsx:\
    \ held at the isSaveDisabled expression gating the Save button — const isSaveDisabled = isSubmitting\
    \ || !configuration.isValid || isDirty === false;"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: "src/routes/connector-configuration-detail-ready-view.tsx: held at the `configurationText` prop\
    \ passed to ConnectorTestPanel, lines 40-43 — <ConnectorTestPanel\n  connector={connector}\n  configurationText={state.registeredConfigurationText}\n\
    />\n"
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  conforms: true
  how: "src/routes/connector-configuration-create-screen.tsx: held at the trailingActions Link rendered\
    \ beside the form — <Link to=\"/connectors\">Connectors</Link>\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the Connectors link, lines 91-93 — <Button variant=\"secondary\" asChild>\n  <Link to=\"\
    /connectors\">Connectors</Link>\n</Button>\n\nsrc/routes/connector-configuration-detail-screen.tsx:\
    \ held at the `Link to=\"/connectors\"` control in the loading and load-error footers (lines 21 and\
    \ 40); the ready reading's route is carried by ConnectorConfigurationDetailReadyView — <Link to=\"\
    /connectors\">Connectors</Link>"
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/capability-detail-screen.tsx, src/routes/connector-configuration-detail-ready-view.tsx,
    and src/routes/connector-configuration-create-screen.tsx read `nowhere` — const state = useConnectorConfigurationForm(null,
    handleSaved);; src/routes/connector-configuration-detail-screen.tsx read `nowhere` — <ConnectorConfigurationDetailReadyView
    state={state} connector={connector} /> — this screen renders no discard act itself for the ready reading,
    delegating the whole ready presentation (where the act applies) to the child view — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  conforms: true
  how: 'src/routes/connector-configuration-detail-screen.tsx: held at the `state.phase` branches, lines
    12 and 28 — if (state.phase === "loading") { ... <p>Loading connector configuration {connector}…</p>
    ... } if (state.phase === "load-error") { ... <p>Unable to load this connector configuration right
    now.</p> ... <Button type="button" onClick={state.retryLoad}>Retry</Button> ... }'
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at the Capabilities link rendered in every phase's\
    \ action set (loading, load-error, ready) — <Link to=\"/capabilities\">Capabilities</Link>\nsrc/routes/capability-detail-ready-view.tsx:\
    \ held at the unconditional Capabilities link among the trailing actions, lines 92-94 — <Button variant=\"\
    secondary\" asChild>\n  <Link to=\"/capabilities\">Capabilities</Link>\n</Button>\n\nsrc/routes/capability-detail-screen.tsx:\
    \ held at the Capabilities link present in every early-return branch — <Button variant=\"secondary\"\
    \ asChild>\n        <Link to=\"/capabilities\">Capabilities</Link>\n      </Button>\n"
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  conforms: true
  how: "src/routes/capability-detail-ready-view.tsx: held at the unconditional Cancel button, lines 89-91\
    \ — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\n\
    \nsrc/routes/capability-detail-screen.tsx: held at the Cancel button present in the loading, load-error\
    \ and not-registered branches, wired to state.onCancel — <Button type=\"button\" variant=\"secondary\"\
    \ onClick={state.onCancel}>\n        Cancel\n      </Button>\n\nsrc/routes/connector-configuration-detail-ready-view.tsx:\
    \ held at the Cancel button, lines 88-90 — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n\
    \  Cancel\n</Button>\n\nsrc/routes/connector-configuration-detail-screen.tsx: held at the Cancel button's\
    \ `onClick={state.onCancel}` in the loading and load-error footers, lines 17 and 36 — <Button type=\"\
    button\" variant=\"secondary\" onClick={state.onCancel}>Cancel</Button>"
  encoded_at:
  - src/routes/capability-detail-ready-view.tsx
  - src/routes/capability-detail-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
  - src/routes/connector-configuration-detail-screen.tsx
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/routes/connector-configuration-detail-ready-view.tsx, the `state.justSaved` block, lines 82-87,\
    \ and the trailingActions block as a whole (lines 51-95): {state.justSaved && (\n\n  <p role=\"status\"\
    \ className=\"text-sm text-foreground\">\n    Saved.\n  </p>\n)}\n — The registered outcome is stated\
    \ as a bare \"Saved.\", never naming the connector name that now stands registered, and no branch\
    \ of this file ever states a refused outcome or which refusal answered it — the only submission-outcome\
    \ prop this component reads is `state.justSaved`. An operator whose edit the registry refused sees\
    \ nothing distinguishing that from an edit still in flight or one never submitted, and the next reader\
    \ auditing this view for where a refusal is told to the operator finds no such construct here at all."
  observed_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  conforms: true
  how: 'src/routes/connector-configuration-create-screen.tsx: held at handleSaved, lines 14-17 — void
    navigate({ to: "/connectors/$connector", params: { connector } });'
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  conforms: true
  how: "src/routes/capability-create-screen.tsx: held at the Cancel button delegating to state.onCancel\
    \ in every phase — onClick={state.onCancel}\nsrc/routes/capability-detail-ready-view.tsx: held at\
    \ the same Cancel button, lines 89-91, backed by onCancel's navigate-away with no register call (use-capability-detail.ts)\
    \ — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\n"
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-ready-view.tsx
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: 'src/routes/capability-form-fields.tsx: held at the paragraph beside the Output schema field —
    O que é inserido aqui é <code>JSON</code>. Os nomes de campo lidos a partir dele são as chaves do
    próprio objeto <code>properties</code> de nível superior deste schema. ... Nenhum outro conteúdo deste
    schema é lido ou validado.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — the
    Concept Controller only lets an operator pick a value from conceptSelectOptions; no duplicate-answer
    refusal is rendered here, which is the registry''s own concern'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/routes/hypothesis-revision-screen.tsx: held at the loading-phase branch, lines 20-22 — if\
    \ (state.phase === \"loading\") {\n    return <p>Loading…</p>;\n  }"
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the success-phase message, lines 39-41 — Hypothesis
    &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/routes/hypothesis-revision-screen.tsx: held at the conditional manifest-builder button, lines\
    \ 42-46 — {state.offerManifestBuilder && (\n          <Button type=\"button\" onClick={state.onOpenManifestBuilder}>\n\
    \            Open Manifest Builder\n          </Button>\n        )}"
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at nowhere — the file only renders a passed-in\
    \ slot — {trailingActions}\nsrc/routes/hypothesis-revision-screen.tsx: held at the Cancel button passed\
    \ as trailingActions, lines 68-70 — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n\
    \            Cancel\n          </Button>"
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at nowhere — no existence/refusal check is
    performed here — collectsOptions.map((concept) => { ... }) iterates given options with no glossary
    check'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'src/routes/hypothesis-revision-form-fields.tsx: held at nowhere — the three fields are rendered
    and wired to errors, but no requiredness is enforced in this file — error={errors.resolution?.outcome?.message}
    shown without any required attribute or check here'
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
unbound:
- src/shared/components/button-footer.tsx
notes: 'Judged by 12 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/button-footer-bottom-pin-fix.returns/.

  Candidates: 2 opened across 1 of 12 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/button-footer-bottom-pin-fix.returns/`, which are the evidence behind every entry above.
