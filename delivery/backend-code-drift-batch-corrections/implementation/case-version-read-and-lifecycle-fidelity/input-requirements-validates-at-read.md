---
title: readCaseInputRequirements revalidates at every read, excluding capability availability
summary: readCaseInputRequirements now refuses a stored version whose structural or glossary/concept coherence
  fails at that reading, the same way readCase does, while leaving a missing or duplicate capability answerer
  for the derivation to fold into "contributes no attribute," exactly as rules/knowledge/a-case-versions-input-requirements-are-derived
  states.
task: sha256:fd6a0f1e5b7ad389e0d1dcffad12997d1c43130234e93ae7906f75448bc4585f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/case-version-read-and-lifecycle-fidelity-input-requirements-validates-at-read-build-2
files:
- path: src/case/case-query.service.ts
  effect: 'readCaseInputRequirements calls a new private refuseGlossaryIncoherence(theCase, version) immediately
    after structuralCase, before it lists registered capabilities or derives requirements; it throws CaseVersionNotValidError
    when the version''s subject type, any resolution''s outcome/action/recipient, or any collected concept''s
    glossary existence or subject-type acceptance fails, but does not check whether a capability currently
    answers each collected concept. readCase''s own refuseIncoherence is unchanged: it still runs the
    full caseCoherenceViolations, including the capability-availability check, so readCase''s own refusal
    behavior is untouched. Both private methods now delegate their shared throw to a small module-level
    refuseViolations(slug, version, violations) helper instead of duplicating the length check and the
    throw.'
- path: src/case/validate-case-coherence.ts
  effect: exports a new glossaryCoherenceViolations(theCase, glossary) composing exactly vocabularyViolations
    + conceptViolations (subject-type/outcome/action/recipient glossary terms and collected-concept glossary
    existence/subject-type acceptance), with no capability-registry involvement at all. caseCoherenceViolations
    is refactored to compose glossaryCoherenceViolations + capabilityViolations rather than repeating
    the first two calls inline, so it still returns exactly the same total violations it always did and
    readCase's behavior is unaffected.
criteria:
- criterion: readCaseInputRequirements runs over the named stored version the same validator-rule check
    readCase runs over it.
  met: true
  how: 'readCaseInputRequirements runs the same structural check readCase runs (structuralCase, unchanged)
    and the same glossary/vocabulary/concept coherence check readCase runs -- both now call the shared
    glossaryCoherenceViolations, so a subject-type, outcome, action, recipient, or collected-concept glossary
    failure refuses both reads identically. It excludes only the capability-availability check (capabilityViolations
    -- the every-collected-concept-has-a-read-only-capability-class check, a node this task does not implement),
    because rules/knowledge/a-case-versions-input-requirements-are-derived, one of the three nodes this
    task implements, explicitly carves a concept with no answering or more than one answering capability
    out of refusal for this exact read, requiring the derivation to fold it into "contributes no attribute"
    instead. Recorded below as an inference: the criterion''s literal phrasing is read in light of the
    bound derivation node''s own text rather than as requiring a byte-for-byte identical call.'
- criterion: A read naming a stored version for which a validator rule does not hold at that reading answers
    no input requirements at all.
  met: true
  how: refuseGlossaryIncoherence throws before everyRegisteredCapability is read or deriveCaseInputRequirements
    is called, for every structural or glossary/concept coherence violation. A concept with no answering
    (or more than one answering) capability is not, for this read, a validator rule failing -- rules/knowledge/a-case-versions-input-requirements-are-derived
    states it is instead a condition the derivation itself folds into "contributes no attribute" -- so
    that specific condition alone does not refuse the read and reaches deriveCaseInputRequirements to
    be folded there, exactly as the bound node requires.
- criterion: That refusal is an HTTP 409 response reporting a CaseVersionNotValidError.
  met: true
  how: refuseGlossaryIncoherence throws the same CaseVersionNotValidError class readCase throws; src/errors/status-map.ts
    already maps it to 409, unchanged by this delivery, and the HTTP layer reads that map generically
    without a route-specific branch.
- criterion: That refusal is not the generic refusal a domain error the status map does not name receives.
  met: true
  how: CaseVersionNotValidError remains a named entry in STATUS_BY_ERROR_CLASS, so statusForError resolves
    it to 409 rather than falling through to the unmapped-error path.
