# Proposta: capability versionada é imutável uma vez citada por evidência

> **Status: proposta.** A Parte A é um defeito técnico, sem fato de negócio — não passa por
> `/analyse`, vai direto a `/plan-work` como incremento corretivo. A Parte B **é** material
> para `/analyse`: cada decisão (D1–D6) é um fato proposto, pendente de aprovação humana; o
> `/analyse` é quem os transforma em nós. Onde este documento e a especificação divergirem, a
> especificação vale.

## 0. Como chegamos aqui

Ao tentar salvar uma correção de `input_schema` em `perfil-mobile-tecnico-reader` 1.0.0 (via
`PUT /v1/capabilities/:name/:version`), a API devolveu 500 `INTERNAL_ERROR`. A causa raiz tem
duas camadas distintas, que este documento separa e resolve cada uma pela rota certa:

- **Um defeito técnico** (Parte A): o mecanismo de escrita do registry apaga a tabela
  `capabilities` inteira e reinsere tudo a cada `PUT`, dentro de uma única transação. Como
  `investigation_evidence` referencia `capabilities(name, version)` por uma FK não-deferível,
  o `DELETE` sem filtro esbarra nessa FK assim que **qualquer** linha da tabela já tem
  evidência associada — mesmo a de uma capability sem relação com a que está sendo escrita.
  Isso trava o registry inteiro hoje, para qualquer operador, em qualquer capability.
- **Uma lacuna de negócio** (Parte B): a especificação nunca decidiu se uma versão de
  capability pode ser sobrescrita depois de já ter produzido evidência. Hoje ela pode —
  `contracts/integration/capability-registry.md` especifica o `PUT` como
  "creating it at a new name and version, or replacing whatever already stood at that
  identity" — em contraste direto com `case-version` e `hypothesis-revision`, que a mesma
  especificação já trata como escritas-uma-vez-e-nunca-alteradas depois de liberadas. Uma
  evidência cita `(capability, version)` e seus campos citados pinam no `output_schema`
  daquela versão (`a-cited-field-exists-in-the-capability-output-schema`); sobrescrever o
  schema de uma versão já citada pode invalidar silenciosamente citações de investigações já
  concluídas.

As duas resolvem a mesma situação, mas por rotas diferentes e com granularidade diferente —
por isso duas partes, cada uma com sua própria seção de rota ao final.

---

## Parte A — defeito técnico (rota: `/plan-work`, incremento corretivo)

### A1. O que está errado

`RelationalCapabilityStore.writeCapabilities` (`src/src/persistence/relational-capability-store.repository.ts`)
implementa "salvar o conjunto de capabilities" como:

```sql
DELETE FROM capabilities;               -- tabela inteira, sem WHERE
INSERT ...                              -- uma linha por capability do conjunto mantido + a nova/editada
```

dentro de uma transação. `capabilities(name, version)` é referenciada por
`investigation_evidence_capability_fkey` (`src/migrations/0005-investigation.sql`), declarada
**não-deferível**. Postgres checa FK não-deferível por statement, não no commit — o `DELETE`
já falha ali, antes do `INSERT` seguinte devolver a linha. Erro real capturado:

```
error: update or delete on table "capabilities" violates foreign key constraint
"investigation_evidence_capability_fkey" on table "investigation_evidence"
code: 23503
```

Esse erro sobe como `CapabilityStoreError`, ausente de `STATUS_BY_ERROR_CLASS`
(`src/src/errors/status-map.ts`), então cai no fallback genérico 500 — escondendo a causa.

### A2. Correção proposta

Trocar o delete-all/insert-all por um upsert real, escopado por identidade — não por checar
FK deferível, porque a Parte B exige de qualquer forma que a camada de serviço saiba
distinguir "linha nova" de "linha existente" antes de tocar o banco (D3):

- `INSERT ... ON CONFLICT (name, version) DO UPDATE` para a capability sendo registrada.
- `DELETE FROM capabilities WHERE (name, version) NOT IN (<conjunto mantido>)` apenas para as
  que saíram do conjunto — nunca mais um `DELETE` sem filtro.

### A3. Mudanças por componente

| onde | o quê |
|---|---|
| `persistence/relational-capability-store.repository.ts` | `writeCapabilities` deixa de ser delete-all/insert-all; upsert escopado por `(name, version)` |
| `errors/status-map.ts` | mapear `CapabilityStoreError` para um status não-500 quando a causa for uma FK conhecida (evita opacidade quando o A2 ainda assim colidir com algo inesperado) |

### A4. Rota

Incremento corretivo — um comportamento errado observado rodando o sistema entregue, sem
critério de nenhuma task existente. Enunciado pronto para `/plan-work`:

> "PUT /v1/capabilities/:name/:version devolve 500 INTERNAL_ERROR para qualquer capability
> quando a tabela `capabilities` contém alguma linha referenciada por `investigation_evidence`,
> porque `writeCapabilities` apaga e reinsere a tabela inteira dentro de uma transação e a FK
> `investigation_evidence_capability_fkey` (não-deferível) recusa o DELETE. Corrigir para um
> upsert escopado por `(name, version)`, sem DELETE sem filtro."

Sem `BLOCKING`: não altera fato de negócio, não depende da Parte B para existir (embora a
implementação real deva compor com D3 abaixo, já que os dois pontos de mudança são o mesmo
método de serviço).

---

## Parte B — imutabilidade de versão citada (rota: `/analyse` → `/plan-work` → `/implement-task`)

### B1. Solução em uma frase

Uma versão de capability que já produziu ao menos uma evidência passa a ser **imutável por
inteiro** — a mesma postura que `case-version` e `hypothesis-revision` já adotam uma vez
liberadas — e uma correção depois desse ponto **registra uma versão nova**, nunca sobrescreve
a existente.

### B2. O que deliberadamente não muda

- O `PUT /v1/capabilities/:name/:version` continua sendo upsert — para uma identidade que
  **não** tem evidência ainda, sobrescrever continua legítimo (corrigir um typo de schema
  antes de qualquer uso não deveria exigir uma versão nova a cada tentativa).
- `(name, version)` continua sendo a identidade inteira da capability; nenhum novo campo, sem
  esquema de numeração imposto — versão continua uma string que o operador escolhe, como hoje.
- Nenhuma regra sobre o que `output_schema`/`input_schema` devem conter muda — isso é
  ortogonal (a forma continua regida por `a-capability-declares-well-formed-schemas` e pela
  regra de forma do `input_schema`, se a proposta irmã for adotada).

### D1 — Gatilho da imutabilidade

Uma capability, identificada por `(name, version)`, torna-se imutável **assim que existe ao
menos um registro em `investigation_evidence` citando essa identidade** — não no momento do
registro. Antes desse ponto, é uma capability "em rascunho de fato" (a especificação não tem
estado explícito de draft/released para capability, ao contrário de case-version; o gatilho
aqui é o fato observável — foi citada ou não — em vez de um estado declarado).

### D2 — Escopo do congelamento

O registro inteiro fica congelado, não campo a campo — mesma convenção de
`a-case-version-is-written-once` (o registro inteiro, não uma lista de campos sensíveis).
Justificativa: distinguir "campos evidenciais" (`output_schema`) de "campos operacionais"
(`timeout`, `connector`) abre uma segunda classificação para manter sincronizada com toda
mudança futura no domínio de capability; congelar tudo é a regra mais simples e a que já
existe alhures neste projeto.

### D3 — O que o `PUT` faz contra uma identidade imutável

`PUT /v1/capabilities/:name/:version` para uma identidade que já tem evidência e cujo corpo
divirja do que está registrado é recusado com HTTP 422 e um erro tipado (proposto:
`CapabilityVersionAlreadyEvidencedError`, nomeando quantas evidências citam a versão) — na
mesma família de status dos demais refusals do registro (`CapabilitySchemaNotWellFormedError`,
`MalformedCapabilityInputSchemaError`, etc.), não um 409 à parte. Um `PUT` cujo corpo é
**idêntico** ao já registrado não é uma escrita de fato — é aceito como no-op (evita que reabrir
o formulário sem editar nada vire um erro).

### D4 — Concept exclusivo e a versão superada

`rules/integration/one-capability-answers-one-concept` (a checagem que hoje `refuseAnsweredConcept`
aplica) precisa de uma resposta explícita para o caso "registro uma versão nova para o mesmo
concept que uma versão congelada já responde": a versão nova passa a ser a resposta corrente
daquele concept a partir do seu registro; a versão congelada permanece existindo — e
permanece citável por evidências antigas, que continuam legíveis exatamente como produzidas —
mas deixa de ser a que `refuseAnsweredConcept` aceita como resposta ativa. Nenhuma evidência
existente é tocada; a leitura de "qual capability responde este concept hoje" passa a
considerar a versão mais recente por concept.

### D5 — Migração

Regra vale só daqui para frente — nada retroativo a aplicar em dado já persistido. Mas fica
registrado aqui, honestamente: a correção que fizemos mais cedo em
`perfil-mobile-tecnico-reader` 1.0.0 (UPDATE direto via SQL, porque a linha já tinha 4
evidências e o `PUT` da API travava no defeito da Parte A) é exatamente o tipo de escrita que
esta regra, uma vez em vigor, teria recusado pela API. Não desfazemos essa correção — ela
resolveu um dado corrompido (prosa onde devia haver JSON) que antecede esta proposta — mas
sinalizamos que, dali em diante, uma nova correção sobre essa mesma linha deveria vir como uma
versão nova (`1.0.1`, por exemplo), não como outro UPDATE direto.

