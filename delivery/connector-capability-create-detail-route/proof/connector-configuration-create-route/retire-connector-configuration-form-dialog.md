---
title: Proof that the connector configuration popup form dialog is retired
summary: One new filesystem test closes the one criterion a running test can state directly; the
  remaining structural criteria stand on the cited run's passing typecheck/build steps and two
  existing, untouched specs, cited rather than duplicated.
implementation: sha256:e37406fcd21b0417cb2dd0a7700e438007fd0896c1bfe385341a2e5831f6f85c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-create-route-retire-connector-configuration-form-dialog-suite-2
tests:
- file: src/routes/connector-configuration-form-dialog-retirement.spec.ts
  name: the connector configuration form dialog module > no longer exists in the tree
  proves: 'Criterion 1: "The connector configuration form dialog module no longer exists in the tree."'
  fails_when: src/routes/connector-configuration-form-dialog.tsx is recreated at that path, whatever its content
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: 'ConnectorConfigurationDetailReadyView — Add attribute reconciles against the registered configuration text, not an unsaved edit (criterion 3) > keeps reconciling against the last registered text after Configuration is edited but not saved'
  proves: 'Criterion 4: "The assertion that the currently typed configuration text reaches the connector test panel still stands against a surviving call site of that panel." Written for a different, already-delivered task and left untouched by this one, this test mounts the real ConnectorConfigurationDetailReadyView (the one surviving call site of ConnectorTestPanel) against the real, unmocked panel and observes its own subject-attribute-row derivation change with the text supplied — proving the text still reaches the panel through this call site, exactly as it did before this deletion.'
  fails_when: connector-configuration-detail-ready-view.tsx stops passing state.registeredConfigurationText into ConnectorTestPanel's configurationText prop, or ConnectorTestPanel stops deriving its attribute rows from that string
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: 'ConnectorConfigurationDetailReadyView — Add attribute reconciles against the just-saved configuration text once a save lands (criterion 4) > reconciles against the newly saved text the next time Add attribute is clicked after a successful save'
  proves: 'The same criterion 4 fact, from its other side — the panel keeps receiving whatever text is currently registered even as that text changes underneath it across a save, which the deleted dialog''s own removal does not disturb because this call site is untouched.'
  fails_when: a save no longer updates the value connector-configuration-detail-ready-view.tsx forwards into ConnectorTestPanel's configurationText prop
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: 'ConnectorConfigurationCreateScreen -- dispatches register-connector under the typed name (criterion 6) > issues PUT /v1/connectors/{connector} with the typed connector name and the entered configuration'
  proves: 'Criterion 6: "The connector-configuration create/edit form hook the routed create screen consumes is not deleted." This pre-existing, untouched test mounts the routed create screen, which calls useConnectorConfigurationForm(null, handleSaved) directly, fills in both fields, and observes a real PUT dispatch carrying what was typed — the hook this task''s only edit (removing ConnectorConfigurationFormTarget, which nothing in the hook''s own body ever read) left untouched is exercised end to end.'
  fails_when: use-connector-configuration-form.ts's useConnectorConfigurationForm is deleted, renamed, or stops producing the PUT dispatch connector-configuration-create-screen.tsx relies on
not_applicable:
- edge_case: absent or empty input, a boundary condition, a duplicate, concurrent operations against one subject
  why: this task deletes a component and a type and touches no input-handling, no validation boundary and no concurrency-sensitive code path — its six criteria are entirely negative/structural facts (a module gone, nothing importing or referencing it, a type undeclared) plus one preservation fact (a surviving call site unchanged) and one non-deletion fact (a hook untouched); none of them describes behavior over a range, a collection, or simultaneous access, so no edge case of that shape is raised by this task's own claimed criteria
- edge_case: a dependency that fails or answers slowly
  why: this task dispatches no request of its own (per the implementation record's own nodes entries) and adds no new network-bound code path; the one call site this task must not disturb (connector-configuration-detail-ready-view.tsx's ConnectorTestPanel composition) is untouched, and its own failure/latency behavior is out of this task's scope and unchanged by it
