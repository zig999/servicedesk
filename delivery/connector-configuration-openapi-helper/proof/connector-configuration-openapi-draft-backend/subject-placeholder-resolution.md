---
target: backend
title: Subject-placeholder resolution proof
summary: Vitest tests over resolveSubjectPlaceholders exercise every criterion, both
  UNDERDETERMINED entries and the recorded inferences by supplying a stand-in ICapabilitiesReader
  and asserting the returned SubjectPlaceholderPlacement's path/query/headers/body/unresolved
  fields.
implementation: sha256:c17fae296441c57678047cfb6db8d7ea096b0af80c58e15a46d09b0ff08e8edb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-subject-placeholder-resolution-suite
tests:
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names every parameter and request-body field name unresolved with no-capability-registered
    when no capability is registered at all
  proves: Where no capability is currently registered naming the draft's connector,
    every parameter and request-body field name is named unresolved with reason no-capability-registered.
  fails_when: outcomeFor stops returning no-capability-registered for every name once
    the connector-filtered registered array is empty, or unresolvedItems drops a name
    from the list.
  demonstrates: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names every name unresolved with no-capability-registered when only a capability
    naming a different connector is registered
  proves: Criterion 1's own qualifier -- naming the draft's connector -- so a capability
    registered for another connector counts as none registered.
  fails_when: the connector filter on readCapabilities()'s result is removed or loosened,
    letting a capability naming a different connector satisfy a name.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: generates no ${subject:...} placeholder text anywhere in the placement when
    no capability is registered
  proves: Where no capability is currently registered naming the draft's connector,
    no ${subject:...} placeholder is generated at all.
  fails_when: 'any position (path, query, headers, body) emits ${subject: text while
    the registered set is empty.'
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: places ${subject:<name>} at a path parameter's own position inside the substituted
    path
  proves: criterion 3, path-parameter clause -- the placeholder is placed inside the
    address at a path parameter's own position.
  fails_when: substitutedPath fails to substitute the path-parameter placeholder into
    the operation's own path template.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: places ${subject:<name>} as a query parameter's own key value
  proves: criterion 3, query-parameter clause.
  fails_when: recordFor stops emitting the resolved value under the query parameter's
    own key.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: places ${subject:<name>} as a headers key value, with no Cookie key when no
    cookie parameter is present
  proves: criterion 3, header-parameter clause, together with confirming no spurious
    Cookie key appears absent a cookie parameter.
  fails_when: recordFor stops emitting the resolved value under the header parameter's
    own key, or headersWithCookie adds a Cookie key with no cookie parameter present.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: places ${subject:<name>} inside the Cookie header's own value for a single
    cookie parameter
  proves: criterion 3, cookie-parameter clause.
  fails_when: cookieHeaderValue stops placing the resolved value inside the single
    Cookie header's value.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: places ${subject:<name>} as a top-level request-body field's own key value
  proves: criterion 3, request-body-field clause.
  fails_when: recordForNames stops emitting the resolved value under the body field's
    own key.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: joins two cookie-carried parameters into one Cookie header value separated
    by '; ', never dropping one of them or writing a second Cookie-like key
  proves: UNDERDETERMINED -- no criterion states that two cookie-carried parts of
    the same call are joined by '; ' inside the single Cookie header value; the rule
    already fixes this and the implementation joins every cookie-carried segment with
    '; '.
  fails_when: cookieHeaderValue writes only the last cookie segment, or writes a second
    Cookie-like header key instead of joining both into the one Cookie value.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names a name unresolved with no-matching-input-schema-property when the one
    registered capability does not declare that property
  proves: criterion 4 -- where at least one capability is registered and it declares
    no matching property key, the name is named unresolved with reason no-matching-input-schema-property,
    and is placed in its brace form.
  fails_when: outcomeFor resolves the name anyway, or reports a different reason,
    or the query record does not fall back to the brace form.
  demonstrates: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names a name unresolved with no-matching-input-schema-property when only one
    of two registered capabilities fails to declare it
  proves: criterion 4's any one of them clause -- one registered capability declaring
    the property does not save the name when a second, also registered, does not.
  fails_when: everyCapabilityDeclaresIt resolves the name as soon as one capability
    declares it, ignoring that a second registered capability does not.
  demonstrates: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: treats customerId as unresolved against a declared customer_id, generating
    no placeholder
  proves: criterion 5 and scenarios/integration/a-mismatched-parameter-name-stays-unresolved
    -- a name differing only by case or separator from a declared property is unresolved
    with no-matching-input-schema-property and generates no placeholder.
  fails_when: the property-key comparison folds case or normalizes separators, resolving
    customerId against a declared customer_id.
  demonstrates: scenarios/integration/a-mismatched-parameter-name-stays-unresolved
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names a name occupying two positions exactly once in the unresolved list,
    holding the brace form at both of its positions
  proves: criterion 6 (unresolved case) and criterion 10 -- no name reaches two outcomes,
    and an unresolved parameter still stands at its own position in the document's
    brace form, at both positions it occupies.
  fails_when: unresolvedItems emits two entries for the same name instead of one,
    or either position (the substituted path, the headers record) fails to hold the
    brace form.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: resolves a name occupying two positions consistently, placing the same placeholder
    at both of its positions and naming it in neither unresolved entry
  proves: the inference that a name occupying more than one position is named once
    (or not at all, if resolved) with its resolved value placed at every position
    it occurs.
  fails_when: the path substitution and the body-field record disagree on the placeholder
    value for the shared name, or the name is wrongly added to the unresolved list
    despite resolving.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: discloses none of the registered capabilities it read on the returned placement,
    whether one or several are registered
  proves: UNDERDETERMINED -- criterion 7 is satisfiable by handing the read capability
    set back to a caller, which rules/integration/a-connector-configuration-draft-response-carries-no-capability
    would then refuse; the implementation holds that set for its own matching only
    and discloses none of it.
  fails_when: the returned SubjectPlaceholderPlacement grows a field exposing the
    registered capability set (or any subset of it) to whatever calls resolveSubjectPlaceholders.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: returns the operation path unchanged, empty (not absent) query, headers and
    body records, and an empty unresolved list when the operation declares no parameters
    and no request-body fields
  proves: the inference that this module returns the operation's own path (not an
    assembled address) and always-present, possibly-empty query/headers/body records
    rather than an absent key -- the empty-input edge case.
  fails_when: the path is altered when no path parameter exists, or query/headers/body
    become undefined/absent instead of empty objects when nothing occupies them.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: propagates a failure the injected capabilities reader itself raises, rather
    than swallowing it
  proves: the dependency-failure edge case -- a failing ICapabilitiesReader is not
    swallowed into an empty or default result but surfaces as the same rejection.
  fails_when: resolveSubjectPlaceholders catches the reader's rejection and resolves
    anyway instead of propagating it.
