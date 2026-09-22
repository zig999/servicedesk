---
target: backend
title: PT-br messages for CaseNotFoundError and CaseVersionAlreadyStoredError
summary: Two new spec files prove the translated messages name the case slug and version, use the fixed
  PT-br vocabulary with no English noun, keep name/context untouched, are distinguishable from one another
  by text with matching order and wording, and that CaseVersionAlreadyStoredError stays unmapped by status-map.ts.
implementation: sha256:5c047ab61a0aed814e7c7e9abc814335b23f78bc0a52cfca556e47fb8aedcd50
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-version-existence-messages-suite
tests:
- file: src/__tests__/unit/errors/case-not-found.error.spec.ts
  name: states its message in Brazilian Portuguese, naming the case slug and the version number no stored
    version answers
  proves: CaseNotFoundError's message is in PT-br and names the case slug and the version number that
    no stored version answers.
  fails_when: the message reverts to English, drops the slug or the version, or changes their values.
- file: src/__tests__/unit/errors/case-not-found.error.spec.ts
  name: names a case as "caso" and a case version as "versão", using no English domain noun
  proves: CaseNotFoundError's message uses the fixed PT-br nouns and no English domain noun.
  fails_when: the message stops containing "caso" or "versão", or contains the English word "case" or
    "version".
- file: src/__tests__/unit/errors/case-not-found.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: CaseNotFoundError's name property still holds its unchanged class-name string.
  fails_when: error.name stops being "CaseNotFoundError".
- file: src/__tests__/unit/errors/case-not-found.error.spec.ts
  name: carries exactly the slug and version in context, with no value moved into or out of it
  proves: CaseNotFoundError's context property holds exactly the properties and values it held before.
  fails_when: error.context stops being exactly { slug, version }.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: states in Brazilian Portuguese that a version already stored at that slug and number is never
    recreated by a new write
  proves: CaseVersionAlreadyStoredError's message is in PT-br, names the slug and version already stored,
    and states the never-recreated fact.
  fails_when: the message stops naming the slug/version or the never-recreated fact.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: never claims the version's content is never altered, only that it is never recreated
  proves: the message does not claim the version's content is never altered.
  fails_when: the message reintroduces a claim that the content is never altered.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: names a case as "caso" and a case version as "versão", using no English domain noun
  proves: CaseVersionAlreadyStoredError's message uses the fixed PT-br nouns and no English domain noun.
  fails_when: the message stops containing "caso" or "versão", or contains the English word "case" or
    "version".
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: keeps its own class-name string unchanged
  proves: CaseVersionAlreadyStoredError's name property still holds its unchanged class-name string.
  fails_when: error.name stops being "CaseVersionAlreadyStoredError".
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: carries exactly the slug and version in context, with no value moved into or out of it
  proves: CaseVersionAlreadyStoredError's context property holds exactly the properties and values it
    held before.
  fails_when: error.context stops being exactly { slug, version }.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: is distinguishable from CaseNotFoundError by text alone, for the same slug and version
  proves: the two messages are distinguishable from one another by their text alone.
  fails_when: the two classes construct an identical message string for the same slug and version.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: names the case slug and the version number in the same order and with the same wording as CaseNotFoundError
  proves: both messages name the slug and version in the same order and with the same PT-br wording as
    one another.
  fails_when: the slug fragment stops preceding the version fragment in either message, or the shared
    wording diverges.
- file: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  name: remains absent from the status map, exactly as before this task
  proves: status-map.ts still maps CaseVersionAlreadyStoredError to no HTTP status, unchanged from before
    this task.
  fails_when: statusForError(new CaseVersionAlreadyStoredError(...)) stops returning undefined.
not_applicable:
- edge_case: empty-string slug, or a version of zero or a negative number, passed to either constructor.
  why: neither constructor branches on slug or version shape; every value reaches this class only to be
    interpolated verbatim, validated upstream.
- edge_case: a dependency that is slow, unavailable or answers unexpectedly; two operations against one
    subject at once.
  why: both classes are plain, synchronous Error subclasses performing no I/O.
- edge_case: absent slug or absent version argument.
  why: both constructors declare slug and version as required, non-optional parameters under the project's
    strict compiler configuration; an omitted argument is a compile error.
untested:
- 'Criterion ''No message states a fact its English original did not state...'' is not decidable by a
  runtime test: the English original was overwritten and no artifact of it remains in the tree to compare
  against.'
- 'The CaseNotFoundError leg of the status-map criterion is not re-tested here: the pre-existing, untouched
  status-map.spec.ts already asserts the 404 mapping; the file-level claim that status-map.ts is byte-for-byte
  unchanged is a diff fact evidenced by the captured build run, not by a test.'
- The whole-suite criterion ('passes, with every test... updated... and no other change to any test file')
  is a process-level claim evidenced by the captured build run, not by a test.
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused -- the fact spans files this task
  does not touch (the read/lifecycle operations that raise CaseNotFoundError, and the error-handler layer);
  no single test decides the whole implication end to end.
- rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused -- CaseVersionAlreadyStoredError
  is dead code; no path in the tree constructs it, so no test can trigger the refusal this rule states.
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- system-wide fitness over
  every mapped domain error, most of which remain untranslated in files this task does not touch.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- same system-wide
  totality; this task's two-class vocabulary tests cannot demonstrate the whole fact.
---
## What it is
Unit tests proving CaseNotFoundError's and CaseVersionAlreadyStoredError's PT-br message content,
vocabulary, preserved name/context, mutual distinguishability, and status-map's unchanged (and, for
the second class, still-absent) mapping.

## Notes
CaseVersionAlreadyStoredError remains unreachable dead code; its message is correctly translated but
no test can trigger the refusal, since nothing in the tree constructs the class.
