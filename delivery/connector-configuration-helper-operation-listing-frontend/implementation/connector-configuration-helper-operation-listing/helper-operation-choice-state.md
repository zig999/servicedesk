---
target: frontend
title: Carry the chosen operation in useConnectorConfigurationHelper's state
summary: The helper hook now composes useOpenApiDocumentOperations over its own link, exposes the offered
  entries and their read outcome, and lets choosing an entry set the draft's path and method.
task: sha256:4500eba67e90bf4a2434e1697d43dd81fb13d87ff150359b886a2eaea197e3d5
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-helper-operation-choice-state-build-2
files:
- path: src/hooks/use-connector-configuration-helper.ts
  effect: Composes useOpenApiDocumentOperations(link) alongside the existing draft mutation. Adds operations
    (the offered OpenApiOperation entries, derived inline from the read's outcome, empty for any non-"operations"
    outcome), operationsOutcome (the read's own OpenApiDocumentOperationsReadOutcome, exposed distinct
    from the draft's own outcome), and onChooseOperation (sets path and method from a chosen entry) to
    ConnectorConfigurationHelperState. link, onLinkChange, path, onPathChange, method, onMethodChange,
    onRequestDraft and outcome are unchanged in behavior.
- path: src/hooks/use-connector-configuration-helper.spec.ts
  effect: stubFetch now answers any request to /v1/read-openapi-document-operations (the new call the
    hook issues once link is non-empty) with an empty operations list before it is recorded in calls,
    so the array every existing assertion reads from still holds only the draft-route requests it held
    before.
- path: src/routes/connector-configuration-helper-fields.spec.ts
  effect: 'baseState()''s object literal, still typed as ConnectorConfigurationHelperState, now supplies
    operations: [], operationsOutcome: { kind: "idle" } and onChooseOperation: () => {} so the literal
    satisfies the type the hook file now declares; no assertion, import or rendering in this file changed.'
- path: src/routes/connector-configuration-helper-fields-apply.spec.ts
  effect: The same three type-satisfying defaults added to its own baseState() literal, for the same reason
    and with the same absence of behavioral change.
criteria:
- criterion: The state exposes, as the entries offered for choice, the operations read for the link currently
    named in the helper.
  met: true
  how: operations is derived inline from useOpenApiDocumentOperations(link)'s outcome (the "operations"
    outcome's own list, or empty otherwise), and link is the same state value onLinkChange writes, so
    the entries offered are always those of the link currently named.
- criterion: Naming a different link in the helper makes the offered entries those of the newly named
    link.
  met: true
  how: useOpenApiDocumentOperations is called with the hook's own link state as its argument; that hook
    keys its query on the link (queryKey ["read-openapi-document-operations", link]), so a changed link
    re-keys the read and operations is recomputed from the new outcome once it answers -- the same mechanism
    the dependency hook's own spec already demonstrates for a second link.
- criterion: Choosing an offered entry makes the helper's path that entry's path.
  met: true
  how: onChooseOperation calls setPath(operation.path), so path becomes the chosen entry's own path.
- criterion: Choosing an offered entry makes the helper's method that entry's method.
  met: true
  how: onChooseOperation calls setMethod(operation.method) in the same call, so method becomes the chosen
    entry's own method.
- criterion: Given a read answering a document declaring /items with a get operation and a post operation,
    choosing the entry naming /items and POST makes the draft request the helper then issues name /items
    as its path and POST as its method.
  met: true
  how: Choosing that entry sets path to "/items" and method to "POST" through onChooseOperation; onRequestDraft
    composes { link, path, method } (unchanged) into the sibling hook's requestDraft, so the draft request
    names exactly the chosen pair.
- criterion: The state exposes the operations read's own outcome as a value distinct from the draft request
    outcome it already exposes.
  met: true
  how: operationsOutcome (OpenApiDocumentOperationsReadOutcome) is a separate field from outcome (DraftConnectorConfigurationRequestOutcome);
    a consumer reads one without touching the other.
- criterion: use-connector-configuration-helper.spec.ts's fetch stub answers the operations-read route
    as well as the draft route, and every assertion that file already makes about the draft request still
    holds.
  met: true
  how: 'stubFetch intercepts any URL starting with /v1/read-openapi-document-operations and answers it
    with {operations: []} before pushing to calls, so calls still captures only draft-route requests exactly
    as before; every existing assertion on calls'' length, url and parsed body is unchanged and still
    passes.'
nodes:
- node: domain/integration/openapi-operation
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: Reuses OpenApiOperation ({path, method}) as already defined by the dependency hook; the new operations
    field and onChooseOperation's parameter are both typed by it, so a chosen entry is exactly one such
    pair.
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: operations exposes every operation the currently named link's document declares, taken whole from
    the read's "operations" outcome rather than paged or filtered.
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: This task issues no call of its own against read-openapi-document-operations; it composes the already-delivered
    useOpenApiDocumentOperations hook, which is what actually calls that published operation, and exposes
    its outcome unmodified as operationsOutcome.
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: 'onChooseOperation gives the helper a route to name path and method from one of the fetched document''s
    own listed pairs, and onRequestDraft (unchanged) then issues the draft request naming exactly that
    chosen pair''s path and method -- answering the rule''s final clause, as criterion 5''s scenario demonstrates.
    The rule''s clause that the operator never types a path or a method is not answered here: the task''s
    own UNDERDETERMINED note records that the free-text onPathChange/onMethodChange setters stay reachable
    until operation-choice-fields rewrites their last consumer, connector-configuration-helper-fields.tsx.'
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: No fetch call is added by this file; it composes useOpenApiDocumentOperations, which reaches only
    the backend's own /v1/read-openapi-document-operations route (never the operator-named link itself),
    so the hook introduces no new client-side request against the document's URL.
- node: scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: 'The given/when/then this scenario states is exactly criterion 5''s mechanism: a chosen /items+POST
    entry drives onChooseOperation, and the subsequent onRequestDraft names /items and POST in the request
    it issues.'
inferences:
- inferred: The new field and function names -- operations, operationsOutcome, onChooseOperation -- since
    no node or task names them explicitly.
  from: The domain nodes' own vocabulary (openapi-operation, openapi-document-operations), the dependency
    hook's own exported type names (OpenApiOperation, OpenApiDocumentOperationsReadOutcome), and this
    task's criterion wording ("the entries offered for choice", "the operations read's own outcome", "choosing
    an offered entry").
- inferred: onPathChange and onMethodChange remain in ConnectorConfigurationHelperState unchanged, and
    path/method continue to be held as separate useState values rather than derived only from a chosen
    entry.
  from: The task's own Notes, which state the free-text setters "stay reachable until their last consumer
    is rewritten" and name operation-choice-fields as the task that removes them from the rendered surface.
- inferred: The updated spec's operations-read stub answers with an empty operations list by default,
    rather than a populated document.
  from: No criterion of this task requires a populated-operations assertion in this file (that demonstration
    already exists in use-openapi-document-operations.spec.ts); an empty answer is the minimal response
    that lets the read resolve without disturbing any existing draft-route assertion.
- inferred: 'connector-configuration-helper-fields.spec.ts''s and connector-configuration-helper-fields-apply.spec.ts''s
    baseState() literals take operations: [], operationsOutcome: { kind: "idle" } and onChooseOperation:
    () => {} as their type-satisfying defaults, rather than any other variant of the new fields.'
  from: 'The build''s own typecheck failure, reported against this delivery: a literal typed as ConnectorConfigurationHelperState
    must supply every required field, and these three values are the minimal, behavior-inert defaults
    available -- an empty list for operations (no document read has occurred in either spec''s baseState()),
    the read hook''s own "idle" variant for operationsOutcome (the same variant the state exposes before
    any link is named, mirroring how outcome''s own "idle" default is already used elsewhere in this file),
    and a no-op for onChooseOperation (matching the file''s existing no-op convention for onLinkChange,
    onPathChange, onMethodChange and onRequestDraft). None of the three is read by any assertion either
    spec file makes.'
preserved:
- Every existing assertion in use-connector-configuration-helper.spec.ts about link, path, method, onRequestDraft's
  request body and outcome mirroring the sibling draft hook.
- Every existing assertion in connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts,
  none of which reads operations, operationsOutcome or onChooseOperation.
- The composition chain connector-configuration-form-fields.tsx -> connector-configuration-helper.tsx
  -> connector-configuration-helper-fields.tsx, none of which construct a ConnectorConfigurationHelperState
  literal, so none needed a change here.
- The existing free-text onPathChange/onMethodChange setters and the Inputs that render them in connector-configuration-helper-fields.tsx,
  until operation-choice-fields rewrites that consumer.
deferred:
- what: 'connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts
    now type-check with plausible defaults (operations: [], operationsOutcome idle, onChooseOperation
    a no-op) added to their baseState() literals here, purely to satisfy ConnectorConfigurationHelperState''s
    new required fields. Neither spec file''s assertions, nor connector-configuration-helper-fields.tsx''s
    rendering, were changed to make those three fields meaningful -- the component still renders the two
    free-text path/method Inputs and calls no onChooseOperation.'
  why: The sibling task operation-choice-fields, which depends on this one, states as its own criterion
    8 that it is the one that renders the offered entries through a Select, removes the free-text path/method
    Inputs, and brings both spec files' state literals and assertions in line with that rendering. Adding
    only the minimal type-satisfying defaults keeps this delivery's own build green without doing that
    task's own wiring and assertion work.
---

## What it is

The hook keeps holding the link the operator names and now passes it to the operations read.
The path and the method it composes into the draft request stop being values it was told to set and become the chosen entry's own two values.
The read's outcome is exposed beside the draft's so a consumer can state one without reading the other.
Two pre-existing spec files that build a ConnectorConfigurationHelperState literal by hand were updated with type-satisfying defaults so the tree still typechecks; neither their assertions nor the rendered component changed.

## Notes

This task adds the chosen-entry route into path and method; the free-text setters stay reachable until their last consumer is rewritten by the sibling task operation-choice-fields.
The build's own typecheck step failed once against connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts, both missing the three new required fields on their hand-built state literals; fixed with behavior-inert defaults, disclosed above and in `deferred`.
