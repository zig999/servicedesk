# Trace completo de uma execução do engine — 2026-08-21

Uma execução real de `POST /v1/diagnose`, do começo ao fim, com as duas fronteiras de saída
gravadas verbatim: a chamada HTTP ao IFS e as quatro chamadas ao modelo. Feito para servir de
base a uma sessão de debug.

**Resultado:** HTTP 200 em **17,4 s**, `issue-multiplos-devices-vinculados`, referral
`remover-devices-obsoletos` → `fila-suporte-mwo`, hipótese determinante
`multiplos-devices-vinculados`. Investigação `6816975d-55ce-4ac5-a017-c1723ca5979a`,
`ticket_ref` `DEBUG-01`.

## Como foi capturado, e as duas coisas que eu mudei para capturar

O projeto **não configura logger nenhum** — nem pino nem console: `build-app.factory.ts` e
`index.ts` não instanciam logger, e é por isso que o processo do servidor não imprime uma linha.
Então nada disso veio de log; veio de um proxy que grava, interposto nas duas saídas.

| o que mudou | como | efeito no que se observa |
|---|---|---|
| endereço do connector | reapontado para `127.0.0.1:8898` (proxy → `8787`) durante a execução, e **restaurado depois** | nenhum, além de +1 hop local |
| `ANTHROPIC_BASE_URL` | `http://127.0.0.1:8899` (proxy → `api.anthropic.com`) | nenhum; o SDK 0.32.1 lê essa variável no construtor |
| `accept-encoding` | o proxy **remove** o header ao encaminhar | as respostas vêm sem gzip, para o registro guardar texto |

Nada mais foi alterado. `EVALUATOR_MAX_TOKENS` ficou em **256** de propósito, para que o trace
mostrasse o comportamento real e não um comportamento ajustado.

Cabeçalhos de credencial (`x-api-key`, `authorization`, `cookie`) estão `<REDACTED>` em todos os
registros. Para o upstream foram intactos.

## A linha do tempo

Origem em zero na saída da chamada ao IFS.

```
evento                               t+ms   dur ms
IFS GET .../profile                     0      168
eval limitacao-de-hardware            325      866
eval push-desabilitado               1250      789
eval multiplos-devices-vinculados    1299     1766
consolidator                         3069     7644
```

Somando, o que foi observado termina por volta de **t+10,7 s**; o `curl` mediu **17,4 s**. A
diferença de ~6,7 s está fora das duas fronteiras gravadas: leitura inteira e validada do caso,
resolução da capability, resolução do connector, e a escrita da investigação — todas contra o
Neon em `us-east-2`, incluindo a abertura da primeira conexão TLS do pool. **Medir esses trechos
é o primeiro item para a sessão de debug**, porque hoje nada os mede: as colunas de duração são
gravadas em zero por decisão (ver §Instrumentação).

Duas coisas a notar na tabela:

- **Os três julgamentos não saíram juntos.** `limitacao-de-hardware` correu sozinha e terminou em
  t+1191; só então as outras duas partiram, essas sim em paralelo. Com `POOL_SIZE=5` havia folga
  para as três. Por que a primeira corre isolada é pergunta para o debug — a leitura provável é a
  ordem de precedência com parada antecipada, que não pode disparar tudo de uma vez sem
  desperdiçar chamada.
- **O consolidador custou 7,6 s dos 10,7 observados** — 71% do tempo medido, numa única chamada
  Sonnet 5 de 664 tokens de saída.

## Passo a passo

### 1. A requisição

`raw/diagnose-request.json`. Caso pinado por slug e versão, sujeito com um par
atributo/valor, narrativa, requester, e `ticket_ref: DEBUG-01`.

### 2. Resolução do caso, da capability e do connector

Não gravado — acontece dentro do processo, sem sair para a rede além do Postgres. O que se sabe
pelo efeito: o caso foi lido inteiro e validado (senão a chamada teria parado aqui), o concept
`perfil-mobile-tecnico` resolveu para a capability `perfil-mobile-tecnico-reader 1.0.0`, e essa
para o connector `ifs-fsm-tech-profile-connector`.

### 3. Resolução do placeholder e a chamada ao IFS

`ifs-call.md`. O endereço registrado é
`http://127.0.0.1:8898/v1/technicians/${subject:user-id}/profile`; o que saiu foi
`GET /v1/technicians/RODRIGO.MATIAS/profile`. **O placeholder resolveu.** Sem corpo, sem header
de autenticação — o IFS não pede nenhum. 168 ms, HTTP 200.

### 4. Montagem da observação

