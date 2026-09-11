---
target: backend
implementation: sha256:08b827a0314040b57c283242aa5d2c869a69d472bb66f8532fb6b66eb22f6618
title: Proof of the domain reading behind read-openapi-document-operations
summary: Proves the backend reading that fetches an operator-named OpenAPI document through IOpenApiDocumentFetcher,
  parses it through the shared parse step, and answers every declared path/method operation whole or lets
  a fetch or parse refusal propagate unchanged.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-document-operations-reading-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: reads a path declaring a get and a post operation into two entries naming that same path, one
    per method
  proves: A fetched document declaring one path /items with a get operation and a post operation under
    it is read as two entries, one naming /items with GET and one naming /items with POST.
  fails_when: the two operations under /items are missing, merged into one, answered with a different
    path, or carry any field beyond path and method
  demonstrates: domain/integration/openapi-operation
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: upper-cases every method regardless of the case the document's own path-item key used
  proves: Every entry's method is upper-cased whatever case the document's own path-item key named it
    under.
  fails_when: any of the three tested casings (Get, PoSt, delete) is left un-upper-cased in the answer
  demonstrates: rules/integration/an-openapi-operations-method-is-upper-cased
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: names each entry's path exactly as the document declares it, unaltered
  proves: Every entry names the path exactly as the document declares it.
  fails_when: the path is rewritten, trimmed, lower-cased or otherwise altered from the document's own
    spelling
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: answers every operation across every path in one array, ignoring any page, cursor or limit-like
    field and truncating nothing
  proves: Every operation the document declares is answered in one answer, the read accepting no page,
    cursor, offset or limit and truncating nothing.
  fails_when: any of the six declared operations is dropped, or the presence of page/cursor/limit-like
    fields on the options changes how many operations come back
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: propagates the fetcher's own refusal unchanged for a network failure, a timeout, or a non-2xx
    status, attempting no parse
  proves: A read whose named link fails with a network failure, a timeout, or a response outside the 2xx
    range is refused naming the fetch failure, with no parse attempted and no operations read.
  fails_when: any of the three named fetch failures is swallowed or transformed into a different error,
    or the reading behaves as though a parse had been attempted afterward
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: resolves once the fetcher itself resolves, however long that takes, imposing no timeout of its
    own
  proves: The fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds,
    delivered by the existing IOpenApiDocumentFetcher port rather than by a second timeout introduced
    here.
  fails_when: the reading itself times out or rejects before the injected fetcher resolves, rather than
    waiting on the fetcher alone
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: answers with an empty operations array when the fetched document declares no paths at all
  proves: Every operation the document declares is answered in one answer, truncating nothing -- including
    the empty-document boundary, which answers no operations rather than refusing or throwing.
  fails_when: an empty paths member is refused, throws, or answers anything other than an empty operations
    array
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: refuses a document declaring swagger 2.0, naming the declared version, with no operations read
  proves: A read whose fetched document declares swagger 2.0 is refused naming the declared version, and
    no operations are read.
  fails_when: a swagger 2.0 document is read into operations instead of refused, or the refusal does not
    name the declared version 2.0
  demonstrates: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: refuses fetched text that parses as neither JSON nor YAML, naming what failed to parse
  proves: A read whose fetched document's text parses as neither JSON nor YAML is refused naming what
    failed to parse, and no operations are read.
  fails_when: unparseable text is read into an (empty or partial) operations answer instead of refused,
    or the refusal does not name what failed to parse
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: refuses a document that parses but declares no version at all, naming that distinctly from a parse
    failure or an unsupported version
  proves: A read whose fetched document parses but declares no version at all is refused naming that the
    document declares no version, that naming distinct from a parse failure and from a declared-but-unsupported
    version, and no operations are read.
  fails_when: a document with neither an openapi nor a swagger field is answered with operations, or its
    refusal is named unparseable or unsupported-version instead of no-version-declared
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: reads a YAML OpenAPI 3.x document into the same operations as the equivalent JSON document
  proves: A YAML OpenAPI 3.x document is read into the same operations a JSON document of the same content
    is read into, the serialization decided by parsing the fetched text and never by any content type
    the response declared.
  fails_when: the YAML and JSON forms of the same document answer with different operations
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: answers strictly from whatever the injected fetcher resolves, with no alternate source for the
    document text
  proves: The document fetch is issued inside this backend reading through IOpenApiDocumentFetcher.
  fails_when: swapping the injected fetcher's own returned document text does not change the answer, indicating
    the reading reads from some source other than the fetcher it was given
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: answers with exactly the operations it read, generating no connector configuration draft and issuing
    no register-connector call
  proves: The reading generates no connector configuration draft and issues no register-connector call.
  fails_when: the answer carries any field besides operations -- a configuration, unresolved, generated_credentials
    or method_mismatch field a connector configuration draft would carry -- or omits an operation the
    document declares
  demonstrates: domain/integration/openapi-document-operations
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: refuses every out-of-range declared version, not only swagger 2.0, naming the version each document
    declares
  proves: UNDERDETERMINED, from the specification -- refuses any declared version outside OpenAPI 3.x,
    not only Swagger 2.0.
  fails_when: an implementation that special-cases only the literal swagger 2.0 declaration lets an openapi
    4.0.0 or a swagger 1.2 document through unrefused, or refuses either without naming the declared version
