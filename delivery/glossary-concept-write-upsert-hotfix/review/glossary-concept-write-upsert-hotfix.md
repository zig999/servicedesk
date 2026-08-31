---
title: Review of glossary-concept-write-upsert-hotfix
summary: What four passes found over the writeConcepts upsert-by-identity fix, its port docstring, and the tests proving it.
reviewed:
- src/glossary/glossary-store.port.ts
- src/persistence/relational-glossary-store.repository.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/http/register-concept.routes.spec.ts
tasks:
- task/glossary-concept-write-upsert-hotfix/write-concepts-upserts-by-identity
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/glossary-concept-write-upsert-hotfix) passed every step cleanly; there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: PUT /v1/glossary/concepts/cpt-ifs-sync criando um concept novo (nome que o glossário ainda não detém), contra um banco onde outro concept já existente tem ao menos uma linha em capabilities, investigation_evidence ou investigation_evaluation_citations citando-o, não retorna 500, e o glossário passa a manter, sob esse nome, exatamente o accepts, o ttl e a description enviados.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: creates a concept at a brand-new name without failing, and leaves a different, already-held concept — permanently referenced by a capability — exactly as it was, even though that referenced concept is not named anywhere in this call
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  why: The store half is exercised end to end against a real database. The criterion states an outcome of the PUT request itself (that it does not answer 500), and no test in the set issues a PUT against a real database holding a referenced concept — every route test either stubs registerConcept or backs it with an in-memory store with no concepts table and no foreign key. Of the three referencing tables the criterion names, only capabilities is exercised at the store level; no test inserts an investigation_evidence or investigation_evaluation_citations row citing a concept.
- criterion: Atualizar o ttl, a description ou o accepts de um concept já existente sucede mesmo quando outro concept registrado está referenciado por capabilities, investigation_evidence ou investigation_evaluation_citations, e o glossário passa a manter, sob o nome atualizado, exatamente os valores enviados, substituindo os que estavam ali.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: updates two already-held concepts in one call — each one's own row permanently referenced by its own capability — replacing each one's ttl, description and accepts exactly with the given values, without failing and without breaking either capability's own foreign key
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second entry for it
- criterion: Atualizar o ttl, a description ou o accepts de um concept cuja própria linha já é referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations sucede sem apagar nem violar essas linhas referenciadas, e o glossário passa a manter, sob esse nome, exatamente os valores enviados.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: updates two already-held concepts in one call — each one's own row permanently referenced by its own capability — replacing each one's ttl, description and accepts exactly with the given values, without failing and without breaking either capability's own foreign key
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: issues no statement referencing investigation_evidence, even when a given concept's description differs from whatever was stored before
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  why: This criterion names three referencing tables and only capabilities is checked directly (the integration test reads the capabilities rows back and asserts both survive intact). For investigation_evidence the evidence is indirect (no statement referencing it is ever issued). For investigation_evaluation_citations nothing in the set asserts anything at all — no test creates a citation row referencing the updated concept and none asserts that table is left untouched.
- criterion: Uma linha de concepts referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations nunca é apagada como efeito colateral de escrever um concept de nome diferente.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: creates a concept at a brand-new name without failing, and leaves a different, already-held concept — permanently referenced by a capability — exactly as it was, even though that referenced concept is not named anywhere in this call
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: runs exactly one statement against concepts per given concept, always the same upsert-by-identity INSERT ... ON CONFLICT (name) DO UPDATE, never a SELECT or any other form
- criterion: Atualizar o accepts de um concept substitui só as linhas de concept_accepts desse concept, nunca as de outro concept.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching a different concept's own rows, even though that other concept is not named anywhere in this call and shares the very same subject type
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles concept_accepts once per given concept, each one's own DELETE and INSERTs carrying only that concept's own name — for every concept in the given array, not only the first
- criterion: Registrar um concept sem description continua sendo recusado antes de qualquer escrita, exatamente como antes desta correção.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError (criterion 1)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming an empty-string description exactly as it refuses an absent one (criterion 1)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves the glossary's held concepts unchanged when a registration naming no description is refused (criterion 2)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves the already-held concept exactly as it was when a registration naming no description targets that very same, already-held name (criterion 2, the replace-at-an-existing-name path)
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError when a request creates a concept at a brand-new name with no description
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError when a request replaces an already-held concept at its own name with no description
- criterion: Nenhuma escrita em concepts ou concept_accepts emite mais um DELETE sem filtro de WHERE contra a tabela inteira.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles concept_accepts once per given concept, each one's own DELETE and INSERTs carrying only that concept's own name — for every concept in the given array, not only the first
  why: The concepts half is exercised strictly (every DELETE against that table is asserted to be the empty set). The concept_accepts half is exercised only over a call where each given concept accepts at least one subject type; the write where a given concept accepts nothing is exercised elsewhere but nothing there asserts anything about the concept_accepts DELETE that write sends, so an unfiltered DELETE emitted only on the empty-accepts path would pass this set.
