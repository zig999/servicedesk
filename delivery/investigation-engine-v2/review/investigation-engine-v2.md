---
title: Review of investigation-engine-v2, the whole initiative as one change
summary: 'Four passes over the 11 delivered tasks'' own file set: coverage finds 5 of 39 criteria uncovered or partial (mostly fitness-test files the pass was not given, plus two genuine cross-stage/documentation gaps); specification conformance finds 4 places source states or realizes a fact the specification does not quite back; standard conformance finds 4 departures (duplicated test-sweep logic, a hand-assembled schema, filesystem persistence, duplicated key-join logic); failures did not run because the captured run passed cleanly.'
reviewed:
- src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
- src/__tests__/unit/case/parse-case-document.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/consolidation-register.spec.ts
- src/__tests__/unit/investigation/diagnose.spec.ts
- src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/idempotency-key.spec.ts
- src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
- src/__tests__/unit/investigation/idempotency-resolution.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/observation-source.port.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/investigation/subject.spec.ts
- src/case/case.ts
- src/case/parse-case-document.ts
- src/case/validate-case-coherence.ts
- src/errors/investigation-write-deadline-exceeded.error.ts
- src/errors/requester-required.error.ts
- src/errors/subject-attribute-not-in-glossary.error.ts
- src/errors/subject-carries-no-attribute.error.ts
- src/factories/diagnose-entry-point.factory.ts
- src/factories/diagnose.factory.ts
- src/factories/investigation-store.factory.ts
- src/glossary/terms.ts
- src/investigation/assessment-consolidator.port.ts
- src/investigation/consolidation-register.ts
- src/investigation/diagnose.ts
- src/investigation/diagnosis-run-registry.ts
- src/investigation/draft-assessment-text.ts
- src/investigation/evidence-collection-stage.ts
- src/investigation/fake-assessment-consolidator.adapter.ts
- src/investigation/fake-observation-source.adapter.ts
- src/investigation/idempotency-key.ts
- src/investigation/investigation-factory.ts
- src/investigation/observation-source.port.ts
- src/investigation/resolve-and-narrow-input.ts
- src/investigation/run-diagnosis.ts
- src/investigation/subject-attribute-value.ts
- src/investigation/subject.ts
tasks:
- task/assessment-consolidation/assessment-consolidator-port-and-fake
- task/assessment-consolidation/case-coherence-optional-consolidation-register
- task/assessment-consolidation/draft-assessment-text-consumes-consolidator
- task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth
- task/diagnose-entry-point/diagnose-payload-and-window-dedup
- task/diagnose-entry-point/diagnose-pipeline-composition
- task/subject-identity-rework/evidence-collection-stage-subject-passthrough
- task/subject-identity-rework/idempotency-key-subject-attributes
- task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject
- task/subject-identity-rework/observation-source-subject-shape
- task/subject-identity-rework/subject-value-object
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/review-investigation-engine-v2) passed cleanly across install, typecheck, lint, secret-scan and test — there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
coverage:
- criterion: The port's consolidate operation takes every required hypothesis's evaluation (verdict, reason when present, citations), the evidence those citations name, and the pinned case's consolidation register, and returns text alone.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers the text seeded for the evaluations, evidence and consolidation register a call carries
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its consolidation register alone, answering each register its own seeded text
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its evaluations, throwing for a set nothing was seeded for
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: distinguishes a call by its evidence, throwing for an evidence set nothing was seeded for
- criterion: The consolidator never returns or decides an outcome, a referral or a determining hypothesis.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers text alone, never an object carrying an outcome, a referral or a determining hypothesis
- criterion: Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: ships exactly one concrete class implementing IAssessmentConsolidator
  why: this exact criterion text is stated by two tasks (assessment-consolidator-port-and-fake and observation-source-subject-shape). For the assessment-consolidator port it is covered by the test named above; for the observation-source port, the sweep that would prove it (observation-source-modules.spec.ts) exists in the repository but was not part of the test file set this review's coverage pass was given
- criterion: The investigation domain module housing the consolidator imports no LLM client.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
    name: the assessment-consolidator modules import no LLM or provider client, and no framework or driver beside them
