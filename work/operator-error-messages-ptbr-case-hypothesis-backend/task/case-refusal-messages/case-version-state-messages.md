---
title: PT-br messages for the five case refusals an act meets because of a version's state
summary: CaseAlreadyHasDraftError, CaseHoldsNoDraftError, CaseVersionNotDraftError, CaseVersionNotReleasedError
  and CaseVersionNotDraftAtReleaseError rewritten in PT-br, each stating the state that refuses the act.
rationale: These five are cut together because they share one reason to change — how the state of a case
  version is told to an operator whose act it refused — and five independently chosen ways of naming draft
  and released would read as five different facts.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- domain/knowledge/case
- domain/knowledge/case-version
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/investigation/only-a-released-case-version-is-diagnosed
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
objective: The five case refusals raised by a version's current state carry PT-br messages stating the
  same fact their English text stated.
criteria:
- CaseAlreadyHasDraftError's message is in PT-br, names the case slug, and states that the case already
  holds a version in draft and holds at most one at a time.
- CaseHoldsNoDraftError's message is in PT-br, names the case slug, and states that the case holds no
  version in draft and that a hypothesis is revised only against its case's draft.
- CaseVersionNotDraftError's message is in PT-br and names the case slug, the version number and the state
  that version is in instead of draft.
- CaseVersionNotReleasedError's message is in PT-br, names the case slug, the version number and the state
  that version is in, and states that diagnosis runs only against a released version.
- CaseVersionNotDraftAtReleaseError's message is in PT-br, names the case slug, the version number and
  the state that version is in, and states that release only ever moves a version out of draft.
- CaseVersionNotDraftError, CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError are distinguishable
  from one another by their text alone, so an operator reading one can tell which act was refused.
- Every one of the five messages names the case, and where the class receives a version number the version,
  before it states the state that refuses the act.
- No message states a fact its English original did not state, and every interpolated value in each PT-br
  message also appeared in that class's English message.
- Each message uses "caso" for a case, "versão" for a case version, "rascunho" for the draft state and
  "liberada" for the released state, and uses no English domain noun.
- Each of the five classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the five classes to the HTTP status
  it mapped to before.
- Each of the five classes' context property holds exactly the properties and values it held before, with
  no value moved into or out of it.
- The suite under src/src/__tests__ passes with no test file changed.
---
## What it is
The five refusals whose subject is the state a case version is in when an act reaches it.
Three of the five interpolate the state itself into the message, and all five are the clearest case in the scope of an English text that names the rule before it names the situation.

## Notes
The state words these messages interpolate come from the stored value and are not themselves translated by this task.
None of the five is asserted against literal message text by any existing test.
REMAINDER, from the specification — the lifecycle-enforcement clauses of a-case-version-moves-through-its-declared-lifecycle and only-a-released-case-version-is-diagnosed (which transitions a case version may make, and that only a released version is diagnosed) belong to the acts enforcing them, not to this message-rewrite task.
ADVISORY, from the specification — after this task the knowledge context's case refusal surface is mixed PT-br and English until the sibling tasks of this epic land; CaseVersionNotValidError must stay distinguishable from CaseNotFoundError per a-case-version-failing-validation-at-a-read-is-refused-by-name, a constraint this task does not touch.
