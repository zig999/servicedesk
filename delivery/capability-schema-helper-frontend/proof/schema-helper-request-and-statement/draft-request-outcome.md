---
target: frontend
title: Draft request and outcome classification proof for use-draft-capability-schema-from-openapi
summary: A new spec file exercising the hook's single POST dispatch, its classification of a 200 answer and of each of the three named refusal codes plus any unrecognised failure into six distinct, distinguishable outcomes, its idle/pending sequencing ahead of any refusal, and its suppression of a second dispatch while one is in flight.
implementation: sha256:c2810efa512fcb0efc5e932f13469e8e25209f6fe560147028c22290e64d7040
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-draft-request-outcome-suite
tests:
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: sends exactly {link, path, method} in the POST body, taken from the request passed to requestDraft
  proves: Criterion 1 -- the dispatched request's body carries exactly link, path and method, taken from the operator-named link and the chosen operation.
  fails_when: the captured POST body omits link, path or method, carries any other field, or carries a value not taken verbatim from the request passed to requestDraft.
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: issues exactly one network call, to the published draft route, never to the operator-named link itself or to any other operation
  proves: Criteria 2 and 3 -- the request is issued through apiFetch to the published draft-capability-schema-from-openapi route alone; no separate fetch is built and the operator-named OpenAPI link is never itself fetched.
  fails_when: a second network call is made -- to the operator-named link, to a register-capability endpoint, or to any route other than the one published draft route -- in addition to or instead of that one call.
  demonstrates: contracts/integration/capability-schema-draft
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: carries the link, path and method of the request answered, and a draft holding exactly input_schema, output_schema and unresolved -- no field the answer's top level did not carry
  proves: Criterion 4's top-level shape and criterion 11's drafted half -- a 200 answer resolves to a drafted outcome echoing the answered request's link, path and method, and carrying a draft with exactly the three declared fields, stripping any extra field the answer's top level carried.
  fails_when: the drafted outcome omits input_schema, output_schema or unresolved, retains an extra top-level field the 200 answer carried, or fails to carry the link, path or method of the request it answered.
  demonstrates: domain/integration/capability-schema-draft
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: strips any field an unresolved item carried beyond name and reason
  proves: Criterion 4's per-item shape -- each unresolved item is exposed with exactly the name and reason the answer gave it, and nothing else.
  fails_when: an unresolved item in the drafted outcome retains a field beyond name and reason that the answer's item carried.
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: exposes unresolved as an empty array when the answer carried none
  proves: Criterion 4's empty-collection boundary -- an answer carrying no unresolved items is exposed as an empty array, not as an absent or undefined field.
  fails_when: the drafted outcome's unresolved field is missing, undefined, or non-empty when the 200 answer's own unresolved list was empty.
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: resolves $label to $expectedKind, carrying the link, path and method of the request it answered
  proves: Criteria 5, 6 and 7 -- each of OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError resolves to its own distinct outcome kind -- and criterion 11's refused half -- each of those three outcomes carries the link, path and method of the request it answered, exactly as named.
  fails_when: any of the three named error codes resolves to a different outcome kind than its own, to the same kind as either of the other two, or to an outcome missing or misstating the link, path or method of the request it answered.
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: resolves $label to unrecognized-failure, distinct from drafted and the three named refusals
  proves: Criterion 8 -- an answer carrying any error code none of the three name, and a request that fails outright with no answer at all, both resolve to the unrecognized-failure outcome, distinct from drafted and from the three named refusal kinds.
  fails_when: an unrecognised error code, or an outright request failure, resolves to a kind other than unrecognized-failure, or to the same kind as drafted or one of the three named refusals.
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: starts idle before any dispatch, stays pending -- neither drafted nor any refusal -- while the request is unanswered, and only reports a refusal once the operation actually answers
  proves: Criteria 9 and 10 -- the outcome is idle before any request is dispatched and pending while one stands unanswered, neither of those ever a drafted or a refusal outcome.
  fails_when: 'the outcome before any dispatch is anything other than {kind: ''idle''}, the outcome while a dispatched request is unanswered is anything other than {kind: ''pending''}, or the outcome fails to become the refusal kind once the operation''s answer arrives.'
  demonstrates: rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
- file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
  name: issues exactly one network call when requestDraft is invoked twice before the first settles
  proves: Criterion 12 -- a dispatch attempted while a request is in flight issues no second request to the operation.
  fails_when: a second network call is made when requestDraft is invoked twice before the first dispatch settles, or the outstanding request fails to reach its own drafted outcome once it settles.
