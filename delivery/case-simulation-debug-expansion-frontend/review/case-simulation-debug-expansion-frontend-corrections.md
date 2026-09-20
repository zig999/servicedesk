---
target: frontend
title: case-simulation-debug-expansion-frontend-corrections, first review
summary: Coverage, specification-conformance and standard-conformance over the 4 corrective tasks (evidence-semantics-always-present,
  not-grounded-reason, hypothesis-run-cost, assessment-under-its-call) that fixed findings 1-4 of this
  initiative's own earlier review; the captured build+suite ran clean, so no failures pass finding applies.
reviewed:
- src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
- src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
- src/hooks/use-case-simulation-cockpit-hypothesis-run-cost.spec.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/hooks/use-case-simulation-history.spec.ts
- src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
- src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
- src/hooks/use-simulate-case-not-grounded-reason.spec.ts
- src/hooks/use-simulate-case.test-support.ts
- src/hooks/use-simulate-case.ts
- src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
- src/hooks/use-simulate-hypothesis-not-grounded-reason.spec.ts
- src/hooks/use-simulate-hypothesis-request.spec.ts
- src/hooks/use-simulate-hypothesis-run-cost.spec.ts
- src/hooks/use-simulate-hypothesis.test-support.ts
- src/hooks/use-simulate-hypothesis.ts
- src/routes/case-simulation-case-result-compare.spec.ts
- src/routes/case-simulation-case-result-evidence-tab.spec.ts
- src/routes/case-simulation-case-result-json-tab.spec.ts
- src/routes/case-simulation-case-result-panel-compare.spec.ts
- src/routes/case-simulation-case-result-panel-debug.spec.ts
- src/routes/case-simulation-case-result-panel-evidence.spec.ts
- src/routes/case-simulation-case-result-panel-json.spec.ts
- src/routes/case-simulation-case-result-panel-totals.spec.ts
- src/routes/case-simulation-case-result-panel.spec.ts
- src/routes/case-simulation-case-result-panel.tsx
- src/routes/case-simulation-case-result-types.spec.ts
- src/routes/case-simulation-case-result-types.ts
- src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
- src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
- src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
- src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
- src/routes/case-simulation-cockpit-adapters-not-grounded-reason.spec.ts
- src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
- src/routes/case-simulation-cockpit-adapters.spec.ts
- src/routes/case-simulation-cockpit-adapters.ts
- src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
- src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
- src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
- src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
- src/routes/case-simulation-detail-panel.test-support.ts
- src/routes/case-simulation-detail-types.spec.ts
- src/routes/case-simulation-detail-types.ts
- src/routes/case-simulation-evidence-item.spec.ts
- src/routes/case-simulation-evidence-item.tsx
- src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
- src/routes/case-simulation-hypotheses-table-row.ts
- src/routes/case-simulation-ready-view.test-support.ts
tasks:
- task/conformant-record-shapes/evidence-semantics-always-present
- task/conformant-record-shapes/not-grounded-reason
- task/conformant-record-shapes/hypothesis-run-cost
- task/conformant-record-shapes/assessment-under-its-call
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed end to end; nothing to diagnose
coverage:
- criterion: SimulateEvidenceItem in src/hooks/use-simulate-case.ts declares fields and concept_description
    as required members, with no optional marker on either.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: refuses an evidence item literal that assigns undefined to fields or concept_description
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs a bare item with the honest-empty value for both, never undefined
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs with both fields present, proving the declared shape accepts them
  why: The required-ness is bound by the two @ts-expect-error directives, which fail only when the project's
    type-check step runs; the two evidence-snapshot tests witness the shape rather than the optionality.
- criterion: The Evidence type in src/hooks/use-simulate-hypothesis.ts declares fields and concept_description
    as required members, with no optional marker on either.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
    name: refuses an evidence item literal that assigns undefined to fields or concept_description
- criterion: SimulationEvidenceItem in src/routes/case-simulation-detail-types.ts declares fields and
    conceptDescription as required members, with no optional marker on either.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-types.spec.ts
    name: refuses an evidence item literal that assigns undefined to fields or conceptDescription
