---
title: Translate the lifecycle state before interpolating it into a refusal message
summary: CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasedError name
  the case's own state with its fixed Portuguese word, never the raw lifecycle token.
rationale: 'Corrective: these three classes contradict the criteria their own delivering task already
  stated.'
sources:
- intake/corrective-case-version-state-token-leak.md
objective: CaseVersionNotDraftError's, CaseVersionNotDraftAtReleaseError's and CaseVersionNotReleasedError's
  messages name the case version's state as "rascunho" or "liberada", never as the raw internal lifecycle
  token.
criteria:
- CaseVersionNotDraftError's message names the released state as "liberada" when constructed with the
  released state, and the draft state as "rascunho" when constructed with the draft state — never the
  raw token 'draft' or 'released'.
- CaseVersionNotDraftAtReleaseError's message names the state the same way, for both states.
- CaseVersionNotReleasedError's message names the state the same way, for both states.
- case-version-not-draft.error.spec.ts's assertion that the message contains the raw lifecycle token is
  replaced with an assertion that the message contains the state's fixed Portuguese word.
- Each of the three classes' name property still holds its unchanged class-name string.
- src/errors/status-map.ts is unchanged and still maps each of the three classes to the HTTP status it
  mapped to before.
- Each of the three classes' context property holds exactly the properties and values it held before,
  with no value moved into or out of it.
- The suite under src/src/__tests__ passes, with case-version-not-draft.error.spec.ts's, case-version-not-draft-at-release.error.spec.ts's
  and case-version-not-released.error.spec.ts's assertions of the raw lifecycle token updated to assert
  the fixed Portuguese word instead, and — since each of those same three files' pre-existing ordering test
  used an arbitrary state value that no longer round-trips through a now-translated message — that ordering
  test's fixture state and its assertion updated to check against the translated word instead, and no
  other change to any test file.
implements:
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/investigation/only-a-released-case-version-is-diagnosed
---

## What it is

See intake.

## Notes

REMAINDER, from the execution-contract-binder — rules/knowledge/a-case-version-moves-through-its-declared-lifecycle's
transition-enforcement clauses and rules/investigation/only-a-released-case-version-is-diagnosed's
pinning/reading clauses reach no criterion of this task; only the refusal-message clauses this task's
criteria touch are implemented here. constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word's
other seven fixed words reach no criterion of this task either — they belong to this initiative's sibling
tasks.
