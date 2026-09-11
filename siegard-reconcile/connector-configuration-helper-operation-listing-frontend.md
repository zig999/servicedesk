---
contract_version: siegard-reconcile/5
title: Connector Configuration Helper — operation listing (frontend)
summary: 'Five tasks under connector-configuration-helper-operation-listing-frontend: a hook reading the
  backend''s operations listing, its composition into the helper''s state, the Select replacing the free-text
  path/method inputs, three orphaned specs from a closed initiative rewritten to drive that Select, and
  a disclosure for a refused operations read.'
target: frontend
files:
- path: src/hooks/use-connector-configuration-helper.spec.ts
  change: 'Written by the delivery of helper-operation-choice-state: stubFetch now answers the operations-read
    route as well as the draft route.'
- path: src/hooks/use-connector-configuration-helper.ts
  change: 'Written by the delivery of helper-operation-choice-state: composes useOpenApiDocumentOperations(link)
    into the helper''s state, exposing operations/operationsOutcome/onChooseOperation alongside the existing
    draft request state.'
- path: src/hooks/use-openapi-document-operations.spec.ts
  change: Written by the delivery of openapi-document-operations-read.
- path: src/hooks/use-openapi-document-operations.ts
  change: 'New hook module, written by the delivery of openapi-document-operations-read: exposes a closed
    outcome of operations, a named refusal, or an unrecognised failure for a link-keyed read of the backend''s
    operations listing.'
- path: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  change: Written by the delivery of rewrite-orphaned-specs, same rewrite.
- path: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  change: Written by the delivery of rewrite-orphaned-specs, same rewrite.
- path: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  change: 'Written by the delivery of rewrite-orphaned-specs: rewritten to drive the Configuration Helper
    through the operations Select instead of the removed free-text path/method inputs; no other assertion
    changed.'
- path: src/routes/connector-configuration-helper-fields-apply.spec.ts
  change: 'Written by the delivery of helper-operation-choice-state: same type-satisfying defaults added
    to its own baseState().'
- path: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  change: Written by the delivery of operation-choice-fields.
- path: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  change: Written by the delivery of operations-read-refusal-disclosure.
- path: src/routes/connector-configuration-helper-fields.spec.ts
  change: 'Written by the delivery of helper-operation-choice-state: baseState() extended with the new
    state fields, type-satisfying defaults only.'