- criterion: A case document declaring consolidation_register formal or consolidation_register plain parses into a Case carrying that value.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring consolidation_register formal into a case carrying it
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring consolidation_register plain into a case carrying it
- criterion: A case document omitting consolidation_register parses successfully, never refused for the field's absence.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document that omits consolidation_register without refusing it, and leaves the key off the returned case
- criterion: A consolidation_register value outside formal or plain is refused, collected together with any other structural or coherence violation the same document holds, never thrown on the first violation found.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a consolidation_register declared as %s
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: collects a consolidation_register violation together with another structural violation in one refusal, never throwing on the first found
- criterion: The Case that parse-case-document holds and returns carries consolidation_register through when the raw document declares it, rather than dropping it.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring consolidation_register formal into a case carrying it
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring consolidation_register plain into a case carrying it
- criterion: The text draft-assessment-text produces equals the consolidator's returned text for the same narrowed input and register.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: answers text equal to what the consolidator returns for narrowedInput's own evaluations and evidence together with the given register
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: answers the register-specific text seeded for the register actually given, not the text seeded for the other register
- criterion: draft-assessment-text imports nothing from the case module, preserving its existing zero-import fitness guarantee.
  state: uncovered
  why: the file that would prove this, draft-assessment-text-modules.spec.ts, exists in the repository but was not part of the test file set this review's coverage pass was given; draft-assessment-text.spec.ts's own comment says explicitly that this guarantee is not repeated there
- criterion: draft-assessment-text receives the consolidation register as an explicit input parameter, never reading it from a case import.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: lets the consolidation register given in options alone decide which seeded text answers, proving it reaches this call as an explicit input rather than a value fixed in advance
  why: the explicit-parameter half is proven; the never-from-a-case-import half depends on the zero-import guarantee, which is draft-assessment-text-modules.spec.ts's job and that file was not in the set this pass read
- criterion: The assessment's outcome, referral and determining hypothesis remain exactly what the case's resolve-outcome returned, unaffected by the consolidator call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: carries resolved's own outcome, referral and determining hypothesis through unchanged, regardless of what the consolidator answers
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: carries no determining_hypothesis field at all — not even present with an undefined value — when resolved carries none
- criterion: The assessment exposes only its text to the customer; outcome, referral, verdicts and evidence stay operational-only.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: exposes only outcome, referral, determining_hypothesis and text — never a verdict or evidence field — on a confirmed-path answer
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: exposes only outcome, referral and text — no determining_hypothesis, verdict or evidence field — on a fallback-path answer
- criterion: Given a confirmed outcome, the narrowed input still carries every required hypothesis's evaluation, not only the one that confirmed.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries every required hypothesis's own evaluation, not only the one that confirmed, when one hypothesis confirms
- criterion: Given no confirmation, the narrowed input still carries every required hypothesis's evaluation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries every required hypothesis's own evaluation when none confirms
- criterion: The narrowed input never carries a hypothesis's criterion, the case's when_to_use, or a hypothesis outside those the case requires evaluation of.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: never carries a hypothesis's own criterion or the case's when_to_use text
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: excludes an evaluation for a hypothesis the case does not require evaluation of
- criterion: The narrowed input carries exactly the evidence its included citations name, no more.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: excludes evidence from evidenceByHypothesis that no included citation names
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries a concept once, in first-cited order, when more than one required evaluation cites it
- criterion: A diagnose call missing requester is refused before any investigation starts.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: refuses a diagnose call with no requester before starting any investigation
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: refuses a diagnose call whose requester is an empty string, the same as one that is missing altogether
- criterion: A diagnose call carrying a ticket_ref that repeats subject type, the whole attribute-value set, case and that ticket_ref within the window returns the existing completed investigation without starting a second one.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: returns the existing completed investigation for a repeated ticket_ref within the window, without starting a second run
- criterion: A diagnose call carrying a ticket_ref that repeats those same fields while the first matching call is still in progress joins it rather than starting a second investigation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: joins the same in-flight run for a repeated ticket_ref submitted while the first call has not settled yet
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: lets a joining call inherit the same rejection as the run it joined, rather than hanging or answering something else, when that run later fails
- criterion: A diagnose call carrying no ticket_ref always starts its own investigation, never matched against any prior call regardless of how closely subject, case or timing coincide.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: always starts a fresh run when no ticket reference is given, even for two otherwise-identical calls
- criterion: requester and ticket_ref are read from the diagnose payload itself, never resolved from any other source.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: passes the payload's own requester and ticket_ref through to the fresh run unchanged
  - file: src/__tests__/unit/investigation/diagnose.spec.ts
    name: threads an absent ticket_ref to the fresh run as an empty string, the mandatory field run-diagnosis.ts already declares
