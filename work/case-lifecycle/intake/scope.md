# Escopo para `/plan-work` — ciclo de vida draft/released e revisionamento de hipóteses

> Este documento é o escopo de desenvolvimento entregue à skill `/plan-work`. `/analyse` já
> processou `temp/analyse-case-lifecycle.md` e a especificação em `knowledge/` já reflete o novo
> modelo — validada (`32 elementos, 50 regras, 10 cenários, 18 contratos, 15 restrições; 71 decisões
> disclosed`) e comitada. Este documento não redefine o domínio — ele descreve **o que construir**
> em código e banco para satisfazer o que a especificação já diz, e referencia cada nó pelo
> identificador exato que ela usa hoje. É autossuficiente: alguém sem contexto da conversa que o
> originou deve conseguir decompor um plano de trabalho só a partir dele mais a especificação
> validada em disco.

---

## 0. Mapa dos nós da especificação que este escopo implementa

| Nó | O que declara | O que o código precisa fazer para satisfazê-lo |
|---|---|---|
| `domain/knowledge/case` | identidade pura (`slug`), operação `create-draft` | uma tabela/tipo de identidade, sem conteúdo |
| `domain/knowledge/case-version` | conteúdo de uma versão: `version, title, when_to_use, authored_at, subject, fallback, consolidation_register, state, released_at, manifest` (many `manifest-entry`); operações `collection-plan, requires-evaluation-of, resolve-outcome, place-hypothesis, remove-hypothesis, release, discard` | tabela de versão + as operações de domínio abaixo |
| `domain/knowledge/case-version-state` | enumeração `draft`/`released` | coluna `state`, com `CHECK` |
| `domain/knowledge/manifest-entry` | value-object: `position` + referência a uma `hypothesis-revision` | a tabela de manifesto |
| `domain/knowledge/hypothesis` | identidade pura (`name`), referência a `case`, operação `revise` | tabela/tipo de identidade da hipótese |
| `domain/knowledge/hypothesis-revision` | conteúdo: `revision, criterion, collects, resolution`, referência a `hypothesis` | tabela de revisões |
| `rules/knowledge/a-case-version-is-written-once` (invariant) | uma versão `released` e seu manifesto nunca mudam | `release()` é a única transição para `released`; nada mais escreve numa versão `released` |
| `rules/knowledge/a-released-hypothesis-revision-is-never-altered` (policy) | uma revisão referenciada por qualquer versão `released` nunca muda | `revise()` sempre cria uma revisão nova, nunca edita uma existente |
| `rules/knowledge/only-a-draft-case-version-may-be-discarded` (invariant) | só uma versão `draft` pode ser descartada | `discard()` recusa se `state != 'draft'` |
| `rules/knowledge/a-case-has-at-most-one-draft` (policy) | no máximo um `draft` por caso | `create-draft()` recusa se já existe um `draft` para o slug |
| `rules/knowledge/a-case-version-number-is-never-reused` (policy) | número de versão nunca reaproveitado, mesmo após descarte | contador durável em `case` (nunca `MAX(version)` das linhas existentes) |
| `rules/knowledge/a-case-version-moves-through-its-declared-lifecycle` (state-machine) | `draft --release--> released`, `released` terminal | nenhuma transição além dessa deve existir no código |
| `rules/investigation/only-a-released-case-version-is-diagnosed` (policy) | só uma versão `released` pode ser pinada por uma investigação | o novo portão antes de `runDiagnosis` |
| `rules/knowledge/a-hypothesis-name-is-unique-within-its-case` (policy) | nome único através de toda a vida do caso | `UNIQUE` em `(case_slug, name)` na tabela de identidade |
| `rules/knowledge/a-hypothesis-position-is-unique-within-its-case` (invariant) | posição única dentro do manifesto de uma versão | `UNIQUE` em `(case_slug, case_version, position)` |
| `rules/knowledge/a-case-has-at-least-one-hypothesis` (invariant) | manifesto de uma versão tem ≥1 entrada | `remove-hypothesis()` recusa esvaziar o manifesto |
| `rules/knowledge/a-hypothesis-collects-at-least-one-concept` (invariant) | toda revisão coleta ≥1 conceito | `revise()` recusa uma revisão sem `collects` |
| `rules/knowledge/validation-runs-at-every-read` (invariant) | leitura — draft ou released — exige validade total; replay não revalida | `readCase` não muda de comportamento por causa do estado |
| `contracts/knowledge/case-lifecycle` (api) | as seis operações públicas: `create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release, discard` | a superfície de serviço que este plano constrói (ver §3.3) |
| `contracts/knowledge/case-query` (api, inalterado) | `read-case` continua lendo a versão inteira, validada | `CaseQueryService.readCase` passa a montar via manifesto, sem mudar sua própria assinatura |

