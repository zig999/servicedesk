---
contract_version: siegard-reconcile/5
title: 'Corrective fixes: case-version-state token leak and release violation aggregation'
summary: 'Two corrective increments under the operator-error-messages-ptbr-case-hypothesis-backend initiative,
  surfaced by that initiative''s own /review-change: three refusal classes now translate the case-version
  lifecycle state before interpolating it into their message, and release.operation.ts now merges manifest-own-state
  violations into a structurally-invalid release refusal instead of dropping them.'
target: backend
files:
- path: src/__tests__/integration/case/release.operation.spec.ts
  change: One pre-existing test's fixture changed from placeNewHypothesis to placeReleasedHypothesis to
    isolate it to its original structural-only intent, now that manifest-own-state violations are also
    correctly computed; also switched to import requireDatabaseUrl/deleteTolerantly from a new shared
    database-test-helpers.js module instead of declaring its own copies.
- path: src/__tests__/unit/case/release.operation.spec.ts
  change: A new test added proving a release attempt failing both a structural rule and the manifest-own-state
    rule is refused once, naming both violations together.
- path: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  change: The pre-existing ordering test's fixture state and assertion updated the same way.
- path: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  change: The assertion pinning the raw lifecycle token as correct is replaced with an assertion for the
    translated word; the pre-existing ordering test's fixture state and assertion are updated to use a
    real state value and check against the translated word.
- path: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  change: The pre-existing ordering test's fixture state and assertion updated the same way.
- path: src/case/release.operation.ts
  change: releaseViolations's structurally-invalid branch now also computes manifestOwnStateViolations
    and merges it with the structural problems, instead of returning the structural problems alone.
- path: src/errors/case-version-not-draft-at-release.error.ts
  change: Same fix as case-version-not-draft.error.ts.
- path: src/errors/case-version-not-draft.error.ts
  change: The super() template literal now translates the interpolated lifecycle state to 'rascunho'/'liberada'
    via a ternary, instead of interpolating the raw internal token.
- path: src/errors/case-version-not-released.error.ts
  change: Same fix as case-version-not-draft.error.ts.
