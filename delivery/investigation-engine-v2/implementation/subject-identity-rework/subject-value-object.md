---
title: Subject as type plus attribute-value set
summary: The canonical Subject and SubjectAttributeValue value objects, with a construction-time refusal for an empty attribute-value set, replacing the bare-id Subject and its port-side inline duplicate, plus coordinator-authorized mechanical compile-compat patches to unblock a cross-task build deadlock.
task: sha256:00b132227922514a66e10aecb58a4f0a30ccea3c6fe72d14368e16d21925f78f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-subject-value-object-build-2
files:
  - path: src/investigation/subject.ts
    effect: rebuilds the canonical Subject value object as a governed type plus a whole set of SubjectAttributeValue pairs (replacing the prior bare-id shape), and adds buildSubject(type, attributes), the one constructor that refuses an empty attribute-value set by throwing SubjectCarriesNoAttributeError before returning anything
  - path: src/investigation/subject-attribute-value.ts
    effect: new module declaring SubjectAttributeValue — one governed attribute name plus the one string value it holds for this subject — as pure data with no behavior
  - path: src/errors/subject-carries-no-attribute.error.ts
    effect: new typed error, SubjectCarriesNoAttributeError, naming the subject type and stating that a subject carries no attribute-value at all, per rules/investigation/a-subject-carries-at-least-one-attribute
  - path: src/investigation/observation-source.port.ts
    effect: "removes the inline `export type Subject = { type: string; id: string }` this port previously declared, importing Subject from ./subject.js instead and re-exporting it under the same name so observe-concept's parameter, and every existing import of Subject from this file, resolve to the one canonical type"
  - path: src/investigation/fake-observation-source.adapter.ts
    effect: fixtureKey's body no longer reads subject.id (which no longer exists on the canonical Subject); it now joins concept, subject.type and each attribute-value pair's attribute/value, in the array's own order, with '::' — a minimal, coordinator-authorized compile-compatibility patch restoring the typecheck, not this file's own criterion-3 delivery
  - path: src/__tests__/unit/investigation/observation-source.port.spec.ts
    effect: "SUBJECT_ONE and SUBJECT_TWO fixtures constructed with an attributes array (attribute 'id', the old id value) instead of the retired `id` field, so the file typechecks against the canonical Subject; no assertion or test case changed"
  - path: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    effect: A_SUBJECT fixture constructed the same way, so the file typechecks against the canonical Subject; no assertion or test case changed
  - path: src/__tests__/unit/investigation/investigation-factory.spec.ts
    effect: aSubject()'s returned literal constructed the same way, so the file typechecks against the canonical Subject; no assertion or test case changed
  - path: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    effect: anInvestigation()'s inline subject literal constructed the same way, so the file typechecks against the canonical Subject; no assertion or test case changed
criteria:
  - criterion: A Subject value requires a subject type drawn from domain/glossary/subject-type and a set of subject-attribute-value pairs.
    met: true
    how: "subject.ts's Subject type declares both `type: string` (the governed subject-type name, referenced by bare name the same way src/case/case.ts's own `subject` attribute already references a subject-type name) and `attributes: readonly SubjectAttributeValue[]` as required fields."
  - criterion: Constructing a Subject with an empty attribute-value set is refused, per a-subject-carries-at-least-one-attribute.
    met: true
    how: buildSubject(type, attributes) in subject.ts checks `attributes.length === 0` before constructing anything and throws SubjectCarriesNoAttributeError(type) in that case; a non-empty set is copied into a new array and returned as a Subject.
  - criterion: One subject-attribute-value pair carries exactly one governed attribute name and one string value.
    met: true
    how: "subject-attribute-value.ts's SubjectAttributeValue type declares exactly two required fields, `attribute: string` (the governed name, referenced by bare glossary name) and `value: string`, structurally — no glossary-membership check is performed here, matching this task's own UNDERDETERMINED note on criterion 3."
  - criterion: The inline Subject type previously left duplicated in observation-source.port.ts is replaced by this canonical module rather than kept as a second declaration.
    met: true
    how: observation-source.port.ts no longer declares its own `Subject` type; it now does `import type { Subject } from './subject.js';` followed by `export type { Subject };`, so the port's own `subject` parameter and every existing consumer importing `Subject` from this file resolve to subject.ts's canonical type rather than a second, independently-declared shape.
