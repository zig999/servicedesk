---
target: frontend
title: Choosing an operation carries the fetched document's own pairing into the helper's draft
summary: Tests over useConnectorConfigurationHelper prove the offered entries track the currently named
  link, choosing one names the draft's path and method, and the read's own outcome is exposed independently
  of the draft's -- plus one guard test over the implementation the task's second UNDERDETERMINED note
  names.
implementation: sha256:757fb4baffe5d8f77d6b9c2d00ce73c6ed7efe75c195187f9757764550d66818
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-helper-operation-choice-state-suite-2
tests:
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- operations exposes the operations read for the link currently
    named in the helper (criterion 1) > exposes exactly the operations the read answered for the named
    link, once it resolves
  proves: The state exposes, as the entries offered for choice, the operations read for the link currently
    named in the helper.
  fails_when: operations omits, reorders-and-loses, or pads entries relative to what the read for the
    currently named link answered.
  demonstrates: domain/integration/openapi-document-operations
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- naming a different link makes the offered entries those of
    the newly named link (criterion 2) > replaces the offered operations with the newly named link's own
    operations once the read for it resolves
  proves: Naming a different link in the helper makes the offered entries those of the newly named link.
  fails_when: the offered operations keep the previous link's entries, or never update, once the helper
    is given a different link.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- choosing an offered entry sets the helper's path and method
    to that entry's own path and method (criteria 3, 4) > sets both path and method from the chosen entry,
    and from no other source
  proves: Choosing an offered entry makes the helper's path that entry's path. / Choosing an offered entry
    makes the helper's method that entry's method.
  fails_when: choosing an entry leaves the helper's path or method unset, or sets either to a value other
    than that entry's own.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- choosing the /items, POST entry from a document listing a get
    operation and a post operation makes the draft request name /items and POST (criterion 5) > issues
    a draft request naming /items as its path and POST as its method once that entry is chosen
  proves: Given a read answering a document declaring /items with a get operation and a post operation,
    choosing the entry naming /items and POST makes the draft request the helper then issues name /items
    as its path and POST as its method.
  fails_when: the draft request the helper issues names a path or a method other than /items and POST
    after that entry is chosen -- e.g. naming the GET entry's pairing, an empty value, or a value the
    operator did not choose.
  demonstrates: scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- choosing the /items, POST entry from a document listing a get
    operation and a post operation makes the draft request name /items and POST (criterion 5) > issues
    a draft request naming /items as its path and POST as its method once that entry is chosen
  proves: use-connector-configuration-helper.spec.ts's fetch stub answers the operations-read route as
    well as the draft route, and every assertion that file already makes about the draft request still
    holds.
  fails_when: the stub fails to answer the operations-read route (leaving the read outstanding rather
    than resolving to the /items GET and POST operations) or the draft route's captured request body stops
    matching the shape this file's existing assertions already check -- a JSON object naming connector,
    link, path and method.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: 'useConnectorConfigurationHelper -- the operations read''s outcome is exposed distinct from the
    draft request outcome (criterion 6) > keeps operationsOutcome and outcome independent: naming a link
    changes only operationsOutcome, and requesting a draft changes only outcome'
  proves: The state exposes the operations read's own outcome as a value distinct from the draft request
    outcome it already exposes.
  fails_when: operationsOutcome and outcome are not kept independent -- naming a link changes outcome,
    requesting a draft changes operationsOutcome, or the two collapse into one shared field.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: useConnectorConfigurationHelper -- no request is issued to the operator-named link itself, only
    to the backend's own operations-read route (UNDERDETERMINED note 2) > issues no fetch call whose URL
    is the operator-named link, once that link is named
  proves: 'UNDERDETERMINED, from the specification -- constraints/the-openapi-document-is-fetched-by-the-backend,
    tested against the implementation the task''s own note names: a hook whose entries come from a direct
    client-side fetch and parse of the operator-named link rather than from the backend''s own operations-read
    route.'
  fails_when: a fetch call is issued whose URL is exactly the operator-named link -- a direct client-side
    fetch of the OpenAPI document itself -- rather than only calls to the backend's own operations-read
    route.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
not_applicable:
- edge_case: An idle/no-link state (operations before any link is named)
  why: No criterion of this task states what operations or operationsOutcome must be before a link is
    named; that idle behavior is inherited unchanged from useOpenApiDocumentOperations's own outcomeFromQuery,
    whose idle case is already the dependency task's own tested behavior. This task's own operationsOfferedFor
    default is a straight pass-through of that outcome's kind, not a decision this task makes.
