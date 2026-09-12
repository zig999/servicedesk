---
target: frontend
title: The draft-request act is gated on a named connector and a chosen operation -- proof
summary: Proves the five criteria of drafted-answer-disclosure/draft-request-gate and the invariant node
  they implement, whole, through one comprehensive rendering test; corrects the three pre-existing specs
  whose premise the new gate supersedes so each keeps proving what it always meant to prove.
implementation: sha256:757aa7e055c35dabdb39bc45d9b82524944e875a853a203c787cbed56bbd800a
run: run/drafted-answer-disclosure-draft-request-gate-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
  name: renders no act and states which precondition is missing for each way the gate can be unmet,
    and renders the enabled act once both stand
  proves: Criteria 1, 2, 3, 4 and 5, whole -- an empty connector name withholds the act and states it
    waits on a connector name; a whitespace-only connector name is treated the same as an empty one,
    per the node's own "neither empty nor whitespace alone" clause; a present connector name with no
    operation chosen withholds the act and states it waits on a chosen operation; and a present
    connector name with a chosen operation offers the act, enabled, withheld for neither reason.
  fails_when: any of the four rendered states stops matching what the gate requires -- the button
    renders (or fails to render) for the wrong precondition state, either message appears or fails to
    appear at the wrong time, a whitespace-only connector name is treated as a real name, or the button
    is offered absent or disabled once a connector name and a chosen operation both genuinely stand.
  demonstrates: rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: still renders the OpenAPI document link input and the Request Draft button, once the
    request-gate's own preconditions stand
  proves: (pre-existing, corrected) that spec's own criterion 7 -- the OpenAPI document link field and
    the draft-request control stay on the surface once the Operation Select is added. Corrected to
    render with a connector name and a chosen operation instead of the fully-ungated default state,
    since this task's criteria 1 and 2 now withhold the button under that default.
  fails_when: the link input or the Request Draft button stops rendering once a connector name is
    present and an operation stands chosen.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: issues no PUT request when Request Draft is clicked, even while Save itself is enabled
  proves: (pre-existing, corrected) that spec's own criterion 7 -- nothing the Configuration Helper
    section offers submits the surface's own form or invokes its save path. Corrected to choose an
    operation before clicking Request Draft, since this task's criterion 2 now withholds the act until
    one is chosen, and the test could not otherwise reach the button it means to click.
  fails_when: a PUT request is issued when Request Draft is clicked, once the connector name and the
    chosen operation the gate requires are both present.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: disables Request Draft once clicked, while the draft request is outstanding
  proves: (pre-existing, corrected) that spec's own disclosed inference -- Request Draft disables while
    its own request is outstanding and re-enables once it resolves. Corrected to set a connector name,
    fetch the document and choose an operation before exercising the button, since this task's criteria
    1 and 2 now withhold the button entirely until both stand.
  fails_when: the button fails to disable while its own draft request is outstanding, or fails to
    re-enable once the request resolves, once the gate's own preconditions are satisfied.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: re-enables Request Draft after a refused draft request, rather than leaving it disabled
  proves: (pre-existing, corrected) that spec's own disclosed inference -- Request Draft re-enables
    after a refused request rather than staying disabled. Corrected the same way as the sibling test
    above, for the same reason.
  fails_when: the button stays disabled after a refused draft request, once the gate's own
    preconditions are satisfied.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: never calls fetch with the operator's own link, only with the published draft route
  proves: (pre-existing, corrected -- found red on the first suite run, missed by the initial pass)
    that spec's own criterion -- constraints/the-openapi-document-is-fetched-by-the-backend. Corrected
    to set the Connector field and choose an operation before clicking Request Draft, since criteria 1
    and 2 now withhold the button until both stand.
  fails_when: the draft request stops going to the published draft route, or a request is made to the
    operator's own link, once the gate's own preconditions are satisfied.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: 'shared `offerDraft()` setup helper, used by 5 tests: opens a confirmation dialog and leaves
    the Configuration field untouched; keeps the Configuration field untouched when Keep editing is
    clicked; writes the draft''s configuration text once Apply is clicked in the dialog; applies the
    draft immediately when the Configuration field holds no unsubmitted edit; issues no PUT through
    the whole ask/decline/ask/confirm sequence'
  proves: (pre-existing, corrected -- found red on the first suite run, missed by the initial pass)
    the five create-screen apply-confirmation criteria this shared helper stages a draft for.
    Corrected the shared `offerDraft()` helper to fill the Connector field (when it stands empty,
    which is only true on the create screen; the detail screen's Connector field already holds a
    value and is left alone) before choosing the operation and clicking Request Draft, since criteria
    1 and 2 now withhold the button until both a connector name and a chosen operation stand.
  fails_when: any of the five apply-confirmation behaviors these tests stage through offerDraft()
    stops holding, once the gate's own preconditions are satisfied.
not_applicable:
- edge_case: Concurrent or overlapping draft requests changing gate state mid-render.
  why: The gate is a synchronous computation over already-resolved local state fields (state.connector,
    state.path, state.method); no criterion or node of this task addresses concurrency, and no async
    race exists in the gate itself to race against.
- edge_case: A dependency (network call, storage) failing or answering slowly.
  why: The gate reads no dependency of its own -- it derives entirely from state already handed to the
    component. The network calls elsewhere in this surface are pre-existing behavior this task does not
    touch.
- edge_case: An empty collection rendered in place of an item.
  why: No criterion or node of this task states a list obligation; the gate renders exactly one of
    three mutually exclusive branches (message, message, or button), never a collection.
- edge_case: A boundary at each end of a numeric range.
  why: The gate's inputs are strings, not a numeric range; the string-emptiness boundary the task
    actually turns on -- empty, whitespace-only, and non-empty -- is exactly what is tested.
untested:
- Which single message renders when both the connector name and the chosen operation are missing at
  once. The implementation's own inference record attributes the connector-missing message's priority
  in that case to the Connector field's position ahead of the Operation select in this component's
  markup -- an inference about arrangement, not a fact any criterion or the node states. Left unpinned
  by a test; a test over it would pin this arrangement rather than a stated obligation.
---

## What it is
The proof of the two-gate withholding and, where the gate closed a hole three pre-existing specs relied on, their setup corrected to satisfy the gate rather than to bypass it.

## Notes
None.
