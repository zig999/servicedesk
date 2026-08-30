---
title: Wire hypothesis-simulation evidence and judgment-call data through to the Detail
  panel
summary: A single-hypothesis simulation's own evidence array now reaches the Detail
  panel's Evidence tab and a normalized evaluation's own usage/elapsed_ms/prompt now
  reach its Prompt tab for both a hypothesis-sourced and a case-sourced selection,
  with three pre-existing spec files whose call sites predated these two functions'
  new required parameters updated to pass them explicitly.
task: sha256:b8729bfb8934ad5c37b8b72126a228ab8de60e018a3acbdee861552a71a26882
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-detail-hypothesis-hotfix-wire-hypothesis-evidence-and-prompt-build-2
files:
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: 'CockpitEvaluation gains an optional `evidence` field, populated only for
    a hypothesis-sourced evaluation. fromHypothesisEvaluation now takes the run''s
    own `evidence` array as a required second parameter and normalizes it through
    toDetailEvidence (reused as-is: use-simulate-hypothesis.ts''s Evidence is structurally
    identical to SimulateEvidenceItem) onto that field; fromCaseEvaluation is unchanged.
    toDetailJudgmentCall now takes a required CockpitEvaluation parameter and answers
    `called: true` with real usage/elapsedMs/prompt whenever all three are present
    on it, `called: false` otherwise; it is toDetailEvaluation''s only caller and
    toDetailEvaluation is called for either `source`, so the fix reaches the case-level
    path too.'
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: The single-hypothesis completion effect now passes the run's own `result.evidence`
    into fromHypothesisEvaluation alongside result.evaluation, instead of discarding
    it; the `detail.evidence` computation now reads `selectedEvaluation.evidence ??
    []` for a hypothesis-sourced selection instead of always answering `[]`, while
    the case-sourced branch (toDetailEvidence(lastCaseResult.evidence)) is untouched.
- path: src/routes/case-simulation-detail-types.ts
  effect: 'SimulationJudgmentCall''s `called: true` branch loosens `model` and `promptVersion`
    from required to optional, with an updated doc comment explaining why: neither
    simulate-case nor simulate-hypothesis ever writes an investigation (contracts/investigation/case-simulation),
    so those two investigation-scoped fields can never be honestly supplied from either
    response. usage/elapsedMs/prompt stay required on that branch, unchanged.'
- path: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  effect: Build fix only, no assertion touched -- both pre-existing fromHypothesisEvaluation(evaluation)
    call sites now pass fromHypothesisEvaluation(evaluation, []) as their second argument,
    matching the function's now-required signature.
- path: src/routes/case-simulation-cockpit-adapters.spec.ts
  effect: 'Build fix only, no assertion touched -- two pre-existing fromHypothesisEvaluation(evaluation)
    call sites now pass fromHypothesisEvaluation(evaluation, []); one pre-existing
    toDetailJudgmentCall() call site now passes a minimal literal CockpitEvaluation
    (hypothesis/verdict/citations/source/raw, no usage/elapsed_ms/prompt) so the now-required
    argument is supplied while the evaluation still carries none of the three fields
    that would flip the answer to called: true -- the asserted { called: false } outcome
    is unchanged.'
- path: src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  effect: 'Build fix only, no assertion touched -- the one pre-existing toDetailJudgmentCall()
    call site now passes the same kind of minimal, call-less CockpitEvaluation literal,
    so it keeps compiling and keeps asserting { called: false } truthfully.'
criteria:
- criterion: Simulating a single hypothesis whose response carries one or more evidence
    items renders those items in the Detail panel's Evidence tab, the same way a full-case
    simulation's own evidence already renders there.
  met: true
  how: fromHypothesisEvaluation narrows result.evidence through the shared toDetailEvidence
    adapter (identical to the full-case path) onto CockpitEvaluation.evidence, which
    detail.evidence reads for a hypothesis-sourced selection, reaching CaseSimulationDetailPanelProps.evidence
    and the same CaseSimulationDetailEvidenceTab component (unmodified) a case-sourced
    selection already renders through.
- criterion: Simulating a single hypothesis whose response carries no evidence (an
    empty array) renders the Evidence tab's existing empty-state content, not an error.
  met: true
  how: toDetailEvidence([]) returns []; CockpitEvaluation.evidence is then [] (not
    undefined), so `selectedEvaluation.evidence ?? []` yields [] too, and CaseSimulationDetailEvidenceTab's
    own existing items.length === 0 branch renders, unmodified. The two edited fromHypothesisEvaluation(evaluation,
    []) call sites in case-simulation-cockpit-adapters-stale.spec.ts exercise exactly
    this empty-array path and still pass.