### D6 — Interação com o defeito da Parte A

A implementação de D3 (recusar antes de escrever) e a correção A2 (upsert escopado, sem
DELETE sem filtro) pousam no mesmo método de serviço (`registerCapability` /
`writeCapabilities`) — D3 decide *se* a escrita acontece, A2 decide *como* ela acontece uma
vez decidida. Corrigir só A sem B deixa o sistema livre para sobrescrever uma versão já citada
assim que o defeito técnico for corrigido — pior postura de integridade do que a proteção
acidental de hoje. As duas devem ser entregues antes que qualquer operador volte a editar uma
capability já evidenciada.

## 4. Mudanças por componente

### Backend (`src/`)

| onde | o quê |
|---|---|
| `capability-registry/capability-registry.service.ts` | `registerCapability` ganha a checagem D1/D3 antes de `writeCapabilities`: busca evidência citando `(name, version)`, compara corpo (no-op se idêntico), recusa se divergente |
| novo módulo (proposto `capability-registry/capability-evidence-check.ts`) | leitura "esta `(name, version)` tem evidência?" — consulta `investigation_evidence`, única casa dessa checagem |
| `errors/` + `errors/status-map.ts` | `CapabilityVersionAlreadyEvidencedError` → 422 |
| `capability-registry.service.ts` (`refuseAnsweredConcept`) | D4: considerar apenas a versão mais recente por concept como resposta ativa |
| `persistence/relational-capability-store.repository.ts` | A2 (upsert escopado) |
| `http/register-capability.routes.ts` / DTO | resposta 422 tipada quando D3 recusa; nenhuma mudança de forma no request |

### Frontend (`frontend/app/`)

| onde | o quê |
|---|---|
| `routes/capability-form-fields.tsx` | ao receber `CapabilityVersionAlreadyEvidencedError` do `PUT`, trocar a mensagem de erro genérica por uma ação: "esta versão já produziu evidência — registre uma versão nova" |
| novo fluxo "salvar como nova versão" | a partir do formulário de edição, um botão que leva ao formulário de criação pré-preenchido com os valores editados e o campo de versão vazio/sugerido, submetendo via `PUT /v1/capabilities/:name/:novaVersao` |
| tela de detalhe da capability | indicar visualmente quando a versão já tem evidência (ex.: "N evidências associadas — edição cria nova versão"), antes mesmo de tentar salvar — evita o operador descobrir isso só no 422 |
| `services/capability-form-schema.ts` | sem mudança de validação de forma; a checagem é de estado do servidor, não de shape do corpo |

### Especificação (o que o `/analyse` cria)

- **Rule** nova: uma versão de capability citada por evidência é imutável (D1/D2), na
  convenção de `a-case-version-is-written-once`.
- **Rule** nova ou emendada: `one-capability-answers-one-concept` passa a considerar a versão
  mais recente por concept como resposta ativa quando versões antigas seguem congeladas (D4).
- **Scenario**s: `PUT` recusado por versão já evidenciada; `PUT` idêntico aceito como no-op;
  registro de nova versão supera a anterior para o mesmo concept; evidência antiga permanece
  legível contra a versão congelada que a produziu.
- **Decision-log**: D1 (gatilho = evidência, não estado explícito), D2 (congelamento do
  registro inteiro, não por campo), D5 (postura de migração, sem retroatividade).

## 5. Riscos e custos aceitos

- **Fardo de correção**: todo erro de digitação em `input_schema`/`output_schema` de uma
  capability já usada em produção passa a exigir uma versão nova, não um ajuste no lugar. É o
  custo direto de garantir que evidência antiga permaneça interpretável.
  Mitigação: nenhuma — é o ponto da proposta.
- **Concept exclusivo com histórico**: um concept pode ter, no banco, mais de uma versão de
  capability respondendo-o ao longo do tempo; qualquer leitura que hoje pressupõe "uma
  capability por concept" (D4) precisa ser auditada para usar a versão corrente, não a
  primeira que encontrar.
- **UX de "nova versão"**: exige uma tela/fluxo que hoje não existe (o formulário atual só
  edita a identidade fixa da URL). Custo de frontend real, não cosmético.

## 6. Rota

**Parte A** (obrigatória, independente da decisão sobre a Parte B): `/plan-work` com o
enunciado corretivo da seção A4 → `/implement-task`.

**Parte B** (decisão de negócio):
1. **`/analyse`** com este documento (seção 3, D1–D6) como material — cria/emenda os nós da
   seção 4.
2. **`/plan-work`** com escopo "aplicar imutabilidade de versão de capability citada por
   evidência" — o survey e a decomposição cortam as tasks (a tabela da seção 4 é indicativa).
3. **`/implement-task`** por task; **`/review-change`** ao final.