**Distinção importante que a especificação fixou e este escopo precisa respeitar**: `revise-hypothesis`
(cria uma `hypothesis-revision` nova, presa à identidade da hipótese) e `place-hypothesis` (associa
uma revisão — nova ou já existente — a uma posição no manifesto de um `draft`) são **duas operações
diferentes**, não uma só. Reordenar uma hipótese sem mudar seu conteúdo é só `place-hypothesis`,
nunca um `revise-hypothesis`.

---

## 1. Resumo do que precisa ser construído

1. **Schema novo** para versão de caso com estado, identidade própria de hipótese, revisão de
   hipótese e o manifesto que liga uma versão às revisões que ela usa.
2. **Módulos de domínio novos/alterados**: identidade e revisão de hipótese; a operação de liberar
   (`release`) e criar rascunho (`createDraft`); a validação de totalidade do manifesto (que hoje
   já existe para o documento inteiro, agora aplicada ao manifesto).
3. **Reescrita de `CaseQueryService`/`ICaseStore`** para montar um caso a partir do manifesto em vez
   de linhas diretas de hipótese.
4. **Um novo portão** no caminho de diagnóstico: recusar pinar uma investigação em uma versão que
   não esteja `RELEASED`.
5. **Nenhuma migração de dados** — o banco atual pode ser descartado e recriado do zero sob o schema
   novo (ver §6).

---

## 2. Schema de banco proposto (ponto de partida técnico — a decomposição real é do plano)

### 2.1 `case_versions` — dois campos novos

```sql
ALTER TABLE case_versions
  ADD COLUMN state TEXT NOT NULL DEFAULT 'released' CHECK (state IN ('draft', 'released')),
  ADD COLUMN released_at TIMESTAMPTZ; -- NULL enquanto state = 'draft'
```

Como não há dado a preservar (§6), esta pode perfeitamente nascer como uma tabela recriada do zero,
já com essas duas colunas desde o início, em vez de um `ALTER TABLE` sobre uma tabela populada.

### 2.2 `cases` — precisa de um contador de versão durável

```sql
ALTER TABLE cases
  ADD COLUMN next_version INTEGER NOT NULL DEFAULT 1;
```

Motivo (fato de negócio já registrado na especificação, ver `temp/analyse-case-lifecycle.md` §7):
o número da próxima versão de um caso precisa ser sempre crescente e nunca reaproveitado, mesmo
depois de um rascunho ser abandonado e apagado — então não pode ser derivado de
`MAX(case_versions.version)`, que pode diminuir depois de uma exclusão. `createDraft` incrementa
este contador atomicamente e usa o valor resultante como o número da nova versão.

### 2.3 `hypotheses` — vira identidade pura (perde as colunas de conteúdo)

```sql
CREATE TABLE hypotheses (
  case_slug TEXT NOT NULL REFERENCES cases(slug),
  name      TEXT NOT NULL,
  CONSTRAINT hypotheses_pkey PRIMARY KEY (case_slug, name)
);
```

### 2.4 `hypothesis_revisions` — o conteúdo, numerado, imutável uma vez referenciado por um release

```sql
CREATE TABLE hypothesis_revisions (
  case_slug            TEXT NOT NULL,
  hypothesis_name      TEXT NOT NULL,
  revision             INTEGER NOT NULL,
  criterion            TEXT NOT NULL,
  resolution_outcome   TEXT NOT NULL REFERENCES outcomes(name),
  resolution_action    TEXT NOT NULL REFERENCES actions(name),
  resolution_recipient TEXT NOT NULL REFERENCES recipients(name),
  CONSTRAINT hypothesis_revisions_pkey PRIMARY KEY (case_slug, hypothesis_name, revision),
  CONSTRAINT hypothesis_revisions_hypothesis_fkey
    FOREIGN KEY (case_slug, hypothesis_name) REFERENCES hypotheses(case_slug, name)
);
```

