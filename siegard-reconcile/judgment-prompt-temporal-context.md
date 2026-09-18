---
contract_version: siegard-reconcile/5
title: Judgment prompt observation semantics and temporal context — review
summary: task/judgment-prompt-temporal-context/judgment-prompt-observation-semantics-and-temporal-context
  wrote these six files under the judgment-prompt-temporal-context corrective increment.
target: backend
files:
- path: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  change: Every pre-existing EvidenceItem literal now also carries observed_at and ttl, one fixture was
    compacted to a single-line style to stay under the line-count limit, and 8 tests were added proving
    the new prompt wording and temporal elements.
- path: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  change: Its one EvidenceItem literal now also carries observed_at and ttl.
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  change: Two pre-existing EvidenceItem-shaped expected literals now also carry observed_at and ttl, matching
    what toEvidenceItems() actually produces.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: The system prompt now states that an item's <observation> (a JSON-encoded string to parse) is
    the only evidence, that <fields>/<concept_description>/<capability_payload_notes> are reading aids
    rather than evidence in themselves, that multiple <item>s are judged in complete isolation, and that
    a top-level <current_instant> plus each item's own <observed_at>/<ttl> are recency/staleness context
    and never citable. evaluate() reads new Date().toISOString() fresh on every call and buildUserPrompt
    renders it as a single-line top-level <current_instant> element; itemBlock renders each item's own
    <observed_at> and <ttl>.
- path: src/investigation/hypothesis-evaluator.port.ts
  change: EvidenceItem now carries its own observed_at (UTC instant string) and ttl (seconds, number)
    alongside the fields it already carried, so the port type no longer narrows away what domain/investigation/evidence
    already snapshots per item.
- path: src/investigation/judgment-stage.ts
  change: toEvidenceItems now copies each Evidence item's own observed_at and ttl into the EvidenceItem
    it hands the evaluator, instead of dropping them at the port boundary.
