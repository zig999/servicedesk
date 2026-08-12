---
title: Resolve-outcome and collection-plan read precedence from position
summary: case-resolution.ts's collectionPlan and resolveOutcome now order theCase.hypotheses by each one's
  own declared position rather than by the array's own arrangement, leaving requiresEvaluationOf and every
  downstream caller untouched.
task: sha256:bc8b0cec76add976ed02adede94a31b66099afc5e362dc78ee95e725e31c7a2e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-precedence-from-position-build
files:
- path: src/case/case-resolution.ts
  effect: adds a private byPrecedence(theCase) helper that returns theCase.hypotheses sorted ascending
    by each one's own position field; collectionPlan now flatMaps over byPrecedence(theCase) instead of
    theCase.hypotheses in its own array order, and resolveOutcome's determining lookup is now byPrecedence(theCase).find(...)
    instead of theCase.hypotheses.find(...) — so both answers are invariant to the hypotheses array's
    own arrival order and depend only on each hypothesis's declared position; requiresEvaluationOf is
    untouched
- path: src/case/case.ts
  effect: no runtime behavior changes — Hypothesis.position's own comment, the Case type's own header
    comment and its hypotheses field's own comment are reworded to state that collection-plan and resolve-outcome
    read position rather than array order, replacing a comment that forward-referenced this task by path
- path: src/case/parse-case-document.ts
  effect: no runtime behavior changes — heldCase's own doc comment no longer claims the document's own
    array order is the precedence resolve-outcome consumes, and instead states that collection-plan and
    resolve-outcome now read each hypothesis's own declared position instead
criteria:
- criterion: Resolve-outcome and collection-plan consult each hypothesis's declared position, and the
    order in which the hypotheses arrive changes neither answer.
  met: true
  how: both functions now derive their working order from byPrecedence(theCase), which sorts a copy of
    theCase.hypotheses ascending by each one's own position; neither function reads theCase.hypotheses's
    own array order anymore
- criterion: Of two confirmed hypotheses, the one standing earlier in the precedence the positions declare
    is the one whose resolution resolve-outcome answers with.
  met: true
  how: resolveOutcome's determining lookup is byPrecedence(theCase).find(hypothesis => verdicts[hypothesis.name]
    === CONFIRMED); find answers the first match, and byPrecedence has already sorted ascending by position,
    so the lower-position confirmed hypothesis is found first
- criterion: Given a case declaring regional-incident, order-in-progress, financial-block and onu-offline
    in that precedence, with regional-incident and onu-offline confirmed and the other two refuted, resolve-outcome
    answers with regional-incident's outcome and referral and names regional-incident as the determining
    hypothesis.
  met: true
  how: with regional-incident at the lowest declared position, byPrecedence places it first regardless
    of the array's own placement, so the confirmed-verdict search reaches it before onu-offline
- criterion: In that same resolution onu-offline keeps its confirmed verdict and is marked in no way.
  met: true
  how: resolveOutcome only reads the given verdicts record and never writes to it; the returned ResolvedOutcome
    names only the determining hypothesis
- criterion: When every hypothesis was refuted or inconclusive, resolve-outcome answers with the fallback's
    outcome and referral.
  met: true
  how: byPrecedence(theCase).find(...) finds nothing confirmed, so determining is undefined and resolveOutcome
    takes the same fallback branch as before this task
- criterion: In that same resolution no determining hypothesis is named.
  met: true
  how: the fallback branch's returned object literal declares no determining key at all — this branch's
    shape is unchanged by this task
