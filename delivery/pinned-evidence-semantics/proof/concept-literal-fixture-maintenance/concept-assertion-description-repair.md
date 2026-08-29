---
title: Concept assertion description repair — pre-existing assertions confirmed passing
summary: >-
  Verifies, by independently reading all four named test files and a full,
  clean whole-suite run, that every .toEqual assertion comparing a
  description-less registration's read-back already carries the matching
  description value GlossaryService now answers, with no other assertion in
  those files disturbed.
implementation: sha256:6c54b39da194841c45fecaf24e3231a719956f147db8d7262ad6dc55b6d5b743
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4
tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary-query.port.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      the expected literal at this test's readConcept('a-concept') call stops naming description: '' — or names any other value — while GlossaryService.readConcept keeps answering registration.description ?? '' for a registration built with no description field, so the assertion mismatches the runtime read-back.

  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a concept's ttl as the data now states it, not as it stood at the previous read
    proves: |-
      The .toEqual assertions in src/src/__tests__/integration/glossary/glossary-query.port.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      the expected literal after the ttl update stops naming description: '' while the real database row this test wrote carries no description column value GlossaryService's read-back would answer as anything else, so the assertion mismatches the runtime read-back over the real store.

  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a concept with its name, its accepted subject types and its ttl in seconds
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      the expected literal stops naming description: '' for a registration built with no description field, while GlossaryService.concepts() keeps answering the registration.description ?? '' default.

  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: holds the default of sixty seconds for a concept whose registration states no ttl
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      the expected literal stops naming description: '' alongside the sixty-second ttl default, while GlossaryService.concepts() keeps answering both defaults together for the same description-less registration.

  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page of the registered concepts with the full pagination envelope, its page count computed from the total and the limit (API-03)
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      either expected item in the returned page's data array stops naming description: '' for its description-less ConceptOnlyGlossaryStore fixture, while GlossaryService.listConcepts() keeps reusing the same registration.description ?? '' default.

  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page from the middle of a larger concept list, windowed by offset and limit rather than always starting at the first concept
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      either expected item in this windowed page's data array stops naming description: '' for its description-less fixture, while listConcepts() keeps answering the same default for both items in the window.

  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: holds the default of sixty seconds, read through listConcepts, for a concept whose registration states no ttl
    proves: |-
      The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts pass against GlossaryService's description-populated read-back.
    fails_when: |-
      the expected page.data literal stops naming description: '' alongside the sixty-second ttl default for this description-less fixture, while listConcepts() keeps answering both defaults together.

  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held vocabulary term exactly as the glossary holds it
    proves: |-
      No assertion in these four files changes in outcome beyond the added description key and its placeholder value — this term-shaped assertion, which carries no description key at all, is unchanged and still passes.
    fails_when: |-
      this assertion starts naming a description key it never named, or its expected term value stops matching what the store holds — either would show a change to this file reaching beyond the concept-shaped sites the other tests above cover.

  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a term added to the data since the previous read
    proves: |-
      No assertion in these four files changes in outcome beyond the added description key and its placeholder value — this term-shaped assertion, which carries no description key at all, is unchanged and still passes.
    fails_when: |-
      this assertion starts naming a description key it never named, or its expected term value stops matching the row this test wrote against the real database.

  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a vocabulary whose records hold one name twice
    proves: |-
      No assertion in these four files changes in outcome beyond the added description key and its placeholder value — this duplicate-name refusal assertion, which carries no description key at all, is unchanged and still passes.
    fails_when: |-
      this assertion starts naming a description key it never named, or the refusal it expects (DuplicateGlossaryNameError with this context) stops matching what glossary.terms('action') rejects with.

  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second entry for it
    proves: |-
      No assertion in these four files changes in outcome beyond the added description key and its placeholder value — this already-described concept's expected description (from the already-committed sibling task) is unchanged and still passes, showing the widened defaulting left an explicitly-named description untouched.
    fails_when: |-
      the expected literal's description value stops matching the description the registerConcept call itself named, or a second, unrelated description-less default value appears where an explicit description was given.

  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers an empty data array, never an error, for a glossary holding no concepts (API-02)
    proves: |-
      No assertion in these four files changes in outcome beyond the added description key and its placeholder value — this empty-page assertion, which names no concept and so no description key at all, is unchanged and still passes.
    fails_when: |-
      this assertion starts expecting anything other than an empty data array for a store holding no concept registrations.

  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: |-
      the whole-suite run's own per-file line: "✓ src/__tests__/unit/glossary/glossary-query.port.spec.ts (6 tests) 5ms"
    proves: |-
      The suite step covering these four files passes.
    fails_when: |-
      a captured suite run's test step shows this file with anything other than a checkmark and all 6 of its tests passing.

  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: |-
      the whole-suite run's own per-file line: "✓ src/__tests__/integration/glossary/glossary-query.port.spec.ts (3 tests) 397ms"
    proves: |-
      The suite step covering these four files passes.
    fails_when: |-
      a captured suite run's test step shows this file with anything other than a checkmark and all 3 of its tests passing.

  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: |-
      the whole-suite run's own per-file line: "✓ src/__tests__/unit/glossary/glossary.service.spec.ts (32 tests) 19ms"
    proves: |-
      The suite step covering these four files passes.
    fails_when: |-
      a captured suite run's test step shows this file with anything other than a checkmark and all 32 of its tests passing.

  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: |-
      the whole-suite run's own per-file line: "✓ src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts (7 tests) 6ms"
    proves: |-
      The suite step covering these four files passes.
    fails_when: |-
      a captured suite run's test step shows this file with anything other than a checkmark and all 7 of its tests passing.

