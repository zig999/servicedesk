---
target: frontend
title: Stale-draft marking proof for the Configuration Helper's stated draft
summary: Proves the draft's mark (link, operation, connector), the three independent staleness
  triggers, and the act applying it staying offered while stale, through new sibling spec files at
  both hook levels and the rendered surface, plus one test over the widened-answer alternative the
  task's UNDERDETERMINED entry refuses.
implementation: sha256:b70cc70ea4066bccb103eb48d2ab5712e691a80f2481423bed7a671b63d9f720
run: run/drafted-answer-disclosure-stale-draft-marking-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
  name: exposes statedFor equal to exactly the dispatched link, path and method, and the connector
    the hook was constructed with
  proves: Criteria 1, 2 and 3 -- a drafted outcome's statedFor names the link, the operation (path
    and method) and the connector name of the request that produced it.
  fails_when: statedFor is absent once a draft is stated, or any of its link, path, method or
    connector field differs from the request that actually produced the currently drafted outcome.
- file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
  name: exposes no link, path or method key on the drafted outcome's draft
  proves: 'UNDERDETERMINED, from the specification -- the task''s Notes name an implementation that
    widens the drafted answer''s own shape to carry the request''s link and chosen operation back
    beside the draft''s own attributes (rather than exposing them through a separate statedFor
    field), and observes that this alternative satisfies every criterion here while
    rules/integration/a-connector-configuration-draft-response-carries-no-capability refuses it.'
  fails_when: the drafted outcome's own draft object carries a link, path or method key -- i.e. the
    exact widened-answer implementation the entry names, rather than the separate statedFor field
    the delivered implementation actually uses.
- file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
  name: stays false right after the draft is stated, and becomes true once the link alone changes,
    with no new draft request issued
  proves: Criterion 4 -- from the moment the surface's link differs from the one the draft was
    generated for, the draft is stated as stale, and stating it does not itself dispatch a new
    request.
  fails_when: stale is already true right after the draft is stated (nothing yet differs), stale
    stays false once the link alone is changed, or changing the link issues a second draft request.
- file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
  name: stays false right after the draft is stated, and becomes true once a different operation is
    chosen, with the link and connector left untouched
  proves: Criterion 5 -- from the moment the surface's chosen operation differs from the one the
    draft was generated for, the draft is stated as stale.
  fails_when: stale stays false once a different operation is chosen through onChooseOperation,
    while the link and connector are left exactly as they were when the draft was stated.
- file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
  name: stays false right after the draft is stated, and becomes true once the caller re-renders
    the helper with a different connector
  proves: Criterion 6 -- from the moment the surface's connector name differs from the one the
    draft was generated for, the draft is stated as stale.
  fails_when: stale stays false once useConnectorConfigurationHelper is re-rendered with a
    different connector, while the link and the chosen operation are left exactly as they were when
    the draft was stated.
- file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
  name: renders a staleness statement when state.stale is true
  proves: Criteria 4, 5 and 6, as rendered at the surface -- a stale draft states its staleness
    beside the drafted configuration.
  fails_when: no text mentioning staleness renders alongside a drafted outcome once state.stale is
    true.
- file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
  name: renders no staleness statement when state.stale is false
  proves: The negative boundary the staleness-message test above needs to be meaningful -- a
    drafted, non-stale disclosure states nothing about staleness, so the positive case is evidence
    of an actual condition rather than text that always renders.
  fails_when: a staleness statement renders even though state.stale is false.
- file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
  name: keeps the drafted configuration visible, offers the Apply act enabled, and applies the
    draft's own unchanged configuration text, even while the draft is stale
  proves: Criterion 7 -- a draft stated as stale is not discarded (its configuration text stays on
    screen) and nothing withholds the act applying it (the Apply button stays enabled and still
    calls onApply with the draft's own unmodified configuration text).
  fails_when: the drafted configuration text disappears while stale, the Apply button is disabled
    or absent while stale, or clicking it fails to call onApply with the draft's own configuration
    text unchanged.
untested:
- domain/integration/connector-configuration-draft -- this task's own implementation record states,
  per the task's UNDERDETERMINED note, that no field was added to this value object or to
  pickConnectorConfigurationDraftFields -- the node's fact is unchanged here and no criterion of
  this task reaches it.
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing --
  the task's own REMAINDER note states that two of this node's three clauses reach no criterion of
  this task and belong to a sibling task; only its third clause is exercised here as a means to the
  staleness tests, never asserted on its own account.
- rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes -- the
  node's one fact is encoded across three files this codebase's own test conventions keep under two
  non-composable styles (hook tests mounted with renderHook against real mutation/query stubs;
  route tests rendered from constructed state fixtures with no live hook wired in). Each clause has
  its own test above, but no single test asserts the whole fact at once without conflating those two
  styles.
---

## What it is
The proof of the mark, the three independent staleness triggers, and the act applying it staying offered while stale.

## Notes
Suite round 1 failed lint: testing-library/render-result-naming-convention on a renderHook() result
named `rendered`. Fixed by renaming to `view`. Suite round 2 green.
