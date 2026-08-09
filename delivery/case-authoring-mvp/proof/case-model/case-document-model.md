---
title: Proof for the case document model
summary: Holds task/case-model/case-document-model over the specification's worked example — the one document parses whole and in declared order, every structural refusal fires by name, several violations arrive as one refusal, and the model's modules import nothing but one another.
implementation: sha256:59bf512d9e74e8a1351c4306455f2793759359de52d4ad3cf283f7ce52a199f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-document-model-suite
tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring every attribute into the one case aggregate
    proves: "A document holding slug, title, when_to_use, version, hash, subject, fallback and at least one hypothesis parses into one case aggregate."
    fails_when: the parse refuses the worked example, or the aggregate drops, renames or reshapes any declared attribute
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: reads hypotheses, resolutions and referrals from the one document alone
    proves: "The whole aggregate — hypotheses, resolutions, referrals — is read from the one document, and no part of a case is read from a second store."
    fails_when: the fallback or the deepest hypothesis's resolution and referral stop arriving from the document argument itself
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: holds the hypotheses in the declared order of the document, never sorted and never keyed by name
    proves: the task's second UNDERDETERMINED note — a model holding hypotheses as an unordered set or name-keyed map is the implementation it names, and this test fails over exactly that; the fixture's declared order is deliberately not alphabetical
    fails_when: the aggregate reorders, sorts or keys the hypotheses, losing the precedence resolve-outcome consumes
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a case declaring exactly one hypothesis
    proves: the lower boundary of at-least-one-hypothesis — one is enough
    fails_when: the parse starts requiring more than one hypothesis
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: reads the file name stated without its ending as the same name the slug is held to
    proves: the implementation's stated choice that the .json ending is the medium's and not the name's
    fails_when: a file name stated without its ending stops matching the slug it holds
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: carries nothing into the aggregate that the model does not declare
    proves: the implementation's stated choice that the aggregate holds exactly the declared attributes, and that an extra attribute is tolerated rather than refused
    fails_when: an undeclared attribute is either copied into the aggregate or refused as a violation
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case whose slug differs from the name of the file that holds it
    proves: "A case whose slug differs from the name of the file that holds it is refused."
    fails_when: a mismatched slug parses, or the refusal stops naming the file's name
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case that declares no hypotheses attribute
    proves: "A case declaring no hypothesis is refused."
    fails_when: a document with no hypotheses attribute parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case declaring an empty list of hypotheses
    proves: "A case declaring no hypothesis is refused. — the empty-array shape of the same absence"
    fails_when: an empty hypotheses array parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case whose two hypotheses share a name
    proves: "A case with two hypotheses sharing a name is refused."
    fails_when: two hypotheses under one name parse, or the refusal stops naming the shared name
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis that declares no collects
    proves: "A hypothesis collecting no concept is refused. — the absent-attribute shape"
    fails_when: a hypothesis with no collects attribute parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis collecting no concept
    proves: "A hypothesis collecting no concept is refused."
    fails_when: a hypothesis with an empty collects array parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose collects holds an entry naming no concept
    proves: the edge inside criterion 6 — an empty-string entry names no concept and does not satisfy at-least-one
    fails_when: an empty collects entry starts counting as a collected concept
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis carrying an empty criterion
    proves: "A hypothesis carrying an empty criterion is refused."
    fails_when: an empty criterion parses instead of being refused by name
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose resolution misses its outcome
    proves: "A hypothesis or the fallback missing its outcome or its referral is refused. — the hypothesis/outcome quarter"
    fails_when: a resolution with no outcome parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose resolution misses its referral
    proves: "A hypothesis or the fallback missing its outcome or its referral is refused. — the hypothesis/referral quarter"
    fails_when: a resolution with no referral parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis declaring no resolution at all
    proves: "A hypothesis or the fallback missing its outcome or its referral is refused. — the whole resolution absent misses both"
    fails_when: a hypothesis with no resolution parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a fallback missing its outcome
    proves: "A hypothesis or the fallback missing its outcome or its referral is refused. — the fallback/outcome quarter"
    fails_when: a fallback with no outcome parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a fallback missing its referral
    proves: "A hypothesis or the fallback missing its outcome or its referral is refused. — the fallback/referral quarter"
    fails_when: a fallback with no referral parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that leaves each required string attribute undeclared
    proves: the task's first UNDERDETERMINED note — one test per required attribute (slug, title, when_to_use, hash, subject), failing over exactly the lenient parser the note names
    fails_when: any of the five required string attributes is defaulted, coerced or silently tolerated when absent
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that leaves version undeclared
    proves: the task's first UNDERDETERMINED note — the required version attribute
    fails_when: an absent version is defaulted instead of refused
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a version that is not an integer instead of coercing it
    proves: the task's first UNDERDETERMINED note — the coercion half
    fails_when: a string version is coerced into a number instead of refused
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that leaves the fallback undeclared
    proves: the task's first UNDERDETERMINED note — a case with no fallback
    fails_when: a document with no fallback parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a nameless hypothesis
    proves: the task's first UNDERDETERMINED note — the nameless hypothesis it names
    fails_when: a hypothesis with no name parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a referral missing its action
    proves: the task's first UNDERDETERMINED note — a referral missing its action
    fails_when: a referral with no action parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a referral missing its recipient
    proves: the task's first UNDERDETERMINED note — a referral missing its recipient
    fails_when: a referral with no recipient parses
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses an empty slug once, not also as a mismatch against the file name
    proves: the implementation's stated choice that one absence is not reported twice
    fails_when: an empty slug parses, or its refusal doubles into two problems
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that is not one JSON object
    proves: the absent-input edge — null is refused as not one JSON object rather than crashing or parsing
    fails_when: a null document reaches the attribute checks or escapes as anything but the typed refusal
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that is a JSON array
    proves: the shape edge typeof hides — an array must still be refused as not one JSON object
    fails_when: a JSON array starts being read as a case document
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document violating several structural rules once, naming every violation
    proves: "A document violating several structural rules is refused once, with every violation named."
    fails_when: any of the six seeded violations goes unnamed, a seventh appears, or the refusals stop arriving in one throw
  - file: src/__tests__/unit/case/case-document-modules.spec.ts
    name: the document model's modules import no framework, no driver and no provider client
    proves: "The document model's modules import no framework, no driver and no provider client."
    fails_when: any module under src/case, or the typed refusal beside them, gains an import of a framework, driver or provider client
  - file: src/__tests__/unit/case/case-document-modules.spec.ts
    name: the document model's modules import nothing but one another, so no second store is reachable from the aggregate
    proves: the no-second-store half of criterion 2, and the implementation's stated choice that these modules import nothing beyond their own types and their typed error
    fails_when: any document-model module gains a non-relative import — a package, a builtin, anything a store could be reached through
