---
title: Proof for refusing register-connector when a placeholder escapes every capability's properties
summary: Tests proving that registerConnector refuses a connector-configuration registration or edit embedding
  an orphaned Subject-attribute placeholder, names it with the failing capabilities, exempts requester/credential
  placeholders, succeeds once any capability declares the attribute, and holds edits to the same refusal
  — all traced to the HTTP 422 envelope.
implementation: sha256:8712ff780939c885fe02822d0c14488aaa0301aa1f86c2c9fb0b712240e65024
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-refuse-connector-registration-with-orphaned-placeholder-suite-2
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose call text embeds a Subject-attribute placeholder no capability currently
    registered against that connector declares, as ConnectorPlaceholderOutsideInputSchemaError
  proves: Registering a connector configuration whose call text embeds a placeholder naming a Subject
    attribute that no capability currently registered against that connector's name declares in properties
    is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
  fails_when: registerConnector stops throwing ConnectorPlaceholderOutsideInputSchemaError for this configuration,
    or throws a different class
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for an orphaned placeholder
  proves: the refusal happens before any store write, the same before-write discipline every other refusal
    in this registry already holds
  fails_when: a write reaches the store despite the orphaned-placeholder refusal
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ConnectorPlaceholderOutsideInputSchemaError to 422
  proves: the transport-status half of criterion 1
  fails_when: statusForError stops mapping ConnectorPlaceholderOutsideInputSchemaError to 422
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError, naming
    every orphaned placeholder together with the capability that fails to declare it
  proves: the whole wire behavior of criteria 1 and 2 together — the route answers 422 with the error's
    own code and its context as details
  fails_when: the route answers anything but 422, or the response body's code or details stop matching
    the thrown error's own name and context
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names the orphaned placeholder together with the capability that fails to declare it
  proves: The refusal names every such orphaned placeholder together with the capability that fails to
    declare it.
  fails_when: the refusal's context.orphaned stops carrying the placeholder paired with the failing capability
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names both orphaned placeholders together when the call text embeds two the capability does not
    declare
  proves: the "every" half of criterion 2, over more than one orphaned placeholder in one registration
  fails_when: one of the two orphaned placeholders is dropped from context.orphaned, or the two are refused
    separately instead of together
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names every capability that fails to declare the placeholder, when more than one is registered
    against the connector and none declares it
  proves: the refusal's own capabilities list is exhaustive over every capability that fails to declare
    the placeholder, not just the first found
  fails_when: context.orphaned names only one of the two failing capabilities instead of both
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names one orphaned placeholder once, not once per occurrence, when the call text embeds it more
    than once
  proves: orphanedAcrossEveryCapability's own intersection is computed over the set of distinct placeholder
    names, so a repeated occurrence in the call text is named once
  fails_when: context.orphaned carries two entries for the one repeated placeholder instead of one
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names a failing capability by exactly the connector and input_schema attributes the reader answered,
    adding no wider identity of its own
  proves: the implementation's inference that a capability that fails to declare an orphaned placeholder
    is named by connector and input_schema, never by a wider identity
  fails_when: a failing capability entry gains a name or version attribute, or drops connector or input_schema
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds when at least one capability registered against the connector declares the placeholder
    attribute, even though another fails to
  proves: Registering the same connector configuration when at least one capability currently registered
    against that connector's name declares the placeholder's attribute in properties succeeds.
  fails_when: registerConnector throws ConnectorPlaceholderOutsideInputSchemaError even though one of
    the two capabilities declares the attribute
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: never refuses a placeholder naming the requester or a credential, even though the registered capability
    declares no properties at all
  proves: A placeholder naming the requester or a credential is never checked against any capability's
    properties by this refusal.
  fails_when: registerConnector throws over a requester or credential placeholder, or a capability declaring
    no properties is treated as failing to declare one
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: holds an edit of an already-registered connector configuration to the same orphaned-placeholder
    refusal as a new registration, leaving the previously held configuration untouched
  proves: Editing an existing connector configuration is held to the same refusal as registering a new
    one.
  fails_when: an edit of an already-registered connector configuration is not refused for the same orphaned
    placeholder a new registration would be refused for, or the previously held configuration is overwritten
    despite the refusal
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds regardless of an embedded orphaned-looking placeholder when no capability at all is currently
    registered
  proves: the implementation's inference that a connector no capability currently names is never refused
    over this check at all
  fails_when: registerConnector throws ConnectorPlaceholderOutsideInputSchemaError even though the capabilities
    reader answers no capability at all
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds regardless of an embedded orphaned-looking placeholder when every currently registered
    capability names a different connector
  proves: the same inference, over a capabilities reader that answers capabilities but none against this
    connector's own name
  fails_when: registerConnector throws even though every registered capability names a different connector
    than the one being configured
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds regardless of an embedded orphaned-looking placeholder when constructed with the default
    (no) capabilities reader
  proves: the preserved behavior that registerConnector constructed with the default (no) capabilities
    reader keeps succeeding, since the default answers an empty capability list
  fails_when: a construction with no capabilities reader starts refusing a configuration over an embedded
    placeholder
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses configuration text that is not syntactically valid JSON as ConnectorConfigurationNotWellFormedError,
    even though the same text would also embed an orphaned placeholder
  proves: the well-formedness half of the ordering inference — the orphaned-placeholder refusal runs after
    completeness and well-formedness checks
  fails_when: a malformed configuration that would also embed an orphaned placeholder is refused as ConnectorPlaceholderOutsideInputSchemaError
    instead of ConnectorConfigurationNotWellFormedError
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds without any orphaned-placeholder refusal when the call text embeds no placeholder at
    all
  proves: the check activates only over an actually-embedded placeholder
  fails_when: registerConnector starts refusing a registration that embeds no placeholder at all
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: propagates a failure the capabilities reader itself raises while checking for an orphaned placeholder,
    rather than swallowing it
  proves: a dependency failure during this check is not swallowed into a false success or a wrong refusal
  fails_when: the capabilities reader's own thrown error is caught, hidden, or replaced by a different
    error
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header comment names seven specification nodes that now fix a status as a decided fact, and
    states ConnectorConfigurationNotWellFormedError's 422 and SubjectDoesNotCoverCaseInputsError's 422
    and ConnectorPlaceholderOutsideInputSchemaError's 422 as facts their own rules decide rather than
    as this project's own engineering decision
  proves: status-map.ts's header comment correctly narrates ConnectorPlaceholderOutsideInputSchemaError's
    HTTP 422 as a fact rules/integration/a-connector-placeholder-is-declared-by-its-capability decides,
    and that the running count of specification-fixed statuses is now seven
  fails_when: the header comment still reads six instead of seven, omits ConnectorPlaceholderOutsideInputSchemaError's
    HTTP 422 citation, or drops the closing statement that every other entry's status is this project's
    own engineering decision
