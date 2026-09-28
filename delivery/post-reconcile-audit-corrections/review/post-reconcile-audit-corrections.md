---
target: backend
title: Review of post-reconcile-audit-corrections
summary: 'Four passes over the three corrective tasks delivered under post-reconcile-audit-corrections:
  the orphaned-placeholder union fix, the fake evaluator no-data guard, and the seed-concept whole-replace
  fix.'
reviewed:
- src/connector-registry/connector-configuration-registry.service.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/investigation/fake-hypothesis-evaluator.adapter.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/seed.ts
- src/__tests__/unit/seed.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
tasks:
- task/connector-placeholder-orphan-union/refuse-on-any-capabilitys-absence
- task/fake-hypothesis-evaluator-no-data-usage/no-usage-or-elapsed-for-no-data
- task/seed-concept-upsert/replace-ttl-and-accepts-whole
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: run/post-reconcile-audit-corrections-review-suite passed; there was no failure to read
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: Registering a connector configuration against a connector with two currently-registered capabilities,
    where a placeholder naming a Subject attribute is present in one capability's input schema properties
    and absent from the other's, is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration when a placeholder naming a Subject attribute is present in one capability
      registered against the connector and absent from another's
  why: 'Only one ordering is exercised: the capability that lacks the placeholder is answered first and
    the one that has it second. Nothing registers them the other way round, with the declaring capability
    first. An implementation that checked only the first capability returned would therefore wrongly accept
    in the reverse arrangement, and this test would still pass.'
- criterion: Registering a connector configuration whose every placeholder naming a Subject attribute
    is present in every currently-registered capability sharing that connector succeeds.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds when every placeholder naming a Subject attribute is present in every capability registered
      against the connector
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds without any orphaned-placeholder refusal when the call text embeds no placeholder at
      all
  why: The success case uses a single Subject placeholder, so a configuration with several placeholders
    that are all declared is never registered. Every capability in that test shares the connector. No
    test mixes a same-connector capability that declares the placeholder with a capability on another
    connector that does not. The "sharing that connector" limit is exercised only by the no-capability-on-this-connector
    test under the third criterion.
- criterion: Registering a connector configuration against a connector with no capability currently registered
    against it succeeds.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds regardless of an embedded orphaned-looking placeholder when no capability at all is
      currently registered
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds regardless of an embedded orphaned-looking placeholder when every currently registered
      capability names a different connector
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds regardless of an embedded orphaned-looking placeholder when constructed with the default
      (no) capabilities reader
- criterion: Registering a connector configuration whose placeholder names the requester or a credential,
    present or absent from any capability's input schema, is not refused on that account.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: never refuses a placeholder naming the requester or a credential, even though the registered
      capability declares no properties at all
  why: 'Only the "absent" half is exercised: a single capability whose input schema declares no properties.
    The "present" half is not: nothing registers a capability whose input schema declares the requester
    or the credential''s name. "On that account" is also unexercised where a refusal does happen. No configuration
    carries a requester or credential placeholder beside an orphaned Subject placeholder, so nothing shows
    that such a refusal names only the Subject one.'
- criterion: Calling evaluate() against a seed whose reason is no-data and which carries no usage or elapsed_ms
    of its own answers an outcome carrying no usage and no elapsed_ms.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: withholds usage and elapsed_ms from an outcome seeded with reason no-data and no usage or elapsed_ms
      of its own