- path: src/routes/connector-configuration-helper-fields.tsx
  change: Written by the deliveries of operation-choice-fields (replaces the free-text Operation path/method
    Input fields with a Select over the offered operations) and operations-read-refusal-disclosure (renders
    the operations-read refusal branch beside the draft's own).
- path: src/services/connector-configuration-operations-read-disclosure.spec.ts
  change: Written by the delivery of operations-read-refusal-disclosure.
- path: src/services/connector-configuration-operations-read-disclosure.ts
  change: 'New module, written by the delivery of operations-read-refusal-disclosure: a pure function
    mapping an OpenApiDocumentOperationsReadOutcome to nothing or one refusal message, mirroring connector-configuration-draft-disclosure.ts.'
nodes:
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at nowhere in this file — this file issues
    no fetch of its own; it composes useOpenApiDocumentOperations(link), which does

    src/hooks/use-openapi-document-operations.ts: held at the queryFn passed to useQuery, lines ~99-101
    — apiFetch(`/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`) -- calls the backend''s
    own route, never the operator-named link itself'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-openapi-document-operations.ts
  decided_by: test
  step: test
  proof:
  - src/hooks/use-connector-configuration-helper.spec.ts
  - src/hooks/use-openapi-document-operations.spec.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onRequestDraft — requestDraft({ link,
    path, method }) -- pre-existing composition, unmodified by this delivery

    src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — this file does
    not compose or read a connector configuration draft request'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at nowhere in this file — this file calls
    useOpenApiDocumentOperations(link), not the operation directly

    src/hooks/use-openapi-document-operations.ts: held at the queryFn passed to useQuery — apiFetch<ReadOpenApiDocumentOperationsResponse>(`/v1/read-openapi-document-operations?link=...`)'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-openapi-document-operations.ts
- node: domain/integration/connector-configuration-draft
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/connector-configuration-draft-generated-credential
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/connector-configuration-draft-method-mismatch
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/connector-configuration-draft-unresolved-item
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: domain/integration/openapi-document-operations
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at operationsOfferedFor — return operationsOutcome.kind
    === "operations" ? operationsOutcome.operations : [];

    src/hooks/use-openapi-document-operations.ts: held at outcomeFromQuery''s success branch — { kind:
    "operations", operations: query.data.operations }

    src/routes/connector-configuration-helper-fields.tsx: held at operationOptions — state.operations.map((operation)
    => ({ value: operationSelectValue(operation), label: ... }))'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-openapi-document-operations.ts
  - src/routes/connector-configuration-helper-fields.tsx
  decided_by: test
  step: test
  proof:
  - src/hooks/use-connector-configuration-helper.spec.ts
  - src/hooks/use-openapi-document-operations.spec.ts
  - src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- node: domain/integration/openapi-operation
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onChooseOperation — (operation) => {
    setPath(operation.path); setMethod(operation.method); }

    src/hooks/use-openapi-document-operations.ts: held at the OpenApiOperation type and its pass-through
    in outcomeFromQuery — export type OpenApiOperation = { readonly path: string; readonly method: string;
    }

    src/routes/connector-configuration-helper-fields.tsx: held at operationSelectValue — return `${entry.method.toUpperCase()}
    ${entry.path}`;'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-openapi-document-operations.ts
  - src/routes/connector-configuration-helper-fields.tsx
  decided_by: test
  step: test
  proof:
  - src/hooks/use-openapi-document-operations.spec.ts
  - src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onChooseOperation — setPath(operation.path);
    setMethod(operation.method); -- the chosen entry''s own path and method become the helper''s path
    and method

    src/hooks/use-openapi-document-operations.ts: held at nowhere in this file — this file neither offers
    a choice among operations nor consumes one

    src/routes/connector-configuration-create-screen-apply-draft.spec.ts: held at nowhere in this file
    — this file neither offers a choice among operations nor consumes one

    src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts: held at nowhere in this
    file — this file neither offers a choice among operations nor consumes one

    src/routes/connector-configuration-form-fields-configuration-helper.spec.ts: held at nowhere in this
    file — this file neither offers a choice among operations nor consumes one

    src/routes/connector-configuration-helper-fields.tsx: held at the Select rendering and onOperationSelected,
    replacing the removed Input fields — <Select options={operationOptions} value={selectedOperationValue}
    onChange={onOperationSelected} /> -- no free-text path/method input exists in this file'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/hooks/use-openapi-document-operations.ts
  - src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  - src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  - src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at nowhere in this file — this hook is state,
    not the surface; the surface fact is held elsewhere

    src/routes/connector-configuration-helper-fields.tsx: held at the component''s own JSX — renders the
    OpenAPI document link field, the Operation Select, and the Request Draft button together, beneath
    the Configuration field the caller composes this into'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/hooks/use-openapi-document-operations.ts: held at nowhere in this file — this rule governs
    the draft operation''s own refusal, encoded in connector-configuration-draft-disclosure.ts, outside
    this review''s file set'
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/hooks/use-openapi-document-operations.ts: held at outcomeForNotReadableError — if (isPlainRecord(details)
    && details.reason === "no-version-declared") { return { kind: "openapi-document-declares-no-version"
    }; } return { kind: "openapi-document-not-readable" };'
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
- node: rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at the operationsReadDisclosure render
    branch — {operationsReadDisclosure.kind === "refused" && (<p role="alert" className="text-sm text-destructive">{operationsReadDisclosure.message}</p>)}

    src/services/connector-configuration-operations-read-disclosure.ts: held at nowhere in this file —
    this file does not state a refusal message to the operator'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
  - src/services/connector-configuration-operations-read-disclosure.ts
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  conforms: true
  how: 'src/hooks/use-openapi-document-operations.ts: held at nowhere in this file — this file does not
    render or assert a method''s casing

    src/routes/connector-configuration-helper-fields.tsx: held at operationSelectValue and the option
    label — label: `${operation.path} — ${operation.method.toUpperCase()}`'
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  - src/routes/connector-configuration-helper-fields.tsx
  decided_by: test
  step: test
  proof:
  - src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/hooks/use-openapi-document-operations.ts: held at outcomeForRefusal''s switch on error.code
    — case "OpenApiDocumentNotFetchedError": ... case "OpenApiDocumentNotReadableError": ...

    src/services/connector-configuration-operations-read-disclosure.ts: held at nowhere in this file —
    this file does not distinguish the two refusal conditions from one another'
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
  - src/services/connector-configuration-operations-read-disclosure.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/hooks/use-openapi-document-operations.ts: held at outcomeForNotFetchedError — fetchFailureFromDetails(details)
    reading kind: network-failure | timeout | status-outside-2xx'
  encoded_at:
  - src/hooks/use-openapi-document-operations.ts
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  conforms: true
  how: 'src/routes/connector-configuration-helper-fields.tsx: held at nowhere in this file — not this
    file''s concern'
  encoded_at:
  - src/routes/connector-configuration-helper-fields.tsx
- node: rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers
  conforms: true
  how: 'src/services/connector-configuration-operations-read-disclosure.ts: held at nowhere in this file
    — this file does not render or gate a refusal on the read''s own in-flight state'
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
  decided_by: test
  step: test
  proof:
  - src/services/connector-configuration-operations-read-disclosure.spec.ts
- node: scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
  conforms: true
  how: 'src/hooks/use-connector-configuration-helper.ts: held at onChooseOperation and onRequestDraft
    together — onChooseOperation sets path/method from the chosen entry; onRequestDraft composes {link,
    path, method} into the draft request'
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  decided_by: test
  step: test
  proof:
  - src/hooks/use-connector-configuration-helper.spec.ts
unbound:
- src/hooks/use-connector-configuration-helper.spec.ts
- src/hooks/use-openapi-document-operations.spec.ts
- src/routes/connector-configuration-helper-fields-apply.spec.ts
- src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
- src/routes/connector-configuration-helper-fields.spec.ts
- src/services/connector-configuration-operations-read-disclosure.spec.ts
notes: 'Judged by 14 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-helper-operation-listing-frontend.returns/.

  Certified constraints/the-openapi-document-is-fetched-by-the-backend as decided by step `test`: src/hooks/use-openapi-document-operations.spec.ts
  (issues exactly one network call, to a route naming read-openapi-document-operations and carrying the
  link as data, never to the link itself); src/hooks/use-connector-configuration-helper.spec.ts (issues
  no fetch call whose URL is the operator-named link, once that link is named) would fail if the fact
  stopped holding.

  Certified domain/integration/openapi-document-operations as decided by step `test`: src/hooks/use-openapi-document-operations.spec.ts
  (exposes an operations outcome carrying exactly the operations the answer listed, in one array); src/hooks/use-connector-configuration-helper.spec.ts
  (exposes exactly the operations the read answered for the named link, once it resolves); src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  (opens onto exactly one option per entry in state.operations, both entries represented) would fail if
  the fact stopped holding.

  Certified domain/integration/openapi-operation as decided by step `test`: src/hooks/use-openapi-document-operations.spec.ts
  (exposes the answered path and method verbatim, and nothing else, for a document declaring one operation);
  src/routes/connector-configuration-helper-fields-operation-select.spec.ts (shows the entry''s own path
  and its own method together on the option, upper-cased even though the entry names it lower-case) would
  fail if the fact stopped holding.

  Certified scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing as decided
  by step `test`: src/hooks/use-connector-configuration-helper.spec.ts (issues a draft request naming
  /items as its path and POST as its method once that entry is chosen) would fail if the fact stopped
  holding.

  Certified rules/integration/an-openapi-operations-method-is-upper-cased as decided by step `test`: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  (states the method upper-cased on the option regardless of the case the entry itself holds) would fail
  if the fact stopped holding.

  Certified rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers as decided
  by step `test`: src/services/connector-configuration-operations-read-disclosure.spec.ts (maps both idle
  and pending to exactly {kind: "none"}) would fail if the fact stopped holding.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/the-openapi-document-is-fetched-by-the-backend,
  contracts/integration/openapi-document-operations, domain/integration/openapi-document-operations, domain/integration/openapi-operation,
  rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing, rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper,
  rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read,
  rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator, rules/integration/an-openapi-operations-method-is-upper-cased,
  rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document,
  rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read, rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers,
  scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing were read on every file
  and answered for, and bound from nowhere here — a binding this record writes is one the trace already
  held.

  Candidates: 0 opened across 0 of 14 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-helper-operation-listing-frontend.returns/`, which are the evidence behind every entry above.
