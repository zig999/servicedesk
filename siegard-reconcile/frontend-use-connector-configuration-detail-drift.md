---
contract_version: siegard-reconcile/1
title: Frontend first sweep — use-connector-configuration-detail.ts
summary: Same premise as frontend-first-sweep-clean.md, reconciled separately because this file's own
  judge returned a finding on a node also bound cleanly to other files in that batch.
target: frontend
files:
- path: src/hooks/use-connector-configuration-detail.ts
  change: never reconciled
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: the query and mutation exercise exactly read-connector-configuration and register-connector.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: tracks connector/configuration, held and sent as JSON object text, matching the node.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: isValidConfigurationObject re-derives the node's own null/array exclusion as an independent boolean
    (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)), then gates submission on
    it — a second, unlinked home for the fact the node states. If the rule's definition of well-formed
    ever changes, this copy has no dependency on the rule text and would silently diverge from what the
    registry actually refuses.
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
notes: One delegation over this one file, handed its own 3-node trace-bound set plus the batch candidate
  union. 2 of 3 clear.
---