`position` **não** entra aqui — mora no manifesto (§2.6), porque reordenar hipóteses entre versões
não deveria forçar uma revisão de conteúdo nova.

### 2.5 `hypothesis_revision_collects` — a lista de conceitos, parte do conteúdo da revisão

```sql
CREATE TABLE hypothesis_revision_collects (
  case_slug       TEXT NOT NULL,
  hypothesis_name TEXT NOT NULL,
  revision        INTEGER NOT NULL,
  concept_name    TEXT NOT NULL REFERENCES concepts(name),
  CONSTRAINT hypothesis_revision_collects_pkey
    PRIMARY KEY (case_slug, hypothesis_name, revision, concept_name),
  CONSTRAINT hypothesis_revision_collects_revision_fkey
    FOREIGN KEY (case_slug, hypothesis_name, revision)
    REFERENCES hypothesis_revisions(case_slug, hypothesis_name, revision)
);
```

### 2.6 `case_version_hypotheses` — o manifesto

```sql
CREATE TABLE case_version_hypotheses (
  case_slug       TEXT NOT NULL,
  case_version    INTEGER NOT NULL,
  hypothesis_name TEXT NOT NULL,
  revision        INTEGER NOT NULL,
  position        INTEGER NOT NULL,
  CONSTRAINT case_version_hypotheses_pkey
    PRIMARY KEY (case_slug, case_version, hypothesis_name),
  CONSTRAINT case_version_hypotheses_position_unique
    UNIQUE (case_slug, case_version, position),
  CONSTRAINT case_version_hypotheses_version_fkey
    FOREIGN KEY (case_slug, case_version) REFERENCES case_versions(slug, version),
  CONSTRAINT case_version_hypotheses_revision_fkey
    FOREIGN KEY (case_slug, hypothesis_name, revision)
    REFERENCES hypothesis_revisions(case_slug, hypothesis_name, revision)
);
```

### 2.7 `investigations` — **nenhuma mudança**

Continua pinando só `pinned_case_slug`/`pinned_case_version`. Nenhuma coluna nova, nenhum digest,
nenhuma cópia. A imutabilidade de `RELEASED` + revisão é o que sustenta isso — é o ganho central
desta arquitetura frente a alternativas que tinham sido cogitadas antes (digest de conteúdo, ou
snapshot completo dentro da investigação).

### 2.8 Convenção de migração a respeitar

O projeto nunca edita um script de migração já aplicado (uma correção é sempre um script novo,
numerado em sequência — convenção já em vigor em `src/migrations/`). Como não há dado a preservar,
o script novo desta mudança pode simplesmente `DROP` as tabelas antigas (`hypotheses`,
`hypothesis_collects`) e criar as cinco tabelas/colunas listadas acima, em vez de escrever lógica de
transformação de dados.

---

## 3. Módulos de domínio — o que muda no código

### 3.1 Identidade e conteúdo de hipótese, separados

Hoje `Hypothesis` (em `src/case/case.ts`) é um único tipo, com todos os atributos juntos. Passa a
precisar de uma separação equivalente à do schema: uma identidade estável e um conteúdo
versionado — a forma exata dos tipos é decisão de quem implementa, mas precisa refletir que
`position` vive fora do conteúdo revisionado.

### 3.2 O manifesto como o que monta um `Case` para leitura

`CaseQueryService.readCase` (e o `case-store` por trás dela) precisam passar a:
1. ler a versão (`case_versions`, incluindo `state`/`released_at`);
2. ler o manifesto dessa versão (`case_version_hypotheses`), ordenado por `position`;
3. para cada entrada do manifesto, ler a revisão de conteúdo correspondente
   (`hypothesis_revisions` + `hypothesis_revision_collects`);
4. montar o `Case` exatamente como hoje — a forma final que um consumidor (o motor de diagnóstico)
   enxerga **não muda**; só a montagem por trás muda.