- criterion: Calling evaluate() against a seed whose reason is not no-data and which carries no usage
    or elapsed_ms of its own still answers an outcome carrying the fake's own placeholder usage and elapsed_ms.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it, plus the deterministic
      zero-valued usage and elapsed_ms every answer now carries
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the refuted verdict with exactly the citations seeded for it, plus the deterministic
      zero-valued usage and elapsed_ms every answer now carries
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying
      no citations, plus the deterministic zero-valued usage and elapsed_ms every answer now carries
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers by criterion alone, ignoring the evidence a call carries, even when the evidence array
      is empty
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the outcome seeded for this criterion, not the one seeded for a different criterion,
      plus the deterministic zero-valued usage and elapsed_ms every answer now carries
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: attaches the deterministic zero-valued usage and elapsed_ms plus the placeholder prompt where
      a seeded outcome carries no prompt of its own
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: a later seed for the same criterion replaces the earlier one, plus the deterministic zero-valued
      usage and elapsed_ms every answer now carries
  why: The one test that asserts usage and elapsed_ms directly uses a confirmed seed. Only one test uses
    an inconclusive seed whose reason is not no-data (judgment-failure), and it asserts them only inside
    a whole-outcome equality. That test is the one that tells "not no-data" apart from "not inconclusive".
    An implementation that dropped usage from every inconclusive outcome would be caught there alone.
- criterion: Re-seeding a concept whose ttl differs from the value the store already holds under that
    name leaves the store holding the fixture's ttl.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: updates two already-held concepts in one call — each one's own row permanently referenced by
      its own capability — replacing each one's ttl, description and accepts exactly with the given values,
      without failing and without breaking either capability's own foreign key
  why: 'The store half is proven: RelationalGlossaryStore.writeConcepts over already-held concepts leaves
    the new ttl in the real tables. Re-seeding itself is unexercised. Nothing in the set runs the seed''s
    concept seeding against a store that already holds the concept. If seeding stopped routing the fixture
    through writeConcepts, for example back to an insert that skips names already held, no test would
    fail. The seed.spec test "replaces a concept''s held description with the fixture''s own value in
    the same upsert that replaces its ttl, writing through IGlossaryStore.writeConcepts -- the write path
    seedConcepts now delegates the whole fixture to, instead of seed.ts''s own removed hand-rolled INSERT"
    covers nothing here, despite its name. It never invokes the seed. It drives writeConcepts over a fake
    connection and asserts the exact SQL text and parameters, which binds the query''s shape rather than
    what the store ends up holding. It also asserts description replacement, which goes beyond this criterion.'
- criterion: Re-seeding a concept whose fixture no longer names a subject type the store already records
    as accepted leaves the store not accepting that subject type.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: updates two already-held concepts in one call — each one's own row permanently referenced by
      its own capability — replacing each one's ttl, description and accepts exactly with the given values,
      without failing and without breaking either capability's own foreign key
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching
      a different concept's own rows, even though that other concept is not named anywhere in this call
      and shares the very same subject type
  why: Both tests call the store's writeConcepts directly. Nothing in the set re-seeds, so it is unexercised
    that seeding reaches this replacement. Removal is also exercised only as a swap, where one accepted
    subject type is replaced by another. No concept's fixture drops to naming no subject type while the
    store still records one as accepted.
- criterion: Re-seeding a concept whose fixture names a subject type the store does not yet record as
    accepted leaves the store accepting that subject type.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: updates two already-held concepts in one call — each one's own row permanently referenced by
      its own capability — replacing each one's ttl, description and accepts exactly with the given values,
      without failing and without breaking either capability's own foreign key
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching
      a different concept's own rows, even though that other concept is not named anywhere in this call
      and shares the very same subject type
  why: Both tests call the store's writeConcepts directly. Nothing in the set re-seeds a concept already
    held, so it is unexercised that seeding reaches this addition. The addition is also exercised only
    together with removing the one previously accepted type. Adding a subject type while keeping an existing
    accepted one is never exercised.