- edge_case: A document declaring zero operations (empty list forwarded)
  why: operations forwards operationsOutcome's own array unconditionally regardless of its length -- there
    is no branch in this hook's code that treats an empty list differently from a populated one, and the
    dependency hook's own spec (use-openapi-document-operations.spec.ts) already demonstrates that an
    empty read resolves to an empty, not absent, operations array. A zero-length representative here would
    duplicate that evidence without protecting anything this hook decides on its own.
- edge_case: Duplicate operations in the read's answer
  why: No node or criterion claims uniqueness over the offered entries; operations is exposed whole, exactly
    as answered, so a duplicate is forwarded like any other entry through the same code path criterion
    1's test already covers.
- edge_case: A refused or still-pending operations read while the operator interacts with the helper
  why: The task's own REMAINDER notes assign the offering condition and the refusal-disclosure surface
    to sibling tasks (the tasks wiring the helper's outstanding and refused read states); no criterion
    of this task states what onChooseOperation or the rendered surface does while operationsOutcome is
    not yet "operations".
- edge_case: Choosing an operation not present in the currently offered list (a stale reference after
    the link changed)
  why: onChooseOperation's parameter is any OpenApiOperation by its own type signature; no criterion or
    node requires validating that the chosen value belongs to the list currently offered.
- edge_case: A link change and a choice happening concurrently (race)
  why: No criterion addresses ordering or concurrency here; operations and the chosen path/method are
    both derived synchronously from React state on each render, and criterion 2's own test already covers
    a link change replacing the offered list.
untested:
- contracts/integration/openapi-document-operations's fact -- that the published read-openapi-document-operations
  operation fetches the operator-named document server-side, generates no draft and issues no register-connector
  call -- spans the backend's own operation and the already-delivered useOpenApiDocumentOperations hook.
  This task only composes that hook and forwards its outcome unmodified as operationsOutcome; no test
  confined to this hook's own file decides the backend operation's own behavior, which belongs to the
  backend's and the dependency task's own proofs.
- 'rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing states
  three things: the document must be fetched and parse as OpenAPI 3.x before entries are offered, the
  operator names an operation only by choosing rather than typing, and the draft request then names the
  chosen pair. Only the third clause is decided whole by a test in this proof (the criterion-5 / scenario
  test); the first is out of this task''s scope per its own REMAINDER note; and the second -- the task''s
  UNDERDETERMINED note 1 -- names an implementation (a helper that keeps its existing free-text path and
  method fields editable, prefilling them from a chosen entry) that is exactly what this task delivers:
  onPathChange and onMethodChange remain reachable, unrestricted setters, so the operator can still type
  a path or a method the document never declares. The plan''s own decision (recorded in this task''s Notes)
  assigns enforcement of that clause to the sibling task operation-choice-fields, which rewrites the free-text
  Inputs'' last consumer; whether that sibling task''s own change reaches the hook''s exposed setters,
  and not only the rendered Inputs, is left open by this task''s Notes. No test in this proof asserts
  that clause: doing so would enforce, ahead of where the plan put it, a requirement this task''s own
  seven criteria never state, over an implementation the plan already decided to leave as-is until the
  sibling task lands. No single test decides the rule''s fact whole, and none is offered as demonstrating
  it.'
---

## What it is

Tests over useConnectorConfigurationHelper prove all seven of the task's own criteria, plus a guard over constraints/the-openapi-document-is-fetched-by-the-backend's clause that no frontend module fetches the operator-named link directly.

## Notes

An earlier attempt in this proof included an eighth test asserting that onPathChange/onMethodChange never adopt a typed value, offered as proof of the task's first UNDERDETERMINED note. That test failed against the delivered implementation (run/connector-configuration-helper-operation-listing-helper-operation-choice-state-suite, cause code per a failure-diagnostician read) -- but the task's own Notes assign enforcement of that exact clause to the sibling task operation-choice-fields, so the test was asserting ahead of where the plan put the enforcement rather than proving anything this task's own criteria claim. Removed, and folded into `untested` instead. run/connector-configuration-helper-operation-listing-helper-operation-choice-state-suite-2 passed clean, 1483 tests.
A second, unrelated failure in that same first suite run (src/routes/case-version-editor-screen-subject-field.spec.ts) sits outside this delivery's file set and outside the nodes it implements; it passed in isolation (5/5) and passed again in suite-2, confirming it as pre-existing order-dependent flakiness this delivery did not cause and does not fix.
