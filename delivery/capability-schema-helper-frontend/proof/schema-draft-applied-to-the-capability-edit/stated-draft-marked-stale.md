---
target: frontend
title: A stated capability schema draft is marked stale once its link or operation
  moves
summary: Proves task/schema-draft-applied-to-the-capability-edit/stated-draft-marked-stale
  -- the Schema Helper's stated draft stays keyed to the request it was generated
  for, flips to stale the instant only the link or only the chosen operation differs,
  and keeps offering both apply acts throughout -- against the implementation record
  for that task.
implementation: sha256:ac853c1fc638636e4856f27fa1b3c9cf66ada1460d746bd40551f2ebd091d179
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-draft-applied-to-the-capability-edit-stated-draft-marked-stale-suite-2
tests:
- file: src/hooks/use-capability-schema-helper.spec.ts
  name: useCapabilitySchemaHelper -- onRequestDraft composes the chosen operation's
    own link, path and method into the draft request, and forwards its answered outcome
    unchanged (criterion 7; contracts/integration/capability-schema-draft) › sends
    exactly {link, path, method} from the chosen operation, and exposes the drafted
    outcome once it resolves
  proves: Criteria 1 and 2 -- a stated draft is marked with exactly the link and exactly
    the operation (path and method) of the request that produced it. Already established
    by the prior task and untouched by this one, so no new test was written for it;
    this pre-existing test is the evidence.
  fails_when: the drafted outcome's own link, path or method field differs from exactly
    what onRequestDraft dispatched.
- file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
  name: useCapabilitySchemaHelper -- a stated draft stays not stale while its link
    and chosen operation both match the request it was generated for, and becomes
    stale the instant only the link changes (criteria 3, 4, 7) › reads stale as false
    right after the draft is stated, and true once the link alone changes, with the
    chosen operation left untouched
  proves: Criterion 3 (stale reads false while link and chosen operation both match
    the drafted outcome's own recorded request) and criterion 4 (stale flips to true
    the instant only the link differs); together with criterion 7, since the flip
    happens on the very next read with no separate cached value lagging behind.
  fails_when: stale stays false once the link alone changes away from the outcome's
    own recorded link, or stale already reads true immediately after the draft is
    stated while link and chosen operation both still match.
- file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
  name: useCapabilitySchemaHelper -- a stated draft stays not stale while its link
    and chosen operation both match the request it was generated for, and becomes
    stale the instant only the chosen operation changes (criteria 3, 5, 7) › reads
    stale as false right after the draft is stated, and true once a different operation
    is chosen, with the link left untouched
  proves: Criterion 3 again as the same test's precondition, and criterion 5 (stale
    flips to true the instant only the chosen operation differs); together with criterion
    7 for the same reactive-read reason as the link test.
  fails_when: stale stays false once a different operation is chosen with the link
    left untouched, or stale already reads true immediately after the draft is stated
    while link and chosen operation both still match.
- file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
  name: CapabilitySchemaHelperFields -- a stale drafted disclosure states its staleness
    beside the drafted schema, and a disclosure that is not stale states nothing about
    it (criteria 3, 4, 5) › renders the stale statement when state.stale is true,
    and renders none when state.stale is false
  proves: The surface's own half of criteria 3-5 -- it states the stale message exactly
    when state.stale is true, and states nothing about staleness when state.stale
    is false.
  fails_when: the stale message renders while state.stale is false, or fails to render
    while state.stale is true.
- file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
  name: CapabilitySchemaHelperFields -- a draft stated as stale still offers the act
    applying its input_schema and the act applying its output_schema (criterion 6)
    › keeps both Apply buttons rendered and enabled while the draft is stale, each
    applying its own schema text unchanged
  proves: Criterion 6 -- a draft stated as stale still offers, enabled, both the act
    applying its input_schema and the act applying its output_schema, each writing
    the draft's own unaltered schema text.
  fails_when: either Apply button is hidden, disabled, or applies anything other than
    the draft's own recorded schema text while state.stale is true.
