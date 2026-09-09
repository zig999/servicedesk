---
title: Registered-method comparison against the currently registered connector configuration
summary: Confirms registeredMethodMismatch names both methods upper-cased exactly
  where a live-read registered configuration's declared method disagrees (case-folded)
  with the operation's, states no mismatch in the three named absence/agreement cases,
  reads only from the registered text through a narrow injected reader with no capability
  parameter, leaves the registered configuration unchanged, and propagates rather
  than swallows a failing or malformed dependency read.
implementation: sha256:9a6e1ef9b81565ef0e663b32769601ffa270fa59b6fbab8028553b2ec3f3dc25
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-registered-method-comparison-suite
tests:
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: names registered GET and operation POST when a configuration registered under
    the connector name declares GET and the operation declares POST
  proves: Where a configuration registered under the connector name declares method
    GET and the operation declares POST, the draft's method_mismatch names registered
    GET and operation POST.
  fails_when: registeredMethodMismatch fails to build the mismatch, swaps the two
    fields, or fails to detect the disagreement.
  demonstrates: scenarios/integration/a-drafts-method-mismatches-what-is-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: states no method_mismatch when the operation's own method is the lower-case
    path-item key get and the registered configuration declares GET
  proves: Where a configuration registered under the connector name declares method
    GET and the operation's own method is the lower-case path-item key get, the draft
    states no method_mismatch, since the two are the same method once each is upper-cased.
  fails_when: the comparison compares the two values without folding case, reporting
    a mismatch where GET and get agree.
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: states no method_mismatch when the registered configuration's declared method
    upper-cased equals the operation's method upper-cased, whatever case either source
    gave it
  proves: Where the registered configuration's declared method, upper-cased, equals
    the operation's method upper-cased, the draft states no method_mismatch.
  fails_when: the comparison reports a mismatch even though the two values agree once
    each is upper-cased (tested with a pair distinct from the get/GET path-item-key
    convention, e.g. put vs PUT).
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: states no method_mismatch, whatever the operation method is, when no connector
    configuration is registered under the connector name
  proves: Where no connector configuration is registered under the connector name,
    the draft states no method_mismatch whatever the operation's method is.
  fails_when: registeredMethodMismatch attempts a comparison or reports a mismatch
    for an unregistered connector instead of returning undefined.
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: states no method_mismatch, whatever the operation method is, when the configuration
    registered under the connector name declares no method in its own text
  proves: Where the configuration registered under the connector name declares no
    method in its own text, the draft states no method_mismatch whatever the operation's
    method is.
  fails_when: the comparison invents a mismatch, throws, or otherwise reports something
    other than undefined when the registered text carries no method key.
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: reports both its registered and operation values upper-cased even where the
    registered configuration's own text and the operation's own spelling were both
    lower-case
  proves: A method_mismatch reports both its registered and operation values upper-cased,
    even where the registered configuration's own text or the operation's own document
    spelling was lower-case.
  fails_when: the mismatch object echoes either value in the lower case its source
    supplied, instead of upper-casing both unconditionally.
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: declares no capability parameter at all -- the registry, the connector name
    and the operation method are its whole signature
  proves: 'The comparison reads the method from the registered configuration''s own
    text rather than from any capability attribute -- proved structurally: the exported
    function''s public signature admits no fourth (capability) parameter through which
    one could arrive.'
  fails_when: a capability-shaped parameter is added to registeredMethodMismatch's
    public signature.
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: declares its registry dependency as exactly one function shaped like ConnectorConfigurationRegistryService.readConnectorConfiguration,
    never a wider capability-carrying object
  proves: 'Inference: The registry dependency is received as a narrow injected reader
    (a single readConnectorConfiguration function) rather than the module importing
    ConnectorConfigurationRegistryService directly or constructing one.'
  fails_when: RegisteredConnectorConfigurationReader widens to carry more than the
    one read method, or narrows to something no longer structurally satisfied by ConnectorConfigurationRegistryService's
    own readConnectorConfiguration.
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: answers according to whatever the registry currently holds rather than a snapshot
    resolved before the connector was registered
  proves: The comparison reads the configuration registered under that name live at
    generation time rather than from a copy held elsewhere.
  fails_when: the second call to registeredMethodMismatch (after the injected reader's
    answer changes) still reflects the first, stale resolution instead of the current
    one.
  demonstrates: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: leaves the configuration registered under the connector name unchanged after
    computing the comparison
  proves: The configuration registered under the connector name stands unchanged after
    the comparison. Also demonstrates scenarios/integration/a-drafts-method-mismatches-what-is-registered's
    then-clause the currently registered connector configuration is unchanged, exercised
    against the real ConnectorConfigurationRegistryService rather than a stand-in
    reader.
  fails_when: the registered configuration read back after the comparison differs
    from what was registered before it, i.e. the comparison performed a write.
  demonstrates: scenarios/integration/a-drafts-method-mismatches-what-is-registered
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: treats a method key present in the registered text but holding a non-string
    value the same as no method being declared
  proves: 'Inference: A method key present in the registered configuration''s parsed
    text but holding a non-string value is treated the same as the key being absent
    -- no method declared, hence no mismatch -- rather than being coerced or compared
    as-is.'
  fails_when: a non-string method value is coerced to a string and compared, or otherwise
    yields a mismatch instead of undefined.
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: propagates a failure the injected reader itself raises, rather than swallowing
    it
  proves: an edge case this task's behavior raises -- a dependency (the injected registry
    reader) that fails is surfaced to the caller rather than swallowed into an undefined
    mismatch.
  fails_when: registeredMethodMismatch catches the reader's rejection and resolves
    to undefined (or anything other than the propagated rejection) instead of letting
    it reach the caller.
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  name: propagates ConnectorConfigurationNotWellFormedError when the currently registered
    configuration's own text does not parse to a JSON object, rather than treating
    it as declaring no method
  proves: an edge case this task's behavior raises -- a dependency (the registered
    configuration's own text) answering in a shape the reused parsedConnectorConfiguration
    helper refuses is surfaced through that helper's own existing error rather than
    silently read as no method declared.
  fails_when: a malformed registered configuration's parse failure is caught and treated
    as an absent method (returning undefined) instead of propagating ConnectorConfigurationNotWellFormedError.
