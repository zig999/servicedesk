---
title: Remove judgment-stage.ts's two throws for conditions the specification already makes unreachable
summary: Deletes hypothesisNamed's and evidenceFor's throw branches in judgment-stage.ts, relying on a
  compile-time non-null assertion in their place so both functions keep their non-optional return types
  with no runtime fallback.
task: sha256:500490a1b4e47a33dd1bcec3309989f1d11d7e6d5bb3aff2cae8335855f0a452
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/judgment-stage-dead-throws-removal-hotfix-remove-the-two-unreachable-throws-build
files:
- path: src/investigation/judgment-stage.ts
  effect: hypothesisNamed no longer throws when a required name is absent from theCase.hypotheses, and
    evidenceFor no longer throws when evidenceByHypothesis holds no entry for a required name; both now
    resolve the lookup and assert it non-null at compile time only, keeping their return types Hypothesis
    and readonly Evidence[] with no runtime guard, no synthesized hypothesis and no empty-array fallback
    in the removed branch's place.
criteria:
- criterion: Every name requires-evaluation-of(case) returns resolves to a hypothesis in that same case's own
    manifest (rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses);
    judgment-stage.ts's hypothesisNamed no longer contains a throw for the case where it does not.
  met: true
  how: "hypothesisNamed's body is now theCase.hypotheses.find((candidate) => candidate.name === name)!
    -- the if (hypothesis === undefined) { throw ... } branch is deleted outright, not replaced by any
    conditional."
- criterion: The evidence map judgment-stage.ts is given always holds an entry for every hypothesis
    requires-evaluation-of(case) names, given that hypothesis collects at least one concept;
    judgment-stage.ts's evidenceFor no longer contains a throw for the case where it does not.
  met: true
  how: "evidenceFor's body is now evidenceByHypothesis.get(name)! -- the if (evidence === undefined) {
    throw ... } branch is deleted outright, not replaced by any conditional."
- criterion: Neither hypothesisNamed nor evidenceFor is rewritten to return an optional or undefined value for
    the condition its throw is removed from — their return types stay non-optional (a Hypothesis; an
    evidence array), so a silent fallback cannot type-check in the throw's place.
  met: true
  how: "hypothesisNamed's declared return type stays Hypothesis and evidenceFor's stays readonly
    Evidence[], unchanged from before this task; the non-null assertion narrows the T | undefined
    .find()/.get() result to the declared type at compile time only, so Hypothesis | undefined or
    readonly Evidence[] | undefined never appears in either signature."
- criterion: Neither removal introduces a new fallback or default value for the condition it removes — the
    code path is deleted because it is unreachable, not replaced with a synthesized hypothesis or an
    empty evidence array standing in for a case the specification does not admit.
  met: true
  how: "No ??, no default parameter, no synthesized Hypothesis object and no ?? [] was added anywhere in
    either function; the only construct added is the non-null assertion, which has no runtime effect at
    all -- it changes nothing about what value is produced, only what the compiler is told about its
    type."
- criterion: judgeHypotheses' observable behavior over a pinned case's own required hypotheses is unchanged
    by this removal — every existing passing test for the judgment stage still passes.
  met: true
  how: "Neither judgeHypotheses, judgeOneHypothesis, runIsolatedCall, retryOrFail, nor any other function
    in the file was touched -- only hypothesisNamed's and evidenceFor's bodies changed, and only inside
    the branch this task's own criteria require removed. Every test exercising judgeHypotheses over a
    well-formed case (ordering, pool concurrency, deadlines, retries, citation validation,
    usage/elapsed_ms/prompt passthrough, no-data evidence) is unaffected, because those tests never touch
    the deleted branch. The two existing tests in judgment-stage.spec.ts that assert the removed throws
    directly now assert behavior this task deliberately deletes and will no longer pass unmodified -- see
    this record's own deferred entry; retiring or rewriting them is test authorship, outside this
    implementation record's scope."
nodes:
- node: domain/knowledge/case-version
  how: This task changes no case-version aggregate logic -- collection-plan, requires-evaluation-of,
    resolve-outcome, place-hypothesis, remove-hypothesis, update-draft, release, discard are all
    untouched. The removal in judgment-stage.ts leans entirely on this aggregate's own guarantee (its
    manifest composes exactly the hypotheses requires-evaluation-of names) as the reason
    hypothesisNamed's throw branch is unreachable; the node is honored by trust, not re-encoded.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  how: judgeHypotheses still maps requiresEvaluationOf(theCase) 1:1 into exactly one Promise per
    required name via Promise.all(requiredNames.map(...)), unchanged by this task, so the investigation
    still gets exactly one evaluation per required hypothesis. Removing hypothesisNamed's and
    evidenceFor's throws does not touch this mapping; it only stops re-checking a totality this rule's
    own premise (paired with requires-evaluation-of-names-exactly-the-manifested-hypotheses) already
    guarantees before judgeHypotheses is ever called.
