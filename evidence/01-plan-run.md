# Evidência de execução — 01 — a corrida do plano

Registro apenas. Nada do plano, da base ou da entrega foi retocado ao escrever este arquivo.

Hora de término do levantamento: **2026-08-05T11:31:37-03:00**.

## 0. O que esta evidência pode e não pode afirmar

Nenhum entry point registra hora de início. Não há timestamps por invocação, então **as durações
abaixo são pisos derivados da telemetria de subagente**, não medições de relógio de parede.

Duas somas diferentes aparecem, e a diferença importa:

- **soma das durações** — todos os subagentes somados. É o teto do trabalho, não o tempo decorrido,
  porque lotes rodaram em paralelo.
- **soma dos máximos por lote** — para cada lote paralelo, o subagente mais lento. É o piso do tempo
  decorrido daquela invocação, ignorando o overhead do orquestrador entre lotes.

O tempo perdido nas rodadas que morreram em `529 Overloaded` **não está contabilizado em nenhuma
das duas**: dessas o resultado não trouxe telemetria.

## 1. Invocações, término e duração

| # | Invocação | Subagentes | Tokens de subagente | Soma das durações | Piso do decorrido |
|---|---|---|---|---|---|
| 1 | `/analyse-domain` (base inicial, 53 nós) | 0 | — | — | — |
| 2 | `/analyse-domain` (prazo de 20s) | 0 | — | — | — |
| 3 | `/plan-work` (plano inicial) | 32 | 1.615.601 | 98,4 min | ≈ 34,6 min |
| 4 | `/implement-task` (`assessment-record`) | 2 | 157.563 | 10,6 min | ≈ 10,6 min |
| 5 | `/analyse-domain` (3 perguntas) | 0 | — | — | — |
| 6 | `/plan-work` (re-vinculação) | 17 | 816.541 | 53,4 min | ≈ 23,9 min |
| | **total** | **51** | **2.589.705** | **162,4 min (2,7 h)** | **≈ 69 min** |

Tool uses somados nos subagentes: **1.141**.

As três invocações de `/analyse-domain` não usaram subagente nenhum — a skill não delega. Foram as
mais rápidas e as que produziram os fatos que destravaram o resto.

## 2. Linha do tempo por etapa

### `/plan-work` #1 — plano inicial

| Etapa | O que aconteceu | Duração |
|---|---|---|
| situate | `graph.py --check` limpo, pin calculado, árvore limpa, contrato lido; impacto fechado em 31 nós pelo índice | não medido, ordem de segundos |
| — | **parada:** escopo, work root e target root não nomeados; três perguntas ao humano | espera do humano |
| inventory | 1 surveyor sobre `src/` inexistente | 45,8 s |
| decompose | decomposer r1 → 2 épicas + 15 esqueletos | 454,3 s |
| bind | lote B1, 5 binders (`published-case`) | máx 273,8 s |
| — | **10 notas blocking** → emenda de escopo ao humano, depois re-corte | espera do humano |
| decompose | decomposer r2 → 7 esqueletos (2 splits novas) | 250,2 s |
| bind | lote B2, 7 binders | máx 232,5 s |
| bind | lote B3, 9 binders (`case-validator`) | máx 279,0 s |
| — | **8 + 7 notas blocking** → segundo re-corte | — |
| decompose | decomposer r3 | 206,9 s |
| bind | lote B4, 6 binders | máx 205,0 s |
| bind | lote B5, 1 binder (`required-evaluations`, vinculava nó que virou `uncovered`) | 128,8 s |
| validate | `plan.py` reprovou na 1ª, passou na 2ª | segundos |
| report | 20 nós, 3 citações de gap, 11 perguntas, 34 waivers | — |

### `/implement-task`

| Etapa | O que aconteceu | Duração |
|---|---|---|
| situate | `plan.py --check` limpo; `--outstanding` limpo; standard validado e copiado; 2 pins | segundos |
| — | **parada:** identificador da task veio como placeholder `task/<epico>/<slug>` | espera do humano |
| implement | `task-implementer` → 7 módulos | 350,1 s |
| prove | `test-author` → 1 spec, 9 testes | 287,9 s |
| validate | `--node` ×2 e corrida completa, todas na 1ª | segundos |

### `/plan-work` #2 — re-vinculação

