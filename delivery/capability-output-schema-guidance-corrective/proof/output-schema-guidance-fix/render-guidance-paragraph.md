---
target: frontend
title: Proof for the Output schema field's guidance paragraph
summary: The nine criteria are each decided by one existing test in capability-form-fields-output-schema-guidance.spec.ts;
  the boundary criterion's substring-matching gap is closed by one new exact-sentence
  test added to that same file.
implementation: sha256:76364a0947b170d717750831ee2c666cd13abfeaf7c86ff10429560753715234
run: run/output-schema-guidance-fix-render-guidance-paragraph-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the read field names are the paths through the schema's own top-level
    properties object and every properties object and items schema reachable beneath
    it
  proves: Criterion 1 — the guidance states the read field names are the paths through
    the schema's own top-level properties object and every properties/items schema
    reachable beneath it.
  fails_when: The rendered guidance paragraph's text stops matching the path-claim
    sentence.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that each object's own key is joined onto its parent's own path with
    a dot, and an array's own items is joined onto its parent's own path with brackets
  proves: Criteria 2 and 3 together — the guidance states the dot-join for an object's
    own key and the bracket-join for an array's own items.
  fails_when: The rendered guidance paragraph's third sentence stops matching the
    literal dot-join-and-bracket-join text.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the entered content is JSON
  proves: Criterion 4 — the guidance states that the entered content is JSON.
  fails_when: The rendered guidance paragraph stops containing the literal "O que
    é inserido aqui é JSON." sentence.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the type and description declared at the node each path reaches,
    where the schema states them, are read as that field's declared semantics
  proves: Criterion 5 — declared type and description are read as that field's declared
    semantics.
  fails_when: The rendered guidance paragraph stops matching the declared-semantics
    sentence.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that no other content of the entered schema is read or validated
  proves: Criterion 6 — no other content of the entered schema is read or validated.
  fails_when: The rendered guidance paragraph stops matching the nothing-else-read
    sentence.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that a description entered there states what its value means and names
    no decision
  proves: Criterion 7 — a description states meaning and names no decision.
  fails_when: The rendered guidance paragraph stops matching the description-states-meaning
    sentence.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no sentence that fails to match one of the six known claim statements
  proves: Criterion 8 — the guidance carries no sentence that fails to match one of
    the seven preceding claims.
  fails_when: Any sentence the guidance paragraph renders, once split on ".", fails
    to match every one of the six known claim patterns.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no digit, which every worked example over this schema has so far instantiated
    as a concrete code
  proves: Partial evidence for the "carries no worked example of its own" clause of
    an-output-schema-entrys-statement-carries-no-sixth-claim.
  fails_when: The rendered guidance paragraph contains any digit character.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no brace, which a worked JSON snippet would need to show a concrete
    shape
  proves: Partial evidence for the same "carries no worked example of its own" clause.
  fails_when: The rendered guidance paragraph contains a "{" or "}" character.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: names no refusal, check or read-only-nature vocabulary anywhere in the guidance
  proves: Partial evidence that the guidance states no sixth claim about refusal,
    checking, or read-only nature.
  fails_when: The rendered guidance paragraph contains any of the forbidden vocabulary
    tokens.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: renders identical guidance text beside the Output schema entry on both screens
  proves: Criterion 9 — the guidance renders identical text on the capability create
    screen and the capability detail screen.
  fails_when: The guidance text found on the mounted detail screen differs from the
    guidance text found on the mounted create screen.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: does not disable Save for an output schema whose properties are declared only
    beneath a nested items schema
  proves: The first UNDERDETERMINED note — excludes the reading where the surface
    adds client-side validation disabling submission on the path-nesting condition.
  fails_when: The Save button carries the disabled attribute for an otherwise-valid
    form whose output schema declares its properties only beneath a nested items schema.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: does not disable Save for an output schema whose nested node carries neither
    type nor description
  proves: The first UNDERDETERMINED note — excludes the same reading on the type/description
    condition.
  fails_when: The Save button carries the disabled attribute for an otherwise-valid
    form whose output schema's nested node declares neither type nor description.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: renders exactly the six canonical claim sentences, in order, with no worked
    example or further path-shape fact folded into any of them
  proves: The second and third UNDERDETERMINED notes — a worked example or a wrong
    path-shape fact folded into an already-matching sentence is excluded by exact-equality
    per sentence.
  fails_when: Any of the six sentences the guidance renders, once split on "." and
    lowercased, is not identical to its corresponding canonical claim text.