not_applicable:
- edge_case: An empty-string connector name
  why: The module performs no validation of its own on the connector argument; it
    forwards to the injected reader exactly as any other name, and an empty string
    that resolves to not registered already runs the same code path the no connector
    configuration is registered test exercises. A dedicated test would re-prove that
    same criterion under a different literal rather than a new one.
- edge_case: A boundary at each end of a numeric range
  why: Nothing in this task's criteria or the rule it implements involves a range,
    a count or a limit.
- edge_case: A duplicate where uniqueness is claimed
  why: Nothing in this task's scope claims uniqueness over anything; the function
    reads one configuration for one connector name and compares one pair of methods.
- edge_case: An operation attempted against state that forbids it
  why: The comparison is a pure read-only computation with no write and no state transition
    of its own to forbid; the one write path in this area (register-connector) belongs
    to a different, already-tested module and this task never calls it.
- edge_case: An empty collection returned where one is expected
  why: registeredMethodMismatch never returns a collection; it returns either a single
    ConnectorConfigurationDraftMethodMismatch object or undefined.
- edge_case: Two operations against one subject at once
  why: The function holds no shared mutable state and performs no write, so two concurrent
    calls each read and compute independently; there is nothing for them to conflict
    over.
untested:
- How the real ConnectorConfigurationRegistryService.readConnectorConfiguration is
  actually wired into registeredMethodMismatch's registry parameter in production
  (the factory or draft-generation call site) is not this task's file and is not exercised
  here; the leaves the configuration unchanged test uses the real service directly
  as the injected reader to prove the module's own read-only contract, but the wiring
  itself belongs to whichever task composes the full draft.
---

## What it is

Proof of the one registry read the draft performs and the disclosure of a disagreement it never resolves.

## Notes

None.
