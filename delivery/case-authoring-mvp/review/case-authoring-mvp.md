---
title: Review of case-authoring-mvp
summary: Four-pass evidence over all ten delivered tasks of the case-authoring-mvp initiative — coverage, specification conformance, standard conformance, and a captured run that passed cleanly.
reviewed:
  - .gitignore
  - .secretlintignore
  - eslint.config.js
  - package-lock.json
  - package.json
  - src/__tests__/integration/capability-registry/capability-query.port.spec.ts
  - src/__tests__/integration/factories/capability-registry.factory.spec.ts
  - src/__tests__/integration/factories/case-query.factory.spec.ts
  - src/__tests__/integration/factories/glossary.factory.spec.ts
  - src/__tests__/integration/glossary/glossary-query.port.spec.ts
  - src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
  - src/__tests__/integration/persistence/file-case-store.repository.spec.ts
  - src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts
  - src/__tests__/unit/capability-registry/capability-query.port.spec.ts
  - src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  - src/__tests__/unit/capability-registry/no-network-persistence.spec.ts
  - src/__tests__/unit/case/case-document-modules.spec.ts
  - src/__tests__/unit/case/case-query.service.spec.ts
  - src/__tests__/unit/case/case-resolution.spec.ts
  - src/__tests__/unit/case/parse-case-document.spec.ts
  - src/__tests__/unit/case/validate-case-coherence.spec.ts
  - src/__tests__/unit/dependency-manifest.spec.ts
  - src/__tests__/unit/glossary/glossary-query.port.spec.ts
  - src/__tests__/unit/glossary/glossary.service.spec.ts
  - src/__tests__/unit/glossary/vocabulary-modules.spec.ts
  - src/capability-registry/capability-query.port.ts
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability-store.port.ts
  - src/capability-registry/capability.ts
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
  - src/case/case-store.port.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/case/validate-case-coherence.ts
  - src/errors/capability-not-read-only.error.ts
  - src/errors/capability-store.error.ts
  - src/errors/case-not-found.error.ts
  - src/errors/case-not-valid.error.ts
  - src/errors/case-store.error.ts
  - src/errors/concept-already-answered.error.ts
  - src/errors/duplicate-concept-answer.error.ts
  - src/errors/duplicate-glossary-name.error.ts
  - src/errors/glossary-store.error.ts
  - src/errors/incoherent-case.error.ts
  - src/errors/incomplete-capability-contract.error.ts
  - src/errors/invalid-case-document.error.ts
  - src/factories/capability-registry.factory.ts
  - src/factories/case-query.factory.ts
  - src/factories/case-store.factory.ts
  - src/factories/glossary.factory.ts
  - src/glossary/glossary-query.port.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/glossary/terms.ts
  - src/index.ts
  - src/persistence/file-capability-store.repository.ts
  - src/persistence/file-case-store.repository.ts
  - src/persistence/file-glossary-store.repository.ts
  - src/persistence/json-file.ts
  - tsconfig.json
