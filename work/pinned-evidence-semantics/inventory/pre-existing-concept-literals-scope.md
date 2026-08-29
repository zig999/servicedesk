---
title: Pre-existing Concept-shaped literals outside the widening tasks
summary: Every Concept-typed object-literal site in the backend tree that TypeScript
  now refuses because description is required, beyond the three files the scope already
  named, plus four files whose runtime assertions will now mismatch.
area:
- src/src
sources:
- intake/pre-existing-concept-literals-scope.md
modules:
- name: glossary-terms
  path: src/src/glossary/terms.ts
  role: depends-on
- name: glossary-service
  path: src/src/glossary/glossary.service.ts
  role: adjacent
- name: relational-glossary-store
  path: src/src/persistence/relational-glossary-store.repository.ts
  role: adjacent
- name: glossary-http-routes
  path: src/src/http
  role: adjacent
conventions:
- statement: A Concept literal only breaks the build where it is checked against the
    Concept type directly (an argument to holdConcept/writeConcepts, or a function/variable
    annotated Concept/Partial<Concept>). A bare {name, accepts, ttl} literal passed
    into ConceptRegistration-typed code compiles fine because ConceptRegistration.description
    stays optional.
  seen_at: src/src/glossary/terms.ts
- statement: expect(x).toEqual({...}) never causes a typecheck failure regardless
    of what fields the literal carries, because vitest's toEqual<E> is unconstrained
    against the actual value's type — so an assertion literal missing description
    is a runtime mismatch risk, never a compile-time one.
  seen_at: src/src/__tests__/unit/glossary/glossary-query.port.spec.ts
- statement: 'Route-level fixtures share the heldConcept(overrides: Partial<Concept>
    = {}): Concept pattern — one helper per spec file, always returning the bare three-field
    shape, used through spread-override.'
  seen_at: src/src/__tests__/unit/http/read-concept.routes.spec.ts
- statement: Fixtures that read concept.json off disk cast the parsed JSON to their
    own local interface, never to the glossary's own Concept type, so they compile
    regardless of Concept.description and are not offenders.
  seen_at: src/src/seed.ts
must_not_duplicate:
- what: 'The heldConcept(overrides: Partial<Concept> = {}): Concept fixture-builder
    pattern already established per spec file — add a placeholder description inside
    each existing builder rather than a new shared helper.'
  at: src/src/__tests__/unit/http/read-concept.routes.spec.ts
risks:
- risk: writeConcepts literals built directly as Concept[] (not through a registration)
    are genuine, currently-uncaught typecheck breaks outside the three files the scope
    names.
  consumers:
  - src/src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- risk: heldConcept() fixture builders typed to return Concept are genuine, currently-uncaught
    typecheck breaks outside the three files the scope names, each reused by every
    test in its own file through spread-override.
  consumers:
  - src/src/__tests__/unit/http/read-concept.routes.spec.ts
  - src/src/__tests__/unit/http/register-concept.routes.spec.ts
  - src/src/__tests__/unit/http/list-concepts.routes.spec.ts
- risk: stubGlossaryQuery()'s inline readConcept resolution and stubRegisterConcept()'s
    inline registerConcept resolution are literal Concept constructions inside one
    of the three files the scope already names — concrete evidence for that file's
    own criteria.
  consumers:
  - src/src/__tests__/unit/http/build-app.spec.ts
- risk: 'Several files pass {name, accepts, ttl} into ConceptRegistration-typed positions
    and then assert the read-back result with .toEqual({name, accepts, ttl}) — these
    compile today, but GlossaryService.concepts()/readConcept() now answer description:
    '''' for a registration naming none, so the assertion literal is missing a key
    the actual object now carries. This is a runtime risk, not a typecheck fix, and
    sits just outside this scope''s literal ''no assertion change'' framing, but left
    unaddressed it fails the suite step the moment these tasks run.'
  consumers:
  - src/src/__tests__/unit/glossary/glossary-query.port.spec.ts
  - src/src/__tests__/integration/glossary/glossary-query.port.spec.ts
  - src/src/__tests__/unit/glossary/glossary.service.spec.ts
  - src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
---

## What it is
The complete list of Concept-shaped object-literal sites the widened description: string requirement now breaks or touches, across src/src, beyond the three files case-query.service.spec.ts, validate-case-coherence.spec.ts and build-app.spec.ts the scope already names.
Genuinely new typecheck-breaking sites: relational-glossary-store.repository.spec.ts (two writeConcepts calls, lines ~295 and ~310), and three heldConcept() fixture builders (read-concept.routes.spec.ts, register-concept.routes.spec.ts, list-concepts.routes.spec.ts), each reused by every test in its own file.
Four further files carry a distinct, runtime-only risk: their .toEqual({name, accepts, ttl}) assertions will now mismatch, since GlossaryService now answers description: '' for a registration naming none — glossary-query.port.spec.ts (unit and integration), glossary.service.spec.ts, glossary.service.list-concepts.spec.ts.
concept.json (the seed fixture) is not an offender — every consumer reads it through its own local interface, never the glossary's own Concept type.

## Notes
The runtime-assertion risk is not a typecheck fix, and it sits just past the scope's own "no assertion change" framing, but left unaddressed it fails the suite step the moment these files' own tests run against the widened shape — the decomposition should read it before writing criteria.
