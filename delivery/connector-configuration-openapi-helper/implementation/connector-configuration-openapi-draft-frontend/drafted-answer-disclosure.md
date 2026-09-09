---
target: frontend
title: Disclose the answered draft's every part, and a refusal on its own terms
summary: ConnectorConfigurationHelperFields now renders the drafted configuration
  text, every unresolved item by name and reason, every generated credential by name
  and security scheme, a method mismatch where one stands, or a refusal statement
  distinguishable across its three named conditions plus an unrecognised-failure fallback
  -- all derived by a new pure mapping service, with the Configuration field never
  touched.
task: sha256:2959768956e5f08734d1c92536ecf6ec7e04681e8f5e8855f77297f4b6d41761
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-drafted-answer-disclosure-build
files:
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: New pure service exporting disclosureStateForOutcome, which maps DraftConnectorConfigurationRequestOutcome
    to a ConnectorConfigurationHelperDisclosureState discriminated union (none | pending
    | drafted | refused). It carries the business decisions this task states -- distinct
    text for each of the four unresolved reasons via UNRESOLVED_REASON_LABEL, a distinct
    sentence for each of the three named refusal conditions (with the fetch failure's
    kind and, for status-outside-2xx, its status folded in), and a fallback sentence
    for unrecognized-failure. drafted carries a DraftDisclosure built by pure field
    renaming from the draft's own unresolved, generated_credentials and method_mismatch
    -- never adding or dropping a part the draft did not carry.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: 'Extended (previously only the three inputs and the Request Draft button)
    to also render the disclosure beneath the button, inside an aria-live="polite"
    region: a Drafting line while pending, the refusal sentence (role="alert") for
    a refused outcome, or a new private ConnectorConfigurationDraftDisclosure subcomponent
    for a drafted outcome -- a read-only <pre> of the configuration text, a <ul> of
    unresolved items (name + reason label, keyed by name:reason, omitted entirely
    when empty), a <ul> of generated credentials (name + security scheme, keyed by
    name:securityScheme, omitted when empty, and never rendering any value), and a
    method-mismatch line (registered vs. drafted, labelled separately) rendered only
    when the draft carries one. None of the three branches renders alongside another,
    and neither reads nor writes anything on the Configuration field.'
criteria:
- criterion: An answered draft's configuration text is disclosed in the section while
    the Configuration field's own content stands exactly as it stood.
  met: true
  how: The drafted branch renders draft.configuration in a read-only <pre>; the component
    holds no reference to the Configuration field's own state at all, so nothing about
    it can change.
- criterion: Each item of an answered draft's unresolved list is disclosed with its
    name exactly as the draft gave it and with its reason.
  met: true
  how: draftDisclosureFrom copies item.name unmodified and pairs it with unresolvedReasonLabel(item.reason);
    the component renders both per <li>.
- criterion: An answered draft whose unresolved list is empty discloses no unresolved
    item.
  met: true
  how: The Unresolved section is guarded by draft.unresolved.length > 0 and renders
    nothing otherwise.
- criterion: Each generated credential of an answered draft is disclosed with its
    generated name and with the security scheme's own name.
  met: true
  how: Each <li> renders credential.name and credential.securityScheme (mapped 1:1
    from generated_credentials[].name/security_scheme).
- criterion: No credential value appears in the disclosure of a generated credential.
  met: true
  how: GeneratedCredentialDisclosure and the rendering only ever reference name and
    securityScheme; the wire type carries no value field to begin with, so none can
    leak.
- criterion: An answered draft carrying a method mismatch discloses the registered
    method and the drafted operation's method side by side, with neither shown in
    place of the other.
  met: true
  how: 'The Method mismatch section renders Registered: {registered} and Drafted:
    {operation} as two separately labelled values in the same line.'
- criterion: An answered draft carrying no method mismatch discloses no disagreement
    of methods.
  met: true
  how: The section is guarded by draft.methodMismatch !== undefined.
- criterion: No name, reason, generated name, security-scheme name or method is disclosed
    for an answered draft that the draft's own response did not carry.
  met: true
  how: Every disclosed value is read straight from the draft's own arrays/optional
    field; an absent unresolved item, credential or mismatch simply produces an empty
    array or undefined, which the guards above suppress.
- criterion: A request refused because its named link could not be fetched discloses
    that the link could not be fetched, distinguishable from the other two refusals,
    with no part of a draft disclosed beside it.
  met: true
  how: The openapi-document-not-fetched case returns its own sentence naming the fetch
    failure's kind (and status, where status-outside-2xx); the discriminated disclosure.kind
    union means only the refused branch renders, never alongside drafted.