unpaired:
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: adds only the terms the outcomes table does not already hold, and leaves an already-held row
      untouched, even though the table already holds rows permanently referenced by released fixtures
  asserts: After insertMissingTerms('outcome', [alreadyHeld, missing]), readTerms('outcome') contains
    both names.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers a concept with an empty accepts array when it currently accepts no subject type
  asserts: A concept inserted with no concept_accepts rows and no description is read back as accepts
    [], ttl 45, description ''.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each concept with its name, the subject types it accepts, its ttl and its description,
      exactly as the real tables hold them
  asserts: readConcepts answers a directly inserted concept with its two accepted subject types, ttl 120
    and description.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each of the four vocabularies with the rows written for it, and no other vocabulary's
      rows
  asserts: readTerms for subject-type, outcome, action and recipient each contains the row inserted into
    its own table. Subject-type does not contain the outcome name, and outcome does not contain the subject-type
    name.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers exactly what a row inserted directly into the real table holds, among whatever else
      the table currently holds
  asserts: readTerms('outcome') contains an outcome row inserted directly by SQL.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers no concepts, not a rejection, when no row was ever stored under a given name
  asserts: readConcepts resolves, and its names do not contain a freshly generated random name that was
    never inserted. The containment assertion is on a name nothing could have written, so it effectively
    proves only that readConcepts resolves.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: creates a concept at a brand-new name without failing, and leaves a different, already-held
      concept — permanently referenced by a capability — exactly as it was, even though that referenced
      concept is not named anywhere in this call
  asserts: writeConcepts creates a new concept with its accepts, ttl and description. A different concept
    already referenced by a capability is read back unchanged.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: never ends up holding one concept name in two rows, even when the given array names it twice
      in one call — concepts.name's own primary key resolves it to exactly one row, carrying the second
      entry's own values
  asserts: writeConcepts given the same new name twice in one call leaves exactly one concepts row, carrying
    the second entry's ttl 20 and description.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: rejects a call against 'action' with a foreign-key violation, now that this shared database
      always holds a row a released fixture permanently references — the later-write-replaces-earlier-write
      real effect this test proved stays unprovable for this vocabulary until that pinning is lifted
  asserts: writeTerms('action', ...) rejects with GlossaryStoreError whose cause carries code 23503.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: rejects a call against 'recipient' with a foreign-key violation before it ever reaches its own
      insert — the duplicate-name-refused-leaving-prior-content-untouched real effect this test proved
      stays unprovable for this vocabulary until that pinning is lifted
  asserts: writeTerms('recipient', ...) rejects with GlossaryStoreError whose cause carries code 23503.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: rejects a call against 'recipient' with a foreign-key violation, now that this shared database
      always holds a row a released fixture permanently references — the persists-so-an-outside-read-finds-it
      real effect this test proved stays unprovable for this vocabulary until that pinning is lifted
  asserts: writeTerms('recipient', ...) rejects with GlossaryStoreError whose cause carries code 23503.
