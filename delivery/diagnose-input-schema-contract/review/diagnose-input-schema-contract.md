---
title: Review of the diagnose input-schema contract change
summary: Coverage, specification-conformance and standard-conformance passes over the 8 tasks that make
  a capability's input_schema an enforced, well-formed contract, derive case-level input requirements
  from it, gate diagnose on subject coverage, and reconcile connector-configuration placeholders against
  it in both registration directions and at test time; the captured full suite passed clean, so the failures
  pass found nothing to diagnose.
tasks:
- task/capability-input-schema-contract/refuse-malformed-capability-input-schema
- task/case-input-requirements-and-diagnose-gate/derive-case-input-requirements
- task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute
- task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
- task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder
- task/connector-configuration-and-placeholder-contract/refuse-capability-registration-with-orphaned-placeholder
- task/connector-configuration-and-placeholder-contract/degrade-unresolved-connector-call-to-unavailable
- task/connector-configuration-and-placeholder-contract/report-placeholder-declaration-in-connector-test
reviewed:
- src/__tests__/integration/factories/capability-registry.factory.spec.ts
- src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/case/case-input-requirements.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/case-input-requirements.routes.spec.ts
- src/__tests__/unit/http/diagnose.controller.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/register-capability.routes.spec.ts
- src/__tests__/unit/http/register-connector.routes.spec.ts
- src/__tests__/unit/http/test-connector.controller.spec.ts
- src/__tests__/unit/http/test-connector.routes.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
- src/capability-registry/capability-input-schema-shape.ts
- src/capability-registry/capability-registry.service.ts
- src/capability-registry/connector-configurations-reader.port.ts
- src/case/case-input-requirements.port.ts
- src/case/case-input-requirements.ts
- src/case/case-query.service.ts
- src/connector-registry/capabilities-reader.port.ts
- src/connector-registry/connector-configuration-registry.service.ts
- src/connector-registry/connector-placeholder-declaration-check.ts
- src/errors/connector-placeholder-outside-input-schema.error.ts
- src/errors/malformed-capability-input-schema.error.ts
- src/errors/status-map.ts
- src/errors/subject-does-not-cover-case-inputs.error.ts
- src/factories/build-app.factory.ts
- src/factories/capability-registry.factory.ts
- src/factories/case-input-requirements.factory.ts
- src/factories/connector-configuration-registry.factory.ts
- src/factories/diagnose-server.factory.ts
- src/http-connector/connector-request-resolver.ts
- src/http/build-app.ts
- src/http/case-input-requirements.controller.ts
- src/http/case-input-requirements.routes.ts
- src/http/diagnose.controller.ts
- src/http/dto/case-input-requirements.dto.ts
- src/http/dto/test-connector.dto.ts
- src/http/register-connector.controller.ts
- src/http/test-connector.controller.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/investigation/subject-covers-case-input-requirements.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/diagnose-input-schema-contract) passed clean across every step (install,
    typecheck, lint, secret-scan, test); nothing failed for this pass to diagnose
coverage:
- criterion: Registering a capability whose input_schema, once valid JSON, does not declare properties
    as an object is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose input_schema declares properties as something other than an object,
      reporting MalformedCapabilityInputSchemaError
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves MalformedCapabilityInputSchemaError to 422
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns MalformedCapabilityInputSchemaError, naming every
      departure in the details
- criterion: Registering a capability whose input_schema declares a required array naming a key absent
    from properties is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose input_schema declares a required array naming a key absent from
      properties, reporting MalformedCapabilityInputSchemaError
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves MalformedCapabilityInputSchemaError to 422
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns MalformedCapabilityInputSchemaError, naming every
      departure in the details
- criterion: A single registration departing from the shape in more than one way is refused with one MalformedCapabilityInputSchemaError
    naming every departure together.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose input_schema departs from the shape in more than one way with one
      MalformedCapabilityInputSchemaError naming every departure together
  - file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
    name: reports both problems together when properties and required depart from the shape at once
- criterion: Registering a capability whose input_schema declares an empty properties object and no required
    array succeeds.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: accepts a registration whose input_schema declares an empty properties object and no required
      array