nodes:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  conforms: false
  how: 'src/__tests__/integration/case/release.operation.spec.ts, same context.violations entries, lines
    232-233 and 443-444: `the concept "${vocabulary.concept}" does not accept the subject type "${vocabulary.subjectType}"
    the case declares`, — Names concept/case in English rather than the fixed conceito/caso, inconsistent
    with the Portuguese hipótese/caso entry beside it in the same array.

    src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts, the second it block, the
    two matchers checking for ''liberação'' and ''gatilho'': expect(error.message).toMatch(/libera[çc][ãa]o/i);

    expect(error.message).toMatch(/gatilho/i); — The vocabulary constraint fixes nine nouns and leaves
    the connecting sentence free to reword; ''gatilho''/''liberação'' are not among the fixed nouns, and
    this test pins that free wording as if the specification had fixed it.

    src/__tests__/unit/errors/case-version-not-draft.error.spec.ts, lines 6-13, the first test: ''names
    the case and its version before it states the state that refuses the act'': const slug = ''a-slug-naming-the-case'';

    const state = ''draft'';

    const error = new CaseVersionNotDraftError(slug, 3, state);

    expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(''rascunho'')); — Locks the
    message''s word order into the suite as if it were specification-fixed, but the governing node says
    wording around the fixed vocabulary ''stays free to be written and rewritten for clarity''. A future
    reordering breaks this test though nothing in the spec changed.

    src/__tests__/unit/errors/case-version-not-released.error.spec.ts, the first it block (lines 4-11),
    ''names the case and its version before it states the state that refuses the act'': expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(''rascunho''));
    — Freezes an ordering the specification explicitly leaves open. A future reword that puts the state
    before the slug fails this test though nothing the constraint fixes changed.'
  observed_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  conforms: false
  how: 'src/__tests__/integration/case/release.operation.spec.ts, context.violations array asserted at
    lines 232-233, repeated at 443-444: `the concept "${vocabulary.concept}" does not accept the subject
    type "${vocabulary.subjectType}" the case declares`,

    `no read-only capability currently answers the concept "${vocabulary.concept}"`, — In the same array
    as the Portuguese manifest-state violation, these two coherence strings are in English -- one refusal''s
    message reaching an operator in two languages at once.'
  observed_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/case/release.operation.ts: held at release()''s final call, delegating persistence to caseStore
    — release()''s final call, delegating persistence to caseStore'
  encoded_at:
  - src/case/release.operation.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/case/release.operation.ts: held at ReleaseOperation.release, the operation''s public surface
    — ReleaseOperation.release, the operation''s public surface'
  encoded_at:
  - src/case/release.operation.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'src/case/release.operation.ts: held at release()''s gating of the store write on violations.length
    — release()''s gating of the store write on violations.length'
  encoded_at:
  - src/case/release.operation.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/errors/case-version-not-draft-at-release.error.ts: held at the slug parameter and its assignment
    into context — the slug parameter and its assignment into context

    src/errors/case-version-not-draft.error.ts: held at the slug carried through the constructor parameter
    and stored on context — this.context = { slug, version, state };

    src/errors/case-version-not-released.error.ts: held at the slug parameter and its interpolation into
    the message — the slug parameter and its interpolation into the message'
  encoded_at:
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/case/release.operation.ts: held at assembledAsDocument, restating the version''s own attributes
    — assembledAsDocument, restating the version''s own attributes

    src/errors/case-version-not-draft-at-release.error.ts: held at the version and state parameters and
    their assignment into context — the version and state parameters and their assignment into context

    src/errors/case-version-not-draft.error.ts: held at the version and state fields carried alongside
    slug — public readonly context: Readonly<{ slug: string; version: number; state: string }>;

    src/errors/case-version-not-released.error.ts: held at the version and state parameters and the context
    property — the version and state parameters and the context property'
  encoded_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/case/release.operation.ts: held at assembledAsDocument''s manifest mapping and manifestOwnStateViolations''
    iteration — assembledAsDocument''s manifest mapping and manifestOwnStateViolations'' iteration'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  conforms: true
  how: 'src/errors/case-version-not-released.error.ts: held at the error class itself and the message''s
    closing clause — the error class itself and the message''s closing clause'
  encoded_at:
  - src/errors/case-version-not-released.error.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: 'src/errors/case-version-not-draft.error.ts: held at the class itself, per candidate index binding
    — export class CaseVersionNotDraftError extends Error {'
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: 'src/errors/case-version-not-draft-at-release.error.ts, line 6, the message template literal inside
    the constructor: e a liberação é o único gatilho que move uma versão para fora do rascunho — The ''release
    is the only trigger out of draft'' fact now lives both in the lifecycle node and hardcoded as prose
    in this refusal''s message; nothing ties the two, so a lifecycle change would leave this string stale.'
  observed_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: 'src/case/release.operation.ts: held at the guard in release() -- never throws with an empty violations
    array — the guard in release() -- never throws with an empty violations array'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/case/release.operation.ts: held at manifestOwnStateViolations, merged into releaseViolations
    on both branches — manifestOwnStateViolations, merged into releaseViolations on both branches'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/release.operation.ts read `nowhere` — no reference
    to this node''s fact appears in the file'
  observed_at:
  - src/case/release.operation.ts
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: 'src/errors/case-version-not-draft.error.ts: held at the same class, reused per candidate index
    binding — export class CaseVersionNotDraftError extends Error {'
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/release.operation.ts: held at releaseViolations passing sources.capabilities through
    fresh on every call — releaseViolations passing sources.capabilities through fresh on every call'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'src/case/release.operation.ts: held at releaseViolations, running structural then coherence checking
    on every attempt — releaseViolations, running structural then coherence checking on every attempt'
  encoded_at:
  - src/case/release.operation.ts
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  conforms: true
  how: 'src/errors/case-version-not-released.error.ts: held at the same closing clause naming the version
    as not released — the same closing clause naming the version as not released'
  encoded_at:
  - src/errors/case-version-not-released.error.ts
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/case/release.operation.ts: held at manifestOwnStateViolations naming every non-released entry,
    merged into the throw — manifestOwnStateViolations naming every non-released entry, merged into the
    throw'
  encoded_at:
  - src/case/release.operation.ts
unstated:
- file: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  where: the it block (lines 37-41), 'holds exactly the slug, version and state it was constructed with,
    in its context'
  evidence: 'expect(error.context).toEqual({ slug: ''a-slug'', version: 7, state: ''draft'' });'
  cost: Fixes what CaseVersionNotReleasedError's context discloses as a test-enforced fact; the decision
    log closes this question for CaseVersionNotDraftAtReleaseError but not for this class.
unbound:
- src/__tests__/integration/case/release.operation.spec.ts
- src/__tests__/unit/case/release.operation.spec.ts
- src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
- src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
- src/__tests__/unit/errors/case-version-not-released.error.spec.ts
notes: 'Judged by 9 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/corrective-fixes-review.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word,
  constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese, rules/knowledge/a-case-version-moves-through-its-declared-lifecycle,
  rules/investigation/only-a-released-case-version-is-diagnosed, contracts/knowledge/case-lifecycle, rules/knowledge/a-release-refusal-with-no-named-violation-says-so,
  rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions were read on every
  file and answered for, and bound from nowhere here — a binding this record writes is one the trace already
  held.

  Candidates: 0 opened across 0 of 9 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/corrective-fixes-review.returns/`, which are the evidence behind every entry above.