tasks:
  - task/published-language/build-substrate
  - task/published-language/glossary-vocabulary
  - task/published-language/glossary-query
  - task/capability-registry/capability-registration
  - task/capability-registry/capability-resolution
  - task/case-model/case-document-model
  - task/case-model/case-resolution
  - task/case-model/case-coherence-validation
  - task/case-store/versioned-file-store
  - task/case-store/read-case
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: the captured run (run/review-case-authoring-mvp) passed every step; there is no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
coverage:
  - criterion: 'package.json declares "type": "module" at its top level.'
    state: uncovered
    why: no test in the reviewed set reads package.json's own fields.
  - criterion: package.json declares the test, lint, typecheck and secret-scan scripts the standard's tool-decided rules run as.
    state: uncovered
    why: no test in the reviewed set inspects package.json's scripts section.
  - criterion: package.json declares every dependency the project uses, each drawn from the standard's authorized list.
    state: uncovered
    why: the one manifest test (dependency-manifest.spec.ts) checks only that no database driver is declared, never that every used dependency is declared or authorized.
  - criterion: package.json declares the secretlint configuration the secret-scan step reads.
    state: uncovered
    why: no test reads package.json's secretlint configuration.
  - criterion: tsconfig.json declares the strict compiler configuration STK-01 and TYP-01 require and states its module resolution mode.
    state: uncovered
    why: no test reads or asserts on tsconfig.json.
  - criterion: eslint.config.js is a flat config declaring the TypeScript parser and a non-empty rule set, so the lint step decides something rather than nothing.
    state: uncovered
    why: no test reads or asserts on eslint.config.js.
  - criterion: npm ci followed by each of the declared typecheck, lint, secret-scan and test steps completes on the tree as produced.
    state: uncovered
    why: no test in the reviewed set executes or captures these commands; only a captured run demonstrates this, and no proof record was written for this task.
  - criterion: No vocabulary holds two entries with the same name.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "refuses a vocabulary whose records hold one name twice"}
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "refuses concepts whose registrations hold one name twice"}
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "refuses a duplicated outcome vocabulary before seeding writes anything"}
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "refuses to resolve over a vocabulary holding one name twice rather than picking a copy"}
  - criterion: A concept declares its name, the subject types it accepts and its ttl in seconds.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "answers a concept with its name, its accepted subject types and its ttl in seconds"}
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "answers a held concept with its accepted subject types and its ttl"}
  - criterion: A concept whose registration states no ttl holds the default of sixty seconds.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "holds the default of sixty seconds for a concept whose registration states no ttl"}
  - criterion: The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary.service.spec.ts, name: "answers both non-conclusion outcomes from an empty outcome vocabulary"}
      - {file: src/__tests__/integration/factories/glossary.factory.spec.ts, name: "answers both non-conclusion outcomes from a fresh data directory"}
  - criterion: The glossary's records persist as plain JSON files and the dependency manifest declares no database driver.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-glossary-store.repository.spec.ts, name: "persists a written vocabulary as a plain JSON file named for it"}
      - {file: src/__tests__/integration/factories/glossary.factory.spec.ts, name: "persists the seeded non-conclusion outcomes as a plain JSON file"}
      - {file: src/__tests__/unit/dependency-manifest.spec.ts, name: "the dependency manifest declares no database driver"}
  - criterion: The vocabulary modules import no framework, no driver and no provider client.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/vocabulary-modules.spec.ts, name: "the vocabulary modules import no framework, no driver and no provider client"}
  - criterion: Reading a term the glossary holds answers that term as the glossary holds it.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "answers a held vocabulary term exactly as the glossary holds it"}
  - criterion: Reading a term the glossary does not hold reports the absence rather than an invented term.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "reports a term the glossary does not hold as an absence naming what was asked"}
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "reports any term of an empty vocabulary as the absence"}
  - criterion: Reading a concept answers its accepted subject types and its ttl.
    state: covered
    tests:
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "answers a held concept with its accepted subject types and its ttl"}
  - criterion: A read after the glossary's data changes answers the current holding, never a remembered one.
    state: covered
    tests:
      - {file: src/__tests__/integration/glossary/glossary-query.port.spec.ts, name: "answers a term added to the data since the previous read"}
      - {file: src/__tests__/integration/glossary/glossary-query.port.spec.ts, name: "no longer answers a term removed from the data since the previous read"}
      - {file: src/__tests__/integration/glossary/glossary-query.port.spec.ts, name: "answers a concept's ttl as the data now states it, not as it stood at the previous read"}
      - {file: src/__tests__/unit/glossary/glossary-query.port.spec.ts, name: "no longer answers a term the holding no longer carries, even after answering it once"}
  - criterion: A registration whose nature is not read-only is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration whose nature is mutating"}
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration whose nature is outside the capability-nature vocabulary"}
  - criterion: A registration missing its input schema, its output schema or its connector is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration that declares no input schema, naming the attribute"}
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration that declares no output schema, naming the attribute"}
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration that declares no connector, naming the attribute"}
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "treats an attribute declared as the empty string as undeclared"}
  - criterion: A registration that states no timeout takes the default of sixty seconds.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "holds the default of sixty seconds, as 60000 milliseconds, for a registration that states no timeout"}
  - criterion: A registration with a complete read-only contract is not refused by these rules.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "accepts a complete read-only contract and answers the capability as registered"}
  - criterion: Registrations persist as plain JSON files and the dependency manifest declares no database driver.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts, name: "persists written registrations as a plain JSON file named capability.json"}
      - {file: src/__tests__/integration/factories/capability-registry.factory.spec.ts, name: "persists a registered capability as a plain JSON file under the data directory"}
      - {file: src/__tests__/unit/dependency-manifest.spec.ts, name: "the dependency manifest declares no database driver"}
  - criterion: Reading a concept one capability answers returns that capability with its name, version, nature, both schemas, timeout and connector.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "answers the one capability currently answering a concept, whole with its declared contract"}
  - criterion: Reading a concept no capability currently answers reports the absence rather than an invented capability.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "reports a concept no capability currently answers as an absence naming what was asked"}
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "reports any concept as absent over an empty registry"}
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "reports the empty concept as the same absence rather than failing"}
  - criterion: No concept ever resolves to more than one capability.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "refuses a registration naming a concept a different capability already answers"}
      - {file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts, name: "holds no second answer for a concept when it refuses the registration"}
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "refuses to resolve a concept the holding answers twice rather than choosing among the answers"}
      - {file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts, name: "refuses to resolve over a capability file hand-edited into two answers for one concept"}
  - criterion: A read after a registration changes answers the registration as it stands, never a remembered one.
    state: covered
    tests:
      - {file: src/__tests__/unit/capability-registry/capability-query.port.spec.ts, name: "no longer answers a concept the holding no longer carries, even after answering it once"}
      - {file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts, name: "answers a capability registered since the previous read, never a remembered absence"}
      - {file: src/__tests__/integration/capability-registry/capability-query.port.spec.ts, name: "answers a changed registration as it now stands, never the record it replaced"}
  - criterion: A document holding slug, title, when_to_use, version, hash, subject, fallback and at least one hypothesis parses into one case aggregate.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "parses a document declaring every attribute into the one case aggregate"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "parses a case declaring exactly one hypothesis"}
  - criterion: "The whole aggregate — hypotheses, resolutions, referrals — is read from the one document, and no part of a case is read from a second store."
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "reads hypotheses, resolutions and referrals from the one document alone"}
  - criterion: A case whose slug differs from the name of the file that holds it is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a case whose slug differs from the name of the file that holds it"}
  - criterion: A case declaring no hypothesis is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a case that declares no hypotheses attribute"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a case declaring an empty list of hypotheses"}
  - criterion: A case with two hypotheses sharing a name is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a case whose two hypotheses share a name"}
  - criterion: A hypothesis collecting no concept is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis that declares no collects"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis collecting no concept"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis whose collects holds an entry naming no concept"}
  - criterion: A hypothesis carrying an empty criterion is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis carrying an empty criterion"}
  - criterion: A hypothesis or the fallback missing its outcome or its referral is refused.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis whose resolution misses its outcome"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis whose resolution misses its referral"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a hypothesis declaring no resolution at all"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a fallback missing its outcome"}
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a fallback missing its referral"}
  - criterion: A document violating several structural rules is refused once, with every violation named.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/parse-case-document.spec.ts, name: "refuses a document violating several structural rules once, naming every violation"}
  - criterion: The document model's modules import no framework, no driver and no provider client.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-document-modules.spec.ts, name: "the document model's modules import no framework, no driver and no provider client"}
  - criterion: The collection plan is the deduplicated union of every hypothesis's collects.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "answers the deduplicated union of every hypothesis's collects, each concept once"}
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "lists each concept where the declared order first names it"}
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "answers a concept one hypothesis collects twice exactly once"}
  - criterion: requires-evaluation-of answers what totality demands as the case declares it, one entry per declared hypothesis name.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "demands one evaluation per declared hypothesis, named and ordered as the case declares them"}
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "demands exactly the one hypothesis of a single-hypothesis case"}
  - criterion: Given confirmed and refuted verdicts per hypothesis name, resolve-outcome answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role"}
  - criterion: A hypothesis confirmed after the determining one keeps its confirmed verdict, unmarked.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "leaves a hypothesis confirmed after the determining one holding its confirmed verdict, unmarked"}
  - criterion: When every hypothesis is refuted or inconclusive, resolve-outcome answers the fallback's outcome and referral.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "answers the fallback's outcome and referral when every hypothesis is refuted or inconclusive"}
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "falls back over a single-hypothesis case whose one claim is refuted"}
  - criterion: When the fallback answers, no determining hypothesis is named.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "names no determining hypothesis when the fallback answers"}
  - criterion: The declared order of the case's hypotheses is the only precedence resolution consults.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-resolution.spec.ts, name: "follows the declared order alone, so reversing the declaration flips which confirmed hypothesis determines"}
  - criterion: The resolution modules import no framework, no driver and no provider client.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-document-modules.spec.ts, name: "the document model's modules import no framework, no driver and no provider client"}
    why: the criterion names the resolution module specifically; the one audit in the reviewed set scans every .ts file under src/case (which includes case-resolution.ts) rather than naming that file by name, so coverage is real but comes from a directory-wide scan rather than a file-targeted test.
  - criterion: A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case naming a subject type the glossary does not hold, naming the term"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case naming an outcome the glossary does not hold, naming the term"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case naming an action the glossary does not hold, naming the term"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case naming a recipient the glossary does not hold, naming the term"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case collecting a concept the glossary does not hold, naming the concept"}
  - criterion: A case whose collected concept does not accept the declared subject type is refused, naming the concept and the subject type that disagree.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case whose collected concept does not accept the declared subject type, naming both"}
  - criterion: A case collecting a concept no read-only capability currently answers is refused, naming the concept.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case collecting a concept no capability currently answers, naming the concept"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case whose collected concept is answered only by a mutating capability, naming the concept"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case whose answering capability declares no output schema, naming the concept"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case whose answering capability declares a non-integer timeout, naming the concept"}
  - criterion: The capability check reads the registration as it stands at the moment of validation, so the same case refused before a capability registers is not refused by that check after it registers.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "reads the capability registration as it stands at the moment of validation, not a remembered one"}
  - criterion: A case violating several coherence rules is refused once, with every violation named.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "refuses a case violating several coherence rules at once, naming every violation"}
  - criterion: A case violating no coherence rule is not refused by these rules.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "does not refuse a case that violates no coherence rule"}
  - criterion: The checks reach the glossary and the registry through ports over the published reads, importing no framework, driver or client into the domain modules.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-document-modules.spec.ts, name: "the document model's modules import no framework, no driver and no provider client"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "reads the capability registration as it stands at the moment of validation, not a remembered one"}
      - {file: src/__tests__/unit/case/validate-case-coherence.spec.ts, name: "does not refuse a case that violates no coherence rule"}
    why: "the import half is proven directory-wide; the port-reaching half is proven behaviorally, through fakes typed to the two port interfaces, but the audit's relative-import check would not itself catch a coherence module importing a concrete service instead of the port type — that narrower fact rests on the behavioral tests alone."
  - criterion: The store holds exactly one JSON document per case version, and no second store holds any part of a case.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "persists a written case version as a plain JSON file at <slug>/<version>.json"}
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "writes no file anywhere in the data directory besides each version file itself"}
  - criterion: Storing a new version leaves every earlier version readable, the index keeping all versions rather than the last.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "keeps every earlier version readable after later versions of the same case are written"}
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "grows the list of versions with each write instead of keeping only the last"}
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "derives listVersions from the version files present on disk right now, not from a record kept beside them"}
  - criterion: A stored case reads back by slug and version, and the hash it answers is the content identity of the document read.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "answers a stored version with a hash equal to the sha256 of the exact bytes its file holds"}
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "keeps every earlier version readable after later versions of the same case are written"}
  - criterion: Loading a case is reading one file.
    state: covered
    tests:
      - {file: src/__tests__/integration/persistence/file-case-store.repository.spec.ts, name: "reads one version unaffected by another version file of the same case being unreadable"}
  - criterion: The dependency manifest declares no database driver and the deployment provisions no database service.
    state: partial
    tests:
      - {file: src/__tests__/unit/dependency-manifest.spec.ts, name: "the dependency manifest declares no database driver"}
    why: no test in the reviewed set examines deployment configuration, so the half asserting that the deployment provisions no database service is unexercised — no deployment artifact exists in this repository for a test to audit.
  - criterion: Reading a case every rule holds for answers the case whole, pinned by content.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "answers the case whole, matching exactly what the document holds, when every structural and coherence rule holds for it"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "pins the answered case by exactly the hash the store attached to the version this call read, not a value read-case computes itself"}
      - {file: src/__tests__/integration/factories/case-query.factory.spec.ts, name: "answers a case written directly to the real store, pinned by the sha256 of the exact bytes on disk, with no publish step in between"}
  - criterion: Reading a case any structural or coherence rule fails at that moment is refused, with every violated rule named in the one refusal.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "refuses a case failing one structural rule, naming the violation in a CaseNotValidError"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "joins several structural violations into the one CaseNotValidError"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "refuses a structurally valid case failing one coherence rule, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "joins several coherence violations into the one CaseNotValidError"}
      - {file: src/__tests__/integration/factories/case-query.factory.spec.ts, name: "refuses through the real wiring a case document declaring no hypothesis, naming the structural violation"}
    why: "the reviewed set proves this refusal joins every violation of whichever half of the validator ran, and separately proves structural failure always precedes and pre-empts coherence checking (case-query.service.spec.ts's short-circuit test) — no test proves both halves named together in one call, because the composition's own order makes that combination unreachable; see the conformance-adjacent contested note this delivery's own proof already carries."
  - criterion: A case that validated at one read is refused at a later read when the glossary or registration it depends on no longer satisfies a rule.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "refuses at a later read a case that validated earlier, once the glossary no longer holds a concept it depends on"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "refuses at a later read a case that validated earlier, once the capability registry no longer answers a concept it depends on"}
      - {file: src/__tests__/integration/factories/case-query.factory.spec.ts, name: "refuses at a later read, through the real wiring, a case that validated earlier once the glossary file no longer holds a concept it depends on"}
  - criterion: A replay read of a pinned version answers the exact version pinned, without revalidation.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "answers readCase and replayCase identically, in shape, for the same valid pinned version"}
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "replays a pinned version without running the coherence checks at all, answering the case even though the same content would refuse at read-case"}
      - {file: src/__tests__/integration/factories/case-query.factory.spec.ts, name: "replays the pinned version through the real store, answering it unchanged even after the real capability registration the case depends on is edited away"}
  - criterion: No publication gate stands between the authored file and its reading, so a file every rule holds for is a case at its next read.
    state: covered
    tests:
      - {file: src/__tests__/unit/case/case-query.service.spec.ts, name: "answers a version written directly to the store as its very next read, with no separate publish step anywhere in this composition"}
      - {file: src/__tests__/integration/factories/case-query.factory.spec.ts, name: "answers a case written directly to the real store, pinned by the sha256 of the exact bytes on disk, with no publish step in between"}