- criterion: That refusal is not a CaseNotFoundError.
  met: true
  how: refuseGlossaryIncoherence's throw site is distinct from heldVersion's CaseNotFoundError throw;
    the two errors answer different conditions and neither call site can produce the other's class.
- criterion: A read naming a slug, or a slug and version, that no stored case version answers is still
    refused as a CaseNotFoundError.
  met: true
  how: heldVersion(this.caseStore, slug, version) is untouched and still runs first, throwing CaseNotFoundError
    before structuralCase or refuseGlossaryIncoherence are ever reached.
- criterion: A read naming a stored draft version every validator rule holds for is not refused by this
    check.
  met: true
  how: glossaryCoherenceViolations carries no state condition -- draft or released -- so a draft whose
    subject-type/outcome/action/recipient terms and collected concepts all resolve in the glossary produces
    zero violations and the method proceeds to derive requirements exactly as before.
- criterion: A read naming a stored version every validator rule holds for still answers one case-input-requirement
    per subject attribute that a capability answering a concept in the version collection plan names in
    properties.
  met: true
  how: deriveCaseInputRequirements and its helpers in case-input-requirements.ts are unmodified; the gate
    only decides entry to that unchanged derivation, never its logic.
- criterion: A read naming a stored version every validator rule holds for still names separately each
    resolved capability whose own stored input schema does not currently hold a well-formed shape.
  met: true
  how: capabilities_with_malformed_input_schema is produced by the same unmodified foldConcept/hasWellFormedInputSchema
    path in case-input-requirements.ts, reached the same way once refuseGlossaryIncoherence passes; this
    condition is orthogonal to capability-availability and untouched by the exclusion.
nodes:
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/case/case-query.service.ts
  how: 'readCaseInputRequirements now reads a stored version as a case only while its structural rules
    (already run via structuralCase) and its glossary/vocabulary/concept coherence rules (now run via
    refuseGlossaryIncoherence) hold at that reading, mirroring readCase''s own standing check for those
    rule families. The capability-availability family is governed by a separate node (rules/knowledge/every-collected-concept-has-a-read-only-capability,
    not in this task''s implements) and, per rules/knowledge/a-case-versions-input-requirements-are-derived
    below, is deliberately excluded from this read''s own refusal -- readCase''s own gate is untouched
    and still covers it there. Replay''s declared exception is untouched: replayCase is a separate function
    this delivery does not modify.'
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/case/case-query.service.ts
  how: the refusal readCaseInputRequirements now raises for a structural or glossary/concept coherence
    failure is the same named CaseVersionNotValidError the node requires, mapped to 409 in src/errors/status-map.ts
    (unchanged), kept apart from the generic unmapped-error refusal by being a named map entry and apart
    from CaseNotFoundError by being thrown from a distinct call site (heldVersion still owns that error).
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
  how: 'the node''s explicit carve-out -- a concept the collection plan holds that no registered capability
    currently answers, or that more than one currently answers, contributes no attribute rather than failing
    the read -- is now encoded directly in the shape of the gate: refuseGlossaryIncoherence (case-query.service.ts)
    and glossaryCoherenceViolations (validate-case-coherence.ts) compose only the glossary/vocabulary/concept
    checks, deliberately omitting capabilityViolations, so that condition reaches deriveCaseInputRequirements
    (case-input-requirements.ts, unmodified) to be folded there as the node requires. The node''s other
    two clauses -- an attribute''s required flag from any answering capability''s own schema, and the
    separate naming of a capability whose own stored input schema is malformed -- are still not reached
    by any criterion of this task and remain the derivation''s own unmodified logic, per the REMAINDER
    already recorded in this task''s Notes.'
inferences:
- inferred: readCaseInputRequirements's validator-rule gate runs the same structural check and the same
    glossary/vocabulary/concept coherence check readCase runs, but excludes the capability-availability
    check (capabilityViolations) that readCase's own gate still includes -- read narrower than criterion
    1's literal phrasing ("the same validator-rule check readCase runs over it") would suggest taken alone.
  from: 'rules/knowledge/a-case-versions-input-requirements-are-derived''s own text, one of the three
    nodes this task implements, which explicitly states that a concept the collection plan holds that
    no registered capability currently answers (or that more than one currently answers) "contributes
    no attribute to this set" rather than failing the read -- a specific rule for this exact derivation
    read that a failure-diagnostician''s review of the captured run''s one failing pre-existing test (case-query.service.spec.ts,
    the capability-freshness test expecting [] rather than a refusal when no capability yet answers a
    concept) surfaced as contradicted by the first, literal implementation. The narrower reading resolves
    the two statements together rather than overriding either: the shared portion of criterion 1 (structural
    + glossary/concept coherence) is still implemented identically to readCase.'