- criterion: The composition returns an assessment only after the investigation has been written; no assessment is returned without a corresponding record.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with the written investigation's own assessment
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: propagates the store's own refusal when an investigation with this id is already stored, rather than returning an assessment
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: refuses the second of two concurrent runs for the same investigation id once the first has already written it, never producing two assessments for one record
- criterion: When persistence does not conclude within what remains of the declared deadline, the caller receives an error, not an assessment.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not conclude within what remains of the declared deadline
- criterion: The whole run responds within the declared total deadline, with each stage receiving no more than the minimum of its nominal budget and what remains at that point.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence at what remains of the declared deadline when that is smaller than the nominal two-second budget
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: clamps persistence's own bound to zero rather than negative, once the given deadline has already elapsed relative to now
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: tightens judgment's own deadline to no more than the nominal five-second budget, even where the declared deadline leaves far more room
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: tightens judgment's own deadline to no more than what remains of the declared deadline, when that is smaller than the nominal five-second budget
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: forwards its own (now, deadline) pair into collection unmodified, letting a call finish just under a tight propagated deadline
  why: 'each stage''s own per-stage bound is proven, but the criterion''s own cross-stage claim — that the whole run stays under the declared total even when an earlier stage runs long — is contested rather than proven: the delivered code does not subtract a prior stage''s real elapsed time from a later stage''s window (see this review''s own specification-conformance finding and the proof''s own recorded disagreement), and no test in this set exercises the compounding case'
- criterion: The completed Investigation pins the case by slug, version and hash, together with the model, the prompt version and the evidence.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: pins the case by slug, version and hash, the model, the prompt version and the evidence this run actually collected, in the written investigation
- criterion: The composition takes now and the deadline as explicit parameters and never reads the system clock internally.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: 'reads no system clock anywhere in its own body: no Date.now(), bare new Date() or performance.now() call appears in run-diagnosis.ts'
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: computes the persistence deadline from the given now/deadline pair alone, unaffected by the real system clock
- criterion: The investigation the composition runs is exactly the case the knowledge context published, pinned by content at the start of the request.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: runs and pins exactly the case object given to each call, never a case any other source might have published
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: imports no case-fetching port — case-query and case-store are absent from its own module, so nothing inside it could re-resolve the case itself
- criterion: Each concept's observe-concept call in a collection run receives the subject's governed type and its whole attribute-value set.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: passes a subject carrying several attribute-value pairs to every concept's observe-concept call whole, with no pair selected out
- criterion: No attribute is filtered from the subject before any concept's call is dispatched.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: passes a subject carrying several attribute-value pairs to every concept's observe-concept call whole, with no pair selected out
- criterion: Existing per-concept collection results untouched by the shape change — one evidence per concept, current deadline behavior — are unaffected.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: produces exactly one evidence per concept in the collection plan, deduplicating a concept two hypotheses both collect, each carrying its resolved capability and the stage's own now as observed_at
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a timeout at the stage's own seven-second ceiling for a capability declaring ten seconds, unaffected by the three seconds its own declared timeout still had left
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a timeout at a ceiling smaller than the nominal seven seconds when the propagated deadline is nearer
- criterion: Two requests with identical subject type, identical whole attribute-value set, case and ticket reference produce the same key.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: answers the identical string for two keys carrying the same subject type, the same whole attribute-value set, case reference and ticket reference
- criterion: A request whose attribute-value set differs from another's, even sharing the same subject type and case, produces a different key.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: answers a different string when a subject attribute-value pair's value differs, even sharing the same subject type and case
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: answers a different string when the subject carries an extra attribute-value pair, even sharing the same subject type and case
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: answers a different string when the subject carries only a subset of the seeded attribute-value pairs, even sharing the same subject type and case
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: answers a different string when an attribute-value pair's attribute name differs while its value stays the same, even sharing the same subject type and case
- criterion: The key module's own documentation states why the subject's type and attribute-value set now compose the key, replacing the earlier two-flat-strings reasoning.
  state: uncovered
  why: nothing in the given test set reads idempotency-key.ts's own comments or documentation text; every test exercises idempotencyKeyOf's runtime behavior, none of them assert anything about the module's own prose
