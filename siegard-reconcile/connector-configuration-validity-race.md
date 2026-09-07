---
contract_version: siegard-reconcile/3
title: Review rebind over the connector-configuration-validity-race delivery's own files
summary: 'The one task of the connector-configuration-validity-race initiative, task/connector-configuration-validity-race/hook-computes-validity-before-ready,
  wrote these files: its implementation record names src/hooks/use-connector-configuration-detail.ts,
  and its proof names the validity spec beside it.'
target: frontend
files:
- path: src/hooks/use-connector-configuration-detail-validity.spec.ts
  change: written by the delivery of task/connector-configuration-validity-race/hook-computes-validity-before-ready
- path: src/hooks/use-connector-configuration-detail.ts
  change: Adds a syncedConfigurationData state tracking the last query.data object the hook derived validity
    from, and a guarded conditional that calls setConfigurationValid synchronously during render instead
    of inside the existing useEffect, so the corrected isValid is present in the very commit that first
    reports the ready phase.
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail.ts: held at the useQuery call for read-connector-configuration
    at lines 49-53 and the useMutation PUT call for register-connector at lines 76-87 — queryFn: () =>
    apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`) ... mutationFn:
    (values) => apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(values.connector)}`,
    { method: "PUT", ... })'
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: 'src/hooks/use-connector-configuration-detail.ts: held at the mutation body at lines 83-85 and
    the configuration state held as a string throughout, configurationValue and configurationBaseline
    — body: JSON.stringify({ configuration: getJsonTextareaMinifiedValue(configurationValue) })'
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: 'src/hooks/use-connector-configuration-detail.ts, isValidConfigurationObject (lines 14-21) and
    the submit guard at lines 119-124: return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    — The registry''s own well-formedness criteria — must parse as JSON, must be an object, neither null
    nor an array — is re-derived independently here to gate submission, rather than the hook simply submitting
    and surfacing the server''s own refusal. If the invariant''s definition ever changes at rules/integration/a-connector-configuration-holds-a-well-formed-object,
    a reader who updates only the specification has no reason to know this file also encodes the same
    test, and the two can silently diverge — the client accepting or rejecting something the registry
    no longer agrees with.'
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
unbound:
- src/hooks/use-connector-configuration-detail-validity.spec.ts
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-validity-race.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/integration/a-connector-configuration-holds-a-well-formed-object,
  domain/integration/connector-configuration were read on every file and answered for, and bound from
  nowhere here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 2 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-validity-race.returns/`, which are the evidence behind every entry above.