- file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  name: keeps a fetch failure and an unreadable document as two distinguishable refusals, neither an instance
    of the other
  proves: UNDERDETERMINED, from the specification -- the reading must raise two distinguishable error
    values rather than one undifferentiated refusal, for the HTTP task to map each separately.
  fails_when: a fetch failure and an unreadable document collapse into the same error type, the same name,
    or any single undifferentiated refusal
not_applicable:
- edge_case: two operations-read requests against the same link running at once
  why: no node states a concurrency guarantee for this stateless, side-effect-free read, and a test would
    assert a guarantee nobody made
- edge_case: an absent or empty link string
  why: link validation is the HTTP surface own boundary concern (task/openapi-document-operations-read/read-operations-http-operation),
    not a criterion this domain reading states
- edge_case: a non-2xx response whose body happens to still parse as a valid OpenAPI document
  why: the existing, unmodified OpenApiDocumentFetcher adapter already refuses before returning any body
    at all on a non-2xx answer, so this reading never sees such a body to make a choice about
untested:
- Criterion 'the reading parses through the shared unit, holding no parse or version-refusal code of its
  own' is an architectural/reuse fact this project's own standard assigns to human reading review (MNT-03),
  rather than to a test; a behavioral test cannot distinguish genuine delegation from an independent reimplementation
  that happens to produce identical output.
- Criterion 'the reading offers no parameter by which a caller supplies already-fetched document text'
  -- the no-bypass-parameter half is a compile-time contract enforced by the strict TypeScript compiler
  (STK-01/TYP-01) rather than by a runtime test; the fetch-is-the-sole-source half is behaviorally tested.
- 'rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read: this reading own contribution
  is tested, but the 60000ms abandonment figure is the existing OpenApiDocumentFetcher adapter own fact,
  already proven at that adapter own delivery.'
- 'rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read: the clause
  refusing a document that declares OpenAPI 3.x yet is not otherwise well-formed reaches no criterion
  of this task and is already proven by the shared parse step own delivery.'
- 'contracts/integration/openapi-document-operations: the fact as the published operation reachable by
  the Configuration Helper is realized jointly with task/openapi-document-operations-read/read-operations-http-operation
  own wiring; no single test in this suite decides the contract fact whole.'
- 'constraints/the-openapi-document-is-fetched-by-the-backend: this task own half is tested, but the fitness
  function is a dependency and network-call audit over the frontend module, outside this backend task
  test suite.'
- 'Implementation inference: the eight recognized OpenAPI path-item method keys, matched case-insensitively,
  is not pinned by a test beyond the specific method names this suite happens to exercise.'
- 'Implementation inference: a path item declared as a $ref pointer is not resolved and yields no operations
  for that path -- left unproven rather than pinned by a test.'
- 'Implementation inference: operations are listed in the document own declaration order rather than a
  fixed canonical ordering -- beyond the literal example this suite tests, the general ordering claim
  is not pinned by a further test.'
- 'UNDERDETERMINED, from the specification -- the clause refusing a parsed-and-versioned-3.x document
  that is not otherwise well-formed: no criterion reaches it, so no test is owed and none is invented;
  the absence is recorded here.'
---

## What it is

Fifteen tests over the new operations-reading unit: the listing shape, method upper-casing, path fidelity, whole-answer behavior, the fetch and parse refusals it inherits, YAML/JSON parity, and the two UNDERDETERMINED clauses the task carried.

## Notes

None.