- criterion: Building an investigation whose subject carries no attribute-value at all is refused, naming the violated invariant.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when the subject carries no attribute-value at all, naming the violated invariant
- criterion: Building an investigation whose subject names an attribute the glossary does not hold is refused, naming the violated policy.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when the subject names an attribute the glossary does not hold, naming the violated policy
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: names every attribute the glossary does not hold together, in one refusal
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: names an attribute missing from the glossary once, no matter how many attribute-value pairs of the subject name it
- criterion: A subject whose type and every attribute-value pair are valid is carried unchanged into the built Investigation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: carries a subject whose type and every attribute-value pair are valid, unchanged, into the built Investigation
- criterion: observe-concept's parameter carries the subject's governed type and its whole attribute-value set, not a bare id.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: passes a subject carrying several attribute-value pairs to every concept's observe-concept call whole, with no pair selected out
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for its own governed type, not the outcome later seeded for a different type sharing the same attribute-value set
- criterion: No attribute is selected or dropped before the call reaches the port; the whole set the caller supplied is what the port receives.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: passes a subject carrying several attribute-value pairs to every concept's observe-concept call whole, with no pair selected out
- criterion: The fake adapter's fixture key is composed from every attribute-value pair, following the existing '::'-joined composite-key convention, rather than from a bare id.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws for a subject carrying only a subset of the attribute-value pairs seeded for the whole set, rather than matching the subset to it
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: answers the outcome seeded for a subject's own second attribute-value pair, not the outcome later seeded for one sharing only its first pair
  - file: src/__tests__/unit/investigation/observation-source.port.spec.ts
    name: throws when a subject supplies the same attribute-value pairs as a seeded one but in a different order, since no canonical ordering is applied before they are joined
  why: every pair of the attribute-value set is shown to matter to the fixture match, but none of these tests inspects the literal key string, so the specific '::'-joined format the criterion names is not verified — a fake using any other separator would pass every one of these tests identically
- criterion: A Subject value requires a subject type drawn from domain/glossary/subject-type and a set of subject-attribute-value pairs.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: builds a Subject carrying exactly the given subject type and the whole given attribute-value set
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: never carries a bare id field, only the governed type and the attribute-value set
  why: the shape half is proven, but nothing in the given set checks a subject type against the governed domain/glossary/subject-type vocabulary — buildSubject is exercised only with an arbitrary string
- criterion: Constructing a Subject with an empty attribute-value set is refused, per a-subject-carries-at-least-one-attribute.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: refuses to build a Subject with no attribute-value at all
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: names the subject type in the refusal error, in both its message and its context
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: does not throw when given exactly one attribute-value pair, the boundary the refusal sits against
- criterion: One subject-attribute-value pair carries exactly one governed attribute name and one string value.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: preserves each attribute-value pair exactly as given, carrying only its own attribute name and value
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when the subject names an attribute the glossary does not hold, naming the violated policy
- criterion: The inline Subject type previously left duplicated in observation-source.port.ts is replaced by this canonical module rather than kept as a second declaration.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: flows unchanged through observation-source.port.ts's own Subject-typed observeConcept call, with no adaptation between the two modules
  why: this test only shows the two types are structurally compatible, which TypeScript would allow even if the port still declared its own separate, identically-shaped Subject type; nothing in the given set reads observation-source.port.ts's own source to confirm the inline declaration was removed