O IFS devolveu o envelope `{data, metadata, error[]}` com `data.id` e `data.installations`. O
`responseMap` do connector mapeia `login ← data.id` e `installations ← data.installations`, e o
`output_schema` da capability declara exatamente esses dois campos. A observação gravada é:

```json
{"login":"RODRIGO.MATIAS","installations":[ …2 instalações… ]}
```

O envelope do IFS **não aparece** na observação: `metadata` e `error` ficaram de fora porque
nenhum dos dois é campo declarado. A filtragem funcionou.

Evidência persistida: `result: ok`, `origin: ifs-fsm-tech-profile-connector`,
`capability_name/version` preenchidos, `ttl: 60`.

### 5. Os três julgamentos

`model/01-…`, `model/02-…`, `model/03-…`. Cada arquivo tem o system prompt inteiro, o
`<judgment_input>` inteiro e a resposta do modelo.

O prompt é o mesmo nos três (1581 caracteres de system), e o `<judgment_input>` carrega
exatamente cinco coisas: `<criterion>`, `<evidence>` (com `concept` e `fields` como atributos do
`<item>`), `<case_title>` e `<case_when_to_use>`. Nada mais entra — nem o sujeito, nem a
narrativa, nem o critério das outras hipóteses. A fronteira fechada do prompt está de pé.

| hipótese | resposta do modelo | veredicto gravado | out tokens |
|---|---|---|---|
| `limitacao-de-hardware` | `{"verdict":"inconclusive"}` | `inconclusive / judgment-failure` | 15 |
| `push-desabilitado` | `{"verdict":"refuted","citations":[{…installations}]}` | `refuted` | 33 |
| `multiplos-devices-vinculados` | `{"verdict":"confirmed","citations":[{…installations}]}` | `confirmed` | 32 |

As duas citações passaram pela validação mecânica: `field: "installations"` está entre os campos
que o `<item>` declarou. Estão persistidas em `investigation_evaluation_citations`.

### 6. A consolidação

`model/04-consolidator.md`. System de 263 caracteres, e um `<CONSOLIDATION_DATA>` que carrega as
três avaliações e a evidência inteira. Sonnet 5, 664 tokens de saída, 7,6 s.

O texto produzido está em `raw/diagnose-response.json`.

### 7. A resposta e a persistência

`raw/diagnose-response.json`, `raw/db-depois.json`. Outcome, referral, texto e hipótese
determinante. No banco: 1 investigação, 1 evidência, 3 avaliações, 2 citações, 1 par de atributo
de sujeito.

## Achado 1 — `judgment-failure` não foi falha nenhuma

Este é o achado que o trace existe para ter produzido.

O modelo respondeu, em 866 ms, `stop_reason: end_turn`, **15 tokens de saída**:

```json
{"verdict":"inconclusive"}
```

Não houve truncamento — 15 de 256 tokens. Não houve erro de provedor — HTTP 200. E a resposta
**é exatamente uma das três formas que o system prompt declara**, a terceira, palavra por palavra.
O modelo obedeceu ao contrato.

O que a mapeia para `judgment-failure` é o próprio adaptador, deliberadamente
(`anthropic-hypothesis-evaluator.adapter.ts`):

```ts
function outcomeFromModelText(text) {
  const parsed = parseJudgment(text);
  if (parsed === undefined || parsed.verdict === 'inconclusive') {
    return judgmentFailureOutcome();
  }
```

E o comentário de `judgmentFailureOutcome` diz por quê, sem rodeio: cobre "a provider call that
failed outright, a response this adapter could not parse ... **or a model answer that itself
declined to ground a verdict from evidence that was not missing** — none of these a distinction
the closed evaluation-reason vocabulary draws any finer than this".

**Não é bug. É o vocabulário fechado de razões de inconclusão não tendo membro para "o juiz olhou
e recusou decidir".** As três razões são `no-data`, `judgment-failure` e `deadline-exceeded`; uma
abstenção fundamentada não é nenhuma das três, e cai na do meio.

O custo é real e não é interno: o consolidador recebe `reason: judgment-failure` como dado e
escreve para quem lê *"Não foi possível chegar a um veredito sobre esta hipótese devido a uma
falha no processo de julgamento"*. **Ninguém falhou.** A pessoa que ler o laudo vai procurar um
defeito técnico que não existe, e não vai procurar o que realmente aconteceu — o Achado 2.

Isto é matéria de especificação, não de código: acrescentar uma quarta razão é decidir um fato do
negócio, e a rota é `/analyse`.

## Achado 2 — o critério pede um fato que nenhum concept carrega

