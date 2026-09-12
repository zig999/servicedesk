---
contract_version: siegard-reconcile/5
title: Subject placeholder input_schema match removal — reconciliation premise
summary: All five files were written by task/subject-placeholder-input-schema-match-removal/resolve-regardless-of-input-schema
  under the subject-placeholder-input-schema-match-removal initiative, correcting the subject-placeholder
  resolver and its closed reason vocabulary to stop requiring an input_schema name match, and updating
  the three pre-existing spec files that asserted the retired behavior.
target: backend
files:
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  change: written by the delivery of task/subject-placeholder-input-schema-match-removal/resolve-regardless-of-input-schema
- path: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  change: written by the delivery of task/subject-placeholder-input-schema-match-removal/resolve-regardless-of-input-schema
- path: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  change: written by the delivery of task/subject-placeholder-input-schema-match-removal/resolve-regardless-of-input-schema
- path: src/connector-registry/connector-configuration-draft.ts
  change: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS now holds the three-value closed set the domain
    node states (no-capability-registered, security-scheme-not-reducible-to-a-credential, drafted-key-occupied-by-another-security-scheme);
    'no-matching-input-schema-property' is no longer a member of ConnectorConfigurationDraftUnresolvedReason.
- path: src/connector-registry/subject-placeholder-resolution.ts
  change: outcomeFor() now returns a resolved ${subject:<name>} outcome for any name whenever the connector
    has at least one capability registered, and no-capability-registered otherwise; no longer inspects
    any capability's input_schema properties. The now-unused declaredInputSchemaShape import and the NO_MATCHING_INPUT_SCHEMA_PROPERTY
    constant are removed.
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: 'src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts, lines 93-101, the
    test asserting the domain module carries no import statement at all: const importSpecifiers = [...source.matchAll(/(?:from|import)\s*\(?\s*[''"]([^''"]+)[''"]/g)];

    expect(importSpecifiers).toEqual([]); — The constraint this test claims to guard permits infrastructure
    to reach the domain "only through ports" — it audits for a framework, a driver or a provider-client
    package, not for the presence of any import whatsoever. This test instead fails on any import at all,
    including a legitimate port-type or domain-to-domain type import the specification would allow; a
    future, conformant change that imports such a type into this file would be rejected by a test stricter
    than the rule it names.'
  observed_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraft\
    \ type declaration, lines 25-31 — export type ConnectorConfigurationDraft = {\n  readonly connector:\
    \ string;\n  readonly configuration: string;\n  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];\n\
    \  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];\n  readonly\
    \ method_mismatch?: ConnectorConfigurationDraftMethodMismatch;\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-generated-credential
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftGeneratedCredential\
    \ type declaration, lines 15-18 — export type ConnectorConfigurationDraftGeneratedCredential = {\n\
    \  readonly name: string;\n  readonly security_scheme: string;\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-method-mismatch
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftMethodMismatch\
    \ type declaration, lines 20-23 — export type ConnectorConfigurationDraftMethodMismatch = {\n  readonly\
    \ registered: string;\n  readonly operation: string;\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-unresolved-item
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftUnresolvedItem\
    \ type declaration, lines 10-13 — export type ConnectorConfigurationDraftUnresolvedItem = {\n  readonly\
    \ name: string;\n  readonly reason: ConnectorConfigurationDraftUnresolvedReason;\n};\nsrc/connector-registry/subject-placeholder-resolution.ts:\
    \ held at the object literal built in unresolvedItems(), around line 81 — items.push({ name, reason:\
    \ outcome.reason });"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/subject-placeholder-resolution.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a draft over an operation whose security scheme the draft cannot honestly
    turn into a placeholder — against one expected result: one unresolved item naming that scheme by the
    name the OpenAPI document itself gives it, paired with the reason it went unresolved, asserted by
    exact equality as the three existing tests assert the parameter and request-body items.'
- node: domain/integration/connector-configuration-draft-unresolved-reason
  conforms: false
  how: 'src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts, line 27, the test
    title `it(''refuses an unresolved item whose reason is not one of the four vocabulary values'', ...)`:
    it(''refuses an unresolved item whose reason is not one of the four vocabulary values'', () => { —
    A reader who trusts this title for the size of the vocabulary comes away believing it has four members;
    the node that owns the enumeration holds exactly three (no-capability-registered, security-scheme-not-reducible-to-a-credential,
    drafted-key-occupied-by-another-security-scheme), and this very file''s own `expected` array two tests
    above (lines 18-22) is built from those same three values. The label on the test that exists to guard
    the vocabulary misstates the vocabulary it guards — a stale count left behind by the recent removal
    of the fourth, now-retired reason (no-matching-input-schema-property).'
  observed_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/subject-placeholder-resolution.ts
- node: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  conforms: true
  how: "src/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor(), lines 64-68 —\
    \ function outcomeFor(name: string, registered: readonly RegisteredCapabilityForPlaceholderCheck[]):\
    \ NameOutcome {\n  return registered.length === 0\n    ? { resolved: false, reason: NO_CAPABILITY_REGISTERED\
    \ }\n    : { resolved: true, value: `\\${${SUBJECT_PLACEHOLDER_KIND}:${name}}` };\n}"
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: 'src/connector-registry/subject-placeholder-resolution.ts: held at the four placements assembled
    in resolveSubjectPlaceholders(), lines 41-47, and the cookie join in cookieHeaderValue(), lines 127-138
    — path: substitutedPath(path, parameters, outcomes),

    query: recordFor(parameters, ''query'', outcomes),

    headers: headersWithCookie(parameters, outcomes),

    body: recordForNames(requestBodyFieldNames, outcomes),'
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
- node: scenarios/integration/a-mismatched-parameter-name-resolves-regardless
  conforms: true
  how: "src/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor(), lines 64-68 —\
    \ the only test applied is registered.length === 0, no input-schema property name is ever consulted\
    \ — return registered.length === 0\n  ? { resolved: false, reason: NO_CAPABILITY_REGISTERED }\n  :\
    \ { resolved: true, value: `\\${${SUBJECT_PLACEHOLDER_KIND}:${name}}` };"
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result: with capability read-invoices registered naming
    connector erp-http and its input schema properties holding only customer_id, generate a connector
    configuration draft for erp-http from the operation GET /customers/{customerId}/invoices, and assert
    the draft''s configuration carries /customers/${subject:customerId}/invoices — the placeholder at
    customerId''s own path position — and that no item of the draft''s unresolved list names customerId.'
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  conforms: true
  how: "src/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor() together with positionValue()'s\
    \ fallback, lines 64-72, and unresolvedItems(), lines 75-85 — function positionValue(name: string,\
    \ outcomes: ReadonlyMap<string, NameOutcome>): string {\n  const outcome = outcomes.get(name);\n \
    \ return outcome !== undefined && outcome.resolved ? outcome.value : `{${name}}`;\n}"
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
unbound:
- src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
notes: 'Judged by 5 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/subject-placeholder-input-schema-match-removal.returns/.

  Certification of scenarios/integration/a-mismatched-parameter-name-resolves-regardless did not hold:
  the auditor answered `partial` — The mismatch half of the fact is exercised: with erp-http''s one registered
  capability holding only customer_id, the named test asserts customerId resolves to ${subject:customerId}
  and that customerId is named in no unresolved item, so a return to requiring an exact input-schema name
  match would fail it. Two stated parts go unexercised. First, the scenario''s "when" is that a connector
  configuration draft is generated for connector erp-http from that operation, and its "then" speaks of
  the draft''s configuration and the draft''s unresolved list; nothing in the offered proof generates
  a draft — every test calls resolveSubjectPlaceholders directly with an injected capabilities reader,
  so a draft generator that dropped, re-filtered or re-wrote the resolved placement (for instance by re-applying
  an input-schema name check of its own before embedding) would leave the whole file passing while the
  fact stopped holding. Second, the scenario''s position is customerId''s own position inside the path
  GET /customers/{customerId}/invoices; the mismatch test places customerId as a query key, and the path-position
  test uses order_id, a name the capability''s schema does match. No test in the set puts a mismatched
  name at a path position, so "${subject:customerId} at customerId''s own position" in /customers/{customerId}/invoices
  is asserted nowhere.. The node is decided by reading, and a certification standing on it from an earlier
  reconciliation is released by the bind. The remainder is testable: One input against one expected result:
  with capability read-invoices registered naming connector erp-http and its input schema properties holding
  only customer_id, generate a connector configuration draft for erp-http from the operation GET /customers/{customerId}/invoices,
  and assert the draft''s configuration carries /customers/${subject:customerId}/invoices — the placeholder
  at customerId''s own path position — and that no item of the draft''s unresolved list names customerId..

  Certification of domain/integration/connector-configuration-draft-unresolved-item did not hold: the
  auditor answered `partial` — The parameter and request-body halves of the item are exercised whole:
  the three tests assert unresolved entries by exact equality as a name paired with a reason, so an item
  that lost either required attribute, or that carried a reason not paired to the name that earned it,
  would fail them; "the name exactly as the OpenAPI document itself gives it" is exercised by the camelCase
  `orderId` case, which would fail if the name were normalised on its way into the item. The security-scheme
  half goes entirely unexercised — the resolver the whole file drives (`resolveSubjectPlaceholders`) accepts
  only `path`, `parameters` and `requestBodyFieldNames`, so no input in the set can name a security scheme,
  and nothing here could fail if a draft stopped naming an unresolvable security scheme, or named one
  by a mangled name or with no reason. Whatever produces that item, if anything does, is proven only by
  a test outside the offered proof.. The node is decided by reading, and a certification standing on it
  from an earlier reconciliation is released by the bind. The remainder is testable: One input — a draft
  over an operation whose security scheme the draft cannot honestly turn into a placeholder — against
  one expected result: one unresolved item naming that scheme by the name the OpenAPI document itself
  gives it, paired with the reason it went unresolved, asserted by exact equality as the three existing
  tests assert the parameter and request-body items..

  Certification of domain/integration/connector-configuration-draft-unresolved-reason did not hold: the
  auditor answered `partial` — The closure of the value set is exercised: the first test compares the
  exported vocabulary, sorted, against the three literals the node enumerates, so it fails if a fourth
  reason is added, one is removed, or one is spelled differently. What goes unexercised is the meaning
  the node states for each value — that `no-capability-registered` names the circumstance that no capability
  is currently registered naming the connector the draft is generated for, that `security-scheme-not-reducible-to-a-credential`
  names an operation security scheme the connector configuration''s own ${credential:<name>} mechanism
  cannot reduce to a single value, and that `drafted-key-occupied-by-another-security-scheme` names a
  query or headers key already held by another security scheme the same operation requires. Nothing in
  the offered proof produces a draft under any of those three circumstances and asserts which reason the
  draft carries, so all three could be mapped to the wrong circumstance, or one circumstance left producing
  no unresolved item at all, and every test in the file would still pass. Two further facts a reader of
  the file needs: the test named "refuses an unresolved item whose reason is not one of the four vocabulary
  values" carries no assertion — it binds a value to a type and discards it with `void invalid` — so it
  cannot fail when run as a test, and its own title says "four" where the node enumerates three; and the
  type-level tests in this file, including "declares an unresolved item as exactly a name and a single
  reason", assert nothing at runtime, so they bear on this node only under a typecheck-enabled run of
  the `test` step, which the pack does not establish. Separately, the test "exports no runtime guard function
  alongside the closed vocabulary" asserts the module''s exported key list is exactly one entry — a totality
  over the module that this node does not state, and that breaks the day the same module legitimately
  exports something beside the vocabulary.. The node is decided by reading, and a certification standing
  on it from an earlier reconciliation is released by the bind. The remainder is testable: The three circumstances
  the node names are a closed, finite set, so the remainder is one input per value against one expected
  result: generate a draft for a connector no registered capability names, and expect the unresolved item''s
  reason to be `no-capability-registered`; generate a draft for an operation whose security scheme the
  ${credential:<name>} mechanism cannot reduce to a single value, and expect `security-scheme-not-reducible-to-a-credential`;
  generate a draft for an operation where a required security scheme already holds the query or headers
  key the drafted parameter, or the other security scheme, would have occupied, and expect `drafted-key-occupied-by-another-security-scheme`.
  A test asserting a bare string is rejected as a reason must assert it at runtime, or the run must be
  typecheck-enabled, for the closure to be exercised anywhere other than the vocabulary array itself..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/integration/connector-configuration-draft-unresolved-item,
  domain/integration/connector-configuration-draft-unresolved-reason, rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability,
  scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved, scenarios/integration/a-mismatched-parameter-name-resolves-regardless
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 7 opened across 2 of 5 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/subject-placeholder-input-schema-match-removal.returns/`, which are the evidence behind every entry above.
