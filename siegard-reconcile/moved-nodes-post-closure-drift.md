---
contract_version: siegard-reconcile/1
title: Post-closure specification-text drift over 8 investigation/case files
summary: These 8 files' current behavior is correct as it stands. The trace flagged 4 of their bound nodes
  as moved (the specification's own text changed since the bind, most from the case-lifecycle initiative's
  split of case/hypothesis identity from case-version/hypothesis-revision content); this reconciliation
  reads every node these 8 files are bound to against its current text.
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations against its own collects array and each cited capability's output
    schema, refusing a citation outside collects or naming a field the schema does not declare.
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis behind HypothesisEvaluator, enforcing
    the collection and judgment deadlines, refusing foreign or schema-absent citations, and building one
    verdict per hypothesis from a decided or inconclusive evaluation.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port and its narrowed input type, running behind an adapter
    boundary.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text from the confirmed hypothesis, or the fallback when
    none is confirmed, narrowing its input to only what the outcome needs.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port, holding no infrastructure dependency.
- path: src/investigation/resolve-and-narrow-input.ts
  change: Resolves the case's confirmed hypothesis, or its fallback, and narrows the investigation's input
    to exactly what evaluation and consolidation need.
- path: src/case/validate-case-coherence.ts
  change: Runs the case's full structural coherence check — subject-type acceptance, glossary term existence,
    capability registration and read-only nature, and the named-term/capability-check contract reads —
    collecting every violation and refusing once.
- path: src/fixtures/capability/capability.json
  change: A fixture capability declaration exercised by the coherence checks and capability-registry validations
    above.
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: The port is declared as an interface and only a fake adapter implements it in this file set; consolidation
    runs entirely behind that port boundary.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: runIsolatedCall issues one evaluate() call per hypothesis, run in parallel, with no shared state
    between calls.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: Judgment is performed entirely through the HypothesisEvaluator port; the stage holds no direct
    model/provider dependency.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: The judgment deadline is threaded through as an absolute instant, checked rather than derived from
    a relative duration at call time.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: None of the 8 files import a framework, driver, or provider client; every dependency is a domain
    type or a declared port.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: The evaluate() call's inputs are limited to the hypothesis's own criterion, its evidence, and the
    case context — no open-ended prompt construction.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: Uses the contract's read-capability operation to resolve a concept's current registration.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: Reads the current capability registration for every concept the case collects, exactly as the contract
    states.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: Uses read-vocabulary-term and read-concept to confirm every named term exists in the glossary at
    the moment of reading.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: true
  how: Collects every structural/coherence violation and refuses once, together, rather than one at a
    time.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/integration/capability-nature
  conforms: true
  how: The fixture and the read-only-nature check both hold the capability's nature exactly as the node
    declares it.
  encoded_at:
  - src/fixtures/capability/capability.json
  - src/case/validate-case-coherence.ts