findings:
- pass: conformance
  file: src/investigation/diagnose.ts
  where: resolveRepeat(), the IdempotencyKey assembly that builds the repeat-request key
  evidence: 'rules/investigation/an-investigation-is-idempotent-within-a-window: "a request repeating subject type, the subject''s whole set of attribute-values, case and a given ticket reference returns the existing investigation"; diagnose.ts: `caseReference: payload.case.slug,`'
  cost: two diagnose calls naming the same case slug but a different version and hash are treated as the same repeated request, so a second call can be answered from, or joined to, an investigation run against different case content than the one it itself pinned. Elsewhere the specification treats a case's identity as slug, version and hash together (rules/investigation/replay-is-pinned, domain/knowledge/case), so a reader taking "case" in the idempotency rule to mean that same identity will not find that guarantee honored here.
  correction: either widen caseReference to the case's full content identity (slug, version and hash), or have the specification state explicitly that case for repeat-matching purposes means the slug alone.
- pass: conformance
  file: src/investigation/idempotency-key.ts
  where: idempotencyKeyOf() and its own module comment describing what makes two keys equal
  evidence: 'domain/investigation/subject: "paired with the whole set of attribute-value pairs that identify the instance"; idempotency-key.ts''s own comment: the caller supplies the attribute order, since neither this function nor domain/investigation/subject states a canonical one to sort by — realized as `[key.subject.type, ...attributeParts, key.caseReference, key.ticketRef].join(''::'')`'
  cost: two requests carrying the identical subject type, the identical set of attribute-value pairs (assembled in a different order), the same case and the same ticket reference are not recognized as a repeat, so an-investigation-is-idempotent-within-a-window's own guarantee silently fails to hold for a "whole set" that happened to arrive in a different order, even though the specification consistently calls the subject's identity a set rather than a sequence.
  correction: canonicalize the attribute-value pairs (e.g. sort them) before joining, so two subjects carrying the same set match regardless of assembly order — or have the specification state that order is itself part of what a repeated whole set of attribute-values must match.
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: the module header comment on per-stage (now, deadline) intersection, and the draftAssessment call inside runDiagnosis()
  evidence: 'constraints/the-deadline-is-an-absolute-propagated-instant: "every stage receives the minimum of its nominal budget and the remaining time"; run-diagnosis.ts''s own comment: drafting takes no deadline parameter at all and is called unbounded'
  cost: the consolidator call inside draftAssessment can run past the declared total deadline with nothing to race it against the remaining time, so a slow or hung consolidation call lets the whole diagnosis exceed the twenty-second total the constraint's own fitness clause promises; the guarantee holds for collection, judgment and persistence but not for the writing stage.
  correction: draftAssessment (and the assessment-consolidator port it calls) would need to accept the propagated now/deadline pair, intersected with a nominal writing budget the way the other stages already are, and degrade or race against it the same way.
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: the defaultConsolidationRegister field and its use inside runDiagnosis()
  evidence: 'domain/knowledge/case: "absent, the consolidation step keeps whatever register its own adapter defaults to"; run-diagnosis.ts realizes this as `consolidationRegister: options.case.consolidation_register ?? options.defaultConsolidationRegister`'
  cost: which register a case with no declared one is written in is no longer a fact about the adapter — it is a value every deployment must configure and every call supplies explicitly, since IAssessmentConsolidator.consolidate()'s own required parameter makes it structurally impossible for any adapter to ever exercise "its own default." A reader who goes looking for that default inside an adapter, as the node describes it, will not find it there.
  correction: either let the port accept an optional consolidationRegister and have the concrete adapter supply its own default when absent, or have the specification state that the fallback register is a deployment configuration value rather than a property of the adapter.
