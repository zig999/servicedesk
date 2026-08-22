# Onda 2 — Cases List + Case Detail

Escopo cortado a partir do plano aprovado (`.claude/plans/precious-skipping-summit.md`, seção
"Onda 2 — Cases List + Case Detail"), citado abaixo verbatim, mais o achado de infraestrutura
confirmado nesta sessão.

## Do plano aprovado

- **2.1 Cases List**: tabela, busca/filtro, estado vazio, navega para o detalhe.
- **2.2 Case Detail**: timeline de versões, "Continue editing" (sem pré-condição, já veio do GET),
  "New draft" quando não há draft (`POST /v1/cases`, com o 409 `CaseAlreadyHasDraftError` tratado
  como condição de corrida esperada — toast + redireciona, não como erro).

Depende da Onda 1 (router + cliente de API + tabela reutilizável). Primeira escrita real do plano,
mas de baixo risco — o 409 já é esperado e coberto no wireframe.

## Fonte primária

`docs/frontend-triage-console-proposal.md`, seções 2.1 e 2.2 (os wireframes ASCII e o contrato de
comportamento gatilho→pré-condição→ação→sucesso→falha de cada tela).

## Backend real confirmado (não só a especificação)

- `GET /v1/cases` — lista (paginada: `data`, `total`, `limit`, `offset`, `pageCount`).
- `POST /v1/cases` — cria um draft; `409 CaseAlreadyHasDraftError` quando o slug já tem draft.
- `GET /v1/cases/:slug/versions` — lista as versões de um caso.
- `GET /v1/cases/:slug/versions/:version` — uma versão específica.
- Envelope de erro uniforme já tratado pelo `typed-api-client`/`error-to-ui-state-table` da Onda 1.

## Achado de infraestrutura desta sessão (não uma task por si só, mas um artefato que a primeira
task que chama o backend de verdade precisa produzir)

Nenhuma tela da Onda 1 chamava o backend de verdade — `typed-api-client` não tem base URL nem
proxy configurado. Testado nesta sessão: backend real (`src/`, Postgres via Neon) responde em
`http://localhost:3000` com dados reais; frontend (`npx vite`) serve em `http://localhost:5173`;
mas o backend não envia `Access-Control-Allow-Origin` — um `fetch()` de browser real seria
bloqueado por CORS assim que a primeira tela desta onda tentar chamar o backend (confirmado com
`curl -i -H "Origin: http://localhost:5173"`, sem esse header na resposta).

A correção esperada é um **proxy de dev no `vite.config.ts`** (`server.proxy`, encaminhando
`/v1/*` para `http://localhost:3000`) — nunca uma mudança no backend (CORS no servidor seria uma
mudança de produção fora do escopo deste plano). Documentado em
`temp/frontend-console-decisions.md`.
