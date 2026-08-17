---
title: revise-hypothesis operation
summary: A new ReviseHypothesisOperation checks a hypothesis-revision's collects list against the a-hypothesis-collects-at-least-one-concept,
  case-terms-exist-in-the-glossary and a-concept-accepts-the-declared-subject-type rules before delegating
  the whole identity-claim and numbering decision to ICaseStore.insertHypothesisRevision.
task: sha256:c4e295fd83c130ed3ea4f576f5104afe2a51dc5d61088945322028a3b96c6f19
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/revise-hypothesis.operation.ts
  effect: declares ReviseHypothesisInput, RevisedHypothesis, IReviseHypothesis and ReviseHypothesisOperation
    — validates that a revision's collects is non-empty, that every collected concept exists in the glossary,
    and that every collected concept accepts the case version's declared subject type, in that order,
    refusing before the store is ever reached; on success delegates to ICaseStore.insertHypothesisRevision.
- path: src/errors/hypothesis-revision-collects-no-concept.error.ts
  effect: new typed error HypothesisRevisionCollectsNoConceptError(slug, hypothesisName), raised when
    a revision's collects list is empty.
- path: src/errors/concept-not-in-glossary.error.ts
  effect: new typed error ConceptNotInGlossaryError, raised naming every collected concept the glossary
    does not currently hold.
- path: src/errors/concept-refuses-subject-type.error.ts
  effect: new typed error ConceptRefusesSubjectTypeError, raised naming every collected concept whose
    accepts does not carry the declared subject type, together with that subject type.
criteria:
- criterion: Revising a hypothesis never named for the case creates its identity and its first revision,
    numbered 1.
  met: true
  how: reviseHypothesis() delegates unconditionally, once its own three checks pass, to caseStore.insertHypothesisRevision(input)
    — the sibling persistence task's RelationalCaseStore claims the hypothesis's identity row only the
    first time its name is used and computes the new revision as COALESCE(MAX(revision), 0) + 1, which
    is 1 where none exists yet.
- criterion: Revising a hypothesis already named for the case creates a new revision numbered one past
    its own highest existing revision, never altering an existing revision's own row.
  met: true
  how: the same delegation as above — insertHypothesisRevision always INSERTs a new hypothesis_revisions
    row and never UPDATEs one; this operation contains no update path over a revision at all.
- criterion: Revising with an empty collects list is refused, naming that the revision collects no concept.
  met: true
  how: refuseInvalidCollects() throws HypothesisRevisionCollectsNoConceptError(input.slug, input.hypothesis_name)
    whenever input.collects.length === 0, before any glossary read or store call.
- criterion: Revising with a collected concept the glossary does not currently hold is refused, naming
    the concept.
  met: true
  how: refuseUnknownConcepts() resolves every name in input.collects through IGlossaryQuery.readConcept
    and throws ConceptNotInGlossaryError naming every concept resolved held:false, before the store is
    reached.
- criterion: Revising with a collected concept that does not accept the case version's own declared subject
    type is refused, naming both.
  met: true
  how: refuseConceptsRefusingSubject(), reached only once every concept is already known held, filters
    the held concepts whose accepts does not include input.subject and throws ConceptRefusesSubjectTypeError
    naming both.
