---
title: Case admits an optional consolidation register — proof
summary: Tests over parse-case-document.ts proving a case document's optional consolidation_register parses through when formal or plain, parses successfully when absent, is refused together with any other structural violation when declared outside that closed set, and is carried onto the returned Case rather than dropped.
implementation: sha256:4cb8aee4f4bd65477e57542403fb92f0e6848bbe80004088c6b82dd3e64528f2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-case-coherence-optional-consolidation-register-suite
tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: "parses a document declaring consolidation_register formal into a case carrying it"
    proves: "A case document declaring consolidation_register formal or consolidation_register plain parses into a Case carrying that value (the formal half), and that the Case parse-case-document holds and returns carries consolidation_register through when the raw document declares it."
    fails_when: "parseCaseDocument refuses a document that declares consolidation_register formal, or the returned Case's consolidation_register is anything other than formal — dropped, left undefined, or coerced."
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: "parses a document declaring consolidation_register plain into a case carrying it"
    proves: "A case document declaring consolidation_register formal or consolidation_register plain parses into a Case carrying that value (the plain half), and the same carry-through criterion for the plain value."
    fails_when: "parseCaseDocument refuses a document that declares consolidation_register plain, or the returned Case's consolidation_register is anything other than plain."
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: "parses a document that omits consolidation_register without refusing it, and leaves the key off the returned case"
    proves: "A case document omitting consolidation_register parses successfully, never refused for the field's absence — and the implementation's own recorded inference that heldCase omits the key entirely rather than carrying an explicit undefined."
    fails_when: "parseCaseDocument throws for a document that leaves consolidation_register undeclared, or the returned Case carries a consolidation_register key at all (even set to undefined) for a document that never declared one."
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: "refuses a consolidation_register declared as an unrecognized word, an empty string, the wrong case, a number, or null"
    proves: "A consolidation_register value outside formal or plain is refused (the refusal half of the criterion), and the implementation's own recorded inference that the refusal wording names what is wrong without quoting the offending raw value."
    fails_when: "any of these five values is accepted without refusal, or the reported problem differs from exactly consolidation_register is not one of formal, plain — including a message that echoes the offending raw value."
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: "collects a consolidation_register violation together with another structural violation in one refusal, never throwing on the first found"
    proves: "A consolidation_register value outside formal or plain is refused, collected together with any other structural violation the same document holds, never thrown on the first violation found."
    fails_when: "the call reports only one of the two violations (short-circuiting on whichever structural check runs first), or the two violations are not joined into one refusal."
not_applicable:
  - edge_case: "a boundary at each end of a range"
    why: "consolidation_register is a closed two-value vocabulary (formal, plain), not an ordered range — there is no boundary beyond exact membership in that set, which the formal/plain and invalid-value tests already exercise on both sides."
  - edge_case: "an empty collection where one comes back"
    why: "consolidation_register is a single scalar attribute of the Case; parseCaseDocument never returns a collection for it."
  - edge_case: "a duplicate where uniqueness is claimed"
    why: "no node or criterion claims uniqueness over consolidation_register; it is one attribute of one document, not a set of named entries."
  - edge_case: "an operation attempted against state that forbids it"
    why: "parseCaseDocument is a pure, stateless function over one document; there is no prior state a call to it could conflict with."
  - edge_case: "a dependency that fails or answers slowly"
    why: "parse-case-document.ts's only import beyond its own types is the local, import-free consolidation-register vocabulary module — there is no external dependency for this check to depend on failing or being slow."
  - edge_case: "two operations against one subject at once"
    why: "parseCaseDocument holds no shared mutable state between calls; two concurrent calls over the same or different documents cannot interfere, and nothing in this task's criteria claims otherwise."
untested:
  - "The UNDERDETERMINED entry over constraints/the-domain-depends-on-no-infrastructure (an implementation adding consolidation_register support by importing a database driver, HTTP client, or provider SDK directly) is given no new test in this proof: the pre-existing fitness test at src/__tests__/unit/case/case-document-modules.spec.ts already sweeps every .ts file under src/case/ — including case.ts and parse-case-document.ts — for exactly that purity, and it already passes over the delivered code, whose only new import is the local consolidation-register vocabulary via a relative path. A second test over the same files for the same fact would duplicate that fitness test rather than add proof."
  - "Whether ConsolidationRegister/CONSOLIDATION_REGISTERS are imported into case.ts and parse-case-document.ts from src/investigation/consolidation-register.ts, rather than a second type being redeclared inside src/case, is not independently provable through parseCaseDocument's observable behavior — confirming the reuse itself requires reading the two files' own import statements."
  - "The exact position of the consolidation_register check within documentProblems's concatenated list is not tested for order: no criterion or existing convention in this file states any sequence among the collected problems."
  - "isConsolidationRegister's own implementation choice (CONSOLIDATION_REGISTERS.some(...) rather than an as-assertion plus includes()) has no externally observable behavioral difference from the alternative; the formal/plain acceptance and invalid-value refusal tests already prove the type guard's actual boundary."
  - "Criterion 3's clause naming a coherence violation alongside a structural one is not exercised together with a consolidation_register violation: validate-case-coherence.ts never inspects consolidation_register, and case-query.service.ts's readCase short-circuits on any structural violation before its own coherence check ever runs — so no document can hold both violations in one call a test could observe. Only the structural half of that clause is proven here."
---

## What it is

Tests over parseCaseDocument proving case-coherence-optional-consolidation-register's own four criteria: parses through for formal and plain, parses successfully when absent, refuses (collected, never first-thrown) an out-of-vocabulary value, and carries the value through to the returned Case.

## Notes

None.