- file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
  name: 'CapabilityFormFields -- a stated schema draft''s staleness marking holds
    together end to end: retained while the link and chosen operation match what it
    was generated for, stated stale the instant only the link moves away, and its
    two apply acts stay offered and effective throughout (rule rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes)
    › states no staleness right after the draft is stated, states it once the link
    alone changes, and still applies the same drafted input_schema afterward'
  proves: 'The rule''s whole fact, wired: the real hook composed with the real fields
    component keeps the drafted disclosure marked for the request that produced it
    while unchanged, states it stale the moment only the link differs, and keeps both
    apply acts offered and functionally correct throughout -- decided through the
    actual composition rather than a literal state object.'
  fails_when: the staleness statement fails to appear once the link alone changes
    away from the one the draft was generated for, or either Apply button becomes
    unavailable or writes anything but the draft's own recorded schema text once the
    draft is stale.
  demonstrates: rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
not_applicable:
- edge_case: staleness stated for an outcome that never reached 'drafted' (idle, pending,
    or one of the four refusal kinds)
  why: Every criterion of this task is phrased as a fact about 'a stated draft'. The
    stale message can only render inside CapabilitySchemaHelperFields's `state.outcome.kind
    === 'drafted'` branch, which the existing suite (capability-schema-helper-fields.spec.ts's
    idle/pending/refusal tests) already shows is unreachable for any other outcome
    kind. No criterion or node states a staleness requirement for a helper that never
    stated a draft.
- edge_case: the helper's link and chosen operation both changing to different values
    in the same update
  why: Every criterion treats the link and the chosen operation as two independent
    triggers joined by 'or', and the offered-act guarantee (criterion 6) does not
    vary by which trigger caused staleness. Testing the combination adds no class
    beyond the independent link-differs and operation-differs representatives already
    tested.
- edge_case: two link or operation changes dispatched at once (a race)
  why: No criterion or node states a concurrency guarantee for the Schema Helper's
    own local state, and `onLinkChange`/`onChooseOperation` are both synchronous state
    setters with no interleaving for a test to observe.
untested:
- 'scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale:
  this task''s own Notes already record that no criterion reaches the scenario''s
  clause that a stated draft stands marked stale while the helper holds no chosen
  operation at all. The scenario''s other two then-clauses -- the helper actually
  clearing its chosen operation once the named link changes, and the draft-request
  act being withheld while none is chosen -- are facts about the helper''s own choice
  state and request gating, not about this task''s staleness marking, and this delivery
  does not implement them (recorded as REMAINDER in the task itself). No test here
  decides the scenario whole: the staleness fragment it shares with this task''s own
  rule is incidentally produced by the same comparison, but it cannot itself be exercised
  through what this task''s own delivery exposes (see the next entry), so the node
  is left without a test that decides its full fact.'
- 'UNDERDETERMINED entry (a stated draft standing marked stale while the helper holds
  no chosen operation at all, even where its link matches): the entry names an implementation
  the specification refuses -- one that guards the staleness comparison so an undefined
  chosenOperation reads as vacuously matching rather than differing, which would satisfy
  every criterion of this task as literally phrased (all say ''differs from a chosen
  operation'') while violating the scenario. No test here decides between that guarded
  implementation and the one delivered, because the state the entry turns on -- a
  drafted outcome standing while the helper holds no chosen operation at all -- is
  unreachable through useCapabilitySchemaHelper''s own public interface: onChooseOperation
  only ever accepts a defined operation with no path to clear it, and onRequestDraft
  refuses to dispatch (leaving the outcome at ''idle'') whenever chosenOperation is
  undefined. Reaching the state the entry describes would require driving the hook''s
  internal state directly rather than through what it exposes, which is not a test
  this suite writes. This is a finding about what this task''s own delivery makes
  reachable, not a decision on the entry''s underlying question.'
- Whether an operation the draft was generated for is compared by its path and method
  taken together, or by object identity of the chosen OpenApiOperation, is a behavior
  the implementation inferred from the sibling connector helper's own convention rather
  than one any criterion or node states. No test here pins that comparison rule, since
  nothing bound to this task distinguishes it from the alternative.
---

## What it is

Tests proving that the Schema Helper's stated draft keeps reading as valid while the helper's link and chosen operation still match what produced it, flips to stale the instant either one moves away, and keeps both apply acts offered and effective throughout.

## Notes

One earlier suite attempt (schema-draft-applied-to-the-capability-edit-stated-draft-marked-stale-suite) failed at the lint step: a new test used a `waitFor` + `queryByText` pattern the standard's testing-library rules forbid (prefer-find-by, prefer-presence-queries). Fixed by the test author (replaced with `findByText`); suite passed on retry.