findings:
  - pass: conformance
    file: src/capability-registry/capability.ts
    where: "the Capability type and REQUIRED_REGISTRATION_ATTRIBUTES"
    evidence: |-
      export type Capability = {
        readonly name: string;
        readonly version: string;
        readonly nature: CapabilityNature;
        readonly input_schema: string;
        readonly output_schema: string;
        readonly timeout: number;
        readonly connector: string;
        readonly concept: string;
      };
    cost: "domain/integration/capability declares exactly seven attributes, and its Responsibility names the contract to declare completely as nature, both schemas, timeout, connector — five items, none of them concept. The source adds an eighth field, requires it on every registration, and refuses its absence through the same IncompleteCapabilityContractError that guards the domain-declared attributes. A reader checking what a capability must declare finds this eighth requirement only in code; the node that is supposed to be the authority on the capability's shape says nothing about it."
    correction: "Either extend domain/integration/capability's declared attributes to include the concept a capability answers, through the analysis that authors the specification, or keep the concept-to-capability association out of the Capability record's required contract and surface a missing concept as its own condition rather than folding it into IncompleteCapabilityContractError."
  - pass: standard
    file: src/capability-registry/capability-registry.service.ts
    where: "inside readCapability's duplicate-answer refusal"
    cites: COR-02
    evidence: "throw new DuplicateConceptAnswerError(concept, answers);"
    cost: "DuplicateConceptAnswerError carries a name, a message and a context but no status field. A later handler mapping this error to a transport outcome has nothing on the error itself to read that mapping from."
    correction: "Add a status field to the error class, as COR-02 requires — noting this pulls against COR-03's demand that a service's own errors not carry transport knowledge; the two rules disagree here and are worth the registry owner's attention."
  - pass: standard
    file: src/capability-registry/capability-registry.service.ts
    where: "refuseContractDepartures"
    cites: STK-08
    evidence: |-
      function refuseContractDepartures(
        registration: CapabilityRegistration,
      ): asserts registration is DeclaredRegistration {
        const problems = contractProblems(registration);
        if (problems.length > 0) {
          throw new IncompleteCapabilityContractError(problems);
        }
      }
    cost: "The registration a caller submits is checked by a hand-rolled assertion function and a matching walk over REQUIRED_REGISTRATION_ATTRIBUTES, not by a schema. A required attribute added to the capability element can silently diverge from this hand-written guard."
    correction: "Express CapabilityRegistration's contract as a schema, parsed once at the point a registration is accepted, the way the file store already validates what it reads back."
  - pass: standard
    file: src/case/case-query.service.ts
    where: "heldVersion"
    cites: COR-02
    evidence: "throw new CaseNotFoundError(slug, version);"
    cost: "CaseNotFoundError carries a name, a message and a context but no status, so nothing here says what a future controller should answer with for an unstored version."
    correction: "Add a status field to CaseNotFoundError (and to CaseNotValidError, raised elsewhere in this file), as COR-02 requires."
  - pass: standard
    file: src/case/parse-case-document.ts
    where: "refuseStructuralViolations"
    cites: STK-08
    evidence: |-
      function refuseStructuralViolations(document: unknown, fileName: string): asserts document is Case {
        const problems = documentProblems(document, fileName);
        if (problems.length > 0) {
          throw new InvalidCaseDocumentError(fileName, problems);
        }
      }
    cost: "The case document — unknown data read back from the file store — is validated by a hand-written assertion tree instead of a schema. A field added to the Case shape has to be remembered here separately, and a check left out lets a malformed document through as if typed."
    correction: "Express the case document's structural rules as a schema and parse the document through it, rather than through this hand-written assertion tree."
  - pass: standard
    file: src/glossary/glossary.service.ts
    where: "assertUniqueNames"
    cites: COR-02
    evidence: "throw new DuplicateGlossaryNameError(vocabulary, record.name);"
    cost: "DuplicateGlossaryNameError carries a name, a message and a context but no status field, the same gap as the registry and case-query services raise."
    correction: "Add a status field to DuplicateGlossaryNameError, as COR-02 requires."
  - pass: standard
    file: src/persistence/file-capability-store.repository.ts
    where: "readCapabilities"
    cites: MNT-03
    evidence: |-
      public async readCapabilities(): Promise<readonly Capability[]> {
          const file = join(this.directory, CAPABILITY_FILE);
          const data = await readJsonFileOrAbsent(
            file,
            (failure, cause) => new CapabilityStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause }),
          );
          if (data === undefined) {
            return [];
          }
          const records = capabilityRecordsSchema.safeParse(data);
          if (!records.success) {
            throw new CapabilityStoreError('the capability file does not hold the records the store port promises', {
              file,
              issues: records.error.issues,
            });
          }
          return records.data;
        }
    cost: "This read-or-absent-then-parse-or-throw sequence already exists, generalized over any schema, as FileGlossaryStore's private readRecords() in file-glossary-store.repository.ts. Here it is retyped by hand instead of called. A fix to how an absent file is handled now has to be made in both places."
    correction: "Factor the read-or-absent/parse-or-throw sequence into one helper, parameterized by the schema and the error constructor, and have both stores call it."
  - pass: standard
    file: src/persistence/file-capability-store.repository.ts
    where: "readCapabilities"
    cites: COR-02
    evidence: |-
      throw new CapabilityStoreError('the capability file does not hold the records the store port promises', {
              file,
              issues: records.error.issues,
            });
    cost: "CapabilityStoreError carries a name, a message and a context but no status field, so a caller cannot tell from the error itself what a malformed capability file should answer as once a transport exists."
    correction: "Add a status field to CapabilityStoreError, as COR-02 requires."
  - pass: standard
    file: src/persistence/file-case-store.repository.ts
    where: "versionFileNames"
    cites: COR-02
    evidence: "throw new CaseStoreError('the case directory could not be read', { slug }, { cause: error });"
    cost: "CaseStoreError carries a name, a message and a context but no status field, the same gap as the other two file stores."
    correction: "Add a status field to CaseStoreError, as COR-02 requires."
  - pass: standard
    file: src/persistence/file-glossary-store.repository.ts
    where: "readRecords"
    cites: COR-02
    evidence: |-
      throw new GlossaryStoreError('the vocabulary file does not hold the records the store port promises', {
              file,
              issues: records.error.issues,
            });
    cost: "GlossaryStoreError carries a name, a message and a context but no status field, the same gap as the other two file stores and every business error the services raise."
    correction: "Add a status field to GlossaryStoreError, as COR-02 requires."
