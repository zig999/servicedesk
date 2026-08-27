---
contract_version: siegard-reconcile/1
title: The HTTP connector's address/placeholder mechanism against its bound nodes
summary: >-
  No hand edit and no drift: this reconciliation was invoked to answer a question a
  case-simulation-frontend plan-work binder raised — whether an HTTP connector configuration's
  address and its ${kind[:argument]} placeholder mechanism (resolving subject, requester and
  credential values into address/query/headers/body) is a fact the specification already states
  somewhere the binder had not opened, or a real gap. The five files under src/http-connector/
  are unchanged since their last bind; every already-bound node was re-read for whether it still
  holds only what the file states.
target: backend
files:
  - path: src/http-connector/connector-call-descriptor.ts
    change: unchanged since its last bind; read to answer whether its bound nodes still hold only what it states
  - path: src/http-connector/connector-request-resolver.ts
    change: unchanged since its last bind; read to answer whether its bound nodes still hold only what it states
  - path: src/http-connector/response-path-extractor.ts
    change: unchanged since its last bind; read to answer whether its bound nodes still hold only what it states
  - path: src/http-connector/connector-http-issuer.ts
    change: unchanged; named in the same file set to check for a trace binding, which it does not carry
  - path: src/http-connector/http-connector-call-configuration.ts
    change: unchanged; named in the same file set to check for a trace binding, which it does not carry
nodes:
  - node: constraints/the-domain-depends-on-no-infrastructure
    conforms: true
    how: >-
      connector-call-descriptor.ts declares no import of any kind and connector-request-resolver.ts's
      own header comment states "This module sits entirely outside the domain layer — case
      behavior, investigation factory, evaluation, vocabulary — under its own http-connector/
      directory." Both hold exactly what this constraint requires.
    encoded_at:
      - src/http-connector/connector-call-descriptor.ts
      - src/http-connector/connector-request-resolver.ts
  - node: contracts/system/corporate-records
    conforms: true
    how: >-
      Neither file names a vendor or a fixed system shape; both stay generic to whichever
      connector supplied the opaque configuration, which is what this contract's own capability
      framing (an upstream system named by what it supplies, never a vendor name) holds.
    encoded_at:
      - src/http-connector/connector-call-descriptor.ts
      - src/http-connector/connector-request-resolver.ts
  - node: contracts/integration/concept-observation
    conforms: true
    how: >-
      "The pure translation step … turns a Subject's attribute-values, the collection's own
      requester identity, and a connector's own opaque call configuration into the concrete
      address, query, headers and body of one outbound HTTP request" — the file's own stated role
      matches this contract's observation-translation shape.
    encoded_at:
      - src/http-connector/connector-request-resolver.ts
  - node: contracts/integration/corporate-records-source
    conforms: true
    how: >-
      asConnectorCallDescriptor narrows a connector's own opaque configuration to a generic
      minimum descriptor, never a shape fixed to one named upstream system — consistent with what
      this contract holds.
    encoded_at:
      - src/http-connector/connector-request-resolver.ts
  - node: rules/investigation/collection-runs-in-the-requester-scope
    conforms: true
    how: >-
      "The requester identity travels through this exact same substitution mechanism as a
      Subject-drawn value … giving one connector's call a requester-scoped parameter is a change
      to that connector's own configuration alone, never a change to this module," backed by the
      REQUESTER_PLACEHOLDER_KIND branch resolving to context.requester.
    encoded_at:
      - src/http-connector/connector-request-resolver.ts
  - node: constraints/evidence-normalization-is-an-anticorruption-layer
    conforms: true
    how: >-
      "Given a mapping from a glossary-vocabulary field name to a path into the response body,
      this module reads each path and returns a flat object keyed exactly by the mapping's own
      field names — never by a name taken from the response's own structure."
    encoded_at:
      - src/http-connector/response-path-extractor.ts
  - node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
    conforms: true
    how: >-
      Same evidence as above — the extraction's own return is keyed by the glossary vocabulary
      the mapping supplies, never by the source response's own field names.
    encoded_at:
      - src/http-connector/response-path-extractor.ts
unbound:
  - src/http-connector/connector-http-issuer.ts
  - src/http-connector/http-connector-call-configuration.ts
notes: >-
  Every node the trace binds across this file set conforms — none is contradicted or restated
  differently. But all three judges independently surfaced the same silence, unprompted (none of
  it was in the candidate list any of them were given): connector-call-descriptor.ts and
  connector-request-resolver.ts both state that an HTTP connector's own call configuration
  declares an address (required) and may declare query, headers and body, each resolvable through
  a `${kind[:argument]}` placeholder mechanism naming subject, requester or credential — and
  neither this fact nor its placeholder syntax is stated by
  rules/integration/an-http-connector-configuration-declares-its-call, the node
  domain/integration/connector-configuration itself designates as the HTTP connector's own
  canonical statement of what its configuration's keys mean. That rule's own statement, confirmed
  by decision-log.md's entry for it, names exactly method, responseMap and statusMap and nothing
  else. This is not drift on any bound node — it is a fact the delivered code states that no node
  anywhere holds, discovered by three independent judges reading three different files bound to
  seven different nodes, none of which is
  rules/integration/an-http-connector-configuration-declares-its-call. The judgment was run in
  three delegations, one per named file with a trace binding (connector-call-descriptor.ts,
  connector-request-resolver.ts, response-path-extractor.ts); connector-http-issuer.ts and
  http-connector-call-configuration.ts carry no trace binding and were not judged.
---

## What it is

Reconciles the http-connector module's own intact bindings against a question raised while
planning `case-simulation-frontend`: whether the module's address/placeholder mechanism is a
fact the specification already states. Every bound node conforms; the placeholder/address fact
itself is unaddressed by any of them.

## Notes

None — the substantive account is in the frontmatter's own `notes` field, since this record's
finding is about a specification silence rather than a per-file detail this section would add.