- criterion: A request refused because the fetched document could not be read discloses
    that the document could not be read, distinguishable from the other two refusals,
    with no part of a draft disclosed beside it.
  met: true
  how: The openapi-document-not-readable case returns its own distinct sentence; same
    mutual-exclusion as above.
- criterion: A request refused because the document declares no operation at the named
    path and method discloses that pairing, distinguishable from the other two refusals,
    with no part of a draft disclosed beside it.
  met: true
  how: The openapi-operation-not-found case states both outcome.method and outcome.path
    in its own sentence, distinct from the other two.
- criterion: A request refused with none of those three conditions discloses that
    the request failed for an unrecognised reason, never as one of the three and never
    as a draft.
  met: true
  how: The unrecognized-failure case returns its own sentence stating an unrecognised
    reason, never reusing one of the three named sentences and never entering the
    drafted branch.
- criterion: No refusal disclosure changes the Configuration field's own content.
  met: true
  how: Same as the drafted case -- the component never reads or writes the Configuration
    field.
nodes:
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: The drafted outcome is rendered in full (configuration, every unresolved item
    by name and reason, every generated credential by name and scheme, the method
    mismatch where present), each of the four unresolved reasons given its own distinct
    text, and the Configuration field is never touched by the arrival of a draft.
- node: rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Each of the three named refusal conditions gets its own distinct sentence (the
    fetch refusal carrying the failure kind and status), an unrecognised failure gets
    a fourth, none of the four ever renders alongside a draft part, and idle/pending
    render no refusal at all.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: DraftDisclosure mirrors the value object's own attributes (configuration, unresolved,
    generated_credentials, method_mismatch) one for one, adding nothing and dropping
    nothing.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Each item's name and reason are carried through unmodified and rendered as
    a name/reason pair.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: UNRESOLVED_REASON_LABEL gives each of the closed set's four values its own
    distinct sentence.
- node: domain/integration/connector-configuration-draft-generated-credential
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Disclosed by its generated name and security_scheme only; the type carries
    no value field, so none is ever rendered.
- node: domain/integration/connector-configuration-draft-method-mismatch
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  how: Rendered only when present, naming registered and operation side by side under
    separate labels, neither replacing the other.
inferences:
- inferred: The exact wording of each of the four unresolved-reason labels, each of
    the three named refusal sentences and the unrecognised-failure sentence.
  from: The specification states that each must be distinguishable from the others
    and describes what each names, but leaves the interface's own wording to the interface,
    exactly as the rules' own Home paragraphs state.
- inferred: A pending outcome renders a Drafting-the-connector-configuration line,
    rather than nothing.
  from: The sibling ConnectorTestPanelResult component's own convention of rendering
    an explicit pending line for its own pending outcome.
- inferred: The refusal sentence for openapi-document-not-fetched does not repeat the operator's
    own link value back to them; the openapi-operation-not-found sentence does state the path
    and method, per criterion 11's own requirement to disclose that pairing.
  from: The rule's own Description -- the link the fetch refusal echoes back is the
    operator's own input, standing in the field they typed it into. Corrected after the proof's
    own contested finding pointed out the original wording over-generalized this to the
    operation-not-found case, which criterion 11 requires disclosing.
- inferred: unresolvedReasonLabel falls back to the raw reason string for a value
    outside the four named ones, rather than a fixed generic sentence.
  from: The sibling hook's own ConnectorConfigurationDraftUnresolvedItem type declares
    reason as a plain string, not the closed literal union the backend value object
    holds, so nothing in this task's own reach validates the wire value against the
    four; the fallback is a defensive default, never a fifth domain fact.
- inferred: The visual form of the disclosure (a <pre> for the configuration text,
    <ul>/<li> lists keyed by name-derived composites, section labels, an aria-live="polite"
    wrapper, role="alert" for the refusal).
  from: Existing conventions in ConnectorTestPanelResult and CaseSimulationCaseResultPanel
    for <pre> blocks, keyed lists and role="alert" failure text.
preserved:
- The Configuration field's own content and its ConfigurationFieldState -- this task's
  component holds no reference to it at all.
- The existing Request Draft button's disabled-while-pending behavior and the three
  input fields, unchanged.
- The sibling hook's own clearing-on-dispatch behavior (mutation.reset() before each
  mutate call, deriving outcome fresh from mutation.status every render), which this
  task relies on rather than re-implements.
deferred:
- what: Whether a distinct visible retry affordance is needed beyond the existing
    Request Draft button.
  why: The same button that dispatched the refused request is left enabled once the
    outcome settles (it is disabled only while pending), so retrying is already reachable
    through it; adding a second, separate control is outside what this task's own
    criteria ask for.
---

## What it is

Everything the operator reads before deciding whether to apply. It states what the draft resolved and, by name and reason, what it could not, and states a refusal on its own terms when one arrives instead.

## Notes

None.
