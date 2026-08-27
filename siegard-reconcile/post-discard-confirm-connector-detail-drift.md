---
contract_version: siegard-reconcile/1
title: Post-discard-confirmation drift on use-connector-configuration-detail.ts
summary: commit 82be46a ("confirm before Discard resets form state on both detail screens")
  wrapped the JSON-textarea field's `onChange` handler in `useCallback` for referential
  stability, fixing an identity race between the load-detection effect and the new Discard
  confirmation Dialog's re-renders. The two statements inside the callback
  (`setConfigurationValue(value); setConfigurationValid(isValidConfigurationObject(value));`)
  are unchanged from before the wrap; this reconciliation is over that premise, stated correct
  by the human, not the useCallback change itself.
target: frontend
files:
- path: src/hooks/use-connector-configuration-detail.ts
  change: the JSON-field onChange handler is now a useCallback-stabilized function instead of
    an inline arrow; its body is unchanged
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: >-
    the query and mutation issue exactly the registry's read-connector-configuration and
    register-connector operations: apiFetch<ConnectorConfiguration>(`/v1/connectors/${encodeURIComponent(connector)}`)
    for the query, and the same route for the mutation's PUT — the contract states only the
    operation surface, which the file neither restates nor contradicts.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: >-
    the header comment states the hook tracks the record by its own identity: "connector
    is the record's own identity (domain/integration/connector-configuration), read by the
    caller from the route's own path param -- this hook issues its own GET for it ... rather
    than expecting an already-loaded record" — matching the node.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: >-
    isValidConfigurationObject re-derives the rule's own well-formedness test as an independent
    boolean rather than reading it from the rule:

    function isValidConfigurationObject(text: string): boolean {
      const minified = getJsonTextareaMinifiedValue(text);
      if (minified === null) { return false; }
      const parsed: unknown = JSON.parse(minified);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    }

    If the registry's definition of well-formed ever changes, this copy has no dependency on the
    rule text and would silently diverge from what the registry actually refuses — the same
    finding an earlier reconciliation (siegard-reconcile/frontend-use-connector-configuration-detail-drift.md)
    made against this same node in this same file, unresolved since: the intervening fix
    (commit 18cff5a, "reject non-object JSON in the connector-configuration validity check")
    changed which values the exclusion covers but did not change the re-derivation itself into a
    read of the rule.
  observed_at:
  - src/hooks/use-connector-configuration-detail.ts
notes: One delegation over this one file, handed the trace's own 3-node bound set (two of the
  three at an intact digest, unchanged by 82be46a; the third — this node — drifted by it) and no
  candidates. 2 of 3 clear. The third repeats a finding this same node and file already carried
  in siegard-reconcile/frontend-use-connector-configuration-detail-drift.md, whose own bind never
  wrote this node either — it has never been bound, and stays that way here.
---
