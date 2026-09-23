---
contract_version: siegard-reconcile/5
title: PT-br translation of case and hypothesis domain refusal messages
summary: Six tasks translated the case- and hypothesis-domain refusal messages (and the violation strings
  they compose) from English to Brazilian Portuguese, fixed nine domain nouns to one Portuguese word each,
  corrected two message claims found to overstate or misattribute their fact, and updated every test asserting
  the prior English literal text to assert the new Portuguese text instead. IncoherentCaseError, InvalidCaseDocumentError
  and validate-case-coherence.ts's coherence-violation strings were deliberately excluded from this initiative's
  scope.
target: backend
files:
- path: src/__tests__/integration/case/release.operation.spec.ts
  change: Assertions updated to expect the manifest-own-state violation string in Brazilian Portuguese;
    coherence-violation assertions remain in English pending a future translation of validate-case-coherence.ts.
- path: src/__tests__/integration/factories/case-query.factory.spec.ts
  change: Assertion updated to expect the structural violation string ('o caso não declara nenhuma hipótese')
    in its new Brazilian-Portuguese text.
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: Assertions updated to expect CaseVersionNotValidError's structural-violation text in Brazilian
    Portuguese; its coherence-violation assertions remain in English pending a future translation of validate-case-coherence.ts.
- path: src/__tests__/unit/case/parse-case-document.spec.ts
  change: Assertions updated to expect every structural violation string in its new Brazilian-Portuguese
    text.
- path: src/__tests__/unit/case/release.operation.spec.ts
  change: Assertions updated to expect the manifest-own-state violation string in its new Brazilian-Portuguese
    text, naming the released state 'liberada'.
- path: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-not-found.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-not-released.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/incoherent-case.error.spec.ts
  change: Assertion added confirming IncoherentCaseError's message stays in English, deliberately untouched
    by this initiative.
- path: src/__tests__/unit/errors/invalid-case-document.error.spec.ts
  change: Assertion added confirming InvalidCaseDocumentError's message stays in English, deliberately
    untouched by this initiative.
- path: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  change: Assertions updated to expect the class's new Brazilian-Portuguese message and fixed vocabulary,
    in place of the prior English text.
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  change: Assertions updated to expect HypothesisRevisionNotDraftAtReleaseError's and other translated
    classes' new Brazilian-Portuguese messages through the shared error-handler envelope.
- path: src/case/parse-case-document.ts
  change: Every structural violation string this module produces is rewritten to Brazilian Portuguese,
    stating the same fact each English original stated.
- path: src/case/release.operation.ts
  change: The release-only manifest-own-state violation string this module produces is rewritten to Brazilian
    Portuguese, naming the released state as 'liberada'.
- path: src/errors/case-already-has-draft.error.ts
  change: CaseAlreadyHasDraftError's message rewritten to Brazilian Portuguese, naming the case with the
    fixed word 'caso' and the draft state with 'rascunho'.
- path: src/errors/case-holds-no-draft.error.ts
  change: CaseHoldsNoDraftError's message rewritten to Brazilian Portuguese, naming the case as 'caso',
    the version as 'versão' and the draft state as 'rascunho'.
- path: src/errors/case-not-found.error.ts
  change: CaseNotFoundError's message rewritten to Brazilian Portuguese, naming the case as 'caso' and
    the version as 'versão'.
- path: src/errors/case-version-already-stored.error.ts
  change: CaseVersionAlreadyStoredError's message rewritten to Brazilian Portuguese and its claim narrowed
    to state a version is never recreated by a new write, without claiming its content is never altered.
- path: src/errors/case-version-not-draft-at-release.error.ts
  change: CaseVersionNotDraftAtReleaseError's message rewritten to Brazilian Portuguese, interpolating
    the raw internal lifecycle state token unchanged.
- path: src/errors/case-version-not-draft.error.ts
  change: CaseVersionNotDraftError's message rewritten to Brazilian Portuguese, interpolating the raw
    internal lifecycle state token unchanged.
- path: src/errors/case-version-not-releasable.error.ts
  change: CaseVersionNotReleasableError's message rewritten to Brazilian Portuguese, and its no-violation
    branch now states explicitly that no rule was specifically identified as violated.