- criterion: Reading the declared shape of a capability's input_schema that was stored before this check
    existed, and does not hold this shape, answers properties and required both empty rather than throwing
    or refusing.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
    name: answers properties and required both empty for an input_schema that does not hold the declared
      shape, rather than throwing or refusing
  - file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
    name: answers properties and required both empty for an input_schema that is not valid JSON at all,
      rather than throwing
  - file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
    name: answers properties and required both empty for an input_schema that is undefined, rather than
      throwing
- criterion: MalformedCapabilityInputSchemaError resolves to 422 through the shared status map.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves MalformedCapabilityInputSchemaError to 422
- criterion: For a case version whose collection plan resolves to capabilities declaring input-schema
    properties, the read returns one entry per distinct subject attribute named in any of those properties.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: returns one entry per distinct subject attribute the sole answering capability declares in its
      own input schema properties
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: dedupes an attribute two different concepts' own sole answerers both declare into the one entry,
      naming every asking capability on it
- criterion: An entry's required is true when any capability answering the plan's concepts names that
    attribute in its own input schema's required.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: marks an attribute required when any answering capability's own input schema names it in required,
      and not required when none do
- criterion: An entry names every currently registered capability that answers one of the plan's concepts
    and declares that attribute in properties.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: names every currently registered capability that answers a plan concept and declares the attribute,
      not only the first one seen
- criterion: A concept the collection plan holds that no registered capability currently answers, or that
    more than one currently answers, contributes no attribute to the result.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: contributes no attribute for a concept the collection plan holds that no registered capability
      currently answers
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: contributes no attribute for a concept more than one registered capability currently answers,
      even though each declares its own attribute
- criterion: A capability whose stored input_schema does not currently hold a well-formed shape contributes
    no attribute and is named separately, apart from the attribute entries.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: contributes no attribute and names the capability apart, for a sole answerer whose stored input
      schema does not currently hold a well-formed properties object
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: still derives the attributes of a well-formed capability while naming a different, currently
      malformed one apart
- criterion: The read answers for a case version in draft state exactly as it would for one in released
    state.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-input-requirements.spec.ts
    name: answers identically regardless of the case version state, since nothing here reads it at all
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers identical input requirements for a draft version and the same version once released
- criterion: The read is computed fresh from the currently registered capabilities at every call, never
    a stored or cached result.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: derives from the currently registered capabilities read fresh at every call, answering differently
      once a capability is registered between two calls for the same version
- criterion: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    before any capability is called.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
    name: throws a SubjectDoesNotCoverCaseInputsError when the subject holds no attribute-value for an
      attribute a requirement names required
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: refuses a diagnose request whose subject leaves a required case input missing, throwing exactly
      a SubjectDoesNotCoverCaseInputsError
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: never calls runDiagnose when the subject fails to cover a required case input, so no capability
      is ever called
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers 422 with the SubjectDoesNotCoverCaseInputsError envelope naming the missing attribute
      and the capabilities that require it, for a subject missing a required case input
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves SubjectDoesNotCoverCaseInputsError to 422
- criterion: The refusal names every missing required attribute together, each with the capabilities that
    require it.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
    name: names every missing required attribute together, each with the capabilities that require it,
      when more than one required attribute is missing at once
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: names every missing required attribute together with the capabilities that require it, on the
      refusal thrown by the controller
- criterion: A subject missing only an attribute the derived requirements leave optional is not refused
    by this gate.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
    name: does not refuse a subject missing only an attribute a requirement leaves optional
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: does not refuse a subject missing only an attribute the derived requirements leave optional
- criterion: A subject covering every required attribute reaches collection as before.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: reaches runDiagnose when the subject covers every required attribute the derived requirements
      name
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers 200 with the resolved assessment when the subject covers every required attribute the
      derived requirements name
- criterion: test-connector's own diagnostic call is not held to this gate.
  state: partial
  tests:
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: imports neither the new required-case-inputs gate function nor the diagnose controller, so its
      own diagnostic call has no path into the gate
  why: The only test bearing on this is a source scan for import specifiers — it proves the module does
    not import the gate function or the diagnose controller, but it does not exercise the diagnostic call's
    actual behavior against a subject missing a required attribute. A future implementation that reached
    the same refusal by re-implementing the check inline, without importing the named modules, would leave
    this test green while the criterion had stopped holding; conversely a change that genuinely wired
    the gate in through some other import path would fail it for a reason unrelated to behavior. Nothing
    in the set drives handleTestConnectorRequest with a subject that would trip the gate and observes
    it proceed regardless.