not_applicable:
- edge_case: An absent or empty link, path or method value passed to requestDraft.
  why: No criterion or node this task implements validates or constrains the shape of what is passed in -- naming the link and choosing the operation happen on the surface this task's own REMAINDER notes exclude; this hook only transports what it is given.
- edge_case: Two unresolved items sharing the same name (a collision).
  why: This task's criteria and the domain nodes it implements state only that each unresolved item's own name and reason are carried as the answer gave them; resolving a name collision is the already-delivered backend rule a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order, not a fact this frontend hook or any criterion of this task restates.
- edge_case: Concurrent dispatch from two separate authoring surfaces (two independent hook instances).
  why: rules/integration/a-pending-schema-draft-request-is-not-dispatched-again's own Description states a helper on another surface 'is a different helper and blocks nothing,' and no criterion of this task constrains cross-instance behavior; each call to useDraftCapabilitySchemaFromOpenApi is independently scoped by its own useRef and useMutation.
- edge_case: A reason value outside the declared two-value enumeration reaching the outcome.
  why: The implementation deliberately types reason as a plain string and does not narrow or validate it; a test asserting on this would pin that typing choice rather than protect an obligation, and the drafted-outcome tests already written exercise the field's pass-through regardless of its value.
untested:
- 'rules/integration/a-capability-authoring-surface-offers-a-schema-helper: only the fragment ''requests a capability schema draft generated from the chosen operation'' is reached (by the dispatch tests above); its placement beneath the two schema fields, choosing the operation from the fetched document''s own listing, offering the request act only once an operation stands chosen, and issuing no register-capability call are this task''s own REMAINDER/UNDERDETERMINED notes and are not implemented in this file, so no test here decides the node''s fact whole.'
- 'rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator: only the outcome-carrying half is reached (proven by the 200-answer tests above); stating that draft to the operator is a rendering fact on the authoring surface, this task''s own REMAINDER, and this hook produces no rendered output for any test here to decide it against.'
- 'rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator: only the classification into distinct outcomes is reached (proven by the refusal-code tests above); stating that classification''s meaning to the operator is this task''s own REMAINDER and is not decided by any test in this file.'
- 'rules/integration/a-pending-schema-draft-request-is-not-dispatched-again: only the clause that no second call is issued while one is outstanding is implemented and tested (criterion 12''s test above). The clause that the helper requests again as soon as the outstanding request ends, and the clause that a suppressed attempt otherwise leaves the outstanding request untouched, are both marked UNDERDETERMINED and not implemented per the task''s own notes -- the node''s fact as stated does not hold of this implementation as a whole, so no test approximates it as the whole.'
- 'constraints/the-openapi-document-is-fetched-by-the-backend: its statement spans three separate frontend fetch sites -- the connector configuration draft''s own hook, this capability schema draft, and the Configuration Helper''s own operations listing -- each living in a different module. The test above (''issues exactly one network call...'') decides only this hook''s own slice, not the fact as stated spanning the other two modules.'
- 'domain/integration/capability-schema-draft-unresolved-reason: its closed two-value enumeration is a backend/domain fact this hook deliberately does not re-encode or narrow -- reason is typed as a plain string and carried through unopened. No test in this file can decide whether the backend''s own answer stays within the declared two-value set.'
- The implementation's own inference that an unrecognized-failure outcome carries no link, path or method (unlike a drafted or a named-refusal outcome) is not pinned by any test here -- the unrecognized-failure tests above assert only outcome.kind.
- 'UNDERDETERMINED, from the specification -- a-refused-schema-draft-states-its-refusal-to-the-operator''s closing clause (no input_schema, no output_schema and no unresolved item beside a refusal): this entry names no implementation to test against, so no test is owed or written; nothing here excludes a refusal outcome from also carrying schema or unresolved content.'
- 'UNDERDETERMINED, from the specification -- a-capability-authoring-surface-offers-a-schema-helper''s clause that requesting a draft issues no register-capability call: this entry names no implementation to test against, so no test is owed or written.'
- 'UNDERDETERMINED, from the specification -- a-pending-schema-draft-request-is-not-dispatched-again''s clause that the helper requests again as soon as the outstanding request ends: this entry names no implementation to test against, so no test is owed or written.'
- 'UNDERDETERMINED, from the specification -- the same rule''s clause that a suppressed further request leaves the outstanding request untouched: this entry names no implementation to test against, so no test is owed or written.'
---

## What it is

Tests proving use-draft-capability-schema-from-openapi's request dispatch, its classification of every possible answer into exactly one of six distinguishable outcomes (idle, pending, drafted, three named refusals, unrecognised failure), and its in-flight dispatch guard.

## Notes

None.
