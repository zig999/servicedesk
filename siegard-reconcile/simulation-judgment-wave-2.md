---
contract_version: siegard-reconcile/1
title: Reconcile wave 2 of backend code drift — simulation and hypothesis-judgment cluster
summary: >-
  These nine files are the shipped, committed backend behavior for the two case-simulation
  operations (simulate-case and simulate-hypothesis), for citation validation against a judged
  hypothesis's own evidence snapshot, for hypothesis judgment behind its port and its Anthropic
  adapter, for assessment consolidation behind its port, for drafting an assessment's text from a
  consolidation call, and for reading a capability's output schema into field semantics. The human
  asserts this behavior is correct as it stands; this reconciliation checks only whether the
  specification still states what these files now do.
target: backend
files:
  - path: src/factories/production-simulate-hypothesis.factory.ts
    change: >-
      composes the production simulate-hypothesis runner — collection and judgment only, no
      consolidation — under a 20-second total deadline budget identical to production diagnose's own
  - path: src/factories/simulate.factory.ts
    change: >-
      composes the production simulate-case runner over the shared four-stage pipeline, constructing
      its own HTTP observation source per call so no caching decorator can reach it
  - path: src/investigation/simulate-hypothesis-pipeline.ts
    change: >-
      narrows a case to one hypothesis revision's manifest entry, runs collection then judgment for
      it alone, and returns evidence, the one evaluation and durations with no writing figure
  - path: src/investigation/citation-validation.ts
    change: >-
      checks a citation's concept is in the judged hypothesis's own collects and its field exists
      among that concept's cited evidence item's own snapshotted fields, reading nothing else
  - path: src/investigation/hypothesis-evaluator.port.ts
    change: >-
      declares the judgment port's evidence-item and case-context inputs and its three-shaped
      evaluation outcome, with usage/elapsed_ms/prompt optional
  - path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    change: >-
      implements the port against Anthropic's API: builds the closed XML prompt, parses the answer
      into confirmed/refuted/inconclusive, and degrades to no-data or judgment-failure outcomes
  - path: src/investigation/assessment-consolidator.port.ts
    change: >-
      declares the consolidation port's one operation, consolidate(evaluations, evidence, register),
      answering text, usage, elapsed_ms and prompt with no register in the answer
  - path: src/investigation/draft-assessment-text.ts
    change: >-
      calls the consolidator and builds the Assessment from the case's resolved outcome plus the
      consolidation's text alone, carrying no register, usage, elapsed_ms or prompt onto it
  - path: src/investigation/field-semantics.ts
    change: >-
      reads a capability's output schema's top-level properties into name/type/description per
      field, answering an empty array for a schema that does not parse or carries no properties