- criterion: Simulating a single hypothesis whose evaluation carries prompt, usage
    and elapsed_ms renders the Prompt tab showing that real prompt text, not the "Judgment
    was never called for this hypothesis." placeholder.
  met: true
  how: 'toDetailJudgmentCall reads usage/elapsed_ms/prompt off the CockpitEvaluation
    it is given and, finding all three present, answers { called: true, usage: {...},
    elapsedMs, prompt }; CaseSimulationDetailPromptTab (unmodified) renders judgmentCall.prompt
    once judgmentCall.called is true.'
- criterion: Simulating a single hypothesis whose evaluation carries no prompt, no
    usage and no elapsed_ms (an inconclusive evaluation with reason no-data) still
    renders the Prompt tab's existing "Judgment was never called for this hypothesis."
    placeholder.
  met: true
  how: 'toDetailJudgmentCall answers { called: false } whenever any of usage/elapsed_ms/prompt
    is undefined -- exactly what a no-data evaluation carries. The two edited toDetailJudgmentCall(...)
    call sites (in case-simulation-cockpit-adapters.spec.ts and case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts)
    now supply an evaluation carrying none of the three fields, and both still assert
    { called: false }.'
- criterion: Simulating a full case (POST /v1/simulate) whose per-hypothesis evaluation
    carries prompt, usage and elapsed_ms renders that hypothesis's own Prompt tab
    showing the real prompt, the same fix applying to the case-level path since case-simulation-cockpit-adapters.ts's
    toDetailJudgmentCall serves both.
  met: true
  how: 'fromCaseEvaluation (untouched) already carries usage/elapsed_ms/prompt onto
    CockpitEvaluation for source: "case". toDetailEvaluation -- toDetailJudgmentCall''s
    only caller, called for either source -- passes that same CockpitEvaluation through,
    so the presence check applies identically whether the evaluation came from simulate-case
    or simulate-hypothesis; no source-specific branch was added.'
- criterion: Neither the Evidence tab's nor the JSON tab's own existing rendering
    of a full-case simulation's evidence changes.
  met: true
  how: 'The case-sourced branch of detail.evidence (selectedEvaluation.source ===
    "case" && lastCaseResult ? toDetailEvidence(lastCaseResult.evidence) : ...) is
    unmodified in its condition and its own true branch; fromCaseEvaluation and the
    JSON tab''s rawResponse: selectedEvaluation.raw are both untouched.'
- criterion: The concept Select's own identity and the rest of the Detail panel (verdict
    dot, citations list, criterion text, stale indicator) are unaffected.
  met: true
  how: toDetailEvaluation's hypothesis/verdict/citations/stale fields, and toHypothesisRevisionSummary,
    are unmodified; the concept Select lives in case-simulation-detail-evidence-tab.tsx,
    untouched by this delivery. The three edited spec files change only call-site
    arguments, none of the Detail panel's own JSX.
nodes:
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-types.ts
  how: toDetailJudgmentCall encodes the node's own "usage, elapsed_ms and prompt ...
    present exactly when a call happened, absent when reason no-data means judgment
    was never called at all" as a co-occurrence check over all three fields of a normalized
    CockpitEvaluation, deciding SimulationJudgmentCall's called discriminant from
    it. SimulationJudgmentCall's doc comment records why model/promptVersion -- investigation-scoped,
    per this same node's own text -- were loosened rather than required alongside
    them.
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: fromHypothesisEvaluation routes a single-hypothesis run's own collected evidence
    (SimulateHypothesisResult.evidence, already a full Evidence array per this node)
    onto CockpitEvaluation.evidence through the existing toDetailEvidence normalizer,
    unchanged in its own field mapping -- this delivery only extends which evidence
    reaches it, never how one item is read.
- node: domain/investigation/evaluation-reason
  how: 'Not re-encoded: toDetailJudgmentCall''s presence check does not read `reason`
    at all, deciding `called` from whether usage/elapsed_ms/prompt are present instead
    -- a data-driven reading of the same co-occurrence domain/investigation/evaluation
    already states for no-data, chosen so this code does not have to assume anything
    about whether judgment-failure/deadline-exceeded also leave those three absent.
    The node constrains this work without a fact of its own values reaching the code.'
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: The node's own "simulate-hypothesis narrows the same run to what one named
    hypothesis revision collects and judges, alone" is why that run's whole evidence
    array can be attached to its one evaluation without filtering. Its own "Neither
    operation writes an investigation" is the stated reason SimulationJudgmentCall's
    model/promptVersion were loosened to optional rather than required alongside usage/elapsedMs/prompt.
inferences:
- inferred: 'SimulationJudgmentCall''s model and promptVersion fields should be loosened
    to optional on the called: true branch rather than removed outright or left required
    with a fabricated value.'
  from: contracts/investigation/case-simulation's own guarantee that neither simulate-case
    nor simulate-hypothesis ever writes an investigation, together with domain/investigation/evaluation's
    own attribution of model/prompt_version to the investigation aggregate rather
    than to the evaluation itself; the task's own Notes, which record that domain/investigation/investigation
    governs nothing this task's criteria need.
