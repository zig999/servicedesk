---
title: Capability registry write upsert hotfix, first review
summary: What four passes found over the writeCapabilities upsert-by-identity fix, its port doc, and the
  two capability-store spec files it touched or reconciled.
reviewed:
- src/persistence/relational-capability-store.repository.ts
- src/capability-registry/capability-store.port.ts
- src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
tasks:
- task/capability-registry-write-upsert-hotfix/scope-write-to-identity
- task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-replace
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/capability-registry-write-upsert-hotfix) passed in full -- install, typecheck,
    lint, secret-scan and test all exited 0 -- so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: PUT /v1/capabilities/perfil-mobile-tecnico-reader/1.0.0 com um input_schema alterado, contra
    um banco onde essa identidade já tem ao menos uma linha em investigation_evidence citando-a, responde
    200 com a capability atualizada, nunca 500.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: updates a capability already referenced by investigation_evidence without failing, and the reference
      still resolves to the updated identity afterward
  why: 'The test proves the store-level write resolves without throwing and that the FK reference still
    resolves afterward -- the regression this criterion is rooted in -- but the criterion names an HTTP
    contract (a PUT answering 200, never 500) that nothing in the file set exercises: no test issues that
    request through the route/controller or asserts a status code.'
- criterion: Registrar uma capability em uma identidade (name, version) nova sucede mesmo quando outra
    capability já registrada está referenciada por investigation_evidence.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: registers a brand-new identity while a different capability remains referenced by investigation_evidence,
      leaving the referenced row exactly as it was
- criterion: Uma linha de capabilities referenciada por investigation_evidence nunca é apagada como efeito
    colateral de escrever uma capability de identidade diferente.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: registers a brand-new identity while a different capability remains referenced by investigation_evidence,
      leaving the referenced row exactly as it was
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: leaves capability-a exactly as it was when a different capability, capability-b, is written
      afterward
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: upserts each given capability by its own (name, version) identity, inside one transaction, and
      never sends a DELETE
- criterion: Nenhuma escrita em capabilities emite mais um DELETE sem filtro de WHERE contra a tabela
    inteira.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: upserts each given capability by its own (name, version) identity, inside one transaction, and
      never sends a DELETE
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty
      set
  why: Both tests assert the total absence of any DELETE statement, stricter than what the criterion states
    (it forbids only an unfiltered whole-table DELETE, not a DELETE with a WHERE clause). This over-assertion
    currently holds -- the implementation issues no DELETE at all -- but would break a future write path
    that legitimately issued a scoped, filtered DELETE the criterion does not forbid.
- criterion: O teste em relational-capability-store.repository.spec.ts que hoje espera que escrever capability-b
    apague capability-a passa a afirmar que ambas as identidades permanecem legíveis após a segunda escrita.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: leaves capability-a exactly as it was when a different capability, capability-b, is written
      afterward
- criterion: A suíte inteira (npm test) passa, incluindo esse arquivo, sem nenhum teste afirmando que
    uma escrita de uma identidade apaga uma identidade diferente.
  state: uncovered
  why: No single test's own assertion can prove "npm test passes" -- that is a fact about running the
    whole suite, established only by a captured run record (run/capability-registry-write-upsert-hotfix,
    which did pass in full), never by one test in isolation. The two files in this review's scope contain
    no assertion that writing one identity erases another, but the criterion's own scope is the entire
    suite, and the coverage pass was given only these two files to check for such an assertion elsewhere.
- criterion: 'Um teste distinto prova a garantia de leitura fresca (sem cache) para a MESMA identidade:
    reescrever uma capability já registrada com um valor novo (ex.: outro timeout) e ler de novo responde
    o valor novo, nunca o antigo.'
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: answers a rewritten capability with its new value at the very next read, never the value an
      earlier read of the same identity already answered
findings:
- pass: standard
  file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  where: lines 22-37, the header comment describing the investigation_evidence fixture group
  cites: MNT-03
  evidence: through raw SQL against the same minimal fixture chain relational-investigation-store.repository.spec.ts's
    own freshFixtures() already establishes (subject_types, outcomes, actions, recipients, cases, case_versions),
    narrowed to exactly what investigations and investigation_evidence require and duplicated here rather
    than imported, because a spec file's own fixture helpers are not exported for another spec file to
    import (TST-04's own one-file-per-unit boundary).
  cost: the fixture-building chain now exists as two independent copies; the day one of them is fixed
    for a schema change the other keeps building fixtures the schema no longer accepts, and the reader
    of the untouched copy has no way to know it drifted.
  correction: share the fixture-building logic through a module both spec files import, rather than restating
    it, or accept the duplication as a stated, permanent exception rather than a one-off disclosure.
- pass: standard
  file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  where: lines 58-64, requireDatabaseUrl()
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: this environment read is validated by a hand-written presence check rather than the Zod-parsed
    loadEnv every other boundary in the project answers to, so a malformed value (not merely an absent
    one) reaches this suite unchecked, through a path the rest of the service does not use.
  correction: read DATABASE_URL through config/env.ts's loadEnv, or state why this one caller cannot,
    in the same place STK-08 requires the parsing to live.
- pass: standard
  file: src/persistence/relational-capability-store.repository.ts
  where: line 74, the constructor
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: the class depends on the driver's own connection-pool shape rather than an interface this module
    declares, so a test of readCapabilities or writeCapabilities has to fabricate an object satisfying
    that concrete shape (including connect()) instead of a narrow abstraction this repository owns.
  correction: declare a narrow interface for what this repository actually needs from a connection (a
    queryable plus a transaction-checkout capability) and receive that, letting a factory supply the pg
    pool that satisfies it.
---

## What it is

A primeira revisão das duas tasks de `capability-registry-write-upsert-hotfix`: o upsert por
identidade de `writeCapabilities` e a reconciliação do teste órfão que ainda afirmava o
whole-table-replace removido.

## Notes

Os três achados do standard pass (MNT-03, STK-08, ARC-01) recaem sobre código pré-existente
que nenhuma das duas tasks desta entrega escreveu — `requireDatabaseUrl` e o construtor de
`RelationalCapabilityStore` já existiam antes, entregues por
`task/relational-stores/capability-store`; o pass revisa o arquivo inteiro, não só o diff.
MNT-03 recai sobre um trecho que a task 1 acrescentou (o grupo de fixtures de
investigation_evidence), já disclosed como divergência no proof daquela task — o pass
convergiu com essa disclosure de forma independente, sem tê-la recebido.
O drift do trace (`trace.py --check`) sobre o target inteiro reporta 161 achados (1 `moved`,
160 `code`) sobre 27 arquivos — a esmagadora maioria em arquivos que nenhuma das duas tasks
tocou (frontend, investigation/*, case-resolution.ts, status-map.ts etc.), dívida
pré-existente a este run. Os únicos 4 bindings `code` sobre um arquivo desta entrega
(`relational-capability-store.repository.ts`, contra `constraints/the-system-persists-to-
one-relational-database`, `domain/integration/capability-nature`, `domain/integration/
capability-registry`, `domain/investigation/evidence`) são exatamente os que os dois binds
desta entrega já disclosed como stale nos seus próprios recibos — nada novo aqui.