A validação estrutural e de coerência que já existe (`parse-case-document.ts`,
`validate-case-coherence.ts`) continua sendo aplicada sobre o `Case` já montado — nenhuma dessas
duas precisa saber que por trás existe um manifesto.

### 3.3 As seis operações de `contracts/knowledge/case-lifecycle`

| Operação | Entrada | Regras que aplica |
|---|---|---|
| `create-draft(slug)` | slug do caso | recusa se já existir uma versão `draft` para esse slug (`a-case-has-at-most-one-draft`); incrementa o contador durável de versão (`a-case-version-number-is-never-reused`); cria a versão com esse número, `state='draft'`; copia o manifesto da última versão `released` (vazio se não houver nenhuma) |
| `create-draft(slug, fromVersion)` (variante para rollback) | slug + número de uma versão histórica | mesma mecânica, mas copia o manifesto da versão indicada em vez da última liberada |
| `revise-hypothesis(slug, name, novoConteúdo)` | identifica a hipótese (cria a identidade se ainda não existir) e o novo conteúdo (critério, resolução, collects) | cria uma `hypothesis-revision` nova (número = maior revisão existente + 1, ou 1 se for a primeira) — **não** toca nenhum manifesto sozinha; recusa se `collects` vier vazio (`a-hypothesis-collects-at-least-one-concept`) |
| `place-hypothesis(slug, draftVersion, name, revision, position)` | identifica a hipótese, qual revisão dela e em que posição do manifesto do draft | recusa se a versão não estiver em `draft` (`a-case-version-is-written-once`); recusa se a posição já estiver ocupada por outra hipótese no mesmo manifesto (`a-hypothesis-position-is-unique-within-its-case`); insere ou atualiza a entrada do manifesto |
| `remove-hypothesis(slug, draftVersion, name)` | identifica a entrada do manifesto a remover | recusa se a versão não estiver em `draft`; recusa se for a última entrada do manifesto (`a-case-has-at-least-one-hypothesis`); remove só a entrada do manifesto — nunca apaga a `hypothesis-revision` |
| `release(slug, version)` | identifica a versão em `draft` a liberar | roda a mesma validação estrutural/de coerência que `readCase` já roda hoje sobre o `Case` montado a partir do manifesto atual (`validation-runs-at-every-read`); recusa nomeando toda violação junta, sem mudar nada, se algo falhar; se tudo passar, marca `state='released'`, `released_at=agora` (`a-case-version-moves-through-its-declared-lifecycle`) |
| `discard(slug, version)` | identifica a versão a apagar | recusa se `state != 'draft'` (`only-a-draft-case-version-may-be-discarded`); apaga a versão e as entradas do seu manifesto; nunca apaga `hypothesis-revisions` (podem ficar órfãs, isso é inofensivo) |

### 3.4 O novo portão no caminho de diagnóstico

Implementa `rules/investigation/only-a-released-case-version-is-diagnosed`. Antes de `runDiagnosis`
(ou no ponto que resolve qual caso pinar), inserir uma checagem: a versão pedida precisa estar
`state='released'`. Uma tentativa de diagnosticar contra uma versão em `draft` é recusada — com um
erro tipado próprio, seguindo a mesma convenção de erro nomeado que todo o resto do sistema já usa
(ex.: `CaseNotReleasedError` ou nome equivalente, a critério de quem implementa) — ver
`scenarios/investigation/a-draft-case-version-refuses-diagnosis` para o caso concreto que a suíte
precisa provar.

---

## 4. Regras de cardinalidade que cada operação granular precisa reforçar

Estas regras já existem na especificação — o que muda é que, antes, eram conferidas uma única vez,
ao ler/escrever o documento inteiro; agora, cada operação granular listada em §3.3 precisa aplicá-las
no seu próprio momento:

- nome de hipótese único **através de toda a vida do caso**, `a-hypothesis-name-is-unique-within-its-case`
  (é a identidade — conferir em `revise-hypothesis` ao criar uma identidade nova);
- posição única **dentro do manifesto de uma versão**, `a-hypothesis-position-is-unique-within-its-case`
  (conferir em `place-hypothesis`, e ao copiar um manifesto em `create-draft`);