| Etapa | O que aconteceu | Duração |
|---|---|---|
| situate | base `--check` limpo, pin novo, work root limpa; `plan.py` reprovando as 17 tasks (o alvo) | segundos |
| inventory | surveyor #2 sobre `src/` populado → `inventory/src-tree` supera `src-greenfield` | 221,0 s |
| decompose | **não rodou** — o corte era decisão em pé | — |
| bind | rodada A: 7 lançados, 6 voltaram, 1 morreu | máx 439,9 s (o que morreu) |
| bind | rodadas B, C: 3+1 lançados, **todos 529** | não medido |
| bind | rodada D: 3 | máx 206,6 s |
| bind | rodadas E, F, G: 5+2+1 lançados, **todos 529** | não medido |
| bind | rodada H: 1 | 116,1 s |
| bind | rodada I: 2 | máx 243,0 s |
| bind | rodada J: 3 | máx 204,4 s |
| validate | `plan.py` passou na 1ª corrida completa | segundos |
| report | 4 citações de gap, 6 perguntas, 63 waivers | — |

## 3. Subagentes, um por um

Telemetria como veio em cada resultado. `cand.` é o tamanho do conjunto de candidatos entregue ao
binder.

### `/plan-work` #1

| Subagente | cand. | Duração | Tokens | Tool uses |
|---|---|---|---|---|
| codebase-surveyor | — | 45,8 s | 29.695 | 6 |
| backlog-decomposer r1 | — | 454,3 s | 63.332 | 3 |
| binder case-structure (B1) | 16 | 273,8 s | 56.423 | 20 |
| binder collection-plan (B1) | 16 | 182,7 s | 49.719 | 27 |
| binder required-evaluations (B1) | 16 | 115,2 s | 41.326 | 18 |
| binder evaluation-record (B1) | 16 | 223,1 s | 53.396 | 24 |
| binder outcome-resolution (B1) | 16 | 183,4 s | 48.943 | 23 |
| backlog-decomposer r2 | — | 250,2 s | 62.293 | 1 |
| binder case-structure (B2) | 21 | 216,5 s | 53.111 | 27 |
| binder collection-plan (B2) | 21 | 136,0 s | 44.580 | 24 |
| binder required-evaluations (B2) | 21 | 118,0 s | 44.192 | 23 |
| binder evaluation-record (B2) | 21 | 194,1 s | 52.627 | 25 |
| binder evaluation-citations (B2) | 21 | 151,7 s | 46.372 | 24 |
| binder assessment-record (B2) | 21 | 212,5 s | 53.550 | 26 |
| binder outcome-resolution (B2) | 21 | 232,5 s | 53.177 | 23 |
| binder glossary-lookup (B3) | 19 | 190,9 s | 48.106 | 22 |
| binder validation-run (B3) | 19 | 189,8 s | 50.063 | 27 |
| binder at-least-one-hypothesis (B3) | 19 | 166,6 s | 49.813 | 26 |
| binder hypothesis-collects-a-concept (B3) | 19 | 140,4 s | 44.289 | 25 |
| binder terms-exist-in-the-glossary (B3) | 19 | 279,0 s | 59.852 | 28 |
| binder concept-accepts-the-subject-type (B3) | 19 | 146,9 s | 46.112 | 27 |
| binder read-only-capability (B3) | 19 | 164,0 s | 48.173 | 27 |
| binder concept-declares-a-ttl (B3) | 19 | 179,4 s | 51.493 | 26 |
| binder recipient-is-a-role (B3) | 19 | 149,1 s | 45.387 | 23 |
| backlog-decomposer r3 | — | 206,9 s | 86.327 | 0 |
| binder case-structure (B4) | 20 | 204,4 s | 50.371 | 23 |
| binder evaluation-record (B4) | 20 | 150,1 s | 46.550 | 25 |
| binder evaluation-citations (B4) | 20 | 130,4 s | 46.602 | 24 |
| binder assessment-record (B4) | 20 | 205,0 s | 52.154 | 26 |
| binder outcome-resolution (B4) | 20 | 155,3 s | 46.761 | 22 |
| binder unique-hypothesis-names (B4) | 19 | 125,8 s | 46.316 | 25 |
| binder required-evaluations (B5) | 20 | 128,8 s | 44.496 | 22 |

### `/implement-task`

| Subagente | Duração | Tokens | Tool uses |
|---|---|---|---|
| task-implementer | 350,1 s | 81.344 | 24 |
| test-author | 287,9 s | 76.219 | 20 |

### `/plan-work` #2