- pass: standard
  file: src/__tests__/unit/investigation/diagnosis-run-registry.spec.ts
  where: the module-purity section, IMPORT_SPECIFIER_PATTERN constant
  cites: MNT-03
  evidence: /** Matches static imports, re-exports and dynamic imports... the same pattern observation-source-modules.spec.ts already establishes */\nconst IMPORT_SPECIFIER_PATTERN = /(?:from|import)\\s*\\(?\\s*['\"]([^'\"]+)['\"]/g;
  cost: the comment names the pattern as already established elsewhere and retypes it anyway; the identical regex and helper appear again, verbatim, in four other spec files within this same change. A fix to what counts as an import has to be found and applied in five files, and a copy the fix misses keeps passing on a pattern the others no longer use.
  correction: extract the regex and specifier-extraction helper into one shared test-support module and import it from every spec that needs it.
- pass: standard
  file: src/case/parse-case-document.ts
  where: documentProblems and its per-field helpers
  cites: STK-08
  evidence: 'function stringProblems(value: unknown, subject: string): string[] { if (value === undefined) { return [`${subject} is undeclared`]; } if (typeof value !== ''string'') { return [`${subject} is not a string`]; } return value === '''' ? [`${subject} is empty`] : []; }'
  cost: the whole shape of the case document is checked by a hand-assembled chain of guard functions rather than by one declared schema. Every new required attribute needs its own hand-written clause added in the right place, and a clause nobody added lets a malformed document through with a shape nothing checked.
  correction: declare the case document's structural shape as one Zod schema and drive documentProblems from its own issues, keeping the existing refuse-once-with-every-violation-named behavior by mapping the schema's issue list into the same problem strings.
- pass: standard
  file: src/factories/investigation-store.factory.ts
  where: createInvestigationStore
  cites: STK-12
  evidence: 'export function createInvestigationStore(dataDirectory: string): IInvestigationStore { return new FileInvestigationStore(dataDirectory); }'
  cost: this wires the investigation write path to a plain directory on disk rather than to PostgreSQL, so writing an investigation never reaches the one datastore the standard says the service may talk to at all; the filesystem functions as the object store the rule forbids introducing. This factory is the fourth of this shape in the tree, so each new context added this way deepens a persistence layer the standard does not recognize.
  correction: back IInvestigationStore with the pg driver against PostgreSQL, using parameterized queries, or record in the project's own registry that persistence is exempted from this rule and why.
- pass: standard
  file: src/investigation/fake-observation-source.adapter.ts
  where: fixtureKey
  cites: MNT-03
  evidence: 'function fixtureKey(concept: string, subject: Subject): string { const attributeParts = subject.attributes.flatMap((pair) => [pair.attribute, pair.value]); return [concept, subject.type, ...attributeParts].join(''::''); }'
  cost: idempotency-key.ts's idempotencyKeyOf computes the identical attribute-value flattening rather than calling this function; each module's own comment cites the other as the source of the convention, which is a convention followed by copying, not a function reused. A change to how a pair is flattened has to be made in both files, and whichever copy is missed produces a silently different key from the one the fix was meant to apply everywhere.
  correction: extract the attribute-value flattening (and the '::' join it feeds) into one exported function in one module, and have both fixtureKey and idempotencyKeyOf call it.
---

## What it is

Coverage, specification-conformance and standard-conformance evidence over investigation-engine-v2's whole delivered change — 11 tasks, 43 files. The failures pass did not run: the captured run (install, typecheck, lint, secret-scan, test) passed cleanly over the whole tree.

## Notes

Two of the specification-conformance findings (run-diagnosis.ts's unbounded drafting stage, and the defaultConsolidationRegister fallback) restate gaps the delivered tasks' own records already disclosed (diagnose-pipeline-composition's own deferred entries; assessment-consolidator-port-and-fake's own contested entry) — recorded here again because this pass reads the source and the specification fresh, never a prior record's own disclosure, and because a departure disclosed once is not a departure a second reading is exempt from finding.
The specification-conformance pass's third and fourth findings (case identity by slug alone in the repeat-request key; attribute-value order not canonicalized before the key join) are new: neither is disclosed in any task's own delivery record.
The standard-conformance pass applied only the 35 of the standard's 59 rules the registry itself marks as decided by reading; the 24 the registry hands to a tool (lint 20, secret-scan 2, typecheck 2) are answered by the captured run alone, which exited 0 on every one of those three steps.
This framework reviews four things and not a fifth: it does not review the specification or the plan themselves, whether the initiative was worth doing, or anything about performance, security posture or operational readiness beyond what the standard's own rules name.
What the passes looked past: the standard-conformance pass noted the fake adapters throw a plain Error rather than a typed error class for an unseeded call, and noted diagnosis-run-registry.ts's try/finally carries no catch — neither is a finding, since the rules naming typed-error and error-handling shape (COR-01 through COR-03) scope to .service.ts/.repository.ts/.middleware.ts files, none of which this change contains.