- criterion: Given a connector configuration's call text embedding a placeholder naming a Subject attribute,
    and a capability's declared properties not naming that attribute, the check names that placeholder
    as orphaned.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
    name: names a Subject-attribute placeholder as orphaned when the capability's declared properties
      does not name it
  - file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
    name: names only the undeclared placeholder, leaving a declared one out, when the call text embeds
      both
- criterion: Given a connector configuration's call text embedding a placeholder naming a Subject attribute
    that a capability's declared properties does name, the check names no orphaned placeholder for it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
    name: names no orphaned placeholder for a Subject-attribute placeholder the capability's declared
      properties does name
- criterion: A placeholder naming the requester or a credential is never named orphaned by the check.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
    name: never names a requester placeholder orphaned, even when the capability declares no properties
      at all
  - file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
    name: never names a credential placeholder orphaned, even when the capability declares no properties
      at all
- criterion: The capability registry can read every currently registered connector configuration through
    a narrow port the composition root supplies, backed by the same connector-configuration store already
    in use.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: answers every connector configuration the injected reader currently holds, exactly as that reader
      answers it
  - file: src/__tests__/integration/factories/capability-registry.factory.spec.ts
    name: reads a connector configuration registered through the connector-configuration registry's own
      real wiring, through readRegisteredConnectorConfigurations backed by the same store
- criterion: The connector-configuration registry can read every currently registered capability through
    a narrow port the composition root supplies, backed by the same capability store already in use.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers every capability the injected reader currently holds, exactly as that reader answers
      it
  - file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
    name: reads a capability registered through the capability registry's own real wiring, through readRegisteredCapabilities
      backed by the same store
- criterion: Registering a connector configuration whose call text embeds a placeholder naming a Subject
    attribute that no capability currently registered against that connector's name declares in properties
    is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose call text embeds a Subject-attribute placeholder no capability
      currently registered against that connector declares, as ConnectorPlaceholderOutsideInputSchemaError
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError,
      naming every orphaned placeholder together with the capability that fails to declare it
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConnectorPlaceholderOutsideInputSchemaError to 422
- criterion: The refusal names every such orphaned placeholder together with the capability that fails
    to declare it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names the orphaned placeholder together with the capability that fails to declare it
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names both orphaned placeholders together when the call text embeds two the capability does
      not declare
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names every capability that fails to declare the placeholder, when more than one is registered
      against the connector and none declares it
- criterion: Registering the same connector configuration when at least one capability currently registered
    against that connector's name declares the placeholder's attribute in properties succeeds.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds when at least one capability registered against the connector declares the placeholder
      attribute, even though another fails to
- criterion: A placeholder naming the requester or a credential is never checked against any capability's
    properties by this refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: never refuses a placeholder naming the requester or a credential, even though the registered
      capability declares no properties at all
- criterion: Editing an existing connector configuration is held to the same refusal as registering a
    new one.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: holds an edit of an already-registered connector configuration to the same orphaned-placeholder
      refusal as a new registration, leaving the previously held configuration untouched
- criterion: Registering a capability naming a connector that already holds a registered configuration
    whose call text embeds a Subject-attribute placeholder this registration's own input-schema properties
    does not declare is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration naming a connector that already holds a registered configuration embedding
      a Subject-attribute placeholder its own input_schema properties does not declare, as ConnectorPlaceholderOutsideInputSchemaError
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError,
      naming every orphaned placeholder together with the capability that fails to declare it
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConnectorPlaceholderOutsideInputSchemaError to 422
- criterion: The refusal names every such orphaned placeholder together with the capability being registered.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: names the orphaned placeholder together with the capability being registered
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: names both orphaned placeholders together when the connector's registered configuration embeds
      two the registration does not declare
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: names one orphaned placeholder once, not once per occurrence, when the registered configuration
      embeds it more than once
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: unions the orphaned placeholder across every registered configuration for the connector, named
      once even though only one of two configurations embeds it
- criterion: Registering the same capability succeeds when its own input-schema properties declares the
    placeholder's attribute.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: succeeds when the registration's own input_schema properties declares the placeholder's attribute,
      even though the connector already holds a configuration embedding it
