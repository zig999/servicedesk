---
title: Backend code-drift batch corrections — existing modules, conventions, and reuse points
summary: The nine files named by the scope sit in three areas of src/src (investigation, case, persistence)
  plus two http/dto siblings; canonical vocabularies already live as exported 'as const' arrays beside
  their types, zod schemas elsewhere already validate integers with .int() or .number().int(), and glossary
  concept persistence already has a description requirement path the seed script bypasses.
area:
- src/src/investigation/investigation.ts
- src/src/investigation/judgment-stage.ts
- src/src/investigation/http-declarative-observation-source.adapter.ts
- src/src/investigation/evidence-result.ts
- src/src/case/case-query.service.ts
- src/src/persistence/relational-case-store.repository.ts
- src/src/seed.ts
- src/src/http/dto/simulate-case.dto.ts
- src/src/http/dto/simulate-hypothesis.dto.ts
- src/src/http-connector/http-connector-call-configuration.ts
- src/src/glossary/terms.ts
- src/src/glossary/glossary.service.ts
- src/src/fixtures/glossary/concept.json
modules:
- name: investigation-type
  path: src/src/investigation/investigation.ts
  role: touched
- name: case-query-service
  path: src/src/case/case-query.service.ts
  role: touched
- name: judgment-stage
  path: src/src/investigation/judgment-stage.ts
  role: touched
- name: http-declarative-observation-source-adapter
  path: src/src/investigation/http-declarative-observation-source.adapter.ts
  role: touched
- name: http-connector-call-configuration
  path: src/src/http-connector/http-connector-call-configuration.ts
  role: depends-on
- name: evidence-result
  path: src/src/investigation/evidence-result.ts
  role: depends-on
- name: relational-case-store-repository
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: seed
  path: src/src/seed.ts
  role: touched
- name: concept-fixture
  path: src/src/fixtures/glossary/concept.json
  role: touched
- name: glossary-terms
  path: src/src/glossary/terms.ts
  role: depends-on
- name: glossary-service
  path: src/src/glossary/glossary.service.ts
  role: adjacent
- name: simulate-case-dto
  path: src/src/http/dto/simulate-case.dto.ts
  role: touched
- name: simulate-hypothesis-dto
  path: src/src/http/dto/simulate-hypothesis.dto.ts
  role: touched
conventions:
- statement: A canonical vocabulary is an exported 'as const' string-tuple array beside its derived type,
    checked with (ARRAY as readonly string[]).includes(value).
  seen_at: src/src/http-connector/http-connector-call-configuration.ts and src/src/investigation/evidence-result.ts
- statement: Deriving a hand-typed union check from a canonical list, once one sibling already does and
    another does not, in the same file.
  seen_at: src/src/persistence/relational-case-store.repository.ts (isHypothesisRevisionState vs isCaseVersionState)
- statement: Integer-typed numeric fields in zod DTOs are declared with z.int() (bare) or z.number().int(),
    never bare z.number() for a value the domain node declares an integer.
  seen_at: src/src/http/dto/simulate-case.dto.ts (version, elapsed_ms), place-hypothesis.dto.ts, read-concept.dto.ts
- statement: A concept's description is enforced before insertion by a dedicated guard function and a
    dedicated error type, not folded into the INSERT itself.
  seen_at: src/src/glossary/glossary.service.ts (namesNoDescription, ConceptDescriptionRequiredError)
must_not_duplicate:
- what: the integer-typed usage/elapsed_ms/durations zod shapes
  at: simulate-case.dto.ts and simulate-hypothesis.dto.ts each declare their own separate usageSchema
    and durationsSchema; correct each in place rather than introduce a shared module
- what: the canonical vocabulary derivation pattern for a hand-typed union guard
  at: relational-case-store.repository.ts already has isHypothesisRevisionState as the working example
    to mirror for isCaseVersionState
- what: the concept-description enforcement (namesNoDescription / ConceptDescriptionRequiredError)
  at: src/src/glossary/glossary.service.ts — seed.ts should supply a description through its own fixture-reading
    path, not re-implement the guard
risks:
- risk: judgment-stage.ts is bound in the trace to five other specification nodes beyond the disputed
    capability-registry contract; any edit must not disturb those still-correct bindings.
  consumers:
  - contracts/integration/capability-registry
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
  - rules/investigation/a-citation-stays-within-the-hypothesis-collects
- risk: relational-case-store.repository.ts resolves CaseVersionState through isCaseVersionState from
    every read and write path; a canonical array must not change the two accepted values or their spelling.
  consumers:
  - RelationalCaseStore.assembleVersion
  - RelationalCaseStore.listCases
  - createDraftVersion/releaseVersion/discardDraft/updateDraftVersion
- risk: making readCaseInputRequirements run refuseIncoherence changes behavior for any caller currently
    receiving computed input requirements for a version readCase would refuse.
  consumers:
  - callers of ICaseInputRequirementsQuery.readCaseInputRequirements
- risk: tightening usageSchema/durationsSchema from z.number() to an integer check will reject any currently-accepted
    non-integer value upstream investigation code might still produce.
  consumers:
  - HTTP responses for the simulate-case and simulate-hypothesis endpoints
sources:
- intake/scope.md
---
## What it is
Os nove arquivos do escopo se agrupam em tres areas do codigo fonte: investigation (quatro
arquivos), case (um arquivo), persistence e seed (dois arquivos), mais dois irmaos http/dto.
Cada uma das 13 divergencias nomeia um desvio concreto ja entregue como codigo, e para todo
achado do tipo hardcode-vs-lista-canonica ou float-vs-integer, a lista canonica ou o padrao
de inteiro que a correcao precisa usar ja existe e ja e usado no mesmo arquivo ou em seu
vizinho imediato.
O caminho de imposicao de description do conceito ja existe em glossary.service.ts; a correcao
do seed.ts e uma mudanca de dado e de tipo no seu proprio caminho de leitura de fixture, nao
uma reimplementacao dessa guarda.
O vinculo do judgment-stage.ts ao contrato errado e uma correcao de binding no trace: o
conteudo real do arquivo ja bate com cinco outros nos de especificacao aos quais o trace o
vincula corretamente, entao qualquer entrega que toque este arquivo nao pode perturbar esses
outros vinculos.

## Notes
O codigo fonte TypeScript do target vive sob src/src/ (ex.: src/src/investigation/investigation.ts),
nao diretamente sob src/ como a leitura literal do escopo sugere -- src/tsconfig.json,
src/package.json e src/migrations/ ficam um nivel acima de src/src/.
simulate-case.dto.ts e simulate-hypothesis.dto.ts sao DTOs quase duplicados sem modulo de
schema compartilhado hoje; a correcao deve corrigir cada um no lugar usando o padrao
z.int()/z.number().int() que os proprios campos elapsed_ms/version ja usam, sem introduzir
novo compartilhamento alem do que ja existe.
A convencao de validacao de inteiro nos DTOs e inconsistente mesmo entre arquivos ja corretos
-- alguns usam z.int() puro, outros z.number().int() -- entao qualquer uma das duas formas e
convencao evidenciada; nenhuma delas e um desvio a corrigir por si so.
Nenhum arquivo na area pesquisada exporta hoje uma lista canonica para CaseVersionState
('draft'/'released') no mesmo padrao que HYPOTHESIS_REVISION_STATES existe para
HypothesisRevisionState; case-store.port.ts (que ja exporta HYPOTHESIS_REVISION_STATES) e o
arquivo a conferir primeiro antes de criar uma nova lista.