- path: src/errors/case-version-not-released.error.ts
  change: CaseVersionNotReleasedError's message rewritten to Brazilian Portuguese, interpolating the raw
    internal lifecycle state token unchanged.
- path: src/errors/case-version-not-valid.error.ts
  change: CaseVersionNotValidError's message rewritten to Brazilian Portuguese, joining structural and
    coherence violation strings with the fixed 'violando as seguintes regras' wording.
- path: src/errors/concept-not-in-glossary.error.ts
  change: ConceptNotInGlossaryError's message rewritten to Brazilian Portuguese, naming the hypothesis,
    case and concept with the fixed words.
- path: src/errors/concept-refuses-subject-type.error.ts
  change: ConceptRefusesSubjectTypeError's message rewritten to Brazilian Portuguese, naming the hypothesis,
    case, subject type and concepts with the fixed words.
- path: src/errors/hypothesis-not-in-manifest.error.ts
  change: HypothesisNotInManifestError's message rewritten to Brazilian Portuguese, naming the hypothesis,
    case and version with the fixed words.
- path: src/errors/hypothesis-revision-collects-no-concept.error.ts
  change: HypothesisRevisionCollectsNoConceptError's message rewritten to Brazilian Portuguese, naming
    the hypothesis and case with the fixed words.
- path: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  change: HypothesisRevisionNotDraftAtReleaseError's fixed message rewritten to Brazilian Portuguese,
    still taking no constructor argument.
- path: src/errors/manifest-position-occupied.error.ts
  change: ManifestPositionOccupiedError's message rewritten to Brazilian Portuguese, naming the case,
    version and position with the fixed words.
- path: src/errors/manifest-would-hold-no-hypothesis.error.ts
  change: ManifestWouldHoldNoHypothesisError's message rewritten to Brazilian Portuguese, naming the case
    and version with the fixed words.
- path: src/errors/released-hypothesis-revision-not-alterable.error.ts
  change: ReleasedHypothesisRevisionNotAlterableError's message rewritten to Brazilian Portuguese, now
    grounding the immutability in the revision's own released state rather than in a referencing case
    version.
