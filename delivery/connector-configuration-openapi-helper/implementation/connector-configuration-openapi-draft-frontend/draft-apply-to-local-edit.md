---
target: frontend
title: Apply a drafted configuration to the Configuration field's local edit
summary: Wires an Apply button, offered only against an answered draft, that writes the drafted configuration
  text through the Configuration field's own onChange and touches nothing else.
task: sha256:88c24b77e5e9e0059a635509d72e1ef19e659b81ce6ede50ded7a891af524894
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-draft-apply-to-local-edit-build-2
files:
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: ConnectorConfigurationHelperFieldsProps gains a required onApply(configurationText) callback,
    passed through to the drafted-branch subcomponent. ConnectorConfigurationDraftDisclosure now renders
    a non-submitting Button labeled "Apply" beside the "Drafted configuration" caption, styled the same
    as the existing "Request Draft" button (default variant, type="button"), that calls onApply(draft.configuration)
    on click. The button exists only inside the disclosure's "drafted" branch, so it is never rendered
    for "none", "pending" or "refused" disclosure states.
- path: src/routes/connector-configuration-helper.tsx
  effect: ConnectorConfigurationHelperProps gains a required onApply(configurationText) callback prop,
    forwarded unmodified to ConnectorConfigurationHelperFields. The hook call and the component's own
    state (link/path/method/outcome) are unchanged.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: The existing <ConnectorConfigurationHelper connector={...} /> call now also passes onApply={(configurationText)
    => configuration.onChange(configurationText, true)}, closing over the configuration prop this component
    already received. This is the one place in the tree that already held both a ConfigurationFieldState
    and a rendered ConnectorConfigurationHelper, so it is where the two meet.
- path: src/routes/connector-configuration-helper-fields.spec.ts
  effect: 'Mechanical required-prop fix only, no assertion changed: the 4 existing createElement(ConnectorConfigurationHelperFields,
    { state: baseState(...) }) call sites (the shared renderHelperFields helper, the ConfigurationFieldAndHelper
    fixture, and the two rerender() calls in the "stale disclosure clears" tests) now also pass onApply:
    () => {}, satisfying the onApply prop this task''s own source change made required. No test description,
    expectation or fixture behavior changed.'
criteria:
- criterion: Applying an answered draft sets the Configuration field's local value to that draft's configuration
    text.
  met: true
  how: The Apply button's onClick calls onApply(draft.configuration), where draft.configuration is the
    DraftDisclosure's configuration field -- carried unmodified from the answered ConnectorConfigurationDraft's
    own configuration string (connector-configuration-draft-disclosure.ts's draftDisclosureFrom). onApply
    is bound in connector-configuration-form-fields.tsx to configuration.onChange(configurationText, true),
    and configuration.onChange's real implementation (use-connector-configuration-form.ts / use-connector-configuration-detail.ts)
    calls setConfigurationValue(value), replacing the field's local value with the drafted text.
- criterion: Applying an answered draft invokes neither screen's save mutation and dispatches no request.
  met: true
  how: onApply's whole body is a call to configuration.onChange -- a local setState pair (setConfigurationValue
    / setConfigurationValid) with no reference to the mutation object either screen's own hook holds.
    No network call, no mutate() invocation, exists anywhere on this path.
- criterion: After an apply, every connector configuration currently registered stands exactly as it stood
    in membership and in content.
  met: true
  how: Nothing on the apply path issues a request of any kind (see the criterion above), so no register-connector
    or PUT call is made and the registry is untouched.
- criterion: After an apply, the operator remains on the same surface with the applied text held unsubmitted.
  met: true
  how: onApply performs a local state update only -- no navigate(), no router.history call, no form submission
    (onSubmit is never invoked). The applied text sits in configuration.value, read by the same JsonTextareaField
    that already renders the field's unsubmitted content, and is only sent anywhere if the operator separately
    submits Save.
- criterion: Applying an answered draft leaves the Connector field's value exactly as it stood.
  met: true
  how: onApply never calls form.setValue / form.reset or touches the "connector" registered field in any
    way; it exclusively calls the Configuration field's own onChange.