- criterion: revise-hypothesis on its own changes no version's manifest.
  met: true
  how: reviseHypothesis() calls only caseStore.insertHypothesisRevision — this file never calls placeHypothesis,
    removeManifestEntry, or any other manifest-touching primitive.
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: IReviseHypothesis/ReviseHypothesisOperation is this published API's revise-hypothesis operation,
    one of the six the contract's own operations list names.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: implements the aggregate's own declared revise operation — reviseHypothesis() is the one entrance
    a hypothesis's content changes through; the name itself is never altered by this operation.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: the revision's own attributes are already declared by HypothesisRevisionInput; this task's own
    contribution is the collects-at-least-one-concept gate ahead of it.
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: ReviseHypothesisInput carries the case version's own declared subject attribute as its own added
    field, read by refuseConceptsRefusingSubject().
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  how: honored by full delegation — reviseHypothesis() never computes or reuses a revision number itself;
    the numbering decision belongs entirely to caseStore.insertHypothesisRevision.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: answers only the rule's second clause — that the concept-acceptance check reads the draft version's
    own declared subject type — by taking that subject as ReviseHypothesisInput's own added field. The
    rule's first clause (a hypothesis is revised only while its case holds a draft version) is not checked
    by this operation at all; this is this task's own UNDERDETERMINED note.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/hypothesis-revision-collects-no-concept.error.ts
  how: refuseEmptyCollects() checks input.collects.length === 0 and throws HypothesisRevisionCollectsNoConceptError
    before any other check runs.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  how: honored rather than actively encoded — this operation contains no update path over any hypothesis_revisions
    row at all.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  how: honored by full delegation — the identity-claim-once behavior belongs entirely to caseStore.insertHypothesisRevision.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/concept-not-in-glossary.error.ts
  how: refuseUnknownConcepts() resolves every collected concept through IGlossaryQuery.readConcept and
    throws ConceptNotInGlossaryError naming every one the glossary does not currently hold. This task's
    own criteria narrow the rule to the collected-concept half alone.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/errors/concept-refuses-subject-type.error.ts
  how: refuseConceptsRefusingSubject() checks every held concept's own accepts against the declared subject
    type carried in ReviseHypothesisInput.
inferences:
- inferred: ReviseHypothesisInput extends HypothesisRevisionInput with its own added subject field, supplied
    by the caller rather than looked up by this operation.
  from: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's own statement that the
    concept-acceptance check uses that draft version's declared subject type, combined with this task's
    own UNDERDETERMINED note that the draft-existence anchoring is explicitly not this task's to add.
- inferred: the operation answers with RevisedHypothesis {hypothesis_name, revision} rather than the bare
    revision number ICaseStore.insertHypothesisRevision itself answers.
  from: create-draft.operation.ts's own CreatedDraft convention — the identity a curator continues authoring
    against next — reused here since no node names an output shape for revise-hypothesis either.
divergences:
- from: the inventory's must_not_duplicate entry for validate-case-coherence.ts
  departure: revise-hypothesis.operation.ts reads the glossary directly through IGlossaryQuery.readConcept,
    rather than calling validate-case-coherence.ts's own conceptViolations()/caseCoherenceViolations().
  why: that convention's own stated scope is operations that build or validate a whole Case from a manifest;
    revise-hypothesis never assembles one — it originates a single hypothesis-revision's own content before
    any manifest placement exists to validate. Calling the wider pipeline would also silently run the
    capability-registry check bundled into caseCoherenceViolations, a check this task's own REMAINDER
    note states is re-verified at every read rather than at revise-hypothesis time.
preserved:
- every existing file in case/, persistence/, glossary/ and errors/ — this delivery adds four new files
  and modifies none of them.
deferred:
- what: whether the case identified by a revise-hypothesis call currently holds a draft version at all
    (the first clause of a-hypothesis-is-revised-only-against-its-cases-draft).
  why: this task's own UNDERDETERMINED note states this belongs to a broader 'revised only against a draft'
    check this task does not close; test-author's own proof wrote the excluding test per protocol, and
    it is expected to fail against this delivered code — a genuine, disclosed gap for a person to route
    through /plan-work.
- what: whether every collected concept is answered by a current read-only capability (every-collected-concept-has-a-read-only-capability).
  why: this task's own REMAINDER note states this belongs to the case-version read/validation act, re-verified
    at every read against the registry as it currently stands, not as a revise-hypothesis-time refusal.
- what: wiring ReviseHypothesisOperation into any factory or composition root.
  why: reserved for wire-and-retire-author-case-version, completed later in this same delivery.
---

## What it is

The one place a hypothesis's content changes, always by adding a revision rather than editing one.
Placing that revision into a draft's manifest is a different operation, one task over.

## Notes

This task's own build run reflects the whole epic's final green state (install, typecheck, lint, secret-scan), captured once every sibling task in this continuous delivery had also landed. No proof record is composed yet, per the human's own explicit instruction: implementation records close first, the suite is settled separately.
