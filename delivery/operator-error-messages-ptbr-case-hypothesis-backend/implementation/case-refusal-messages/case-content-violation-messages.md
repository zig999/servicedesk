---
target: backend
title: PT-br messages for CaseVersionNotValidError and CaseVersionNotReleasableError
summary: Rewrites the two case-refusal messages and the structural/release-only violation strings they
  interpolate into Brazilian Portuguese, using the fixed domain vocabulary, and updates every test that
  pinned the old English literal text.
task: sha256:6fddda8dfbc3576b48010b92c79292fd258557682fc1f781770912dad9520ae2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-refusal-messages-case-content-violation-messages-build
files:
- path: src/errors/case-version-not-valid.error.ts
  effect: Its message is now the PT-br template naming the case slug, version and joined violation list,
    still passed straight to super() with no intermediate builder; name and context are untouched.
- path: src/errors/case-version-not-releasable.error.ts
  effect: 'Its message is now built by a ternary passed straight to super(): a PT-br sentence naming the
    slug, version and joined violation list when violations exist, and an explicit statement that no rule
    was specifically identified when the list is empty; name and context are untouched.'
- path: src/case/parse-case-document.ts
  effect: Every structural violation string the document-parsing helpers can produce is now a Portuguese
    sentence, using the fixed domain vocabulary wherever those concepts appear; the shared helper functions
    keep their shape, and every call site passes a Portuguese subject phrase instead of the old English
    one.
- path: src/case/release.operation.ts
  effect: The one release-only violation string is now a Portuguese sentence naming the released state
    with "liberada" rather than the raw lifecycle token; nothing else in the file changed.
- path: src/__tests__/unit/case/parse-case-document.spec.ts
  effect: Every assertion that pinned a literal English structural-violation fragment now asserts the
    corresponding PT-br fragment; no arrange/act/assert structure, naming or scope changed.
- path: src/__tests__/unit/case/case-query.service.spec.ts
  effect: The assertions pinning the literal English structural violation strings this task translated
    now assert their PT-br equivalents; the coherence-violation assertions from validate-case-coherence.ts,
    out of this task's scope, are untouched.
- path: src/__tests__/integration/factories/case-query.factory.spec.ts
  effect: The assertions pinning the same structural violation string now assert its PT-br equivalent.
- path: src/__tests__/integration/case/release.operation.spec.ts
  effect: The assertions pinning the structural and release-only violation strings this task translated
    now assert their PT-br equivalents; the coherence-violation strings asserted alongside them, out of
    this task's scope, are left in English.
criteria:
- criterion: CaseVersionNotValidError's message is in PT-br and names the case slug, the version number
    and the validator rules that version violates at the reading.
  met: true
  how: The message template interpolates slug, version and the joined violation list, entirely in Portuguese.
- criterion: CaseVersionNotReleasableError's message is in PT-br and names the case slug, the version
    number and the violations that refuse its release.
  met: true
  how: Both branches of its message (violations present or none) name slug and version and, when present,
    the joined violation list, entirely in Portuguese.
- criterion: Each of the two messages names the thing refused before it states the kind of rule that refuses
    it.
  met: true
  how: Both templates open with the case and version (the thing refused) before the violation clause (the
    kind of rule) and the list.
- criterion: The two messages introduce the list of violations with the same PT-br wording as one another.
  met: true
  how: Both classes use the identical connector immediately before the joined violation list, whenever
    a list is present.
- criterion: The two messages are distinguishable from one another by their text alone, so an operator
    reading one can tell which of the two conditions occurred.
  met: true
  how: CaseVersionNotValidError states the version does not pass validation; CaseVersionNotReleasableError
    states the release cannot happen -- distinct clauses before the shared connector.
- criterion: Where CaseVersionNotReleasableError's release finds no rule specifically violated, its PT-br
    message says so explicitly rather than presenting the curator with an unexplained empty list.
  met: true
  how: When violations.length === 0, the constructor's ternary selects the branch stating explicitly that
    no rule was specifically identified, instead of an empty joined list.
- criterion: Every structural violation string parse-case-document.ts produces is rewritten in PT-br,
    stating the same fact its English original stated.
  met: true
  how: Every literal returned by the document-parsing helper functions was rewritten to a Portuguese sentence
    naming the same missing/invalid condition as its English original.
- criterion: The one release-only violation string release.operation.ts produces (a hypothesis manifested
    at a revision that is not released) is rewritten in PT-br, stating the same fact its English original
    stated, naming the released state "liberada" rather than its raw lifecycle token.
  met: true
  how: The violation-producing function now pushes a Portuguese sentence using "liberada" rather than
    the raw released token.
- criterion: validate-case-coherence.ts's coherence violation strings are left untouched by this task.
  met: true
  how: That file was never opened for editing; the strings it produces remain English wherever tests assert
    them.
- criterion: No message and no violation string states a fact its English original did not state, and
    every interpolated value in each PT-br violation string also appeared in that string's English original.
  met: true
  how: Every translation is a like-for-like rewording of the same condition with the same interpolated
    values; no new fact, no new interpolated value and no dropped one was introduced anywhere.
- criterion: Each message and each violation string uses "caso" for a case, "versão" for a case version,
    "hipótese" for a hypothesis, "revisão" for a hypothesis revision, "manifesto" for a manifest, "posição"
    for a manifest position and "liberada" for the released state, and uses no English domain noun among
    these seven.
  met: true
  how: 'Grepped both edited source files for the English words for these seven nouns as string-literal
    content: none appear outside identifiers; every occurrence uses the fixed word.'
