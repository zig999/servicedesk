---
title: Glossary vocabulary as data behind a store port
summary: The four term vocabularies and the concepts as pure domain values whose plain-JSON persistence reaches them only through a domain-declared port, with uniqueness, the sixty-second ttl default and the two non-conclusion outcomes guaranteed by the glossary's holding.
task: sha256:0b16dc668e8332c826cccfcfee2d31cfb3c17e48971d1794187709840c44dfea
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/published-language-glossary-vocabulary-build
installed:
  - "@types/node"
files:
  - path: src/glossary/terms.ts
    effect: declares the published language as data — the GlossaryTerm shape and the SubjectType, Outcome, Action and Recipient aliases, the four-vocabulary union, the Concept and ConceptRegistration shapes, the DEFAULT_CONCEPT_TTL_SECONDS constant of sixty, and the two non-conclusion outcome names as NON_CONCLUSION_OUTCOMES
  - path: src/glossary/glossary-store.port.ts
    effect: declares IGlossaryStore, the port through which the glossary's records reach persistence — readTerms/writeTerms per term vocabulary and readConcepts — so no vocabulary module touches a file
  - path: src/glossary/glossary.service.ts
    effect: holds the glossary — answers each term vocabulary and the concepts with every name unique, refusing a duplicate through a typed error, defaults an absent ttl to sixty seconds, and never answers the outcome vocabulary without the two non-conclusion outcomes, seeding them through the port where the records lack them
  - path: src/errors/duplicate-glossary-name.error.ts
    effect: DuplicateGlossaryNameError, the typed business error raised when a vocabulary's records hold one name twice, carrying the vocabulary and the name as context
  - path: src/errors/glossary-store.error.ts
    effect: GlossaryStoreError, the typed data error raised when a vocabulary file cannot be read or does not hold the records the port promises, carrying the file and the parse issues or cause as context
  - path: src/persistence/file-glossary-store.repository.ts
    effect: the file-backed adapter of the port — one plain JSON file per vocabulary under a caller-chosen directory, an absent file reading as the empty vocabulary, content held to zod record schemas, whole-file writes; the only module importing node:fs
  - path: src/factories/glossary.factory.ts
    effect: createGlossary(dataDirectory) wires FileGlossaryStore into GlossaryService, the module's one instantiation point
  - path: package.json
    effect: now also declares @types/node in devDependencies so the strict typecheck accepts the adapter's node:fs and node:path imports; still declares no database driver
  - path: package-lock.json
    effect: refreshed by the package manager to record @types/node, so the declared npm ci consumes a consistent pair
criteria:
  - criterion: No vocabulary holds two entries with the same name.
    met: true
    how: every read of a term vocabulary or of the concepts passes through assertUniqueNames in src/glossary/glossary.service.ts, which throws DuplicateGlossaryNameError on the first repeated name, before any answer and before the outcome seeding write
  - criterion: A concept declares its name, the subject types it accepts and its ttl in seconds.
    met: true
    how: the Concept type in src/glossary/terms.ts requires all three, the store's record schema requires name and accepts, and GlossaryService.concepts() answers every concept with its ttl defined
  - criterion: A concept whose registration states no ttl holds the default of sixty seconds.
    met: true
    how: ConceptRegistration admits an absent ttl, the store schema keeps it optional and never defaults it, and GlossaryService.concepts() applies registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS
  - criterion: The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates.
    met: true
    how: every read of the outcome vocabulary merges in whichever of NON_CONCLUSION_OUTCOMES the records lack and persists the merge through the port, so no consumer can observe the vocabulary without them
  - criterion: The glossary's records persist as plain JSON files and the dependency manifest declares no database driver.
    met: true
    how: FileGlossaryStore reads and writes one JSON file per vocabulary through node:fs, and the package.json diff adds only @types/node — pg is not declared and no driver is imported anywhere
  - criterion: The vocabulary modules import no framework, no driver and no provider client.
    met: true
    how: the three modules under src/glossary import only each other and the plain error class under src/errors; node:fs and zod appear only in src/persistence/file-glossary-store.repository.ts, behind IGlossaryStore
nodes:
  - node: domain/glossary/subject-type
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the SubjectType value object and the subject-type member of the vocabulary union live in terms.ts; the service holds each subject-type name exactly once
  - node: domain/glossary/outcome
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the Outcome value object lives in terms.ts; the service holds each outcome name exactly once and guarantees the two pre-case non-conclusion outcomes
  - node: domain/glossary/action
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the Action value object and the action member of the vocabulary union live in terms.ts; the service holds each action name exactly once
  - node: domain/glossary/recipient
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the Recipient value object and the recipient member of the vocabulary union live in terms.ts; the service holds each recipient name exactly once
  - node: domain/glossary/concept
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: Concept carries exactly the node's three attributes — name, accepts (subject-type names, many), ttl (integer seconds) — and stays deliberately thin, naming no shape for the observed data; the service guarantees the ttl and the once-ness the node's responsibility states
  - node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the two names live once as NON_CONCLUSION_OUTCOMES, and the outcome read never answers without them, seeding the records through the port on first absence — so the vocabulary the first case's validation reads already holds both
  - node: rules/knowledge/a-collected-concept-declares-a-ttl
    encoded_at: [src/glossary/terms.ts, src/glossary/glossary.service.ts]
    how: the glossary side only, as the task's REMAINDER note bounds it — every concept the glossary answers has a ttl, defaulted to the named sixty-second constant where the registration stated none; the case side belongs to the case-validation task and was not reached
  - node: constraints/the-mvp-persists-to-no-database
    encoded_at: [src/persistence/file-glossary-store.repository.ts]
    how: the glossary's records land as plain JSON files, one per vocabulary, written whole; the manifest half of the fitness holds — pg is never declared; the deployment half is outside this task per its REMAINDER note
  - node: constraints/the-domain-depends-on-no-infrastructure
    encoded_at: [src/glossary/glossary-store.port.ts]
    how: the vocabulary clause the task's criterion answers — the domain declares IGlossaryStore, the file adapter implements it outside src/glossary, and the domain modules stay testable as pure units; this also answers the task's UNDERDETERMINED note, which named direct standard-library persistence as the implementation the constraint refuses; the other three domain areas the constraint names belong to their own tasks