| Subagente | cand. | Duração | Tokens | Tool uses |
|---|---|---|---|---|
| codebase-surveyor #2 | — | 221,0 s | 61.125 | 22 |
| binder validation-run (A) — **morreu em 529** | 20 | 439,9 s | 44.916 | 24 |
| binder at-least-one-hypothesis (A) | 20 | 156,6 s | 43.891 | 23 |
| binder unique-hypothesis-names (A) | 20 | 126,7 s | 43.340 | 24 |
| binder hypothesis-collects-a-concept (A) | 20 | 133,5 s | 43.675 | 24 |
| binder terms-exist-in-the-glossary (A) | 20 | 170,3 s | 47.260 | 24 |
| binder concept-accepts-the-subject-type (A) | 20 | 141,9 s | 47.796 | 23 |
| binder read-only-capability (A) | 20 | 163,7 s | 47.521 | 26 |
| binder validation-run (D) | 20 | 206,6 s | 49.456 | 25 |
| binder concept-declares-a-ttl (D) | 20 | 147,5 s | 43.406 | 23 |
| binder recipient-is-a-role (D) | 20 | 188,8 s | 47.418 | 23 |
| binder collection-plan (H) | 20 | 116,1 s | 42.324 | 22 |
| binder required-evaluations (I) | 20 | 177,8 s | 48.778 | 22 |
| binder evaluation-record (I) | 20 | 243,0 s | 52.593 | 26 |
| binder evaluation-record (J, claim crescida) | 21 | 184,0 s | 49.524 | 24 |
| binder case-structure (J) | 21 | 183,0 s | 50.497 | 25 |
| binder outcome-resolution (J) | 21 | 202,8 s | 53.021 | 25 |

Lançamentos que morreram em `529 Overloaded` **sem telemetria**: 3 (rodada B), 1 (C), 5 (E), 2 (F),
1 (G) — **12 lançamentos perdidos**, mais 1 morto com telemetria parcial. Total de 13 tentativas de
binder que não produziram binding.

## 4. Disciplina

**Em subagente:** todo levantamento (2), toda decomposição (3), toda vinculação (32 bindings
produzidos por 45 lançamentos de binder), a implementação e a prova. **Zero etapas inline.**

**Exceção declarada:** 3 pins foram **restatados pelo orquestrador em vez de re-vinculados** em
`/plan-work` #2 — `glossary-lookup`, `evaluation-citations`, `assessment-record` — sob o permissivo
do contrato ("the pin restated deliberately"), porque nenhuma vincula nó que mudou. Cada task carrega
a nota dizendo que foi julgamento do caller.

**Paradas (3), todas por entrada ausente e todas antes de qualquer escrita:**

1. `/plan-work` #1 — escopo, work root e target source root não nomeados.
2. `/implement-task` — task veio como placeholder literal.
3. `/plan-work` #1, meio da vinculação — nota blocking de origem de escopo, liquidada com o humano
   antes de escrever qualquer task.

Uma quarta parada não foi de entrada e sim de infraestrutura: `/plan-work` #2 parou com 5 de 14
tasks pendentes após 9 tentativas de subagente em 529.

**Retrabalho:**

| O que | Quantas vezes |
|---|---|
| re-corte pelo decompositor | 2 (r2 e r3, sobre r1) |
| esqueletos re-vinculados | 32 bindings para 17 tasks — média de 1,9 por task |
| tasks vinculadas 3× ou mais | `case-structure`, `evaluation-record`, `outcome-resolution`, `required-evaluations` (4 cada uma) |
| claims de épica crescidas | 3 (`published-case` +5 e depois +1; `case-validator` +2) |
| inventário substituído | 1 (`src-greenfield` removido, `src-tree` escrito) |
| nós da base reescritos | 3 (`draft-case`, `case`, `capability`) |
| arquivos de task reescritos inteiros | 17 na re-vinculação, além dos 17 da escrita original |

**Validadores, tentativa em que passaram:**

| Validador | Passou na | Reprovou por |
|---|---|---|
| `graph.py` (base inicial) | **3ª** | 1ª: agregado sem raiz. 2ª: 3 regras com `constrains` fora do agregado sem `consistency` |
| `graph.py` (prazo 20s) | 1ª | — |
| `graph.py` (3 perguntas) | 1ª | — |
| `plan.py` (plano inicial) | **2ª** | 1ª: `covers` com nó que nenhuma task vinculava nem `uncovered` declarava, + YAML com dois-pontos em escalar não citado |
| `deliver.py --node` ×2 | 1ª | — |
| `deliver.py` (entrega) | 1ª | — |
| `plan.py` (re-vinculação) | 1ª | — |

