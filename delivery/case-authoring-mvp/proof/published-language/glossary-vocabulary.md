---
title: Proof for the glossary vocabulary
summary: What proves task/published-language/glossary-vocabulary — the unique-name refusals, the concept shape and its sixty-second default, the seeded non-conclusion outcomes, the plain-JSON persistence, and the two import audits, including the one the UNDERDETERMINED note demands.
implementation: sha256:2e52f256825d59ef6eea9a690be2b8247b3d3392ac49081d2d5c226a2a4c781e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/published-language-glossary-vocabulary-suite
tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a vocabulary with its terms exactly as the store holds them
    proves: "No vocabulary holds two entries with the same name. — the accepting half: records already unique are answered unchanged"
    fails_when: the glossary drops, reorders into different records, or invents terms a unique vocabulary holds
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a vocabulary whose records hold one name twice
    proves: "No vocabulary holds two entries with the same name."
    fails_when: a term vocabulary holding one name twice is answered instead of refused, or the refusal stops naming the vocabulary and the repeated name
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses concepts whose registrations hold one name twice
    proves: "No vocabulary holds two entries with the same name. — over the concepts"
    fails_when: duplicate concept registrations are answered instead of refused
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a duplicated outcome vocabulary before seeding writes anything
    proves: the edge of an operation against state that forbids it — the duplicate refusal is raised before the outcome seeding writes through the port
    fails_when: reading a duplicated outcome vocabulary writes the seeded set before, or instead of, refusing
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a concept with its name, its accepted subject types and its ttl in seconds
    proves: "A concept declares its name, the subject types it accepts and its ttl in seconds."
    fails_when: an answered concept loses its name, its accepted subject types, or its stated ttl, or the stated ttl is replaced by the default
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: holds the default of sixty seconds for a concept whose registration states no ttl
    proves: "A concept whose registration states no ttl holds the default of sixty seconds. — the expected value is spelled 60 in the test rather than imported from the source"
    fails_when: an absent ttl reaches the caller as undefined, or the default stops being sixty seconds
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers no concepts as an empty list rather than an absence
    proves: the edge of an empty collection where one comes back
    fails_when: an empty concept store answers undefined, refuses, or invents a registration
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers both non-conclusion outcomes from an empty outcome vocabulary
    proves: "The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates. — the read half"
    fails_when: an empty outcome vocabulary answers without either non-conclusion outcome, or with anything besides the two
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: persists the seeded non-conclusion outcomes through the store
    proves: "The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates. — the holding half, observed at the port boundary"
    fails_when: the glossary answers the two outcomes without persisting them, so nothing holds them for the next reader
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: seeds only the absent non-conclusion outcome beside what the store already holds
    proves: the seam between criterion 4 and criterion 1 — the seed itself never creates a duplicate
    fails_when: seeding duplicates an already-present non-conclusion outcome, or drops the outcomes the store already held
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves a vocabulary other than outcome unseeded and answers it empty
    proves: the implementation's stated scope of the seeding — the two outcomes are seeded into the outcome vocabulary only
    fails_when: the non-conclusion outcomes leak into another vocabulary, or an empty vocabulary stops answering an empty list
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: persists a written vocabulary as a plain JSON file named for it
    proves: "The glossary's records persist as plain JSON files and the dependency manifest declares no database driver. — the first half"
    fails_when: the records land anywhere but a plain JSON file per vocabulary, or the file's content stops round-tripping through JSON.parse
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: answers a written vocabulary back exactly as persisted
    proves: the store port's contract that readTerms answers records exactly as persisted, over the real filesystem
    fails_when: the adapter loses, reshapes or reorders into different records what it wrote
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: answers an absent vocabulary file as the empty vocabulary
    proves: the inference the implementation recorded — an absent file reads as the empty vocabulary rather than an error
    fails_when: a fresh directory's read throws or answers anything but the empty list
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: creates the data directory on the first write
    proves: the edge of absent state at first use
    fails_when: the first write into an absent data directory throws, or what it wrote cannot be read back
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: answers a concept registration without a ttl exactly as the file states it
    proves: the split behind criterion 3 that the port documents — the store defaults nothing, and the domain alone supplies sixty
    fails_when: the file store starts supplying a ttl for a registration that stated none, or drops the ttl a registration stated
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: refuses a vocabulary file that does not hold valid JSON
    proves: the edge of a dependency answering in an unexpected shape — a corrupt file is refused as a typed GlossaryStoreError
    fails_when: a non-JSON vocabulary file is answered as records, or the failure reaches the caller as something other than the typed store error
  - file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
    name: refuses a vocabulary file whose content is not the promised records
    proves: the edge of well-formed JSON that is not the port's promised records
    fails_when: records missing the promised shape are answered instead of refused
  - file: src/__tests__/integration/factories/glossary.factory.spec.ts
    name: answers both non-conclusion outcomes from a fresh data directory
    proves: "The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates. — through the real wiring, from the earliest state any first case could meet"
    fails_when: the wired glossary's first read over an empty directory answers without either outcome
  - file: src/__tests__/integration/factories/glossary.factory.spec.ts
    name: persists the seeded non-conclusion outcomes as a plain JSON file
    proves: criteria 4 and 5 meeting — after the first read, outcome.json exists, parses as plain JSON, and holds both non-conclusion outcomes
    fails_when: the seeded outcomes are answered but never land as a plain JSON file a later process would hold
  - file: src/__tests__/unit/glossary/vocabulary-modules.spec.ts
    name: the vocabulary modules import no framework, no driver and no provider client
    proves: "The vocabulary modules import no framework, no driver and no provider client. — every .ts file under src/glossary is audited, and an empty audit is refused rather than passed"
    fails_when: any module under src/glossary imports a known framework, database driver, ORM or provider client, statically or dynamically
  - file: src/__tests__/unit/glossary/vocabulary-modules.spec.ts
    name: the vocabulary modules import nothing from the standard library, so persistence reaches them only through the store port
    proves: the task's UNDERDETERMINED note — it fails over exactly the implementation the note names, which criterion 6's audit would not catch
    fails_when: any module under src/glossary imports node:fs, node:path or any other Node builtin, prefixed or bare
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares no database driver
    proves: "The glossary's records persist as plain JSON files and the dependency manifest declares no database driver. — the second half, over every dependency section"
    fails_when: a known database driver, ORM or query builder is declared in any dependency section