preserved:
- 'readCase''s own refusal behavior, unchanged: its refuseIncoherence still runs the full caseCoherenceViolations,
  including the capability-availability check, so a missing or duplicate capability answerer still refuses
  readCase exactly as before this delivery.'
- replayCase's exception from validation -- it reads its pinned version without running any coherence
  check, and this delivery does not touch replayCase or trustedCaseOf.
- CaseNotFoundError as the refusal for a slug or slug-and-version no stored case version answers, via
  the unmodified heldVersion helper.
- deriveCaseInputRequirements's existing computation of requirements and capabilities_with_malformed_input_schema,
  unmodified in case-input-requirements.ts.
- the existing 409 mapping for CaseVersionNotValidError in src/errors/status-map.ts and the generic HTTP
  error-envelope wiring in case-input-requirements.controller.ts/.routes.ts, neither touched.
- diagnose.controller.ts's existing call sequence, which already calls readCase (running the full coherence
  check, capability-availability included) before it calls readCaseInputRequirements for the same pinned
  version -- unaffected by narrowing readCaseInputRequirements's own gate.
- caseCoherenceViolations's total output for any caller other than readCase's own refuseIncoherence (e.g.
  validateCaseCoherence) -- refactored to compose glossaryCoherenceViolations + capabilityViolations rather
  than duplicating the first two checks, but returning the same violations list as before for the same
  inputs.
deferred:
- what: the two remaining clauses of rules/knowledge/a-case-versions-input-requirements-are-derived that
    govern the derivation's own content (an attribute's required flag from any answering capability's
    own schema, and the separate naming of a capability whose own stored input schema is malformed) are
    not reached by any criterion of this task.
  why: the task's own Notes record this as REMAINDER -- it belongs to the task that implements the derivation
    itself, which this plan does not cover; this task adds only the validation gate ahead of it.
- what: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle is not reached by any criterion
    here.
  why: the task's own Notes record this as REMAINDER, belonging to the sibling task on the lifecycle operation
    itself (case-version-state-from-canonical-list) in the same epic.
- what: whether a replay (replayCase) should also revalidate its pinned version before answering input
    requirements over it is left as the task's own Notes recorded it.
  why: the task's own Notes flag this UNDERDETERMINED -- no criterion here restricts or requires revalidating
    a replay, and rules/knowledge/validation-runs-at-every-read declares replay an express exception;
    this delivery leaves replayCase untouched rather than resolving that tension, which only a person
    settles per the framework's own rule on an UNDERDETERMINED note.
---
## What it is
readCaseInputRequirements now calls a new refuseGlossaryIncoherence check before deriving input requirements, refusing a stored version whose structural or glossary/vocabulary/concept coherence fails at that reading, the same way readCase does for those same rule families.
It deliberately excludes the capability-availability check readCase's own gate still runs: rules/knowledge/a-case-versions-input-requirements-are-derived states a concept with no (or more than one) currently answering capability contributes no attribute to the derived set, rather than failing the read, and the derivation already folds that absence -- so the gate leaves it there instead of refusing.
validate-case-coherence.ts now exports glossaryCoherenceViolations (vocabulary + concept checks only) alongside the existing caseCoherenceViolations (which composes it with capabilityViolations, unchanged in total output), so readCase's own behavior is untouched.
## Notes
A first version of this delivery ran the identical caseCoherenceViolations readCase runs, matching criterion 1's literal phrasing, but its captured suite run failed a pre-existing test (case-query.service.spec.ts:805) that directly encodes the derivation node's own carve-out for a currently-unanswered concept. A failure-diagnostician confirmed the cause as code and named the correction; this record reflects the revised implementation, which resolves the two statements by narrowing the shared check to structural and glossary/concept coherence, leaving capability availability to the derivation as the bound node requires.
The task's own Notes flag an UNDERDETERMINED tension over whether a replay should also revalidate its pinned version; this delivery leaves replayCase untouched, honoring the node's stated replay exception rather than resolving that tension, which only a person settles.
Two REMAINDER clauses the task's Notes name are not reached by this delivery: the derivation's own remaining content clauses (a sibling task's scope) and the lifecycle-movement rule (the sibling task in this epic).
