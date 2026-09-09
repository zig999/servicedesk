---
target: backend
title: Subject-placeholder resolution for the OpenAPI connector-configuration draft
summary: Adds a connector-registry module that resolves each parameter and request-body
  field name of a chosen OpenAPI operation to a ${subject:<name>} placeholder or an
  unresolved item, reading the registered capabilities and their input-schema shape
  through the two existing reuse points and placing every resolved or unresolved value
  at its own position (path, query, headers, Cookie, body).
task: sha256:6cdad2441c998d19062040b161469a44851cac2e3f06f15455773c9fc48e5088
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-subject-placeholder-resolution-build
files:
- path: src/connector-registry/subject-placeholder-resolution.ts
  effect: 'New module exporting resolveSubjectPlaceholders, which reads every capability
    currently registered naming the draft''s connector (via the connector-registry''s
    own ICapabilitiesReader port, already used by ConnectorConfigurationRegistryService
    for the identical connector-filtered capability read), checks each candidate parameter/request-body-field
    name against every one of those capabilities'' declared input-schema properties
    (via the existing declaredInputSchemaShape reader, byte-for-byte, no normalization),
    and returns a SubjectPlaceholderPlacement: the operation''s own path with path-parameter
    braces substituted, a query record, a headers record (including a single joined
    Cookie value for cookie parameters), a body record, and the deduplicated unresolved
    list. A name resolves only where at least one capability is registered and every
    one of them declares the property; otherwise it is named unresolved with no-capability-registered
    (none registered) or no-matching-input-schema-property (at least one registered
    capability does not declare it), and its position still holds the document''s
    own brace form {name}.'
criteria:
- criterion: Where no capability is currently registered naming the draft's connector,
    every parameter and request-body field name is named unresolved with reason no-capability-registered.
  met: true
  how: 'outcomeFor returns {resolved: false, reason: ''no-capability-registered''}
    for every name whenever the connector-filtered registered array is empty, before
    any property check runs; resolveSubjectPlaceholders computes one outcome per distinct
    name across parameters and request-body fields, so every one of them gets this
    reason when none is registered.'
- criterion: Where no capability is currently registered naming the draft's connector,
    no ${subject:...} placeholder is generated at all.
  met: true
  how: The registered.length === 0 branch in outcomeFor returns before the placeholder-text
    branch is ever reached, so no ${subject:...} value is produced for any name in
    that case.