- criterion: toDetailEvidence in src/routes/case-simulation-cockpit-adapters.ts carries fields and conceptDescription
    from the source item with no fallback for an absent value.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: carries a present, non-empty snapshot through unchanged
  - file: src/routes/case-simulation-cockpit-adapters.spec.ts
    name: carries every field through, renaming the run's own `origin` to the Detail region's own `connector`
  why: The carrying half is exercised; the "no fallback for an absent value" half is unexercised since
    the corrected source type now makes an item lacking either attribute inexpressible in a test, so an
    adapter written with `item.fields ?? []` would pass unchanged.
- criterion: renderConceptDescription in src/routes/case-simulation-evidence-item.tsx has one rendering
    for an empty concept_description and no separate rendering for an absent one.
  state: partial
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence when concept_description is an empty string
  why: No item in the set carries an absent concept_description, so a reintroduced absent-value branch
    would sit unreached and no test here would fail.
- criterion: renderFieldSemantics in src/routes/case-simulation-evidence-item.tsx has one rendering for
    an empty fields list and no separate rendering for an absent one.
  state: partial
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence for an empty fields array, alongside the item's own other
      content
  why: Nothing in the set hands the function an absent fields list; a separate absent-value branch would
    be unreachable and would fail no test here.
- criterion: An evidence item whose concept_description is the empty string renders exactly what the item's
    own snapshot carries, with no glossary value substituted for the emptiness.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence when concept_description is an empty string
- criterion: An evidence item whose fields list is empty renders exactly what the item's own snapshot
    carries, with no capability-registry value substituted for the emptiness.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence for an empty fields array, alongside the item's own other
      content
- criterion: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts asserts the honest-empty
    value for a bare item's fields and concept_description and asserts undefined for neither.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: carries a bare item's own honest-empty fields and concept_description through unchanged, asserting
      undefined nowhere
- criterion: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts asserts
    the honest-empty value for a bare item's conceptDescription and asserts undefined for it nowhere.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
    name: carries a single-hypothesis run's own collected evidence item through, narrowed to the Detail
      region's own shape
- criterion: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts holds no assertion of a rendering
    distinct from its empty-value siblings for an item carrying no snapshot at all.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the same stated-absence sentences criteria 4 and 5 already render, for an item constructed
      with no explicit fields/concept_description override
- criterion: testEvidenceItem in src/routes/case-simulation-detail-panel.test-support.ts returns a SimulationEvidenceItem
    supplying both fields and conceptDescription by default.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the same stated-absence sentences criteria 4 and 5 already render, for an item constructed
      with no explicit fields/concept_description override
  why: No test reads the builder's returned object directly; the binding is through the default-built
    item's rendering.
- criterion: The frontend type-checks with no error arising from fields or concept_description in any
    file that declares, converts or renders an evidence item.
  state: partial
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: refuses an evidence item literal that assigns undefined to fields or concept_description
  why: No test in the set runs the project's type-check; the criterion is settled by the build's typecheck
    step rather than by this set.
- criterion: SimulateEvaluationReason in src/hooks/use-simulate-case.ts admits not-grounded.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-not-grounded-reason.spec.ts
    name: admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares
- criterion: EvaluationReason in src/hooks/use-simulate-hypothesis.ts admits not-grounded.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-not-grounded-reason.spec.ts
    name: admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares
- criterion: CockpitEvaluation's reason in src/routes/case-simulation-cockpit-adapters.ts admits not-grounded.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-not-grounded-reason.spec.ts
    name: admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares
- criterion: SimulationEvaluationReason in src/routes/case-simulation-hypotheses-table-row.ts admits not-grounded.
  state: covered
  tests:
  - file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
    name: admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares
- criterion: REASON_LABEL in src/routes/case-simulation-hypotheses-table-row.ts holds an entry for not-grounded.
  state: covered
  tests:
  - file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
    name: holds a non-empty label for not-grounded, rather than leaving the lookup absent
- criterion: A simulate response whose evaluation carries reason not-grounded reaches verdictCell with
    a label rather than an absent lookup.
  state: partial
  tests:
  - file: src/routes/case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts
    name: resolves a label for an inconclusive evaluation whose reason is not-grounded, rather than an
      absent lookup
  why: The verdictCell test computes its expectation from REASON_LABEL["not-grounded"] itself, so with
    the entry absent both sides would read "Inconclusive · undefined" and it would still pass. Nothing
    in the set carries a not-grounded reason from a simulate response through the adapter chain into verdictCell,
    so the "reaches" half is asserted nowhere.