- node: domain/investigation/assessment
  conforms: true
  how: The drafted assessment text is built from exactly the fields the node declares.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: The port and its draft-text implementation match the node's declared responsibility.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/citation
  conforms: true
  how: The citation shape checked here matches the node's declared attributes.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: domain/investigation/evaluation
  conforms: true
  how: The evaluation type constructed and consumed here matches the node's declared shape.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: An inconclusive evaluation's reason is declared exactly as the node states.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: The evidence items checked and threaded through match the node's declared attributes.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/verdict
  conforms: true
  how: One verdict per hypothesis is built exactly as the node declares, from a decided or inconclusive
    evaluation.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: The consolidation register fields read and written here match the node's current declaration.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/knowledge/referral
  conforms: true
  how: The referral shape checked here matches the node's declared attributes.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/resolution
  conforms: true
  how: The resolution shape (outcome, action, recipient) checked here matches the node's declared attributes.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: A citation naming a concept outside the hypothesis's own collects is refused, exactly as the rule
    (in its current text) states.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: A citation naming a field the capability's own output schema does not declare is refused.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: A decided evaluation is refused unless it carries at least one citation.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: An inconclusive evaluation is refused unless it declares its reason.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: A deadline that passes degrades the affected hypothesis's evaluation rather than aborting the whole
    judgment stage.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: Exactly one evaluation is produced per required hypothesis, never fewer or duplicated.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: The confirmed hypothesis (or fallback) resolved here is read from the case's own resolution, never
    inferred elsewhere.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: The consolidator's input type carries only the fields the writing step needs, narrowed from the
    full investigation state.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: A concept collected against a subject type it does not accept is refused, exactly as the rule states.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: Every term the case names is checked for existence in the glossary at the moment of reading.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: Every collected concept's resolved capability is checked for a read-only nature, refusing otherwise.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: The capability check reads the registration as it stands at the moment of reading, via read-capability,
    never a remembered one.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: A collection timeout is reacted to on the judgment side exactly as the scenario describes — degrading
    to no data rather than failing the stage.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: A citation naming a concept outside the hypothesis's own collects is refused, matching the scenario's
    worked example.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/citation-validation.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: A queued judgment call that exceeds its deadline is handled exactly as the scenario describes.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: A concept that does not accept the case's declared subject type is refused, naming the concept
    and the subject type that disagree, exactly as the scenario's worked example.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: When no hypothesis is confirmed, the fallback outcome and referral are used to draft the assessment
    text, exactly as the scenario describes.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: The first confirmed hypothesis in precedence order determines the drafted outcome, exactly as the
    scenario's worked example.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: false
  how: evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext) passes a third argument, caseContext
    (title and when_to_use), but the node's Responsibility reads "Given one hypothesis's criterion and
    its evidence only, return an evaluation that is cited and complete, never inferred" — a reader of
    this node would not expect the port's actual three-argument shape.
  observed_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/case
  conforms: false
  how: 'Several call sites and comments still attribute title, when_to_use, subject, fallback, or the
    collection plan directly to the case identity (e.g. judgment-stage.ts''s `caseContext = { title: theCase.title,
    whenToUse: theCase.when_to_use }`; validate-case-coherence.ts''s namedVocabularyTerms() and conceptViolations()
    doc comments citing domain/knowledge/case for subject, fallback and the collection plan), but the
    node''s current text states these now belong to a case version or a hypothesis-revision, never to
    the case identity directly — a reader chasing these citations to domain/knowledge/case finds the opposite
    of what is claimed.'
  observed_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/hypothesis
  conforms: false
  how: citation-validation.ts's HypothesisCitationContext doc comment and resolve-and-narrow-input.ts's
    NarrowedInput comment both attribute collects/criterion to domain/knowledge/hypothesis, and validate-case-coherence.ts's
    namedVocabularyTerms() comment attributes the hypotheses' resolutions to it as well — but the node's
    current text states its content (criterion, collects, resolution) "belongs to its revisions, never
    to this identity directly".
  observed_at:
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: domain/integration/capability
  conforms: false
  how: 'validate-case-coherence.ts''s declaresTimeout() comment states the capability''s timeout is "the
    integer count of milliseconds," but domain/integration/capability declares timeout only as "type:
    integer" and never states a unit — a reader confirming the millisecond unit against the node will
    not find it stated there.'
  observed_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
notes: 39 of 43 nodes conform and would bind if this record cleared whole, including the 4 nodes trace.py
  --check originally reported as moved (rules/investigation/a-citation-stays-within-the-hypothesis-collects,
  rules/investigation/the-outcome-comes-from-the-case, rules/knowledge/every-collected-concept-has-a-read-only-capability,
  scenarios/knowledge/a-subject-mismatch-refuses-the-case). But 4 other nodes bound to these same files
  carry stale citations in doc comments (attributing a fact to domain/knowledge/case or domain/knowledge/hypothesis
  after the case-lifecycle split moved it to case-version or hypothesis-revision; domain/investigation/hypothesis-evaluator's
  Responsibility not yet naming the caseContext argument; domain/integration/capability never stating
  the millisecond unit the code assumes) — so per the all-or-nothing rule, nothing binds at all this pass,
  not even the 39 that cleared. Fixing the 4 stale citations is a source change (the specification is
  right, the comments are behind it) and a candidate for a /plan-work corrective increment; the capability
  timeout unit is a genuine specification silence (the node never states a unit at all) and a candidate
  for /analyse to decide and disclose. After either is settled, this file set should be reconciled again
  to bind what conforms.
---
