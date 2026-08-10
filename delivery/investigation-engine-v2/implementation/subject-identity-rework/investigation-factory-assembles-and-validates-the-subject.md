---
title: investigation-factory assembles and validates the subject
summary: investigation-factory now builds the subject from raw entry-point input via subject.ts's buildSubject and refuses through the glossary-source port when an attribute is not a governed glossary term, carrying only a fully valid subject into the built Investigation.
task: sha256:893384fd69ab32fc1bb22a9d3fd9dd2b0acb8cad52a7e1a18e0f74fcdf473128
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-investigation-factory-assembles-and-validates-the-subject-build-2
files:
  - path: src/glossary/terms.ts
    effect: "adds SubjectAttribute (= GlossaryTerm) and widens TERM_VOCABULARIES/TermVocabulary with a fifth entry, subject-attribute, so the vocabulary domain/glossary/subject-attribute describes becomes one the published glossary-query contract can actually resolve a term against; updates the module's own doc comments from four to five vocabularies to match."
  - path: src/errors/subject-attribute-not-in-glossary.error.ts
    effect: "new typed error, SubjectAttributeNotInGlossaryError, naming the subject's type and every attribute name the glossary does not hold, per rules/investigation/a-subject-attribute-is-drawn-from-the-glossary, following the existing name/message/context error shape."
  - path: src/investigation/investigation-factory.ts
    effect: "BuildInvestigationOptions now carries the subject's raw, unvalidated constituent fields (subjectType, subjectAttributes) and a glossary: IGlossaryQuery collaborator, instead of an already-built subject: Subject; buildInvestigation is now async and, before any totality check, calls subject.ts's own buildSubject and then awaits the new refuseAttributesNotInGlossary, which checks every distinct attribute name against the glossary's subject-attribute vocabulary through the given port and throws SubjectAttributeNotInGlossaryError naming every attribute the glossary does not hold; the built, glossary-checked Subject is then carried unchanged into the returned Investigation's own subject field. The existing evidence/evaluation totality checks and pinnedCaseOf are otherwise unchanged."
  - path: src/case/validate-case-coherence.ts
    effect: "adds a commented subject-attribute entry to VOCABULARY_ROLES's exhaustive Record<TermVocabulary, string>, purely so this pre-existing, unrelated case-model module keeps typechecking now that TermVocabulary carries a fifth member; namedVocabularyTerms() is unchanged and still never emits a subject-attribute entry, so no case-coherence behavior changes."
  - path: src/__tests__/unit/investigation/investigation-factory.spec.ts
    effect: "this task's own pre-existing proof, rewritten whole to prove the new async, glossary-checking shape, and stand up a FakeGlossaryQuery test double for the consumed port."
criteria:
  - criterion: "Building an investigation whose subject carries no attribute-value at all is refused, naming the violated invariant."
    met: true
    how: "buildInvestigation calls subject.ts's own buildSubject(subjectType, subjectAttributes) before doing anything else; buildSubject throws SubjectCarriesNoAttributeError(type) when the given attribute-value set is empty, naming the subject's type in both the error's message and its context.type field. buildInvestigation propagates this error unmodified and constructs nothing once it is thrown."
  - criterion: "Building an investigation whose subject names an attribute the glossary does not hold is refused, naming the violated policy."
    met: true
    how: "once buildSubject succeeds, buildInvestigation awaits refuseAttributesNotInGlossary(subject, glossary), which reads every distinct attribute name through the given glossary-source port's readVocabularyTerm('subject-attribute', name) and throws SubjectAttributeNotInGlossaryError, naming the subject's type and every attribute name the glossary does not hold. This is awaited before any totality check or construction."
  - criterion: "A subject whose type and every attribute-value pair are valid is carried unchanged into the built Investigation."
    met: true
    how: "once both refusals pass, buildInvestigation assigns the exact Subject value buildSubject returned to the built Investigation's own subject field, with no destructuring, remapping or additional copy."