- pelo menos uma hipótese no manifesto de uma versão, `a-case-has-at-least-one-hypothesis` (conferir
  em `remove-hypothesis` — a operação recusa deixar o manifesto vazio; e de novo, redundantemente, em
  `release`, através da validação já existente);
- pelo menos um conceito coletado por revisão de hipótese, `a-hypothesis-collects-at-least-one-concept`
  (conferir ao criar uma revisão nova em `revise-hypothesis`);
- todo conceito citado existe no glossário e aceita o `subject` da versão,
  `case-terms-exist-in-the-glossary` + `a-concept-accepts-the-declared-subject-type` (conferir em
  `revise-hypothesis`, e de novo em `release` através da validação de coerência já existente).

---

## 5. Casos de teste que a suíte precisa cobrir (para orientar o autor de testes, não uma lista fechada)

Os dois primeiros já têm cenário próprio na especificação — a suíte prova exatamente esses; os
demais são derivados das regras de §0/§4 e não têm cenário dedicado (a análise não os considerou
dignos de um, por serem consequência direta da regra já ilustrada em outro lugar).

- **`scenarios/investigation/a-draft-case-version-refuses-diagnosis`**: uma versão em `draft` nunca
  é diagnosticada.
- **`scenarios/knowledge/a-released-version-keeps-its-original-revision`**: liberar a versão 2 com
  uma revisão nova de uma hipótese não muda o que a versão 1, já liberada, continua respondendo.
- Criar um rascunho, adicionar duas hipóteses (`revise-hypothesis` + `place-hypothesis` cada), liberar
  — o caso resultante é lido e usado por um diagnóstico normalmente.
- Tentar remover a última hipótese de um rascunho — recusado.
- Tentar liberar um rascunho sem nenhuma hipótese, ou com uma hipótese sem nenhum concept — recusado,
  nomeando a violação.
- Criar um rascunho enquanto já existe outro em aberto para o mesmo slug — recusado.
- Descartar (`discard`) um rascunho — some por completo; a revisão de conteúdo que só ele usava
  continua existindo no banco, órfã, sem quebrar nada.
- Rollback: criar um rascunho a partir de uma versão antiga (não a última liberada), liberar sob um
  número novo — o conteúdo bate exatamente com o da versão antiga; o número da versão antiga nunca é
  reaproveitado.
- Numeração nunca reaproveitada: descartar um rascunho e criar outro depois — o número do rascunho
  descartado nunca reaparece.
- `place-hypothesis` reordenando duas hipóteses de um rascunho, sem chamar `revise-hypothesis` para
  nenhuma delas — nenhuma `hypothesis-revision` nova é criada, só o manifesto muda.

---

## 6. O que este escopo explicitamente NÃO inclui

- **Nenhuma migração de dado.** O banco atual (Neon, os dados de teste já cadastrados nesta mesma
  sessão) pode ser descartado por completo. Não escrever nenhuma lógica de transformação de linhas
  antigas — só schema novo.
- **Nenhuma rota HTTP é exigida por este escopo.** As operações de §3.3 podem nascer só como
  serviços internos (como `AuthorCaseVersionService`/`CaseQueryService` já são hoje) — se o negócio
  quiser expor isso via API, é um escopo à parte, a decidir depois.
- **Nenhuma mudança em `Resolution`/`Referral`** — continuam sem identidade nem revisão próprias
  (ver `temp/analyse-case-lifecycle.md` §4.3).
- **Nenhuma mudança em `investigations`** nem em qualquer coisa que o motor de diagnóstico já faz
  além do novo portão de §3.4.

---

## 7. Pré-condição — satisfeita

`/analyse` já processou `temp/analyse-case-lifecycle.md`. A especificação em `knowledge/` já declara
o estado de versão (`draft`/`released`), a identidade própria da hipótese separada do seu conteúdo
revisionado, o manifesto como o elo entre uma versão e as revisões que ela usa, e as regras
revisadas de unicidade de nome/posição — validada e comitada (commit `36b4ae3`,
`32 elementos, 50 regras, 10 cenários, 18 contratos, 15 restrições; 71 decisões disclosed`). Este
plano já pode ser decomposto em tarefas.