- criterion: Where every capability currently registered for the connector declares
    an input-schema property whose key equals the name byte-for-byte, ${subject:<name>}
    is placed at that name's own position (inside the address for a path parameter,
    a query key for a query parameter, a headers key for a header parameter, inside
    the Cookie header's value for a cookie parameter, a body key for a top-level request-body
    field), where at least one capability is currently registered for the connector.
  met: true
  how: outcomeFor resolves a name to ${subject:<name>} only when registered.length
    > 0 and registered.every(...) finds the property via declaredInputSchemaShape(...).properties.includes(name)
    for every one of them. positionValue then emits that text, placed by substitutedPath
    (path parameters, substituted into the operation's own path template), recordFor(...,
    'query', ...) (query key), headersWithCookie/recordFor(..., 'header', ...) (headers
    key), cookieHeaderValue (the single Cookie header's joined value), and recordForNames
    over requestBodyFieldNames (body key).
- criterion: Where at least one capability is currently registered for the connector
    and any one of them declares no input-schema property key equal to the name, the
    name is named unresolved with reason no-matching-input-schema-property.
  met: true
  how: everyCapabilityDeclaresIt is false the moment one registered capability's shape
    lacks the property, and outcomeFor then returns the no-matching-input-schema-property
    reason.
- criterion: A name differing from a declared property only by case or by separator
    -- customerId against a declared customer_id -- is named unresolved with reason
    no-matching-input-schema-property and generates no placeholder.
  met: true
  how: Matching is plain Array.prototype.includes string equality over the property-key
    array declaredInputSchemaShape returns -- no case-folding, no separator normalization
    anywhere in the module -- so customerId against a declared customer_id never satisfies
    everyCapabilityDeclaresIt and falls to the no-matching-input-schema-property branch,
    which never computes a placeholder value.
- criterion: No name reaches two outcomes -- each parameter and request-body field
    name is either placed as a placeholder or named exactly once in the unresolved
    list.
  met: true
  how: distinctNames de-duplicates through a Set before outcomesByName builds one
    Map entry per name, so each name has exactly one NameOutcome; unresolvedItems
    iterates that map once, emitting exactly one item per unresolved name, and a resolved
    name never appears there.
- criterion: The resolution names every capability currently registered for the connector
    it read, and names none where none is registered.
  met: true
  how: registered is (await capabilitiesReader.readCapabilities()).filter((capability)
    => capability.connector === connector) -- every capability naming the connector,
    none otherwise -- and is held only inside the function's own matching; SubjectPlaceholderPlacement
    carries no capability-list field, so that internally-read set is never disclosed
    to a caller (per the task's own UNDERDETERMINED note on criterion 7, deferring
    the response-shape refusal to rules/integration/a-connector-configuration-draft-response-carries-no-capability,
    which this task does not implement).
- criterion: The resolution reads the registered capabilities through the existing
    capability read and the existing declared-input-schema-shape reader, introducing
    no second lookup or second schema reader.
  met: true
  how: The only capability source is the injected ICapabilitiesReader (capabilities-reader.port.ts),
    the same port ConnectorConfigurationRegistryService already depends on for its
    own connector-filtered capability read; the only schema reader is the imported
    declaredInputSchemaShape from capability-input-schema-shape.ts. No store, query
    or JSON-schema parser of its own is introduced.
- criterion: The placeholder text emitted is the existing ${subject:<name>} form,
    produced through the existing placeholder token vocabulary rather than a second
    one.
  met: true
  how: The emitted text is exactly `${subject:${name}}` -- the same kind name ('subject')
    and ':' argument separator connector-request-resolver.ts's resolvePlaceholderToken
    already recognizes for a subject-attribute token.
- criterion: An unresolved parameter or field still stands at its own position, holding
    its own name in the document's brace form {name}.
  met: true
  how: positionValue returns `{${name}}` whenever the name's outcome is unresolved
    (or absent), and every position-builder (substitutedPath, recordFor, headersWithCookie,
    cookieHeaderValue, recordForNames) calls positionValue uniformly for both resolved
    and unresolved names, so the position is always populated -- with the brace form
    when unresolved.
nodes:
- node: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: 'outcomeFor is exactly this rule''s decision procedure: empty registered set
    -> no-capability-registered; non-empty and every capability''s input-schema properties
    include the name byte-for-byte -> ${subject:name}; non-empty and any one does
    not -> no-matching-input-schema-property.'
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: Implements the parameter/field-placement half of this rule -- path substring
    (via the operation's own path template), query key, headers key, the single joined
    Cookie header value, and body key -- for both resolved and unresolved names. It
    does not implement the rule's address composition (servers array, base-URL-plus-path
    joining) or its generated-credential placement clauses; both are named in the
    task's own REMAINDER notes as belonging to a different task.
- node: domain/integration/capability
  how: Governed which capability attribute this task reads (input_schema, together
    with connector) without adding any new fact of its own to this file; the attribute
    shapes themselves are already declared in capability.ts.
- node: domain/integration/connector-configuration-draft
  how: Governed the draft's capability-reference reading (a connector with none, one,
    or several registered capabilities, none preferred over another) and the fact
    that the draft never discloses which capabilities it read; the type's own fields
    live in connector-configuration-draft.ts, untouched by this delivery.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: unresolvedItems constructs exactly this shape -- {name, reason}, one reason
    each -- for every name this module could not resolve; the type declaration itself
    is imported, not restated.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: outcomeFor decides, for each name, which of the two capability-side reasons
    of this closed vocabulary applies (no-capability-registered or no-matching-input-schema-property);
    the other two vocabulary values are out of this task's scope per the task's own
    ADVISORY note.