not_applicable:
  - edge_case: two concurrent reads or registrations racing over the same concept name
    why: |-
      none of these four files' concept-shaped .toEqual sites, nor this task's own criteria, describe or require any concurrent-access guarantee — each is a single-request read-back over static fixture or seeded data.
  - edge_case: the store or the real database failing or answering slowly during one of these concept-shaped read-backs
    why: |-
      the failure path is already exercised by a pre-existing test outside this task's four criteria's concept-shaped sites ("lets a failing store read reach the caller instead of answering an absence", in the same unit query-port spec file), and this task's criteria say nothing about failure timing or slow answers.
  - edge_case: a concept-shaped .toEqual site pairing a description-less registration with a duplicate concept name
    why: |-
      the duplicate-name sites in these files ("refuses concepts whose registrations hold one name twice", "refuses listing concepts whose registrations hold one name twice, the same typed error reading a single concept already raises") assert a thrown DuplicateGlossaryNameError, never a concept literal with a description key, so the description default this task concerns never reaches them.

untested:
  - |-
    Whether every remaining .toEqual site across these four files, beyond the ones cited above, truly carries no concept-shaped literal missing description rests on this proof's own direct, full reading of each file (matching the independent finding the implementation record reports) rather than on an automated, exhaustive assertion-by-assertion check. No single falsifiable test can state "nothing else in the file changed" as one assertion without asserting a value the test itself computed, so the representative non-concept-shaped and already-described sites cited above stand in for that totality rather than proving it mechanically.
---

## What it is
Confirms, by reading all four named test files directly and by reading a full, clean whole-suite run (delivery/pinned-evidence-semantics/run/pinned-evidence-semantics-full-suite-post-read-concept, 142 files, 1628 tests, all passing), that every .toEqual assertion this task's criteria name already carries the description value GlossaryService's widened read-back answers, with no accompanying edit needed or made.

## Notes
No test file was created or modified for this proof: the task's own criteria are entirely about pre-existing assertions already passing, so the tests cited above are pre-existing, unmodified `it(...)` cases in the four named files, cited the same way task/migration-runner-comment-hang-corrective's own proof cites pre-existing, unmodified integration tests. The cited run is the same clean, whole-suite run this delivery relied on rather than one captured by this delivery itself, since no edit was made for it to capture.