- test:
    file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: removes the named concept and its own accepts declaration so a subsequent read no longer returns
      it, leaving a different concept and the subject types either concept accepted exactly as they were
  asserts: After deleteConcept, readConcepts no longer lists the deleted concept. A sibling concept is
    read back unchanged, and both subject types remain in readTerms('subject-type').
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: accepts a configuration payload of any shape, holding it unchanged rather than reading or validating
      a key inside it
  asserts: A nested object configuration is accepted, and the registered configuration parses back to
    the same object.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: accepts a configuration value supplied already as a plain object, holding it as exactly the
      same text a JSON-text registration of the same content would resolve to
  asserts: Registering the same content as an object and as JSON.stringify text yields identical configuration
    strings.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: accepts a registration whose configuration text is valid JSON object text, holding the parsed
      object unchanged
  asserts: JSON object text is accepted, and the registered configuration parses back to that object.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers a configuration through readConnectorConfigurationOrThrow that parses back to exactly
      the object the connector was registered with
  asserts: readConnectorConfigurationOrThrow answers configuration text that parses back to the registered
    object, including null and array members.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers configuration as a JSON text string, never a parsed object, through readConnectorConfigurationOrThrow
      after a registration supplied it as a parsed object
  asserts: The configuration answered by readConnectorConfigurationOrThrow is of type string after an
    object registration.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers each entry through listConnectorConfigurations parsing back to exactly the object its
      own connector was registered with
  asserts: In listConnectorConfigurations, each connector's configuration parses back to its own registered
    object.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers every capability the injected reader currently holds, exactly as that reader answers
      it
  asserts: readRegisteredCapabilities equals the array the injected reader answers.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers every entry's configuration as a JSON text string, never a parsed object, through listConnectorConfigurations
      after registrations each supplied as a parsed object
  asserts: listConnectorConfigurations answers two entries, each with a string configuration.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers the empty array from readRegisteredCapabilities when constructed with no capabilities
      reader at all
  asserts: With no reader injected, readRegisteredCapabilities answers [].
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: answers the held configuration directly, with no resolution wrapper, when one is currently registered
      under the named connector
  asserts: readConnectorConfigurationOrThrow answers the held configuration record itself.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: consults no capability before removing, succeeding even though the injected capabilities reader
      would throw if invoked
  asserts: removeConnector resolves undefined even though the injected reader throws when called.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: does not refuse removing a connector currently named by a registered capability, capability-naming
      being the only condition about a connector's use this domain declares
  asserts: removeConnector resolves undefined for a connector that a registered capability names.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: holds a string-supplied configuration exactly as given, not re-parsed and re-serialized, so
      its own non-canonical formatting survives a read back through readConnectorConfigurationOrThrow
  asserts: Non-canonical JSON text is read back byte-identical through readConnectorConfigurationOrThrow.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: holds an edit of an already-registered connector configuration to the same orphaned-placeholder
      refusal as a new registration, leaving the previously held configuration untouched
  asserts: Re-registering a held connector with a Subject placeholder that its single capability does
    not declare is refused with ConnectorPlaceholderOutsideInputSchemaError, and the previously held configuration
    stays in the store.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: keeps every other connector's configuration untouched when one connector registers
  asserts: Registering a new connector leaves the store holding the unrelated entry followed by the new
    one.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names a failing capability by exactly the connector and input_schema attributes the reader answered,
      adding no wider identity of its own
  asserts: The capability named in the orphaned-placeholder refusal has exactly the keys connector and
    input_schema.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names both orphaned placeholders together when the call text embeds two the capability does
      not declare
  asserts: With one capability declaring neither of two Subject placeholders, context.orphaned lists both
    placeholders, each with that capability.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names every capability that fails to declare the placeholder, when more than one is registered
      against the connector and none declares it
  asserts: With two same-connector capabilities that both lack the placeholder, context.orphaned names
    the placeholder with both capabilities.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names one orphaned placeholder once, not once per occurrence, when the call text embeds it more
      than once
  asserts: A Subject placeholder repeated twice is listed once in context.orphaned.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: names the orphaned placeholder together with the capability that fails to declare it
  asserts: context.orphaned equals one entry naming customer_document and the single non-declaring capability.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: parsedConnectorConfiguration parses a well-formed held configuration back into exactly the object
      its own text holds
  asserts: parsedConnectorConfiguration answers the object encoded in a held configuration's text.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: parsedConnectorConfiguration throws ConnectorConfigurationNotWellFormedError, naming the same
      reason the write side raises, for a held configuration whose text does not parse to a plain object
  asserts: parsedConnectorConfiguration on held text '[1,2,3]' throws ConnectorConfigurationNotWellFormedError
    with reason 'configuration does not parse to a JSON object'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: persists an accepted registration through the store
  asserts: After an accepted registration, the store holds exactly the registered record.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: propagates a failure the capabilities reader itself raises while checking for an orphaned placeholder,
      rather than swallowing it
  asserts: When the capabilities reader throws, registerConnector rejects with that same error message,
    not with ConnectorPlaceholderOutsideInputSchemaError.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: propagates a failure the injected capabilities reader itself raises, rather than swallowing
      it
  asserts: readRegisteredCapabilities rejects with the reader's own error message.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: propagates a failure the underlying store read itself raises, rather than reporting it as ConnectorConfigurationNotFoundError
  asserts: readConnectorConfigurationOrThrow rejects with the store's own error, not ConnectorConfigurationNotFoundError.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration that declares no connector identity
  asserts: With connector undefined, IncompleteConnectorConfigurationError names only the connector problem.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose call text embeds a Subject-attribute placeholder no capability
      currently registered against that connector declares, as ConnectorPlaceholderOutsideInputSchemaError
  asserts: With a single same-connector capability that lacks the Subject placeholder, registration is
    refused with ConnectorPlaceholderOutsideInputSchemaError.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is not syntactically valid JSON, naming the
      reason
  asserts: Invalid JSON text is refused with ConnectorConfigurationNotWellFormedError, reason 'configuration
    is not syntactically valid JSON'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but a JSON array, naming the reason
  asserts: '''[1,2,3]'' is refused with ConnectorConfigurationNotWellFormedError, reason ''configuration
    does not parse to a JSON object''.'
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but a string primitive, naming
      the reason
  asserts: A JSON string literal is refused with ConnectorConfigurationNotWellFormedError, reason 'configuration
    does not parse to a JSON object'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but the null primitive, naming
      the reason
  asserts: The text 'null' is refused with ConnectorConfigurationNotWellFormedError, reason 'configuration
    does not parse to a JSON object'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration value is an array as ConnectorConfigurationNotWellFormedError,
      naming the reason, rather than as an incomplete configuration
  asserts: An array configuration value is refused with ConnectorConfigurationNotWellFormedError, not
    IncompleteConnectorConfigurationError, reason 'configuration is not a JSON object'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration value is entirely undeclared, treating that as an
      incomplete registration
  asserts: With configuration undefined, IncompleteConnectorConfigurationError names only the configuration
    problem.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration value is null as ConnectorConfigurationNotWellFormedError,
      naming the reason, rather than as an incomplete configuration
  asserts: A null configuration value is refused with ConnectorConfigurationNotWellFormedError, not IncompleteConnectorConfigurationError,
    reason 'configuration is not a JSON object'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses an empty registration, naming both the connector and the configuration
  asserts: An empty registration is refused with IncompleteConnectorConfigurationError naming both the
    connector and the configuration problems.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses configuration text that is not syntactically valid JSON as ConnectorConfigurationNotWellFormedError,
      even though the same text would also embed an orphaned placeholder
  asserts: Invalid JSON text containing a Subject placeholder is refused as ConnectorConfigurationNotWellFormedError,
    not ConnectorPlaceholderOutsideInputSchemaError.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: removes the configuration registered under the name, so a subsequent read of the registry no
      longer returns it
  asserts: After removeConnector, readConnectorConfiguration answers held false for that connector.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: replaces the held configuration when a connector re-registers, rather than holding a second
      row
  asserts: Re-registering a connector leaves the store holding one record carrying the new configuration.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves a registered connector to its currently held configuration
  asserts: readConnectorConfiguration answers held true with the held record.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves the absence of a connector nothing has registered, as data rather than a raised error
  asserts: readConnectorConfiguration for an unregistered connector answers held false with the connector
    name.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves the connector configuration registered after an earlier resolution already answered
      its absence
  asserts: A read after a registration answers held true with the registered record, even though an earlier
    read answered its absence.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: round-trips an empty object supplied as configuration to the empty-object JSON text "{}" through
      readConnectorConfigurationOrThrow, the smallest well-formed JSON object this criterion applies to
  asserts: An empty-object configuration is read back as the text '{}'.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: still answers a capability naming the removed connector after the removal, unchanged, since
      the operation writes to no capability
  asserts: After removeConnector, readRegisteredCapabilities still answers the capability naming that
    connector.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds without refusal against a connector nothing is registered under, leaving every registered
      configuration exactly as it stood
  asserts: removeConnector for an unregistered name resolves undefined, and the store still holds only
    the unrelated entry.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: throws ConnectorConfigurationNotFoundError naming the requested connector, with the message
      unchanged from before the relocation, when nothing is registered under that name
  asserts: readConnectorConfigurationOrThrow rejects with ConnectorConfigurationNotFoundError, carrying
    the connector in its context and an exact message text.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: treats a connector identity declared as the empty string as undeclared
  asserts: With connector '', IncompleteConnectorConfigurationError names only the connector problem.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration
  asserts: After an incomplete-registration refusal, the store holds only the entry it already held.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for an orphaned placeholder
  asserts: After a registration whose Subject placeholder its single capability does not declare, the
    store holds only the unrelated entry it already held.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for configuration text that is not
      syntactically valid JSON
  asserts: After an invalid-JSON refusal, the store holds only the entry it already held.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for configuration text that parses
      to something other than a JSON object
  asserts: After a JSON-array-text refusal, the store holds only the entry it already held.
- test:
    file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration whose configuration value is null
      or an array
  asserts: After null-value and array-value refusals, the store holds only the entry it already held.
- test:
    file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: accepts a fixture reasoned no-data with an empty citations list, answering only that the verdict
      is inconclusive and a reason is present
  asserts: A no-data seed answers verdict inconclusive with reason no-data. It asserts nothing about usage
    or elapsed_ms.
- test:
    file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: adds a placeholder prompt alongside the placeholder usage and elapsed_ms for a non-no-data seed
      that carries no prompt of its own
  asserts: For a confirmed seed with no prompt, the outcome has a prompt property. Despite its name, it
    asserts nothing about usage or elapsed_ms.
- test:
    file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: overrides a seeded non-zero usage and elapsed_ms with the deterministic zero on every answer,
      while still carrying a seeded prompt through unchanged
  asserts: A confirmed seed carrying non-zero usage and elapsed_ms answers zeroed usage and elapsed_ms,
    with the seeded prompt passed through (whole-outcome equality).
- test:
    file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: strips a no-data outcome down to no usage, elapsed_ms or prompt even where the seed itself already
      carried them, since a no-data outcome means judgment was never called at all
  asserts: A no-data seed that itself carries usage, elapsed_ms and prompt answers an outcome with none
    of the three.
- test:
    file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: throws naming the criterion rather than answering a default for a criterion nothing seeded
  asserts: evaluate for an unseeded criterion rejects with a message matching that criterion's name.
- test:
    file: src/__tests__/unit/seed.spec.ts
    name: FIXTURES_ROOT resolves, from the fixed path a real build places seed.js at, to the exact directory
      the fixtures are actually committed in
  asserts: The FIXTURES_ROOT URL segment, read out of seed.ts source by regex, resolves from dist/seed.js
    to the package's src/fixtures directory.
- test:
    file: src/__tests__/unit/seed.spec.ts
    name: does not redeclare the concept description guard or error that already stand in glossary.service.ts
  asserts: The seed.ts source text contains neither namesNoDescription nor ConceptDescriptionRequiredError.
- test:
    file: src/__tests__/unit/seed.spec.ts
    name: embeds none of the fixture's own concept description text as a literal string in its own source
  asserts: The seed.ts source text contains none of the descriptions in fixtures/glossary/concept.json.
- test:
    file: src/__tests__/unit/seed.spec.ts
    name: releases each manifested revision by calling lifecycle's own releaseHypothesisRevision operation
  asserts: The seed.ts source text contains the literal call text lifecycle.releaseHypothesisRevision(.
    It matches source text; it does not exercise any release.
- test:
    file: src/__tests__/unit/seed.spec.ts
    name: writes no raw SQL statement that sets hypothesis_revisions.state
  asserts: The seed.ts source text does not match UPDATE hypothesis_revisions SET state.
findings:
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: lines 21-23, the NO_REGISTERED_CAPABILITIES module constant
  cites: MNT-03
  evidence: "const NO_REGISTERED_CAPABILITIES: ICapabilitiesReader = {\n  readCapabilities: () => Promise.resolve([]),\n\
    };"
  cost: 'This exact object is redeclared in factories/connector-configuration-registry.factory.ts as the
    default value that same file supplies for this constructor''s second parameter (`capabilitiesReader:
    ICapabilitiesReader = NO_REGISTERED_CAPABILITIES` there, verbatim). Whatever "no capability registered"
    should mean is now decided in two places; changing one — to reject instead of resolving empty, say
    — leaves the other silently disagreeing, and nothing signals that the factory''s copy exists to be
    updated.'
  correction: Keep one definition of the no-op reader and have both call sites use it — either export
    it from this module for the factory to import, or drop the factory's own default and let the constructor's
    default apply.
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: lines 60-73, listConnectorConfigurations
  cites: PER-02
  evidence: 'const held = await this.store.readConnectorConfigurations();

    const total = held.length;

    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);'
  cost: IConnectorConfigurationStore.readConnectorConfigurations() takes no offset or limit at all, so
    every call to this listing reads every connector configuration currently held and then discards everything
    outside the requested page. The cost of answering page one of a ten-row page size scales with however
    many connectors are registered in total, not with the ten rows the caller asked for, and grows without
    bound as the registry fills up.
  correction: Give the store a query dedicated to a bounded page (an offset/limit-aware read issuing the
    corresponding SQL LIMIT/OFFSET) and have listConnectorConfigurations call that instead of slicing
    an already-fully-loaded array.
- pass: standard
  file: src/seed.ts
  where: lines 146-152, databasePoolOptionsFrom
  cites: MNT-03
  evidence: "function databasePoolOptionsFrom(env: Env): IDatabaseConnectionPoolOptions {\n  return {\n\
    \    maxConnections: env.DATABASE_POOL_MAX_CONNECTIONS,\n    idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,\n\
    \    statementTimeoutMs: env.DATABASE_POOL_STATEMENT_TIMEOUT_MS,\n  };\n}"
  cost: The same function, identical field-for-field, already exists in migrate.ts and in factories/diagnose-server.factory.ts.
    A change to how pool options are derived from Env — a renamed env field, an added pool option, a different
    default reconciliation — has to be found and repeated in three files, and whichever copy the next
    change misses quietly keeps deriving pool options the old way while the other two move on.
  correction: Extract one exported helper (for example beside IDatabaseConnectionPoolOptions in persistence/database-connection.ts)
    and have seed.ts, migrate.ts and diagnose-server.factory.ts all call it instead of each defining their
    own copy.
- pass: conformance
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: the duplicate-name test, lines 319-334 ("never ends up holding one concept name in two rows,
    even when the given array names it twice in one call")
  evidence: '"never ends up holding one concept name in two rows, even when the given array names it twice
    in one call — concepts.name''s own primary key resolves it to exactly one row, carrying the second
    entry''s own values"

    ...

    expect(rows).toEqual([{ ttl: 20, description: ''second entry, in the same call'' }]);'
  cost: Which of two entries naming the same concept in one writeConcepts call survives is a decision
    about how ambiguous input is resolved — a decision the specification makes explicitly elsewhere for
    other ambiguities (first-recorded-value-wins for subject attributes, a refused 500 for a name already
    held twice on read) but never makes for a concept named twice within one registration call. As written,
    "the second entry's own values win" lives only in this test and in whatever SQL upsert produces it;
    the next reader who wants to know what a batch registration guarantees for a repeated name will not
    find the answer in the specification, only in this assertion.
  correction: State, in domain/glossary/concept's Responsibility (or a policy node constraining it), what
    a registration call that names one concept more than once resolves to.
reconciliation: siegard-reconcile/post-reconcile-audit-corrections.md
run: run/post-reconcile-audit-corrections-review-suite
---

## What it is

Four independent passes -- coverage, conformance, standard and failures -- over the three tasks post-reconcile-audit-corrections delivered, and the reconciliation the conformance pass folded and bound against siegard-trace.json.

## Notes

None.