---
## What it is
Four-pass evidence over the whole case-authoring-mvp delivery — ten tasks, sixty-two files, the captured run that exercised the full registry over all of them at once rather than one task at a time.

## Notes
Coverage lists seven uncovered criteria, all under task/published-language/build-substrate: a task that produces the standard's presupposed substrate writes no proof record by design — there is no behavior for a test to prove, and a passing captured run is what stands in its place. The run captured for this review (run/review-case-authoring-mvp) executed install, typecheck, lint, secret-scan and test once over the whole change and every step passed, which is why the failures pass carries no findings and is recorded as not run: a run with nothing to diagnose is the one case that pass does not enter.
The conformance pass's one finding (Capability.concept) was already disclosed as an inference in the capability-registration implementation record; disclosure is not conformance — the pass reads the source against the specification regardless of what a record admitted, and the finding stands.
The standard pass's own COR-02 findings note a tension with COR-03 it does not resolve: adding a status field to a service's own error, as COR-02 asks, pulls that error toward carrying transport knowledge, which COR-03 asks it not to. Nine of the ten standard findings are this same COR-02 gap, repeated once per typed error class; the two STK-08 findings are a second, distinct pattern (hand-rolled boundary validation instead of a schema) at the two points untrusted data enters the domain — the case document and a capability registration.
The conformance and coverage passes both note, without escalating to a finding, an open question the specification does not settle: whether a case's own declared `hash` attribute is meant to equal the content hash the file store computes fresh from disk on every read. The source never reconciles the two, and nothing in the reviewed nodes states plainly enough that they must agree.
This delivery's own read-case proof already carries, as a contested entry, the same boundary the "refused once, every violation named" coverage entry above restates: a structural failure and a coherence failure can never both be named in one call, because coherence checking requires the parsed aggregate a structural failure never produces. That is not a gap in this review; it is the same fact seen from two passes.
