# Proposta: ampliar o Debug da tela de simulação (após "SIMULATE CASE")

Tela avaliada: `/cases/:slug/versions/:version/simulate`.

## O que o Debug mostra hoje

Existem hoje dois blocos de Debug, independentes:

1. **Debug por hipótese** (`case-simulation-detail-panel.tsx`, aparece ao selecionar uma
   hipótese na tabela): abas **Evidence**, **Prompt**, **JSON**.
   - Evidence: concept, resultado (ok/timeout/denied/unavailable), capability → connector,
     tempo, descrição do concept, semântica dos campos, observação bruta (JSON pretty-printed).
   - Prompt: o prompt de julgamento enviado ao modelo.
   - JSON: a resposta bruta *daquela hipótese* (`SimulateEvaluation`).
2. **Debug do subject** (`case-simulation-ready-view.tsx`): um único `<details>` com o JSON do
   subject enviado.

O bloco **"Case result"** — o resultado consolidado que o requester veria — **não tem Debug
nenhum**. Só mostra outcome/referral/determining e o texto consolidado.

## O que o backend já calcula e o Operador não consegue ver

Lendo o tipo de resposta (`SimulateCaseResult` em `use-simulate-case.ts`) contra o que
efetivamente chega à tela, sobram campos descartados pelo caminho:

| Campo já existente na resposta | Onde é perdido | Por que importa para o Operador |
|---|---|---|
| `assessment.prompt` (prompt da consolidação/"writing") | nunca chega ao componente de UI — `toNewCaseResultRun` não o copia | Hoje só existe Prompt para o julgamento de cada hipótese; o prompt que gera o texto final ao requester é invisível |
| `assessment.usage`, `assessment.elapsed_ms` | idem | A linha de timings mostra "writing 7969ms" agregado, mas não o custo em tokens da consolidação nem o prompt que o gerou |
| `result.cost` (calls, input_tokens, output_tokens do **run inteiro**) | nunca é lido em nenhum adapter | Existe custo por hipótese na tabela (COST (TOK)), mas nenhum total do run — Operador não sabe quanto custou simular o caso inteiro |
| `evidence[].inputs` (parâmetros enviados ao connector) | `toDetailEvidence()` descarta | Sem isso, não dá pra saber *o que* foi perguntado ao connector, só a observação retornada |
| `evidence[].observed_at`, `evidence[].ttl` | `toDetailEvidence()` descarta | A única forma de saber se a evidência estava fresca é o texto livre gerado pelo LLM (ex.: "obtida em 2026-09-19T19:03:19.509Z, TTL de 60s") — quando deveria ser um dado estruturado e confiável, não algo que depende do modelo ter decidido narrar |
| resposta bruta do case inteiro (`SimulateCaseResult` completo) | não existe em lugar nenhum — o JSON tab por hipótese mostra só aquela avaliação | Sem visão do payload completo (evidence + evaluations + assessment + cost + durations juntos) para depurar um resultado inesperado |
| `durations`/`cost`/prompt da consolidação por *run histórico* | `CaseResultRun` (o que fica em "Runs this session") não guarda nada disso, só guarda o último `lastCaseResult` solto no hook | Ao rodar várias simulações na mesma sessão, só a mais recente tem esses dados acessíveis; runs anteriores da lista perdem qualquer debug |

## Proposta

Adicionar, abaixo de "Case result", um bloco "Debug" espelhando o que já existe por hipótese:

1. **Aba Consolidation** — prompt completo enviado para gerar o texto ao requester, tokens
   in/out, tempo decorrido, register (formal/plain).
2. **Aba Cost** (ou uma linha ao lado dos timings já exibidos) — total de chamadas e tokens
   in/out do run inteiro (`result.cost`), lado a lado com as durations já mostradas.
3. **Aba JSON** — o `SimulateCaseResult` completo (evidence + evaluations + assessment + cost +
   durations), nos mesmos moldes do JSON tab por hipótese.
4. **Evidence enriquecida** — mostrar `observed_at` e `ttl` (e opcionalmente `inputs`) por item de
   evidência, tanto no Debug por hipótese quanto no novo Debug do case result — hoje esses campos
   existem na resposta mas são descartados em `toDetailEvidence()`.
5. **Persistir esses dados por run**, não só para o último — estender `CaseResultRun` /
   `NewCaseResultRun` / `toNewCaseResultRun` para carregar `durations`, `cost` e os dados de
   consolidação, para que cada entrada em "Runs this session" leve seu próprio Debug (hoje só o
   run mais recente tem isso acessível via `lastCaseResult`).

## Natureza da mudança

É estritamente aditiva: nenhum dado novo é inventado — tudo já é computado e devolvido pelo
backend em cada simulação, só não chega à tela. Não altera nenhum fato de domínio, nenhuma
decisão do sistema nem o que é dito ao requester — só amplia o que o Operador consegue inspecionar
depois de rodar uma simulação.

Ainda assim, é uma mudança de **interação/tela** (novas abas, novos dados visíveis), não uma
mudança de rótulo/cor/espaçamento — então não se enquadra na rota de "surface alone"
(`edits_freely`) mesmo com `frontend` declarado lá. Pelo critério do framework ("se a mudança
altera o que uma pessoa usando o sistema consegue aprender ou fazer, não é surface"), dar ao
Operador acesso a dados de debug que hoje ele não vê conta como alteração do que ele pode
aprender — portanto essa proposta, se aprovada, deveria seguir `/plan-work` → `/implement-task` →
`/review-change`, e não uma edição direta.

## Pendente de decisão

- Confirmar que as 5 adições acima fazem sentido como estão, ou cortar/priorizar alguma.
- Decidir layout: tabs adicionais dentro do mesmo grupo "Debug" do case result, ou uma seção
  separada abaixo dele.
- Confirmar se `evidence[].inputs` deve mesmo ser exposto (pode conter dado sensível dependendo do
  connector) ou se fica de fora por ora.