not_applicable:
  - edge_case: a boundary at each end of a stated range
    why: the only stated bound is at least one hypothesis, whose lower end is tested; version is declared an integer with no stated range
  - edge_case: an operation against state that forbids it
    why: parseCaseDocument is a pure function of its two arguments — there is no state to forbid anything
  - edge_case: a dependency that fails or answers slowly
    why: the model has no dependency, and the module audit is the test that keeps that true
  - edge_case: two operations against one subject at once
    why: two parses share no state and cannot observe one another
untested:
  - whether the declared hash corresponds to the document's content — the parse carries it as declared, and no criterion or bound node states verification here
  - whether the aggregate shares structure with the input document — the implementation copies deliberately, but no bound node states aliasing behavior
  - the exact wording of the refusal's problems — the tests bind each problem by the violation it names, not by its full sentence
divergences:
  - cites: TST-04
    file: src/__tests__/unit/case/case-document-modules.spec.ts
    departure: the audit file mirrors the src/case directory but names no single unit file, because it audits three modules at once, one of which sits under src/errors.
    why: an import audit has no one unit to mirror; the file follows the layout precedent of the glossary module audit this tree already holds
  - cites: MNT-03
    file: src/__tests__/unit/case/case-document-modules.spec.ts
    departure: the import-audit helpers and the forbidden-package list are copied from the glossary module audit rather than called.
    why: importing a spec from a spec registers its tests twice under vitest, and extracting a shared helper module would rewrite a prior task's proof, which is not this proof's to touch — the duplication is disclosed so the two lists are reconciled deliberately when either changes
---
## What it is
Thirty-three tests over two files, all pure units: the worked example parsing whole and ordered, every structural refusal fired by name including the eleven the first UNDERDETERMINED note demands beyond the criteria, the multi-violation single refusal, and the import audit that keeps the model dependency-free.

## Notes
The order test's fixture is deliberately non-alphabetical, so a sorted set masquerading as order-preserving fails it.
The MNT-03 duplication between the two module audits is disclosed rather than extracted, because a shared helper would rewrite a prior proof's file.

The shared audit's file src/__tests__/unit/case/case-document-modules.spec.ts was later extended by task/case-model/case-coherence-validation to sweep a second error module (incoherent-case.error.ts) alongside this task's invalid-case-document.error.ts — a generalized ERROR_MODULES list replacing the single ERROR_MODULE constant, with this task's own coverage unchanged. Disclosed here because the file is this proof's own record.