not_applicable:
- edge_case: A boundary at each end of a stated numeric range
  why: No criterion or type here declares a range (no length, count or size limit)
    for resolveSubjectPlaceholders to bound.
- edge_case: An operation attempted against state that forbids it
  why: The module is a stateless computation over its arguments each call; there is
    no prior state that a call could be forbidden by.
- edge_case: Two operations against one subject at once (concurrency)
  why: resolveSubjectPlaceholders holds no shared mutable state between calls; two
    concurrent calls read independently through whatever capabilitiesReader each was
    given and cannot interfere with each other.
- edge_case: A duplicate where uniqueness is claimed, beyond the same-name-two-positions
    case
  why: The only uniqueness claim in these criteria is criterion 6 (a name reaches
    exactly one outcome), which duplicate parameter entries at the same name/location
    reduce to via the same Set-based deduplication already covered by the shared-name
    tests; a second, differently-shaped duplicate case is not named by any criterion.
untested:
- Criterion 8 (introduces no second lookup or second schema reader) is a structural
  claim about which functions the module calls -- that capabilitiesReader.readCapabilities
  and declaredInputSchemaShape are the only capability/schema sources -- and is not
  independently observable from the returned SubjectPlaceholderPlacement; every behavioral
  test here necessarily reads capabilities only through the injected reader (the function's
  only such parameter), but that no second mechanism exists alongside it is a reading-level
  claim this proof does not exercise at runtime.
- Criterion 9 (produced through the existing placeholder token vocabulary rather than
  a second one) is proven behaviorally only as far as the emitted text matches the
  exact string ${subject:<name>}; that this string is built from the same SUBJECT_PLACEHOLDER_KIND/argument-separator
  vocabulary connector-request-resolver.ts recognizes, rather than a second, coincidentally-identical
  constant, is a structural fact about which constant the source declares and is not
  observable from the placement value alone.
---

## What it is

Proof of the capability-side half of what a draft can honestly resolve.

## Notes

None.