- criterion: Registering a capability naming a connector that holds no registered configuration is not
    refused by this check.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: is not refused by this check when the connector it names holds no registered configuration at
      all
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: is not refused by this check when every registered configuration names a different connector
- criterion: A concept observation whose call embeds a Subject-attribute or credential placeholder that
    resolves to nothing records evidence result unavailable with result_detail naming ConnectorPlaceholderNotResolvedError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector
      call embeds a Subject-attribute placeholder the given Subject does not carry
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector
      call embeds a credential placeholder naming an environment variable that is not set
- criterion: A concept observation whose connector configuration is missing its address records evidence
    result unavailable with result_detail naming IncompleteConnectorCallDescriptorError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the
      connector configuration is missing its address
- criterion: A concept observation whose connector configuration declares query or headers as anything
    other than an object of string values records evidence result unavailable with result_detail naming
    IncompleteConnectorCallDescriptorError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the
      connector configuration declares headers as an object whose own value is not a string
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the
      connector configuration declares query as something other than an object of string values
- criterion: A concept observation whose connector configuration names a placeholder kind the HTTP connector
    does not recognize, or a placeholder missing an argument it requires, records evidence result unavailable
    with result_detail naming IncompleteConnectorCallDescriptorError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the
      connector configuration embeds a placeholder naming a kind this connector does not recognize
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the
      connector configuration embeds a subject placeholder naming no attribute at all
- criterion: The collection of every other concept in the same investigation proceeds unaffected when
    one concept's observation degrades this way.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: proceeds with every other concept unaffected — settling to its own ok ending — when one concept
      collected in the same Promise.all batch degrades to unavailable through this catch
- criterion: test-connector's own call to the resolver continues to propagate an unresolved condition
    uncaught, unaltered by this fix.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: propagates ConnectorPlaceholderNotResolvedError uncaught, issuing no HTTP call, when the named
      connector configuration embeds a Subject-attribute placeholder the given Subject does not carry
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: propagates IncompleteConnectorCallDescriptorError uncaught, issuing no HTTP call, when the named
      connector configuration is missing its address
- criterion: Testing a connector configuration through a capability whose input schema does not declare
    a Subject-attribute placeholder the configuration's call text embeds reports that placeholder in the
    response.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: names, in its own orphaned_placeholders, a Subject-attribute placeholder the tested connector
      configuration's call text embeds that the tested capability's own input schema does not declare
- criterion: Testing a connector configuration through a capability whose input schema declares every
    Subject-attribute placeholder the configuration's call text embeds reports none.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: names none in its own orphaned_placeholders when the tested capability's own input schema declares
      every Subject-attribute placeholder the tested connector configuration's call text embeds
- criterion: The test is not refused on account of an orphaned placeholder its own response reports.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: is not refused, and still issues the call and returns the outcome, for a test whose own response
      reports an orphaned placeholder
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: still names the orphaned placeholder in its own response, without itself refusing the test,
      when the underlying HTTP call fails
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
findings:
- pass: standard
  file: src/capability-registry/capability-registry.service.ts
  where: pageCountOf, lines 401-423
  cites: MNT-03
  evidence: 'Restated here rather than imported (MNT-03 divergence, disclosed): that pageCountOf is a
    private, unexported function of an unrelated persistence module, and glossary.service.ts''s own listVocabularyTerms/listConcepts
    already made the identical choice for the identical reason ... function pageCountOf(total: number,
    limit: number): number { return limit > 0 ? Math.ceil(total / limit) : 0; }'
  cost: The same two-line page-count rule now lives, unexported, in at least three modules of this project
    (this file, relational-case-store.repository.ts and glossary.service.ts, by the file's own account,
    plus its own mirror in connector-configuration-registry.service.ts) — the day the rounding or the
    non-positive-limit floor needs to change, a reader has no way to know how many of the copies were
    actually updated.
  correction: Lift pageCountOf into one exported, shared module (e.g. under src/types or a small pagination
    helper) and have every one of the listing services import it, rather than each restating the identical
    two-line rule.
