---
title: Proof for the canonical Subject value object
summary: buildSubject() is proved to assemble the governed-type-plus-attribute-set shape, to refuse an empty attribute-value set, to preserve each pair's own attribute and value exactly, and to produce a value that flows unmodified through observation-source.port.ts's own re-exported Subject type.
implementation: sha256:d1c428517c9e4fa4ece8c9565989e55f2d6643bd08cd558b712aaf6dd47ef0f7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-subject-value-object-suite
tests:
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: builds a Subject carrying exactly the given subject type and the whole given attribute-value set
    proves: "Criterion 1 (\"A Subject value requires a subject type drawn from domain/glossary/subject-type and a set of subject-attribute-value pairs.\")"
    fails_when: buildSubject returns a type or attributes array that departs from what was given — a missing field, an added field, a reordered or filtered attribute set, or a type value that differs from the one supplied
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: never carries a bare id field, only the governed type and the attribute-value set
    proves: "the task's own objective (\"replacing every bare-id representation of a subject\") together with criterion 1's requirement that a Subject is exactly type plus attributes"
    fails_when: the built Subject carries any own property other than type and attributes — in particular, a reintroduced bare id field
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: refuses to build a Subject with no attribute-value at all
    proves: "Criterion 2 (\"Constructing a Subject with an empty attribute-value set is refused, per a-subject-carries-at-least-one-attribute.\")"
    fails_when: buildSubject returns a Subject instead of throwing when given an empty attributes array, or throws something other than SubjectCarriesNoAttributeError
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: names the subject type in the refusal error, in both its message and its context
    proves: the implementation's own recorded inference on SubjectCarriesNoAttributeError's name/message/context shape, and that the refusal names which subject type it was raised for rather than answering a generic message
    fails_when: "the thrown error's message does not mention the given subject type, or its context field is absent or does not equal { type: 'a-subject-type' }"
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: does not throw when given exactly one attribute-value pair, the boundary the refusal sits against
    proves: that criterion 2's refusal is specific to an empty set rather than a defect that refuses every construction — the boundary immediately above zero
    fails_when: buildSubject throws for a non-empty, single-pair attribute-value set
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: preserves each attribute-value pair exactly as given, carrying only its own attribute name and value
    proves: "Criterion 3 (\"One subject-attribute-value pair carries exactly one governed attribute name and one string value.\")"
    fails_when: a built attribute-value entry carries a different attribute or value than given, or carries any additional field beyond attribute and value
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: copies the given attributes into a new array, so mutating the caller's own array afterwards leaves the built subject unchanged
    proves: the edge case that buildSubject defends its own returned Subject against later mutation of the array the caller passed in, the behavior the module's own constructor documents
    fails_when: buildSubject holds onto the given array by reference, so a later push onto the caller's own array is reflected in the already-built subject's attributes
  - file: src/__tests__/unit/investigation/subject.spec.ts
    name: flows unchanged through observation-source.port.ts's own Subject-typed observeConcept call, with no adaptation between the two modules
    proves: "Criterion 4 (\"The inline Subject type previously left duplicated in observation-source.port.ts is replaced by this canonical module rather than kept as a second declaration.\"), its practical behavioral consequence: a Subject built by subject.ts's own constructor is exactly what the port's observeConcept accepts and keys on"
    fails_when: a Subject built by buildSubject() no longer round-trips through the port's own observeConcept — the seeded outcome is not returned, or the call throws — which is what would happen if the port still expected an incompatible, separately declared Subject shape