- criterion: After an apply, the Configuration field's own validity reading is recomputed from the applied
    text the same way it is for text typed by hand.
  met: true
  how: configuration.onChange(configurationText, true) is called with the same two-argument shape a hand-typed
    edit uses (see json-textarea-field.tsx's handleChange), and the concrete onChange in both use-connector-configuration-form.ts
    and use-connector-configuration-detail.ts already ignores the passed isValid argument and recomputes
    validity itself via isValidConfigurationObject(value) on every call -- so the apply path and the hand-typed
    path run through the identical recomputation with no new logic added.
- criterion: No apply is offered where no draft has been answered.
  met: true
  how: The Apply button is rendered only inside ConnectorConfigurationDraftDisclosure, which disclosureStateForOutcome
    only returns for outcome.kind === "drafted". Every other outcome ("idle", "pending", any refusal)
    renders the "none", "pending" or "refused" disclosure branch instead, none of which mounts the button.
    Because the outcome is derived directly from a single useMutation's own status (outcomeFromMutation),
    a later request that refuses replaces the prior "drafted" status outright rather than leaving it standing
    beside the refusal -- so a later refusal after an earlier successful draft also withdraws the Apply
    affordance, without any code added for that case specifically (see the inferences below).
nodes:
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/routes/connector-configuration-helper.tsx
  - src/routes/connector-configuration-form-fields.tsx
  how: The rule's own statement -- applying replaces only the Configuration field's local, unsubmitted
    content, issues no register-connector call, and leaves every registered connector configuration exactly
    as it stood -- is what criteria 1 through 5 restate, and the wiring above (onApply as a pure call
    to configuration.onChange, nothing else) is the whole of what answers it.
- node: domain/integration/connector-configuration
  how: This node states the value object apply writes toward (connector + configuration text) and that
    its configuration is replaced whole on every edit rather than merged. The implementation does not
    touch this value object directly -- it writes only the Configuration field's local, unsubmitted text
    via ConfigurationFieldState.onChange -- but the whole-replace convention it states is exactly what
    onChange's setConfigurationValue(value) already does, and this task does not introduce a merge path.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: The node's description states a draft is "offered for an operator to review and apply". The Apply
    button is that apply affordance, reading draft.configuration -- the same text this node says the draft
    holds -- and carrying it into the local edit unmodified.
inferences:
- inferred: The Apply control is a <Button type="button"> rendered inside the drafted branch of ConnectorConfigurationHelperFields
    (specifically beside the "Drafted configuration" caption in ConnectorConfigurationDraftDisclosure),
    using the default Button variant -- the same non-submitting, unstyled-variant convention the file's
    existing "Request Draft" button already follows.
  from: The task's own inference note naming this as the most likely placement and directing reuse of
    the file's existing Button convention rather than a new pattern; connector-configuration-helper-fields.tsx's
    existing "Request Draft" button was the only precedent in this file for a non-submitting action button.
- inferred: onApply is threaded as a plain callback prop through ConnectorConfigurationHelper and ConnectorConfigurationHelperFields,
    rather than folded into useConnectorConfigurationHelper's own returned state object.
  from: useConnectorConfigurationHelper's own responsibility (link/path/method/outcome/onRequestDraft)
    is the draft-request flow for one connector name; it holds no reference to the Configuration field's
    state today, and connector-configuration-form-fields.tsx is the one place that already holds both
    a ConfigurationFieldState and a rendered ConnectorConfigurationHelper. Keeping onApply a passthrough
    prop avoids adding a dependency the hook does not otherwise need.
- inferred: No additional gating code was written for the case where an earlier draft's Apply affordance
    might otherwise survive a later refused request -- the task's own UNDERDETERMINED note's directive
    ("withdraw or disable the apply affordance ... so a refused request never leaves an applicable stale
    draft standing") is already satisfied by the existing outcome-derivation mechanics (outcomeFromMutation
    reads a single useMutation's status, so a later "error" status fully replaces a prior "success" status
    rather than coexisting with it).
  from: 'Reading use-draft-connector-configuration-from-openapi.ts''s outcomeFromMutation and requestDraft:
    mutation.reset() then mutation.mutate() are called synchronously on every onRequestDraft, and the
    returned outcome is computed fresh from mutation.status on each render, so there is no code path in
    the existing hook where a "drafted" outcome and a "refused" outcome are both true of the same mutation
    object at once.'
preserved:
- The three existing screens composing ConnectorConfigurationHelper continue to render unchanged aside
  from the new onApply prop, which both already have a configuration state to supply from state.configuration.
- The Request Draft button's existing disabled-while-pending behavior and the disclosure states for "none"/"pending"/"refused"
  outcomes are untouched.
- use-connector-configuration-helper.ts and use-draft-connector-configuration-from-openapi.ts were read
  but not modified -- their existing link/path/method/outcome/onRequestDraft and mutation-outcome derivation
  are exactly what this task's Apply wiring depends on and neither needed a change.
deferred:
- what: The confirmation guard for overwriting an unsaved edit when applying a draft.
  why: Explicitly out of scope per this task's own Notes -- it belongs to the sibling task unsaved-edit-apply-confirmation,
    and this task's own criteria (1-7) contain no gate on confirmation. Implementing it here would widen
    this task beyond what it was cut to deliver.
- what: Every clause of the offer rule for the Configuration Helper itself (rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper)
    and every clause of the refusal/answer-disclosure rules beyond what criterion 7 already reaches.
  why: Named in the task's own REMAINDER notes as reaching no criterion of this task; already implemented
    by the sibling configuration-helper-section task this one depends on.
---

## What it is

The operator carrying a reviewed draft into the field they are already editing. It is a local write, and the operator still submits it or does not.

## Notes

None.
