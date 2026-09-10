---
contract_version: siegard-reconcile/5
title: Connector configuration surfaces re-read after the analysis of 2026-09-10 gave three of their facts
  a node
summary: 'The human states these eight files are correct as committed. None changed since the reconciliation
  connector-configuration-cached-load-code-drift and the review connector-configuration-detail-cached-load-empty
  earlier the same day; what changed is the specification: three rules were written for facts those judgments
  had found held by no node, or that the plan had left open, namely a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed,
  a-connector-configurations-listing-offers-a-route-to-author-a-new-configuration-on-every-reading and
  a-connector-configuration-surface-first-presented-holding-an-answer-issues-a-further-read. This reconciliation
  re-reads the pairs those judgments left unbound with those three nodes as candidates, so a fact one
  of them now holds is attributed rather than reported as held by nothing.'
target: frontend
files:
- path: src/hooks/use-connector-configuration-detail.ts
  change: Drives the detail screen; since its last bind it copies a read answer already held at mount
    into the fields on the first render, withholds the submit while its own judgment finds the content
    not well formed, and issues a further read on mount whenever a held answer stands.
- path: src/hooks/use-connector-configuration-form.ts
  change: Drives the create screen's registration form; since its last bind it gates dispatch on the surface's
    own well-formedness judgment, guards double dispatch and states the not-well-formed save failure distinguishably.
- path: src/hooks/use-test-connector-panel.ts
  change: Drives the test panel; since its last bind it reads the registered configuration text handed
    down by the detail view and derives the subject attributes from that text's placeholders.
- path: src/routes/connector-configuration-create-screen.tsx
  change: Renders the create screen; since its last bind it composes the shared form fields with the configuration
    helper and offers the return-to-origin and listing routes.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: Renders the detail screen's returned reading; since its last bind it hands the test panel the
    registered configuration text, gates Save and Discard on dirtiness and validity, and states the well-formedness
    warning and the saved acknowledgement.
- path: src/routes/connector-configuration-form-fields.tsx
  change: Renders the shared registration form; since its last bind it owns the form id the portaled Save
    control names, disables Save while the content is not well formed or nothing changed, and composes
    the configuration helper with its apply-over-edit confirmation.
- path: src/routes/connector-configurations-screen.tsx
  change: Lists the registered connector configurations; since its last bind it routes each row to the
    configuration's own detail screen and offers the route to author a new configuration outside the listing's
    loading, failed and empty branches.
- path: src/routes/connector-test-panel.tsx
  change: Renders the test panel; since its last bind it receives the registered configuration text as
    a prop and composes the fields and result components.
