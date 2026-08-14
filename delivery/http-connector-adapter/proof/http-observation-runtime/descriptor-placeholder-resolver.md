---
title: Proof for the connector request-assembly translation
summary: What proves task/http-observation-runtime/descriptor-placeholder-resolver — each of the five
  criteria and all eight recorded inferences held by tests that fail when the behavior stops holding,
  with one test added to close the multiple-placeholders-per-template gap.
implementation: sha256:7f2c024471d9385ff350937119fccc1827f11b5ff4d33b24ddb41cc12c976dc7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-descriptor-placeholder-resolver-suite-2
tests:
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes a Subject-drawn value into the descriptor's address
  proves: A value drawn from the Subject the collection stage passed in can appear in any part of the
    assembled request (address, query, headers or body) that the connector's configuration designates,
    through template substitution rather than by evaluating the configuration as executable code — no
    eval, Function constructor, or equivalent dynamic-code-execution path places it there. (the address
    part)
  fails_when: a '${subject:<attribute>}' token inside the address stops being replaced with the Subject's
    own attribute value, or the assembled address stops carrying the substituted text.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes a Subject-drawn value into a query value
  proves: the same criterion's query part.
  fails_when: a placeholder inside a declared query value stops being substituted, or query values stop
    reaching the substitution path at all.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes a Subject-drawn value into a header value
  proves: the same criterion's headers part.
  fails_when: a placeholder inside a declared header value stops being substituted.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes a Subject-drawn value nested arbitrarily deep inside the body
  proves: the same criterion's body part, over an arbitrarily nested object-and-array body.
  fails_when: the recursive body walk stops descending into nested objects or arrays, so a placeholder
    below the top level ships as literal text.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes every placeholder when several sit inside one template, rather than only the first
  proves: 'the same criterion''s ''any part ... that the connector''s configuration designates'', together
    with the implementation''s recorded inference that an unresolved ''${...}'' token is never left embedded
    in a live outbound request — a configuration may designate several placements inside one template.
    (Added by this proof: every pre-existing test placed exactly one placeholder per template, so a substitution
    that stopped being global passed the whole suite.)'
  fails_when: the substitution stops being global over one template — e.g. PLACEHOLDER_PATTERN loses its
    g flag — leaving every placeholder after the first as literal unresolved text in the assembled request.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: places every substituted value by ordinary string replacement — the resolver holds no eval, Function
    constructor, dynamic import or require anywhere in its own source
  proves: the same criterion's 'no eval, Function constructor, or equivalent dynamic-code-execution path
    places it there' — the criterion itself states the totality over this task's own module, so the test
    states it as written, over the resolver's own source text.
  fails_when: eval, the Function constructor, a dynamic import() or require() appears anywhere in connector-request-resolver.ts.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: reads a credential from the named environment variable, with the secret value appearing nowhere
    in the configuration itself
  proves: A credential a connector's call needs is read from an environment variable or an equivalent
    secret source by name at resolution time, never from a plain-text value stored in the same row as
    the rest of the connector's configuration.
  fails_when: the assembled header stops carrying the environment's own value for the named variable,
    or the resolution stops going through the env source the call supplies.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: reads the named environment variable at resolution time rather than a value cached from an earlier
    call — two calls against the same variable name each answer with that call's own environment
  proves: the same criterion's "at resolution time" half, and that no credential value is cached across
    calls.
  fails_when: the resolver caches an environment read at module load or across calls, so the second call
    answers with the first call's value.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses before assembling anything when a placeholder names a Subject attribute the Subject does
    not carry
  proves: Resolution over an attribute the Subject the collection stage assembled does not carry is refused
    before any request is sent, rather than proceeding with a missing or empty value substituted in its
    place.
  fails_when: resolveConnectorRequest returns an assembled request instead of throwing ConnectorPlaceholderNotResolvedError,
    or the refusal stops naming the missing attribute in its context.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a Subject attribute present as the empty string exactly as it refuses one the Subject
    does not carry at all
  proves: the implementation's recorded inference that 'a Subject attribute a placeholder names that is
    present but holds the empty string is refused the same way as one the Subject does not carry at all'
    — the criterion's own 'missing or empty' read symmetrically, pinned rather than incidental.
  fails_when: an empty-string attribute value is substituted into the request instead of refused.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a credential placeholder naming an environment variable that is not set
  proves: the implementation's recorded inference that a named environment variable that is unset is refused
    fail-closed rather than substituted blank, extending criterion 3's pattern to criterion 2's mechanism.
  fails_when: an unset variable resolves to an empty or undefined substitution instead of ConnectorPlaceholderNotResolvedError.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a credential placeholder naming an environment variable that is set to the empty string,
    never carrying that value in the refusal
  proves: the empty half of the same inference, and the implementation record's claim that the error carries
    only the variable's name, never a resolved value.
  fails_when: an empty variable is substituted instead of refused, or the error's context starts carrying
    anything beyond the kind and the variable's own name.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: substitutes the collection's own requester identity wherever '${requester}' appears in the connector's
    configuration
  proves: The requester identity the collection call carries is available to the connector's configuration
    for placement into the assembled request through the same substitution mechanism as a Subject-drawn
    value, so that giving one connector's call a requester-scoped parameter is a change to that connector's
    own configuration, never a change to the resolution mechanism itself.
  fails_when: a '${requester}' token in a connector's own configuration stops resolving to the call's
    requester through the ordinary substitution path — i.e. requester placement starts needing anything
    beyond a configuration change.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: carries whichever requester the caller passed for that one call, unchanged, rather than a default
    or a value left over from an earlier call
  proves: the same criterion's per-call half, and the implementation record's claim under rules/investigation/collection-runs-in-the-requester-scope
    that no default or service-wide identity exists for the placeholder to resolve to.
  fails_when: a requester value is defaulted, transformed, or leaks from one call into the next.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a configuration that declares no address
  proves: the implementation's recorded inference that 'address is required to be a non-empty string ...
    before any substitution is attempted' (absent-input edge case).
  fails_when: a configuration with no address is translated instead of refused with IncompleteConnectorCallDescriptorError.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: treats an address declared as the empty string as no address at all
  proves: the empty half of the same inference (empty-input edge case).
  fails_when: an empty address passes narrowing and an addressless request is assembled.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a configuration whose declared query is not a plain object of string values
  proves: the same inference's 'a declared query or headers must be a plain object of string values' half,
    over query.
  fails_when: a malformed query is coerced or passed through instead of refused before substitution.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a configuration whose declared headers is not a plain object of string values
  proves: the same, over headers.
  fails_when: malformed headers are coerced or passed through instead of refused before substitution.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a placeholder naming a kind this resolver does not recognize, rather than leaving it as
    literal unresolved text
  proves: the implementation's recorded inference that 'a placeholder naming an unrecognized kind ...
    is refused as a malformed descriptor rather than left as literal unresolved text in the assembled
    request.'
  fails_when: an unrecognized placeholder kind ships as literal text in a live request instead of raising
    IncompleteConnectorCallDescriptorError.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a bare "${subject}" placeholder naming no attribute to resolve
  proves: the same inference's no-argument half, over the subject kind.
  fails_when: a bare subject placeholder resolves to anything at all instead of being refused as malformed.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: refuses a bare "${credential}" placeholder naming no environment variable to resolve
  proves: the same, over the credential kind.
  fails_when: a bare credential placeholder resolves to anything at all instead of being refused as malformed.
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: defaults query and headers to the empty object when the descriptor declares neither
  proves: the implementation record's declared AssembledConnectorRequest shape ('query and headers always
    present, defaulting to {}') — the empty-collection edge case — and, through the spec compiling while
    passing a plain object literal as configuration, the recorded inference that the configuration parameter
    is typed structurally as Readonly<Record<string, unknown>> rather than by the registry's own type.
  fails_when: an undeclared query or headers arrives absent rather than as {}, or the configuration parameter
    stops accepting a plain structural record (the spec then no longer typechecks).
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: leaves the body absent when the descriptor declares none, rather than defaulting it to an empty
    value
  proves: the body half of the same declared shape — absent stays absent, never invented.
  fails_when: an undeclared body is defaulted to {} or another invented value.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports an HTTP client package
  proves: No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary)
    imports this translation module, its secret-reading mechanism, or any HTTP-request-building package
    directly. (the HTTP-request-building-package half, swept over all four domain directories)
  fails_when: any module under case/, glossary/, capability-registry/ or investigation/ imports axios,
    node-fetch, got, undici, ws, superagent or request.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports the connector-request-resolver module or its call-descriptor vocabulary,
    by any relative path, except this epic's own legitimate HTTP adapter
  proves: the same criterion's translation-module half — and, since resolveCredentialPlaceholder is never
    exported, its secret-reading-mechanism half too, importing the module being the only way to reach
    it.
  fails_when: any audited domain module other than the sibling task's declared adapter gains an import
    reaching connector-request-resolver or connector-call-descriptor by any relative path.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports either error the connector-request-resolver raises, by any relative
    path
  proves: the same criterion, closed over the two error classes this task ships — the remaining static
    route by which domain code could couple to this translation.
  fails_when: any audited domain module imports incomplete-connector-call-descriptor.error or connector-placeholder-not-resolved.error.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules holds any mention of the http-connector module or its exports outside a
    static import — a dynamic lookup, a global registry, or a string-keyed service locator would not show
    up as an import specifier at all, which is exactly the gap this task's own Notes call out — except
    this epic's own legitimate HTTP adapter
  proves: 'the task''s Notes entry on criterion 5: the note names the implementation the criterion''s
    literal wording lets through — domain code reaching this translation via a dynamic lookup, a global
    registry or a string-keyed service locator — and this test fails over exactly that implementation,
    by scanning each domain module''s raw source for any mention of the module or its exports.'
  fails_when: any audited domain module other than the declared adapter mentions http-connector, connector-request-resolver,
    connector-call-descriptor, resolveConnectorRequest or asConnectorCallDescriptor anywhere in its source,
    however referenced.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: IObservationSource is still declared as an interface in observation-source.port.ts — the one real
    port at the domain boundary this task must not be bypassed by
  proves: the other half of the same Notes entry — 'a test should confirm an actual port/interface exists
    at the domain boundary, not merely the absence of a static import' — per constraints/the-domain-depends-on-no-infrastructure's
    ports clause.
  fails_when: observation-source.port.ts stops declaring IObservationSource as an exported interface,
    leaving no port at the boundary for a future adapter over this resolver to stand behind.
