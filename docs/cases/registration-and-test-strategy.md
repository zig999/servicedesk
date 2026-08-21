# Estratégia de cadastro e de teste

Como levar os dois casos deste diretório de documento a caso rodando, e como provar cada parte.
Escrito depois de ler o motor, não de supô-lo — cada afirmação aponta o arquivo.

---

## Parte 1 — Resumo

### Os dois casos

Ambos com `subject: technician`, ambos rodando com **um único atributo**: `user-id`.

**`app-congelado-hardware`** — "o app trava, congela, fecha sozinho, fica lento, perde o que eu
estava preenchendo". Três hipóteses, em precedência:

| # | hipótese | confirma quando | encaminha |
|---|---|---|---|
| 1 | `limitacao-de-hardware` | alguma instalação está num aparelho de linha de entrada (A04/A15/A16/linha G) | runbook de hardware → TI Unifique |
| 2 | `transacao-falha-viva` | há ao menos uma entrada na fila `failed` — reprocessável, o dado não se perdeu | reprocesso → BackOffice |
| 3 | `push-desabilitado` | uma mesma instalação está `active` **e** com notificações desligadas | runbook de push → Suporte MWO |

Push vem por último de propósito: nesse quadro, push oscilando é **sintoma** do app morrendo
(perda do token), não a causa. A precedência existe para que ele só decida quando as duas causas
mais fortes não confirmarem.

**`init-device-perda-dados`** — "perdi o que já tinha preenchido", "está pedindo nova
inicialização". Três hipóteses:

| # | hipótese | confirma quando | encaminha |
|---|---|---|---|
| 1 | `descarte-por-inicializacao` | há entrada na fila `deleted` — perda irreversível | escalar → Fornecedor IFS |
| 2 | `re-inits-em-serie` | ≥ 3 inicializações em 24 h | logout/login sem inicializar → Suporte MWO |
| 3 | `multiplos-devices-vinculados` | ≥ 2 instalações em aparelhos distintos | remover obsoletos → Suporte MWO |

Fallback dos dois: `inconclusive-hypotheses-exhausted` → regras de ouro do MWO → Suporte MWO.

### De onde vêm os dados

Três concepts, três capabilities, **duas** chamadas de rede — todas ao domínio FSM do IFS:

| concept | operação IFS | rota | campos citáveis |
|---|---|---|---|
| `perfil-mobile-tecnico` | `get-tech-profile` | `GET /v1/technicians/:userId/profile` | `login`, `installations` |
| `filas-de-transacao-falhadas` | `get-tech-sync-status` | `GET /v1/technicians/:userId/sync-status` | `failedTransactions` |
| `serie-de-inits-do-device` | `get-tech-sync-status` *(mesma operação)* | idem | `syncEvents` |

Nada é derivado antes de chegar ao juiz: não há `tier`, não há filtro por fila, não há janela de
tempo, não há limiar embutido. O IFS se recusa a derivar qualquer um
(`fsm-facts-never-verdicts`, `failed-transaction-queue-not-windowed`,
`login-identity-answered-as-stored`) e o motor não precisa: o valor inteiro de cada campo — array
completo — vai para a observação, e a pergunta vive no `criterion`.

### O que está fora, de propósito

- **`cadeia-orfa-survey-anexo`** — a quarta hipótese de `init-device-perda-dados`. O IFS responde
  `media: {}` sempre (não faz o join com a biblioteca de mídia), o que produziria
  **falso-positivo com citação válida**. Ver `init-device-perda-dados/blocked-cadeia-orfa-survey-anexo.md`.
- **`assignments-envio-baixa`** — era ponte de identidade, papel que o motor não tem: o sujeito
  chega montado no corpo de `/v1/diagnose`. Ver `_registry/README.md` §"V2 e a ponte de identidade".

### Decidido × pendente

**Decidido e conferido** (`_registry/check.py`, 0 erros / 0 avisos): formato do caso, vocabulário,
`accepts`, `responseMap`, `output_schema`, `statusMap`, concordância de todos os nomes.

**Pendente, e bloqueia:** (1) endereço real do IFS e se exige credencial; (2) **não existe caminho
de cadastro para `ConnectorConfiguration`**.

**Pendente, e muda um resultado:** o limiar "3 re-inits em 24 h" foi proposto aqui, não herdado.

---

## Parte 2 — Estratégia de cadastro