nodes:
- node: domain/integration/connector-configuration
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-connector-configuration-form.ts,\
    \ src/hooks/use-test-connector-panel.ts, src/routes/connector-configurations-screen.tsx, and src/routes/connector-test-panel.tsx\
    \ read `nowhere` — export type ConnectorTestPanelProps = {\n  readonly connector: string;\n  readonly\
    \ configurationText: string;\n}; — a binding asserts the file answers for the node, so the pair that\
    \ stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-configurations-screen.tsx
  - src/routes/connector-test-panel.tsx
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at the JSX placing `<ConnectorConfigurationHelper>`\
    \ directly beneath the Configuration field's `<JsonTextareaField>`, lines 117-125 — <JsonTextareaField\n\
    \  id=\"configuration\"\n  label=\"Configuration\"\n  value={configuration.value}\n  onChange={configuration.onChange}\n\
    \  disabled={isSubmitting}\n/>\n\n<ConnectorConfigurationHelper connector={watch(\"connector\")} onApply={handleApply}\
    \ />"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: 'no named file holds this fact now: src/routes/connector-configuration-form-fields.tsx read `nowhere`
    — `const isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false;` (line 81)
    is the only place this file touches well-formedness, and it only consumes an already-computed `configuration.isValid`
    flag — the criterion itself (null/array excluded but a plain object or its text accepted, the distinct
    IncompleteConnectorConfigurationError for an absent or wrongly-shaped value, the 422 responses) is
    not expressed anywhere in this file.'
  observed_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: false
  how: "src/hooks/use-test-connector-panel.ts, the `onAttributeChange` field of `TestConnectorPanelState`\
    \ and its implementation, lines 91 and 260-264: readonly onAttributeChange: (id: string, field: \"\
    attribute\" | \"value\", value: string) => void;\n...\nonAttributeChange: (id, field, value) => {\n\
    \  setAttributes((current) =>\n    current.map((row) => (row.id === id ? { ...row, [field]: value\
    \ } : row)),\n  );\n}, — An operator can rename a subject-attribute row's `attribute` field directly\
    \ through this handler, so the name `onTest` dispatches for that row need never be one of the connector\
    \ configuration's own `${subject:<attribute-name>}` placeholders. The next reader who trusts that\
    \ \"an attribute those placeholders do not name is no part of the subject the test assembles\" will\
    \ find the panel offering exactly that: a free-form attribute name, with no re-derivation or re-check\
    \ against the registered configuration's placeholders before the request body is built.\nsrc/hooks/use-test-connector-panel.ts,\
    \ the `hasCompleteAttribute`/`canTest` definitions, lines 194-202: const hasCompleteAttribute =\n\
    \  attributes.length > 0 &&\n  attributes.every((row) => row.attribute.trim() !== \"\" && row.value.trim()\
    \ !== \"\");\n\nconst canTest =\n  selectedCapability !== undefined &&\n  subjectType !== \"\" &&\n\
    \  hasCompleteAttribute &&\n  requester.trim() !== \"\"; — A capability whose connector configuration\
    \ declares no ${subject:<attribute-name>} placeholder reconciles to zero attribute rows, so `hasCompleteAttribute`\
    \ is `false` forever (`0 > 0` never holds) and `canTest` can never turn true. The specification's\
    \ own subject for such a capability is legitimately empty — \"one attribute-value per distinct attribute\
    \ those placeholders name\" is vacuously zero when there are no placeholders — yet this gate makes\
    \ that capability untestable through the panel, a refusal the policy never states."
  observed_at:
  - src/hooks/use-test-connector-panel.ts
  - src/routes/connector-test-panel.tsx
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  conforms: false
  how: "the fact left part of its ground: still held in src/routes/connector-configuration-create-screen.tsx,\
    \ src/routes/connector-configuration-detail-ready-view.tsx, and src/hooks/use-connector-configuration-detail.ts\
    \ read `nowhere` — return {\n    phase: \"ready\",\n    form,\n    configuration: {\n      value:\
    \ configurationValue,\n      isValid: configurationValid,\n\n      onChange: handleConfigurationChange,\n\
    \    },\n    isDirty,\n    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n\
    \    onSubmit,\n    onCancel,\n  }; — a binding asserts the file answers for the node, so the pair\
    \ that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-presented-connector-configurations-test-collects-values-for-the-attributes-the-presented-answer-names
  conforms: false
  how: "no named file holds this fact now: src/hooks/use-connector-configuration-detail.ts read `nowhere`\
    \ — | {\n      readonly phase: \"ready\";\n      readonly form: UseFormReturn<ConnectorConfigurationFormValues>;\n\
    \      readonly configuration: ConfigurationFieldState;\n      readonly isDirty: boolean;\n      readonly\
    \ isSubmitting: boolean;\n\n      readonly isSubmitSuccessful: boolean;\n      readonly onSubmit:\
    \ (event?: BaseSyntheticEvent) => void;\n      readonly onCancel: () => void;\n    };"
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  conforms: false
  how: "src/hooks/use-connector-configuration-form.ts, the `SAVE_FAILURE_MESSAGE_BY_KIND` map and its\
    \ use in `saveFailureMessage`: const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind,\
    \ string>> = {\n  \"connector-configuration-not-well-formed\":\n    \"This configuration is not syntactically\
    \ valid JSON.\",\n};\n\nexport function saveFailureMessage(error: unknown): string {\n  if (error\
    \ instanceof ApiError) {\n    const state = uiStateForApiError(error);\n    return SAVE_FAILURE_MESSAGE_BY_KIND[state.kind]\
    \ ?? GENERIC_SAVE_FAILURE_MESSAGE;\n  }\n  return GENERIC_SAVE_FAILURE_MESSAGE;\n} — An operator whose\
    \ submitted registration is refused for the connector-name condition — one of the registration conditions\
    \ this same node's own description names alongside the well-formedness condition as a condition this\
    \ route can name — is shown the identical \"Something went wrong while saving this connector configuration.\
    \ Try again.\" toast used for a refusal the surface does not recognise at all. The one named condition\
    \ this map does single out (`connector-configuration-not-well-formed`) is stated distinguishably even\
    \ though the client already blocks that case before it ever reaches the registry, showing the pattern\
    \ this file itself uses for a named condition — but the other named condition on this route falls\
    \ through to the same message as an unrecognised refusal, which is exactly the collapse the node forbids."
  observed_at:
  - src/hooks/use-connector-configuration-form.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at handleApply (lines 86-92), which withholds\
    \ the direct apply and opens the confirmation dialog whenever hasUnsavedEdit is true — function handleApply(configurationText:\
    \ string): void {\n    if (!hasUnsavedEdit) {\n      configuration.onChange(configurationText, true);\n\
    \      return;\n    }\n    setPendingApplyText(configurationText);\n  }"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at handleApply and handleConfirmApply\
    \ (lines 86-99), both of which only call configuration.onChange and issue no other call — function\
    \ handleConfirmApply(): void {\n    if (pendingApplyText !== null) {\n      configuration.onChange(pendingApplyText,\
    \ true);\n    }\n    setPendingApplyText(null);\n  }"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  conforms: true
  how: "src/routes/connector-configuration-form-fields.tsx: held at the Dialog block (lines 127-153):\
    \ it opens whenever pendingApplyText is non-null, asks the operator to confirm, and closes without\
    \ applying on \"Keep editing\" or on dismissal — <Dialog\n  open={pendingApplyText !== null}\n  onOpenChange={(open)\
    \ => {\n    if (!open) {\n      setPendingApplyText(null);\n    }\n  }}\n>\n  <DialogContent>\n  \
    \  <DialogHeader>\n      <DialogTitle>Apply drafted configuration?</DialogTitle>\n    </DialogHeader>\n\
    \    <DialogDescription>{APPLY_OVER_UNSAVED_EDIT_DESCRIPTION}</DialogDescription>\n    <DialogFooter>\n\
    \      <DialogClose asChild>\n        <Button type=\"button\" variant=\"secondary\">\n          Keep\
    \ editing\n        </Button>\n      </DialogClose>\n      <DialogClose asChild>\n        <Button type=\"\
    button\" variant=\"destructive\" onClick={handleConfirmApply}>\n          Apply\n        </Button>\n\
    \      </DialogClose>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>"
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
pairs_omitted:
- node: contracts/integration/connector-configuration-registry
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-presented-connector-configurations-fields-carry-the-answer-from-the-moment-that-reading-is-entered
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  file: src/hooks/use-connector-configuration-detail.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/hooks/use-connector-configuration-form.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/hooks/use-connector-configuration-form.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
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
- node: contracts/integration/connector-diagnostics
  file: src/hooks/use-test-connector-panel.ts
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
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
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
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  file: src/routes/connector-configuration-detail-ready-view.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/routes/connector-configuration-form-fields.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  file: src/routes/connector-configuration-form-fields.tsx
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: "Judged by 8 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/connector-configuration-surfaces-post-analyse.returns/.\nA finding in src/routes/connector-configurations-screen.tsx\
  \ names rules/integration/a-connector-configurations-listing-offers-a-route-to-author-a-new-configuration-on-every-reading,\
  \ which no file of this set is bound to: the comment above the \"New connector configuration\" Button,\
  \ lines 70-86: \"New connector configuration\" renders unconditionally, ahead of\n  the loading/error/empty\
  \ branches above, so criterion 4 (this\n  task's own -- \"renders while the list is loading, while it\
  \ has\n  failed to load, and while it is empty, as it does today\") holds\n  regardless of whichever\
  \ of those three states the list itself is\n  currently in -- unchanged from before this task [...]\
  \ hiding a create action behind an unrelated read\n  failure would block authoring a connector configuration\
  \ for a\n  reason that has nothing to do with it. — The rule that the route to author a new configuration\
  \ is offered on every reading — because \"a read of the registered set that is still outstanding, that\
  \ failed, or that answered nothing is a fact about that read; authoring a configuration is a write to\
  \ a registry the read never touched\" — is re-derived here in the comment's own words, tied to a task\
  \ citation, rather than left to live in the node alone. The code's placement of the button ahead of\
  \ renderBody() already carries the rule; the comment is a second place the same decision is stated,\
  \ in a task's own voice. If the specification narrows this rule later, the comment stays behind stating\
  \ the old reasoning as if it still held, and nothing marks it stale.. It blocks nothing here; it is\
  \ owed a route of its own.\nCandidates: 28 opened across 8 of 8 delegation(s); each return lists its\
  \ own under `candidates_opened`."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-surfaces-post-analyse.returns/`, which are the evidence behind every entry above.