## 5. Conformidade 1.4.0 — constatações

**Forma `{note, class}`:** sim, em todos os 32 bindings. Nenhum binder devolveu nota sem classe.

**Notas blocking:** sim, muitas. Contagem por rodada de vinculação:

| Rodada | Blocking |
|---|---|
| B1 (5 binders) | 10 |
| B2 + B3 (16 binders) | 15 |
| B4 + B5 (7 binders) | 8 |
| A + D + H + I + J (`/plan-work` #2) | 15 nas tasks finais |

Estado final gravado: **15 notas blocking em 10 das 17 tasks**. Cinco tasks fecharam sem `unresolved`
e sem blocking: `at-least-one-hypothesis`, `hypothesis-collects-a-concept`,
`terms-exist-in-the-glossary`, `case-structure`, `assessment-record`.

**Destino prescrito, aplicado:**

- *Blocking de origem do decompositor* → esqueleto devolvido, re-cortado, re-vinculado. Aplicado
  2 vezes (r2, r3), com `rationale` do esqueleto dizendo o que foi retirado.
- *Blocking de origem do escopo* → task escrita **com** a nota e o conflito reportado ao humano.
  Aplicado; as notas estão nos corpos com o prefixo `BLOCKING, from the binding —`.
- *Nota dizendo que os candidatos não têm o que a task precisa* → `covers` crescido e re-bind, nunca
  binding alargado à mão. Aplicado 3 vezes.
- *Classe da nota* → nunca sobreposta pelo orquestrador. Nenhum blocking foi rebaixado por mim; dois
  foram rebaixados **pelo próprio binder seguinte** ao reler a base (`recipient-is-a-role`,
  e a pergunta de `concept-declares-a-ttl`).

**Advisory nomeando nós fora dos `covers` — decisão do caller registrada ao lado, no `## Notes`:**
**NÃO aplicado.** A busca por linha de decisão do caller nos 17 arquivos de task retorna **0**.
Advisories desse tipo existem em quantidade — `lifecycle/knowledge/case-publication`,
`definition/investigation/investigation`, `definition/investigation/evidence`,
`rule/knowledge/case-has-at-least-one-hypothesis`, `context/glossary` — e foram gravadas como o
binder as devolveu, sem a linha que diz o que o caller decidiu a respeito.

Onde a decisão **foi** tomada, ela ficou no `rationale` da épica e não ao lado da nota:
`epic/case-validator` registra o crescimento por `draft-case`; `epic/published-case` registra os
outros dois. Onde a decisão foi *não agir* — `case-publication` nas rodadas iniciais,
`definition/investigation/investigation` — não há registro nenhum ao lado da nota.

É desvio de conformidade e está registrado como tal. Corrigi-lo exigiria tocar as tasks, o que esta
invocação não faz.

## 6. Saída verbatim do validador final

```
derived plan.json: 20 node(s), 190 edge(s), contract siegard-plan/1
  1 inventory, 2 epic, 17 task; 4 unresolved gap citation(s) (3 unique); 6 open question(s); 63 waived
```

E o estado da entrega no mesmo instante, também verbatim, porque a re-vinculação o alterou:

```
implementation/published-case/assessment-record: task pin sha256:d608364ba4875a6473e9edb699326e8a5bb6d0c4f353f08aa7aa92a408c84aaa is not task/published-case/assessment-record as it stands (sha256:e8bb0acda8154f2a3ae1ba28f49c7d81dc8b9a4d01b9a63930d854a9ea435eb8); the record answers a task that has since changed — deliver it again against the task as it now stands, or restate the pin deliberately

1 problem(s) over 2 node(s). delivery.json is not derived over a delivery that does not hold together.
```

## 7. Números que valem guardar

- **2,59 M tokens de subagente** para produzir 20 nós de plano e 1 task entregue.
- **45 lançamentos de binder para 17 tasks** — 32 bindings produzidos, 13 perdidos em 529.
- **1,9 vinculações por task**, com quatro tasks vinculadas quatro vezes cada.
- **Uma invocação de `/analyse-domain` sem subagente nenhum** fechou o bloqueio estrutural que duas
  rodadas completas de vinculação (19 binders, ≈ 900 k tokens) não conseguiram contornar.
- **Cinco tasks limpas ao final, contra uma antes** de aquele único gap fechar.