### O estado real dos cinco registros

| registro | serviço existe? | quem carrega hoje |
|---|---|---|
| glossário (5 vocabulários) | sim (`RelationalGlossaryStore`) | só `npm run seed`, de `src/src/fixtures/glossary/*.json` |
| `Concept` | sim | idem |
| `Capability` | sim (`CapabilityRegistryService.registerCapability`) | idem, de `fixtures/capability/capability.json` |
| `ConnectorConfiguration` | serviço e tabela existem (`registerConnector`, `migrations/0008`) | **nada** |
| `Case` | sim | `createDraft` → `reviseHypothesis` → `placeHypothesis` → `release` |

Nenhuma das 19 rotas de `http/build-app.ts` escreve nesses registros — são leitura, autoria de
caso e `diagnose`.

### Os cinco passos, na ordem

**Passo 0 — decidir o endereço do IFS.** Não é opcional e não é adiável: sem host e porta os dois
`address` não resolvem, e o IFS não tem porta padrão (`HTTP_HOST`/`HTTP_PORT` vêm do ambiente, e
`server.ts` não sobe sem eles). Decidir junto se entra
`Authorization: Bearer ${credential:VARIAVEL}` — a **única** forma permitida de uma credencial
entrar num connector, lida de `process.env` no momento da chamada.

**Passo 1 — abrir o caminho de cadastro do connector.** É o bloqueio duro, e é desenvolvimento
neste projeto. Duas opções:

| | (a) estender o seed | (b) superfície de administração |
|---|---|---|
| o que é | `fixtures/connector/connector.json` + o laço em `seed.ts` que chama `registerConnector` | rotas de escrita para os quatro registros |
| custo | pequeno — segue exatamente o que o seed já faz para capability | uma iniciativa |
| consequência | **cadastrar passa a ser um deploy**; corrigir um `ttl` exige subir versão | cadastro vira operação |

**Recomendo (a) primeiro.** É a menor coisa que desbloqueia tudo o mais, cabe num incremento, e
não fecha a porta de (b) — a superfície de administração é uma iniciativa própria, decidida quando
a operação de fato precisar mexer em cadastro sem deploy. Fazer (b) antes de o primeiro caso ter
rodado uma vez é construir a ergonomia de um fluxo que ninguém exercitou.

De qualquer forma isso entra pelos pontos de entrada do Siegard — `/analyse` → `/plan-work` →
`/implement-task` — porque "existe um caminho para registrar um connector" é um fato que a
especificação deste projeto ainda não tem.

**Passo 2 — semear vocabulário, concepts, capabilities, connectors.** Nesta ordem, que não é
arbitrária: uma capability apontando para concept inexistente é recusada; um `accepts` citando
subject-type inexistente é recusado. Os dois desfechos de não-conclusão já são escritos pelo
próprio seed (`NON_CONCLUSION_OUTCOMES`) — não estão em `_glossary/outcome.json`.

**Passo 3 — autorar os casos pelo ciclo de vida, não por arquivo.** `createDraft` →
`reviseHypothesis` (uma por hipótese, criando a revisão 1) → `placeHypothesis` (uma por posição) →
`release`. Os `1.json` deste diretório são documento de referência e fonte para o seed, na forma
que `parse-case-document.ts` lê — não um formato de importação.

**Passo 4 — segurar o `release`.** Ambos os casos estão `state: "draft"` de propósito. Uma versão
liberada é imutável (`migrations/0006`, `0010`), e o limiar de re-inits ainda não foi confirmado.
Liberar antes de confirmá-lo custa uma v2 para trocar um número.

### A ordem de liberação que eu recomendo

`app-congelado-hardware` **primeiro**, e sozinho. Ele não tem suposição que mude resultado, usa as
duas chamadas, exercita os dois modos de falha interessantes (vocabulário desconhecido, campo
omitido) e tem uma hipótese que depende de campo ausente (`push-desabilitado`) — ou seja, é o
melhor caso único para descobrir o que está errado. `init-device-perda-dados` entra depois, com o
limiar já confirmado contra episódios reais.

---

## Parte 3 — Estratégia de teste

### O que a suíte de hoje já prova, e o que ela não prova

