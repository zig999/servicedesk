---
target: backend
title: PT-br messages for CaseNotFoundError and CaseVersionAlreadyStoredError
summary: The two case-version-existence refusals now carry Brazilian-Portuguese messages naming the case
  slug and version number, distinguishable from one another and from the validation refusal, with the
  corrected literal-text assertion in error-handler.middleware.spec.ts updated to match.
task: sha256:4bffd8c5e29d272eabeeed6c1c6e2385ea61aa8767fe7105402302da822ce27c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-version-existence-messages-build
files:
- path: src/errors/case-not-found.error.ts
  effect: The super() template literal is rewritten from English to PT-br, naming the same slug and version
    the English original named, in the same positional order; class name, constructor signature and context
    are untouched.
- path: src/errors/case-version-already-stored.error.ts
  effect: The super() template literal is rewritten from English to PT-br, stating a version already stored
    at that number is never recreated by a new write, dropping the English original's separate claim that
    the content is never altered; class name, constructor signature and context are untouched.
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  effect: The one assertion pinning CaseNotFoundError's full literal English envelope now asserts the
    PT-br text instead; no other line or file touched.
criteria:
- criterion: CaseNotFoundError's message is in PT-br and names the case slug and the version number that
    no stored version answers.
  met: true
  how: The template literal interpolates slug and version exactly as the English original did, now entirely
    in Portuguese.
- criterion: CaseVersionAlreadyStoredError's message is in PT-br, names the case slug and the version
    number already stored, and states that a version already stored at that number is never recreated
    by a new write, without claiming the version's content is never altered.
  met: true
  how: The rewritten message names slug and version and states it is never recreated by a new write; the
    broader 'never altered' claim is dropped rather than translated.
- criterion: The two messages are distinguishable from one another by their text alone, so an operator
    reading one can tell an absent version from an already-written one.
  met: true
  how: The two messages share the same shape but differ on the word carrying the fact ("não tem" vs "já
    tem"), plus the added refusal clause.
- criterion: Both messages name the case slug and the version number in the same order and with the same
    PT-br wording as one another.
  met: true
  how: Both name the slug first, quoted, then the version, in the identical phrase fragment.
- criterion: No message states a fact its English original did not state, and every interpolated value
    in each PT-br message also appeared in that class's English message.
  met: true
  how: Both messages interpolate only slug and version, as the English originals did; no new fact added,
    the 'never altered' fact dropped rather than a new one introduced.
- criterion: Each message uses "caso" for a case and "versão" for a case version, and uses no English
    domain noun.
  met: true
  how: Both templates use "caso" and "versão" exclusively.
- criterion: Each of the two classes' name property still holds its unchanged class-name string.
  met: true
  how: this.name is untouched in both files -- only the super() argument was edited.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP
    status it mapped to before.
  met: true
  how: status-map.ts was not opened for editing; CaseNotFoundError still maps to 404, CaseVersionAlreadyStoredError
    is still absent from the map.
- criterion: Each of the two classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: this.context = { slug, version } is untouched in both files.
- criterion: The suite under src/src/__tests__ passes, with every test asserting a violation string's
    or a message's literal English text updated to assert the new PT-br text instead, and no other change
    to any test file.
  met: true
  how: A repo-wide search found exactly one hit (error-handler.middleware.spec.ts), updated to the PT-br
    text; CaseVersionAlreadyStoredError is referenced by no test at all; captured build's test-unit step
    passed.
nodes:
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  encoded_at:
  - src/errors/case-not-found.error.ts
  how: The rule requires CaseNotFoundError's details to carry the named slug and version; this task translates
    its message without touching context/details or which reads raise it.
- node: rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused
  encoded_at:
  - src/errors/case-version-already-stored.error.ts
  how: The rewritten message states exactly what the rule states -- the already-stored version at that
    number is never recreated by a new write -- and names slug and version.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/case-not-found.error.ts
  - src/errors/case-version-already-stored.error.ts
  how: Both classes' super() message text is now written entirely in Brazilian Portuguese.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/case-not-found.error.ts
  - src/errors/case-version-already-stored.error.ts
  how: Both messages name a case as "caso" and a case version as "versão", the two of the nine fixed nouns
    either message has occasion to name.
inferences:
- inferred: CaseVersionAlreadyStoredError's PT-br clause restates the same fact the English original's
    'written once' stated, rather than adding one, while dropping the further 'never altered' clause as
    a broader claim the governing rule does not make.
  from: The governing node's own text -- 'a write ... stores no second version and alters the stored one
    in no way' -- describes the write's effect, not an eternal immutability claim.
- inferred: The parallel phrase shape for both messages was chosen so the two are distinguishable by one
    differing word while sharing the same order and wording.
  from: Criteria 3 and 4 together, read against the construction convention inventory's note that phrasing
    stays free as long as the fixed vocabulary and construction pattern are kept.
- inferred: CaseNotFoundError's constructor keeps interpolating a version number into every message, including
    for a slug-only read (where a sentinel value is passed), unchanged from the English original's behavior.
  from: The task's ADVISORY note and criteria 5 and 9, which forbid changing what is interpolated or what
    context carries.
preserved:
- Both classes' error.name string, unchanged.
- Both classes' context property -- the same {slug, version} shape and values.
- Both classes' constructor signature and template-literal-to-super() construction pattern.
- status-map.ts, not opened for editing.
- Every test file other than the one line edited in error-handler.middleware.spec.ts.
deferred:
- what: CaseVersionAlreadyStoredError's dead-code status -- no code path constructs it, and status-map.ts
    names no HTTP status for it.
  why: The task's Notes mark this UNDERDETERMINED and state the PT-br rewrite is correct regardless; resolving
    whether the class should be wired up is outside this task's criteria.
- what: Whether CaseNotFoundError's message should branch its wording when no version was named at all.
  why: The task's Notes mark this ADVISORY; no criterion asks for a behavior change, and criteria 5 and
    9 forbid changing what is interpolated.
---
## What it is
CaseNotFoundError and CaseVersionAlreadyStoredError rewritten whole in Brazilian Portuguese, naming
the case slug and version number, distinguishable from one another by the one word carrying their
opposite facts.
The one test pinning CaseNotFoundError's literal English envelope, found outside the inventory's
original survey scope, was updated to assert the new PT-br text.

## Notes
A first implementation attempt correctly refused to write against the task's original last criterion
("no test file changed"), which contradicted the criteria requiring these messages translated, since
error-handler.middleware.spec.ts pinned CaseNotFoundError's text verbatim; the task was corrected
before this attempt, the same way as case-content-violation-messages.
CaseVersionAlreadyStoredError remains dead code: no path in the tree constructs it, and status-map.ts
maps no HTTP status for it, exactly as before this task.
