---
title: Connector-configuration read responses answer configuration as a JSON string
summary: Proves that GET /v1/connectors/{connector} and GET /v1/connectors both answer
  configuration as the JSON string domain/integration/connector-configuration declares,
  and that parsing what either answers reproduces the same JSON value the connector
  was registered with.
implementation: sha256:40aed6c54db03474386fb36170f488c3851127603c1e154ba48dd00cf5bd7468
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-reads-connector-configuration-response-wire-type-suite-3
tests:
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers 200 with the connector and configuration fields exactly as currently
    held under the named connector
  proves: A GET /v1/connectors/{connector} response for a registered connector returns
    configuration as a JSON string, never a parsed object.
  fails_when: the controller answers configuration as anything other than JSON.stringify(configuration.configuration),
    including the plain object the registry holds internally
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: returns configuration as a JSON string, never a parsed object
  proves: A GET /v1/connectors/{connector} response for a registered connector returns
    configuration as a JSON string, never a parsed object.
  fails_when: the controller stops serializing and answers the registry's plain object
    directly, which Fastify would render as a JSON object rather than a string (typeof
    would be 'object', not 'string')
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers a configuration string that parses back to the same JSON value the
    connector was registered with
  proves: Parsing the returned configuration string reproduces the same JSON value
    the connector was registered with.
  fails_when: the projection stringifies incorrectly (drops a nested value, mishandles
    escaping, double-stringifies, or answers a string that is not the object own JSON.stringify
    output) so that JSON.parse of the response configuration field no longer deep-equals
    what was registered
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: answers a configuration string that parses back to an empty object when the
    connector was registered with no configuration keys at all
  proves: Parsing the returned configuration string reproduces the same JSON value
    the connector was registered with (the empty-object boundary).
  fails_when: the response's configuration for an empty held object is missing, not
    a string, or parses to anything other than an empty object
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: readConnectorConfigurationResponseSchema accepts the smallest string JSON.stringify()
    ever produces for an object
  proves: the implementation's own inference that the corrected response schema field
    is z.string().min(1) rather than a bare z.string() never rejects the smallest
    value the projection can actually produce
  fails_when: the schema minimum length is raised above 2 characters, or configuration
    is typed such that the smallest object string is refused
- file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  name: readConnectorConfigurationResponseSchema rejects an empty string as configuration
  proves: the implementation's own inference that the corrected response schema field
    is z.string().min(1) is actually enforced, not a bare z.string() that would accept
    an empty string
  fails_when: the schema's configuration field is loosened to a bare z.string() (or
    otherwise stops requiring at least one character)
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers 200 with every connector configuration the registry read resolved,
    each carrying its connector and configuration fields unchanged
  proves: A list-connector-configurations response returns every entry configuration
    as a JSON string, never a parsed object.
  fails_when: any entry configuration is not the JSON.stringify of the held object,
    including the plain object the registry holds internally
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers a data array whose single entry carries exactly the connector and
    configuration fields the domain model declares, unchanged from what the connector-configuration
    read resolved
  proves: A list-connector-configurations response returns every entry configuration
    as a JSON string, never a parsed object.
  fails_when: the same bug reappears for a single-entry page, with the entry configuration
    answering as the plain object rather than its JSON string
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers every entry configuration as a JSON string, never a parsed object
  proves: A list-connector-configurations response returns every entry configuration
    as a JSON string, never a parsed object.
  fails_when: any of the two returned entries answers configuration as a plain object
    rather than a string, including a regression that fixes only the first entry or
    only the single-read route
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: answers every entry configuration string parsing back to the same JSON value
    each connector was registered with
  proves: Parsing the returned configuration string reproduces the same JSON value
    the connector was registered with, across every entry of a list response.
  fails_when: any entry configuration string fails to parse, parses to a value that
    does not deep-equal what that connector was registered with, or the entries are
    reordered or misattributed during the per-entry projection
not_applicable:
- edge_case: an unregistered connector (the 404 not-found path)
  why: toReadConnectorConfigurationResponse is only ever reached once the resolution
    answers held true; the not-found branch is unchanged by this task and is already
    proven by the pre-existing 404 test in read-connector-configuration.routes.spec.ts
- edge_case: two reads of the same or different connector configurations at once
  why: the shared projection is a pure function with no shared mutable state, and
    no bound node states a concurrency guarantee for a read
- edge_case: the registry read dependency being slow, failing, or answering a malformed
    shape
  why: that dependency is a stood-in boundary at both routes, mirroring the established
    convention for this module; its own failure handling belongs to the already-delivered
    connector-configuration-registry service and route, not to this task's wire-projection
    fix
- edge_case: the write acknowledgment response on register-connector also answering
    configuration as a plain object
  why: outside this task's own files and criteria; the implementation record explicitly
    defers that identical divergence to a future task named at that file
- edge_case: an empty connector-configurations list
  why: an empty data array carries no configuration value to serialize, so it raises
    nothing for this task own criteria beyond what the pre-existing empty-page test
    already covers
- edge_case: a very large configuration payload
  why: no size-limit criterion exists in this task; how the underlying JSON functions
    behave on payload size is not something this task's criteria constrain
untested:
- a true end-to-end round trip through an actual write against a live, database-backed
  registry followed by a read whose returned string is parsed back is not exercised
  here. Both routes own registry read is stood in, so what these tests prove is that
  the real controller and DTO carry a given domain-shaped resolution onto the wire
  correctly. That the domain object itself survives an actual register-then-read against
  the real store unchanged is proven separately by the connector-configuration-registry
  service and factory specs already in this tree; the two proofs are not chained through
  one single live request.
---

## What it is

Proves the corrected wire shape of both connector-configuration read responses, plus two pre-existing route-level tests that asserted the prior object-shaped response (the exact defect this task corrects) fixed in place so the suite reflects the corrected wire contract rather than the bug.

## Notes

None.