109 specs. E **nenhuma chama o LLM de verdade**: `@anthropic-ai/sdk` é sempre mockado
(`anthropic-hypothesis-evaluator.adapter.spec.ts:31`), e `diagnose-e2e.spec.ts` roda de propósito
com `ANTHROPIC_API_KEY` **apagado**, usando `FakeHypothesisEvaluator`.

Isso é a decisão certa para o motor — o SDK é uma fronteira, e uma fronteira se substitui. Mas
tem uma consequência direta para este trabalho: **a qualidade de um `criterion` não é testada por
nada que existe hoje.** Um critério ambíguo, ou que confirma no caso errado, atravessa a suíte
inteira verde. E o `criterion` é o produto aqui — é onde vive todo o conhecimento de diagnóstico.

Então a estratégia tem cinco níveis, e o nível 3 é o que não existe ainda.

### Nível 0 — nomes (custo zero, já passando)

```
cd docs/cases && python3 _registry/check.py     →  0 erros, 0 avisos
```

Prova concordância entre registros vizinhos, e duas coisas que falham em silêncio:
uma chave de `responseMap` que nenhuma capability declara (**descartada sem erro**) e uma chave de
`properties` sem caminho no `responseMap` (**campo sempre ausente**). Também pega `timeout` acima
do teto de 7 000 ms da etapa de coleta, e o array `hypotheses` da forma retirada.

Deve rodar em CI. É a metade da conferência que uma leitura não precisa fazer.

### Nível 1 — o connector contra payloads reais do IFS (o de maior valor)

`HttpDeclarativeObservationSource` recebe um **`httpClient` injetável** — um `vi.fn()` com forma de
`fetch`, nunca ligado à rede (`http-declarative-observation-source.adapter.spec.ts:108`). Então dá
para provar os três cadastros contra a resposta **real** do IFS, sem rede, sem banco, sem LLM.

O insumo é o passo de captura do nível 4: **um envelope real por operação, gravado uma vez,
comitado como fixture.** Depois disso o teste roda para sempre offline.

O que cada teste afirma:

| # | payload | asserção |
|---|---|---|
| 1 | perfil com 2 instalações | a observação carrega o **array inteiro**; `login` vem de `data.id` |
| 2 | perfil com `pushEnabled` **ausente** | o campo não aparece; **não** vira `false` (`uncoded-push-flag-omitted`) |
| 3 | perfil com `device.model` ausente | omitido, nunca `null` |
| 4 | sync com as três filas | uma lista só, agrupada na ordem `failed`/`deleted`/`ignored`, cada entrada com seu `queue` |
| 5 | sync-status pela capability de filas | a observação traz **só** `failedTransactions` — `syncEvents` é filtrado |
| 6 | sync-status pela capability de inits | e vice-versa |
| 7 | `200` com arrays vazios | desfecho `ok`, observação com array vazio — **nunca** confundido com falha |
| 8 | `400`, `403` | `denied`, e **sem observação nenhuma** |
| 9 | `500`, `503` | `unavailable`, sem observação |
| 10 | `404` (rota mudou) | cai no padrão `unavailable` |
| 11 | sujeito **sem** `user-id` | recusa **antes** de a chamada sair (`resolveSubjectPlaceholder`) |
| 12 | `output_schema` com um nome trocado | o campo desaparece — prova que o filtro morde |

Os casos 2, 3, 4 e 7 são exatamente onde o material antigo estava errado sobre o IFS. Eles são o
motivo de este nível existir.

### Nível 2 — o caso ponta a ponta com evidência semeada

Seguindo `__tests__/integration/http/diagnose-e2e.spec.ts` exatamente: `app.inject()` contra
`buildApp()`, `createDiagnoseRunner` (não o de produção), `FakeObservationSource` semeada com
**os mesmos payloads gravados do nível 1**, Fake evaluator e Fake consolidator, Postgres real,
limpando as próprias linhas no `afterAll`.

Prova o que o nível 1 não alcança: o documento do caso é aceito pelo parser; o plano de coleta
resolve os três concepts em **duas** chamadas; a precedência por `position` decide; o fallback
dispara quando nada confirma; a investigação é persistida e lida de volta; e os três motivos de
inconclusivo (`no-data`, `judgment-failure`, `deadline-exceeded`) são alcançáveis.

Não prova nada sobre os critérios — o Fake evaluator devolve o veredito que o teste semeou.

### Nível 3 — regressão de critério (não existe; é o que falta construir)