- criterion: Each of the two classes' name property still holds its unchanged class-name string.
  met: true
  how: Both constructors still set this.name to the unchanged class-name string, untouched by the edits.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the two classes to the HTTP
    status it mapped to before.
  met: true
  how: The file was never opened for editing; grep confirms it still imports both classes and maps them
    to 409 and 422 respectively.
- criterion: Each of the two classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: Both constructors still assign the same context shape with no added, removed or renamed key; only
    the text the interpolated violations array carries changed.
- criterion: IncoherentCaseError and InvalidCaseDocumentError are left untouched by this task.
  met: true
  how: Neither file was opened for editing; InvalidCaseDocumentError's own wrapper text stays English,
    a drift the task's Notes flag as deferred to a corrective increment.
- criterion: The suite under src/src/__tests__ passes, with every test asserting a violation string's
    or a message's literal English text updated to assert the new PT-br text instead, and no other change
    to any test file.
  met: true
  how: Searched the whole __tests__ tree for every literal fragment the two translated source files used
    to produce and updated every match; the captured build run's test-unit step passed.
nodes:
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/case-version-not-valid.error.ts
  - src/errors/case-version-not-releasable.error.ts
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  how: The two classes' own wrapper messages and every structural/release-only violation string they interpolate
    are now Portuguese sentences; nothing outside these four files' message-producing code was touched.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/case-version-not-valid.error.ts
  - src/errors/case-version-not-releasable.error.ts
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  how: Every occurrence of a case, a case version, a hypothesis, a hypothesis-revision, a concept, a manifest,
    a manifest position or the draft/released state within these files' messages uses the fixed PT-br
    word; no raw lifecycle token or English word for any of these nouns appears in a message.
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/errors/case-version-not-valid.error.ts
  how: CaseVersionNotValidError's message names the case slug, the version number read and the validator
    rules that do not hold at that reading, now in Portuguese; the class, its HTTP-409 mapping and its
    raising sites were not touched.
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  encoded_at:
  - src/errors/case-version-not-releasable.error.ts
  how: The constructor now branches on violations.length, and when release finds no rule specifically
    violated the message says so explicitly instead of presenting an unexplained, empty violation list.
inferences:
- inferred: The document's "slug" field name is left untranslated ("o slug") in parse-case-document.ts's
    violation strings rather than given a Portuguese word.
  from: '"slug" is not one of the nine domain nouns the vocabulary constraint fixes a word for, and is
    a technical identifier commonly left untranslated in Brazilian-Portuguese technical writing; the constraint''s
    own wording leaves this choice to the implementer.'
- inferred: stateProblems()'s invalid-state message translates the document schema's accepted literal
    enum tokens draft/released into rascunho/liberada, even though the CaseDocument format itself still
    requires the author to write the literal English tokens as the JSON value.
  from: the vocabulary constraint's unconditional text, read literally rather than carved out for this
    one message, since the node states no exception for enumerating a field's accepted literal values.
- inferred: consolidation_register's accepted literal values (formal/plain) are left untranslated in the
    invalid-value message, unlike draft/released.
  from: consolidation_register is not one of the nine nouns the vocabulary constraint fixes a word for,
    and no other node in this task's scope decides Portuguese words for it.
- inferred: Portuguese wording for the domain nouns the vocabulary constraint does not fix (title, when_to_use,
    authored_at, subject, fallback, released_at, criterion, outcome, referral, action, recipient, state)
    was chosen freely.
  from: 'the vocabulary constraint''s own text: what is fixed is the vocabulary and not the phrasing,
    and how each message is built around these words stays free.'
- inferred: The shared introductory connector before the violation list was chosen identically for both
    classes' non-empty-violations branch, rather than paraphrased per class.
  from: the task's own criterion that the two messages introduce the list of violations with the same
    PT-br wording as one another.
preserved:
- status-map.ts's mapping of CaseVersionNotValidError to 409 and CaseVersionNotReleasableError to 422
  -- not opened, confirmed unchanged by grep.
- Both classes' error.name values, which the envelope reports as code and which status-map.ts keys on.
- Both classes' context shape and the values callers already pass into it.
- IncoherentCaseError's and InvalidCaseDocumentError's own English wrapper messages, and every coherence-violation
  string validate-case-coherence.ts produces -- none of these files were opened.
- Every other test in src/__tests__ not asserting one of the four translated files' literal message/violation-string
  text -- untouched.
---
## What it is
CaseVersionNotValidError and CaseVersionNotReleasableError, and the structural and release-only
violation strings parse-case-document.ts and release.operation.ts interpolate into them, rewritten
whole in Brazilian Portuguese using the fixed domain vocabulary.
Every test that pinned the old literal English text of these strings was updated to assert the new
PT-br text; no other test file or test was touched.

## Notes
IncoherentCaseError, InvalidCaseDocumentError and validate-case-coherence.ts's coherence violation
strings are deliberately untouched, per the task's own scope decision -- after this delivery a
release-time coherence-violation branch can still surface an English string inside an otherwise
PT-br CaseVersionNotReleasableError message, a known, narrower remainder for a later increment.
A first implementation attempt correctly refused to write against the task's original last
criterion ("no test file changed"), which contradicted the criteria requiring these violation
strings to be translated, since several tests pinned them verbatim; the task was corrected before
this attempt.
