---
title: The error-code mapping keys on the name the refusal now carries
summary: The frontend's mapping from an API error code to a user-facing state answers the CaseVersionNotValidError
  refusal the backend sends for a case version that fails validation at a read.
objective: A case whose current version fails a validator rule at a read is presented to the curator as
  a version that does not read back as a case, rather than as the generic error state, because the frontend's
  error-code mapping resolves the code the API actually answers with.
criteria:
- An API error whose code is CaseVersionNotValidError resolves through the frontend's error-code mapping
  to the case-not-valid user-facing state, and not to the state the surface shows for a read that did
  not complete.
- An API error whose code the frontend's mapping holds no presentation of its own for resolves to the
  state the surface shows for a read that did not complete, and the surface discloses neither that error
  code, nor the refusal's own message, nor any value the refusal carries.
- A case-keyed surface that meets a CaseVersionNotValidError refusal for the case's current version states
  that the case's current version does not read back as a case.
- What a case-keyed surface states for a current version that fails validation, what it states for a read
  of that case that did not complete, and what it states for a case currently holding no version are three
  statements, no two of which are presented alike.
- A case-keyed surface meeting a CaseVersionNotValidError refusal presents no attribute of the non-validating
  version — its title, when_to_use, subject, fallback, consolidation_register, state or manifest, nor
  anything derived from them — as the case's current content.
- A case whose current version reads back with every validator rule holding is presented with none of
  the statement that its current version does not read back as a case.
implements:
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
sources:
- intake/scope.md
rationale: 'The corrective route states the wrong behavior and the file; the criteria beyond the first
  two were decided here, after a first binding returned underdetermined notes showing that criteria keyed
  only on the mapping left three clauses of the governing surface rule unreached. They are stated rather
  than dropped because the state they govern was unreachable until this correction: nothing has ever exercised
  it end to end.'
---

## What it is
The one task of a corrective increment: the frontend's error-code mapping keys on CaseVersionNotValidError, the name the refusal carries since the backend renamed it, so a case whose current version fails validation reaches the curator as itself rather than as the generic error state.
The wrong behavior was observed running the delivered system and answers to no criterion any delivered task holds.

## Notes
UNDERDETERMINED, from the specification — a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete states in its expression that for a refusal whose code the surface holds no presentation of its own for the surface states nothing else about it, "not the error code, not the refusal's message, not any value the refusal carries, and no attribute of c or of any version of c"; the final clause reaches no criterion here, because criterion 2 bounds disclosure to the code, the message and the values the refusal carries, and criterion 5 bounds the no-attribute prohibition to a CaseVersionNotValidError refusal alone.
The implementation this admits: a frontend whose mapping resolves an unrecognised API error code to the did-not-complete state and shows neither the code, nor the refusal's message, nor any value the refusal carries, but renders the case's title, when_to_use or other attributes from an earlier or cached read alongside that statement — satisfying every criterion as written while the rule forbids stating any attribute of the case or of any of its versions there.
REMAINDER, from the specification — a-case-version-failing-validation-at-a-read-is-refused-by-name states one wire-side answer in three clauses, and only the error name is reached here; the HTTP 409 status and the two exclusions, that the read is never answered with the generic refusal an unmapped domain error receives and never with CaseNotFoundError, govern what the API answers and no criterion of this task addresses that.
That clause belongs to the backend act that makes the read itself answer HTTP 409 with CaseVersionNotValidError rather than the generic fallback or CaseNotFoundError, which this task's criteria already take as given, beginning at an API error that carries the code.
The node is still named in implements because it is the sole node stating the code the mapping keys on.
ADVISORY, from the specification — one candidate was handed to the binder at a path resolving to no file, knowledge/rules/knowledge/a-case-holding-no-versions-is-told-explicitly.md; the node bearing that slug is scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly, which is what every citing node names.
Decision, beyond the covers — stand: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly is named by that advisory and sits outside this epic's covers, and the claim is deliberately not grown to it: the binder read it and found it does not govern this task, because criterion 4 asks only that the three statements be presented unalike, which a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case states in full, and what a case currently holding no version is told stays that scenario's for this task never to restate.