O único nível que valida o produto. Uma tabela de `(payload de observação → veredito esperado)`,
rodada pelo **evaluator real**, contra o Anthropic de verdade.

```
para cada (caso, hipótese, payload):
    espera-se: confirmed | refuted | inconclusive
```

O conjunto mínimo por hipótese — um confirma, um refuta, e a armadilha:

| hipótese | confirma | refuta | armadilha |
|---|---|---|---|
| `limitacao-de-hardware` | `model: "samsung SM-A166M"` | `model: "SM-S911B"` (topo de linha) | `model` **ausente** → deve refutar, não confirmar |
| `transacao-falha-viva` | uma entrada `queue: "failed"` | lista vazia | **só** entradas `deleted` → deve refutar (fila errada) |
| `push-desabilitado` | `state:"active"`, `pushEnabled:false` | `state:"disabled"`, `pushEnabled:false` | `pushEnabled` **ausente** → deve refutar |
| `descarte-por-inicializacao` | uma entrada `queue:"deleted"` | só `failed` | lista vazia → refutar, e **não** confundir com "sem dado" |
| `re-inits-em-serie` | 4 `init` em 6 h | 1 `init` em 30 dias | 3 `init` em 26 h → deve **refutar** (fora da janela) |
| `multiplos-devices-vinculados` | 2 `device.id` distintos | 1 instalação | 2 instalações no **mesmo** `device.id` → refutar |

As armadilhas são o teste. Cada uma é um jeito de o critério estar escrito mal, e três delas
(`model` ausente, `pushEnabled` ausente, fila errada) são consequência direta de como o IFS
responde.

Duas observações sobre a natureza deste nível:

- **É custo de LLM, e é variável.** Roda sob demanda e antes de um `release`, nunca em cada
  commit. Um resultado que oscila entre execuções é informação, não ruído: significa que o
  critério não é falsificável o bastante.
- **Serve para editar o critério, não para aprovar o modelo.** Quando uma armadilha confirma, a
  correção é a prosa do `criterion` — o que sobe a revisão da hipótese.

### Nível 4 — captura contra o IFS real (uma vez, manual)

O único passo que precisa de VPN, Oracle e o IFS de pé. Duas finalidades, e a primeira é a
importante:

1. **Gravar os envelopes** que alimentam os níveis 1, 2 e 3 — um por operação, mais as variantes
   das armadilhas. Anonimizar o login antes de comitar.
2. Confirmar as decisões do passo 0: endereço, porta, credencial; e que o `min(timeout, 7000)`
   é suficiente para as duas operações — `get-tech-sync-status` dispara quatro leituras em
   paralelo sobre tabelas quentes, e a latência real depende do Oracle e da VPN.

Vale conferir aqui uma coisa que só o real mostra: um técnico cuja instalação tenha estado fora do
vocabulário de seis valores derruba a leitura **inteira** com 500. Se isso acontecer na frota, é
melhor descobrir na captura do que num diagnóstico.

### Nível 5 — sombra sobre incidentes conhecidos

Antes de o caso decidir algo de verdade: rodar `/v1/diagnose` sobre técnicos de episódios já
resolvidos, e comparar o desfecho com o que o suporte concluiu na época. É o único nível que mede
o que interessa — se o caso **acerta** — e não só se ele funciona.

Discordância aqui não é bug do motor. É uma das três coisas: critério mal escrito (nível 3),
precedência errada (a ordem das `position`), ou o conhecimento de diagnóstico está incompleto — e
essa terceira é a que justifica uma v2.

### Resumo

| nível | prova | precisa de | quando roda |
|---|---|---|---|
| 0 nomes | concordância dos cadastros | nada | cada commit |
| 1 connector | os cadastros contra a resposta real do IFS | payloads gravados | cada commit |
| 2 ponta a ponta | o caso, a coleta, a precedência, a persistência | Postgres | cada commit |
| 3 critério | **se o critério decide certo** | Anthropic real | sob demanda, antes do `release` |
| 4 captura | endereço, latência, forma real | VPN + IFS de pé | uma vez, e a cada mudança do IFS |
| 5 sombra | se o caso acerta | incidentes conhecidos | antes de decidir de verdade |

**A ordem de execução é 4 → 0 → 1 → 2 → 3 → 5.** A captura vem primeiro porque tudo abaixo dela
se alimenta dela; e é a única que depende de gente e de rede.
