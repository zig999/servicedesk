---
target: backend
title: Proof for PT-br messages of CaseVersionNotValidError and CaseVersionNotReleasableError
summary: Independent unit tests, written apart from the implementation, that decide each of the task's
  criteria for the two translated refusal classes and their two violation-producing files, and that identify
  which of the task's criteria and implemented nodes no test in this tree can decide.
implementation: sha256:f9d70f7e652e8be4204d39a6a7bb71cf9d7a4f4dc147221c9d6b5d79660d2c90
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-content-violation-messages-suite
tests:
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: names the case and its version before it states the kind of rule that refuses it
  proves: Each of the two messages names the thing refused before it states the kind of rule that refuses
    it (CaseVersionNotValidError).
  fails_when: the message no longer names the case slug at a position earlier than where it names the
    violated rule.
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: names the case slug, the version number and every validator rule the version violates, in Brazilian
    Portuguese
  proves: CaseVersionNotValidError's message is in PT-br and names the case slug, the version number and
    the validator rules that version violates at the reading.
  fails_when: the message stops containing the slug, the version number or one of the given violation
    strings, or uses the English words "case"/"version" instead of "caso"/"versão".
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the two classes' name property still holds its unchanged class-name string (CaseVersionNotValidError).
  fails_when: error.name is anything other than 'CaseVersionNotValidError'.
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: holds exactly the slug, version and violations it was constructed with, in its context
  proves: Each of the two classes' context property holds exactly the properties and values it held before,
    with no value moved into or out of it (CaseVersionNotValidError).
  fails_when: context gains, loses or renames a property, or its values differ from the constructor arguments.
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: introduces the joined list of violations with the same wording as CaseVersionNotReleasableError
    does
  proves: The two messages introduce the list of violations with the same PT-br wording as one another.
  fails_when: the text immediately introducing the joined violation list differs between the two classes,
    given the same violation.
- file: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  name: is distinguishable from CaseVersionNotReleasableError by its text alone, given the same slug,
    version and violations
  proves: The two messages are distinguishable from one another by their text alone, so an operator reading
    one can tell which of the two conditions occurred.
  fails_when: both classes produce the identical message text for the same slug, version and violations.
- file: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  name: names the case and its version before it states the kind of rule that refuses the release
  proves: Each of the two messages names the thing refused before it states the kind of rule that refuses
    it (CaseVersionNotReleasableError).
  fails_when: the message no longer names the case slug at a position earlier than where it names the
    violated rule.
- file: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  name: names the case slug, the version number and every violation that refuses the release, in Brazilian
    Portuguese
  proves: CaseVersionNotReleasableError's message is in PT-br and names the case slug, the version number
    and the violations that refuse its release.
  fails_when: the message stops containing the slug, the version number or one of the given violations,
    or uses the English words "case"/"version" instead of "caso"/"versão".
- file: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  name: states explicitly that no rule was specifically identified, rather than trailing off with an unexplained
    empty violation list, when release finds no violation to name
  proves: Where CaseVersionNotReleasableError's release finds no rule specifically violated, its PT-br
    message says so explicitly rather than presenting the curator with an unexplained empty list.
  fails_when: the message, given no violations, is empty or trails off with a colon and nothing after
    it.
- file: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  name: keeps its class-name string unchanged
  proves: Each of the two classes' name property still holds its unchanged class-name string (CaseVersionNotReleasableError).
  fails_when: error.name is anything other than 'CaseVersionNotReleasableError'.
- file: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  name: holds exactly the slug, version and violations it was constructed with, in its context, when %s
  proves: Each of the two classes' context property holds exactly the properties and values it held before,
    with no value moved into or out of it (CaseVersionNotReleasableError, both the violations-present
    and the no-violation-found branch).
  fails_when: context gains, loses or renames a property, or its values differ from the constructor arguments,
    in either branch.
- file: src/__tests__/unit/errors/invalid-case-document.error.spec.ts
  name: still answers in English, left untouched by this initiative's Portuguese rewrite of the case and
    case-version refusals
  proves: IncoherentCaseError and InvalidCaseDocumentError are left untouched by this task (InvalidCaseDocumentError
    half).
  fails_when: InvalidCaseDocumentError's message changes from its original English wording.
- file: src/__tests__/unit/errors/incoherent-case.error.spec.ts
  name: still answers in English, left untouched by this initiative's Portuguese rewrite of the case and
    case-version refusals
  proves: IncoherentCaseError and InvalidCaseDocumentError are left untouched by this task (IncoherentCaseError
    half).
  fails_when: IncoherentCaseError's message changes from its original English wording.
