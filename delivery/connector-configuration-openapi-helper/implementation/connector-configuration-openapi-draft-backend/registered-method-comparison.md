---
title: Registered-method comparison for a connector configuration draft
summary: A pure comparison function reads the connector configuration currently registered
  under a name live through an injected reader, folds case to compare its declared
  method against the drafted operation's method, and returns a method_mismatch naming
  both upper-cased only where the two genuinely disagree.
task: sha256:a14e31215c2863e1802612deee6f2047bff7a664b9ec1923479abb102b9fa79f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-registered-method-comparison-build
files:
- path: src/connector-registry/registered-method-comparison.ts
  effect: 'New module exporting registeredMethodMismatch(registry, connector, operationMethod):
    reads the configuration currently registered under `connector` through the injected
    RegisteredConnectorConfigurationReader (shaped exactly like ConnectorConfigurationRegistryService.readConnectorConfiguration),
    reads its declared `method` field from the configuration''s own parsed text via
    the existing parsedConnectorConfiguration helper, and returns a ConnectorConfigurationDraftMethodMismatch
    (both fields upper-cased) only where a configuration is registered, its text declares
    a string method, and that method upper-cased differs from the operation''s method
    upper-cased; returns undefined in every other case (unregistered connector, no
    method in the registered text, or the two methods agreeing once each is upper-cased).
    Performs no write and no capability read.'
criteria:
- criterion: Where a configuration registered under the connector name declares method
    GET and the operation declares POST, the draft's method_mismatch names registered
    GET and operation POST.
  met: true
  how: 'declaredMethod reads GET from the registered configuration''s parsed text;
    mismatchOrUndefined upper-cases both (GET and POST), finds them unequal, and returns
    { registered: ''GET'', operation: ''POST'' }.'
- criterion: Where a configuration registered under the connector name declares method
    GET and the operation's own method is the lower-case path-item key get, the draft
    states no method_mismatch, since the two are the same method once each is upper-cased.
  met: true
  how: mismatchOrUndefined upper-cases both sides before comparing (GET.toUpperCase()
    === get.toUpperCase()), so the two are found equal and registeredMethodMismatch
    returns undefined regardless of the operation's own lower-case path-item-key spelling.
- criterion: Where the registered configuration's declared method, upper-cased, equals
    the operation's method upper-cased, the draft states no method_mismatch.
  met: true
  how: mismatchOrUndefined returns undefined whenever the two upper-cased strings
    are equal, whatever case either source supplied.
- criterion: Where no connector configuration is registered under the connector name,
    the draft states no method_mismatch whatever the operation's method is.
  met: true
  how: registeredMethodMismatch checks resolution.held first and returns undefined
    immediately when false, never reaching the operation's method at all.
- criterion: Where the configuration registered under the connector name declares
    no method in its own text, the draft states no method_mismatch whatever the operation's
    method is.
  met: true
  how: declaredMethod returns undefined when the parsed configuration's method key
    is absent (or not a string), and registeredMethodMismatch returns undefined in
    that case without ever comparing against the operation's method.
- criterion: A method_mismatch reports both its registered and operation values upper-cased,
    even where the registered configuration's own text or the operation's own document
    spelling was lower-case.
  met: true
  how: mismatchOrUndefined always assigns registered and operation from .toUpperCase()
    calls, so the reported pair is upper-cased unconditionally, independent of the
    case either source supplied it in.
- criterion: The comparison reads the method from the registered configuration's own
    text rather than from any capability attribute.
  met: true
  how: declaredMethod reads exclusively from the registered ConnectorConfiguration's
    own configuration text, parsed through the existing parsedConnectorConfiguration
    helper; the module never accepts or reads a capability object.
- criterion: The comparison reads the configuration registered under that name live
    at generation time rather than from a copy held elsewhere.
  met: true
  how: registeredMethodMismatch takes no pre-resolved configuration as an argument;
    it calls registry.readConnectorConfiguration(connector) itself at invocation time,
    so whoever wires the real ConnectorConfigurationRegistryService.readConnectorConfiguration
    in reads the live registry on every draft generation rather than a snapshot taken
    earlier.
- criterion: The configuration registered under the connector name stands unchanged
    after the comparison.
  met: true
  how: The module performs no write of any kind -- no call to writeConnectorConfigurations
    or any store method -- only the injected read.
nodes:
- node: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
  encoded_at:
  - src/connector-registry/registered-method-comparison.ts
  how: registeredMethodMismatch implements the rule's presence condition (registered,
    text declares a method), its case-folded equality test, and its upper-cased naming
    of both methods in the resulting mismatch; absence of a registration or of a declared
    method yields no mismatch exactly as the rule states.
- node: domain/integration/connector-configuration-draft-method-mismatch
  encoded_at:
  - src/connector-registry/registered-method-comparison.ts
  how: The value object's shape ({registered, operation}) was already declared in
    connector-configuration-draft.ts by the sibling draft-domain-shape delivery; this
    task's function is the one place that constructs an instance of it, populating
    both fields exactly as the node's Responsibility states -- the currently-registered
    method and the drafted operation's method, named only where they disagree.
- node: scenarios/integration/a-drafts-method-mismatches-what-is-registered
  encoded_at:
  - src/connector-registry/registered-method-comparison.ts
  how: The scenario's given/when/then (erp-http registered GET, operation POST, draft
    names registered GET and operation POST, registered configuration unchanged) is
    exactly what registeredMethodMismatch computes and what its read-only access to
    the registry preserves.
inferences:
- inferred: A `method` key present in the registered configuration's parsed text but
    holding a non-string value is treated the same as the key being absent -- no method
    declared, hence no mismatch -- rather than being coerced or compared as-is.
  from: rules/integration/an-http-connector-configuration-declares-its-call fixes
    method to a string vocabulary (GET/POST/PUT/PATCH/DELETE), so a non-string value
    at that key is not a method declaration in the sense this comparison rule means
    by declares a method; criterion 5 only states the outcome for an outright-absent
    method, and treating a non-string value the same way is the narrowest reading
    consistent with both the vocabulary rule and this task's own criteria.
- inferred: The registry dependency is received as a narrow injected reader (a single
    readConnectorConfiguration function) rather than the module importing ConnectorConfigurationRegistryService
    directly or constructing one.
  from: The inventory's note that the per-name read goes through ConnectorConfigurationRegistryService.readConnectorConfiguration,
    combined with the existing convention in test-connector.controller.ts's TestConnectorControllerDependencies
    (a function-typed field of the same shape) and the standard's rules that a service/controller
    never constructs a dependency directly.
preserved:
- ConnectorConfigurationRegistryService.readConnectorConfiguration's existing signature
  and behavior (used unchanged, not modified) so its other two callers -- test-connector.controller.ts
  and http-declarative-observation-source.adapter.ts -- are unaffected.
- parsedConnectorConfiguration's existing behavior (throwing ConnectorConfigurationNotWellFormedError
  on malformed text) is reused rather than re-implemented, so its existing callers
  keep seeing the same error on the same condition.
---

## What it is

The one read of the connector registry the draft performs, and the disclosure of a disagreement it never resolves.

## Notes

None.
