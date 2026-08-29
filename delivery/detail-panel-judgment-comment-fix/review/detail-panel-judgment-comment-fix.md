---
title: 'Review: detail-panel-judgment-comment-fix'
summary: What four passes found over the corrective fix flattening the Detail evidence capability reference
  to the wire's own two flat fields.
reviewed:
- src/hooks/use-simulate-case.ts
- src/routes/case-simulation-cockpit-adapters.ts
- src/routes/case-simulation-detail-types.ts
- src/routes/case-simulation-detail-evidence-tab.tsx
- src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
- src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
- src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
- src/hooks/use-case-simulation-cockpit-detail-evidence-capability-hotfix.spec.ts
- src/hooks/use-simulate-case.test-support.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/routes/case-simulation-cockpit-adapters.spec.ts
- src/routes/case-simulation-detail-evidence-tab.spec.ts
- src/routes/case-simulation-detail-panel.test-support.ts
- src/routes/case-simulation-ready-view.test-support.ts
- src/hooks/use-simulate-case-response-shape.spec.ts
tasks:
- task/detail-evidence-capability-reference-hotfix/flatten-detail-evidence-capability-reference
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/detail-panel-judgment-comment-fix) passed clean on every step -- nothing
    failed to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Opening the Detail panel for an evaluation produced by POST /v1/simulate/hypothesis does
    not throw or show "Something went wrong" for a well-formed response.
  state: uncovered
  why: 'use-case-simulation-cockpit.ts computes detail.evidence as selectedEvaluation.source === "case"
    && lastCaseResult ? toDetailEvidence(lastCaseResult.evidence) : [] -- a hypothesis-sourced evaluation''s
    evidence is structurally always [], so no fixture can ever drive a hypothesis response through toDetailEvidence
    or the capability-field code this task changed. The one test that opens the Detail region after a
    hypothesis-sourced run (use-case-simulation-cockpit-evaluations.spec.ts) is written for a different
    task''s criteria and only asserts detail.evaluation and detail.evidence === [], never a deliberate
    non-throwing check over this path.'
- criterion: Opening the Detail panel for an evaluation produced by POST /v1/simulate does not throw or
    show "Something went wrong" for a well-formed response.
  state: covered
  tests:
  - file: src/hooks/use-case-simulation-cockpit-detail-evidence-capability-hotfix.spec.ts
    name: builds detail.evidence for a selected hypothesis from a completed full-case run without throwing,
      carrying the run's own capability reference as flat fields
  - file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
    name: toDetailEvidence -- does not throw for a well-formed evidence item carrying only the flat capability_name/capability_version
      fields a real response actually sends
  - file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
    name: toDetailEvidence -- carries the real response's own capability_name and capability_version through,
      unchanged, for a well-formed evidence item
- criterion: The Evidence tab's capability/connector line reads capability_name and capability_version
    as flat fields of the evidence item, never as a nested capability object.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
    name: CaseSimulationDetailEvidenceTab -- renders the capability name, version and connector straight
      off the evidence item's own flat fields, for a well-formed item with no nested capability object
  - file: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
    name: CaseSimulationDetailEvidenceTab -- does not throw for a well-formed evidence item, reproducing
      the Detail panel's own real crash scenario and showing it no longer occurs
- criterion: SimulateEvidenceItem (frontend/app/src/hooks/use-simulate-case.ts) declares capability_name
    and capability_version as flat string fields, matching src/src/http/dto/simulate-case.dto.ts's own
    evidenceSchema, instead of a nested capability object.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
    name: useSimulateCase -- carries capability_name and capability_version through as flat string fields
      on the loaded evidence item, exactly as this task's own captured real response sent them
  - file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
    name: toDetailEvidence -- maps capability_name/capability_version to capabilityName/capabilityVersion,
      and origin to connector, rather than keeping the wire's own snake_case names or nesting them under
      a capability object
findings:
- pass: conformance
  file: src/hooks/use-simulate-case.ts
  where: the header comment above the SimulateEvidenceItem type, lines 154-176
  evidence: '`origin`, already the node''s own declared string attribute ("where the observation came
    from, for audit"), is the connector half of criterion 2''s "capability/connector reference" -- kept
    under its own declared name rather than renamed, since the node states no field named `connector`
    on evidence itself.'
  cost: domain/investigation/evidence's own decided fact for `origin` is only "an opaque name" for "where
    the observation came from, for audit" (decision-log.md, attributes.origin.type); no node states that
    this value is, or must be, the referenced domain/integration/capability's own `connector` attribute.
    The comment asserts that correspondence as settled fact, so it lives only here -- a reader who wants
    to know what `origin` actually carries, or whether it can ever diverge from the referenced capability's
    own declared connector, will not find that rule in the specification, only in this file's prose.
  correction: State the correspondence (or its absence) in domain/investigation/evidence's own description
    or relationships section if it is a business decision, and have this comment cite that statement rather
    than assert the fact itself.
- pass: conformance
  file: src/routes/case-simulation-detail-types.ts
  where: the header comment above the SimulationEvidenceItem type, lines 41-64
  evidence: '`connector` is that same reference''s own `connector` attribute, read through evidence''s
    own `origin` field (this task''s own Notes: the connector this evidence item came through is not a
    second fact modeled on evidence itself, it is read through this same capability reference) -- also
    flattened onto the item directly rather than nested, for the same reason.'
  cost: The same unstated correspondence between evidence's `origin` and the referenced capability's own
    `connector` attribute is restated here as an established fact, independently of use-simulate-case.ts's
    own comment. Two files now each assert this domain rule on their own authority; if the specification
    is ever amended to state something different for `origin` (or to state no such correspondence at all),
    both comments -- not a specification node -- are what a maintainer would have to notice and reconcile,
    and nothing forces that.
  correction: Have this comment point at wherever domain/investigation/evidence (or a rule) states the
    correspondence, once it is stated there, rather than asserting it as this type's own reasoning.