- file: src/__tests__/unit/case/release.operation.spec.ts
  name: names the hypothesis and states that its manifested revision is not released using "liberada",
    never the raw lifecycle token, when release finds a manifested revision whose own state is not released
  proves: The one release-only violation string release.operation.ts produces is rewritten in PT-br, naming
    the released state 'liberada' rather than its raw lifecycle token, and uses no English domain noun
    among the task's fixed seven.
  fails_when: the violation string stops containing "liberada", contains the raw lifecycle token "released"/"draft",
    or no longer names the hypothesis.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a stored case version failing validation at a read through CaseVersionNotValidError alone,
    naming the case slug, the version and the validator rule that fails in Brazilian Portuguese, mapped
    to the 409 the read-by-name rule requires, and never through CaseNotFoundError
  proves: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name's fact, taken
    whole, for a representative validator-rule violation.
  fails_when: the refusal raised is anything other than CaseVersionNotValidError, is also an instance
    of CaseNotFoundError, its message omits the slug, the version or the violated rule, or statusForError
    no longer maps it to 409.
  demonstrates: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- file: src/__tests__/unit/case/parse-case-document.spec.ts
  name: names the concerned domain noun in Portuguese, and no English domain noun among the seven this
    task fixes, for %s
  proves: Every structural violation string parse-case-document.ts produces is rewritten in PT-br (representative
    branches), and each violation string uses caso/versão/hipótese/revisão/manifesto/posição and no English
    domain noun among the task's seven fixed nouns.
  fails_when: for any of the sixteen covered structural-violation scenarios, the produced violation text
    either omits the fixed Portuguese word its scenario concerns, or contains an English word for one
    of the seven fixed domain nouns.
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: refuses a case naming a subject type the glossary does not hold, naming the term
  proves: validate-case-coherence.ts's coherence violation strings are left untouched by this task (this
    pre-existing, unmodified test still asserts the original English wording).
  fails_when: coherence-violation text stops reading "does not exist in the glossary" in English.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  proves: src/errors/status-map.ts is unchanged and still maps CaseVersionNotValidError to the HTTP status
    it mapped to before (this pre-existing, unmodified test).
  fails_when: statusForError(new CaseVersionNotValidError(...)) stops returning 409.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotReleasableError to 422
  proves: src/errors/status-map.ts is unchanged and still maps CaseVersionNotReleasableError to the HTTP
    status it mapped to before (this pre-existing, unmodified test).
  fails_when: statusForError(new CaseVersionNotReleasableError(...)) stops returning 422.
not_applicable:
- edge_case: A dependency that fails or answers slowly
  why: no dependency call was added, removed or changed by this task; the four edited files are a constructor
    template and pure string-building functions that neither call nor depend on I/O.
- edge_case: Two operations against one subject at once
  why: no concurrency-sensitive state was touched; translating literal strings introduces or removes no
    race, and the classes involved carry no mutable shared state.
- edge_case: A boundary at each end of a stated range, or a payload above a configured size limit
  why: none of this task's criteria state a numeric, size or pagination range; they state language and
    vocabulary requirements over fixed-shape messages.
- edge_case: An operation attempted against state that forbids it
  why: this task's files and criteria exclude the classes that answer that condition (CaseVersionNotDraftAtReleaseError,
    CaseVersionNotDraftError); their refusal condition and wording are untouched by this delivery.
untested:
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese -- its fact is system-wide
  (every domain refusal the status map names). This task advances only two of roughly forty mapped classes;
  IncoherentCaseError, InvalidCaseDocumentError and the great majority of the status map's roster remain
  in English, by this task's own disclosed scope. No test in this tree can assert the node's fact holds
  whole without misrepresenting what this delivery covers.
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word -- same system-wide
  scope; the glossary/capability-vocabulary nouns that validate-case-coherence.ts's violation strings
  name are explicitly left untranslated by this task's own scope decision, so the node's fact does not
  hold system-wide and is not decided by a task-scoped test.
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so -- as coded, release.operation.ts
  only constructs CaseVersionNotReleasableError when violations.length > 0; the node's own 'no rule specifically
  violated' branch is unreachable through the real release() path and is exercisable only by constructing
  the error class directly, so no single test exercises both halves of the node's stated behavior as one
  coherent scenario of release.
- Criterion 'No message and no violation string states a fact its English original did not state...' compares
  the delivered PT-br text against a prior English text no longer present in the working tree; a runtime
  test has no access to the pre-translation source to compare against.
- Criterion 'The suite under src/src/__tests__ passes...and no other change to any test file' is a claim
  about which files this delivery touched and about a whole test run's outcome; neither is decidable by
  a Vitest test asserting about its own behavior.
- The implementation record's inference that stateProblems()'s invalid-state message translates the document
  schema's accepted literal enum tokens draft/released into rascunho/liberada -- not pinned by any test
  here.
- The implementation record's inference that 'slug' is left untranslated ('o slug') in parse-case-document.ts's
  violation strings -- not pinned by any test here.
- The implementation record's inference that consolidation_register's accepted literal values (formal/plain)
  are left untranslated -- not pinned by any test here.
- The implementation record's inference about the free Portuguese wording chosen for domain nouns the
  vocabulary constraint does not fix -- not pinned by any test here.
---
## What it is
Unit tests proving CaseVersionNotValidError's and CaseVersionNotReleasableError's PT-br messages,
their shared shape, their preserved name/context/status mapping, and a sample of the structural and
release-only violation strings they interpolate.

## Notes
Four criteria and three implemented nodes are recorded under `untested` rather than approximated by
a test, because none is decidable by a Vitest assertion within this file set: two constraints are
system-wide facts this one task only partially advances, one rule's second branch is unreachable
through the real release() path, and the remaining items compare against a prior English source no
longer in the working tree or are claims about the whole test run rather than about behavior.
