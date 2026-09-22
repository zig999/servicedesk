---
title: PT-br messages for the two case refusals about whether a named version exists
summary: CaseNotFoundError and CaseVersionAlreadyStoredError rewritten in PT-br, each naming the case
  slug and version number at issue.
rationale: These two are cut together because they answer one question from its two sides — the named
  version is not there, or it is already there and never rewritten — and an operator reading either needs
  the same two values named the same way; they are kept out of the state-refusal task because neither
  turns on the version's state.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
implements:
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
objective: The two case refusals about a named version's existence carry PT-br messages stating the same
  fact their English text stated.
criteria:
- CaseNotFoundError's message is in PT-br and names the case slug and the version number that no stored
  version answers.
- CaseVersionAlreadyStoredError's message is in PT-br, names the case slug and the version number already
  stored, and states that a version already stored at that number is never recreated by a new write, without
  claiming the version's content is never altered.
- The two messages are distinguishable from one another by their text alone, so an operator reading one
  can tell an absent version from an already-written one.
- Both messages name the case slug and the version number in the same order and with the same PT-br wording
  as one another.
- No message states a fact its English original did not state, and every interpolated value in each PT-br
  message also appeared in that class's English message.
- Each message uses "caso" for a case and "versão" for a case version, and uses no English domain noun.
- Each of the two classes' name property still holds its unchanged class-name string.
- src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP status
  it mapped to before.
- Each of the two classes' context property holds exactly the properties and values it held before, with
  no value moved into or out of it.
- The suite under src/src/__tests__ passes, with every test asserting a violation string's or a message's
  literal English text updated to assert the new PT-br text instead, and no other change to any test file.
---
## What it is
The refusal an operator meets when the slug and version they named answers nothing, and the refusal they meet when that version is already written.
Neither says anything about the state of a version; both say only whether one is there.

## Notes
CaseNotFoundError is the refusal the specification holds apart from the one a version failing validation receives, so its PT-br text has to stay distinguishable from CaseVersionNotValidError's as well.
Neither class's own file under src/src/__tests__/unit/errors is asserted against literal message text
by any existing test, but src/src/__tests__/unit/http/error-handler.middleware.spec.ts constructs
CaseNotFoundError directly and asserts the full envelope against the literal English message; this was
found only when a first implementation attempt correctly refused to write against the original wording
of the last criterion ("no test file changed"), self-contradictory against the PT-br criteria. The
criterion above is the correction.
UNDERDETERMINED, from the specification — CaseVersionAlreadyStoredError is declared under src/src/errors/ but no code path constructs it today, and status-map.ts names no HTTP status for it; rewriting its message in PT-br is correct regardless, but the refusal is not currently reachable, so the class's dead-code status stands unresolved by this task.
ADVISORY, from the specification — CaseNotFoundError's message must also stay distinguishable from the slug-only branch of its own governing rule (a read naming a slug alone, with no version, is answered by the same class); the template must not force a version placeholder onto a request that named none.