- pass: standard
  file: src/routes/case-simulation-cockpit-adapters.ts
  where: lines 45-75, the CockpitEvaluation type declaration
  cites: TYP-04
  evidence: "export type CockpitEvaluation = {\n  readonly hypothesis: string;\n  readonly verdict: \"\
    confirmed\" | \"refuted\" | \"inconclusive\";\n  readonly citations: readonly { readonly concept:\
    \ string; readonly field: string }[];\n  readonly reason?: \"no-data\" | \"judgment-failure\" | \"\
    deadline-exceeded\";\n  readonly usage?: { readonly input_tokens: number; readonly output_tokens:\
    \ number };\n  readonly elapsed_ms?: number;\n  readonly prompt?: string;"
  cost: Nothing here stops a caller from constructing a combination the domain rules this same file quotes
    already forbid -- a `reason` on a confirmed/refuted verdict, or `usage`/`elapsed_ms`/`prompt` on an
    evaluation whose reason is no-data (no call happened). The two source shapes this type normalizes
    -- SimulateEvaluation (use-simulate-case.ts) and SimulationJudgmentCall (case-simulation-detail-types.ts)
    -- both encode this exact correlation as a discriminated union, so a reader who trusts CockpitEvaluation
    the way they trust its siblings will not notice that only fromCaseEvaluation/fromHypothesisEvaluation's
    own hand-written logic, not the compiler, is what keeps an invalid combination from being built here
    or in a fixture.
  correction: Model CockpitEvaluation as a discriminated union over verdict, mirroring SimulateEvaluation
    and SimulationJudgmentCall's own shape -- a confirmed/refuted branch carrying citations and no reason,
    an inconclusive branch carrying reason -- rather than a flat object of independently optional fields.
- pass: standard
  file: src/routes/case-simulation-detail-evidence-tab.tsx
  where: lines 54-63, the prettyPrintObservation function
  cites: ARC-03
  evidence: "function prettyPrintObservation(observation: string): string {\n  try {\n    return JSON.stringify(JSON.parse(observation),\
    \ null, 2);\n  } catch {\n    return observation;\n  }\n}"
  cost: This transformation of the fetched evidence record's own observation field is defined and kept
    entirely inside the route component's own file rather than a hook or service module. It is not exported,
    so the only proof reaching it is case-simulation-detail-evidence-tab.spec.ts's "shows the observation
    pretty-printed inside a collapsible 'Observation' block" test, which can only exercise it by rendering
    the whole CaseSimulationDetailEvidenceTab component -- exactly the cost the rule names, and exactly
    the failure mode a second component reading the same wire shape would hit by copying this function
    rather than calling it.
  correction: Move prettyPrintObservation into a service module (or a shared formatting hook) alongside
    the other wire-shape transforms this cockpit already factors out (case-simulation-cockpit-adapters.ts),
    and import it here, so it is unit-testable on its own and reusable by any other region that renders
    the same evidence observation.
---

## What it is

The review of task/detail-evidence-capability-reference-hotfix/flatten-detail-evidence-capability-reference:
four passes over the fifteen files this corrective delivery created or modified, plus the
captured suite run (run/detail-panel-judgment-comment-fix) and the trace's own drift reading over
the frontend target.

## Notes

Coverage: 3 of 4 criteria covered; criterion 1 ("opening the Detail panel for a POST
/v1/simulate/hypothesis evaluation does not throw") is uncovered -- not because the fix is wrong,
but because use-case-simulation-cockpit.ts hardcodes a hypothesis-sourced evaluation's
detail.evidence to [] regardless of what that endpoint returns, so nothing in this file set can
drive a hypothesis response through the capability-field code this task changed. This is the same
gap the implementation record's own `deferred` section already named (wiring a hypothesis-sourced
run's own evidence into the Detail panel is a distinct task) -- the implementation record's
criterion-1 `how` argues the criterion is met because that path structurally cannot throw, which
this pass does not dispute, but no test in the set exercises that path deliberately either.
Conformance: both findings are the same fact stated twice -- use-simulate-case.ts's and
case-simulation-detail-types.ts's own header comments each assert, on their own authority, that
evidence's `origin` field corresponds to the referenced capability's own `connector` attribute.
No specification node states that correspondence; domain/investigation/evidence's own decided fact
for `origin` is only "an opaque name" (decision-log.md). Both comments are accurate about what the
code does and were written to explain this task's own flattening, but the correspondence they
assert is a domain fact currently living in two files' prose rather than in a node.
Standard: two findings, both in code this task did not write (CockpitEvaluation predates this
delivery; prettyPrintObservation is untouched by this fix) -- the files are in this review's own
set because this task modified them, and each rule's scope reaches the whole file.
Failures: the captured run (run/detail-panel-judgment-comment-fix -- install, typecheck, lint,
style, build, a11y, secret-scan, test) passed clean on every step, so this pass did not run --
there was nothing to diagnose.
Trace: `trace.py --check` over the frontend target reports 39 drift finding(s) over 162
binding(s) across the whole tree (0 orphaned, 1 moved, 38 code over 8 files). Of the four files
this task's own bind extended (domain/investigation/evidence, domain/integration/capability), all
four still carry 33 stale bindings under other, earlier nodes -- disclosed in full as the bind's
own receipt when this delivery's trace entries were written, and not repeated here. This is not a
finding and settles nothing about the change; the route for the `code` class is `/reconcile`, and
for the one unrelated `moved` finding (a backend rule node) a rebind when its own task is next
delivered. No suppression receipt applies -- this project's siegard.json declares no
`edits_freely` targets.
