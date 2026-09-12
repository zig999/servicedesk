---
target: frontend
title: Gate the Configuration Helper's draft-request act on a named connector and a chosen operation
summary: The Request Draft control is now offered only while the Connector field holds a non-blank name
  and an operation stands chosen, stating in its place which of the two the request still waits on
  otherwise.
task: sha256:05a1160c5cdb4641273dfd0c429d5bc7a8235cecaae5098d0832cb33107e63af
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-draft-request-gate-build
files:
- path: src/hooks/use-connector-configuration-helper.ts
  effect: Adds an optional `connector` field to ConnectorConfigurationHelperState and returns the hook's
    own `connector` parameter under it, so the connector name the Helper was given reaches the
    presentation layer the same way path/method already do.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Computes connectorNameMissing (trim-based emptiness of state.connector) and operationMissing
    (the existing path === "" && method === "" check reused from selectedOperationValue), and replaces
    the unconditional "Request Draft" button with a three-way branch -- a waiting-on-connector message,
    a waiting-on-operation message, or the original button with its original pending-based disable --
    leaving every other section of the file untouched.
criteria:
- criterion: While the Connector field holds no non-empty connector name, no act requesting a draft is
    offered.
  met: true
  how: When connectorNameMissing is true the branch renders a <p> instead of the <Button>, so no
    draft-requesting control exists in the DOM at all.
- criterion: While no operation stands chosen from the fetched document's listing, no act requesting a
    draft is offered.
  met: true
  how: When the connector name is present but operationMissing is true (both state.path and state.method
    are ""), the branch again renders a <p> instead of the <Button>.
- criterion: While the connector name is missing, the surface states that the request waits on it, in
    the place the act would stand.
  met: true
  how: The first branch renders "The request waits on a connector name." in the exact flex container
    the button occupies.
- criterion: While the chosen operation is missing, the surface states that the request waits on it, in
    the place the act would stand.
  met: true
  how: The second branch renders "The request waits on a chosen operation." in that same container,
    reached only once the connector name is present.
- criterion: With a non-empty connector name and a chosen operation both standing, nothing here withholds
    the act.
  met: true
  how: The third branch renders the original <Button> unchanged, with only the pre-existing
    disabled={state.outcome.kind === "pending"} condition -- no new condition narrows it further.
nodes:
- node: rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/hooks/use-connector-configuration-helper.ts
  how: The invariant's clause -- the act offered only while the Connector field holds a connector name
    that is neither empty nor whitespace alone and an operation stands chosen, stating which of the two
    the request waits on otherwise -- is implemented exactly by the two gate booleans and the three-way
    branch; the Description's "whitespace alone holds no name" clause is implemented by the trim-based
    check rather than a raw length check.
inferences:
- inferred: 'Made `connector` an optional field (connector?: string) on ConnectorConfigurationHelperState
    rather than required.'
  from: The hook itself always supplies a real string (it already receives connector as its own
    parameter), but several existing spec files construct this same exported type as an object literal
    without a connector field; a required field would have broken their compilation, and touching test
    files is not this step's to do. Optional preserves compile-safety for existing fixtures while the
    real hook always populates it.
- inferred: Used a trim-based check, (state.connector ?? "").trim() === "", for connector-name emptiness.
  from: The task's own UNDERDETERMINED note plus the governing rule's Description ("a field holding
    whitespace alone holds no name"), and the existing project convention of .trim() !== "" seen
    elsewhere in the codebase.
- inferred: Withheld the act by not rendering the button at all when either gate fails, rather than
    rendering it disabled, replacing it with the waiting message in the same place.
  from: The criteria's own wording ("no act ... is offered") and the governing rule's Description, which
    cites an act whose outcome is already known on the surface as not offered to fail.
- inferred: When both the connector name and the operation are missing at once, only the
    connector-missing message is shown.
  from: The Connector field's actual position ahead of the Operation select in this same component.
preserved:
- The existing disabled={state.outcome.kind === "pending"} behavior on the "Request Draft" button once
  both new gates are satisfied.
- The Status readings, Response fields, Reading notes, Unresolved sections and their rendering logic,
  and the operations-read disclosure -- none of these were touched.
- The shape of the request onRequestDraft sends ({ link, path, method } via requestDraft) and every
  downstream refusal/unresolved-reason behavior described in the task's Notes -- untouched, since the
  gate now prevents the request from ever being sent under those conditions rather than changing what
  happens once it is sent.
deferred:
- what: The operations-read "outstanding" and "no document operation declared" statements.
  why: Explicitly out of scope per the task's own ADVISORY note -- the province of a sibling task.
- what: pt-BR wording for the two waiting messages.
  why: The task's own instruction states pt-BR wording is a separate sibling task's job; plain English
    strings used instead.
---

## What it is
The two gates on the Helper's own act, each naming what it waits on rather than leaving the control dead.

## Notes
Build round 1 green. Suite round 1 failed lint (render-result-naming-convention on the new proof spec,
fixed by destructuring `unmount`). Suite round 2 failed 6 tests across 2 spec files this task never
touched -- `connector-configuration-form-fields-configuration-helper.spec.ts` (1 test) and
`connector-configuration-form-fields-apply-confirmation.spec.ts` (5 tests, all sharing one
`offerDraft()` setup helper) -- each clicking "Request Draft" without first setting a connector name
and/or choosing an operation, which criteria 1 and 2 now correctly withhold. Fixed by adding the missing
setup (filling the Connector field where it stood empty, choosing the operation) to each, never by
weakening an assertion. Suite round 3 green.
