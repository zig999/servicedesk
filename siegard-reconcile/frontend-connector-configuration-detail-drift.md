---
contract_version: siegard-reconcile/1
title: Frontend first sweep — connector-configuration-detail-ready-view.tsx
summary: Same premise as frontend-first-sweep-clean.md, reconciled separately because this file's own
  judge returned a finding on a node also bound cleanly to other files in that batch.
target: frontend
files:
- path: src/routes/connector-configuration-detail-ready-view.tsx
  change: never reconciled
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: wires state.onSubmit into the form fields without restating the registry's own operations.
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: domain/integration/connector-configuration
  conforms: true
  how: consumes state.configuration.isValid without restating the value object's own attributes.
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: INVALID_CONFIGURATION_WARNING reads "This connector configuration's stored value is not valid JSON.
    Correct it before Save can succeed." The node's own text distinguishes two failure kinds — unparsable
    text, and syntactically valid JSON that is not an object (a null value or an array). A person who
    typed a JSON array or bare null holds syntactically valid JSON by the node's own account, so the banner's
    claim is false for that case and gives no path to the actual correction (the value must be an object).
  observed_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
notes: One delegation over this one file, handed its own 3-node trace-bound set plus the batch candidate
  union. 2 of 3 clear.
---
