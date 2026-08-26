---
title: Test-connector's parse-then-derive path named for this task
summary: Confirms and documents that test-connector.controller.ts already derives its issued call's method,
  responseMap and statusMap from the registry's stored configuration text, parsed, rather than from an
  assumed-already-parsed object.
task: sha256:8e7de7bd4b97292d807a28a6a1d4692f070887ac2c323e36bfb87e288c9bdd5a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-test-connector-parses-stored-configuration-build
files:
- path: src/http/test-connector.controller.ts
  effect: 'resolveTestedConnectorConfiguration''s own doc comment now names this task explicitly, alongside
    the sibling task (configuration-held-as-text) it already cited, as what this file''s existing parse-then-derive
    behavior answers to — asHttpConnectorCallConfiguration derives method, responseMap and statusMap from
    exactly the object this function returns. No code path changed: the function already parsed the registry''s
    held JSON-text configuration through parsedConnectorConfiguration before returning it.'
criteria:
- criterion: Testing a registered connector configuration whose stored configuration is JSON text issues
    the call the configuration declares, deriving method, responseMap and statusMap from the parsed object.
  met: true
  how: handleTestConnectorRequest resolves the tested configuration through resolveTestedConnectorConfiguration,
    which reads the registry's held JSON-text configuration and parses it via connector-configuration-registry.service.ts's
    parsedConnectorConfiguration before returning the plain object. That object is passed to http-declarative-observation-source.adapter.ts's
    asHttpConnectorCallConfiguration, which derives method, responseMap and statusMap from it (refusing
    a departure through MalformedHttpConnectorConfigurationError), and the derived method plus the resolved
    request are what issueConnectorHttpCall issues. This full parse-then-derive path already existed as
    a direct consequence of the sibling task's implementation (delivery/backend-spec-conformance-corrections/implementation/connector-configuration-registration-conformance/configuration-held-as-text.md,
    whose own files list already names this exact function as changed to parse through parsedConnectorConfiguration
    "instead of reading resolution.configuration.configuration directly as an object"); this delivery's
    own contribution is naming this task in that code's own attribution comment.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/http/test-connector.controller.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  how: test-connector.controller.ts derives its issued call from the connector configuration's held JSON
    object text, parsed back to a plain object through parsedConnectorConfiguration, never from an assumed-already-parsed
    object — matching the node's "Its configuration is held and answered as JSON object text, whatever
    form a registration supplied it in" and its responsibility that what a configuration's keys mean is
    the executing connector's own statement, resolved here through the HTTP connector's own declared shape
    (method, responseMap, statusMap).
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: this task's own reach honors the rule rather than adding a new encoding of it — the well-formedness
    refusal remains the registry's own registration-time check (wellFormedConfiguration/textConfigurationOrThrow,
    unchanged), and parsedConnectorConfiguration's own isPlainObject guard is the defensive floor the
    sibling task's implementation record already disclosed as an inference over a persisted row this registry
    itself never writes malformed. This task's own contribution is confirming and naming that test-connector.controller.ts
    consumes that already-well-formed, already-parsed object rather than re-deriving or bypassing it.
inferences:
- inferred: this task's own criterion required no source-behavior change, because src/http/test-connector.controller.ts's
    resolveTestedConnectorConfiguration already parses the registry's held configuration text through
    parsedConnectorConfiguration and passes the resulting plain object to asHttpConnectorCallConfiguration,
    which already derives method, responseMap and statusMap from it.
  from: reading src/http/test-connector.controller.ts and src/investigation/http-declarative-observation-source.adapter.ts's
    own asHttpConnectorCallConfiguration, and the sibling task's own implementation record (delivery/backend-spec-conformance-corrections/implementation/connector-configuration-registration-conformance/configuration-held-as-text.md),
    whose files list already names this exact function as changed to parse through parsedConnectorConfiguration
    — exactly the behavior this task's own criterion states, anticipated by the inventory's own risk entry
    naming test-connector.controller.ts as one of three untouched-by-name consumers behavior 2's representation
    change would still have to reach.
- inferred: the one source change this delivery makes is limited to resolveTestedConnectorConfiguration's
    own doc comment, naming this task alongside the sibling task it already cited, rather than any change
    to a code path.
  from: the file's own established convention — every function in this module and its header comment already
    cite the tasks and specification nodes they answer to by identifier — applied to the fact this file
    now also answers to, not a departure from it.
preserved:
- test-connector.controller.ts's own capability-scoped refusal logic — resolveTestedCapability's CapabilityNotRegisteredForTestError
  and CapabilityConnectorMismatchError checks (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability)
  — untouched; this task's own Notes state that node sits outside this task's candidates.
- resolveTestedConnectorConfiguration's own ConnectorConfigurationNotFoundError refusal for an unregistered
  connector — untouched.
- the credential redaction (redactingEnv/REDACTED_CREDENTIAL_MARKER) and the raw request/response echo
  — untouched.
- handleTestConnectorRequest's own call sequence — resolve capability, resolve configuration, derive HTTP
  fields, build subject, resolve and issue the request — untouched.
---

## What it is

test-connector.controller.ts parses the connector configuration's stored text before deriving the call it issues.

## Notes

None.