- criterion: No evaluation-reason union in the cockpit admits a value the specification's own enumeration
    does not declare.
  state: partial
  tests:
  - file: src/hooks/use-simulate-case-not-grounded-reason.spec.ts
    name: admits no cause beyond the specification's four-value enumeration
  why: Each of the four named unions is pinned to the four-value enumeration; the criterion's totality
    ("no union in the cockpit") is unexercised, since nothing establishes these four are the only such
    unions the cockpit declares.
- criterion: The frontend type-checks with no error arising from an evaluation reason in any file that
    declares or consumes one.
  state: partial
  tests:
  - file: src/hooks/use-simulate-case-not-grounded-reason.spec.ts
    name: admits no cause beyond the specification's four-value enumeration
  why: No test in the set runs the project's type-check; "any file" rests on the build's typecheck step.
- criterion: SimulateHypothesisResult in src/hooks/use-simulate-hypothesis.ts declares cost as a required
    field carrying calls, input_tokens and output_tokens.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: requires calls, input_tokens and output_tokens on cost, admits no other member, and the shared
      fixture's own cost carries exactly those three
- criterion: That cost field reuses the SimulateCost already declared in src/hooks/use-simulate-case.ts
    rather than a second declaration of the same three members.
  state: uncovered
  why: 'Both tests import SimulateCost and assign a value of that type, which establishes the shape but
    not the reuse: TypeScript is structural, so a second, identically-declared three-member type would
    satisfy the same tests.'
- criterion: SimulateHypothesisResult declares durations beside cost, so the narrowed run's record carries
    both totals the rule names.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: requires collection, judgment and total on durations, admits writing only optionally, admits
      no other member, and the shared fixture's own durations carries no writing key by default
- criterion: The durations a hypothesis run carries express writing as absent rather than as a figure,
    since that run reaches no consolidation call.
  state: partial
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: requires collection, judgment and total on durations, admits writing only optionally, admits
      no other member, and the shared fixture's own durations carries no writing key by default
  why: The same test deliberately compiles a durations carrying a writing figure too; no test takes a
    real simulate-hypothesis response through the hook and asserts the durations the caller receives carry
    no writing.
- criterion: useSimulateHypothesis's onSimulate result carries the cost the response returned, unaltered.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: returns exactly the cost the response sent, unmodified, for a cost whose calls total the one
      judgment call a hypothesis run makes
- criterion: A simulate-hypothesis response whose cost totals one judgment call and no consolidation call
    reaches the caller with those totals intact.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: returns exactly the cost the response sent, unmodified, for a cost whose calls total the one
      judgment call a hypothesis run makes
- criterion: simulateHypothesisResult in src/hooks/use-case-simulation-cockpit.test-support.ts returns
    a SimulateHypothesisResult carrying a cost.
  state: covered
  tests:
  - file: src/hooks/use-case-simulation-cockpit-hypothesis-run-cost.spec.ts
    name: returns a cost carrying exactly calls, input_tokens and output_tokens, alongside evidence, evaluation
      and durations
- criterion: No call site in src/hooks/use-case-simulation-cockpit.ts or in any spec reading hypSim's
    result declares a hypothesis-result literal of its own to supply the new field.
  state: uncovered
  why: Nothing in the set asserts the absence of such a literal; no assertion would fail if a call site
    declared its own hypothesis-result literal.
- criterion: The frontend type-checks with no error arising from SimulateHypothesisResult in any file
    that declares, builds or consumes one.
  state: partial
  tests:
  - file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
    name: requires calls, input_tokens and output_tokens on cost, admits no other member, and the shared
      fixture's own cost carries exactly those three
  why: No test in the set runs the project's type-check; "any file" rests on the build step.
- criterion: CaseResultRun in src/routes/case-simulation-case-result-types.ts declares outcome, referral,
    determiningHypothesis, text and register only within the called true branch of its consolidation discriminant.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
  why: That the five are declared within the true branch is exercised; the word "only" is unexercised
    since no spec offers a run literal with any of the five at the top level for the type-checker to reject.
- criterion: No branch of CaseResultRun states any of those five fields where the discriminant states
    that no consolidation call happened.
  state: partial
  tests:
  - file: src/routes/case-simulation-case-result-panel.spec.ts
    name: shows an explicit no-call message in place of the outcome line, the customer-facing text box
      and the Debug > Prompt tab, rather than an empty or dashed placeholder
  why: That the false branch requires none of the five is exercised; that the branch states none of them
    even optionally is unexercised.