- pass: standard
  file: src/case/case-query.service.ts
  where: assembledAsRawDocument, lines 322-345
  cites: MNT-03
  evidence: 'Projects the assembled version into the flat raw shape parseCaseDocument accepts: each manifest
    entry''s own adopted hypothesis-revision content flattened onto the entry ... the same projection
    release.operation.ts''s own assembledAsDocument already builds for the same gap, duplicated here rather
    than shared (this module''s own header comment, disclosed as a divergence from MNT-03 in this task''s
    delivery record). function assembledAsRawDocument(assembled: AssembledCaseVersion): unknown { return
    { ... }; }'
  cost: The manifest-flattening projection now exists twice — here and in release.operation.ts — so a
    change to how a stored version's manifest is flattened for parseCaseDocument (a new field, a renamed
    one) has to be found and applied in both places, and the reader of whichever one is not touched has
    no signal that its sibling changed.
  correction: Export release.operation.ts's own assembledAsDocument (or an equivalent shared helper) and
    have read-case's own structuralCase call it, rather than keeping a second, hand-maintained copy of
    the same projection in this file.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: pageCountOf, lines 241-264
  cites: MNT-03
  evidence: 'Restated here rather than imported (MNT-03 divergence, disclosed): capability-registry.service.ts''s
    own pageCountOf is a private, unexported function of a sibling registry service, and that module''s
    own header comment already discloses making the identical choice for the identical reason ... function
    pageCountOf(total: number, limit: number): number { return limit > 0 ? Math.ceil(total / limit) :
    0; }'
  cost: This is the fourth restatement of the identical page-count rule the project's own comments admit
    to (this file, capability-registry.service.ts, relational-case-store.repository.ts and glossary.service.ts)
    — a fix to the rounding or the non-positive-limit floor made in one is silently absent from the other
    three.
  correction: Share one exported pageCountOf across every listing service instead of letting each registry
    restate it.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: isPlainObject, lines 417-419
  cites: MNT-03
  evidence: 'function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> { return
    typeof value === ''object'' && value !== null && !Array.isArray(value); }'
  cost: The identical plain-object guard already exists as capability-input-schema-shape.ts's own isPlainObject
    (and again in connector-request-resolver.ts and http-declarative-observation-source.adapter.ts); a
    change to what counts as a plain object here — narrowing out a class instance, say — silently does
    not reach the other copies.
  correction: Export one isPlainObject guard from a shared module and import it everywhere this exact
    check is needed, rather than re-declaring it per file.
- pass: standard
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: isPlainObject and isStringRecord, lines 521-528
  cites: MNT-03
  evidence: 'function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> { return
    typeof value === ''object'' && value !== null && !Array.isArray(value); } ... function isStringRecord(value:
    unknown): value is Readonly<Record<string, string>> { return isPlainObject(value) && Object.values(value).every((entry)
    => typeof entry === ''string''); }'
  cost: Both guards are byte-for-byte identical to connector-request-resolver.ts's own isPlainObject and
    isStringRecord, in a file that already imports resolveConnectorRequest from that same module — the
    reuse path exists and is simply not taken, so a narrowing of what 'a plain object of string values'
    means has to be made twice and can silently drift once.
  correction: Export isPlainObject and isStringRecord from connector-request-resolver.ts and import them
    here, since this file already depends on that module for resolveConnectorRequest.
---

## What it is
Coverage, specification-conformance and standard-conformance passes over the diagnose input-schema contract change's 8 delivered tasks. The captured full suite (install, typecheck, lint, secret-scan, test) passed clean, so the failures pass had nothing to diagnose.

## Notes
The conformance pass set aside one observation as outside its scope rather than a domain-fact finding: ConnectorPlaceholderOutsideInputSchemaError's constructor always writes an internal Error.message describing "a connector configuration" being refused, even when the same class is thrown by CapabilityRegistryService to refuse a capability registration instead — a message-accuracy question in a string never surfaced on the wire (routes answer only `code` and `context`/`details`), which is a code-quality question rather than a fact the specification states or contradicts.

Two specification nodes moved since their bind (rules/integration/a-capability-declares-its-contract, rules/knowledge/a-release-refusal-with-no-named-violation-says-so) and 216 `code`-class drift findings stand over 38 files across the backend target — none of them touched by this review's own file set beyond what the trace section of the report already names. This target is not declared `edits_freely`, so every `code` finding was listed in full by `trace.py --check` rather than counted; the great majority predate this initiative and are pre-existing, unreconciled drift this review neither caused nor is scoped to answer for.
