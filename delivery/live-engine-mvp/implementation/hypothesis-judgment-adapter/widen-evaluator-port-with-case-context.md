---
title: Widen the hypothesis-evaluator port to carry the pinned case's title and when_to_use
summary: IHypothesisEvaluator.evaluate() takes a third CaseContext parameter (title, whenToUse), judgment-stage.ts
  forwards the pinned case's own values unchanged on both the first call and the retry, and the fake adapter
  plus its direct-call test are updated to keep compiling and passing.
task: sha256:57fc2af64d5f1ad8297f12a848e83ff9422ca47d870037d844be870cbfa55b05
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-widen-evaluator-port-with-case-context-build
files:
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: declares and exports a new CaseContext type ({ title, whenToUse }); IHypothesisEvaluator.evaluate()
    now takes (criterion, evidence, caseContext) instead of (criterion, evidence); doc comments updated
    to describe the widened contract and its narrow reading of the domain node's "only"
- path: src/investigation/judgment-stage.ts
  effect: computes one CaseContext from theCase.title/theCase.when_to_use inside judgeHypotheses(), threads
    it unchanged through the internal option types, and passes it as evaluate()'s third argument on both
    the first call and the retry
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  effect: evaluate() now declares a third, unused _caseContext parameter (CaseContext) so the fake keeps
    implementing the widened port explicitly; behavior unchanged
- path: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  effect: imports CaseContext and adds a fixture constant A_CASE_CONTEXT; every one of the file's 8 direct
    evaluator.evaluate() call sites now supplies it as the third argument so the file compiles and runs
    against the widened interface
criteria:
- criterion: IHypothesisEvaluator.evaluate() declares parameters for the hypothesis's criterion, its own
    evidence, and the pinned case's title and when_to_use.
  met: true
  how: 'evaluate(criterion, evidence, caseContext: CaseContext), where CaseContext = { title: string;
    whenToUse: string }, declared in hypothesis-evaluator.port.ts'
- criterion: judgment-stage.ts's first evaluate() call and its retry both pass the same case's title and
    when_to_use the judgeHypotheses() call itself was given, unchanged.
  met: true
  how: judgeHypotheses() builds caseContext exactly once from options.case and passes that same object
    through the first evaluate() call and, on a structurally invalid decided answer, into the retry —
    neither path recomputes or mutates it
- criterion: FakeHypothesisEvaluator and every existing test constructing an evaluate() call compile and
    run against the widened signature, with judgment-stage.spec.ts and hypothesis-evaluator.port.spec.ts
    still passing.
  met: true
  how: FakeHypothesisEvaluator.evaluate() declares the third caseContext parameter (ignored); hypothesis-evaluator.port.spec.ts's
    8 direct calls supply an A_CASE_CONTEXT fixture; judgment-stage.spec.ts's own hand-written evaluators
    needed no change since they implement the interface with fewer parameters than it declares, which
    TypeScript's structural typing already permits
nodes:
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: the port's evaluate() now takes the hypothesis's own criterion and evidence plus the pinned case's
    title/when_to_use grouped as CaseContext; the Responsibility text's "criterion and evidence only"
    is read narrowly, stated explicitly in the port's own doc comment beside the code it constrains
- node: constraints/judgment-runs-behind-a-port
  how: 'honored, not newly encoded: hypothesis judgment is still invoked only through IHypothesisEvaluator,
    unchanged by the widened signature'
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: CaseContext carries exactly the two facts this constraint names as the closed block's own permitted
    case content, and judgment-stage.ts passes the pinned case's own values for both, unchanged; the delimited
    data block and no-tool-calling provider call the constraint's fitness also names belong to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator,
    which this record does not reach
- node: constraints/the-domain-depends-on-no-infrastructure
  how: 'honored: the widened port still imports no framework, driver or provider client, and CaseContext
    is its own plain-string type rather than the full Case aggregate'
inferences:
- inferred: title and when_to_use are grouped into a single CaseContext object (evaluate()'s third parameter)
    rather than added as two further positional string arguments
  from: 'the project''s own standard MNT-01 (max-params: 3) combined with this module''s own established
    convention of naming small context objects at exactly this kind of call boundary (citation-validation.ts''s
    HypothesisCitationContext)'
- inferred: CaseContext is declared as its own minimal type rather than by importing the full Case aggregate
    into the port
  from: 'the port''s own existing precedent: EvidenceItem already takes only { concept } & ObservationOutcome
    rather than the full Evidence record'
- inferred: the field is named whenToUse (camelCase) rather than mirroring the Case aggregate's own snake_case
    when_to_use
  from: the sibling port's own established convention (IAssessmentConsolidator.consolidate() already takes
    consolidationRegister) together with the standard's CON-01
- inferred: FakeHypothesisEvaluator's new third parameter is named _caseContext, underscore-prefixed and
    unused
  from: this file's own existing convention for its unused _evidence parameter, and the standard's eslint
    argsIgnorePattern
preserved:
- 'judgeHypotheses()''s entire existing orchestration: per-hypothesis no-data short-circuit, the configured
  pool bound, the shared deadline signal, the retry-once policy, and the three-way degrade to no-data/deadline-exceeded/judgment-failure'
- FakeHypothesisEvaluator's seeded-by-criterion-alone behavior
- hypothesis-evaluator-modules.spec.ts's own import-boundary and single-implementer audits, unmodified
- every existing assertion in judgment-stage.spec.ts and hypothesis-evaluator.port.spec.ts, none of which
  needed a behavioral change to keep passing
deferred:
- what: building the judgment prompt's own delimited data block, its no-tool-calling provider call, and
    any real grounding of a verdict in the case's title/when_to_use
  why: explicitly out of this task's scope — belongs to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator,
    which this task is cut ahead of and separate from
- what: domain/investigation/hypothesis-evaluator's own Responsibility text was not textually amended
    to acknowledge the pinned case's title/when_to_use
  why: the specification is not this delivery's to edit; a future reader could take its "only" the broader
    way, worth the analysis reconciling explicitly
---

## What it is

The one port through which judgment is invoked gains two more read-only parameters.
Its one caller forwards the case's own already-held title and when_to_use rather than reading them from anywhere new.

## Notes

domain/investigation/hypothesis-evaluator's own Responsibility text ("criterion and evidence only") is read narrowly, excluding another hypothesis's own data rather than the pinned case's own context; a future reader could take it the other way, worth reconciling in the specification.
The judgment prompt's delimited data block and no-tool-calling provider call are deferred to task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator, which depends on this task.
