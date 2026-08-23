# Plano completo do Case Management Admin Console (6 ondas) — referência entre sessões

Este arquivo existe para ser consultado em outras sessões sem depender do histórico de conversa.
Ele junta três coisas que, até agora, viviam em lugares separados: o plano aprovado na íntegra
(abaixo, verbatim), o estado real de cada onda (checado contra os artefatos em disco, não de
memória), e onde encontrar cada peça.

**O `/goal` que guiava a implementação autônoma foi limpo (`/goal clear`) pelo usuário.** Este
documento não é mais um objetivo ativo -- é referência. Retomar qualquer onda é uma decisão nova,
tomada quando alguém invocar `/plan-work` ou `/implement-task` de novo, não algo que continua
sozinho.

## Onde mais olhar

| Arquivo | O que tem |
|---|---|
| `.claude/plans/precious-skipping-summit.md` | o plano original (fonte deste documento) |
| `temp/frontend-console-goal-progress.md` | log de execução onda a onda, append-only |
| `temp/frontend-console-decisions.md` | toda decisão técnica tomada em nome do usuário, com o porquê |
| `docs/frontend-triage-console-proposal.md` | a proposta de produto original (telas 2.1-2.10) |
| `work/frontend-bootstrap/` | plano vivo (epics, tasks) |
| `delivery/frontend-bootstrap/` | registros de entrega (implementation/proof/review) |

## Estado real por onda (checado nesta sessão)

| Onda | Escopo | Status | Epic | Entrega |
|---|---|---|---|---|
| 0 | build-substrate (instala/builda/importa TUI) | ✅ entregue | `epic/case-authoring-console` | `delivery/frontend-bootstrap/implementation/case-authoring-console/build-substrate.md`, revisado em `delivery/frontend-bootstrap/review/frontend-bootstrap.md` |
| 1 | Fundação: router, AppShell, cliente de API, mapeamento erro→UI, banner de conflito, telemetria, tabela reutilizável, query client+toaster | ✅ **entregue, testada (71/71), revisada, commitada** | `epic/frontend-console-foundation` | 9 implementation + 8 proof records em `delivery/frontend-bootstrap/{implementation,proof}/frontend-console-foundation/`; revisão em `delivery/frontend-bootstrap/review/frontend-console-foundation-onda-1.md` (2 achados não-bloqueantes) |
| 2 | Cases List + Case Detail | ✅ **entregue e revisada** (3/3 tasks entregáveis; a 4ª removida do plano por infeasibilidade real -- ver abaixo) | `epic/cases-list-and-detail` | 3 implementation + 3 proof records; revisão em `delivery/frontend-bootstrap/review/cases-list-and-detail-onda-2.md` (2 achados de conformance, 5 de standard, nenhum bloqueante) |
| 3 | Version Editor (maior risco -- máquina de estado clean/dirty/saving/conflict) | ✅ **entregue, revisada e reconciliada** (2/2 tasks) | `epic/version-editor` | 2 implementation + 2 proof records; revisão em `delivery/frontend-bootstrap/review/version-editor-onda-3.md` (3 achados de conformance, 2 de standard, nenhum bloqueante) |
| 4 | Manifest Builder + Revise Hypothesis + aba Hypotheses | ✅ **entregue, revisada e reconciliada** (3/3 tasks) | `epic/manifest-hypothesis-authoring` | 3 implementation + 3 proof records; revisão em `delivery/frontend-bootstrap/review/manifest-hypothesis-authoring-onda-4.md` (1 achado de conformance, 3 de standard, nenhum bloqueante) |
| 5 | Release + Discard | ✅ **entregue e revisada, sem `/reconcile` necessário** (2/2 tasks) | `epic/version-editor` (mesmo epic, crescido pela 3ª vez) | 2 implementation + 2 proof records; revisão em `delivery/frontend-bootstrap/review/version-editor-onda-5.md` (2 achados de conformance, 3 de standard, nenhum bloqueante) |
| 6 | Glossary + Capabilities Browsers (paralelizável, depende só da Onda 1) | ✅ **entregue, revisada e reconciliada** (3/3 tasks) | `epic/glossary-and-capabilities-browser` | 3 implementation + 3 proof records; revisão em `delivery/frontend-bootstrap/review/glossary-and-capabilities-browser-onda-6.md` (5 achados de standard, nenhum bloqueante) |