- criterion: O glossário nunca passa a manter um mesmo nome de concept em duas linhas simultaneamente, em nenhum dos cenários acima.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: never ends up holding one concept name in two rows, even when the given array names it twice in one call — concepts.name's own primary key resolves it to exactly one row, carrying the second entry's own values
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second entry for it
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses concepts whose registrations hold one name twice
  why: The criterion quantifies over every scenario above, and row-counting under one name is asserted directly in only two of them. The scenarios of criteria 1, 2, 3 and 5 assert with toContainEqual(...), which would keep passing even if a second row under that same name were held beside it carrying the pre-update values.
findings:
- pass: conformance
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: the criterion-8 test "never ends up holding one concept name in two rows..." — its name and its final assertion
  evidence: 'expect(rows).toEqual([{ ttl: 20, description: ''second entry, in the same call'' }]);'
  cost: 'The uniqueness half is the rule''s, but which of two submissions for one name gets published is decided only in this test: the glossary answers a name submitted twice with the last entry''s meaning for concepts, while this same file''s unit-level sibling records the opposite answer (refusal) for a term vocabulary. rules/glossary/a-vocabulary-holds-each-name-once does not state which submission wins, so a later change to the upsert''s ON CONFLICT clause would change what the glossary publishes with no node contradicted.'
  correction: Either state in rules/glossary/a-vocabulary-holds-each-name-once what a submission carrying one name twice answers (refused, or resolved to the last entry), and let the test assert that stated fact, or narrow the test to the uniqueness the rule does state without pinning whose values survive.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: the SIXTY_SECONDS constant and its doc comment
  evidence: "/**\n * The default the criterion states in its own words — sixty seconds — spelled\n * here rather than imported from the source, so the test fails if the source's\n * constant drifts from what the task states.\n */\nconst SIXTY_SECONDS = 60;"
  cost: Sixty seconds is a decided business fact, stated by rules/knowledge/a-collected-concept-declares-a-ttl. The comment names a task's criterion as the authority instead of that rule; a plan and its tasks are disposable by design, so a reader checking whether sixty is still what the business decided is sent to a file that may no longer exist.
  correction: Keep the literal but cite rules/knowledge/a-collected-concept-declares-a-ttl as where sixty is decided, rather than the task criterion that quoted it.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: the doc comment on InMemoryGlossaryStore.blockWriteTerms
  evidence: Simulates a vocabulary where a whole-table replace (writeTerms) now fails because a row it already holds is permanently referenced elsewhere in the database ... (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
  cost: The fact this comment explains is stated by rules/glossary/the-non-conclusion-outcomes-precede-the-first-case. Citing a task instead points a reader at a disposable work root, and this same file already asserts elsewhere that this exact path must no longer cite that task and should cite the rule instead — so the enforcing test and the test double breaking it disagree, in one file, about where the fact lives.
  correction: Cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case at every place in this file that still names the discarded task path, exactly as glossary.service.ts and relational-glossary-store.repository.ts were already corrected to do.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: 'the test "does not treat a whitespace-only description as naming none: it is stored exactly as given, with no trimming and no refusal"'
  evidence: "expect(registered.description).toBe('   ');\n  expect(await store.readConcepts()).toEqual([\n    { name: 'a-whitespace-description-concept', accepts: ['a-subject-type'], ttl: SIXTY_SECONDS, description: '   ' },\n  ]);"
  cost: 'What counts as "no description" is the decision rules/glossary/a-concept-declares-its-description turns on, and here the test (and the code it proves) decides it: a description of three spaces is accepted and published, though the rule says only "with no description" and does not address whitespace. The specification settles the analogous question explicitly elsewhere (rules/integration/a-capability-declares-its-contract: "an attribute that is absent or an empty string is undeclared"), so a whitespace description here is admitted by the code alone, with downstream consequences for rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one.'
  correction: Decide in rules/glossary/a-concept-declares-its-description whether a description that is empty or only whitespace counts as none, and let this test assert whatever the node then states.
- pass: standard
  cites: STK-08
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: requireDatabaseUrl(), with the departure disclosed in the file header
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url) {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');\n  }\n  return url;\n}"
  cost: 'The environment reaches this suite through a truthiness check rather than the schema that decides what DATABASE_URL may be, so this file answers that question and answers it more weakly: a present-but-malformed value passes the check and surfaces later as a driver error in a hook that names no variable, instead of as the env boundary''s own refusal naming DATABASE_URL.'
  correction: Parse DATABASE_URL here through the field schema config/env.ts already declares for that one variable, exported so a caller can parse it alone, and let loadEnv keep composing the whole environment for the application.
- pass: standard
  cites: MNT-03
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: isForeignKeyViolation() and deleteTolerantly()
  evidence: "function isForeignKeyViolation(error: unknown): boolean {\n  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;\n}"
  cost: The tolerance this project needs because released rows are permanently undeletable now lives in two files (this one and create-draft.operation.spec.ts), each with its own copy of the guard. When it has to change, whoever fixes one copy has nothing pointing at the other.
  correction: Move the guard and the tolerant delete into one shared test-support module and import them in both suites.
- pass: standard
  cites: TST-03
  file: src/__tests__/unit/http/register-concept.routes.spec.ts
  where: buildTestApp(), the stand-in most of this file runs against
  evidence: "function buildTestApp(): { app: FastifyInstance; registerConcept: RegisterConceptMock } {\n  const registerConcept: RegisterConceptMock = vi.fn();\n  ...\n}"
  cost: What is stood in for is GlossaryService.registerConcept, where this project's create-or-replace-by-name holding and its description refusal actually live — business logic, not a boundary. The test filed under "replaces in place, never a second entry" passes purely on the mock's scripted return values, so a green run there does not show the replace-in-place promise was proved anywhere.
  correction: Run these tests over the real GlossaryService with MinimalGlossaryStore behind it — the shape buildRealServiceApp() already establishes later in this same file — keeping the stand-in for the store boundary alone.
---

## What it is

O que quatro passes encontraram sobre a correção de writeConcepts (upsert por identidade), seu
docstring de port, e os testes que a provam: cobertura de critérios, conformidade com a
especificação, conformidade com o standard do projeto, e diagnóstico de falhas.

## Notes

O pass de failures não correu: a run capturada para esta revisão (run/glossary-concept-write-upsert-hotfix)
passou install, typecheck, lint, secret-scan e test sem nenhuma falha — não havia nada a
diagnosticar.

Achados que os passes deixaram para outro julgamento, não relatados como findings:

Da pass de conformidade — dois helpers de teste extraídos apenas para satisfazer a regra de
max-lines-per-function do standard, e já disclosed como tais; testes que leem o próprio texto-fonte
do arquivo sob teste e afirmam sobre a prosa de seus comentários; o registro em prosa da
integration suite sobre contagens de linha observadas contra o branch Neon ao vivo; a rota e o
status 200 de sucesso (nenhum nó da especificação declara nenhum dos dois, para nenhuma rota); e o
doc comment de InMemoryGlossaryStore.writeConcepts, que ainda afirma "o mesmo efeito de whole-replace
que RelationalGlossaryStore.writeConcepts tem para suas próprias duas tabelas" depois que o port
parou de prometer isso — uma afirmação obsoleta sobre a mecânica do adapter, não sobre um fato de
domínio.

Da pass de standard — os testes que leem o próprio comentário-fonte e contagens de citação
(mesma observação da pass de conformidade); os dois testes de integração que agora exercitam a
mesma rejeição de foreign key; a densidade de identificadores de nós da especificação citados
dentro dos comentários do repositório e do port (questão de conformidade, não de standard); e o
formato de linha que readWholeConcepts confia através de runStatement&lt;IConceptRow&gt; sem checagem,
que falharia como um valor errado em vez do crash que EDG-08 escreve contra.

Drift do trace sobre o target backend (não é finding, e não julga nada sobre esta mudança): 153
achados de drift sobre 179 bindings — 0 orphaned, 2 moved (curados na próxima entrega da task que
os detém), 151 code (143 suprimidos sob frontend/app, declarado edits_freely). Dos 8 arquivos
"code" não suprimidos, 2 são os que esta própria entrega restampou sob outros nós que não os seus
(glossary-store.port.ts, relational-glossary-store.repository.ts — restam obsoletos porque um bind
restampa só os nós do seu próprio record) e outros 2 (glossary.service.ts,
register-concept.dto.ts) já estavam obsoletos antes desta entrega. O restante é drift pré-existente
em arquivos que esta revisão não tocou. `--all` sobre o target frontend listaria os 143 suprimidos,
que ficariam disponíveis para este conjunto de arquivos ou para um `/check-source` — oferecido, não
adicionado ao escopo desta revisão.