- criterion: register sits in the same branch as text, usage, elapsedMs and prompt, so one shape carries
    everything the one writing call produced.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries a %s register through to the run entry unchanged, one of the only two registers a case's
      curator may ask for
- criterion: A run for a narrowed simulate-hypothesis call, which resolves no outcome and no assessment,
    is expressible as a CaseResultRun without supplying any of those five fields.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-compare.spec.ts
    name: renders both runs' own hypothesis verdicts side by side when one of the two runs made no consolidation
      call at all
- criterion: toNewCaseResultRun in src/routes/case-simulation-cockpit-adapters.ts builds the five assessment
    fields only inside the branch on which it sets called true.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
  why: The builder is exercised only for a response carrying an assessment; no test gives it one that
    produced no consolidation call.
- criterion: src/routes/case-simulation-case-result-panel.tsx reads shownRun's outcome, referral, determiningHypothesis,
    text and register only after the discriminant states a consolidation call happened.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-panel.spec.ts
    name: shows an explicit no-call message in place of the outcome line, the customer-facing text box
      and the Debug > Prompt tab, rather than an empty or dashed placeholder
- criterion: src/routes/case-simulation-case-result-compare.tsx reads those same five fields only after
    that same discriminant.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-compare.spec.ts
    name: renders both runs' own hypothesis verdicts side by side when one of the two runs made no consolidation
      call at all
- criterion: A shown run that carries no assessment presents no outcome, referral, determining hypothesis,
    text or register drawn from any other run of the session.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-panel.spec.ts
    name: keeps every assessment region on the no-call message for the shown run, even though an earlier
      run in the same session carries its own consolidation answer
- criterion: Each of the nine local makeRun and newRun fixture builders — in case-simulation-case-result-types.spec.ts,
    case-simulation-case-result-panel.spec.ts, case-simulation-case-result-panel-debug.spec.ts, case-simulation-case-result-panel-evidence.spec.ts,
    case-simulation-case-result-panel-json.spec.ts, case-simulation-case-result-panel-totals.spec.ts,
    case-simulation-case-result-panel-compare.spec.ts, case-simulation-case-result-compare.spec.ts and
    use-case-simulation-history.spec.ts — constructs its run with the five assessment fields inside the
    discriminated branch.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-types.spec.ts
    name: resolves the two selected runs in this history's own chronological (array) order, never the
      order the two were selected
  why: All nine builders nest the assessment under consolidationCall; eight of the nine omit determiningHypothesis
    entirely, so the nesting of that one field is demonstrated only by case-simulation-case-result-panel.spec.ts.
- criterion: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts asserts toNewCaseResultRun's
    output with the assessment nested and asserts the flat pre-correction shape nowhere.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
- criterion: The frontend type-checks with no error arising from CaseResultRun in any file that declares,
    builds or reads one.
  state: partial
  why: No test in the set runs the project's type-check, and no spec carries a type-level assertion over
    CaseResultRun; the criterion is settled by the build's typecheck step.
findings:
- file: src/hooks/use-simulate-case.ts
  where: the SimulateCitation type declaration, lines 42-45
  evidence: "export type SimulateCitation = {\n  readonly concept: string;\n  readonly field: string;\n\
    };"
  cost: Every citation this type can express -- including the one that only names which evidence a no-data
    verdict cites -- is forced to carry a field. A caller can never represent that no-data citation without
    inventing a field value the cited evidence's own snapshotted item never had.
  correction: 'Type field as optional (`readonly field?: string;`), present only where the citation grounds
    a confirmed or refuted verdict.'
  pass: conformance
- file: src/hooks/use-simulate-hypothesis.ts
  where: the Citation type declaration, lines 34-37
  evidence: "export type Citation = {\n  readonly concept: string;\n  readonly field: string;\n};"
  cost: 'The same forcing as SimulateCitation: a hypothesis-run citation naming only which evidence a
    no-data verdict cites can never be typed without an invented field.'
  correction: 'Type field as optional (`readonly field?: string;`), matching domain/investigation/citation''s
    conditional presence.'
  pass: conformance
- file: src/routes/case-simulation-detail-types.ts
  where: the SimulationCitation type declaration
  evidence: "export type SimulationCitation = {\n  readonly concept: string;\n  readonly field: string;\n\
    };"
  cost: domain/investigation/citation names a case where field is genuinely absent -- a citation naming
    only which evidence a no-data verdict cites. Declaring field a required string forecloses that shape
    at the type level.
  correction: 'declare `field` optional (`readonly field?: string;`) to match the node''s own optional
    attribute.'
  pass: conformance
