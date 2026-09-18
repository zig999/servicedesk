---
target: backend
title: Judgment prompt states observation semantics and carries temporal context
summary: Rewrites AnthropicHypothesisEvaluator's system prompt to state observation-versus-interpretation
  semantics and multi-item isolation, threads each evidence item's own observed_at/ttl plus a freshly-read
  current UTC instant through the EvidenceItem port type into the built judgment_input rendered as a single-line
  element consistent with observed_at/ttl/observation, and repairs the pre-existing EvidenceItem fixtures/expectations
  (and one fixture's line count) that the type widening pushed past the build's typecheck, lint and test-unit
  steps.
task: sha256:5b3d3d1965ac71c4854d45047e60c31807a749652b61b58cd1dbee99cbff620b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-build-5
files:
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: EvidenceItem now carries its own observed_at (UTC instant string) and ttl (seconds, number)
    alongside the fields it already carried, so the port type no longer narrows away what domain/investigation/evidence
    already snapshots per item.
- path: src/investigation/judgment-stage.ts
  effect: toEvidenceItems now copies each Evidence item's own observed_at and ttl into the EvidenceItem
    it hands the evaluator, instead of dropping them at the port boundary.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: The system prompt now states that an item's <observation> (a JSON-encoded string to parse) is
    the only evidence, that <fields>/<concept_description>/<capability_payload_notes> are reading aids
    rather than evidence or citable field names in themselves, that multiple <item>s are judged in complete
    isolation from each other, and that a top-level <current_instant> plus each item's own <observed_at>/<ttl>
    are recency/staleness context and never citable. evaluate() now reads new Date().toISOString() fresh
    on every call (including a retry, since a retry is a full new evaluate() call from judgment-stage.ts)
    and buildUserPrompt renders it as a top-level <current_instant> element built as one joined string
    (matching the single-line style already used for <observed_at>, <ttl> and <observation>, rather than
    the three-entry open/value/close style <case_title>/<case_when_to_use> use); itemBlock renders each
    item's own <observed_at> and <ttl>. buildUserPrompt's parameters were grouped into one UserPromptInput
    object to keep it within the standard's three-positional-parameter limit once currentInstant was added.
- path: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  effect: Every one of the file's 22 pre-existing EvidenceItem literals now also carries observed_at ('2024-01-01T00:00:00.000Z')
    and ttl (60), the same convention already used for Evidence fixtures elsewhere in the suite. One two-item
    fixture was additionally rewritten to the file's own existing single-line literal style to bring that
    async arrow function back under the standard's thirty-line limit after the two new fields pushed it
    over. No assertion, description, or other line was changed.
- path: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  effect: Its one EvidenceItem literal (SOME_EVIDENCE) now also carries observed_at ('2024-01-01T00:00:00.000Z')
    and ttl (60), same convention, so the file type-checks. No assertion or other line was changed.
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  effect: The two pre-existing EvidenceItem-shaped expected literals that now fail against the real toEvidenceItems()
    output now also carry observed_at ('2024-01-01T00:00:00.000Z') and ttl (60), matching exactly what
    each test's own anEvidence() fixture already declares. No assertion, fixture value, or other test
    in the file was changed.
criteria:
- criterion: The system prompt states that an evidence item's <observation> is the data validated against
    the <criterion>, and that its <fields>, <concept_description> and <capability_payload_notes> exist
    only to help read that data, never as evidence in themselves.
  met: true
  how: The second prompt paragraph states "That parsed observation is the data you validate the criterion
    against, and only it is evidence" and that fields/concept_description/capability_payload_notes "all
    exist only to help you read that observation correctly, never as evidence in themselves and never
    a fact to verify."
- criterion: The system prompt states that <observation> is a JSON-encoded string to parse before checking
    its values against the criterion.
  met: true
  how: The same paragraph states each item "carries its own <observation> — a JSON-encoded string; parse
    it, rather than reading it as free text, before checking any value it carries against the <criterion>."
- criterion: The system prompt states that when <evidence> carries more than one <item>, each is evaluated
    independently, and a field's value from one item is never attributed to another item, even where both
    declare a field of the same name.
  met: true
  how: 'The third prompt paragraph states "evaluate each in complete isolation from every other: a <field>''s
    value, an <observation>, an <observed_at> or a <ttl> read from one <item> is never attributed to another
    item, even where two items declare a field of the same name."'
- criterion: The judgment_input the evaluator builds carries a top-level element stating the current date
    and time in UTC at the moment the judgment is requested.
  met: true
  how: evaluate() reads new Date().toISOString() as currentInstant immediately before building the prompt
    (after the no-data early return), and buildUserPrompt renders it as a top-level, single-line <current_instant>
    element, a sibling of <criterion>, <evidence>, <case_title> and <case_when_to_use> inside <judgment_input>.
    Because a retry is a full new evaluator.evaluate() call from judgment-stage.ts, this clock read is
    fresh on every request, including a retry answering a refused foreign citation.
- criterion: The judgment_input the evaluator builds carries, for each evidence item, the UTC instant
    that item's observation was captured and how many seconds it was considered fresh for, both taken
    from that same evidence item's own already-collected observed_at and ttl.
  met: true
  how: EvidenceItem now carries observed_at/ttl (widened port type), toEvidenceItems copies them from
    each Evidence item unchanged, and itemBlock renders them as that item's own <observed_at> and <ttl>
    elements inside its own <item> block, never re-derived or re-read.
- criterion: The system prompt states that the current-time element and each item's own captured-at/freshness
    elements are context for reasoning about recency and staleness, used together whenever the criterion
    depends on either, and are never themselves citable evidence.
  met: true
  how: The fourth prompt paragraph states "Whenever the <criterion> depends on how recent or how stale
    an observation is, reason about it using that item's own <observed_at> and <ttl> together with <current_instant>;
    neither <current_instant> nor any item's own <observed_at> or <ttl> is itself citable evidence."
- criterion: 'Existing behavior is unchanged for a criterion that does not depend on recency or staleness:
    the response format contract (the three verdict shapes, and citation validity against an item''s own
    <field> elements) is untouched by this task.'
  met: true
  how: The three JSON shapes, the "copied exactly from the name one of its own item's <field> elements"
    citation rule, and every downstream parsing/citation-validation function are left byte-identical to
    what they were before this task; only the prompt text describing the new elements and the two new
    rendered tags were added.
nodes:
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: buildUserPrompt still assembles <judgment_input> purely from criterion, evidence's own snapshot,
    a freshly-read current instant, and caseContext's title/when_to_use — no glossary or capability-registry
    read, and no tools field on the provider call — with the block's permitted content grown by exactly
    the two elements the closed statement itself now names.
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: evaluate() still takes one hypothesis's criterion, its own evidence, and the case context, and
    now also reads the current instant fresh at the moment of judgment as the Responsibility text requires,
    returning a cited, never-inferred evaluation exactly as before.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  how: The judgment-facing EvidenceItem port type now carries the same observed_at/ttl attributes Evidence
    itself declares, copied through unchanged rather than re-derived.
- node: domain/investigation/citation
  how: Citation's shape and validity are untouched; this task governed only what the model is told about
    observation versus interpretive context, never the citation type itself.
- node: domain/investigation/verdict
  how: The three verdict values and their JSON shapes are unchanged; criterion 7 required this and the
    code answering them was not touched.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: toEvidenceItems still copies fields/concept_description/capability_payload_notes verbatim from
    the already-collected Evidence, and now does the same for observed_at/ttl — nothing is re-read from
    the glossary or capability registry at judgment time.
- node: rules/investigation/judgment-reads-the-current-instant-fresh
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: currentInstant is read via new Date().toISOString() inside evaluate(), never passed in and never
    cached across calls; because every retry in judgment-stage.ts is a fresh evaluate() invocation, the
    instant is read anew on a retry too.
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The system prompt now explicitly instructs the model to parse <observation> as JSON before checking
    values against the criterion, rather than reading it as free text.
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: observed_at is threaded through EvidenceItem and rendered in <observed_at> exactly as the item
    snapshotted it, never reformatted to a local zone.
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: ttl is threaded through EvidenceItem unchanged and rendered in <ttl>, with the prompt telling the
    model it is "how many seconds that observation was considered fresh for, counted from that same <observed_at>."
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  how: Unaffected — citation-validation.ts still checks a citation's field against the cited item's own
    fields snapshot alone.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  how: Unaffected — a confirmed or refuted outcome still requires at least one citation.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  how: Unaffected — no-data/not-grounded/judgment-failure reasons and their triggers are untouched by
    this task, per criterion 7.
inferences:
- inferred: The tag names <current_instant>, <observed_at> and <ttl> for the three new judgment_input
    elements.
  from: The domain vocabulary the bound nodes use verbatim and the file's own existing convention of naming
    a prompt tag after the attribute it carries.
- inferred: Placement of <current_instant> as a judgment_input sibling after </evidence> and before <case_title>,
    and of <observed_at>/<ttl> inside each <item> after <capability_payload_notes> and before <observation>.
  from: constraints/the-judgment-prompt-is-closed's own listing order for the top-level placement; no
    node states an item-internal order for the item-level placement.
- inferred: currentInstant is serialized with new Date().toISOString(), the same UTC ISO-8601 format already
    used for observed_at at collection.
  from: evidence-collection-stage.ts's existing new Date(now).toISOString() call, and rules/investigation/an-evidence-items-observed-at-is-a-utc-instant's
    requirement that both sides of a staleness comparison read against one clock/format.
- inferred: <current_instant> is rendered as one joined string (open tag, escaped value and close tag
    concatenated with no interior line break), the same way <observed_at>, <ttl> and <observation> are
    each built, rather than as three separate array entries the way <case_title>/<case_when_to_use> are
    built.
  from: A failure-diagnostician-confirmed code defect against a test-author-written test asserting the
    prompt contains the single-line form; corrected by matching the single-line style already used for
    every other value-bearing leaf element this file renders.
- inferred: The repaired fixtures' own observed_at/ttl values ('2024-01-01T00:00:00.000Z' / 60), chosen
    identically for every added literal that does not override them.
  from: The exact value pair already used for Evidence/EvidenceItem fixtures elsewhere in the suite and
    evidence.ts's own DEFAULT_EVIDENCE_TTL_SECONDS = 60.
preserved:
- The three verdict JSON shapes and the exact citation-copy wording the model is held to.
- Citation structural validity and the retry-on-foreign-citation flow in judgment-stage.ts.
- The no-data early return and its citation shape.
- The empty-string omission convention for <concept_description> and <capability_payload_notes>, and XML-escaping
  of reserved characters.
- The EvaluationOutcome call-record shape and the constructor's apiKey/model/maxTokens defaulting.
- 'Every existing assertion in the three repaired spec files: only the missing EvidenceItem fields were
  added, and one fixture''s literal formatting was compacted; no assertion, test name, fixture value,
  or test intent was touched.'
deferred:
- what: The adapter's own spec file previously carried a "sends byte-identical prompt content across two
    calls" (toBe equality) assertion that legitimately conflicted with rules/investigation/judgment-reads-the-current-instant-fresh
    once <current_instant> began varying per call.
  why: 'Resolved by the test-author, not by this implementation: that test was rewritten to assert the
    criterion/evidence/case-context-driven content is identical across two calls while allowing <current_instant>
    to differ, and a separate new test proves the clock is read fresh on a second/retry evaluate() call
    rather than reused. See the proof record for both tests.'

---

## What it is

The corrective delivery making the hypothesis-judgment system prompt state observation-versus-interpretation
semantics and multi-item isolation, and carrying each evidence item's own observed_at/ttl plus a
freshly-read current UTC instant through to the judgment_input the model receives.

## Notes

The build's typecheck, lint and test-unit steps each surfaced a mechanical consequence of widening
EvidenceItem (three pre-existing spec files whose fixtures/expectations lacked the two new required
fields, and one test function pushed past the standard's line limit) — each was repaired in place,
without touching any assertion. A red suite run (run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-suite)
surfaced a code defect a failure-diagnostician confirmed: <current_instant> was rendered across
three separate array entries instead of one joined string, inconsistent with observed_at/ttl/observation's
own single-line style; fixed, and the build passed clean at run-5.
