---
title: PT-br messages for the two refusals a hypothesis revision's own state raises
summary: HypothesisRevisionNotDraftAtReleaseError and ReleasedHypothesisRevisionNotAlterableError rewritten
  in PT-br, with the test that hard-codes the first one's English text updated in the same change.
rationale: These two are cut together because they share one reason to change — how a revision's own draft-or-released
  state is told to an operator whose act it refused — and the test that pins one of the two messages verbatim
  belongs to the same change that alters it, since a message changed without its assertion is not a delivered
  message.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis
- domain/knowledge/case
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
objective: The two refusals raised by a hypothesis revision's own state carry PT-br messages stating the
  same fact their English text stated, with the suite green, except that ReleasedHypothesisRevisionNotAlterableError's
  message deliberately corrects the English original's misattribution of the revision's immutability to
  a referencing case version's released state, attributing it instead to the revision's own released state,
  as the specification states.
criteria:
- HypothesisRevisionNotDraftAtReleaseError's message is in PT-br and states that the hypothesis revision
  is not in draft and that release only ever moves a revision out of draft.
- HypothesisRevisionNotDraftAtReleaseError's message names no hypothesis, no revision number and no case,
  because the class receives none and carries no context.
- ReleasedHypothesisRevisionNotAlterableError's message is in PT-br, names the hypothesis, the revision
  number and the case slug, and states that the revision is itself in released state and that a released
  revision is never altered — never attributing the immutability to a case version referencing it.
- The FIXED_MESSAGE constant in src/src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  holds the new PT-br text character for character, and that spec passes.
- The two messages are distinguishable from one another by their text alone, so an operator reading one
  can tell a release refused from an alteration refused.
- Every interpolated value in each PT-br message also appeared in that class's English message, and no
  message states a fact its English original did not state, except that ReleasedHypothesisRevisionNotAlterableError's
  message states the revision's own released state as the ground of its immutability instead of the English
  original's referencing-case-version framing — a deliberate correction, not a new fact.
- ReleasedHypothesisRevisionNotAlterableError's refusal is scoped, as the specification states, to an attempt
  to alter the revision's criterion, resolution or state; its message does not generalize to every alteration,
  including a removal of one of the revision's collects, which is accepted with no effect rather than refused.
- Each message uses "caso" for a case, "hipótese" for a hypothesis, "revisão" for a hypothesis revision,
  "rascunho" for the draft state and "liberada" for the released state, and uses no English domain noun.
- Each of the two classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP status
  it mapped to before.
- ReleasedHypothesisRevisionNotAlterableError's context property holds exactly the properties and values
  it held before, with no value moved into or out of it.
- HypothesisRevisionNotDraftAtReleaseError still takes no constructor argument and still declares no context
  property.
- The suite under src/src/__tests__ passes, with hypothesis-revision-not-draft-at-release.error.spec.ts
  the only test file changed.
---
## What it is
The two refusals that turn on whether a hypothesis revision is still in draft.
One of them carries a fully fixed English sentence with no interpolation, which is the one message in the scope whose English text a test asserts verbatim.

## Notes
The route specs release-hypothesis-revision.routes.spec.ts and revise-hypothesis.routes.spec.ts derive their expected envelope from a locally constructed instance's message, so they follow the new text without being edited.
The fixed message's lack of any identifier is a property of the class, not a gap the PT-br text may fill.
UNDERDETERMINED, from the specification — HypothesisRevisionNotDraftAtReleaseError's governing rule states the refusal discloses its own condition and message but never which of its two triggers (not currently in draft, or an identity nothing was ever stored for) raised it; the PT-br text must not name the triggering condition even though no criterion here forbids it in so many words.
ADVISORY, from the specification — the decision log's entry for the released-revision's-collects-removal exception is indexed on a-released-hypothesis-revision-is-never-altered's own statement rather than on the separate node that states the exception (a-released-revisions-collect-removal-is-accepted-with-no-effect); the two disagree about which node holds that fact today.