- file: src/routes/case-simulation-case-result-types.ts
  where: line 3, the SimulationVerdict type alias
  evidence: export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";
  cost: A reader who wants to know what verdicts a hypothesis's judgment can conclude finds them enumerated
    here rather than in domain/investigation/verdict; if the node's own set of values ever changes, this
    independent literal union has to be remembered and edited in step by hand.
  correction: Derive SimulationVerdict from the same source the specification's own verdict enumeration
    is generated from, rather than re-enumerating it here.
  pass: conformance
- file: src/routes/case-simulation-case-result-types.ts
  where: line 10, the SimulationConsolidationRegister type alias
  evidence: export type SimulationConsolidationRegister = "formal" | "plain";
  cost: The corrective task moved register's own value into CaseResultAssessmentCall so it is read from
    one place at the call site, but the closed vocabulary that value is drawn from is still independently
    retyped here rather than sourced from domain/knowledge/consolidation-register.
  correction: Reference the register vocabulary from wherever the specification's own enumeration is derived,
    rather than restating it as an independent local type.
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
  where: the it.each test title ("carries a %s register through to the run entry unchanged, one of the
    only two registers a case's curator may ask for")
  evidence: '"carries a %s register through to the run entry unchanged, one of the only two registers
    a case''s curator may ask for"'
  cost: The exhaustive membership of the register enumeration is domain/knowledge/consolidation-register's
    own fact to state. Stating it again here, independently, as a bare claim rather than a citation of
    that node, means a reader who trusts the test description as verified fact is trusting a copy nobody
    rebinds.
  correction: Drop the parenthetical claim, or rephrase it to cite domain/knowledge/consolidation-register
    by identity, rather than asserting the count under the test's own authority.
  pass: conformance
- file: src/routes/case-simulation-case-result-panel.tsx
  where: lines 33-35, the guard at the top of CaseSimulationCaseResultPanel
  cites: API-04
  evidence: "if (runs.length === 0) {\n    return null;\n  }"
  cost: Before any full-case run has completed this session the whole panel disappears rather than saying
    so, while the sibling Evidence tab in this same feature renders an explicit 'No evidence collected
    for this run.' message for the equivalent gap.
  correction: Render an explicit 'no result yet' message in place of the null return, matching the explicit-empty-state
    convention the Evidence tab already follows.
  pass: standard
- file: src/routes/case-simulation-case-result-panel.tsx
  where: lines 132-140, the per-run "Show" button and the result region it controls
  cites: ACC-07
  evidence: "<Button\n  type=\"button\"\n  variant=\"secondary\"\n  aria-pressed={run.id === shownRun.id}\n\
    \  aria-label={`Show run #${index + 1}`}\n  onClick={() => setShownRunId(run.id)}\n>\n  {run.id ===\
    \ shownRun.id ? \"Shown\" : \"Show\"}\n</Button>"
  cost: Clicking Show swaps the outcome line, the customer-facing text box and whichever Debug tab is
    open to a different run's own content, with no aria-live region anywhere in the file and no focus
    movement.
  correction: Wrap the region shownRun feeds in an aria-live="polite" container, or move focus into it,
    whenever shownRunId changes.
  pass: standard
- file: src/routes/case-simulation-cockpit-adapters.ts
  where: lines 24-40, the CockpitEvaluation type
  cites: TYP-04
  evidence: "export type CockpitEvaluation = {\n  readonly hypothesis: string;\n  readonly verdict: \"\
    confirmed\" | \"refuted\" | \"inconclusive\";\n  readonly citations: readonly { readonly concept:\
    \ string; readonly field: string }[];\n  readonly reason?: \"no-data\" | \"judgment-failure\" | \"\
    deadline-exceeded\" | \"not-grounded\";\n  readonly usage?: { readonly input_tokens: number; readonly\
    \ output_tokens: number };\n  readonly elapsed_ms?: number;\n  readonly prompt?: string;\n  ...\n\
    };"
  cost: Nothing in the type stops a caller from building a confirmed CockpitEvaluation that carries a
    reason, or an inconclusive one missing it; every reader has to re-derive the verdict/reason/usage/prompt
    correlation for itself instead of the compiler ruling the invalid combination out once.
  correction: Model CockpitEvaluation as a discriminated union over verdict -- a decided branch (usage?/elapsed_ms?/prompt?
    together, no reason) and an inconclusive branch (reason required) -- the way CaseResultConsolidationCall
    already does.
  pass: standard
- file: src/routes/case-simulation-hypotheses-table-row.ts
  where: lines 14-20, the SimulationHypothesisEvaluation type
  cites: TYP-04
  evidence: "export type SimulationHypothesisEvaluation = {\n  readonly hypothesis: string;\n  readonly\
    \ verdict: SimulationVerdict;\n  readonly reason?: SimulationEvaluationReason;\n  readonly usage?:\
    \ SimulationUsage;\n  readonly stale?: boolean;\n};"
  cost: A row value can be constructed with verdict confirmed and a reason set, or inconclusive with none,
    and the type gives the compiler nothing to refuse it with.
  correction: Model it as a union keyed on verdict -- a decided branch with no reason and an inconclusive
    branch requiring one -- the same way CaseResultConsolidationCall already does.
  pass: standard
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---
## What it is

Four passes over the corrective epic that fixed findings 1-4 of the initiative's first review: coverage of the 4 tasks' criteria against 33 test files; specification-conformance over the 48 reviewed files, batched into four delegations by area (same disclosed narrowing as the first review, given the file set's size); standard-conformance against the same registry; and no failures pass, since the captured run (`run/review-case-simulation-debug-expansion-frontend-corrections-suite`) passed clean.

**Coverage** — 37 criteria audited. Similar pattern to the first review: several criteria describing a *type declaring* a field are only pinned by `@ts-expect-error`, not by anything that would fail if a required field were quietly widened back to optional with a second identically-shaped type (the "reuses SimulateCost rather than a second declaration" criterion is fully **uncovered** for exactly this reason — TypeScript's structural typing makes a duplicate declaration indistinguishable from reuse at both compile time and runtime). Two "no call site declares its own literal" criteria are also uncovered — nothing asserts an absence. Several "only inside the true branch" / "no branch states these where false" criteria are proven for the true-branch case but not for the exclusion itself (an optional field added to the false branch would satisfy every test).

**Specification-conformance** — 6 findings, all `contradicts`. Two are **residual, pre-existing issues the corrective round did not touch**: `SimulateCitation.field` / `Citation.field` / `SimulationCitation.field` are still typed as unconditionally required across all three declarations, though `domain/investigation/citation` states `field` is absent for a no-data citation (this was flagged in the first review already and remains open). Two are **new**, surfaced by the correction itself: `SimulationVerdict` and `SimulationConsolidationRegister` in `case-simulation-case-result-types.ts` still retype closed domain vocabularies independently rather than sourcing them from the specification's own enumerations. One is new and minor: a corrective task's own test title states the register enumeration's exhaustive membership as a bare claim rather than citing the node.

**Standard-conformance** — 4 findings. Two are the **same findings the first review already reported and which the corrective round did not touch**: the `CockpitEvaluation` flattened-union (TYP-04) and the "Show" control's missing `aria-live` (ACC-07). One is the **same defect newly duplicated**: `SimulationHypothesisEvaluation` in `case-simulation-hypotheses-table-row.ts` now shows the identical TYP-04 pattern as `CockpitEvaluation`. One is new: `CaseSimulationCaseResultPanel` returns `null` with no message when no run has completed, unlike the sibling Evidence tab's explicit empty state (API-04).

**Failures** — none; the captured run is entirely green.

This record is evidence only. No finding here was acted on by this review, and none is a verdict — what to do with any of it is a person's decision.


## Notes

Specification-conformance ran as 4 batched delegations (grouped by area) rather than one delegation per file, the same disclosed narrowing used in this initiative's first review. The trace's own fold/bind step (`trace.py --fold`/`--bind-record`) was not run, for the same reason as the first review: the batched returns do not carry the exact per-file node-set granularity `--fold` requires. `trace.py --check`'s existing drift is left for a later `/reconcile`.

Two of the six conformance findings (`domain/investigation/citation`'s forced `field`) and two of the four standard findings (TYP-04 on `CockpitEvaluation`, ACC-07) restate findings the initiative's first review (`review/case-simulation-debug-expansion-frontend.md`) already reported — the corrective round that fixed findings 1-4 did not reach them, and this review confirms they still stand.