nodes:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  conforms: false
  how: 'src/__tests__/integration/case/release.operation.spec.ts, the same context.violations expectation:
    `the concept "${vocabulary.concept}" does not accept the subject type "${vocabulary.subjectType}"
    the case declares`, — The noun fixed as conceito is asserted by its English word concept instead,
    inside the same array that elsewhere carries hipótese/liberada.

    src/__tests__/unit/case/case-query.service.spec.ts, the same context.violations assertions: violations:
    [`the concept "${CONCEPT}" does not exist in the glossary`], — Fixes ''concept'' in English where
    the vocabulary rule reserves ''conceito'' for this noun, producing an inconsistency with sibling refusals
    (ConceptNotInGlossaryError etc.) that already say conceito.

    src/__tests__/unit/errors/case-already-has-draft.error.spec.ts, line 9, first it block: expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(''rascunho''));
    — Pins a specific word order the governing node''s own Description leaves free.

    src/__tests__/unit/errors/case-already-has-draft.error.spec.ts, lines 22-23, second it block: expect(error.message).toMatch(/j[áa]
    possui/i);

    expect(error.message).toMatch(/no m[áa]ximo/i); — Fixes exact grammatical phrasing beyond the nine
    fixed nouns; the node''s Description leaves such phrasing free.

    src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts, the first it block, line 9: expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(''rascunho''));
    — Pins a specific word order the governing constraint explicitly leaves unfixed.

    src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts, the second it block, lines 23-24: expect(error.message).toMatch(/n[ãa]o
    possui nenhuma/i);

    expect(error.message).toMatch(/revisada/i); — Pins one specific phrasing choice as a hard requirement
    beyond the nine fixed nouns; the node''s own Description leaves such phrasing free.

    src/__tests__/unit/errors/case-version-already-stored.error.spec.ts, lines 48-60, cross-error wording-match
    it block: expect(alreadyStored.message).toContain(''o caso "a-slug"'');

    expect(notFound.message).toContain(''o caso "a-slug"'');

    expect(alreadyStored.message).toContain(''a versão 3 armazenada'');

    expect(notFound.message).toContain(''a versão 3 armazenada''); — Pins CaseVersionAlreadyStoredError''s
    message to share an exact phrase template with CaseNotFoundError''s, including the word armazenada,
    which is not one of the nine fixed words. The node''s own Description leaves phrasing free to be reworded.

    src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts, the second test ("names
    the case slug, the version number and the state the version is in..."), lines 17-21: const error =
    new CaseVersionNotDraftAtReleaseError(''cliente-sem-internet'', 4, ''released'');

    expect(error.message).toContain(''cliente-sem-internet'');

    expect(error.message).toContain(''4'');

    expect(error.message).toContain(''released''); — The test locks in, as a passing requirement, that
    the operator-facing message contains the literal English/internal state token "released" rather than
    the fixed Brazilian-Portuguese word the vocabulary node names for that state. A future change to the
    error class that translates the state into "liberada" would fail this test.

    src/__tests__/unit/errors/case-version-not-draft.error.spec.ts, line 23, inside the second it block
    (lines 15-30): const error = new CaseVersionNotDraftError(''cliente-sem-internet'', 4, ''released'');

    expect(error.message).toContain(''cliente-sem-internet'');

    expect(error.message).toContain(''4'');

    expect(error.message).toContain(''released''); — The test''s own title claims the assertions hold
    in Brazilian Portuguese, yet it locks in a message that carries the raw internal lifecycle token ''released''
    verbatim rather than the fixed word liberada the vocabulary rule requires for that state.

    src/__tests__/unit/errors/case-version-not-released.error.spec.ts, the second test, lines 13-29: const
    error = new CaseVersionNotReleasedError(''cliente-sem-internet'', 4, ''draft'');

    expect(error.message).toContain(''cliente-sem-internet'');

    expect(error.message).toContain(''4'');

    expect(error.message).toContain(''draft''); — The test requires the raw internal state token "draft"
    literally inside the human-facing message, the same failure mode the constraint''s fitness function
    names by that exact word.

    src/errors/case-version-not-draft-at-release.error.ts, the message template passed to super(), line
    6: está no estado "${state}" — The state reaches the operator as the raw internal lifecycle token
    (''draft''/''released'') rather than the fixed word (rascunho/liberada) the vocabulary constraint
    names.

    src/errors/case-version-not-draft.error.ts, line 5, the message template built in the constructor:
    super(`o caso "${slug}" na versão ${version} está no estado "${state}", e não em rascunho`); — The
    raw internal lifecycle token (e.g. ''released'') is interpolated straight into the message in place
    of the fixed word (liberada) the vocabulary constraint reserves for it.

    src/errors/case-version-not-released.error.ts, the message template literal in the constructor''s
    super(...) call: o caso "${slug}" na versão ${version} está no estado "${state}", e o diagnóstico
    só é executado contra uma versão liberada — state carries the raw internal lifecycle token (''draft''/''released'');
    for the only state this error is ever constructed for (draft), the refusal reads está no estado "draft"
    rather than the fixed word rascunho.'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-not-found.error.ts
  - src/errors/case-version-already-stored.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-releasable.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-valid.error.ts
  - src/errors/concept-not-in-glossary.error.ts
  - src/errors/concept-refuses-subject-type.error.ts
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/manifest-position-occupied.error.ts
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  conforms: false
  how: "src/__tests__/integration/case/release.operation.spec.ts, the context.violations expectation in\
    \ the both-rules-violated tests, lines 252-255 and 463-466: expect((refusal as CaseVersionNotReleasableError).context.violations).toEqual([\n\
    \      `the concept \"${vocabulary.concept}\" does not accept the subject type \"${vocabulary.subjectType}\"\
    \ the case declares`,\n      `no read-only capability currently answers the concept \"${vocabulary.concept}\"\
    `,\n    ]); — These two strings are joined into CaseVersionNotReleasableError's own message; asserting\
    \ them in English locks this refusal to part-Portuguese, part-English text.\nsrc/__tests__/unit/case/case-query.service.spec.ts,\
    \ context.violations assertions on CaseVersionNotValidError, lines 519-523, 536-539, 739-743: expect((refusal\
    \ as CaseVersionNotValidError).context).toEqual({\n  slug: SLUG,\n  version,\n  violations: [`the\
    \ concept \"${CONCEPT}\" does not exist in the glossary`],\n}); — CaseVersionNotValidError joins violations\
    \ into a fixed PT-br frame; this test fixes the expected violations entries in English, locking in\
    \ a refusal whose message mixes Portuguese framing with an English clause.\nsrc/__tests__/unit/http/error-handler.middleware.spec.ts,\
    \ the OpenApiDocumentNotFetchedError it block, lines 104-119: expect(response.json()).toEqual({\n\
    \  error: {\n    code: 'OpenApiDocumentNotFetchedError',\n    message: 'the OpenAPI document link\
    \ \"https://api.example.com/openapi.json\" could not be fetched: the link answered HTTP 404',\n  \
    \  details: { link: 'https://api.example.com/openapi.json', kind: 'status-outside-2xx', status: 404\
    \ },\n  },\n}); — Pins OpenApiDocumentNotFetchedError's message to fixed English text as correct behavior;\
    \ the Brazilian-Portuguese constraint is stated system-wide so no error class picks its own language,\
    \ and this test actively defends the drift the constraint forbids.\nsrc/errors/case-version-not-draft-at-release.error.ts,\
    \ the message template passed to super(), line 6: está no estado \"${state}\" — The assembled message\
    \ embeds an English word (the raw lifecycle token) inside a sentence this constraint requires wholly\
    \ in Brazilian Portuguese.\nsrc/errors/case-version-not-released.error.ts, the message template literal\
    \ in the constructor's super(...) call: o caso \"${slug}\" na versão ${version} está no estado \"\
    ${state}\", e o diagnóstico só é executado contra uma versão liberada — The estado clause carries\
    \ an untranslated English token rather than Portuguese prose, for the one case this error is ever\
    \ raised for."
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-not-found.error.ts
  - src/errors/case-version-already-stored.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-releasable.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/case-version-not-valid.error.ts
  - src/errors/concept-not-in-glossary.error.ts
  - src/errors/concept-refuses-subject-type.error.ts
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/manifest-position-occupied.error.ts
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: false
  how: 'no named file holds this fact now: src/case/release.operation.ts read `nowhere` — no reference
    to this node''s fact appears in the file'
  observed_at:
  - src/case/release.operation.ts
- node: contracts/knowledge/case-lifecycle
  conforms: false
  how: "src/case/release.operation.ts, releaseViolations -- the if (structural.kind === 'invalid') branch\
    \ that returns early: const structural = structuralOutcome(assembled);\nif (structural.kind === 'invalid')\
    \ {\n  return structural.problems;\n}\nreturn [\n  ...(await caseCoherenceViolations(structural.theCase,\
    \ sources.glossary, sources.capabilities)),\n  ...(await manifestOwnStateViolations(assembled, sources.hypothesisRevisions)),\n\
    ]; — When a draft fails a structural rule AND manifests an entry referencing a draft hypothesis-revision,\
    \ the release refusal names only the structural problems -- manifestOwnStateViolations never runs\
    \ in this branch even though it depends only on assembled. One refusal the spec says should be whole\
    \ comes back split into two successive ones."
  observed_at:
  - src/case/release.operation.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'src/case/parse-case-document.ts: held at parseCaseDocument, the structural gate an authored case
    document is held against — parseCaseDocument, the structural gate an authored case document is held
    against

    src/case/release.operation.ts: held at release()/releaseViolations() throwing once with accumulated
    violations — release()/releaseViolations() throwing once with accumulated violations

    src/errors/case-not-found.error.ts: held at the class declaration, as one refusal of the case-authoring
    surface''s read path — the class declaration, as one refusal of the case-authoring surface''s read
    path'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-not-found.error.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/case/parse-case-document.ts: held at the slug field carried through CaseDocument and validated
    by documentProblems — the slug field carried through CaseDocument and validated by documentProblems

    src/errors/case-already-has-draft.error.ts: held at the context field, carrying the case''s own slug
    attribute — the context field, carrying the case''s own slug attribute

    src/errors/case-holds-no-draft.error.ts: held at the constructor parameter and context property carrying
    the case''s slug — the constructor parameter and context property carrying the case''s slug

    src/errors/case-version-not-draft-at-release.error.ts: held at the slug constructor parameter and
    context.slug field — the slug constructor parameter and context.slug field

    src/errors/case-version-not-draft.error.ts: held at the slug field of context, and the word caso in
    the message — the slug field of context, and the word caso in the message

    src/errors/case-version-not-released.error.ts: held at the slug parameter and context.slug field —
    the slug parameter and context.slug field

    src/errors/released-hypothesis-revision-not-alterable.error.ts: held at the slug field of context
    and constructor parameter — the slug field of context and constructor parameter'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: domain/knowledge/case-version
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/parse-case-document.ts, src/case/release.operation.ts,
    src/errors/case-version-not-draft-at-release.error.ts, src/errors/case-version-not-draft.error.ts,
    src/errors/case-version-not-released.error.ts, and src/errors/case-already-has-draft.error.ts read
    `nowhere` — no reference to this node''s fact appears in the file; src/errors/case-holds-no-draft.error.ts
    read `nowhere` — no reference to this node''s fact appears in the file — a binding asserts the file
    answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never
    restamped here'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-already-has-draft.error.ts
  - src/errors/case-holds-no-draft.error.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/case/parse-case-document.ts: held at stateProblems and isCaseVersionState — stateProblems
    and isCaseVersionState'
  encoded_at:
  - src/case/parse-case-document.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: 'src/case/parse-case-document.ts: held at consolidationRegisterProblems and isConsolidationRegister
    — consolidationRegisterProblems and isConsolidationRegister'
  encoded_at:
  - src/case/parse-case-document.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/case/parse-case-document.ts: held at flatHypothesisOf, carrying only name/criterion/collects/resolution
    — flatHypothesisOf, carrying only name/criterion/collects/resolution

    src/errors/released-hypothesis-revision-not-alterable.error.ts: held at the hypothesis_name field
    of context and constructor parameter — the hypothesis_name field of context and constructor parameter'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/case/parse-case-document.ts: held at heldHypothesisRevision, carrying revision, criterion,
    collects and resolution — heldHypothesisRevision, carrying revision, criterion, collects and resolution

    src/errors/hypothesis-revision-not-draft-at-release.error.ts: held at the class name assignment and
    message, naming the hypothesis-revision as revisão — the class name assignment and message, naming
    the hypothesis-revision as revisão

    src/errors/released-hypothesis-revision-not-alterable.error.ts: held at the revision field of context
    and constructor parameter — the revision field of context and constructor parameter'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/case/parse-case-document.ts: held at heldManifestEntry, pairing a position with one hypothesis-revision
    — heldManifestEntry, pairing a position with one hypothesis-revision

    src/case/release.operation.ts: held at manifestOwnStateViolations and assembledAsDocument''s manifest
    mapping — manifestOwnStateViolations and assembledAsDocument''s manifest mapping'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'src/case/parse-case-document.ts: held at referralProblems and heldResolution''s referral construction
    — referralProblems and heldResolution''s referral construction'
  encoded_at:
  - src/case/parse-case-document.ts
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/case/parse-case-document.ts: held at resolutionProblems and heldResolution, pairing outcome
    with referral — resolutionProblems and heldResolution, pairing outcome with referral'
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/hypothesis-not-in-manifest.error.ts: held at the HypothesisNotInManifestError class
    itself -- its name, message and context — the HypothesisNotInManifestError class itself -- its name,
    message and context'
  encoded_at:
  - src/errors/hypothesis-not-in-manifest.error.ts
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  conforms: true
  how: 'src/errors/case-version-not-released.error.ts: held at the class itself and its message — the
    class itself and its message'
  encoded_at:
  - src/errors/case-version-not-released.error.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: 'src/case/parse-case-document.ts: held at manifestProblems, refusing an absent or empty manifest
    — manifestProblems, refusing an absent or empty manifest

    src/errors/manifest-would-hold-no-hypothesis.error.ts: held at the class declaration and the message
    it throws — the class declaration and the message it throws'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/errors/case-already-has-draft.error.ts: held at the class identity and its message, lines
    1 and 5-6 — the class identity and its message, lines 1 and 5-6'
  encoded_at:
  - src/errors/case-already-has-draft.error.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: true
  how: 'src/errors/case-not-found.error.ts: held at the constructor: error name and context, carrying
    the named slug and version — the constructor: error name and context, carrying the named slug and
    version'
  encoded_at:
  - src/errors/case-not-found.error.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/case-version-not-valid.error.ts: held at the class name and the constructor''s message/context
    — the class name and the constructor''s message/context'
  encoded_at:
  - src/errors/case-version-not-valid.error.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: false
  how: 'no named file holds this fact now: src/errors/case-version-not-draft.error.ts read `nowhere` —
    no reference to this node''s fact appears in the file'
  observed_at:
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/case/release.operation.ts: held at refuseNonDraft — refuseNonDraft

    src/errors/case-version-not-draft-at-release.error.ts: held at the whole class -- its name, message
    and context object — the whole class -- its name, message and context object

    src/errors/case-version-not-draft.error.ts: held at the class name and the context shape — the class
    name and the context shape'
  encoded_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused
  conforms: true
  how: 'src/errors/case-version-already-stored.error.ts: held at the class declaration, its name assignment
    and its message, lines 1-9 — the class declaration, its name assignment and its message, lines 1-9'
  encoded_at:
  - src/errors/case-version-already-stored.error.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/concept-refuses-subject-type.error.ts: held at the ConceptRefusesSubjectTypeError class
    itself -- its name and its message — the ConceptRefusesSubjectTypeError class itself -- its name and
    its message'
  encoded_at:
  - src/errors/concept-refuses-subject-type.error.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/case/parse-case-document.ts: held at collectsProblems, refusing an absent or empty collects
    list — collectsProblems, refusing an absent or empty collects list

    src/errors/hypothesis-revision-collects-no-concept.error.ts: held at the class name (line 1) and the
    message it constructs (line 6) — the class name (line 1) and the message it constructs (line 6)'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: 'src/case/parse-case-document.ts: held at manifestEntryProblems'' criterion check — manifestEntryProblems''
    criterion check'
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/case-holds-no-draft.error.ts: held at the whole class -- its name and its constructed
    message — the whole class -- its name and its constructed message'
  encoded_at:
  - src/errors/case-holds-no-draft.error.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/case/parse-case-document.ts: held at sharedHypothesisProblems — sharedHypothesisProblems'
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: 'src/case/parse-case-document.ts: held at sharedPositionProblems — sharedPositionProblems

    src/errors/manifest-position-occupied.error.ts: held at the class declaration and its name assignment
    — the class declaration and its name assignment'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/errors/manifest-position-occupied.error.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts: held at the
    four it blocks (lines 7-36) — the four it blocks (lines 7-36)

    src/__tests__/unit/http/error-handler.middleware.spec.ts: held at the it block at lines 86-102 — the
    it block at lines 86-102

    src/errors/hypothesis-revision-not-draft-at-release.error.ts: held at the whole class body -- no fields
    beyond message and name, matching ''carrying no further value'' — the whole class body -- no fields
    beyond message and name, matching ''carrying no further value'''
  encoded_at:
  - src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
  - src/__tests__/unit/http/error-handler.middleware.spec.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: 'src/case/release.operation.ts: held at the throw of CaseVersionNotReleasableError with slug, version
    and violations — the throw of CaseVersionNotReleasableError with slug, version and violations

    src/errors/case-version-not-releasable.error.ts: held at the ternary passed to super(), selecting
    between the two message branches on violations.length > 0 — the ternary passed to super(), selecting
    between the two message branches on violations.length > 0'
  encoded_at:
  - src/case/release.operation.ts
  - src/errors/case-version-not-releasable.error.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/case/release.operation.ts: held at manifestOwnStateViolations — manifestOwnStateViolations'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/errors/released-hypothesis-revision-not-alterable.error.ts: held at the class name and constructor
    message — the class name and constructor message'
  encoded_at:
  - src/errors/released-hypothesis-revision-not-alterable.error.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/parse-case-document.ts read `nowhere` — no reference
    to this node''s fact appears in the file; src/case/release.operation.ts read `nowhere` — no reference
    to this node''s fact appears in the file'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/concept-not-in-glossary.error.ts: held at the whole class: its name assignment and
    its constructor — the whole class: its name assignment and its constructor'
  encoded_at:
  - src/errors/concept-not-in-glossary.error.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'src/case/parse-case-document.ts: held at resolutionProblems, run over both the fallback and every
    manifest entry''s resolution — resolutionProblems, run over both the fallback and every manifest entry''s
    resolution'
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/case/parse-case-document.ts: held at heldManifestEntry, carrying each entry''s own declared
    position through unchanged — heldManifestEntry, carrying each entry''s own declared position through
    unchanged'
  encoded_at:
  - src/case/parse-case-document.ts
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: false
  how: 'no named file holds this fact now: src/errors/case-version-not-draft.error.ts read `nowhere` —
    no reference to this node''s fact appears in the file'
  observed_at:
  - src/errors/case-version-not-draft.error.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/release.operation.ts: held at release() passing this.capabilities fresh into releaseViolations
    on every call — release() passing this.capabilities fresh into releaseViolations on every call'
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'src/case/parse-case-document.ts: held at refuseStructuralViolations/documentProblems — refuseStructuralViolations/documentProblems

    src/case/release.operation.ts: held at releaseViolations/structuralOutcome, invoked fresh at each
    release() call — releaseViolations/structuralOutcome, invoked fresh at each release() call'
  encoded_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  conforms: true
  how: 'src/errors/case-version-not-released.error.ts: held at the error message, stating diagnosis runs
    only against a released version — the error message, stating diagnosis runs only against a released
    version'
  encoded_at:
  - src/errors/case-version-not-released.error.ts
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/case/release.operation.ts: held at manifestOwnStateViolations naming the offending hypothesis
    — manifestOwnStateViolations naming the offending hypothesis'
  encoded_at:
  - src/case/release.operation.ts
unstated:
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  where: line 18, second it block
  evidence: expect(error.message).toContain('cliente-sem-internet');
  cost: 'rules/knowledge/a-case-has-at-most-one-draft states only the status and error name for this refusal;
    nothing about message content. The decision log confirms the decided scope was narrower: status+name
    only.'
- file: src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
  where: line 39, fourth it block
  evidence: 'expect(error.context).toEqual({ slug: ''a-slug'' });'
  cost: No node or decision-log entry settles what CaseAlreadyHasDraftError's context carries; decided
    scope was status+name only.
- file: src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
  where: the fourth test, "carries exactly the slug, hypothesis name, subject and concepts in context...",
    lines 44-58 (paired with the message asserted in the first test, lines 4-15)
  evidence: "expect(error.context).toEqual({\n    slug: 'a-slug',\n    hypothesis_name: 'a-hypothesis',\n\
    \    subject: 'customer',\n    concepts: ['equipment-state'],\n  });"
  cost: rules/knowledge/a-concept-accepts-the-declared-subject-type says only that the refusal is raised;
    it carries no clause naming what the refusal discloses, unlike its siblings. This test fixes, as fact,
    which values are disclosed -- a decision of what the curator is told, surviving only in this test
    and the error class.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  where: lines 33-37, the fourth it block
  evidence: 'expect(error.context).toEqual({ slug: ''orion-9'', version: 4, position: 2 });'
  cost: No node governs this refusal's context payload shape at all.
- file: src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
  where: lines 4-10, the first it block
  evidence: "const error = new ManifestPositionOccupiedError('orion-9', 4, 2);\nexpect(error.message).toBe(\n\
    \  'o caso \"orion-9\" versão 4 já tem uma hipótese na posição 2, e uma posição do manifesto é única\
    \ dentro da sua versão do caso',\n);"
  cost: rules/knowledge/a-hypothesis-position-is-unique-within-its-case says only that the refusal reports
    ManifestPositionOccupiedError -- it never states the message names the case slug, version number and
    occupied position, unlike sibling rules that state their disclosure explicitly.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  where: the first it block, lines 4-9
  evidence: expect(error.message).toBe('remover esta entrada deixaria o manifesto do caso "orion-9" versão
    4 sem nenhuma hipótese, e o manifesto de uma versão do caso declara ao menos uma entrada');
  cost: rules/knowledge/a-case-has-at-least-one-hypothesis says only that removal is refused with 422
    reporting ManifestWouldHoldNoHypothesisError; it says nothing about what the message discloses.
- file: src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
  where: the last it block, lines 31-35
  evidence: 'expect(error.context).toEqual({ slug: ''orion-9'', version: 4 });'
  cost: No node states the exact context shape for this refusal.
- file: src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
  where: the exact-message assertion (lines 9-13) and the context assertion (lines 53-56)
  evidence: a revisão 3 da hipótese "a-hypothesis" do caso "a-slug" está ela mesma em estado liberada,
    e uma revisão liberada nunca é alterada
  cost: rules/knowledge/a-released-hypothesis-revision-is-never-altered states only the refusal condition
    and status; it says nothing about carried content, unlike its two siblings which each settle this
    explicitly (in opposite directions).
unbound:
- src/__tests__/integration/case/release.operation.spec.ts
- src/__tests__/integration/factories/case-query.factory.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/parse-case-document.spec.ts
- src/__tests__/unit/case/release.operation.spec.ts
- src/__tests__/unit/errors/case-already-has-draft.error.spec.ts
- src/__tests__/unit/errors/case-holds-no-draft.error.spec.ts
- src/__tests__/unit/errors/case-not-found.error.spec.ts
- src/__tests__/unit/errors/case-version-already-stored.error.spec.ts
- src/__tests__/unit/errors/case-version-not-draft-at-release.error.spec.ts
- src/__tests__/unit/errors/case-version-not-draft.error.spec.ts
- src/__tests__/unit/errors/case-version-not-releasable.error.spec.ts
- src/__tests__/unit/errors/case-version-not-released.error.spec.ts
- src/__tests__/unit/errors/case-version-not-valid.error.spec.ts
- src/__tests__/unit/errors/concept-not-in-glossary.error.spec.ts
- src/__tests__/unit/errors/concept-refuses-subject-type.error.spec.ts
- src/__tests__/unit/errors/hypothesis-not-in-manifest.error.spec.ts
- src/__tests__/unit/errors/hypothesis-revision-collects-no-concept.error.spec.ts
- src/__tests__/unit/errors/incoherent-case.error.spec.ts
- src/__tests__/unit/errors/invalid-case-document.error.spec.ts
- src/__tests__/unit/errors/manifest-position-occupied.error.spec.ts
- src/__tests__/unit/errors/manifest-would-hold-no-hypothesis.error.spec.ts
- src/__tests__/unit/errors/released-hypothesis-revision-not-alterable.error.spec.ts
notes: 'Judged by 44 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/operator-error-messages-ptbr-case-hypothesis-backend-review.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese,
  constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word, rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name,
  rules/knowledge/a-release-refusal-with-no-named-violation-says-so, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused,
  rules/knowledge/a-case-version-written-under-an-already-stored-slug-and-version-is-refused, domain/knowledge/case,
  domain/knowledge/case-version, rules/knowledge/a-case-has-at-most-one-draft, rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft,
  rules/knowledge/a-case-version-moves-through-its-declared-lifecycle, rules/investigation/only-a-released-case-version-is-diagnosed,
  rules/knowledge/case-terms-exist-in-the-glossary, rules/knowledge/a-concept-accepts-the-declared-subject-type,
  rules/knowledge/a-hypothesis-collects-at-least-one-concept, rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle,
  rules/knowledge/a-released-hypothesis-revision-is-never-altered, domain/knowledge/hypothesis-revision,
  domain/knowledge/hypothesis, rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused,
  rules/knowledge/a-hypothesis-position-is-unique-within-its-case, rules/knowledge/a-case-has-at-least-one-hypothesis
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 12 opened across 2 of 44 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 8 fact(s) the source states that no node holds, over 5 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/operator-error-messages-ptbr-case-hypothesis-backend-review.returns/`, which are the evidence behind every entry above.