not_applicable:
- edge_case: a Subject carrying two attribute-value pairs under one attribute name
  why: no criterion and no bound node claims uniqueness over a Subject's attribute pairs, so a test would
    assert a guarantee nobody made about which pair wins.
- edge_case: two resolutions against one subject at once
  why: resolveConnectorRequest is a pure synchronous function holding no state between calls; the two
    per-call tests (credential read at resolution time, requester carried per call) already fail if cross-call
    state appears, which is the only way concurrency could observe anything.
- edge_case: a dependency that fails or answers slowly
  why: the module's only dependency is a synchronous read of the env record the caller supplies; the one
    failure that source admits — absence or emptiness of the named variable — is tested directly, and
    nothing here can be slow or unavailable.
- edge_case: a boundary at each end of a stated range
  why: no criterion states a numeric range or length bound anywhere in this task.
untested:
- 'The implementation record''s inference that no new port or interface is declared for the resolver itself:
  its positive half (the port that does exist) is held by the IObservationSource-interface test, but the
  ''no second port anywhere'' half is a totality over files a behavioral test could only assert by counting
  a directory sibling tasks legitimately land in — the implementation record''s files list is the record
  of it.'
- A body carrying non-string leaves (numbers, booleans, null) passes them through unchanged — the resolver's
  own documented design, stated by no criterion, exercised by no test.
- asConnectorCallDescriptor's separately-exported narrowing surface is exercised only through resolveConnectorRequest;
  no test calls the export directly.
- 'The three contract clauses this task''s Notes route elsewhere — answering in the glossary''s vocabulary,
  the capability''s timeout, and the read-only assertion — are unproven here by design: each belongs to
  a sibling task (response normalization, dispatch/budget, whichever task fixes a connector''s HTTP method),
  and this resolver never reaches any of them.'
---

## What it is

The two data-transform judgments of the adapter's request side: placeholder substitution over address, query, headers and body, credential resolution by name at call time, and the refusals that keep an unresolved token out of a live request.

## Notes

This proof was composed after the delivery's own suite step: at delivery time the tree's suite was red on 2 pre-existing failures outside this change's file set — the closed EXPECTED_MIGRATION_FILENAMES enumeration owned by task/relational-substrate/migration-step of the relational-persistence initiative — and a record over a run that did not pass is refused, so no proof was written then.
That assertion was re-judged whole through the proof-only re-delivery of its owning task, the suite is green, and this record cites its own passing captured run.
One test was added by this judgment — several placeholders inside one template — because every pre-existing test placed exactly one placeholder per template, so a substitution that stopped being global passed the whole suite.