nodes:
  - node: domain/investigation/subject
    encoded_at:
      - src/investigation/subject.ts
    how: Subject's shape (governed type plus the whole attribute-value set) and the entry-point/no-filtering description are stated as the module's own type and its constructor's doc comment; observation-source.port.ts reuses this same type rather than redeclaring it.
  - node: domain/investigation/subject-attribute-value
    encoded_at:
      - src/investigation/subject-attribute-value.ts
    how: SubjectAttributeValue pairs one governed attribute name with the one string value it holds, exactly the material's own id/12345 example cited in the node's own description.
  - node: domain/glossary/subject-attribute
    encoded_at:
      - src/investigation/subject-attribute-value.ts
    how: referenced by SubjectAttributeValue.attribute, held as the term's bare name (a plain string) rather than as a wrapped glossary-term object, matching how domain/knowledge/case already references a subject-type name; whether the named attribute actually exists in the glossary (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) is out of this task's reach, as its own UNDERDETERMINED note states, and is left to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
  - node: domain/glossary/subject-type
    encoded_at:
      - src/investigation/subject.ts
    how: referenced by Subject.type, held as the term's bare name the same way, for the same reason.
  - node: rules/investigation/a-subject-carries-at-least-one-attribute
    encoded_at:
      - src/investigation/subject.ts
      - src/errors/subject-carries-no-attribute.error.ts
    how: buildSubject refuses to construct a Subject whose attributes array is empty, throwing the typed SubjectCarriesNoAttributeError rather than returning an identifying-nothing value.
  - node: contracts/investigation/observation-source
    encoded_at:
      - src/investigation/observation-source.port.ts
    how: the published port's observe-concept parameter now types `subject` against the one canonical Subject rather than a locally duplicated shape; the port's own operation, endings and requester-scoping are unchanged by this task. The fake adapter's own fixture-key composition against this new shape (this contract's other named criterion, owned by task/subject-identity-rework/observation-source-subject-shape) is not claimed here — see the divergence and deferral below.