**Achado de infraestrutura resolvido na Onda 2**: o backend real não enviava
`Access-Control-Allow-Origin` -- corrigido com um proxy de dev real no `vite.config.ts`
(`server.proxy` para `/v1/*` → `http://localhost:3000`), verificado com `curl` através de
`localhost:5173` retornando dados reais do backend.

**Achado real que reduziu a Onda 2 pra 3 tasks**: `POST /v1/cases` (criar draft) exige `title`,
`when_to_use`, `authored_at`, `subject` e `fallback`, todos obrigatórios (schema real confirmado) --
não só o slug, como a proposta original (seção 2.2, sem formulário) e o plano assumiam. A task
`case-detail-new-draft-action` foi removida do plano; criar um draft de verdade precisa de um
formulário, que é essencialmente o mesmo trabalho que a Onda 3 (Version Editor) já vai construir
pra editar esses campos via PATCH full-replace. "New draft" na Onda 3 vira a entrada direta no
Version Editor em branco, não um POST isolado aqui. Conta completa em
`temp/frontend-console-decisions.md`.

**Verificação real feita nesta sessão** (não apenas testes automatizados): backend (`src/`, sobe
com `node --env-file=.env dist/index.js`) responde de verdade contra um Postgres real (Neon) --
`curl http://localhost:3000/v1/cases` retornou dados reais. Frontend (`npx vite --port 5173`)
serve a shell da app normalmente. Nenhum caller real ainda existe (Onda 2 não implementada), então
não há fluxo ponta-a-ponta exercido ainda.

## Plano aprovado, na íntegra (fonte: `.claude/plans/precious-skipping-summit.md`)

# Ondas do Case Management Admin Console

## Contexto

`docs/frontend-triage-console-proposal.md` (revisado nesta sessão: telas 2.1–2.10, as 3 perguntas
abertas resolvidas, reordenação do manifest trocada para botões `▲`/`▼`) descreve um console de
curadoria completo sobre o backend de case-authoring. A fundação já está entregue
(`work/frontend-bootstrap`, epic `case-authoring-console`, task `build-substrate`, revisada em
`/review-change`) — `frontend/app` instala, builda e importa componentes reais do TUI através do
alias `@tui/ui/*`, mas ainda não tem router, camada de dados, nem nenhuma tela.

