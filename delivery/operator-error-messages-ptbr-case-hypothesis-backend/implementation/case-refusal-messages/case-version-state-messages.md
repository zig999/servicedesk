---
target: backend
title: PT-br messages for the five case-version-state refusals
summary: The message text of CaseAlreadyHasDraftError, CaseHoldsNoDraftError, CaseVersionNotDraftError,
  CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError is rewritten in Brazilian Portuguese,
  each still stating the state fact its English original stated, with name, context and status-map untouched.
task: sha256:c7a22cd75efbf28743122589563d685dd9aea1b5f4336908e5e8d006ad67a1cc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-version-state-messages-suite
files:
- path: src/errors/case-already-has-draft.error.ts
  effect: The super() template literal is rewritten in PT-br, stating the case already holds a draft version
    and holds at most one at a time. name and context are unchanged.
- path: src/errors/case-holds-no-draft.error.ts
  effect: The super() template literal is rewritten in PT-br, stating the case holds no draft and that
    a hypothesis is revised only against its case's draft. name and context are unchanged.
- path: src/errors/case-version-not-draft.error.ts
  effect: The super() template literal is rewritten in PT-br, naming the case slug, version number and
    the state that version is in instead of draft. name and context are unchanged.
- path: src/errors/case-version-not-released.error.ts
  effect: The super() template literal is rewritten in PT-br, naming slug, version, state, and stating
    diagnosis only ever runs against a released version. name and context are unchanged.
- path: src/errors/case-version-not-draft-at-release.error.ts
  effect: The super() template literal is rewritten in PT-br, naming slug, version, state, and stating
    release only moves a version out of draft. name and context are unchanged.
criteria:
- criterion: CaseAlreadyHasDraftError's message is in PT-br, names the case slug, and states that the
    case already holds a version in draft and holds at most one at a time.
  met: true
  how: The rewritten message names the slug and states both clauses of the English original.
- criterion: CaseHoldsNoDraftError's message is in PT-br, names the case slug, and states that the case
    holds no version in draft and that a hypothesis is revised only against its case's draft.
  met: true
  how: The rewritten message carries both clauses of the English original.
- criterion: CaseVersionNotDraftError's message is in PT-br and names the case slug, the version number
    and the state that version is in instead of draft.
  met: true
  how: The message interpolates slug, version and state.
- criterion: CaseVersionNotReleasedError's message is in PT-br, names the case slug, the version number
    and the state that version is in, and states that diagnosis runs only against a released version.
  met: true
  how: The message interpolates slug, version, state and states the diagnosis-only-released fact.
- criterion: CaseVersionNotDraftAtReleaseError's message is in PT-br, names the case slug, the version
    number and the state that version is in, and states that release only ever moves a version out of
    draft.
  met: true
  how: The message interpolates slug, version, state and states the release-trigger fact.
- criterion: CaseVersionNotDraftError, CaseVersionNotReleasedError and CaseVersionNotDraftAtReleaseError
    are distinguishable from one another by their text alone, so an operator reading one can tell which
    act was refused.
  met: true
  how: All three share the same opening but each ends in a distinct trailing clause naming its own concern.
- criterion: Every one of the five messages names the case, and where the class receives a version number
    the version, before it states the state that refuses the act.
  met: true
  how: Each message opens naming the case (and version where applicable) before its trailing state-refusal
    clause.
- criterion: No message states a fact its English original did not state, and every interpolated value
    in each PT-br message also appeared in that class's English message.
  met: true
  how: Each PT-br message is a direct rewording with no added or dropped fact, using exactly the constructor
    parameters the English text already interpolated.
- criterion: Each message uses "caso" for a case, "versão" for a case version, "rascunho" for the draft
    state and "liberada" for the released state, and uses no English domain noun.
  met: true
  how: The fixed words are used throughout; no English domain noun appears.
- criterion: Each of the five classes' name property still holds its unchanged class-name string.
  met: true
  how: Only the super() template literal was edited in each file; this.name is untouched.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the five classes to the
    HTTP status it mapped to before.
  met: true
  how: status-map.ts was not opened for editing; all five entries confirmed unchanged.
- criterion: Each of the five classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: The this.context assignment line in each file was left untouched.
- criterion: The suite under src/src/__tests__ passes with no test file changed.
  met: true
  how: A search for literal English fragments of these five classes' messages found no match in any test
    file; the captured suite run's test-unit and test steps both passed.
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: The messages name the case by its slug, called "caso" throughout, per the fixed-noun constraint.
- node: domain/knowledge/case-version
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: The three version-bearing classes name the version and its state; the other two refer to "uma versão".
- node: rules/knowledge/a-case-has-at-most-one-draft
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
  how: CaseAlreadyHasDraftError's message states the policy's own fact, unchanged from the English text.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/errors/case-holds-no-draft.error.ts
  how: CaseHoldsNoDraftError's message states the policy's own fact, unchanged from the English text.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: The two messages carry the slug, version and state this node's statement requires; which transitions
    are legal is left to the operation enforcing them.
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  encoded_at:
  - src/errors/case-version-not-released.error.ts
  how: The message states the policy's own fact, unchanged from the English text.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: All five messages' text is rewritten entirely in Brazilian Portuguese.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: Every occurrence of case/case-version/draft-state/released-state uses the fixed word; no English
    domain noun or raw lifecycle token appears in the message text.
inferences:
- inferred: For CaseVersionNotDraftAtReleaseError, "release" as the lifecycle trigger is rendered "liberação"
    (the act) rather than the fixed noun "liberada" (the state).
  from: The fixed-noun constraint only names a word for the released state; the English original names
    the trigger/action, not the state.
preserved:
- Each class's name property, unchanged.
- Each class's context property, unchanged.
- status-map.ts, unedited.
- Every test file under src/src/__tests__, none of which pins literal message text for these five classes.
- CaseVersionNotValidError and CaseVersionNotReleasableError, belonging to the sibling task and not touched.
---
## What it is
The five case refusals whose message turns on the state a case version is in when an act reaches it,
rewritten whole in Brazilian Portuguese.

## Notes
None.