nodes:
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses: a CallPool sized by poolSize gates\
    \ concurrency, and each required hypothesis gets its own judgeOneHypothesis call run under Promise.all\
    \ — const pool = new CallPool(poolSize);\n...\nreturn Promise.all(\n    requiredNames.map((name) =>\n\
    \      judgeOneHypothesis({"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the class declaration and\
    \ its constructor, where the Anthropic SDK is the only LLM client the file imports and it is isolated\
    \ behind the port's own interface — import Anthropic from '@anthropic-ai/sdk';\n...\nexport class\
    \ AnthropicHypothesisEvaluator implements IHypothesisEvaluator {\n  private readonly client: Anthropic;\n\
    src/investigation/hypothesis-evaluator.port.ts: held at the IHypothesisEvaluator interface declaration,\
    \ together with the file's import list carrying no LLM client — export interface IHypothesisEvaluator\
    \ {\n\n  evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n    caseContext:\
    \ CaseContext,\n  ): Promise<EvaluationOutcome>;\n}\nsrc/investigation/judgment-stage.ts: held at\
    \ runIsolatedCall and retryOrFail, which invoke only the injected IHypothesisEvaluator — const first\
    \ = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext),\
    \ deadlineGuard);"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at judgeHypotheses, computing the remaining time from
    the absolute now/deadline instants it received — const deadlineGuard = createDeadlineGuard(Math.max(0,
    deadline - now));'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at buildUserPrompt and fieldElement\
    \ — return [\n  '<judgment_input>',\n  '<criterion>',\n  escapeForXmlText(criterion),\n  '</criterion>',\n\
    \  '<evidence>',\n  evidenceBlock(evidence),\n  '</evidence>',\n  `<current_instant>${escapeForXmlText(currentInstant)}</current_instant>`,\n\
    \  '<case_title>',\n  escapeForXmlText(caseContext.title),\n  '</case_title>',\n  '<case_when_to_use>',\n\
    \  escapeForXmlText(caseContext.whenToUse),\n  '</case_when_to_use>',\n  '</judgment_input>',\n].join('\\\
    n');\n...\nconst typeAttribute = field.type !== undefined ? ` type=\"${escapeForXmlAttribute(field.type)}\"\
    ` : '';\nconst description = field.description !== undefined ? escapeForXmlText(field.description)\
    \ : '';\nsrc/investigation/hypothesis-evaluator.port.ts: held at the evaluate() parameter list and\
    \ the CaseContext type — evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n\
    \    caseContext: CaseContext,\n  ): Promise<EvaluationOutcome>;\n...\nexport type CaseContext = {\n\
    \  readonly title: string;\n  readonly whenToUse: string;\n};\nsrc/investigation/judgment-stage.ts:\
    \ held at toEvidenceItems and the caseContext literal, which admit only the permitted evidence fields\
    \ and only title/whenToUse from the case — return evidence.map((item): EvidenceItem => ({\n    concept:\
    \ item.concept,\n    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n\
    \    concept_description: item.concept_description,\n    capability_payload_notes: item.capability_payload_notes,\n\
    \    observed_at: item.observed_at,\n    ttl: item.ttl,\n  }));\n...\nconst caseContext: CaseContext\
    \ = { title: theCase.title, whenToUse: theCase.when_to_use };"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/integration/capability
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at capabilityPayloadNotesLines,\
    \ and the SYSTEM_PROMPT clause governing capability_payload_notes — function capabilityPayloadNotesLines(capabilityPayloadNotes:\
    \ string): readonly string[] {\n  return capabilityPayloadNotes === ''\n    ? []\n    : [`<capability_payload_notes>${escapeForXmlText(capabilityPayloadNotes)}</capability_payload_notes>`];\n\
    }"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: domain/investigation/citation
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at isCitation and the Citation\
    \ values built in noDataOutcome — function isCitation(value: unknown): value is Citation {\n  return\
    \ isPlainObject(value) && typeof value.concept === 'string' && typeof value.field === 'string';\n\
    }\n...\ncitations: nonOkEvidence.map((item): Citation => ({ concept: item.concept })),\nsrc/investigation/judgment-stage.ts:\
    \ held at noDataEvaluation, constructing concept-only citations for the no-call path — citations:\
    \ nonOkEvidence.map((item): Citation => ({ concept: item.concept })),"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts, the test "attaches the deterministic
    zero-valued usage and elapsed_ms even where a seeded outcome carries no prompt at all, leaving the
    answered outcome without a prompt key of its own" (lines 132–143): fake.seed(A_CRITERION, { verdict:
    ''confirmed'', citations });

    const evaluator = evaluatorOver(fake);


    const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);


    expect(outcome.usage).toEqual(ZEROED_USAGE);

    expect(outcome.elapsed_ms).toBe(ZEROED_ELAPSED_MS);

    expect(outcome).not.toHaveProperty(''prompt''); — A confirmed verdict is a call that happened, and
    this test asserts, as a valid outcome shape, that such a call carries usage and elapsed_ms while lacking
    a prompt entirely. A reader building or reviewing a real IHypothesisEvaluator adapter against this
    port''s own test suite is shown that split as sanctioned, when domain/investigation/evaluation holds
    usage, elapsed_ms and prompt together as one call''s own record, and rules/investigation/a-judgment-failure-records-the-last-call-made
    is built on that trio never separating ("a usage summed across two attempts, paired with one attempt''s
    elapsed_ms and prompt, would describe a call that never happened and leave a reader unable to hold
    the tokens against the prompt shown"). The next implementer has nowhere in this file to learn that
    a completed call without a materialized prompt is not a shape the specification admits.'
  observed_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at the reason literals in noDataEvaluation, deadlineExceededEvaluation,
    judgmentFailureEvaluation, and the pass-through of outcome.reason in asEvaluation — reason: ''no-data'',

    ...

    reason: ''deadline-exceeded''

    ...

    return { hypothesis: name, verdict: ''inconclusive'', reason: ''judgment-failure'', citations: [],
    ...callRecord };'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock — function itemBlock(item:\
    \ EvidenceItem): string {\n  return [\n    `<item concept=\"${escapeForXmlAttribute(item.concept)}\"\
    >`,\n    ...conceptDescriptionLines(item.concept_description),\n    fieldsBlock(item.fields),\n  \
    \  ...capabilityPayloadNotesLines(item.capability_payload_notes),\n    `<observed_at>${escapeForXmlText(item.observed_at)}</observed_at>`,\n\
    \    `<ttl>${item.ttl}</ttl>`,\n    `<observation>${item.result === 'ok' ? escapeForXmlText(item.observation)\
    \ : ''}</observation>`,\n    '</item>',\n  ].join('\\n');\n}\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the EvidenceItem type — export type EvidenceItem = {\n  readonly concept: string;\n  readonly\
    \ fields: readonly FieldSemantics[];\n  readonly concept_description: string;\n  readonly capability_payload_notes:\
    \ string;\n  readonly observed_at: string;\n  readonly ttl: number;\n} & ObservationOutcome;\nsrc/investigation/judgment-stage.ts:\
    \ held at toEvidenceItems, reading each item's own snapshotted concept, fields, concept_description,\
    \ capability_payload_notes, observed_at and ttl — fields: item.fields,\n    concept_description: item.concept_description,\n\
    \    capability_payload_notes: item.capability_payload_notes,\n    observed_at: item.observed_at,\n\
    \    ttl: item.ttl,"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the evaluate method — public\
    \ async evaluate(\n  criterion: string,\n  evidence: readonly EvidenceItem[],\n  caseContext: CaseContext,\n\
    ): Promise<EvaluationOutcome> {\nsrc/investigation/hypothesis-evaluator.port.ts: held at the IHypothesisEvaluator\
    \ interface's evaluate operation — evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n\
    \    caseContext: CaseContext,\n  ): Promise<EvaluationOutcome>;\nsrc/investigation/judgment-stage.ts:\
    \ held at the evaluator.evaluate(...) call sites in runIsolatedCall and retryOrFail — evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext)"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the usage field carried through
    outcomeFromModelText — return outcomeFromModelText(textOf(message), { usage: message.usage, elapsed_ms:
    elapsedMs, prompt });'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: domain/investigation/verdict
  conforms: true
  how: "src/investigation/hypothesis-evaluator.port.ts: held at the verdict literals across the EvaluationOutcome\
    \ union — readonly verdict: 'confirmed';\n...\nreadonly verdict: 'refuted';\n...\nreadonly verdict:\
    \ Exclude<Verdict, 'confirmed' | 'refuted'>;\nsrc/investigation/judgment-stage.ts: held at asEvaluation's\
    \ branches on outcome.verdict — if (outcome.verdict === 'confirmed') {\n    return { hypothesis: name,\
    \ verdict: 'confirmed', citations: outcome.citations, ...callRecord };\n  }\n  if (outcome.verdict\
    \ === 'refuted') {"
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses, reading theCase.title, theCase.when_to_use\
    \ and theCase.hypotheses via requiresEvaluationOf and hypothesisNamed — const requiredNames = requiresEvaluationOf(theCase);\n\
    \  const caseContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at the HypothesisCitationContext built from hypothesis.collects
    for the evaluator-response path, and noDataEvaluation drawing citations directly from that hypothesis''s
    own evidence for the no-call path — const context: HypothesisCitationContext = { collects: hypothesis.collects,
    evidence };

    ...

    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept })),'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the vocabulary handed to\
    \ the model (fieldElement's rendered field names, and the SYSTEM_PROMPT clause constraining citations\
    \ to them); the runtime check that a returned citation's field actually exists among that cited item's\
    \ own fields is not performed in this file — A citation's field must be copied exactly from the name\
    \ one of its own item's <field> elements declares\n— never invented, never the observation's own text,\
    \ and never a field named on another item.\nsrc/investigation/judgment-stage.ts: held at isStructurallyValid's\
    \ call to acceptedCitations, gating acceptance of a returned outcome's citations — const accepted\
    \ = acceptedCitations({ ...context, citations });\n  return accepted.length === citations.length;"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at parseJudgment — const citations\
    \ = value.citations;\nif (!isCitationArray(citations) || !isNonEmpty(citations)) {\n  return undefined;\n\
    }\nsrc/investigation/hypothesis-evaluator.port.ts: held at the citations field of the confirmed and\
    \ refuted EvaluationOutcome variants — readonly citations: readonly [Citation, ...Citation[]];\nsrc/investigation/judgment-stage.ts:\
    \ held at isStructurallyValid, rejecting zero citations and thereby forcing retryOrFail rather than\
    \ a confirmed/refuted evaluation with none — if (citations.length === 0) {\n    return false;\n  }"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at retryOrFail, using `first`'s record when the deadline\
    \ admits no retry and `retry`'s record once a retry ran — if (deadlineGuard.elapsed()) {\n    return\
    \ judgmentFailureEvaluation(name, first);\n  }\n  const retry = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);\n  ...\n  return citationsAreAcceptable(context, retry)\
    \ ? asEvaluation(name, retry) : judgmentFailureEvaluation(name, retry);"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    read `nowhere` — expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20);

    expect(outcome.elapsed_ms).toEqual(expect.any(Number));

    Every elapsed_ms assertion in the file checks either a lower bound after an artificial delay or

    merely `expect.any(Number)`; none constructs a sub-millisecond span or asserts it records as 0

    rather than being rounded up to 1.'
  observed_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock''s observed_at
    line — `<observed_at>${escapeForXmlText(item.observed_at)}</observed_at>`

    src/investigation/hypothesis-evaluator.port.ts: held at the EvidenceItem.observed_at field — readonly
    observed_at: string;'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions close it at this boundary and one per remaining boundary. At the judgment
    boundary: one input — an evidence item whose observed_at is a local-zone reading of a moment, e.g.
    ''2023-11-05T05:15:30.000-03:00'' — against one expected result, that what reaches that item''s <observed_at>
    element is the UTC instant ''2023-11-05T08:15:30.000Z'' (or that the local-zone reading is refused
    rather than carried through). Then the same pairing at each of the other boundaries the node names:
    an item written with a local-zone reading read back from the store as the UTC instant, the same item
    returned by the API as the UTC instant, and the same item presented as the UTC instant. Each is one
    input against one expected result, and the set of boundaries the node names is finite.'
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock''s ttl line — `<ttl>${item.ttl}</ttl>`

    src/investigation/hypothesis-evaluator.port.ts: held at the EvidenceItem.ttl field — readonly ttl:
    number;'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — an evidence item carrying an observed_at and a ttl of N — against one expected
    result: what is rendered for the judge states that window as N seconds counted from that item''s own
    observed_at, so that reading the same N as minutes, or emitting the figure with no unit fixed to it,
    fails the assertion. Written that way the unit half fails exactly when the fact stops holding, which
    the pass-through assertion on the bare integer cannot do.'
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at noDataOutcome, judgmentFailureOutcome\
    \ and notGroundedOutcome — function notGroundedOutcome(callRecord: CallRecord): EvaluationOutcome\
    \ {\n  return { verdict: 'inconclusive', reason: 'not-grounded', citations: [], ...callRecord };\n\
    }\nsrc/investigation/hypothesis-evaluator.port.ts: held at the non-confirmed/refuted EvaluationOutcome\
    \ variant — readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;\n  readonly reason: EvaluationReason;\n\
    \  readonly citations: readonly Citation[];\nsrc/investigation/judgment-stage.ts: held at the nonOkEvidence\
    \ branch declaring no-data, and asEvaluation forwarding the evaluator's own outcome.reason for any\
    \ other inconclusive result — if (nonOkEvidence.length > 0) {\n    return noDataEvaluation(name, nonOkEvidence);\n\
    \  }\n...\nreturn { hypothesis: name, verdict: outcome.verdict, reason: outcome.reason, citations:\
    \ outcome.citations, ...callRecord };"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock''s observation
    line and the SYSTEM_PROMPT''s parsing instruction — Each <item> inside <evidence> names its own concept
    and carries its own <observation> — a JSON-encoded

    string; parse it, rather than reading it as free text, before checking any value it carries against
    the

    <criterion>.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/judgment-does-not-infer
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the SYSTEM_PROMPT''s second
    paragraph — The absence of evidence that would ground a verdict is itself a reason to answer inconclusively
    — never

    an invitation to infer, assume, or draw on anything beyond the <criterion>, <evidence>, <current_instant>,

    <case_title> and <case_when_to_use> the block carries.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/judgment-reads-the-current-instant-fresh
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at evaluate — const currentInstant
    = new Date().toISOString();'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — judgment-stage.ts driving a retry for one hypothesis against an evaluator
    stub, with the clock advanced between the first attempt and the retry — against one expected result:
    the retry arrives at the evaluator as a separate evaluate() invocation carrying the later instant,
    never the instant the first attempt read.'
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock, which reads only\
    \ the item's own snapshotted attributes with no registry or glossary import anywhere in the file —\
    \ `<item concept=\"${escapeForXmlAttribute(item.concept)}\">`,\n...conceptDescriptionLines(item.concept_description),\n\
    fieldsBlock(item.fields),\n...capabilityPayloadNotesLines(item.capability_payload_notes),\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the evaluate() evidence parameter and the EvidenceItem type it is typed against — evidence:\
    \ readonly EvidenceItem[],\n...\nexport type EvidenceItem = {\n  readonly concept: string;\n  readonly\
    \ fields: readonly FieldSemantics[];\n  readonly concept_description: string;\n  readonly capability_payload_notes:\
    \ string;\n  readonly observed_at: string;\n  readonly ttl: number;\n} & ObservationOutcome;\nsrc/investigation/judgment-stage.ts:\
    \ held at toEvidenceItems, copying each item's own already-snapshotted fields/concept_description/capability_payload_notes/observed_at/ttl,\
    \ with no capability-registry or glossary import anywhere in the file — fields: item.fields,\n   \
    \ concept_description: item.concept_description,\n    capability_payload_notes: item.capability_payload_notes,\n\
    \    observed_at: item.observed_at,\n    ttl: item.ttl,"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at deadlineExceededEvaluation, returned in place of\
    \ aborting when the deadline elapses — function deadlineExceededEvaluation(name: string): Evaluation\
    \ {\n  return { hypothesis: name, verdict: 'inconclusive', reason: 'deadline-exceeded', citations:\
    \ [] };\n}"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses, mapping every name in requiredNames\
    \ to exactly one judgeOneHypothesis result — const requiredNames = requiresEvaluationOf(theCase);\n\
    ...\nreturn Promise.all(\n    requiredNames.map((name) =>\n      judgeOneHypothesis({"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — const
    requiredNames = requiresEvaluationOf(theCase);'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeOneHypothesis's nonOkEvidence branch, returning\
    \ noDataEvaluation — const nonOkEvidence = evidence.filter((item) => item.result !== 'ok');\n  if\
    \ (nonOkEvidence.length > 0) {\n    return noDataEvaluation(name, nonOkEvidence);\n  }"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at runIsolatedCall's citationsAreAcceptable check leading\
    \ into retryOrFail — if (citationsAreAcceptable(context, first)) {\n    return asEvaluation(name,\
    \ first);\n  }\n  return retryOrFail({ name, hypothesis, evidenceItems, evaluator, deadlineGuard,\
    \ context, caseContext, first });"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at conceptDescriptionLines —\
    \ function conceptDescriptionLines(conceptDescription: string): readonly string[] {\n  return conceptDescription\
    \ === '' ? [] : [`<concept_description>${escapeForXmlText(conceptDescription)}</concept_description>`];\n\
    }"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeOneHypothesis's acquireSlotOrDeadline check\
    \ — if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {\n    return deadlineExceededEvaluation(name);\n\
    \  }"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at toEvidenceItems, carrying each item's own already-collected\
    \ fields/concept_description/capability_payload_notes straight through, with no capability-registry\
    \ lookup in this file — fields: item.fields,\n    concept_description: item.concept_description,\n\
    \    capability_payload_notes: item.capability_payload_notes,"
  encoded_at:
  - src/investigation/judgment-stage.ts
unstated:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the test 'defaults the token ceiling to 1024 when the caller configures none', lines 687-694
  evidence: 'expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 1024 });'
  cost: 1024 is asserted as the ceiling on how many tokens the provider may spend answering a judgment
    call — a threshold that decides when a model's confirmed/refuted answer risks being cut off mid-JSON
    and turned into a spurious judgment-failure. No node in the specification names this figure or any
    other max_tokens ceiling; the number lives only in this expectation, so a reader trying to learn what
    bounds a judgment call's response has nowhere in the specification to find it, only this test.
unbound:
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
notes: 'Judged by 6 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/judgment-prompt-temporal-context.returns/.

  Certification of rules/investigation/judgment-reads-the-current-instant-fresh did not hold: the auditor
  answered `partial` — The named test binds most of the fact and would fail if it stopped holding: it
  fixes the clock at 2024-03-01T10:00:00.000Z, evaluates, advances the clock to 10:05:00.000Z, evaluates
  again, and asserts each sent prompt carries its own <current_instant> equal to the clock as it stood
  at that call. A value read once and cached (in the constructor or on the first call) fails the second
  assertion; a value carried over from the evidence''s own collection fails both, since SOME_OK_EVIDENCE''s
  observed_at is 2024-01-01T00:00:00.000Z and neither expected literal is it; a value rendered off the
  UTC reference fails against the Z-suffixed literal the assertion spells. What goes unexercised is the
  half of "never one instant shared across two separate judgment requests for the same hypothesis" that
  the test''s own name claims — the retry judgment-stage.ts issues. Nothing in the offered proof imports,
  drives or stubs judgment-stage.ts; the test makes two direct evaluate() calls, so a retry that resends
  the prompt an earlier judgment already built — sharing that judgment''s instant across both requests
  for the same hypothesis — leaves every assertion here passing. The test name states that case; the assertions
  do not reach it.. The node is decided by reading, and a certification standing on it from an earlier
  reconciliation is released by the bind. The remainder is testable: One input — judgment-stage.ts driving
  a retry for one hypothesis against an evaluator stub, with the clock advanced between the first attempt
  and the retry — against one expected result: the retry arrives at the evaluator as a separate evaluate()
  invocation carrying the later instant, never the instant the first attempt read..

  Certification of rules/investigation/an-evidence-items-observed-at-is-a-utc-instant did not hold: the
  auditor answered `partial` — The named test binds one half of the fact at one boundary: it feeds a Z-suffixed
  instant (''2023-11-05T08:15:30.000Z'') and asserts that exact text inside that item''s own <observed_at>
  element, so it would fail if the adapter reformatted the value into a local-zone reading on the way
  into the judgment prompt. What it does not exercise is the rest of what the node states. First, it proves
  pass-through, not UTC: the fixture is already UTC and the assertion is satisfied by any code that copies
  the string through, so an observed_at arriving as a local-zone reading of the moment (an offset other
  than Z, or an offset-less local timestamp) would be rendered into <observed_at> just as faithfully and
  the test would still pass — the "never a local-zone reading of that moment" half goes untested. Second,
  the node states the instant is carried as UTC "wherever the item is stored, returned, presented or judged",
  and nothing in the named test reaches the store, the returned representation, or the presented surface;
  only the judged boundary of this one adapter is touched. Every other test in the file also carries Z-suffixed
  observed_at fixtures, but none asserts anything about the zone, and none was offered as proof here..
  The node is decided by reading, and a certification standing on it from an earlier reconciliation is
  released by the bind. The remainder is testable: Two assertions close it at this boundary and one per
  remaining boundary. At the judgment boundary: one input — an evidence item whose observed_at is a local-zone
  reading of a moment, e.g. ''2023-11-05T05:15:30.000-03:00'' — against one expected result, that what
  reaches that item''s <observed_at> element is the UTC instant ''2023-11-05T08:15:30.000Z'' (or that
  the local-zone reading is refused rather than carried through). Then the same pairing at each of the
  other boundaries the node names: an item written with a local-zone reading read back from the store
  as the UTC instant, the same item returned by the API as the UTC instant, and the same item presented
  as the UTC instant. Each is one input against one expected result, and the set of boundaries the node
  names is finite..

  Certification of rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  did not hold: the auditor answered `partial` — The "from that item''s own observed_at" half is exercised
  whole: the test gives two items with distinct pairs (observed_at 2023-01-01 with ttl 30, observed_at
  2023-06-01 with ttl 90) and asserts each block contains its own ttl beside its own observed_at and not
  the other item''s ttl, so the pairing failing — a shared anchor, a ttl attached to the wrong item''s
  observation — fails the test. The "counted in seconds" half goes unexercised. The test asserts only
  that the integer is echoed back as `<ttl>30</ttl>` and `<ttl>90</ttl>`; nothing asserts the unit that
  figure is counted in, so if the item''s ttl were read as minutes, or as a window whose unit the reader
  must guess, every assertion in the test still passes unchanged. The only other assertion in the file
  touching ttl as freshness context (the test at line 222, asserting the system prompt names `<observed_at>`
  and `<ttl>` together with `<current_instant>` as recency-and-staleness context) is outside the offered
  proof, and it too names no unit — so it would not close this half were it offered.. The node is decided
  by reading, and a certification standing on it from an earlier reconciliation is released by the bind.
  The remainder is testable: One input — an evidence item carrying an observed_at and a ttl of N — against
  one expected result: what is rendered for the judge states that window as N seconds counted from that
  item''s own observed_at, so that reading the same N as minutes, or emitting the figure with no unit
  fixed to it, fails the assertion. Written that way the unit half fails exactly when the fact stops holding,
  which the pass-through assertion on the bare integer cannot do..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/the-judgment-prompt-is-closed,
  domain/investigation/hypothesis-evaluator, domain/investigation/evidence, domain/investigation/citation,
  domain/investigation/verdict, rules/investigation/judgment-reads-the-evidence-snapshot, rules/investigation/judgment-reads-the-current-instant-fresh,
  rules/investigation/an-observation-is-recorded-as-json-object-text, rules/investigation/an-evidence-items-observed-at-is-a-utc-instant,
  rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation, rules/investigation/a-cited-field-exists-in-the-capability-output-schema,
  rules/investigation/a-decided-evaluation-cites-evidence, rules/investigation/an-inconclusive-evaluation-declares-its-reason
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 27 opened across 5 of 6 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/judgment-prompt-temporal-context.returns/`, which are the evidence behind every entry above.