- node: rules/investigation/one-evidence-per-collected-concept
  how: evidenceFor's removed throw defended against evidenceByHypothesis lacking an entry for a
    required hypothesis -- the exact condition this invariant's unconditional totality (the
    investigation holds exactly one evidence per concept in the case's collection plan) already rules
    out for a hypothesis that collects at least one concept. The removal trusts this invariant rather
    than re-verifying it at the judgment stage.
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: "This is the node whose exact statement (requires-evaluation-of lists exactly the manifest's own
    hypothesis names, and never the fallback) makes hypothesisNamed's throw genuinely unreachable, per
    this task's own Notes. hypothesisNamed now encodes trust in that fact directly in its body -- the
    non-null assertion on theCase.hypotheses.find(...) asserts, at the type level, that a name drawn
    from requiresEvaluationOf(theCase) always resolves in theCase.hypotheses -- no runtime re-check, no
    fallback, exactly the invariant this node states."
inferences:
- inferred: the correct way to delete the branch while keeping hypothesisNamed's and evidenceFor's return
    types non-optional is a compile-time-only non-null assertion on the .find()/.get() result, rather
    than any runtime guard or narrowing conditional.
  from: criterion 3's own requirement that the return types stay non-optional so a silent fallback
    cannot type-check in the throw's place, together with the objective's instruction to delete the
    branch entirely rather than replace it with a new default, a silent optional fallback, or a changed
    return type -- a bare assertion is the one construct that satisfies all three at once, since
    TypeScript cannot otherwise narrow Array.prototype.find's or ReadonlyMap.prototype.get's T |
    undefined result to T without either a runtime check or an assertion.
divergences:
- cites: TYP-02
  file: src/investigation/judgment-stage.ts
  departure: hypothesisNamed's non-null-asserted theCase.hypotheses.find((candidate) => candidate.name
    === name) is a type assertion with no accompanying runtime guard that narrows it.
  why: The guard TYP-02 asks for is exactly the if (hypothesis === undefined) { throw ... } branch this
    task's own criteria require deleted -- re-adding any runtime narrowing check in its place would
    reinstate the dead branch the task exists to remove. The assertion instead states, at the type level
    only, the invariant rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
    and domain/knowledge/case-version's manifest totality already guarantee; if that guarantee were ever
    violated by a bug elsewhere, the cost TYP-02 names (a wrong assertion surfacing at runtime rather
    than at the type level) would apply here.
- cites: TYP-02
  file: src/investigation/judgment-stage.ts
  departure: evidenceFor's non-null-asserted evidenceByHypothesis.get(name) is a type assertion with no
    accompanying runtime guard that narrows it.
  why: The same reasoning as hypothesisNamed's divergence above -- the guard would be the if (evidence
    === undefined) { throw ... } branch this task's criteria require deleted, and the assertion instead
    states the totality rules/investigation/one-evidence-per-collected-concept and
    domain/knowledge/case-version already guarantee, at the type level only.
preserved:
- judgeHypotheses' ordering, deadline handling, pool-concurrency limits, retry-on-invalid-citation
  policy, no-data short-circuiting, and usage/elapsed_ms/prompt passthrough for every hypothesis a
  well-formed case names.
- hypothesisNamed's and evidenceFor's non-optional return types (Hypothesis and readonly Evidence[]),
  unchanged from before this task.
- the rest of judgment-stage.ts (judgeOneHypothesis, runIsolatedCall, retryOrFail,
  acquireSlotOrDeadline, the deadline guard, CallPool, citation validation, and the Evaluation-building
  helpers), none of which this task touches.
deferred:
- what: src/__tests__/unit/investigation/judgment-stage.spec.ts holds two existing tests ("throws naming
    the missing hypothesis when evidenceByHypothesis carries no entry for a required hypothesis" and
    "throws naming the hypothesis when a required name is not found among the case's own hypotheses")
    that assert the exact throw behavior this task removes; as written they will now fail against the
    changed source.
  why: Writing or retiring tests is test authorship, a separate judgment from this implementation
    record, and this task's own scope is the two throws in judgment-stage.ts alone -- not the spec file
    that exercised them.
---

## What it is

The corrective removal of judgment-stage.ts's hypothesisNamed and evidenceFor throws for two
conditions the specification's own guarantees (the case manifest, per
rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses, and the collection
plan's totality) already make unreachable — deleted, never replaced with a new default or a silent
optional fallback.

## Notes

None.