- inferred: use-simulate-hypothesis.ts's Evidence type can be passed directly to toDetailEvidence,
    whose parameter is typed readonly SimulateEvidenceItem[] (use-simulate-case.ts's
    own evidence type), without a separate normalizer.
  from: 'Reading both type declarations field by field: concept, inputs, observation,
    observed_at, ttl, origin, result, result_detail?, capability_name, capability_version,
    elapsed_ms, fields? and concept_description? are declared identically on both,
    so TypeScript''s structural typing accepts one wherever the other is expected.'
- inferred: Widening fromHypothesisEvaluation's and toDetailJudgmentCall's new parameters
    with a safe default was rejected in favor of updating the three pre-existing spec
    files' own call sites.
  from: 'A default would be dishonest against what every real caller actually has:
    grepping the whole target tree shows use-case-simulation-cockpit.ts is fromHypothesisEvaluation''s
    only non-test caller and always passes result.evidence from the dispatch response
    it just received, and toDetailEvaluation is toDetailJudgmentCall''s only non-test
    caller and always passes the evaluation it was itself given. A default parameter
    implies a caller sometimes reasonably has none of that data, which is not true
    of any real call site this fix reaches.'
- inferred: The literal CockpitEvaluation object supplied at both edited toDetailJudgmentCall()
    call sites carries no usage/elapsed_ms/prompt, deliberately.
  from: 'Chosen so the pre-existing, untouched assertion (.toEqual({ called: false
    })) stays true under the new, argument-dependent behavior rather than merely happening
    to compile.'
preserved:
- Every assertion in all three edited spec files is untouched -- only call-site arguments
  were added.
- fromCaseEvaluation's single-argument signature, toDetailEvaluation, toRowEvaluation,
  toManifestRows, toRunSummary, toDurations, toNewCaseResultRun, toDetailEvidence
  and toHypothesisRevisionSummary are all untouched.
- A case-sourced evaluation's Evidence tab continues to read lastCaseResult.evidence
  through the unmodified toDetailEvidence(lastCaseResult.evidence) branch, never the
  new per-evaluation evidence field.
- The JSON tab's rawResponse continues to read selectedEvaluation.raw, the unmodified
  wire object for the selected hypothesis's own evaluation.
- toRowEvaluation and the Hypotheses-table row it feeds read none of the fields this
  delivery added or changed.
- The verdict dot, citations list, criterion text and stale indicator all read fields
  this delivery does not touch.
deferred:
- what: SimulationJudgmentCall's model/promptVersion fields remain declared (now optional)
    rather than removed, even though neither of this region's two present-day producers
    can ever supply them.
  why: 'Removing them outright is a larger surface change (touching case-simulation-detail-evidence-tab.tsx''s
    own render of judgmentCall.model/judgmentCall.promptVersion, and every existing
    fixture/spec constructing a called: true literal) than this task''s own two stated
    fixes require, and no criterion of this task asks for it.'
- what: 'Two pre-existing spec titles/comments now describe a narrower truth than
    their prose states: case-simulation-cockpit-adapters.spec.ts''s own describe block
    still reads "always { called: false } regardless of anything about the evaluation",
    and case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts references
    toDetailJudgmentCall''s "already-disclosed inference" that it "always answers
    { called: false }" -- both are now true only for the specific evaluation each
    test constructs, not unconditionally.'
  why: Correcting prose/comments in a pre-existing .spec.ts file sits outside what
    this corrective task's own instructions authorized touching (call-site arguments
    only, never a test's own assertions or wording); left for a future task or a human's
    own judgment on the same file.
---

## What it is
Three source files fixed (case-simulation-cockpit-adapters.ts, use-case-simulation-cockpit.ts, case-simulation-detail-types.ts) and three pre-existing spec files whose call sites needed updating for the new required parameters (case-simulation-cockpit-adapters-stale.spec.ts, case-simulation-cockpit-adapters.spec.ts, case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts).

## Notes
A first attempt changed the two function signatures without updating three pre-existing spec files' own call sites, breaking `npm run typecheck` (6 errors, TS2554 "Expected N arguments, but got fewer"). Fixed by updating those three files' call-site arguments only -- no assertion touched -- rather than giving either function a default parameter, since grepping every real (non-test) call site of both functions shows neither ever reasonably omits the new argument.
Two pre-existing spec titles/comments now describe a narrower truth than their prose states (see this record's own `deferred`) -- left as documentation drift outside this corrective task's authorized scope (call-site arguments only), not silently rewritten.
