---
target: backend
title: Translate the case-version lifecycle state before interpolating it into a refusal message
summary: CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasedError now
  interpolate the case version's fixed Portuguese word for its state ("rascunho"/"liberada") into their
  refusal message instead of the raw internal lifecycle token.
task: sha256:932bc76c135ee720c1c2cdc28e2ee3feb4b414b97748339a20bffd334d68eb0a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/corrective-fixes-suite-6
files:
- path: src/errors/case-version-not-draft.error.ts
  effect: 'Refuses a lifecycle operation asked of a case version not in draft state; its message now names
    the version''s current state as "rascunho" or "liberada" via state === ''draft'' ? ''rascunho'' :
    ''liberada'' inside the same super() template literal, in place of the raw token that was interpolated
    before. name, context and every other word of the message are unchanged.'
- path: src/errors/case-version-not-draft-at-release.error.ts
  effect: Refuses a release attempt asked of a case version not in draft state; its message now names
    the version's current state the same way, in place of the raw token. name, context and every other
    word of the message are unchanged.
- path: src/errors/case-version-not-released.error.ts
  effect: Refuses a diagnosis attempt against a case version not in released state; its message now names
    the version's current state the same way, in place of the raw token. name, context and every other
    word of the message are unchanged.
criteria:
- criterion: CaseVersionNotDraftError's message names the released state as "liberada" when constructed
    with the released state, and the draft state as "rascunho" when constructed with the draft state —
    never the raw token 'draft' or 'released'.
  met: true
  how: 'The super() call interpolates state === ''draft'' ? ''rascunho'' : ''liberada'' in place of the
    bare ${state}.'
- criterion: CaseVersionNotDraftAtReleaseError's message names the state the same way, for both states.
  met: true
  how: Carries the identical translation expression.
- criterion: CaseVersionNotReleasedError's message names the state the same way, for both states.
  met: true
  how: Carries the identical translation expression.
- criterion: case-version-not-draft.error.spec.ts's assertion that the message contains the raw lifecycle
    token is replaced with an assertion that the message contains the state's fixed Portuguese word.
  met: true
  how: Fixed by the proof step; confirmed green in the captured suite run.
- criterion: Each of the three classes' name property still holds its unchanged class-name string.
  met: true
  how: The this.name assignment in each file was not touched.
- criterion: src/errors/status-map.ts is unchanged and still maps each of the three classes to the HTTP
    status it mapped to before.
  met: true
  how: status-map.ts was not opened or edited.
- criterion: Each of the three classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: this.context = { slug, version, state } is unchanged; state still holds the raw token, only the
    message's interpolation changed.
- criterion: The suite under src/src/__tests__ passes, with case-version-not-draft.error.spec.ts's, case-version-not-draft-at-release.error.spec.ts's
    and case-version-not-released.error.spec.ts's assertions of the raw lifecycle token updated to assert
    the fixed Portuguese word instead, and — since each of those same three files' pre-existing ordering
    test used an arbitrary state value that no longer round-trips through a now-translated message — that
    ordering test's fixture state and its assertion updated to check against the translated word instead,
    and no other change to any test file.
  met: true
  how: Confirmed by the captured run at run/corrective-fixes-suite-6, all six steps passed; the ordering-test
    fixture was fixed as a necessary collateral change (see proof).
nodes:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-released.error.ts
  how: The constraint's two fixed words for the case-version's state -- "rascunho" for draft, "liberada"
    for released -- are now what each class's message interpolates, in place of the raw lifecycle token
    that leaked before.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  how: Honored, not newly encoded -- the message text was already Brazilian Portuguese prose; this fix
    replaces only the interpolated state token inside that same sentence.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  how: Only the refusal-message clause (the state named in the refusal) is touched, fixing how that state
    is worded.
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  encoded_at:
  - src/errors/case-version-not-released.error.ts
  how: Only the refusal-message clause is touched, fixing how the named state is worded.
inferences:
- inferred: The mapping treats any state value other than the literal string 'draft' as the released word
    "liberada", rather than adding a third branch for an unrecognized token.
  from: CaseVersionState admits exactly two members, 'draft' | 'released'; no third lifecycle value is
    ever passed to these constructors in practice.
preserved:
- Each of the three classes' name property, exactly as it was before this edit.
- Each of the three classes' context property's shape and values (slug, version, state).
- status-map.ts's instanceof-based mapping of each of the three classes to its HTTP status.
- Every word of each message's text other than the interpolated state token.
---

## What it is

See files and criteria above.

## Notes