- criterion: The collection plan is the deduplicated union of every hypothesis's collected concepts.
  met: true
  how: collectionPlan still builds one Set over every hypothesis's own collects and spreads it back into
    an array — now traversing byPrecedence(theCase)'s position-ascending order rather than the array's
    own order
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/case/case.ts
  - src/case/case-resolution.ts
  how: the case's own responsibility that resolve-outcome gives the first confirmed hypothesis in declared
    order its outcome, referral and determining role is realized by case-resolution.ts's resolveOutcome
    and collectionPlan, both now reading declared order as each hypothesis's own position rather than
    array arrangement
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/case.ts
  - src/case/case-resolution.ts
  how: 'the node''s own description — placed at one position in its case''s precedence — is now literally
    what resolveOutcome and collectionPlan read: byPrecedence(theCase) reads hypothesis.position on every
    hypothesis, never the array''s own index'
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  encoded_at:
  - src/case/case-resolution.ts
  how: 'the rule''s own statement that the declared order is each hypothesis''s own position, declared
    rather than arranged, is exactly what byPrecedence(theCase) computes: an ascending sort by position,
    consulted by both operations instead of array arrangement'
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  encoded_at:
  - src/case/case-resolution.ts
  how: 'resolveOutcome answers the scenario''s own given/when/then directly: given the four hypotheses''
    own declared positions and the stated verdicts, byPrecedence(theCase).find(...) settles on regional-incident,
    the earliest confirmed'
- node: scenarios/knowledge/no-confirmation-falls-back
  encoded_at:
  - src/case/case-resolution.ts
  how: given every hypothesis refuted or inconclusive, byPrecedence(theCase).find(...) finds nothing confirmed,
    so resolveOutcome answers with theCase.fallback's own outcome and referral, unchanged by this task
inferences:
- inferred: collectionPlan's own returned array is ordered by ascending declared position rather than
    by the hypotheses array's own arrival order, so criterion 1's arrival-order invariance holds for collection-plan
    exactly as it holds for resolve-outcome
  from: criterion 1 names resolve-outcome and collection-plan together as both consulting declared position;
    the pre-existing implementation and its already-delivered proof already treated first-occurrence-in-declared-order
    as part of the function's answer, so the same convention was kept, now reading declared order as position
    rather than array order
- inferred: case.ts's own comments and parse-case-document.ts's own comment were reworded to state that
    collection-plan and resolve-outcome read position rather than array order, even though the task's
    own Notes name case-resolution.ts alone as the one place the operations read precedence
  from: case.ts's own Hypothesis.position comment explicitly forward-referenced this task by path, and
    parse-case-document.ts's heldCase comment made the same now-superseded claim; leaving either unchanged
    would have left a false description in the two files (besides case-resolution.ts itself) that state
    the aggregate's own shape
preserved:
- 'requiresEvaluationOf''s own behavior: it keeps reading theCase.hypotheses''s own declared array order
  for the names it answers with, never the position field, since which hypotheses it answers with is a
  fact no specification node states.'
- 'parse-case-document.ts''s actual parsing and holding of a case: hypotheses stay in the document''s
  own declared array order in the parsed aggregate, never reordered — only its own doc comment changed.'
- Every existing caller of collectionPlan, requiresEvaluationOf and resolveOutcome keeps calling the same
  three exported functions with the same signatures; none needed a code change.
- The two knowledge scenarios this task implements continue to hold for a case whose hypotheses' array
  order already matches their own declared position order, including the one curated fixture, whose two
  hypotheses' positions already match their array placement.
deferred:
- what: src/__tests__/unit/case/case-resolution.spec.ts's own test "follows the declared order alone,
    so reversing the declaration flips which confirmed hypothesis determines" pins the pre-task behavior
    this task's own criterion 1 explicitly supersedes.
  why: writing what proves a task's criteria is the test-author's own pass, in its own context, never
    this implementation's — no test file was edited or read for anything beyond locating this task's consumers
---

## What it is

The case's own precedence, read from each hypothesis's own declared position rather than from
where it happens to sit in an array — the arrangement the specification names, not the arrangement
a document's own listing gives it for free.

## Notes

case-resolution.spec.ts's own pre-existing test proving the old array-order behavior is now false —
this task's own criterion 1 explicitly supersedes it — and updating it is the test-author's own pass.