nodes:
  - node: domain/investigation/subject
    encoded_at:
      - src/investigation/investigation-factory.ts
    how: "buildInvestigation assembles the canonical Subject from the raw entry-point input via subject.ts's buildSubject, then carries the built value's governed type and whole attribute-value set unchanged into the returned Investigation's own subject field — never filtering or selecting a subset."
  - node: domain/investigation/subject-attribute-value
    encoded_at:
      - src/investigation/investigation-factory.ts
    how: "refuseAttributesNotInGlossary reads each pair's own governed attribute name to check it against the glossary, treating the pair's two halves as the node describes — one governed name checked for existence, its value carried through unchecked."
  - node: domain/glossary/subject-attribute
    encoded_at:
      - src/glossary/terms.ts
      - src/investigation/investigation-factory.ts
    how: "terms.ts adds SubjectAttribute (= GlossaryTerm) and widens TERM_VOCABULARIES to a fifth entry, subject-attribute, matching domain/glossary's own context description; investigation-factory.ts then reads this vocabulary through the glossary-source port to check each attribute name's membership."
  - node: rules/investigation/a-subject-carries-at-least-one-attribute
    encoded_at:
      - src/investigation/investigation-factory.ts
    how: "the refusal itself is subject.ts's own pre-existing buildSubject (unmodified by this task); buildInvestigation calls it before anything else so that building an investigation whose subject carries no attribute-value is refused — satisfied by reuse rather than by re-deciding the invariant here."
  - node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
    encoded_at:
      - src/investigation/investigation-factory.ts
      - src/glossary/terms.ts
      - src/errors/subject-attribute-not-in-glossary.error.ts
    how: "refuseAttributesNotInGlossary reads every distinct attribute name the subject carries through the given IGlossaryQuery's readVocabularyTerm('subject-attribute', name) and throws SubjectAttributeNotInGlossaryError, naming the subject's type and every attribute name the glossary does not hold, refusing the whole build before anything is constructed."
  - node: contracts/investigation/glossary-source
    encoded_at:
      - src/investigation/investigation-factory.ts
    how: "buildInvestigation now takes a glossary: IGlossaryQuery collaborator and calls its one declared operation, read-vocabulary-term, to check subject-attribute membership. No concrete adapter is constructed here; the caller supplies the port."
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: "investigation-factory.ts still imports no framework, driver or provider client: only the case module's own resolution helper and types, this context's sibling plain-data types and typed errors, and the domain-declared IGlossaryQuery interface. Infrastructure reaches this module only through that interface, supplied by the caller."
inferences:
  - inferred: "BuildInvestigationOptions now takes the subject's raw constituent fields (subjectType, subjectAttributes) instead of an already-built subject: Subject, and buildInvestigation itself calls buildSubject internally."
    from: "the task's own objective wording (investigation-factory builds a Subject from the raw entry input) and subject.ts's own module comment, which names this task by path as the one that performs the glossary-backed check subject.ts does not reach."
  - inferred: "the glossary collaborator is a field of BuildInvestigationOptions (glossary: IGlossaryQuery) rather than a second positional parameter to buildInvestigation."
    from: "evidence-collection-stage.ts's and judgment-stage.ts's own convention of bundling a stage's port collaborators into the same single options object as the call's data."
  - inferred: "buildInvestigation becomes asynchronous (Promise<Investigation>) rather than remaining the pure synchronous function it was."
    from: "IGlossaryQuery.readVocabularyTerm's own Promise-returning signature leaves no synchronous way to perform this task's own glossary-membership check; evidence-collection-stage.ts and judgment-stage.ts already establish the convention that a stage consuming a port is itself async."
  - inferred: "distinct attribute names are checked against the glossary once each, not once per attribute-value pair, and every missing name is collected into one SubjectAttributeNotInGlossaryError rather than the first one found."
    from: "investigation-factory.ts's own pre-existing refuse-once-with-every-violation-named convention and validate-case-coherence.ts's own dedup-before-check convention."
  - inferred: "the new error's name (SubjectAttributeNotInGlossaryError), its name/message/context shape and its message wording."
    from: "SubjectCarriesNoAttributeError, CapabilityNotReadOnlyError and InvestigationNotBuildableError, which already establish this context's name-message-context error shape."
  - inferred: "domain/glossary/subject-attribute joins TERM_VOCABULARIES as a fifth, bare-name vocabulary, rather than being checked some other way."
    from: "domain/glossary's own context description (the five vocabularies) and task/subject-identity-rework/subject-value-object's own delivery record, whose deferred section names this exact widening as belonging to this task by path."
divergences:
  - from: "this task's own reach — investigation-factory.ts and its own sibling/error files under src/investigation and src/errors, plus glossary/terms.ts, which the glossary-membership check this task must perform requires widening — does not include src/case/validate-case-coherence.ts, a case-model module delivered by the already-closed case-authoring-mvp plan."
    departure: "patched VOCABULARY_ROLES's exhaustive Record<TermVocabulary, string> literal in src/case/validate-case-coherence.ts, adding a subject-attribute entry."
    why: "widening glossary/terms.ts's TERM_VOCABULARIES to include subject-attribute is squarely this task's own job — task/subject-identity-rework/subject-value-object's own delivery record explicitly deferred it here by name — but TypeScript's Record<TermVocabulary, string> is exhaustive over that union, so validate-case-coherence.ts fails to typecheck the moment TermVocabulary widens, even though namedVocabularyTerms() never emits a subject-attribute entry and no behavior of case-coherence validation changes. This delivery fixed it minimally and mechanically (one dead, commented map entry) rather than leaving a guaranteed build break behind; whichever task or plan revision next substantively touches case-coherence validation still owns this file in full."
preserved:
  - "refuseTotalityViolations, evidenceTotalityViolations, evaluationTotalityViolations, countsByKey and pinnedCaseOf: unchanged in body and behavior."
  - "Investigation's own shape and PinnedCase: unchanged."
  - "subject.ts's buildSubject and SubjectCarriesNoAttributeError: unchanged, called rather than duplicated."
  - "observation-source.port.ts, fake-observation-source.adapter.ts and evidence-collection-stage.ts: untouched by this task."
  - "glossary.service.ts, glossary-store.port.ts, file-glossary-store.repository.ts and glossary.factory.ts: unaffected by TERM_VOCABULARIES gaining a fifth entry — each already reads/writes/wires by vocabulary name generically."
deferred:
  - what: "investigation-factory.ts's BuildInvestigationOptions and the built Investigation both still declare requester and ticket_ref as mandatory plain strings, with no optionality on ticket_ref."
    why: "the inventory's own risk entry flags this as a reconciliation diagnose-payload wiring will eventually need, but none of this task's own three criteria touch requester or ticket_ref; that reconciliation belongs to epic/diagnose-entry-point's own diagnose-payload-and-window-dedup task."
  - what: "no composition wiring (a src/factories/*.ts factory) constructs buildInvestigation's own glossary: IGlossaryQuery collaborator from a real GlossaryService."
    why: "no diagnose entry point or investigation-lifecycle composition factory exists anywhere in the tree yet; wiring this call site is composition work for whichever task first builds that composition root, not this task's own objective."
---

## What it is

investigation-factory turns the raw entry input's subject fields into a Subject value object as part of building an Investigation, enforcing both the empty-attribute-set invariant (by reuse of subject.ts's own refusal) and the glossary-membership policy (newly built here), carrying a fully valid subject into the built Investigation unchanged.

## Notes

None.