untested:
- the ordering guarantee that this refusal runs after the completeness check specifically (an undeclared
  connector name) is not independently tested beyond the well-formedness ordering test, because with an
  undeclared connector no capability can ever match it under either ordering — the two orderings produce
  the identical observable outcome, so a test asserting that specific combination could not fail when
  the ordering was wrong and would not be evidence of anything.
not_applicable:
- edge_case: two registerConnector calls against the same connector at once
  why: no bound node states concurrent behavior for this registry, and asserting one would claim a guarantee
    nobody made
- edge_case: a dependency (the capabilities reader) answering slowly rather than failing outright
  why: this is a pure, in-memory reconciliation with no timeout or latency concept of its own
- edge_case: a numeric boundary in the placeholder count or the capability count
  why: neither this task's criteria nor the rule it implements state a bound on how many placeholders
    or capabilities this check reconciles
- edge_case: a capability whose own input_schema is malformed or unparsable, reaching this check through
    registerConnector
  why: orphanedAcrossEveryCapability adds no logic of its own over a malformed schema — it calls orphanedPlaceholders
    unchanged — and that function's own defensive posture is already proved directly by connector-placeholder-declaration-check.spec.ts.
---

## What it is
Tests proving that registerConnector refuses a connector-configuration registration or edit embedding an orphaned Subject-attribute placeholder, names it with the failing capabilities, exempts requester/credential placeholders, succeeds once any capability declares the attribute, and holds edits to the same refusal — all traced to the HTTP 422 envelope.

## Notes
The first suite attempt (run/connector-configuration-and-placeholder-contract-refuse-connector-registration-with-orphaned-placeholder-suite) failed on a pre-existing test in status-map.spec.ts whose literal count ("six") went stale the moment this task's own legitimate addition (the seventh specification-fixed status citation) landed — fixed by test-author, since the file was already this task's own test-author's to touch. Second suite attempt (recorded above) passed.