inferences:
  - inferred: the glossary persists as one JSON file per vocabulary, each an array of record objects, under one directory
    from: the constraint states plain JSON files without arranging them; the arrangement is a build decision no specification node should hold, decided here for the review to judge
  - inferred: an absent vocabulary file reads as the empty vocabulary rather than an error
    from: domain/glossary/subject-type — a discovered vocabulary grows as cases declare their subjects, so before any declaration a vocabulary holds nothing
  - inferred: records holding one name twice are refused with a typed error at read rather than silently deduplicated
    from: the nodes' exists-exactly-once responsibility; silently collapsing two same-named registrations would pick a surviving ttl and accepts nobody chose
  - inferred: name uniqueness compares exact strings, with no case folding or trimming
    from: every term node types name as a plain string and no node states a normalization
  - inferred: a blank name is refused by the store's record schema
    from: each node requires name and its responsibility is to name one exactly once; an empty string names nothing
  - inferred: a concept's accepts persists as declared and is not resolved against the subject-type vocabulary at registration
    from: the task's criteria name only the concept's three declarations, and the resolution rules reach case validation per the task's REMAINDER notes
  - inferred: the ttl schema admits any integer, unbounded
    from: domain/glossary/concept types ttl as integer and no node states a bound; refusing zero or negative would invent a rule
  - inferred: registration is a record present in the vocabulary's JSON data, curated rather than written through an API, so uniqueness and the ttl default apply where the glossary loads its records
    from: the epic's uncovered entries — outcomes enter by curation of the glossary's data, and no write path exists to refuse a term
  - inferred: the two non-conclusion outcomes seed lazily at every read of the outcome vocabulary rather than at a boot step
    from: the rule demands presence before the first case validates, case validation reads outcomes through the glossary, and no composition root exists yet to hang an explicit seed step on
  - inferred: the types-for-node package enters devDependencies at caret 24
    from: the standard authorizes the package but names no version; the current Node LTS line was chosen, and the version is the review's to judge
  - inferred: the store's data directory is a parameter of createGlossary, with no default path in source
    from: the standard's posture that operational values are not written in source, and no node names a path
divergences:
  - cites: COR-02
    file: src/glossary/glossary.service.ts
    departure: DuplicateGlossaryNameError, which the service raises, carries a name, a message and a context field but no status.
    why: no transport exists anywhere in this plan's tree yet; a status chosen without any endpoint would be a transport decision made ahead of the task that owns one, and COR-04's single mapping place can carry it when a transport arrives
  - cites: COR-02
    file: src/persistence/file-glossary-store.repository.ts
    departure: GlossaryStoreError, which the repository raises, carries a name, a message, a context field and its cause but no status.
    why: the same — with no transport in the tree, a status field would hold a number nothing answers with, and the mapping belongs to COR-04's one place once an endpoint exists
preserved:
  - package.json keeps "type":"module", the four scripts, the secretlint rules field, the zod dependency and the five existing devDependencies exactly as the substrate declared them; only @types/node is added
  - tsconfig.json, eslint.config.js and src/index.ts are untouched, so the substrate task's criteria keep holding as delivered
deferred:
  - what: nothing calls createGlossary yet; the data directory's actual value and the module's wiring into an entry point are unassigned.
    why: the composition root belongs to whatever task boots the service or publishes the glossary-query read, which depends on this one; wiring it here would widen the task
  - what: the published read-vocabulary-term and read-concept operations are not implemented.
    why: they are task/published-language/glossary-query's objective, named by the task's Advisory note as deliberately outside this cut
---
## What it is
The published language as data behind a port: four term vocabularies and the concepts, each name existing exactly once, persisted as one plain JSON file per vocabulary through an adapter the domain never sees past its interface.
The sixty-second ttl default and the two non-conclusion outcomes are guarantees of the glossary's holding, not of any caller's discipline.

## Notes
The port is the task's UNDERDETERMINED note answered in structure: src/glossary imports no filesystem, and the one module touching node:fs implements IGlossaryStore from outside the domain.
The lockfile was refreshed through the package manager under the standing authorization for dependency additions, so the declared npm ci consumes a consistent pair.
COR-02 is departed from twice and disclosed: the two typed errors carry no status because no transport exists in the tree yet to give one meaning.
