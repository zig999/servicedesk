---
contract_version: siegard-reconcile/5
title: Review — recursive-output-schema-fields (frontend)
summary: The Output-schema entry's disclosure paragraph rewritten to state the recursive path reading,
  and its sentence-pinning test rewritten to match.
target: frontend
files:
- path: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  change: Rewritten whole to pin the new wording sentence-by-sentence, one test per the task's twelve
    numbered criteria, written by the same delivery.
- path: src/routes/capability-form-fields.tsx
  change: Replaces the disclosure paragraph beside the Output schema entry with six sentences stating
    the recursive path reading (properties/items at any depth, dot/bracket concatenation) in place of
    the top-level-only reading it stated before, written by the delivery of task/output-schema-entry-disclosure/the-entry-states-the-recursive-path-reading.
nodes:
- node: domain/integration/capability
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the field bindings across the form -- Concept (Controller,\
    \ lines 104-121), Name/Version/Nature/Timeout (lines 123-171), Connector (172-180), payload_notes\
    \ (182-205), and the input_schema/output_schema editors (207-240) — <Input\n      {...register(\"\
    connector\")}\n      disabled={isSubmitting}\n      aria-invalid={errors.connector != null}\n    \
    \  aria-describedby={errors.connector != null ? \"connector-error\" : undefined}\n    />\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the Nature field's Select, bound to NATURE_OPTIONS\
    \ derived from the imported CAPABILITY_NATURES — const NATURE_OPTIONS: SelectOption[] = CAPABILITY_NATURES.map((nature)\
    \ => ({\n  value: nature,\n  label: nature,\n}));\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/investigation/field-semantics
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the explanatory paragraph beside the Output schema\
    \ field, lines 226-238 — O <code>type</code> e a <code>description</code> declarados no\n    nó que\
    \ cada caminho alcança, onde o schema os declara, são lidos como a\n    semântica declarada desse\
    \ campo.\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the closing sentence of the same paragraph — Uma\
    \ <code>description</code> aqui declara o que seu valor significa\n    e não nomeia nenhuma decisão.\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the CapabilitySchemaHelperFields render, placed\
    \ immediately beneath the Input/Output schema grid — <CapabilitySchemaHelperFields\n      state={schemaHelper}\n\
    \      onApplyInputSchema={inputSchemaApply.onApply}\n      onApplyOutputSchema={outputSchemaApply.onApply}\n\
    \    />\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — isSaveDisabled
    reads inputSchema.isValid / outputSchema.isValid to gate the Save button; nothing in this file handles
    a CapabilitySchemaNotWellFormedError or a 422 response -- that refusal is the registry''s own.'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — options={NATURE_OPTIONS}
    -- every nature value is offered with no exclusion of "mutating" and no handling of a CapabilityNotReadOnlyError;
    the refusal is the registry''s own.'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the field bindings, each rendering the value form\
    \ itself holds rather than any other source — <Input\n      {...register(\"name\")}\n      disabled={isEditingIdentity\
    \ || isSubmitting}\n      aria-invalid={errors.name != null}\n      aria-describedby={errors.name\
    \ != null ? \"name-error\" : undefined}\n    />\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the paragraph beside the Output schema field, lines\
    \ 226-238 — O que é inserido aqui é <code>JSON</code>. Os nomes de campo lidos a partir dele\n   \
    \ são os caminhos através do objeto <code>properties</code> de nível superior\n    deste schema e\
    \ de todo objeto <code>properties</code> e todo schema{\" \"}\n    <code>items</code> alcançável a\
    \ partir dele.\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
  decided_by: reading
  remainder: testable
  remainder_why: Four assertions close it. (1) On the edit surface, the same two schema shapes plus one
    declaring its fields outside any properties object, against the result that Save stays enabled and
    no rejection or error text renders anywhere on the form; repeat the no-rejection-text half on the
    create screen. (2) Anchor the six claim patterns with ^/$ over each split sentence, or assert the
    paragraph's textContent equals one expected string. (3) Replace the digit and brace proxies with an
    assertion the fact states -- the guidance names no concrete field, key or value. (4) Assert findGuidanceParagraph
    returns a non-null element before each negative assertion.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the same paragraph, which states only the five\
    \ bounded claims and no worked example of its own — Nenhum outro conteúdo deste schema é lido ou\n\
    \    validado. Uma <code>description</code> aqui declara o que seu valor significa\n    e não nomeia\
    \ nenhuma decisão.\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
  decided_by: reading
  remainder: testable
  remainder_why: Four assertions close it. First, against the rendered guidance, assert the text equals
    the concatenation of exactly the six known statements -- an equality, not six substring matches. Second,
    for the worked example, assert the guidance contains no example marker over its own content. Third,
    fill the create screen with an output schema whose node carries a description naming a decision, and
    expect Save enabled and the form submitting. Fourth, for each of those three inputs assert the submit
    actually reaches the stub and no refusal message renders beside the field.
- node: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the two independently-wired apply hooks and confirmation\
    \ dialogs for inputSchema and outputSchema — const inputSchemaApply = useApplyToJsonSchemaField(\n\
    \      inputSchema,\n      isDirty ?? inputSchema.value !== \"\",\n    );\n    const outputSchemaApply\
    \ = useApplyToJsonSchemaField(\n      outputSchema,\n      isDirty ?? outputSchema.value !== \"\"\
    ,\n    );\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: false
  how: "no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — const\
    \ conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({\n      value: concept.name,\n\
    \      label: concept.name,\n    })); -- every option is offered unfiltered, with no handling of ConceptAlreadyAnsweredError\
    \ or\nDuplicateConceptAnswerError; that refusal is the registry's own."
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
  conforms: false
  how: 'no named file holds this fact now: src/routes/capability-form-fields.tsx read `nowhere` — the
    schema editors are bound directly to inputSchema.onChange / outputSchema.onChange, and a write only
    happens through the separate inputSchemaApply.onApply / onConfirmApply path -- the guarantee that
    a draft''s mere arrival writes nothing is not itself demonstrated in this file, only the separation
    that permits it.'
  observed_at:
  - src/routes/capability-form-fields.tsx
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  conforms: true
  how: "src/routes/capability-form-fields.tsx: held at the same paragraph beside the Output schema field\
    \ — Esse caminho é construído concatenando a chave própria de cada objeto ao caminho do seu pai com\
    \ um\n    ponto, e os <code>items</code> próprios de cada array ao caminho do seu pai\n    com colchetes.\n"
  encoded_at:
  - src/routes/capability-form-fields.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result: an output schema exercising every clause of the
    rule, against the exact field-semantics element set it yields. The assertion has to be made where
    the walk runs, not on the capability form''s guidance paragraph.'
unbound:
- src/routes/capability-form-fields-output-schema-guidance.spec.ts
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/recursive-output-schema-fields-frontend.returns/.

  Certification of rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it did not
  hold: the auditor answered `partial` — The five claims are exercised whole on the authoring surface,
  and the edit surface is reached transitively -- criterion 10 asserts the detail screen''s paragraph
  text is identical to the create screen''s, so a claim dropped on edit fails there. Three stated parts
  of the fact go unexercised. First, "s refuses no entry and checks no entered content against any of
  the five" is measured only as the absence of a disabled attribute on Save: a surface that accepted the
  same two schemas but rendered an inline rejection beside the entry would pass criteria 11 and 12 unchanged,
  and neither shape is submitted on the edit surface at all. The two shapes submitted are also not the
  case the node names as the reason the statement is owed -- a schema declaring its fields somewhere other
  than a properties object reached this way; nothing in the set submits one. Second, "s states no sixth
  claim" is tested by splitting the paragraph on "." and requiring each sentence to match one of six patterns,
  but the patterns are unanchored substrings: a sixth claim appended as a clause inside an existing sentence
  matches CLAIM_PATTERNS[0] and the test passes. Third, "carries no worked example of its own" is asserted
  as the absence of digits and of braces, a proxy for the thing: a prose example naming a concrete field
  path carries neither and passes. Separately, findGuidanceParagraph returns null when no matching p exists,
  and the negative assertions (criteria 8 and 9) then run against "" and pass vacuously.. The node is
  decided by reading, and a certification standing on it from an earlier reconciliation is released by
  the bind. The remainder is testable: Four assertions close it. (1) On the edit surface, the same two
  schema shapes plus one declaring its fields outside any properties object, against the result that Save
  stays enabled and no rejection or error text renders anywhere on the form; repeat the no-rejection-text
  half on the create screen. (2) Anchor the six claim patterns with ^/$ over each split sentence, or assert
  the paragraph''s textContent equals one expected string. (3) Replace the digit and brace proxies with
  an assertion the fact states -- the guidance names no concrete field, key or value. (4) Assert findGuidanceParagraph
  returns a non-null element before each negative assertion..

  Certification of rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim did not
  hold: the auditor answered `partial` — All three limbs of the fact are reached, and each is reached
  by a proxy that a violation can pass. (1) "states no further fact about how the schema is read": the
  criterion 7 test splits the guidance on "." and asserts each resulting sentence contains one of the
  six known claim statements, so a further fact appended inside an existing sentence still satisfies the
  substring match and passes; and every assertion in the file reads only the single p that findGuidanceParagraph
  locates by the JSON claim, so a further claim rendered in a sibling element beside the Output schema
  entry is never read at all. (2) "carries no worked example of its own": exercised only as the absence
  of a digit and the absence of a brace. The example the node names -- the one illustrating meaning against
  decision -- is prose, carries neither a digit nor a brace, and would pass both tests. (3) "refuses nothing
  on any of these grounds": the criterion 11 and 12 tests submit real schemas and do exercise two grounds;
  nothing in the set submits a schema whose description names a decision rather than a meaning, so the
  third bounding node''s ground is unexercised. Both refusal tests also read refusal solely as the Save
  button''s disabled attribute.. The node is decided by reading, and a certification standing on it from
  an earlier reconciliation is released by the bind. The remainder is testable: Four assertions close
  it. First, against the rendered guidance, assert the text equals the concatenation of exactly the six
  known statements -- an equality, not six substring matches. Second, for the worked example, assert the
  guidance contains no example marker over its own content. Third, fill the create screen with an output
  schema whose node carries a description naming a decision, and expect Save enabled and the form submitting.
  Fourth, for each of those three inputs assert the submit actually reaches the stub and no refusal message
  renders beside the field..

  Certification of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema did
  not hold: the auditor answered `uncovered` — Nothing in the offered proof derives or asserts a field-semantics
  name. All ten guidance tests (criteria 1-10) assert only that a rendered paragraph''s text matches a
  regex describing the rule -- findGuidanceParagraph reads a p on the capability create and detail screens
  and matches CLAIM_PATTERNS. Those assertions bind the wording of prose, not the walk. The two behavioural
  tests (criteria 11, 12) assert only that a Save button lacks a disabled attribute -- a non-refusal by
  a surface the guidance itself states reads and validates nothing, so it holds whichever names the walk
  produces from those schemas, or none. No test in this set submits a schema and asserts the resulting
  field-semantics element set. The tests that would prove this fact are wherever domain/investigation/field-semantics
  is derived, which is outside the proof this pack offers.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: One
  input against one expected result: an output schema exercising every clause of the rule, against the
  exact field-semantics element set it yields. The assertion has to be made where the walk runs, not on
  the capability form''s guidance paragraph..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it,
  rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim, rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 0 opened across 0 of 2 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/recursive-output-schema-fields-frontend.returns/`, which are the evidence behind every entry above.
