---
implementation: sha256:e273cfe873463109a44f642d44eb55f6f943c01d674dd574d7321fe6a1adfc2d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/judgment-stage-dead-throws-removal-hotfix-remove-the-two-unreachable-throws-suite
title: Judgment-stage dead-throw removal — proof
summary: Proves that hypothesisNamed's and evidenceFor's throw branches are gone, their return
  types stay non-optional with no reintroduced fallback, and judgeHypotheses' behavior over a
  well-formed case is otherwise unchanged, by retiring the two tests that asserted the removed
  throws and adding source-structure and behavioral tests in their place.
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: hypothesisNamed's declared return type stays the non-optional Hypothesis, never Hypothesis |
    undefined, so a silent fallback cannot type-check for a name absent from the case's hypotheses
  proves: criterion 3 (hypothesisNamed's return type stays non-optional), for hypothesisNamed
  fails_when: hypothesisNamed's declared return type is widened to Hypothesis | undefined (or anything
    other than the literal Hypothesis) -- the positive match against the exact current signature fails,
    and/or the negative match against the widened signature succeeds.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: evidenceFor's declared return type stays the non-optional readonly Evidence[], never readonly
    Evidence[] | undefined, so a silent fallback cannot type-check for a hypothesis absent from
    evidenceByHypothesis
  proves: criterion 3, for evidenceFor
  fails_when: evidenceFor's declared return type is widened to readonly Evidence[] | undefined (or
    anything other than the literal readonly Evidence[]).
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: hypothesisNamed's body no longer contains a throw for a name absent from the case's own
    hypotheses
  proves: criterion 1 (hypothesisNamed no longer throws for that condition)
  fails_when: any throw statement is reintroduced inside hypothesisNamed's body.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: evidenceFor's body no longer contains a throw for a required hypothesis absent from
    evidenceByHypothesis
  proves: criterion 2 (evidenceFor no longer throws for that condition)
  fails_when: any throw statement is reintroduced inside evidenceFor's body.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: hypothesisNamed introduces no fallback or default value in the removed throw's place
  proves: criterion 4 (no synthesized-hypothesis fallback replaces the deleted branch), for
    hypothesisNamed
  fails_when: hypothesisNamed's body gains a ?? or || fallback (e.g. a synthesized default Hypothesis)
    in place of the removed throw.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: evidenceFor introduces no fallback or default value in the removed throw's place
  proves: criterion 4, for evidenceFor
  fails_when: evidenceFor's body gains a ?? or || fallback (e.g. ?? []) in place of the removed throw.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: no longer rejects naming the missing hypothesis when a required name is not found among the
    case's own hypotheses — only the unguarded property access fails, with no message naming it
  proves: criterion 1, observed through judgeHypotheses' actual rejection -- the specific
    named-hypothesis Error the old throw produced is gone, replaced by nothing but the unguarded
    non-null assertion letting a native property-access TypeError surface instead
  fails_when: the rejection is not a TypeError (e.g. the old custom Error, naming "h1", is still
    raised by a reinstated guard), or the rejection message matches /h1/.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: no longer rejects naming the missing hypothesis when evidenceByHypothesis carries no entry
    for a required hypothesis — only the unguarded property access fails, with no message naming it
  proves: criterion 2, observed through judgeHypotheses' actual rejection, the same way as the
    hypothesisNamed case above
  fails_when: the rejection is not a TypeError, or the rejection message matches /h1/.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: the file's ~24 pre-existing tests over well-formed cases (ordering, pool concurrency,
    deadlines, retries, citation validation, no-data evidence, usage/elapsed_ms/prompt passthrough) --
    unmodified, no new test written
  proves: criterion 5 (judgeHypotheses' observable behavior over a well-formed case is unchanged) --
    this task touches only the two deleted throw branches, which none of these tests exercises, so
    their continuing to pass is the proof
  fails_when: any of these pre-existing tests fails against the changed source.
untested:
- "whether the pre-existing ~24 tests named above actually still pass against the changed source is
  proven by this delivery's own suite run rather than by a new assertion -- the tests themselves are
  unmodified and structurally never reach hypothesisNamed's or evidenceFor's deleted branches (every
  fixture they use names a hypothesis present in both the case's manifest and its hypotheses array, and
  evidenceByHypothesis always carries an entry for every required name), so nothing in this task's diff
  can make them newly fail, and the suite run captured under this record's own run is the direct
  evidence that they did not."
not_applicable:
- edge_case: duplicate hypothesis names within one case
  why: the task's own Notes record this out of scope -- criterion 1 requires only that a name resolve
    to a hypothesis in the manifest, not that it resolve to exactly one, and
    rules/knowledge/a-hypothesis-name-is-unique-within-its-case (consistency eventual) is explicitly
    not depended on or claimed by this task.
- edge_case: a required hypothesis that collects zero concepts
  why: the task's own Notes record this out of scope -- criterion 2's "always holds an entry" proviso
    rests on rules/knowledge/a-hypothesis-collects-at-least-one-concept, which this task does not
    implement and whose refusal clause belongs to hypothesis-revision authoring, not this removal.
- edge_case: a collection timeout degrading evidence to no-data
  why: the task's own Notes record scenarios/investigation/a-collection-timeout-degrades-to-no-data as
    outside this epic's covers; this task's evidence-totality premise rests on the unconditional
    one-evidence-per-collected-concept invariant alone, unaffected by this removal.
- edge_case: a dependency (the evaluator) failing, answering slowly, or in an unexpected shape
  why: unchanged by this removal -- judgeOneHypothesis, runIsolatedCall, retryOrFail and the
    deadline/pool machinery are untouched, and the pre-existing tests already exercise
    deadline-exceeded and citation-retry paths; this task introduces no new such path.
- edge_case: two operations against one subject at once (pool concurrency)
  why: unchanged by this removal -- CallPool and acquireSlotOrDeadline are untouched, and the
    pre-existing pool-concurrency tests already cover this; this task introduces no new concurrency
    behavior.
- edge_case: a boundary at each end of a numeric range
  why: this task introduces no numeric range, limit or count for a boundary to apply to.
- edge_case: absent or empty required-hypotheses list
  why: this task changes no behavior over the required-names list itself (requiresEvaluationOf is
    untouched); an empty list is unaffected by the removed branches and raises no new question this
    task's criteria pose.
---

## What it is

The proof for the judgment-stage dead-throw removal: hypothesisNamed's and evidenceFor's throw
branches are gone, replaced by nothing but a compile-time non-null assertion, with
judgeHypotheses' behavior over a well-formed case unchanged.

## Notes

Two pre-existing tests asserting the removed throw behavior directly ("throws naming the missing
hypothesis when evidenceByHypothesis carries no entry for a required hypothesis" and "throws
naming the hypothesis when a required name is not found among the case's own hypotheses") were
retired, since the behavior they asserted is dead code this task deliberately deletes and there is
no corrected behavior to assert in their place. hypothesisNamed and evidenceFor are private,
non-exported functions, so criteria 1-4 are proven via the file's own existing moduleSource()
source-structure convention plus two behavioral tests observing judgeHypotheses' actual rejection
shape, rather than by calling the helpers directly.