not_applicable:
  - edge_case: absent or malformed vocabulary argument at runtime
    why: terms() takes the vocabulary as a compile-time union and this task exposes no transport boundary; a test would have to defeat the type system to stage one
  - edge_case: two operations against one subject at once — two first reads seeding the outcome file concurrently
    why: no bound node states concurrent behavior, the MVP's store writes whole files in one process, and a test would assert a guarantee nobody made
  - edge_case: a dependency that answers slowly
    why: no criterion or bound node states timing behavior for the glossary; a timeout asserted here would be a fact the specification does not hold
  - edge_case: a boundary at each end of a stated range
    why: the only number any criterion states is the sixty-second default, which is tested; no range for a ttl is stated anywhere this task reaches
untested:
  - whether a registration stating a zero or negative ttl is accepted or refused — no criterion or bound node decides validity, and a test either way would state a domain fact nothing holds
  - the ordering against an actual first case — the seeding is lazy, so a first case that validated without ever reading outcomes through the glossary would meet an unseeded store; whichever task validates the first case owes that seam a test
  - both import audits read static and dynamic import specifiers from source text; a module reaching the filesystem through a computed dynamic import, a global, or a helper outside src/glossary would evade them
  - the two denylists are finite lists of known packages; a driver or client not on them would pass both audits — the criterion names categories, and a category has no closed spelling
divergences:
  - cites: TST-04
    file: src/__tests__/unit/glossary/vocabulary-modules.spec.ts
    departure: the file mirrors the src/glossary directory rather than one unit — no module named vocabulary-modules.ts exists.
    why: criterion 6 is a condition over every vocabulary module at once, including ones added later, so the audit's subject is the directory; splitting it per file would silently exempt the next module
  - cites: TST-04
    file: src/__tests__/unit/dependency-manifest.spec.ts
    departure: the file mirrors no unit under src — its subject is package.json at the target root, which sits outside every mirrorable path.
    why: criterion 5's second half is about the manifest itself; the file sits in the unit subtree at the shallowest point the rule's layout offers a subject the layout never anticipated
---
## What it is
Twenty-three tests over five files: the service's refusals and guarantees as pure units against a fake port, the file adapter and the wiring against the real filesystem, and three audits — the framework-and-driver denylist, the manifest's driver absence, and the Node-builtin audit that excludes exactly the implementation the task's UNDERDETERMINED note names.

## Notes
The finding worth carrying forward sits in untested: the outcome seeding is lazy, so the rule's before-the-first-case guarantee holds only if case validation reads outcomes through the glossary — the task that validates the first case owes that seam a test.
TST-04 is departed from twice and disclosed: two audit files have no single unit to mirror, because their subjects are a directory and the manifest.
