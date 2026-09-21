---
target: frontend
title: Hypothesis composition presents its form on a draft version that does not read
  back as a case — test proof
summary: Component-level tests over HypothesisRevisionScreen (New Hypothesis and Revise
  Hypothesis) proving the composition form is presented and a submit lands through
  the offered manifest route on a draft version refused for failing validation, that
  glossary/revisions failures and unmapped-code refusals keep the generic statement,
  that the case-keyed statement discloses no attribute of the version even from a
  stale shared-key cache (now guarded by the fixed versionData masking), and that
  the delivered screen does not itself place the composed hypothesis or leak a prior
  read's stale content — with the node requiring which read failed to be named and
  the node governing the server's own subject-type check left unproven, as neither
  is decidable by a frontend test.
implementation: sha256:b7705bcb625e3c4279baeaeb32fc5bb56f8b152b6b89c0576a985ebcb414523a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-hypothesis-composition-opens-for-a-version-that-does-not-read-back-suite-2
tests:
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — the composition form is presented, on both entry
    points, while the draft version's own read is refused (criterion 1, criterion
    3) › renders the hypothesis composition form for New Hypothesis and for Revise
    Hypothesis when GET .../versions/{version} is refused with CaseVersionNotValidError,
    rather than the read-did-not-complete statement
  proves: Criteria 1 and 3 — opening the New Hypothesis screen, and opening the Revise
    Hypothesis screen, for a case's draft version whose read is refused because a
    validator rule of validation-runs-at-every-read does not hold for it, each presents
    the hypothesis composition form on the same terms.
  fails_when: Either screen falls back to the read-did-not-complete statement, or
    to the loading placeholder, instead of rendering the composition form's Hypothesis-name
    field and Save control when the draft version's own read is refused with CaseVersionNotValidError.
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — composing and submitting a hypothesis while the
    draft version's own read is refused for failing validation lands it through the
    offered manifest route (criterion 2) › issues POST /v1/cases/{slug}/hypotheses
    built from the composed form's own content and offers the route to this same draft
    version's own manifest on success, with no successful read of the draft version
    having occurred first
  proves: Criterion 2, and rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case's
    fact that the surface presents the fields the composition is made of and offers
    a working act whose performance issues a revise-hypothesis, on this refused reading
    — satisfied here by the specification's own route-then-offer chain rather than
    the screen issuing place-hypothesis itself.
  fails_when: The composition form's fields cannot be filled, the submit is blocked
    or throws before a request is sent, the POST body does not reflect the form's
    own content, or the success phase does not offer and navigate to this same draft
    version's own manifest route.
  demonstrates: rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — a successful compose-and-submit on the refused
    reading leaves the placement into the manifest to the curator's own subsequent
    act (UNDERDETERMINED, from the specification, entry 1) › issues no PUT to this
    draft version's own manifest-placement endpoint on a successful revise-hypothesis
    submission; only the route to the manifest builder is offered, leaving where the
    entry lands to the curator's own choice made there
  proves: UNDERDETERMINED entry 1 — the delivered screen's submit issues only revise-hypothesis
    and then offers the manifest route; it never issues place-hypothesis itself, which
    is the implementation the entry names as one that would satisfy criterion 2 as
    written while the specification refuses it.
  fails_when: A successful revise-hypothesis submission on this screen also issues
    a PUT to the draft version's own manifest-placement endpoint automatically, choosing
    the entry's position itself.
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — the read-did-not-complete statement for a revisions
    read failure shows nothing a prior successful read of that same data left cached
    (UNDERDETERMINED, from the specification, entry 2) › renders only the fixed read-did-not-complete
    statement, never a hypothesis revision recovered from an earlier successful read
    still cached, once that same revisions read fails again
  proves: UNDERDETERMINED entry 2 — the delivered load-error phase renders only the
    fixed statement and a Retry control, never a revision a prior successful read
    of that same data left cached, which is the implementation the entry names as
    one that would satisfy criterion 4 as written while the specification's own fuller
    node refuses it.
  fails_when: The read-did-not-complete phase, on a revisions-read failure, renders
    a revision recovered from an earlier successful read of that same data still held
    in the query cache, beside the generic statement.
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — a failure reading the glossary, or reading the
    hypothesis's own revisions, still presents the read-did-not-complete statement,
    distinct from the case-version statement (criterion 4) › renders the read-did-not-complete
    statement, never the composition form or the case-version statement, when GET
    /v1/glossary/concepts fails while the draft version reads back cleanly
  proves: Criterion 4, glossary half.
  fails_when: The screen renders the composition form, or the case-version statement,
    when only the glossary read fails and the draft version's own read succeeds.
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — a failure reading the glossary, or reading the
    hypothesis's own revisions, still presents the read-did-not-complete statement,
    distinct from the case-version statement (criterion 4) › renders the read-did-not-complete
    statement, never the composition form or the case-version statement, when the
    hypothesis's own revisions read fails while the draft version reads back cleanly
  proves: Criterion 4, revisions half.
  fails_when: The screen renders the composition form, or the case-version statement,
    when only the hypothesis-revisions read fails and the draft version's own read
    succeeds.
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — a refusal of the draft version's own read carrying
    an error code the screen holds no presentation of its own for is presented exactly
    as a read that did not complete, disclosing nothing further (criterion 5) › renders
    the same read-did-not-complete statement an unrelated failed read renders, and
    discloses neither the refusal's own error code, its own message, nor any value
    it carries
  proves: Criterion 5, and rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete's
    fact.
  fails_when: The screen renders the case-version statement, discloses the refusal's
    own error code, its message, or any value it carries, or renders a statement distinguishable
    from the one a wholly-failed-to-complete read renders.
  demonstrates: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- file: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  name: HypothesisRevisionScreen — the case-keyed statement for the draft version's
    own refused read discloses no attribute of that version, not even one left over
    in the query cache from an earlier successful read on the same shared case-version
    query key › renders the explicit case-keyed statement and never the subject type
    a prior successful read of this same case-version query key left cached, once
    that same key's read is refused for failing validation
  proves: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case's
    fact, proved specifically over the case where the shared ["case-version", slug,
    version] query key already holds a prior successful read's own value in cache,
    which the fix's single versionData binding (forced to undefined whenever isVersionNotValid
    holds) now guards against. Also closes UNDERDETERMINED entry 3.
  fails_when: The screen says nothing at all about the draft version's own refusal,
    discloses the subject type recovered from a stale case-version cache entry left
    by an earlier successful read on the same shared key, or renders the same statement
    it renders for a read that did not complete.
  demonstrates: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