inferences:
  - inferred: Subject.type and SubjectAttributeValue.attribute are typed as plain `string` (the glossary term's bare name), not as the wrapped GlossaryTerm/SubjectType object shape glossary/terms.ts declares for the vocabulary's own held entries.
    from: "src/case/case.ts's own `subject: string` field (\"The kind of subject the case examines, by its glossary subject-type name\") and the pre-rework subject.ts's own `type: string` — both reference a glossary vocabulary term by bare name elsewhere in this codebase, reserving the wrapped object shape for the glossary module's own held records (e.g. NON_CONCLUSION_OUTCOMES)."
  - inferred: the empty-attribute-set refusal (criterion 2) is enforced by an exported constructor in subject.ts itself, buildSubject, rather than left entirely to whichever module later assembles a real Subject.
    from: the task's own criterion 2 wording ("Constructing a Subject... is refused"), demonstrable only against a module this task actually touches, plus investigation-factory.ts's own buildInvestigation — refuse-first-then-construct, one typed error — as the established construction-refusal shape in this codebase.
  - inferred: the typed error's name (SubjectCarriesNoAttributeError) and its name/message/context shape.
    from: the sibling errors CapabilityNotReadOnlyError (rules/integration/a-capability-is-read-only) and InvestigationNotBuildableError, both of which name the negation of the positive rule they enforce and carry a `context` field the message is drawn from.
  - inferred: buildSubject takes two positional parameters (type, attributes) rather than a single options object.
    from: capabilityOutputSchemaKey(capabilityName, capabilityVersion)'s own two-positional-parameter convention for a small, two-field derivation, as against idempotencyKeyOf's single-object-parameter convention reserved for a four-field key.
  - inferred: the mechanical compile-compat patches to the four pre-existing spec files (and to fake-observation-source.adapter.ts's fixtureKey) all use the attribute name 'id' for the sole attribute-value pair.
    from: domain/investigation/subject-attribute-value's own description, which gives exactly this as "the material's example" (attribute "id", value "12345") — reusing the specification's own worked example rather than inventing a new placeholder name.
divergences:
  - from: task/subject-identity-rework/subject-value-object's own rationale ("a later task changes a consumer, never the type and a consumer together") and task/subject-identity-rework/observation-source-subject-shape's own ownership of fake-observation-source.adapter.ts's fixtureKey (its criterion 3)
    departure: touched src/investigation/fake-observation-source.adapter.ts's fixtureKey body directly — outside this task's own declared files — replacing subject.id with a join over subject.type and each attribute-value pair (attribute, then value, in array order), so the tree typechecks again.
    why: this delivery hit a mutual build deadlock — this task cannot be recorded without a green build, and task/subject-identity-rework/observation-source-subject-shape cannot touch this same file until this task is recorded (its own Situate step refuses to start against a dependency with no record yet). The human reviewed this deadlock and explicitly authorized one narrow, purely mechanical patch to break it. The patch reuses the existing multi-field '::'-join convention verbatim — the same one src/investigation/idempotency-key.ts's idempotencyKeyOf and this file's own prior fixtureKey already used for concept+subject, per the inventory's must_not_duplicate entry — inventing no new key shape or semantics. Task 5 still owns this function's real criterion-3 rework in full and will rewrite it again from a clean context; this patch must not be read as already satisfying that criterion.
  - from: the same human authorization above, extended to the pre-existing test fixtures this task's own Subject-shape change broke
    departure: "src/__tests__/unit/investigation/observation-source.port.spec.ts's SUBJECT_ONE/SUBJECT_TWO literal shape changed from a bare type/id pair to type plus an attributes array (attribute 'id', the old id value), purely so the file typechecks; no assertion, seed call or expectation was touched."
    why: the same deadlock applies one level further out — this port's own spec file is owned by task/subject-identity-rework/observation-source-subject-shape, not this task, but it fails to typecheck the moment Subject's canonical shape changes here. The human authorized this same narrow, disclosed exception rather than leaving the whole task un-recordable; the file's real rework (if any is still needed once the port and fake are done) remains that task's own.
  - from: the same human authorization above
    departure: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts's A_SUBJECT literal shape changed the same way, purely so the file typechecks; no assertion or seed call was touched.
    why: owned by task/subject-identity-rework/evidence-collection-stage-subject-passthrough; same deadlock, same authorized exception.
  - from: the same human authorization above
    departure: src/__tests__/unit/investigation/investigation-factory.spec.ts's aSubject() returned literal changed the same way, purely so the file typechecks; no assertion was touched.
    why: owned by task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject; same deadlock, same authorized exception.
  - from: the same human authorization above
    departure: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts's anInvestigation() inline subject literal changed the same way, purely so the file typechecks; no assertion was touched.
    why: this file is not named as owned by any task in this plan's three epics — a gap this delivery surfaced rather than resolved. The human authorized the same narrow exception here too so the build could go green; whichever task or plan revision eventually claims this file's own Subject-shape rework still owns it in full.
preserved:
  - "IObservationSource.observeConcept's own three-parameter signature (concept, subject, requester) returning Promise<ObservationOutcome>, and ObservationOutcome's four-ending union tied to evidence-result.ts, both untouched; only Subject's own internal shape changed."
  - observation-source-modules.spec.ts's directory-wide sweep (no forbidden-package or standard-library import under src/investigation/, exactly one IObservationSource implementer) — every new/edited file imports only this context's own sibling modules and the typed error.
  - "investigation.ts's and investigation-factory.ts's own passthrough of `subject: Subject` — neither destructures a Subject field, so both keep compiling against the new shape unchanged."
  - fake-observation-source.adapter.ts's seed(), observeConcept() and its class shape — untouched; only fixtureKey's body changed.
  - every assertion, seed() call and expectation in the four patched spec files — only the Subject literal's own shape changed, so what each test proves is unchanged.
deferred:
  - what: fake-observation-source.adapter.ts's fixtureKey received only the minimal compile-compatibility patch described above; it does not carry this file's own criterion 3 (fixture-key composition proved against fixtures, following the existing convention, as that task's own delivered and tested behavior).
    why: task/subject-identity-rework/observation-source-subject-shape still owns this function's real rework and its own proof; this patch exists only to unblock the typecheck deadlock, not to satisfy that task's criterion.
  - what: the four patched spec files' Subject fixtures now compile, but none of them were rewritten to actually prove anything about the new shape (glossary membership, multiple attributes, fixture-key composition, and so on) — they still prove exactly what they proved before, against a differently-shaped fixture.
    why: each belongs to the task that owns the file it tests — observation-source-subject-shape for the port and fake, evidence-collection-stage-subject-passthrough for the collection stage, investigation-factory-assembles-and-validates-the-subject for the factory — and none of those files are this task's to rewrite in substance; this task writes no test.
  - what: src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts is not claimed by any task in this plan's three epics (subject-identity-rework, assessment-consolidation, diagnose-entry-point).
    why: a plan gap this delivery surfaced rather than resolved — the human has been told; whichever task or plan revision eventually touches the investigation store's own fixtures should claim it.
  - what: glossary/terms.ts's TERM_VOCABULARIES lists only subject-type, outcome, action and recipient, even though domain/glossary/subject-attribute.md describes subject-attribute as "the same shape" as those four discovered vocabularies.
    why: glossary/terms.ts, glossary-query.port.ts and glossary-store.port.ts are outside this task's touched files (untouched by the inventory's own module list for this task); widening the glossary's runtime vocabulary set belongs to whichever task performs the actual glossary-drawn membership check (task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject, which implements rules/investigation/a-subject-attribute-is-drawn-from-the-glossary and contracts/investigation/glossary-source).
---

## What it is

The Subject value object rebuilt as subject type plus a set of subject-attribute-value pairs, replacing the bare-id shape and its port-side inline duplicate.
A coordinator-authorized, narrowly-scoped set of mechanical compile-compatibility patches — to fake-observation-source.adapter.ts's fixtureKey and to four pre-existing spec files' Subject fixtures — written to break a mutual build deadlock between this task and its dependents, none of which change any test's assertions or claim any other task's own criteria as satisfied.

## Notes

UNDERDETERMINED, from the specification — rules/investigation/a-subject-attribute-is-drawn-from-the-glossary constrains exactly the types this task builds, but none of this task's four criteria reach its clause that every named attribute exists in the glossary. Belongs to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
The build deadlock and its resolution: this task's own build could not go green without fake-observation-source.adapter.ts and four pre-existing spec files' Subject fixtures already compiling against the canonical shape, but the tasks that own those files cannot start until this task already has a delivery record. The human reviewed this circularity directly and authorized one narrow exception — a purely mechanical, disclosed patch to each site's Subject literal or key composition, changing no assertion, no seed call and no expectation — recorded above in `divergences` and `deferred`. Every one of those sites is still owned, in full, by the task named in its own divergence entry; this record claims none of their criteria.
src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts's own Subject literal was patched the same way, but no task in this plan claims that file — a plan gap surfaced here rather than resolved, also reported to the human directly.
