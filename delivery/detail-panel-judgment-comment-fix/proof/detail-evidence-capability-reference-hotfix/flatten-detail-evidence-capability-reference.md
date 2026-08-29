---
title: Proof for flatten-detail-evidence-capability-reference
summary: New tests proving the Detail evidence's capability reference is read as two
  flat fields at every layer this task touched (the wire type, the adapter, the Detail
  region's own type and its Evidence tab), plus the human-authorized correction of
  seven pre-existing test files this task's own type correction broke.
implementation: sha256:498c1c7176b711027687405b23ed20116df85710c03f123aad74cc7af4404ed9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-evidence-capability-reference-hotfix-flatten-detail-evidence-capability-reference-suite-2
tests:
- file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
  name: toDetailEvidence -- does not throw for a well-formed evidence item carrying
    only the flat capability_name/capability_version fields a real response actually
    sends
  proves: Opening the Detail panel for an evaluation produced by POST /v1/simulate
    does not throw or show "Something went wrong" for a well-formed response.
  fails_when: toDetailEvidence dereferences a nested item.capability.name/item.capability.version
    again (the exact regression this task fixes), throwing on a SimulateEvidenceItem
    that never carries a capability object
- file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
  name: toDetailEvidence -- carries the real response's own capability_name and capability_version
    through, unchanged, for a well-formed evidence item
  proves: Opening the Detail panel for an evaluation produced by POST /v1/simulate
    does not throw or show "Something went wrong" for a well-formed response.
  fails_when: toDetailEvidence stops reading item.capability_name/item.capability_version,
    so the produced capabilityName/capabilityVersion are wrong or undefined
- file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
  name: toDetailEvidence -- maps capability_name/capability_version to capabilityName/capabilityVersion,
    and origin to connector, rather than keeping the wire's own snake_case names or
    nesting them under a capability object
  proves: 'the implementation''s own recorded inference: the Detail region''s SimulationEvidenceItem
    carries the flattened reference as camelCase capabilityName/capabilityVersion
    plus a flat connector field, rather than literally spelling them capability_name/capability_version
    at that type'
  fails_when: toDetailEvidence's output carries snake_case capability_name/capability_version
    keys, or nests them under a capability object, instead of flat camelCase capabilityName/capabilityVersion/connector
- file: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
  name: CaseSimulationDetailEvidenceTab -- renders the capability name, version and
    connector straight off the evidence item's own flat fields, for a well-formed
    item with no nested capability object
  proves: The Evidence tab's capability/connector line reads capability_name and capability_version
    as flat fields of the evidence item, never as a nested capability object.
  fails_when: the tab's render line reads item.capability.name/item.capability.version/item.capability.connector
    instead of item.capabilityName/item.capabilityVersion/item.connector, so the rendered
    text is missing or wrong for an item carrying only the flat fields
- file: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
  name: CaseSimulationDetailEvidenceTab -- does not throw for a well-formed evidence
    item, reproducing the Detail panel's own real crash scenario and showing it no
    longer occurs
  proves: The Evidence tab's capability/connector line reads capability_name and capability_version
    as flat fields of the evidence item, never as a nested capability object.
  fails_when: rendering the tab with a flat-only SimulationEvidenceItem throws, e.g.
    from dereferencing a nested capability object that item never carries
- file: src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
  name: useSimulateCase -- carries capability_name and capability_version through
    as flat string fields on the loaded evidence item, exactly as this task's own
    captured real response sent them
  proves: SimulateEvidenceItem (frontend/app/src/hooks/use-simulate-case.ts) declares
    capability_name and capability_version as flat string fields, matching src/src/http/dto/simulate-case.dto.ts's
    own evidenceSchema, instead of a nested capability object.
  fails_when: the loaded evidence item carries no capability_name/capability_version
    fields, or carries them nested under a capability object, for a real, well-formed
    POST /v1/simulate response body
- file: src/hooks/use-case-simulation-cockpit-detail-evidence-capability-hotfix.spec.ts
  name: useCaseSimulationCockpit -- builds detail.evidence for a selected hypothesis
    from a completed full-case run without throwing, carrying the run's own capability
    reference as flat fields
  proves: Opening the Detail panel for an evaluation produced by POST /v1/simulate
    does not throw or show "Something went wrong" for a well-formed response.
  fails_when: selecting a hypothesis after a completed full-case run throws while
    building detail.evidence, or the resulting evidence item does not carry capabilityName/capabilityVersion/connector
    as flat fields matching the run's own capability_name/capability_version/origin
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: useCaseSimulationCockpit -- the Detail region reflects whichever run last
    produced an evaluation (criterion 4) -- opens the Detail region for a hypothesis's
    evaluation from a single-hypothesis run, exactly as it would from a full-case
    run
  proves: Opening the Detail panel for an evaluation produced by POST /v1/simulate/hypothesis
    does not throw or show "Something went wrong" for a well-formed response.
  fails_when: a hypothesis-sourced evaluation's detail.evidence stops being [], i.e.
    toDetailEvidence is reached for a hypothesis-sourced run and could throw on its
    own capability dereference
not_applicable:
- edge_case: A malformed evidence item missing capability_name/capability_version,
    or carrying them as non-string values, at the wire boundary
  why: Every criterion of this task is explicitly scoped to "a well-formed response";
    SimulateEvidenceItem declares both fields as required strings, so testing a value
    missing them would test a response this task's own criteria place out of scope,
    not this fix
- edge_case: An empty evidence array
  why: toDetailEvidence maps over the array; zero iterations never reaches the capability
    fields this fix touches, and this is already proven, untouched, by use-simulate-case-response-shape.spec.ts's
    own pre-existing "carries an empty evidence array as a valid success" test, which
    this task's fix does not disturb
- edge_case: Two concurrent POST /v1/simulate (or /v1/simulate/hypothesis) dispatches
  why: The dispatch-at-a-time gate (isDispatchingRef/isSimulating) is pre-existing
    and outside this task's own file set; this task changes only how one already-arrived
    evidence item's capability reference is read, never how many dispatches may be
    in flight, and that gate is already proven by use-simulate-case.spec.ts's own
    concurrency tests
- edge_case: A duplicate concept across two evidence items in one response
  why: toDetailEvidence maps every item through unchanged, one output entry per input
    entry in the array's own order; this task's fix touches only the shape read per
    item, not how many items are read or how a duplicate concept is selected among
    them, and no criterion of this task states a de-duplication rule
---

## What it is

The proof for the corrective implementation flattening the Detail evidence's capability
reference: one test per criterion at every layer the fix touched, plus the human-authorized
correction of seven pre-existing test files whose fixtures or assertions encoded the same wrong
nested-capability shape this task's own type correction removed.

## Notes

Two suite runs preceded the one this record pins. run/detail-evidence-capability-reference-hotfix-flatten-detail-evidence-capability-reference-build
failed at typecheck: six pre-existing test files no longer compiled against the corrected types
(SimulateEvidenceItem, SimulationEvidenceItem) this task's implementation changed --
src/hooks/use-simulate-case.test-support.ts (two evidence-fixture literals, nested capability:
{ name, version } flattened to capability_name/capability_version), src/hooks/use-case-simulation-cockpit.test-support.ts
(one such fixture literal in simulateCaseResult(), same correction), src/routes/case-simulation-cockpit-adapters.spec.ts
(the toDetailEvidence test's own input fixture and its expected-output assertion, both corrected
to the flat shape), src/routes/case-simulation-detail-evidence-tab.spec.ts (its two
testCapability(...) call sites rewritten as direct flat overrides, the now-unused import
dropped), src/routes/case-simulation-detail-panel.test-support.ts (the SimulationCapabilityReference
import and the testCapability() helper removed, testEvidenceItem()'s own default inlined flat),
and src/routes/case-simulation-ready-view.test-support.ts (one such fixture literal, same
correction). The human explicitly authorized this: none of the six is a file this task's own
criteria name, and the correction is mechanical -- no existing test's assertion or intent
changed, only the literal shape it builds or expects, to match the corrected type.

run/detail-evidence-capability-reference-hotfix-flatten-detail-evidence-capability-reference-suite
then failed at test: a seventh pre-existing file, src/hooks/use-simulate-case-response-shape.spec.ts
(line 43), asserted the same stale nested capability object via toMatchObject against the exact
fixture the first correction above had already flattened -- invisible to typecheck because
toMatchObject's expected-object parameter is not checked against the received value's exact type.
A failure-diagnostician read the run and returned cause: test, with the correction; under the
same human authorization, the assertion was rewritten to the flat capability_name: "lookup-account",
capability_version: "1.0.0" properties the fixture actually produces. This record pins the suite
run that passed after that correction (run/...-suite-2); the two failing runs above are kept
under their own names.