Por que o modelo se absteve, lido do prompt que ele recebeu. O critério de
`limitacao-de-hardware` exige **duas** coisas:

1. um aparelho de linha de entrada — A04, A15, A16 ou linha G;
2. *"com histórico documentado de encerramento do app por falta de memória"*.

A evidência é o perfil móvel: instalações, estado, push, GPS, último acesso, aparelho. **Não há,
em nenhum campo, histórico de encerramento por memória** — e o concept `perfil-mobile-tecnico`
não tem como carregar isso, porque o IFS não o responde nesse endpoint.

Então o modelo fez a coisa certa pela regra que o system prompt lhe deu: *"Use 'inconclusive'
whenever the evidence does not ground either"*. A hipótese, como está escrita, **não pode ser
confirmada nem refutada por nenhuma evidência que este caso coleta** — em nenhuma execução, para
nenhum técnico.

Isso é mais fundamental do que o problema dos códigos `SM-` já registrado em
`docs/cases/_registry/README.md`: a divergência de nomenclatura só apareceria se a segunda
condição fosse satisfazível. Não é. O critério precisa perder a exigência de histórico de
memória, ou o caso precisa de um concept que a responda.

## Instrumentação — o que o trace mostra que não é medido

- **`cost_calls: 0`, tokens 0, durações 0** na investigação persistida, numa execução com 4
  chamadas de modelo, **3157 tokens de entrada e 744 de saída**, e 17,4 s de parede. Deliberado e
  documentado (`diagnose.controller.ts:22`): nenhuma das portas reporta contagem nem timing, e a
  rota grava zero em vez de número inventado. Mas os números existem — este trace os tem, lidos do
  `usage` de cada resposta. É o que uma porta instrumentada colheria.
- **`observed_at` e `written_at` são idênticos ao milissegundo** (`2026-08-21T17:25:23.549Z`), numa
  execução de 17 s. Um instante só, lido uma vez e reusado — a disciplina que o comentário de
  `evidence-collection-stage.ts` atribui a `idempotency-resolution.ts`. Consequência para o debug:
  **nenhum dos dois campos serve para medir nada**.
- **`ttl: 60` na evidência, contra `ttl: 300` no concept.** Gap conhecido e declarado em
  `evidence.ts:12` — *"This stage has no reachable path to the concept's actual registered value"*.
  A declaração de frescor do concept hoje não tem efeito na coleta.

## O que este trace não capturou

Dito para que a sessão de debug não confunda ausência com evidência:

- **Nada entre a requisição e a chamada ao IFS**, nem depois do consolidador. Os ~6,7 s não
  explicados estão aí, e são a maior fatia não observada.
- **Nenhuma consulta ao Postgres.** O proxy fica em HTTP; o driver `pg` fala TCP com o Neon.
- **Nenhum caminho de erro.** Esta execução foi toda de sucesso: um `ok`, três respostas 200. Os
  outros três endings (`unavailable`, `denied`, `timeout`), o estouro do
  `COLLECTION_STAGE_BUDGET_MS`, e o `deadline-exceeded` não aparecem. Provocá-los é outra sessão —
  derrubar o IFS dá `unavailable`; um `${subject:...}` que o sujeito não carrega dá recusa antes
  da requisição.

## Como repetir

```bash
cd temp/debug-01
node proxy.mjs --port 8898 --upstream http://127.0.0.1:8787       --name ifs      &
node proxy.mjs --port 8899 --upstream https://api.anthropic.com   --name anthropic &
# reapontar o connector para 127.0.0.1:8898 e subir o servidor com
# ANTHROPIC_BASE_URL=http://127.0.0.1:8899 — e restaurar o endereço depois
curl -s http://127.0.0.1:3000/v1/diagnose -X POST \
  -H 'content-type: application/json' --data @raw/diagnose-request.json
```

`raw/*.ndjson` é apêndice: cada execução acrescenta linhas. Limpe entre execuções, ou use `seq`
para separar.

## Arquivos

| arquivo | o que é |
|---|---|
| `proxy.mjs` | o proxy que grava |
| `ifs-call.md` | a chamada ao IFS, requisição e resposta |
| `model/01…04-*.md` | uma chamada de modelo por arquivo — system, user, resposta |
| `raw/ifs.ndjson`, `raw/anthropic.ndjson` | os registros crus |
| `raw/diagnose-request.json`, `raw/diagnose-response.json` | a requisição e a resposta |
| `raw/curl-metrics.txt` | código, tempo total, tamanho |
| `raw/db-antes.json`, `raw/db-depois.json` | contagens antes; investigação, evidência, avaliações e citações depois |
