---
target: frontend
title: Configuration Helper distinguishes an outstanding operations read from a document declaring
  none -- proof
summary: Proves the two new operations-read disclosure states -- an outstanding read and a document
  declaring no operation -- at the projection layer and at the rendered surface, each apart from the
  other and from every refusal, via new tests added to the two existing sibling spec files, and
  corrects one pre-existing test whose literal expectation this task's legitimate change made stale.
implementation: sha256:5776c643c28cbbae563aa7601b0b54c6864108090c582fc2c2a885fa28684a4c
run: run/drafted-answer-disclosure-operations-read-states-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: maps the pending outcome to the pending disclosure state
  proves: Criterion 1 at the projection layer -- the pending outcome maps to a disclosure state
    distinct from every other kind.
  fails_when: the pending outcome stops mapping to { kind = "pending" } (e.g. falls back to "none" or
    to any other kind).
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: maps an operations outcome carrying zero operations to the empty disclosure state
  proves: Criterion 2 at the projection layer -- an operations outcome with zero operations maps to a
    disclosure state distinct from every other kind.
  fails_when: an operations outcome with an empty operations array stops mapping to { kind = "empty" }.
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: maps an operations outcome carrying one operation to the none disclosure state, not empty
  proves: The class boundary of criterion 2 -- exactly zero operations triggers "empty"; one
    operation, the class just past that boundary, does not.
  fails_when: an operations outcome carrying at least one operation is misrouted to "empty" instead of
    "none".
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: maps the idle outcome to the none disclosure state, not pending
  proves: The boundary between "idle" and the new "pending" kind -- idle is not swept into the new
    "pending" kind this task introduced.
  fails_when: the idle outcome is misrouted to "pending" (or to any kind other than "none").
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders the outstanding-read message with no alert role
  proves: Criterion 1 at the rendered surface -- while the operations read has not answered, the
    surface states that those operations are being read, and it is not presented as a refusal.
  fails_when: the pending operations-read state stops rendering the outstanding-read message, or
    renders it (or anything else for this state) with role="alert".
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders the no-operations-declared message with no alert role
  proves: Criterion 2 at the rendered surface -- where the read answered with no operation, the
    surface states that the fetched document declares none, and it is not presented as a refusal.
  fails_when: an operations outcome with zero operations stops rendering the no-operations-declared
    message, or renders it (or anything else for this state) with role="alert".
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders five pairwise-distinct statements across the outstanding read, the no-operations
    document, and the three refusals, only the refusals as alerts
  proves: Criteria 3 and 4, whole -- the outstanding-read statement and the no-operations-declared
    statement are each non-empty, pairwise distinct from one another and from each of the three
    refusal messages, and neither of the two new states is ever presented with role="alert" while
    every refusal is.
  fails_when: any two of the five rendered statements collapse onto the same text, or either new state
    renders with role="alert", or a refusal renders without it.
  demonstrates: rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation
not_applicable:
- edge_case: pt-BR wording for the two new messages.
  why: The task's own instruction states pt-BR wording is a separate sibling task's job; this proof
    only holds the plain-English strings this task shipped.
- edge_case: An operations-read outcome kind outside the closed OpenApiDocumentOperationsReadOutcome
    union.
  why: The union is closed at compile time; constructing a fixture outside it requires bypassing
    TypeScript, and no criterion or node of this task reaches such a value.
- edge_case: Two operations-read requests racing, or the outcome changing mid-render.
  why: No criterion or node this task implements addresses concurrency; the underlying query state
    machine's own handling is out of this task's files and untouched by it.
untested:
- domain/integration/openapi-document-operations -- its fact is the value object's own attribute
  declaration. This task consumes that shape as given (reading only outcome.operations.length) and
  adds no attribute to it; no test in this task's scope decides that declaration whole, since it was
  established by the task that first shaped this type, not this one.
- constraints/the-openapi-document-is-fetched-by-the-backend -- its fitness is a dependency and
  network-call audit over the whole frontend module finding no direct request to an OpenAPI
  document's own URL. This task honors it by construction (no new network call was added), but that
  is a totality claim over the module no unit test scoped to these two files can decide; left
  unproven rather than approximated.
- The implementation's inference that the two new kinds are payload-less ("pending", "empty") rather
  than carrying a message field, and that both render as plain <p> with no role="alert" --
  arrangement/wording inferences the implementation recorded from sibling convention, not facts any
  node or criterion states beyond requiring distinguishability (already proven); not pinned by a test.
- The implementation's inference of the exact wording of the two new messages -- an inference about
  phrasing, not a fact any node states; the criteria require distinguishability and correct sense,
  both of which are tested, but the exact string choice itself is not pinned as the only valid one.
---

## What it is
The proof of the two new states, held apart from one another and from every refusal, and the correction of one pre-existing test whose literal expectation this task's legitimate change made stale.

## Notes
Before running the suite, corrected a pre-existing test in
connector-configuration-operations-read-disclosure.spec.ts ("no refusal is stated before the operation
answers (criterion 6)") that asserted the pending outcome mapped to `{ kind: "none" }` -- true before
this task, no longer true after it introduced the "pending" kind. The invariant that test protects (no
refusal is stated before the operation answers) still holds, since `{ kind: "pending" }` is not
`{ kind: "refused" }`; only the test's literal expected value was updated, from `{ kind: "none" }` to
`{ kind: "pending" }`, and its title was updated to say so.

Suite round 1 failed lint: testing-library/no-node-access on `document.querySelector('[aria-live="polite"]')`
in the new distinguishability test. Fixed by reading `container.textContent` from render()'s own return
value instead of querying the document directly. Suite round 2 green.