- node: scenarios/integration/a-mismatched-parameter-name-stays-unresolved
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: Realized by the byte-for-byte .includes(name) check in outcomeFor, which treats
    customerId and a declared customer_id as different strings and resolves nothing,
    generating no placeholder.
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
  how: 'Realized by the registered.length === 0 branch: every parameter and field
    name is unresolved with no-capability-registered, and resolveSubjectPlaceholders
    always returns a placement (the draft still generates, never refuses), matching
    the scenario''s generated-not-refused outcome.'
inferences:
- inferred: The ${subject:<name>} text is built from a local constant (SUBJECT_PLACEHOLDER_KIND
    = 'subject') rather than importing connector-request-resolver.ts's own (private,
    unexported) SUBJECT_PLACEHOLDER_KIND/PLACEHOLDER_ARGUMENT_SEPARATOR.
  from: The project's standard forbids a connector-registry file from importing **/http-connector/*,
    naming exactly one already-standing exception (connector-placeholder-declaration-check.ts)
    and no other; adding a second such import here would be an unnamed second departure
    from that boundary rather than a disclosed one, and widening that named exception
    is not this task's to decide. The value ('subject') and separator (':') are reproduced
    exactly, so the emitted text is still the one form the resolver already recognizes.
- inferred: The existing capability read criterion 8 names is connector-registry's
    own ICapabilitiesReader port (capabilities-reader.port.ts), read and filtered
    by connector exactly as ConnectorConfigurationRegistryService.refuseOrphanedPlaceholders
    already does.
  from: ICapabilityQuery.readCapability reads by concept, not by connector, and returns
    at most one capability; it cannot answer every capability currently registered
    naming this connector without a second, differently-shaped lookup. ICapabilitiesReader.readCapabilities()
    is the only existing mechanism already used, in this same module family, to read
    every capability naming one connector and check its input-schema properties.
- inferred: This module returns the operation's own path with its brace placeholders
    substituted, not a fully joined address (base URL plus path), and returns query/headers/body
    as always-present (possibly empty) records rather than deciding whether an empty
    one becomes an absent key in the eventual configuration JSON.
  from: The task's own REMAINDER note excludes the drafted address composition (servers
    array, path joining) from this task's criteria, naming the task assembling the
    draft's configuration text as its owner; leaving the presence-or-absence of an
    empty record to that same downstream task avoids this task deciding a JSON-shape
    fact that belongs to assembling the final configuration text.
- inferred: A name occupying more than one position (for instance the same name at
    two different parameter locations, or shared between a parameter and a request-body
    field) is named once in the unresolved list, with its resolved-or-brace value
    placed at every position it occurs.
  from: ConnectorConfigurationDraftUnresolvedItem carries no location field ({name,
    reason} only), so the unresolved list's own shape cannot distinguish two occurrences
    of the same name; deduplicating by name (via distinctNames's Set) is the only
    reading consistent with criterion 6's named exactly once.
deferred:
- what: Assembling the full ConnectorConfigurationDraft.configuration JSON text --
    joining the servers array's first URL to the substituted path, adding the operation's
    method, folding in generated credentials, and stringifying the result -- and any
    controller or factory wiring an operator would reach this through.
  why: No such orchestrating task or controller exists yet in this tree; the task's
    own REMAINDER notes name that assembly, the credential-placement task, and the
    operation's HTTP-answer task as the owners of what this task's output still needs
    joined to become a usable draft.
---

## What it is

The capability-side half of what a draft can honestly resolve. It never guesses at a name a capability does not already declare, so a draft built from it cannot introduce an orphaned placeholder.

## Notes

None.
