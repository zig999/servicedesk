---
target: backend
title: PT-br messages for the two refusals a hypothesis revision's own state raises
summary: HypothesisRevisionNotDraftAtReleaseError's and ReleasedHypothesisRevisionNotAlterableError's
  messages rewritten in PT-br, with every test in src/src/__tests__ that pinned either message's literal
  English text -- including one outside the risk inventory's original survey -- updated in the same change.
task: sha256:fe2e6f66ca5767aaa4679516cb1e6ff2fd1ea7bc4345db47450f996f87ed9b33
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-hypothesis-revision-state-messages-build
files:
- path: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  effect: The fixed, argument-less constructor's super() call now carries a PT-br sentence stating the
    revision is not in draft and release is the sole trigger out of draft; name and the absence of context
    are unchanged.
- path: src/errors/released-hypothesis-revision-not-alterable.error.ts
  effect: The super() template literal attributes the immutability to the revision's own released state
    rather than a referencing case version's release; name and context are unchanged.
- path: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  effect: FIXED_MESSAGE updated character for character to the new PT-br sentence.
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  effect: The envelope expected for a HypothesisRevisionNotDraftAtReleaseError instance updated to the
    new PT-br message text.
criteria:
- criterion: HypothesisRevisionNotDraftAtReleaseError's message is in PT-br and states that the hypothesis
    revision is not in draft and that release only ever moves a revision out of draft.
  met: true
  how: The new message states both facts in Portuguese, mirroring the English original's two clauses.
- criterion: HypothesisRevisionNotDraftAtReleaseError's message names no hypothesis, no revision number
    and no case, because the class receives none and carries no context.
  met: true
  how: The constructor still takes no argument and the message names only the revision's own state and
    the trigger.
- criterion: ReleasedHypothesisRevisionNotAlterableError's message is in PT-br, names the hypothesis,
    the revision number and the case slug, and states that the revision is itself in released state and
    that a released revision is never altered — never attributing the immutability to a case version referencing
    it.
  met: true
  how: The new message interpolates revision, hypothesisName and slug, and states the revision is itself
    in released state, dropping the referencing-case-version framing.
- criterion: The FIXED_MESSAGE constant in src/src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
    holds the new PT-br text character for character, and that spec passes.
  met: true
  how: FIXED_MESSAGE was replaced with the exact new super() argument string; both assertions in that
    spec pass against the new text.
- criterion: The two messages are distinguishable from one another by their text alone, so an operator
    reading one can tell a release refused from an alteration refused.
  met: true
  how: The two messages share no sentence structure or clause.
- criterion: Every interpolated value in each PT-br message also appeared in that class's English message,
    and no message states a fact its English original did not state, except that ReleasedHypothesisRevisionNotAlterableError's
    message states the revision's own released state as the ground of its immutability instead of the
    English original's referencing-case-version framing — a deliberate correction, not a new fact.
  met: true
  how: HypothesisRevisionNotDraftAtReleaseError interpolates nothing, as before; ReleasedHypothesisRevisionNotAlterableError
    interpolates exactly revision, hypothesisName and slug, with the one stated, deliberate correction.
- criterion: ReleasedHypothesisRevisionNotAlterableError's refusal is scoped, as the specification states,
    to an attempt to alter the revision's criterion, resolution or state; its message does not generalize
    to every alteration, including a removal of one of the revision's collects, which is accepted with
    no effect rather than refused.
  met: true
  how: Only the message string changed; the raising site and the Postgres-trigger-backed collects-removal
    exception are untouched.
- criterion: Each message uses "caso" for a case, "hipótese" for a hypothesis, "revisão" for a hypothesis
    revision, "rascunho" for the draft state and "liberada" for the released state, and uses no English
    domain noun.
  met: true
  how: The fixed words are used throughout; the derived verb liberação is built on the fixed liberada
    root, since the constraint pins the noun/state words and leaves phrasing free.
- criterion: Each of the two classes' name property still holds its unchanged class-name string.
  met: true
  how: Both this.name assignments are untouched.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP
    status it mapped to before.
  met: true
  how: status-map.ts was read to confirm both classes still map to 409, and was not opened for edit.
- criterion: ReleasedHypothesisRevisionNotAlterableError's context property holds exactly the properties
    and values it held before, with no value moved into or out of it.
  met: true
  how: The context assignment line is untouched; only the preceding super() call's string changed.
- criterion: HypothesisRevisionNotDraftAtReleaseError still takes no constructor argument and still declares
    no context property.
  met: true
  how: The constructor signature is untouched and no context field was added.
- criterion: The suite under src/src/__tests__ passes, with every test asserting either class's literal
    English text updated to assert the new PT-br text instead — including hypothesis-revision-not-draft-at-release.error.spec.ts's
    FIXED_MESSAGE constant — and no other change to any test file.
  met: true
  how: A whole-tree search found a second test pinning the literal text (error-handler.middleware.spec.ts),
    updated in the same change; the captured build's test-unit step passed.
nodes:
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  - src/__tests__/unit/http/error-handler.middleware.spec.ts
  how: The PT-br message states the revision is not in draft and release is the sole trigger, without
    naming which trigger raised it, matching the task's UNDERDETERMINED note.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  encoded_at:
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: The PT-br message states the revision is itself in released state and never altered, correcting
    the English original's misattribution.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: Both messages speak of the hypothesis-revision aggregate as "revisão".
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: The message names the hypothesis as "hipótese".
- node: domain/knowledge/case
  encoded_at:
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: The message names the case as "caso".
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: Both super() calls carry Brazilian-Portuguese sentences in full.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
  how: Every domain noun uses the fixed word; neither message uses the English word or raw lifecycle token.
inferences:
- inferred: error-handler.middleware.spec.ts also hard-codes HypothesisRevisionNotDraftAtReleaseError's
    full English message and had to be updated to keep the suite green.
  from: Grepping the whole src/src/__tests__ tree for both messages' English fragments per the caller's
    instruction not to assume the risk inventory's survey was exhaustive.
- inferred: The verb liberação (built on the fixed liberada root) is the correct PT-br word for the release
    action.
  from: 'The vocabulary constraint''s own text: what is fixed is the vocabulary and not the phrasing.'
preserved:
- ReleasedHypothesisRevisionNotAlterableError's context property, unchanged.
- HypothesisRevisionNotDraftAtReleaseError's no-argument constructor and continued absence of context.
- status-map.ts's mapping of both classes to HTTP 409, untouched.
- Both classes' name property, unchanged.
- release-hypothesis-revision.routes.spec.ts, revise-hypothesis.routes.spec.ts and status-map.spec.ts,
  which construct their own instance and read error.message off it.
- The Postgres-trigger-backed collects-removal exception, confirmed still unrefused and untouched.
---
## What it is
The two refusals that turn on a hypothesis revision's own draft-or-released state, rewritten whole in
Brazilian Portuguese; the second corrects a causality misattribution the English original carried.

## Notes
A second test pinning the untranslated class's literal text (error-handler.middleware.spec.ts) was
found outside the risk inventory's original survey scope and updated in this same change, the same
pattern found twice already in this initiative.
