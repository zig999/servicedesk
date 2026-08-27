---
contract_version: siegard-reconcile/1
title: 'connector-configuration-detail-ready-view.tsx: 2 bindings stale from the warning-text delivery'
summary: 'A corrective delivery this session (connector-configuration-warning-text/warning-states-the-object-requirement)
  rewrote this file to fix one warning message''s wording only. A bind restamps only the nodes its own
  delivery record names, so the file''s other 2 bindings — for the registry contract and the connector-configuration
  value object, neither of which the warning-text fix touched — went stale as a side effect. The human
  states the file is correct: nothing about the API surface it composes or the connector/configuration
  shape it types through changed.'
target: frontend
files:
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: INVALID_CONFIGURATION_WARNING's text changed from claiming the value "is not valid JSON" to
    stating it "must be a JSON object"; everything else — the composed form fields, the test panel, the
    discard-confirmation dialog, and the props shape — is unchanged
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: the file names no operation, endpoint or API shape at all — it renders form fields and a test panel
    driven entirely by state, produced outside this file, so it holds nothing of this contract to diverge
    from
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: domain/integration/connector-configuration
  conforms: true
  how: 'the props type''s readonly connector: string types through the value object''s own connector attribute
    rather than restating a fact about it'
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: this file's own binding to this node is not stale — it was freshly written today by delivery/frontend-spec-conformance-corrections/implementation/connector-configuration-warning-text/warning-states-the-object-requirement.md's
    own bind, backed by that delivery's independent proof (delivery/frontend-spec-conformance-corrections/proof/connector-configuration-warning-text/warning-states-the-object-requirement.md).
    Named here only because the trace binds this file to it and this record must answer for every node
    a named file carries, not because a fresh reading ran; no new judgment was made.
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
notes: One delegation, over the one named file, judged against the 2 nodes the trace's own drift report
  named as stale on this file. rules/integration/a-connector-configuration-holds-a-well-formed-object,
  also bound to this file, was not part of that delegation's judgment — it is not stale, having been freshly
  bound today by this session's own warning-text delivery and its independent proof — and is carried in
  this record's nodes only because the bind form requires every node a named file answers to be accounted
  for; its how cites that prior delivery rather than a fresh reading. Both delegated nodes cleared.
---

## What it is

Reconciles the 2 bindings on connector-configuration-detail-ready-view.tsx that this session's
own warning-text corrective delivery left stale, as a side effect of restamping only the node its
own record named.

## Notes

None.