nodes:
  - node: contracts/investigation/case-simulation
    conforms: false
    how: >-
      production-simulate-hypothesis.factory.ts's judge cleared this node for what it wires
      (collection and judgment only, no consolidator, no narrative, no ticket reference — the
      contract's own "Neither operation carries a narrative or a ticket reference"). simulate.factory.ts's
      judge found its docstring states, for "a simulation's own run" without naming which
      operation, a record carrying a resolved outcome and an assessment — but the contract's two
      operations answer different records, and simulate-hypothesis "resolves no outcome — one
      hypothesis does not resolve a case." simulate-hypothesis-pipeline.ts's judge separately found
      that operation's own result type omits cost with no citation, while the contract's simulate-case
      description enumerates cost as part of "the whole record": "returns the whole record back:
      evidence per concept, evaluation per hypothesis with its citations, the resolved outcome, the
      assessment, cost and durations."
    observed_at:
      - src/factories/production-simulate-hypothesis.factory.ts
      - src/factories/simulate.factory.ts
      - src/investigation/simulate-hypothesis-pipeline.ts
  - node: rules/investigation/a-simulation-writes-no-investigation
    conforms: true
    how: >-
      all three files wire only runInvestigationPipeline/runSimulateHypothesisPipeline, never
      runDiagnosis or buildInvestigation, and hold no repository, writer or event emitter — "Neither
      runDiagnosis nor createDiagnoseRunner nor createProductionDiagnoseRunner is imported or called
      from here" (production-simulate-hypothesis.factory.ts); simulate-hypothesis-pipeline.ts's sole
      exit is `return { evidence, evaluation, durations: durationsOf(evidence, evaluation) };`.
    encoded_at:
      - src/factories/production-simulate-hypothesis.factory.ts
      - src/factories/simulate.factory.ts
      - src/investigation/simulate-hypothesis-pipeline.ts
  - node: scenarios/investigation/a-simulation-never-enters-the-cache
    conforms: true
    how: >-
      both factories construct their own HttpDeclarativeObservationSource per call and accept no
      externally-built IObservationSource, so "nothing this module imports, constructs or takes as a
      parameter can be a cache."
    encoded_at:
      - src/factories/production-simulate-hypothesis.factory.ts
      - src/factories/simulate.factory.ts
  - node: domain/investigation/durations
    conforms: false
    how: >-
      the node states only "How long each stage took, in milliseconds ... It is what says who is
      exceeding the declared total budget, per stage and per capability" and, per its own decided
      conditional presence, that writing is "present exactly when a consolidation call happened ...
      absent for a run that never reaches consolidation." simulate-hypothesis-pipeline.ts's judge
      found two further facts decided in code and nowhere in the node: `judgment` reads 0 both when a
      call took under a millisecond and when no call happened at all
      (`maxElapsedMs(evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms])`), and
      `total` is computed as `collection + judgment` with no stated meaning for total and against
      constraints/the-deadline-is-an-absolute-propagated-instant's own reasoning that "summing stage
      budgets and calling the sum a deadline leaves nothing for the overhead between stages."
    observed_at:
      - src/investigation/simulate-hypothesis-pipeline.ts
  - node: domain/investigation/evaluation
    conforms: false
    how: >-
      simulate-hypothesis-pipeline.ts's judge cleared the node's identity and optionality facts.
      anthropic-hypothesis-evaluator.adapter.ts's judge found the node's stated presence condition —
      "present exactly when a call happened, absent when reason `no-data` means judgment was never
      called at all" — is a two-way split the adapter does not follow: a call that threw carries
      elapsed_ms and prompt but no usage, a third case the node does not state.
      assessment-consolidator.port.ts's judge found this node's own attribute set (`register` among
      them, required) is what a header comment in a sibling file misattributes to
      domain/investigation/hypothesis-evaluator instead of citing here.
    observed_at:
      - src/investigation/simulate-hypothesis-pipeline.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
      - src/investigation/assessment-consolidator.port.ts
  - node: domain/investigation/subject
    conforms: true
    how: >-
      `buildSubject(options.subjectType, options.subjectAttributes)` hands the whole assembled
      attribute set to collection with nothing filtered per concept, matching "No attribute is
      filtered out for any one concept."
    encoded_at:
      - src/investigation/simulate-hypothesis-pipeline.ts
  - node: domain/knowledge/hypothesis-revision
    conforms: false
    how: >-
      simulate-hypothesis-pipeline.ts and citation-validation.ts both encode `collects` correctly as
      a plain array of concept names read off the one narrowed manifest entry.
      hypothesis-evaluator.port.ts's judge found a sibling comment in the same file citing
      "domain/knowledge/hypothesis's `collects`" for this exact fact, when domain/knowledge/hypothesis
      "holds one attribute, `name`, and no `collects`" — the node this fact actually belongs to.
    observed_at:
      - src/investigation/simulate-hypothesis-pipeline.ts
      - src/investigation/citation-validation.ts
      - src/investigation/hypothesis-evaluator.port.ts
  - node: scenarios/investigation/a-single-hypothesis-is-simulated
    conforms: true
    how: >-
      one manifest entry narrows what is observed, exactly one evaluation is required back (a
      mismatched count throws), and the return carries no outcome and no assessment, matching "only
      the concepts that hypothesis's revision collects are observed" and "no outcome and no
      assessment are resolved."
    encoded_at:
      - src/investigation/simulate-hypothesis-pipeline.ts
  - node: domain/investigation/citation
    conforms: true
    how: >-
      the two predicates read exactly the node's two attributes, `concept` and `field`, both
      required, making the check "machine-checkable by construction" as the header states.
    encoded_at:
      - src/investigation/citation-validation.ts
  - node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
    conforms: false
    how: >-
      citation-validation.ts's own `citesACollectedConcept` correctly tests membership in the judged
      revision's own collects and nothing wider. anthropic-hypothesis-evaluator.adapter.ts's judge
      found its own header comment disclaims that "this adapter never validates a citation against
      the judged hypothesis's own collects", attributing the actual check and its consequence to "citation-validation.ts's
      own behavior ... which retries or degrades a foreign citation" — but the node states "the
      adapter refuses the response" for exactly this case, so the file and the node disagree about
      both which component answers a foreign citation and what the answer is.
    observed_at:
      - src/investigation/citation-validation.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    conforms: true
    how: >-
      `citesADeclaredField` looks up the evidence item by concept and tests membership in that item's
      own snapshotted `fields`, answering false rather than throwing for a concept with no snapshot.
    encoded_at:
      - src/investigation/citation-validation.ts
  - node: rules/investigation/judgment-reads-the-evidence-snapshot
    conforms: true
    how: >-
      citation-validation.ts's citation check reads only each item's own snapshotted `fields`;
      hypothesis-evaluator.port.ts offers no glossary or registry parameter to re-read from; the
      Anthropic adapter's prompt builder renders every value off the EvidenceItem itself and imports
      no glossary or registry module.
    encoded_at:
      - src/investigation/citation-validation.ts
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
    conforms: true
    how: >-
      the only field names in reach are `citedEvidence.fields`, taken from the evidence item, with no
      name-and-version registry lookup anywhere in the module.
    encoded_at:
      - src/investigation/citation-validation.ts
  - node: constraints/judgment-runs-behind-a-port
    conforms: true
    how: >-
      the port declares an interface behind a type-only surface and the adapter is the one class
      implementing it, importing exactly one provider client (`import Anthropic from
      '@anthropic-ai/sdk'`) and nothing else that reaches the domain.
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: constraints/the-judgment-prompt-is-closed
    conforms: true
    how: >-
      CaseContext carries exactly `title` and `whenToUse`, and the rendered prompt block carries
      exactly criterion, evidence items, case_title and case_when_to_use with no tools field on the
      request, matching "no tool calling available to the model."
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: domain/investigation/hypothesis-evaluator
    conforms: false
    how: >-
      the adapter's one `evaluate` method matches the node's one declared operation and its
      Responsibility. hypothesis-evaluator.port.ts's judge found its own CaseContext doc comment
      quotes that Responsibility as "given one hypothesis's criterion and its evidence only" and
      argues a narrow reading from the word "only" — text the node's current Responsibility does not
      contain (it now reads "the pinned case's title and when_to_use" as inputs directly), so the
      file's own justification for excluding title and when_to_use no longer matches what it cites.
    observed_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: domain/investigation/verdict
    conforms: true
    how: >-
      the three arms of EvaluationOutcome enumerate confirmed, refuted and a derived third arm
      (`Exclude<Verdict, 'confirmed' | 'refuted'>`) rather than restating the remaining value.
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
  - node: rules/investigation/a-decided-evaluation-cites-evidence
    conforms: true
    how: >-
      the confirmed and refuted arms type `citations` as a non-empty tuple, and the adapter's
      `isNonEmpty()` check falls to judgment-failure rather than construct an empty-cited decided
      verdict.
    encoded_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
    conforms: false
    how: >-
      hypothesis-evaluator.port.ts's own type requires `reason` on the inconclusive arm. The
      adapter's judge found two further facts decided in code and nowhere in the node: the no-data
      citation's `field` is hard-coded to the empty string ("this codebase's established
      convention ... field left as the empty string since there is no meaningful field to point
      at"), a value rules/investigation/a-cited-field-exists-in-the-capability-output-schema's own
      unqualified statement cannot admit; and a completed call whose answer grounds neither verdict
      is recorded with the same `reason: 'judgment-failure'` a provider outage gets, against the
      node's own "Inconclusive by technical failure, by queue and by missing data must be
      distinguishable, or an infrastructure failure is read as a domain fact."
    observed_at:
      - src/investigation/hypothesis-evaluator.port.ts
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: domain/investigation/usage
    conforms: true
    how: >-
      the provider response's own usage is carried onto the outcome for that one call, matching the
      node's two declared attributes (input_tokens, output_tokens).
    encoded_at:
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: rules/investigation/judgment-does-not-infer
    conforms: true
    how: >-
      the fixed system prompt states the instruction verbatim: "The absence of evidence that would
      ground a verdict is itself a reason to answer inconclusively — never an invitation to infer";
      what the adapter does downstream with a model answer that ignores this is the separate finding
      recorded under rules/investigation/an-inconclusive-evaluation-declares-its-reason.
    encoded_at:
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
    conforms: true
    how: >-
      an empty `concept_description` omits the tag from the prompt entirely rather than rendering it
      empty, and the system prompt tells the model an absent description means the item is known by
      concept alone.
    encoded_at:
      - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - node: constraints/consolidation-runs-behind-a-port
    conforms: true
    how: >-
      the port publishes an interface with no LLM client imported, and draft-assessment-text.ts
      reaches consolidation only through the imported `IAssessmentConsolidator` type.
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/draft-assessment-text.ts
  - node: constraints/the-domain-depends-on-no-infrastructure
    conforms: true
    how: >-
      the port's only imports are four sibling type-only imports (ConsolidationRegister, Evaluation,
      Evidence, Usage) — no framework, driver or provider client.
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
  - node: domain/investigation/assessment
    conforms: false
    how: >-
      assessment-consolidator.port.ts's judge found `ConsolidationOutcome` answers `text`, `usage`,
      `elapsed_ms` and `prompt` but no `register`, though the node requires all four alongside
      register: "the pinned case version's own declared register when it holds one, or whatever
      register the consolidation adapter defaults to when the version declares none ... a reader is
      never left to guess which register is behind the text now on hand." draft-assessment-text.ts's
      judge found three further departures at the call site: its own doc comment enumerates the
      element's attribute set as four ("outcome, referral, determining_hypothesis and text") against
      the node's eight; the call `const { text } = await consolidator.consolidate(...)` discards the
      answer's usage, elapsed_ms and prompt, all three required; and the constructed Assessment
      (`{ outcome, referral, text }` plus an optional determining_hypothesis) carries no `register`
      even though the value is in hand as `consolidationRegister`.
    observed_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/draft-assessment-text.ts
  - node: domain/investigation/assessment-consolidator
    conforms: true
    how: >-
      the port's one operation, `consolidate`, takes exactly the three inputs the node's
      Responsibility names, and the call site invokes it with exactly those three and takes only
      `text` from its writing half.
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/draft-assessment-text.ts
  - node: domain/investigation/evidence
    conforms: false
    how: >-
      assessment-consolidator.port.ts's judge cleared this node for the `evidence` parameter's shape
      (no criterion, no when_to_use crossing the port). hypothesis-evaluator.port.ts's judge found a
      sibling comment in the same file states a third reason for an empty `concept_description` — "a
      concept the glossary never held" — that neither
      scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone nor this
      node's own Description states; both state only a concept registered before descriptions
      existed.
    observed_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/hypothesis-evaluator.port.ts
  - node: rules/investigation/the-outcome-comes-from-the-case
    conforms: true
    how: >-
      outcome, referral and the determining hypothesis are copied from the case's own resolved
      outcome and computed nowhere in either file, matching "the writing only writes."
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/draft-assessment-text.ts
  - node: rules/investigation/the-writing-input-is-narrowed
    conforms: true
    how: >-
      only `narrowedInput.evaluations` and `narrowedInput.evidence` cross into the consolidation
      call, unconditionally and identically in every outcome — nothing of the case's hypotheses,
      their criteria or the when_to_use is reachable from the call site.
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/draft-assessment-text.ts
  - node: domain/knowledge/case-version
    conforms: false
    how: >-
      the register reaches this module only as a forwarded option, never by importing the case
      module — but draft-assessment-text.ts's judge found the field is typed
      `readonly consolidationRegister: ConsolidationRegister` (non-optional), while the node declares
      `consolidation_register` without `required: true` and states "absent, the consolidation step
      keeps whatever register its own adapter defaults to" — a value this type cannot express, so the
      caller is forced to invent a register for a version that declared none.
    observed_at:
      - src/investigation/draft-assessment-text.ts
  - node: domain/knowledge/consolidation-register
    conforms: true
    how: >-
      the register enters as its own imported type and is forwarded untouched; the node's closed
      pair ("formal or plain, nothing else") is enumerated nowhere in this file.
    encoded_at:
      - src/investigation/draft-assessment-text.ts
  - node: domain/investigation/field-semantics
    conforms: false
    how: >-
      field-semantics.ts's own type and read function match the node's attributes exactly (name
      required, type and description read where the schema states them, "no other content of that
      schema is read or validated"). citation-validation.ts's judge found a sibling structural reader
      in that same file attributes the identical structural read to "domain/integration/capability's
      own decision-log entry", which "settled only how the schema is carried, never how its content
      is read", rather than to this node, which already states the fact.
    observed_at:
      - src/investigation/field-semantics.ts
      - src/investigation/citation-validation.ts
  - node: rules/investigation/an-answer-arrives-within-the-declared-deadline
    conforms: false
    how: >-
      opened as a candidate: the node states a diagnosis's own total ("twenty seconds ... two of
      overhead and margin, seven of collection, five of judgment, four of writing and two of
      persistence") for the full pipeline. production-simulate-hypothesis.factory.ts stamps the
      identical `TOTAL_DEADLINE_BUDGET_MS = 20_000` onto an operation that "never reaches
      consolidation" and reaches neither writing nor persistence, so six of those twenty seconds
      budget stages that never execute — a total the specification does not decide for this narrower
      operation. The literal is separately duplicated in production-simulate.factory.ts, so a change
      to the decided total has two places in code to land and no structural link between them.
    observed_at:
      - src/factories/production-simulate-hypothesis.factory.ts
  - node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
    conforms: false
    how: >-
      opened as a candidate: the node states "malformed is nothing declared, never a fault at read
      ... wherever anything reads a schema's content." Both field-semantics.ts and
      citation-validation.ts implement exactly that posture (`return []` / `return no fields` for an
      unparseable or property-less schema) but neither cites this node — field-semantics.ts's own
      docstring attributes the posture to two sibling source modules, and citation-validation.ts's
      docblock presents it as "a data-quality fact this pure check records," citing nothing.
    observed_at:
      - src/investigation/field-semantics.ts
      - src/investigation/citation-validation.ts
notes: >-
  Judgment ran as nine delegations, one per file, spawned together. Two files
  (production-simulate-hypothesis.factory.ts, field-semantics.ts) opened candidate nodes never
  bound to any file in this reconciliation's set — rules/investigation/an-answer-arrives-within-the-declared-deadline
  and rules/integration/a-capability-input-schema-holds-a-well-formed-object — to attribute facts
  their own bound nodes do not settle; neither was bound before, so nothing here closes an existing
  binding for them, and binding them is a future delivery's act. Several findings named no explicit
  node field on the judge's own return; where the finding's own correction or cost text
  unambiguously identified the governing node (e.g. hypothesis-evaluator.port.ts's second finding
  naming domain/investigation/evidence's Description as where the fact belongs), that named node is
  what the finding is folded onto here, rather than spreading it across every node the file's judge
  read — a narrower and more defensible reading than the literal fallback, applied consistently
  across this record. Two convergent findings — field-semantics.ts and citation-validation.ts both
  missing the same citation for the malformed-schema read posture, and hypothesis-evaluator.port.ts
  and anthropic-hypothesis-evaluator.adapter.ts disagreeing about which component and outcome
  answers a foreign citation — were found independently by two separate delegations, which is what
  moved them from a single file's isolated reading to a specification-level gap. Two findings are
  more than a citation gap: draft-assessment-text.ts's judge found the constructed Assessment
  discards usage, elapsed_ms, prompt and register though domain/investigation/assessment requires
  all four, and assessment-consolidator.port.ts's judge found the port's own return type has no slot
  for register at all — the same finding surfacing at both the port and its one caller, which a
  specification change alone will not fix without also widening ConsolidationOutcome and the call
  site.
---
