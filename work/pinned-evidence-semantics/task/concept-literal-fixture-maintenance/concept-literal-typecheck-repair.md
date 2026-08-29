---
title: Typecheck-breaking Concept literals gain a description
summary: Every pre-existing Concept-shaped object literal that fails npm run typecheck
  against the widened Concept type receives a placeholder description value, with
  no other change.
rationale: This task implements no specification node — Concept.description's requirement
  was already decided and already enforced by an earlier task; this task only restores
  a compile-time property the widening broke in code none of this plan's other tasks
  own. The seven sites are grouped into one task because they share a single reason
  to change (the Concept type widening) and one falsifiable outcome (npm run typecheck
  passing across the pre-existing tree), even though they sit in unrelated modules
  (case, http, persistence).
sources:
- intake/pre-existing-concept-literals-scope.md
objective: Every Concept-shaped object literal in the backend tree that TypeScript
  refuses because description is now required — outside the three concept-description
  tasks' own file sets — compiles, without changing any existing assertion.
criteria:
- npm run typecheck completes without error against the Concept literal(s) in src/src/__tests__/unit/case/case-query.service.spec.ts.
- npm run typecheck completes without error against the Concept literal(s) in src/src/__tests__/unit/case/validate-case-coherence.spec.ts.
- npm run typecheck completes without error against the stubGlossaryQuery() and stubRegisterConcept()
  helpers in src/src/__tests__/unit/http/build-app.spec.ts.
- npm run typecheck completes without error against both writeConcepts call sites
  in src/src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts.
- npm run typecheck completes without error against the heldConcept() fixture builder
  in src/src/__tests__/unit/http/read-concept.routes.spec.ts.
- npm run typecheck completes without error against the heldConcept() fixture builder
  in src/src/__tests__/unit/http/register-concept.routes.spec.ts.
- npm run typecheck completes without error against the heldConcept() fixture builder
  in src/src/__tests__/unit/http/list-concepts.routes.spec.ts.
- None of the seven files' existing test assertions changes in value or outcome.
- npm run typecheck exits 0 for the whole backend target source root.
---

## What it is
A pass over the seven files the scope and the inventory's sweep together name as constructing a Concept literal checked directly against the Concept type.
Each literal gains only a description value; no accepts, ttl, name value or assertion elsewhere in these files changes.

## Notes
Three of the seven files (case-query.service.spec.ts, validate-case-coherence.spec.ts, build-app.spec.ts) are the sites the scope itself opens with; the other four (relational-glossary-store.repository.spec.ts's two writeConcepts calls, and the heldConcept() builders in read-concept.routes.spec.ts, register-concept.routes.spec.ts and list-concepts.routes.spec.ts) are what the surveyor's sweep additionally found.
A bare {name, accepts, ttl} literal passed into ConceptRegistration-typed code compiles today and is not a site this task touches — only literals checked against Concept or Partial<Concept> directly are in scope.
