---
title: Proof for drafting the assessment's text from the narrowed input
summary: Tests that draftAssessment copies resolved's outcome/referral/determining verbatim, sets determining_hypothesis present exactly when a hypothesis confirmed and structurally absent when the fallback answered, can statically reach neither Case nor Hypothesis nor any framework/driver/provider client, and drafts non-empty, input-driven, synchronous text across the confirmed and fallback branches.
implementation: sha256:6084080c0107410f2a689d0757556bd020421bd65ecb6a56286c03df755fc6e9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-drafting-draft-assessment-text-suite
tests:
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: copies outcome, referral and determining hypothesis from the resolved outcome, unchanged
  proves: The assessment's outcome, referral and determining hypothesis equal exactly the resolved values it was given, unchanged by drafting.
  fails_when: draftAssessment recomputes, reshapes, defaults or drops resolved's own outcome, referral or determining value instead of copying it through unchanged.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: carries the determining hypothesis exactly as resolved named it, when one confirmed
  proves: The assessment's determining hypothesis is present exactly when a hypothesis confirmed, and absent exactly when the fallback answered (the presence half).
  fails_when: draftAssessment omits determining_hypothesis, or sets it to anything other than resolved.determining, when a hypothesis confirmed.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: carries no determining_hypothesis field at all, not even present with an undefined value, when the fallback answered
  proves: The assessment's determining hypothesis is present exactly when a hypothesis confirmed, and absent exactly when the fallback answered (the absence half).
  fails_when: draftAssessment sets determining_hypothesis to a value, or leaves it present with the value undefined, when the fallback answered instead of leaving the key structurally absent.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: drafts text rather than throwing or producing an empty fragment when the confirmed evidence array is empty
  proves: 'the inference the implementation recorded: an empty evidence array drafts as the literal NO_EVIDENCE_LABEL rather than an empty sentence fragment'
  fails_when: an empty confirmed evidence array throws, or the drafted text carries an empty or malformed fragment instead of a deterministic label.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: drafts text rather than throwing or producing an empty fragment when the fallback evaluations array is empty
  proves: 'the inference the implementation recorded: an empty evaluations array drafts as the literal NO_EVALUATIONS_LABEL rather than an empty sentence fragment'
  fails_when: an empty fallback evaluations array throws, or the drafted text carries an empty or malformed fragment instead of a deterministic label.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: drafts observably different text for a confirmed-path call than for a fallback-path call, so drafting reads the narrowed input rather than producing one fixed body regardless of it
  proves: the confirmed-path and fallback-path branches are observably distinct rather than collapsing into one static body
  fails_when: draftAssessment produces identical text for a confirmed-path call and a fallback-path call, showing narrowedInput.basis was never actually read.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: drafts different text for two calls sharing the very same narrowed input but different resolved outcomes, reflecting resolved's own outcome and referral rather than answering with a text fixed in advance
  proves: drafted text draws only from the given inputs, the same fact criterion 4's own how states, draftAssessment's output depends only on its two arguments
  fails_when: two calls sharing one narrowedInput but differing resolved outcome/referral produce identical text, or text produced does not contain the given outcome value.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: answers synchronously with the result itself, never a Promise, so nothing here could be awaiting a database driver or a provider client
  proves: Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input (the synchronous half).
  fails_when: draftAssessment is declared async or otherwise returns a Promise instead of the Assessment itself.
- file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
  name: assessment.ts and draft-assessment-text.ts import no framework, driver or provider client
  proves: Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input (the forbidden-package half).
  fails_when: either file gains an import specifier naming a framework, database driver, ORM, cache/queue/store client or LLM/provider SDK.
- file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
  name: assessment.ts and draft-assessment-text.ts import nothing from the standard library, so infrastructure cannot be reached from them directly
  proves: Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input (the no-standard-library half); also constraints/the-domain-depends-on-no-infrastructure.
  fails_when: either file gains an import specifier naming a Node built-in module, which would give this pure module a reachable path to I/O.
- file: src/__tests__/unit/investigation/draft-assessment-text-modules.spec.ts
  name: draft-assessment-text.ts imports nothing at all from the case document module, so no field there could carry a hypothesis's own criterion or the case's when_to_use into drafting
  proves: Drafting receives only the narrowed input a prior step assembled, never the case's own hypotheses or criteria.
  fails_when: draft-assessment-text.ts gains an import specifier ending in case/case.js, opening a channel through which a hypothesis's criterion or the case's when_to_use could reach drafting.
not_applicable:
- edge_case: two operations calling draftAssessment at once
  why: draftAssessment is a pure, synchronous, side-effect-free function of its two given arguments with no shared mutable state; concurrent calls are simply independent invocations.
- edge_case: a dependency that fails or answers slowly
  why: draftAssessment has no dependency of its own, the modules audit proves it reaches no I/O, driver or provider client, so there is nothing here that could fail or answer slowly.
- edge_case: a duplicate where uniqueness is claimed
  why: neither Assessment nor NarrowedInput declares any field this task's criteria claim must be unique, so there is nothing to duplicate.
- edge_case: an operation attempted against state that forbids it
  why: draftAssessment holds no state of its own to forbid an operation against; it is a pure computation over its two given arguments, with no prior state to consult.
- edge_case: an absent or undefined resolved or narrowedInput argument
  why: both parameters are required by draftAssessment's own type signature, enforced at every real call site; no bound node states behavior for a call that violates that signature.
- edge_case: a boundary at each end of a stated numeric range
  why: none of Assessment's or NarrowedInput's own fields declare a numeric range for drafting to bound against.
untested:
- Whether draftAssessment defensively copies or merely aliases the evidence/evaluations arrays and the referral object it is given, no criterion states an aliasing-versus-copying guarantee, and these tests observe only the produced text and the copied top-level fields, never whether the underlying collections remain mutable through a shared reference.
- The exact wording of draftText beyond the specific substrings asserted here, the task's own rationale states the wording is an open implementation choice, so only the specific inferred behaviors (empty-collection labels, no channel to the case document) are pinned.
---

## What it is

Unit tests proving the drafting step's four criteria across the confirmed and fallback bodies, the structural exclusion of the case module, and the empty-collection edge cases.

## Notes

None.