not_applicable:
- edge_case: Guidance content varying with the Output schema field's current value
    (empty, malformed, or valid JSON).
  why: The guidance is a module-level constant rendered unconditionally beside the
    field; no criterion or node makes its wording depend on what is currently entered.
- edge_case: Two operations against the guidance paragraph at once, or its behavior
    across re-renders.
  why: The paragraph carries no state of its own and triggers no mutation; it is inert
    text.
- edge_case: A dependency (network, storage) failing or answering slowly, affecting
    the guidance text.
  why: The guidance does not depend on any fetched or stored value.
untested:
- 'rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it:
  its statement conjoins five content claims (each decided by one test above) with
  a no-refusal/no-checking behavioral clause (decided by the Save-not-disabled tests
  plus the forbidden-vocabulary test); no single test asserts the whole conjunction.'
- 'rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim: conjoins
  ''no sixth claim'' (decided by the boundary/no-digit/no-brace/exact-sentence tests)
  with ''refuses nothing on any of these grounds'' (decided by the Save-not-disabled
  tests) — two different observable channels, so no one test decides the whole node.'
- 'rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema:
  only the dot-join and bracket-join clauses are restated in the guidance and tested;
  the clauses about every reached node (not only leaves) carrying an element, and
  patternProperties/additionalProperties not being walked, are REMAINDER per the task''s
  own notes and untested here.'
- 'rules/glossary/a-description-states-meaning-never-policy: only the field-description
  half is restated and tested; the concept-description half is REMAINDER, belonging
  to the concept authoring surface.'
- 'domain/investigation/field-semantics: this screen''s guidance only restates the
  fact in prose; no test here exercises the actual backend reading the element describes.'
- 'domain/integration/capability: no test here decides the aggregate''s own fact;
  this task adds no new fact to it.'
- The implementation's arrangement inferences (guidance placement, styling, module-level
  constant declaration) are inferences about arrangement, not behavior; no test pins
  any of them.
contested:
- what: The shared test for criteria 2 and 3 asserts one combined regex over one sentence,
    so a failure does not by itself say whether the dot-join half or the bracket-join
    half broke.
  why: This is a property of the pre-existing reproduction file handed to this proof,
    not of a test newly written here, so it is disclosed rather than rewritten.
- what: Both the pre-existing reproduction tests and the new exact-sentence test decide
    the criteria by pinning the guidance's exact Portuguese wording.
  why: The specification leaves exact wording to the interface; a criterion stated
    as 'the guidance states X' cannot be checked without reading some concrete text,
    so pinning wording is unavoidable for this class of criterion, but it means these
    tests would also fail on a wording change that still carries the same claim.
---

## What it is
Proof that the Output schema field's guidance paragraph satisfies all nine criteria, built on the pre-existing reproduction spec plus one new exact-sentence test closing its substring-matching gap.

## Notes
run/output-schema-guidance-fix-render-guidance-paragraph-suite failed with cause: setup — a single unrelated test (connector-test-panel-attribute-reconciliation.spec.ts) timed out at Vitest's default 5000ms boundary under the suite's own parallel load, outside this delivery's file set.
run/output-schema-guidance-fix-render-guidance-paragraph-suite-2 failed with cause: setup — a different unrelated test (version-manifest-screen-remove-refusal-telling.spec.ts) timed out the same way, again outside this delivery's file set.