Verificado contra o backend real (não só a especificação): toda rota que as telas 2.1–2.10 precisam
já existe em `src/src/http/*.routes.ts` — `GET/POST /v1/cases`, `GET /v1/cases/:slug/versions[/:version]`,
`PATCH .../versions/:version`, `POST .../release`, `DELETE .../versions/:version` (discard),
`PUT/DELETE .../manifest/:hypothesis_name`, `POST .../hypotheses`, `GET .../hypotheses[/:name/revisions]`,
`GET /v1/glossary/...`, `GET /v1/capabilities...`. O envelope de erro é uniforme (`{error:{code,message,details?}}`,
`src/src/http/error-handler.middleware.ts`) e o mapa de status (`src/src/errors/status-map.ts`) confirma
exatamente os 10 erros tipados que a proposta já cita (404/409/422) mais os 4 que caem em 500 sem
mapa (risco #3 da proposta, confirmado real).

Este plano é a sequência de ondas — cada uma um ciclo completo `/plan-work` → `/implement-task`
(uma vez por task) → `/review-change` — que leva `frontend/app` de "instala e builda" a "console de
curadoria funcional". Nenhuma onda deste plano decide um fato novo do domínio: toda tela expõe uma
capacidade que `case`, `case-version`, `hypothesis`, `hypothesis-revision`, `resolution`, `referral`,
`contracts/system/case-authoring`, `domain/glossary/*` e `domain/integration/capability*` já
sustentam — é sempre a rota "capability's surface" da tabela de quatro rotas.

## Onda 1 — Fundação de dados, navegação e casca visual

**Por que primeiro**: toda tela das ondas 2–6 precisa de um router, uma forma de buscar/cachear
dados do backend, e um mapeamento erro→estado de UI. Construir isso dentro da primeira tela
misturaria decisão de arquitetura com decisão de tela, e a próxima tela reinventaria o padrão.

**Decisão de dependências a levar para aprovação quando esta onda for cortada**: autorizar no
standard `@tanstack/react-router`, `@tanstack/react-query`, `react-hook-form`, `zod`, `sonner` —
o mesmo stack que o TUI já usa (consistência de padrão, não obrigação), justificado por
ARC-02/API-01 (as rotas aninhadas de 1: `Cases ▸ case ▸ version ▸ manifest ▸ hipótese` pedem um
router tipado; os formulários de 2.3/2.5 pedem validação; toast é o mecanismo que 2.2 e 2.4 já
citam para conflitos).

**Escopo**:
- `AppShell`: sidebar (`Cases`, `Glossary`, `Capabilities` — sem `Hypotheses` de topo, decisão de
  2.10), topbar com breadcrumb e o indicador fixo "No auth in this build" (seção 0, forçado pela
  ausência real de auth no backend).
- Árvore de rotas vazia (uma rota por tela 2.1–2.10, cada uma renderizando um placeholder) —
  estabelece os caminhos que as ondas seguintes preenchem, sem cortar a decisão de layout de cada
  tela ainda.
- Cliente de API tipado: um wrapper de fetch lendo o envelope `{error:{code,message,details?}}`
  real do backend em um `ApiError` tipado, mais a tabela erro→estado de UI (API-02) cobrindo os 10
  erros mapeados (`status-map.ts`) e o fallback genérico para os 4 que caem em 500
  (`CaseHoldsNoDraftError`, `ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`,
  `CaseNotValidError` — risco #3 da proposta).
- O componente de banner de conflito reutilizável (seção 2.3) e o hook do catálogo de 8 eventos
  (seção 3) — decisão a levantar nesta onda: sem endpoint de telemetria conhecido, o sink inicial é
  um log estruturado (`console.info` namespaced) até haver um destino real; documentar como
  divergência, não inventar um endpoint.
- Um componente de tabela reutilizável (linha clicável, estado + palavra nunca só cor — 2.1 e 2.8/2.9
  compartilham essa forma) composto sobre `@tui/ui/table`.

**Onde entra no plano**: task(s) sob um epic novo (`epic/frontend-shell-and-data-layer`), rationale
apenas — nenhum nó de specification é implementado aqui, é arquitetura, não fato. `produces` nomeia
os arquivos de roteamento/cliente que o resto do plano presupõe (mesmo mecanismo de `build-substrate`).

*(Entregue de fato como `epic/frontend-console-foundation`, 8 tasks -- ver tabela de status acima.)*

## Onda 2 — Cases List + Case Detail (leitura + primeira escrita)

- **2.1 Cases List**: tabela, busca/filtro, estado vazio, navega para o detalhe.
- **2.2 Case Detail**: timeline de versões, "Continue editing" (sem pré-condição, já veio do GET),
  "New draft" quando não há draft (`POST /v1/cases`, com o 409 `CaseAlreadyHasDraftError` tratado
  como condição de corrida esperada — toast + redireciona, não como erro).

Depende da Onda 1 (router + cliente de API + tabela reutilizável). Primeira escrita real do plano,
mas de baixo risco — o 409 já é esperado e coberto no wireframe.

## Onda 3 — Version Editor (maior risco do plano)

- **2.3 Version Editor**: formulário de campo único porque o `PATCH` é full-replace; a máquina de
  estado `clean → dirty → saving → clean | conflict` (seção 4) fica inteira nesta onda, porque é a
  única linha de defesa contra dois curadores editando o mesmo draft (sem lock no backend); o
  banner de conflito da Onda 1 é ligado a dados reais aqui; 404 redireciona para Cases List.

Depende da Onda 1 (banner de conflito, cliente de API) e da Onda 2 (chega aqui pela navegação de
Case Detail). Isolada como sua própria onda porque a própria proposta já a marca como a tela mais
arriscada — misturá-la com Manifest Builder ou Release dobraria a superfície de uma vez.

## Onda 4 — Manifest Builder + Revise Hypothesis + aba Hypotheses

- **2.4 Manifest Builder**: reordenar com `▲`/`▼` (decidido nesta sessão), remover, a regra
  "mover é diferente de colidir", botão de remover desabilitado com tooltip quando resta 1 entrada.
- **2.5 Revise/Nova hipótese**: formulário com filtragem client-side de concepts por subject-type
  (pré-checagem, nunca autoridade final), erro que destaca cada concept ofensivo.
- **2.10 Hypotheses** (desenhada nesta sessão): aba do Case Detail, histórico de revisões por
  hipótese, botão "Revise" que abre 2.5 pré-carregado.

As três seguem juntas porque compartilham o mesmo estado (o manifest de um draft) e a mesma ação de
saída (abrir 2.5) — cortá-las em ondas separadas obrigaria a Onda 4a a prever uma integração que só
a 4b escreve.

## Onda 5 — Release e Discard (ações terminais)

- **2.6 Release**: modal de confirmação, checklist de validação agregada (sucesso e a variante
  multi-violação do `422 CaseVersionNotReleasableError` lado a lado).
- **2.7 Discard**: modal destrutivo, confirmação por digitação do slug, texto explícito de que as
  hypothesis-revisions sobrevivem.

Depende da Onda 3 (Version Editor é onde os dois botões vivem). Separada da Onda 3 porque são ações
terminais e de menor superfície de estado — misturar arriscaria a máquina de estado do form com dois
fluxos de modal que não a tocam.

## Onda 6 — Glossary + Capabilities Browsers (paralelizável)

- **2.8 Glossary Browser**: 5 abas de vocabulary terms + concepts, somente leitura.
- **2.9 Capabilities Browser**: tabela + painel de detalhe ao clicar na linha.

Território de especificação diferente (`domain/glossary/*`, `domain/integration/capability*`, não
`case-authoring`) — vai para um epic próprio (`epic/glossary-and-capabilities-browser`). **Não
depende de nada além da Onda 1** (router, tabela reutilizável, cliente de API) — pode ser entregue
em paralelo com as Ondas 2–5, em worktree separado, exatamente a convenção que
`deliver.py --outstanding` oferece quando o conjunto entregável tem mais de uma task ao mesmo tempo.

## Fora deste plano, deliberadamente

- Painel "Try it" (sandbox de diagnose) — decidido nesta sessão, fica para uma iniciativa futura.
- Ajustes de cor/rótulo/espaçamento pós-primeiro-release — rota `edits_freely`, nunca reabre este
  plano.
- Escrever `intake/layout/*.md` a partir do documento — passo mecânico de cada onda, feito ao
  cortá-la em `/plan-work`, não uma onda própria.

## Sequência e paralelismo

```
Onda 1 (fundação)
  ├─▶ Onda 2 (Cases List + Case Detail)
  │     └─▶ Onda 3 (Version Editor)
  │            └─▶ Onda 4 (Manifest + Revise + Hypotheses)
  │                   └─▶ Onda 5 (Release + Discard)
  └─▶ Onda 6 (Glossary + Capabilities) — paralela a 2–5, depende só de 1
```

## Como cada onda executa

Cada onda é: `/plan-work` (escopo em prosa citando as telas da onda + o documento como fonte,
epic evolui `covers`/`uncovered` de `case-authoring-console` ou nomeia o novo epic de
glossário/capabilities) → wireframes da onda extraídos para `intake/layout/` antes do corte →
`/implement-task` por task → `/review-change` sobre a onda entregue. Uma onda não começa antes da
anterior (na cadeia Cases) estar revisada — a Onda 6 é a exceção paralela.

## Verificação

Cada onda termina com o mesmo padrão já usado em `build-substrate`: `deliver.py --standard` valida
o registro, uma run capturada real (`bin/run.py`) confirma install→typecheck→lint→style→build→a11y→
secret-scan→test, e `/review-change` roda as quatro passagens sobre os arquivos daquela onda.

## Onda 6 — entregue, revisada e reconciliada. As 6 ondas do plano estão fechadas.

A Onda 6 está fechada (3/3 tasks entregáveis, revisadas, reconciliadas, commitadas):
`widen-glossary-vocabulary-union` (união `GlossaryVocabulary` ganha "subject-attribute" como quinto
membro, zero mudança de comportamento pros 6 consumidores já existentes), `capabilities-browser-screen`
(hook novo `use-capabilities.ts`, StatusTable's primeira composição de
clicar-linha-e-trocar-painel-de-detalhe deste código) e `glossary-browser-screen` (hook novo
`use-glossary-concepts.ts` preservando `ttl`, 6 abas compostas do mesmo jeito que
`case-detail-screen.tsx` já compõe Tabs do TUI). Ver
`delivery/frontend-bootstrap/review/glossary-and-capabilities-browser-onda-6.md` (5 achados de
standard, nenhum bloqueante) e
`siegard-reconcile/glossary-and-capabilities-browser-onda-6-drift.md` (drift causado pela própria
`widen-glossary-vocabulary-union` tocar `use-glossary-vocabulary.ts` -- 7 nós julgados, todos
conformes, todos rebindados).

**Antes de cortar a onda**, o usuário reportou um bug visual real numa tela já entregue
(checkboxes com dois indicadores sobrepostos, Selects com altura diferente do Storybook do TUI).
Root-caused e corrigido como incremento corretivo (`task/case-authoring-console/tailwind-scans-the-tui-submodule`):
`frontend/tui` é um git submodule, e a detecção automática de conteúdo do Tailwind v4 nunca
escaneia pra dentro dele a partir do build do `frontend/app` -- qualquer classe usada só no código
do TUI e nunca repetida no app ficava sem CSS compilado, silenciosamente, desde a Onda 1. Corrigido
com uma diretiva `@source` em `tokens.css` (arquivo do próprio app, nada do submodule tocado). Ver
`temp/frontend-console-decisions.md`. Essa rota do framework não inclui `/review-change` na própria
tabela, então fechou sem revisão.

Achados reais do backend confirmados por leitura direta do código (não assumidos do wireframe --
ver `work/frontend-bootstrap/intake/onda-6-scope.md`): o glossário serve 5 vocabulários de termo
(`subject-type`, `subject-attribute`, `outcome`, `action`, `recipient`), não 4 --
`subject-attribute` nunca tinha sido lido por nenhuma task; ambos os endpoints de listagem
(`GET /v1/glossary/...`, `GET /v1/glossary/concepts`) são paginados de verdade, mas toda hook (as
já existentes e as novas) segue a mesma convenção herdada de ler só a primeira página;
`GET /v1/capabilities` já traz todos os campos que o painel de detalhe do wireframe mostra
(`input_schema`/`output_schema` já vêm na própria listagem), então "clicar na linha" é seleção
client-side pura, nunca uma segunda leitura de rede; não existe endpoint de detalhe por nome de
capability (só por concept), e esta entrega nunca o chama.

`/review-change`: coverage 16/18 critérios cobertos, 1 não coberto (fato de union TypeScript que o
Vitest não consegue verificar em runtime -- só `tsc --noEmit` garante de verdade) + 1 parcial (o
"comportamento inalterado" dos 4 vocabulários pré-existentes é exercitado chamando a hook direto,
nunca através de nenhum dos 6 pontos de consumo reais); 0 achados de conformance; 5 achados de
standard (EDG-02 -- tela de Capabilities sem botão Retry no erro, ao contrário da tela irmã de
Glossary; 2x API-02 -- strings de erro genéricas hard-coded, não vindas de uma tabela
compartilhada; ACC-07 -- painel de detalhe que aparece ao clicar numa linha sem `aria-live` nem
foco movido, primeira vez que esse padrão aparece neste código, sem convenção prévia pra seguir;
API-01 -- transform inline anônimo onde duas funções irmãs no mesmo arquivo já estabelecem um
adaptador nomeado) -- nenhum bloqueante.

291/291 testes, 8/8 passos do build capturados em
`run/glossary-and-capabilities-browser-onda-6-full-suite`.

**Achado não resolvido, ainda à espera de um incremento corretivo** (mesmo desde a Onda 3, nunca
tocado por nenhuma onda de feature): `app-shell.tsx` declara "No auth in this build" como string
literal, uma segunda casa pro fato que `constraints/no-route-enforces-authentication` já afirma na
specification. Rota: `/plan-work` com o corretivo nomeando esse comportamento, nunca `/analyse`.

## As 6 ondas do plano original estão entregues, testadas e revisadas

Nada resta do escopo de `.claude/plans/precious-skipping-summit.md`.

## Pós-fechamento: correção do Tailwind + sweep de consistência de UX

Depois das 6 ondas, duas rodadas de incremento corretivo (rota "one wrong behavior in code already
delivered", sem `/review-change` -- essa rota não a inclui):

1. **Correção do Tailwind** (`task/case-authoring-console/tailwind-scans-the-tui-submodule`):
   `frontend/tui` é um git submodule, e o Tailwind v4 nunca escaneava pra dentro dele a partir do
   build do `frontend/app` -- qualquer classe usada só no código do TUI e nunca repetida no app
   ficava sem CSS compilado, silenciosamente, desde a Onda 1. Corrigido com uma diretiva `@source`
   em `tokens.css`.
2. **Sweep de consistência de UX** (3 tasks, `epic/case-authoring-console`): consolidou os achados
   repetidos de EDG-02/API-04/ACC-07 acumulados nas 6 reviews. `every-empty-collection-states-so`
   decidiu 2 fatos não-declarados (`scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly`,
   `rules/knowledge/a-release-refusal-with-no-named-violation-says-so`) e corrigiu um bug real
   encontrado no caminho (New draft sendo suprimido numa listagem vazia). `/reconcile` sobre os 6
   arquivos tocados achou 2 divergências reais e pré-existentes, disclosed e deixadas sem bind:
   `domain/knowledge/case-version` (Subject sempre desabilitado) e `domain/knowledge/case-summary`
   (atributos opcionais onde o nó exige obrigatórios).

Ver `temp/frontend-console-decisions.md` e `temp/frontend-console-goal-progress.md` pro relato
completo de ambas.

## O que fica em aberto, se alguém quiser continuar depois desta sessão

- O achado não resolvido do `constraints/no-route-enforces-authentication` (`app-shell.tsx`,
  disclosed desde a Onda 3, incremento corretivo via `/plan-work`).
- As duas divergências reais que a reconciliação da sweep deixou sem bind (acima) -- cada uma com
  suas próprias duas rotas de resolução nomeadas em `siegard-reconcile/ux-consistency-sweep-drift.md`,
  sem escolher entre elas.
- Os demais achados de conformance/standard disclosed em cada review (Ondas 1-6), nenhum
  bloqueante, todos com sua própria correção sugerida no próprio registro de review.
- Verificação ponta-a-ponta real (`npm run dev` conectado ao backend rodando de verdade) nunca foi
  refeita formalmente depois do cancelamento do `/goal` original na Onda 2 -- as ondas seguintes
  foram todas verificadas por suíte de testes + build capturado, não por uma sessão de uso manual
  do app rodando.
- "Try it" (sandbox de diagnose) segue fora de qualquer escopo, decidido desde a revisão original
  da proposta.