not_applicable:
- edge_case: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case's
    distinctness clause against "a case that currently holds no version"
  why: This screen's route always carries a specific numeric version segment and reads
    that one version directly rather than the case's own summary; a read answering
    "the case currently holds no version at all" is not a state this version-keyed
    GET can produce.
- edge_case: Which specific validator rule of validation-runs-at-every-read produced
    the CaseVersionNotValidError
  why: The hook and screen key every branch on the error code alone; no code path
    inspects which rule produced it. Per the task's own advisory, criterion 2's landing
    is not demonstrated over the subject-type-failing rule specifically — demonstrated
    over the general/empty-manifest case instead.
- edge_case: Client-side validation pre-checks and the double-submit guard on this
    same screen
  why: This task's own criteria and nodes do not touch that behavior, it is unchanged
    by this task's files, and it already has its own tests elsewhere.
untested:
- rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  — its fact requires naming which read failed and holding the two apart from one
  another; the delivered implementation folds both into one undifferentiated statement,
  matching the task's own disclosed UNDERDETERMINED entry 2. No finite test decides
  this fuller fact whole against this implementation; only the narrower criterion-4
  slice is tested.
- rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  — its fact is a server-side one; entirely outside this frontend-only task's file
  set and outside what a mocked-fetch test can decide.
---

## What it is
The proof for the hypothesis-composition task: hypothesis-revision-screen-case-not-valid.spec.ts covers the composition form's presence and a working submit on the refused reading, the glossary/revisions failure paths, the unmapped-refusal fallback, and the case-keyed statement's no-attribute-disclosed guarantee, including against a stale shared-query-key cache. A minimal test-support extension (an optional pre-seeded QueryClient parameter on mountHypothesisForm) was needed to observe the stale-cache scenario.

## Notes
A failure-diagnostician found, on the first suite run, that a stale successful read left in the shared query cache leaked its subject type onto the refused reading; the implementation was fixed (a single versionData binding forced to undefined whenever the version is not valid) and this proof's test for that scenario now passes with no outstanding disagreement.