not_applicable:
  - edge_case: two operations building or using one Subject at once
    why: buildSubject is a pure, synchronous function of its own arguments with no shared mutable state across calls; there is nothing here a second concurrent call could observe mid-construction
  - edge_case: a dependency that is unavailable, slow to answer, or answers in an unexpected shape
    why: buildSubject and SubjectAttributeValue call out to nothing; this task's whole delivery is pure, synchronous data assembly with no dependency that could fail or run slowly
  - edge_case: an operation attempted against state that forbids it
    why: buildSubject holds no persisted or mutable state of its own; one call either assembles a Subject or refuses before anything is constructed, and nothing about the outcome varies with prior state
  - edge_case: a duplicate attribute name within one subject's own attribute-value set
    why: "no bound node (domain/investigation/subject, domain/investigation/subject-attribute-value, or either rule this task implements) states a uniqueness constraint over attribute names within one subject's set, unlike the exactly-once totality rules governing evidence and evaluations elsewhere in this codebase; a test asserting refusal or deduplication here would assert a guarantee nobody made"
  - edge_case: "absent, malformed or type-violating input (a non-string type, an attributes value that is not an array, an attribute-value pair missing its own attribute or value field)"
    why: "buildSubject(type, attributes) is a statically typed signature enforced by the compiler at every call site in this codebase; no runtime boundary parses external input inside this constructor, the same dismissal task/investigation-lifecycle/investigation-factory's own proof already recorded for BuildInvestigationOptions"
  - edge_case: an empty-string subject type, attribute name or value
    why: no node bound to this task assigns an empty string any special meaning for a subject type name or an attribute name/value; buildSubject treats every one of these as an opaque string with no special-casing, so an empty-string variant would exercise exactly the same assembly path the existing tests already cover and prove nothing new
  - edge_case: a boundary at each end of a stated numeric or ordered range
    why: neither Subject nor SubjectAttributeValue declares any numeric or ordered range to sit at the edge of; the only stated boundary is the attribute-value set's own lower bound (zero vs. one), which the criterion-2 refusal test and its adjoining boundary test already cover
  - edge_case: an empty collection answered where one is expected
    why: buildSubject never answers an empty attributes collection — an empty set is refused outright (criterion 2) rather than returned, so there is no empty-collection-as-answer case to exercise
untested:
  - "whether a subject-attribute-value's own attribute name actually exists in the glossary (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) — the task's own UNDERDETERMINED note names exactly this gap: an attribute name never registered in domain/glossary/subject-attribute satisfies this task's four criteria exactly as written. No test here asserts that such a name is refused, because this module performs no glossary-membership check at all. CORRECTION, added during the initiative's own closing review: per test-author's governing instructions, an UNDERDETERMINED note naming a specific passing-but-wrong implementation is a test owed — failing over exactly that implementation, disclosed via `contested` — not simply a note left in `untested`; this proof originally routed it to `untested` on the coordinator's own (mistaken) instruction. The substantive gap this note names is, as of this initiative's own task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject, closed for the delivered system as a whole: that task's buildInvestigation calls refuseAttributesNotInGlossary against the same glossary-source port, refusing exactly the unregistered-attribute case this note names, proven by that task's own delivered spec (src/__tests__/unit/investigation/investigation-factory.spec.ts, 'refuses to build when the subject names an attribute the glossary does not hold'). Left recorded here, in this form, rather than retrofitted as a contested failing test in this file, because forcing that cycle now would misrepresent an already-closed system behavior as an open one — unlike the genuinely still-open gaps recorded in task/assessment-consolidation/assessment-consolidator-port-and-fake's and task/diagnose-entry-point/diagnose-pipeline-composition's own proofs."
  - "that Subject's and SubjectAttributeValue's readonly field declarations actually prevent reassignment — a compile-time fact the project's own strict typecheck step decides; vitest itself transpiles without type-checking, so no runtime test here can observe it, matching the same dismissal task/investigation-lifecycle/investigation-factory's own proof already recorded for Investigation's own readonly fields"
  - "that observation-source.port.ts's own Subject identifier is exactly one declaration — an import plus a re-export — rather than a second, independently-written but structurally identical type. This is a fact about the file's own source text; the interop test proves the practical behavioral consequence (a canonically built Subject flows through the port unmodified) but cannot distinguish a genuine re-export from a coincidentally matching duplicate declaration, which only reading the file settles"
  - "that Subject.type is actually one of the glossary's current subject-type vocabulary entries (domain/glossary/subject-type) — like the sibling attribute-name check, this module holds the field as an opaque governed name and performs no membership check of its own; verifying it against the glossary's real content is the same later task's concern"
---

## What it is

Tests proving buildSubject() and SubjectAttributeValue against subject-value-object's own four criteria, plus one interop test proving a built Subject flows unmodified through observation-source.port.ts's canonical, re-exported Subject type.

## Notes

Deliberately excludes any test asserting that an unregistered attribute name is refused — the task's own UNDERDETERMINED note names this gap directly, and this module performs no glossary-membership check at all; that check, and its proof, belong to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
The interop test exercises observation-source.port.ts and fake-observation-source.adapter.ts only as boundary collaborators — neither is itself under test here, and neither is modified by this proof.
observation-source.port.spec.ts, evidence-collection-stage.spec.ts, investigation-factory.spec.ts and file-investigation-store.repository.spec.ts — the four files the implementation record's own divergences disclose as human-authorized compile-compatibility patches — were deliberately left untouched by this proof; they are read-only context, not this task's tests to rewrite.