untested:
- 'Criterion 2 ("No module in the frontend app imports the connector configuration form dialog component.") is not proven by a written test here. It is a totality claim over every module in the tree, and the fact it asserts is exactly what TypeScript''s own compiler refuses to let compile: a static import of a path that resolves to nothing is a compile error, not a runtime failure a vitest assertion could distinguish more precisely than "the build did not fail." The cited run''s typecheck.log ran to completion with `tsc --noEmit` exiting 0 over the whole of tsconfig.json''s own `include: ["src", ...]`, which is the exhaustive form of this exact check — every file under src, not a hand-picked subset. A hand-rolled substring/grep scanner over src risks the opposite of what it promises: this task''s own implementation record documents two files (connector-configurations-screen.tsx, capabilities-browser-screen.tsx) that still mention the component''s name in prose header comments, so a naive "the identifier does not appear as text anywhere in src" test would fail today over content criterion 2 was never about, and a version narrowed to match only import syntax duplicates, with strictly worse recall, what tsc already decided exactly. No equivalent scanning idiom exists elsewhere in this suite to draw the narrower pattern from without inventing one from nothing.'
- 'Criterion 3 ("No spec file references the deleted connector configuration form dialog module.") is not proven by a written test here, for the same reason as criterion 2: a spec file is itself under src and inside tsconfig.json''s `include`, so a spec that still imported the deleted module would fail the same `tsc --noEmit` step, which the cited run''s typecheck.log shows passing. The implementation record additionally documents the one spec that used to import the component (connector-configuration-form-dialog-forwards-configuration-text.spec.ts) as removed from the tree by the test-author delegation that preceded this proof, once it confirmed the fact it proved is already covered by connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts — the same file cited above for criterion 4.'
- 'Criterion 5 ("The nullable-identity connector configuration form-target type is no longer declared.") is not proven by a written test here. A TypeScript type has no runtime representation at all — it is erased entirely by the compiler — so no vitest assertion executing after compilation could observe whether ConnectorConfigurationFormTarget is declared anywhere; only tsc itself can decide this fact, and it already did, exiting 0 in the cited run''s typecheck.log after this task''s own edit to use-connector-configuration-form.ts removed the declaration. This is not a gap a differently-written test could close: the fact is compile-time-only by construction.'
divergences:
- cites: TST-04
  file: src/routes/connector-configuration-form-dialog-retirement.spec.ts
  departure: this spec sits beside connector-configuration-form-dialog.tsx's own former path rather than beside a unit it covers, because the unit criterion 1 asserts is precisely the thing this task deleted — there is no longer a file for a test to sit beside and be named for.
  why: the rule presupposes a surviving unit to pair a test with; a criterion whose entire content is that unit's own absence has no such pairing available, and naming the file for the retired module (plus .spec) is the closest equivalent this repository's own convention offers.
---

## What it is
One new test — a direct filesystem check that `src/routes/connector-configuration-form-dialog.tsx`
no longer exists — closes criterion 1, the one structural criterion a running test can state
without duplicating what a compiler already decided exhaustively. Criteria 2, 3 and 5 are
compile-time-only facts (a dangling import, a spec still referencing a deleted module, a type no
longer declared) that TypeScript's own `tsc --noEmit` — run as this task's own captured, passing
`typecheck` step — already verifies over every file `tsconfig.json` includes, which is every file
under `src`; a hand-written scanner reproducing that check with a substring or regex search would
have strictly worse recall than the compiler, and this task's own implementation record documents
prose mentions of the retired names in two untouched files that such a scanner would have to avoid
tripping over without ever being asked to. Criterion 4 (the surviving `ConnectorTestPanel` call
site still receives configuration text) and criterion 6 (the create/edit form hook survives) are
each proven by an existing, untouched spec file, cited above rather than duplicated: criterion 4 by
`connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts` (written for a
different, already-delivered task, over the one call site this task's own instructions required it
not to touch), and criterion 6 by `connector-configuration-create-screen-save.spec.ts` (which
mounts the routed create screen and exercises `useConnectorConfigurationForm` end to end through a
real dispatch).

## Notes
No new behavioral test is written for criteria 2, 3, 5, 4 or 6: this task rearranges and deletes,
it introduces no behavior the specification did not already state, and where an existing spec
already exercises what a criterion claims survives (4, 6), writing a second test beside it would
describe the arrangement this task just made rather than prove anything the first test did not
already cover. Where a criterion is a fact only a compiler can decide (2, 3, 5), inventing a
vitest-level substitute for that compiler would be lower-fidelity evidence than the passing
`typecheck` step already captured in the cited run, not higher-fidelity evidence — and this
codebase's own specs hold no established idiom for scanning the whole source tree for the absence
of an identifier to draw a narrower, safer version of that check from. The one criterion left
(1) is a plain filesystem fact a test can state directly without any of those risks, so it is the
one criterion this proof adds a test for.
