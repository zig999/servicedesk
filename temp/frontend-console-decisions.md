# Decisões tomadas em nome do usuário (goal: console de curadoria)

O usuário autorizou (`/goal`) que decisões técnicas sejam tomadas autonomamente durante a execução
das 6 ondas, documentadas aqui para revisão futura. Cada entrada: o que foi decidido, por quê, e
onde revisar/reverter se necessário.

## Onda 1 — dependências do stack de dados/roteamento (planejado, ainda não autorizado no standard)

**Decisão**: autorizar em `standards/frontend-typescript.yaml` -- `@tanstack/react-router`,
`@tanstack/react-query`, `react-hook-form`, `zod`, `sonner`.

**Por quê**: mesmo stack que o TUI (`frontend/tui/frontend/package.json`) já usa -- consistência de
padrão entre os dois projetos, não obrigação técnica. As telas 2.1-2.10 têm rotas aninhadas reais
(`Cases ▸ case ▸ version ▸ manifest ▸ hipótese`), dois formulários com validação (2.3, 2.5), e toast
é o mecanismo que os próprios wireframes (2.2, 2.4) já citam para conflitos/erros.

**Onde revisar**: `standards/frontend-typescript.yaml`, seção `dependencies`. Reversível trocando o
pacote antes de qualquer task que o use ser cortada.

## Onda 1 — sink de telemetria

**Decisão**: os 8 eventos do catálogo (seção 3 da proposta) vão para `console.info` namespaced
(`telemetry:<event>`) até existir um endpoint real -- nenhum endpoint foi inventado.

**Por quê**: a proposta não nomeia um destino real para os eventos; inventar uma URL de telemetria
seria estatuir um fato que a especificação e o documento não sustentam. `console.info` é
observável (dev tools, logs de captura) sem fingir uma integração que não existe.

**Onde revisar**: o hook de telemetria desta onda. Trocar o sink é uma mudança local, sem reabrir
nenhuma tela.

---

## Onda 1 — autorizar jsdom (ambiente DOM para os testes React)

**Decisão**: autorizar `jsdom` em `standards/frontend-typescript.yaml` (pin
sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631) e ligar
`test.environment: "jsdom"` em `vite.config.ts`.

**Por quê**: `@testing-library/react` já estava autorizado (TST-01) mas era inerte -- sem jsdom/
happy-dom, `test.environment` do Vitest ficava em `"node"` (sem DOM), e toda prova de componente
React só conseguia afirmar "é uma função exportada", nunca render real (clique, texto, composição
visual). Sem isso, as ondas 2-6 (inteiramente telas React) teriam a mesma prova rasa se repetindo
tela após tela. jsdom é o ambiente DOM padrão do ecossistema Vitest/Testing Library, sem
dependência nova de peso (já é transitiva de `@testing-library/react` no ecossistema comum).

**Onde revisar**: `standards/frontend-typescript.yaml` (dependências), `vite.config.ts` (test.
environment). Reversível revertendo a authorization e a config; toda prova escrita depois disso
que dependa de render real teria que voltar a ser reescrita como prova rasa.

## Onda 1 — `test.globals: true` (auto-cleanup do Testing Library)

**Decisão**: ligar `test.globals: true` em `vite.config.ts`, e remover `afterEach(cleanup)`
manual dos specs de componente.

**Por quê**: com jsdom ligado, os specs de componente reais passaram a violar
`eslint-plugin-testing-library/no-manual-cleanup` (chamar `cleanup()` manualmente quando o próprio
`@testing-library/react` já registra o auto-cleanup contra `afterEach` global -- mas só existe um
`afterEach` global para se registrar quando `test.globals: true` está ligado). É a configuração
padrão do próprio `@testing-library/react` para Vitest; nenhuma trade-off encontrada.

**Onde revisar**: `vite.config.ts` (test.globals), e os specs de conflict-banner/status-table que
antes tinham `afterEach(cleanup)` manual.

## Onda 1 — bug real encontrado: `ConflictBanner` com `accent="danger"` sem efeito, e a tentativa de
correção revertida

**Achado**: `ConflictBanner` passava `accent="danger"` para `Banner` sem `frame="notched"` --
`Banner`'s próprio código faz `accent` um no-op documentado sob `frame="none"` (o default). O
acento de perigo nunca teve efeito visual algum.

**Primeira tentativa de correção** (revertida nesta sessão): adicionar `frame="notched"` para
ativar o accent. Rejeitada depois que os testes reais (rodando de fato sob jsdom) mostraram o
custo: `frame="notched"` delega a `Panel`, que -- por design documentado no próprio `banner.tsx`
("double-render is intentional") -- duplica o título como dois headings e substitui o landmark
ARIA implícito "banner" (do `<header>` puro) por um "region" genérico.

**Decisão final**: reverter para `frame="none"` (sem `accent`). O conflito já é comunicado pelo
texto do título e da mensagem, nunca só pela cor -- a mesma regra que este app já aplica em
`status-table.tsx` (status é sempre cor + palavra, nunca cor sozinha). Perder o landmark "banner" e
duplicar o heading custava mais do que vale um destaque de cor decorativo.

**Consequência registrada, não escondida**: o critério da task "ConflictBanner reuses Banner's
existing accent prop to signal a conflict" ficou `met: false` no registro de implementação
(`delivery/frontend-bootstrap/implementation/frontend-console-foundation/conflict-banner.md`), com
a divergência e o porquê completos ali. Não foi inventado um jeito alternativo de "cumprir" o
critério -- ele está genuinamente não atendido, e essa é a decisão sendo revisada aqui.

**Onde revisar**: `frontend/app/src/shared/components/conflict-banner.tsx`, e o registro de
implementação citado acima. Se o time decidir que o destaque de cor vale a troca de landmark, a
reversão é trivial (era a versão anterior).

## Onda 1 — bug real encontrado: `ApiError.details` sempre presente como propriedade própria

**Achado**: `"details" in apiError` retornava `true` mesmo quando o envelope do backend não
carregava `details` -- só descoberto quando o jsdom acima permitiu rodar a suíte de testes de
verdade por completo pela primeira vez (o teste já existia, mas nunca tinha corrido). Causa: com
`useDefineForClassFields: true` (tsconfig.json, target ES2022), uma declaração de campo de classe
comum (`readonly details?: unknown`) já emite uma inicialização de propriedade própria no
construtor, independente da atribuição condicional (`if (details !== undefined) this.details = ...`)
que o código já tinha escrito para satisfazer exatamente esse critério.

**Correção**: `declare readonly details?: unknown` em vez de `readonly details?: unknown` -- o
modificador `declare` diz ao TypeScript que o campo é só de tipagem, sem emitir nada; só a
atribuição condicional no construtor passa a criar a propriedade.

**Onde revisar**: `frontend/app/src/services/api-client.ts` (classe `ApiError`), registro de
implementação de `typed-api-client` (inferência documentada ali).

## Onda 1 — bug real encontrado: papel ARIA de linha clicável não é "row"

**Achado**: `status-table.tsx` dá `role="button"` a uma linha clicável (sobrescrevendo o `role`
implícito "row" da `<tr>`) precisamente para expor a interatividade -- então uma prova que buscasse
`getAllByRole("row")` para achar uma linha clicável nunca a encontraria (só a linha inerte, sem
`onRowClick`, mantém o "row" implícito). Não é um bug de produção -- é o comportamento certo,
documentado agora na prova (`reusable-status-table.md`) para não ser redescoberto tela após tela.

**Onde revisar**: `frontend/app/src/shared/components/status-table.spec.ts` e o registro de prova.

---

## Onda 1 — root route ganha `component: AppShell`, proof de router-skeleton reescrita

**Decisão**: `app-shell`'s quinto critério ("wraps every route... so no screen renders outside
it") só é satisfazível dando ao root route um `component` (TanStack Router, árvore plana) --
route-tree.tsx passou a ter `component: AppShell` no root. Isso tornou falso um teste que a proof
de `router-skeleton` já tinha ("leaves the root route without a layout component of its own"),
mas essa asserção nunca foi um critério da própria task -- era uma extensão do test-author
original, mais forte do que o critério real ("no route composes a layout... in this task",
propositalmente escopado à própria task).

**Rota escolhida**: modo de "re-entrega mais estreita" do `/implement-task` (a implementação de
`router-skeleton` continua intocada e válida; só a proof foi reescrita, removendo o teste que
ficou falso, com nota no `## Notes` citando `app-shell` como a entrega que invalidou aquela
asserção). Não reabri a implementação de router-skeleton -- ela nunca afirmou que o root ficaria
sem layout para sempre.

**Onde revisar**: `delivery/frontend-bootstrap/proof/frontend-console-foundation/router-skeleton.md`
(seção Notes) e `delivery/frontend-bootstrap/implementation/frontend-console-foundation/app-shell.md`
(divergência registrada lá também).

## Onda 1 — sidebar/topbar são construção nova (TUI não tem primitivo de navegação)

**Achado confirmado nesta rodada**: TUI de fato não tem nenhum primitivo de sidebar/nav (survey
original já apontava isso). `AppShell`'s sidebar é markup novo com os tokens semânticos do TUI
(`border-border`, `bg-surface`, `text-foreground`, etc.) e `@tanstack/react-router`'s próprio
`Link` (não o `Link` do TUI, que é uma âncora simples sem navegação client-side). O topbar reusa
`@tui/ui/status-bar` (`StatusBar`) com o breadcrumb (`@tui/ui/breadcrumb`) no slot central --
esses dois primitivos existiam e foram reusados como pedia o critério.

**Onde revisar**: `frontend/app/src/shared/components/app-shell.tsx`.

## Onda 1 — proof de `app-shell` usa roteador de teste próprio, não a árvore de produção

**Decisão**: em vez de renderizar `AppShell` através da árvore real de 10 rotas
(`route-tree.tsx`), a proof constrói um roteador de teste autocontido com 3 rotas
(`/cases`, `/glossary`, `/capabilities`) e `AppShell` como `component` do root.

**Por quê**: isola o teste da forma da árvore de produção (que pode crescer/mudar nas próximas
ondas sem invalidar esta proof) e evita depender de histórico de navegador real. Custo aceito e
documentado no próprio registro (`untested`): só os labels de "/cases" e "/glossary" da tabela
`ROUTE_LABELS` real são exercitados; as outras 8 entradas da tabela de produção não têm teste
próprio ainda.

**Onde revisar**: `frontend/app/src/shared/components/app-shell.spec.ts`,
`delivery/frontend-bootstrap/proof/frontend-console-foundation/app-shell.md` (campo `untested`).

---

## Verificação pós-onda-1 — backend e frontend rodando de verdade, gap de CORS encontrado

**Verificação feita** (condição terminal do `/goal`, parcial): `src/` builda (`npm run build`) e sobe
de verdade com `node --env-file=.env dist/index.js` contra o Postgres real (Neon,
`DATABASE_URL` já configurado em `src/.env`) -- `curl http://localhost:3000/v1/cases` responde
`200` com dados reais (`{"data":[{"slug":"perfil-mobile-tecnico-probe"}], ...}`). O frontend não
tem script `dev` no `package.json` (o registro do standard nunca precisou de um -- só
install/typecheck/lint/style/build/a11y/secret-scan/test) -- subi com `npx vite --port 5173`
diretamente, e serve `http://localhost:5173/` normalmente (a shell da app, `<div id="root">` +
`main.tsx`).

**Achado real, não coberto por nenhuma task da onda 1**: o backend não envia
`Access-Control-Allow-Origin` nenhum -- confirmado com `curl -i -H "Origin: http://localhost:5173"`.
Um `fetch()` real do browser (5173 → 3000) vai ser bloqueado por CORS assim que a primeira tela
real (Cases List, onda 2) tentar chamar o backend -- `curl` não reproduz isso porque CORS é
imposto pelo browser, não pelo servidor.

**Decisão**: não é fato de domínio nem fato que qualquer task da onda 1 cobria -- é infraestrutura
de desenvolvimento pura. A correção certa é um proxy de dev do lado do frontend
(`vite.config.ts`'s `server.proxy`, encaminhando `/v1/*` para `http://localhost:3000` -- o browser
enxerga só `localhost:5173`, então nunca é cross-origin de verdade), não mudar o backend (CORS no
servidor seria uma mudança de produção, escopo diferente). Vai ficar para a task da Onda 2 que
primeiro faz uma chamada real ao backend (`Cases List`) decidir/declarar isso -- provavelmente via
`produces`, já que é um artefato de infraestrutura que a tela presupõe, não um fato que a
especificação guarda.

**Onde revisar**: nenhum arquivo ainda -- é uma decisão pra registrar durante o corte da Onda 2 via
`/plan-work`, não uma correção feita agora.

**Estado dos processos**: os dois (`backend` PID via `node dist/index.js`, `frontend` PID via
`npx vite`) ficaram rodando em background neste shell para a verificação; são efêmeros (morrem se
o shell reciclar) e não fazem parte de nenhum artefato commitado.

---

## Onda 2 — `case-detail-new-draft-action` é infeasível como cortada; adiada para a Onda 3

**Achado, confirmado por leitura direta do backend real** (não uma suposição): `POST /v1/cases`
(create-draft) **não aceita `{slug}` sozinho**. O schema real
(`src/src/http/dto/create-draft.dto.ts`, `createDraftBodySchema`) exige, todos obrigatórios:
`title`, `when_to_use`, `authored_at`, `subject` (um subject-type real do glossário) e `fallback`
(`{outcome, referral: {action, recipient}}`, também do vocabulário). Confirmado também em
`case-store.port.ts`'s `CreateDraftInput` e no roteador/controller, que só repassam o corpo sem
preencher nada.

O `task-implementer` (corretamente) se recusou a escrever a task: nenhuma tela já entregue guarda
esses valores, nenhum nó de especificação declara um default, e inventar um `subject`/`fallback`
qualquer seria estatuir um fato de domínio (o conteúdo inicial real de uma versão) que a
especificação não sustenta -- exatamente o que o framework proíbe ("an inference that would
change behavior a caller depends on is not an inference -- it is a fact the base does not hold").

**Por que isso não é um "fato não-declarado" a decidir com `unstated-fact-decider`**: a
especificação já sabe exatamente o que uma case-version exige (`domain/knowledge/case-version`'s
próprios atributos obrigatórios -- title, when_to_use, subject, fallback -- coincidem exatamente
com o que o backend valida). O problema não é uma lacuna na especificação; é que **a premissa do
plano original estava errada**: a seção 2.2 da proposta desenha "New draft" como um clique único,
sem formulário, e o plano aprovado (`.claude/plans/precious-skipping-summit.md`, Onda 2) herdou
essa premissa sem verificar contra o schema real do `POST /v1/cases`.

**Decisão**: `case-detail-new-draft-action`, como cortada, é infeasível. Criar um draft de verdade
exige coletar título, when-to-use, subject e fallback -- essencialmente o mesmo formulário que a
Onda 3 (Version Editor) já precisa construir para editar esses mesmos campos via `PATCH`
full-replace (`update-draft`). Construir esse formulário agora, na Onda 2, duplicaria trabalho que
a própria Onda 3 existe para fazer, e o plano já isola a Version Editor como sua própria onda
exatamente por ser "a tela mais arriscada" -- misturar o formulário de criação com Cases
List/Case Detail dobraria essa superfície cedo demais.

**Ação tomada**: a task `case-detail-new-draft-action` foi removida do work root (nunca foi
implementada -- só o skeleton/binding existiam, nenhum código foi escrito). O epic
`cases-list-and-detail` foi atualizado: `contracts/knowledge/case-lifecycle` e
`rules/knowledge/a-case-has-at-most-one-draft` moveram de `covers` para `uncovered`, com o motivo
registrado. A Onda 2 fecha como **3 de 4 tasks entregues** (dev-proxy, cases-list-screen,
case-detail-timeline) -- a leitura completa da tela funciona; só a ação de escrita "New draft"
fica para quando a Onda 3 cortar o formulário completo.

**Onde revisar**: `work/frontend-bootstrap/epic/cases-list-and-detail.md` (covers/uncovered
atualizados), `docs/frontend-triage-console-proposal.md` seção 2.2 (o wireframe original que
assumiu o clique único -- vale uma nota lá quando a Onda 3 for cortada, mostrando "New draft"
abrindo direto no Version Editor em branco em vez de um botão que só faz o POST).

---

## Onda 3 — autorizar `@hookform/resolvers`

**Decisão**: autorizado `@hookform/resolvers` em `standards/frontend-typescript.yaml`
(novo pin sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09).

**Por quê**: `react-hook-form` e `zod` já estavam autorizados desde a Onda 1, mas nunca usados --
o Version Editor é a primeira tela que precisa de formulário de verdade. `@hookform/resolvers`
é a ponte padrão entre os dois (`zodResolver`), sem a qual o formulário teria que reimplementar
sua própria validação duplicando o schema Zod. O TUI já fixa essa mesma tríade (v3 em todos) no
seu `package.json`, então isso mantém a mesma convenção de versão major (Zod v3, não v4 -- a
prosa do CLAUDE.md do TUI menciona Zod v4 mas não há código nenhum no repositório usando isso,
só as próprias versões fixadas no `package.json`, que são v3).

**Onde revisar**: `standards/frontend-typescript.yaml`, seção `dependencies`.

---

## Onda 3 — texto do banner de conflito: `stated`, sem novo nó de specification

**Decisão**: o `execution-contract-binder` de `edit-draft-version` levantou uma nota `unstated`
sobre o texto exibido no banner de conflito quando `PATCH` retorna 409 `CaseVersionNotDraftError`
("This version was released by someone else. Your changes were not saved..."). Um
`unstated-fact-decider` dedicado, cego à task, decidiu `stated`: o texto já está verbatim em
`docs/frontend-triage-console-proposal.md` §2.3 e repetido em
`work/frontend-bootstrap/intake/onda-3-scope.md`, e a própria análise §6.1 da proposta já concluiu
que esse texto **re-apresenta** a regra `rules/knowledge/a-case-version-is-written-once` em vez de
inventar um fato novo. Nenhum arquivo da specification foi escrito; nenhuma entrada no
decision-log foi criada -- não houve decisão, só leitura.

O decisor também sugeriu, como material opcional (não obrigatório, sem entrada de log), um novo
nó `scenarios/knowledge/a-curator-editing-a-released-version-is-told-why.md` capturando esse caso
concreto. **Não escrevi esse nó**: o outcome retornado foi `stated`, e por essa própria contrato
(`unstated-fact-decider`), só o outcome `decided` -- nunca `stated` -- autoriza escrever a
specification. Escrever de qualquer forma teria sido a mesma falha que a disciplina existe pra
evitar: uma "decisão" sem entrada no decision-log.

**Ação tomada**: a task `edit-draft-version` cita o texto via seu próprio `sources`
(`intake/onda-3-scope.md`), do mesmo jeito que qualquer outro texto de UI já entregue nas Ondas 1-2
(ex.: o próprio `ConflictBanner`). O `execution-contract-binder` foi re-executado sobre o candidate
set expandido (mais `domain/knowledge/consolidation-register`) com esse achado como contexto, não
como veredito -- o binder decide de novo, com liberdade de reclassificar.

**Onde revisar**: este arquivo; `work/frontend-bootstrap/task/version-editor/edit-draft-version.md`
(`## Notes`, quando escrita); `docs/frontend-triage-console-proposal.md` §2.3/§6.1.

---

## Onda 4 — quatro erros de domínio de `POST /v1/cases/{slug}/hypotheses` caem em 500 genérico

**Decisão**: o formulário de Nova hipótese/Revise mostra uma mensagem genérica de falha para
qualquer erro desse POST, em vez do "destaca CADA concept ofensivo" que o wireframe (§2.5) desenha.

**Por quê**: li o código real (`revise-hypothesis.operation.ts`, `status-map.ts`) -- as quatro
falhas de domínio desse endpoint (`CaseHoldsNoDraftError`, `HypothesisRevisionCollectsNoConceptError`,
`ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`) não estão em `status-map.ts`, então
todas caem no fallback genérico de `error-handler.middleware.ts`: `500 { error: { code:
"INTERNAL_ERROR", message: "an unexpected error occurred" } }`, com o `context` tipado (que
nomearia os concepts ofensivos) descartado antes de chegar ao cliente. Não existe hoje nenhum jeito
de diferenciar essas quatro causas do lado do cliente, muito menos nomear um concept específico --
o wireframe assumia um mapeamento que o backend real não tem. A proposta original já previa essa
mitigação para erros não mapeados (seção 5, risco #3); a pré-checagem client-side de Collects
(só oferece concepts que já aceitam o subject-type do draft) permanece como desenhada, porque ela
é o que já reduz a chance real de bater nesse gap, não uma correção para ele.

**Onde revisar**: `work/frontend-bootstrap/intake/onda-4-scope.md` ("Achado real do backend",
item 3); mapear esses erros é uma mudança no backend (fora do target `frontend` desta iniciativa).

## Onda 4 — rota distinta para "New hypothesis" vs. "Revise"

**Decisão**: `task/manifest-hypothesis-authoring/revise-hypothesis-form` corta duas rotas
distintas em vez de reaproveitar a rota já registrada `manifest/hypotheses/$hypothesisName` para
as duas entradas ("New hypothesis" e "Revise").

**Por quê**: o `codebase-surveyor` levantou o risco de uma hipótese literalmente chamada "new"
colidir com o gatilho de criação se as duas entradas dividissem a mesma rota parametrizada. O
`backlog-decomposer` resolveu isso seguindo a convenção que `route-tree.tsx` já estabelece para
"versions/new" ao lado de "versions/$version" (segmento estático tem precedência sobre segmento
dinâmico do mesmo prefixo) -- mesmo padrão, não um novo.

**Onde revisar**: `work/frontend-bootstrap/task/manifest-hypothesis-authoring/revise-hypothesis-form.md`
(rationale e critério 1).

## Onda 4 — "Referenced by" (§2.10) adiado, "Revisions"/"current"/"frozen" mantidos

**Decisão**: a coluna "Referenced by" do wireframe 2.10 (quais versões do case ainda leem cada
revisão) e sua anotação por-revisão ficam fora desta onda. A contagem "Revisions" e os rótulos
"current"/"frozen" ficam.

**Por quê**: `GET /v1/cases/{slug}/hypotheses` e `.../hypotheses/{name}/revisions` (lidos
diretamente do código real) não trazem nenhuma referência de volta a uma case-version -- derivar
"Referenced by" exigiria ler TODAS as versões do case (via `GET /v1/cases/{slug}/versions/{version}`
uma a uma) por HIPÓTESE listada, um custo que cresce com o histórico inteiro do case, diferente do
`case-summary` da Onda 2 (que também precisava de leitura derivada, mas de tamanho fixo e pequeno
por linha). "Revisions" é uma leitura só (o `total` da paginação de `list-hypothesis-revisions`);
"current"/"frozen" não precisa de leitura nenhuma além da própria lista, já que nenhuma revisão é
editada in-place independente do estado de release -- comparar números de revisão já basta.

**Onde revisar**: `work/frontend-bootstrap/intake/onda-4-scope.md` ("Achado real do backend",
item 4); `work/frontend-bootstrap/task/manifest-hypothesis-authoring/hypotheses-tab.md` (rationale).

## Onda 4 — critério ausente sobre dropdowns de resolution/referral vindos do glossário

**Decisão**: adicionei um critério a `revise-hypothesis-form` exigindo que os dropdowns de
resolution outcome e referral action/recipient venham de `GET /v1/glossary/outcome`,
`/action`, `/recipient` -- o `execution-contract-binder` tinha voltado `underdetermined` porque o
skeleton original só exigia isso explicitamente para o campo Collects (via
`GET /v1/glossary/concepts`), deixando aberta uma implementação de campo livre para outcome/action/
recipient que passaria em todos os critérios escritos mas violaria
`rules/knowledge/case-terms-exist-in-the-glossary`.

**Por quê**: a própria nota "What it is" do decomposer já dizia "Reuses the existing
glossary-term-vocabulary hook as-is for the outcome/action/recipient dropdowns" -- a intenção já
estava declarada, só faltava um critério testável pra ela. Corrigi o critério diretamente (correção
de forma sobre um skeleton, não uma nova decomposição) e re-rodei o binder, que confirmou o gap
fechado.

**Onde revisar**: `work/frontend-bootstrap/task/manifest-hypothesis-authoring/revise-hypothesis-form.md`
(critério 5 e Notes).

---

## Onda 4 — "Referenced by" (§2.10) adiado; "Revisions"/"current"/"frozen" mantidos

**Decisão**: a coluna "Referenced by" do wireframe da aba Hypotheses (quais versões do case ainda
leem cada revisão) fica fora desta onda. A contagem "Revisions" e os rótulos "current"/"frozen"
ficam.

**Por quê**: `GET /v1/cases/{slug}/hypotheses` e `.../hypotheses/{name}/revisions` não trazem
nenhuma referência de volta a uma case-version. Derivar "Referenced by" exigiria ler TODAS as
versões do case por hipótese listada -- um custo que cresce com o histórico inteiro do case, ao
contrário do `case-summary` da Onda 2. "Revisions" é uma leitura só (o `total` da paginação);
"current"/"frozen" não precisa de leitura extra, já que nenhuma revisão é editada in-place.

**Onde revisar**: `work/frontend-bootstrap/intake/onda-4-scope.md`; `.../task/manifest-hypothesis-authoring/hypotheses-tab.md`.

## Onda 4 — dois bugs reais corrigidos durante a entrega

**Decisão 1**: `apiFetch` (services/api-client.ts) foi corrigido para não chamar `response.json()`
em respostas `204`.

**Por quê**: os dois endpoints de manifest (`PUT`/`DELETE .../manifest/{hypothesis_name}`)
respondem `204` vazio -- `apiFetch` chamava `response.json()` incondicionalmente em qualquer
sucesso, o que lança `SyntaxError` contra um corpo vazio. Sem essa correção, nenhum critério de
`manifest-builder` (reorder/remove) seria satisfazível.

**Decisão 2**: `vite.config.ts` ganhou aliases forçados de `react`/`react-dom` (e seus subpaths)
mais um `test.server.deps.inline` para qualquer dependência resolvida de dentro de
`frontend/tui/frontend/node_modules`; adicionalmente, substituí
`frontend/tui/frontend/node_modules/react` e `react-dom` por symlinks apontando para as cópias do
próprio `frontend/app`.

**Por quê**: `manifest-builder` foi a primeira task a usar Tooltip/Dialog do TUI -- componentes que
dependem de pacotes reais (`@radix-ui/react-tooltip`, `@radix-ui/react-dialog` e suas próprias
dependências transitivas: `@floating-ui/react-dom`, `react-remove-scroll`) instalados dentro do
`node_modules` PRÓPRIO do TUI (`frontend/tui/frontend`), separado do `node_modules` do app. Qualquer
import `"react"` desses pacotes resolve para a cópia do TUI, não a do app -- duas cópias de React
numa árvore de render só, que quebra com "Cannot read properties of null (reading 'useRef')" assim
que um desses componentes renderiza. Confirmado lendo o stack trace real até
`frontend/tui/frontend/node_modules/react`. Isso não é só um problema de teste -- o build de
produção e o dev server real teriam o mesmo crash. `resolve.dedupe` (mecanismo documentado do
próprio Vite para esse exato formato de monorepo) foi tentado primeiro e não resolveu sob o
carregamento de módulos SSR-like do Vitest; a combinação alias+`deps.inline`+symlink foi confirmada
por reprodução direta.

**Risco disclosed**: o symlink é um arquivo de `node_modules` (gitignored, não rastreado) -- sobrevive
ao `npm ci` do próprio app (que só reinstala `frontend/app/node_modules`), mas precisa ser refeito
se alguém rodar `npm install` diretamente dentro de `frontend/tui/frontend`. Uma correção durável
(workspace npm unindo os dois pacotes, ou `overrides`/`resolutions`) fica fora do escopo desta task.

**Onde revisar**: `delivery/frontend-bootstrap/implementation/manifest-hypothesis-authoring/manifest-builder.md`
(divergences); `frontend/app/vite.config.ts`.

## Onda 4 — achado real de produto: swap de posições ocupadas é recusado pelo backend

**Não é uma decisão, é uma disclosure**: o backend (`manifest-composition.operations.ts`'s own
`refuseOccupiedByAnother`) recusa mover uma hipótese para uma posição que uma hipótese DIFERENTE já
ocupa -- ou seja, um clique de ▲/▼ num manifest compacto normal (posições 1,2,3 sem buracos) vai
bater nesse `409 ManifestPositionOccupiedError` na maioria das vezes, já que reordenar dois itens
adjacentes É exatamente essa colisão. Isso já estava no texto do próprio wireframe original ("só
posições ocupadas por hipótese DIFERENTE bloqueiam") e os critérios 4/5 de `manifest-builder` já
testam exatamente esse comportamento -- não é um defeito desta entrega, é uma limitação real do
backend que vale a pena você saber antes de considerar o Manifest Builder "pronto para uso" no
sentido de reordenar itens adjacentes com um clique só.

**Onde revisar**: `delivery/frontend-bootstrap/implementation/manifest-hypothesis-authoring/manifest-builder.md`
(deferred).

---

## Onda 5 — implementação sequencial, não paralela

**Decisão**: implementar `release-draft-version` e `discard-draft-version` sequencialmente (release
primeiro, discard depois), ao contrário da Onda 4 (`manifest-builder`/`hypotheses-tab` em
paralelo).

**Por quê**: as duas tasks desta onda tocam exatamente o mesmo par de arquivos --
`case-version-editor-ready-view.tsx` e `use-edit-draft-version-form.ts` -- cada uma adicionando seu
próprio botão + Dialog + mutation isolada aos mesmos arquivos. O par da Onda 4 era majoritariamente
disjunto (só sobreposição incidental em `case-detail-screen.tsx`/`app-shell.tsx`), o que ainda assim
causou problemas reais de estado de arquivo. Rodar em paralelo aqui teria risco bem maior de um
conflito de edição não sincronizado e irrecuperável.

**Onde revisar**: nada a reverter -- é uma escolha de processo, não de código. Confirmado que
funcionou: `discard-draft-version`'s task-implementer leu o estado real pós-`release` antes de
escrever, sem nenhum conflito.

## Onda 5 — dois módulos de serviço novos, para caber no limite de 300 linhas do ESLint

**Decisão**: `use-edit-draft-version-form.ts` estourou o `max-lines` (300) tanto na entrega de
`release-draft-version` quanto na de `discard-draft-version`. Cada uma extraiu sua própria lógica
pura para um módulo de serviço novo: `services/case-version-record.ts` + `services/release-checklist.ts`
(release) e `services/discard-confirmation.ts` (discard).

**Por quê**: nenhuma das duas tasks tinha `produces` declarado, então nenhuma está isenta do
standard. `discard-confirmation.ts` usou um formato de extração diferente do de
`release-checklist.ts` -- carregando também o objeto de opções da mutation
(`buildDiscardMutationOptions`) e o literal do campo de retorno (`buildDiscardControlState`), não
só computação pura -- porque a lógica de discard é mais fina (sem array de violações, sem
computação multi-item) e uma extração só-pura não teria fechado a folga sozinha. O passe de
standard do `/review-change` confirmou que nenhuma regra deste registro proíbe esse formato mais
amplo de extração (ARC-03 é satisfeito de qualquer jeito, já que os dois mantêm lógica de negócio
fora do JSX).

**Onde revisar**: `frontend/app/src/services/case-version-record.ts`,
`.../services/release-checklist.ts`, `.../services/discard-confirmation.ts`; as divergences dos
dois registros de implementação.

## Onda 5 — Release usa variante "primary" (nunca "destructive"), ao contrário do precedente de Remove

**Decisão**: o botão "Release…" e o confirm do seu Dialog usam a variante padrão (primary) do TUI,
não a variante "destructive" que `version-manifest-screen.tsx`'s Remove flow (o único precedente de
confirmação destrutiva já entregue) usa.

**Por quê**: Release congela uma versão, nunca apaga nada -- a própria rationale do epic traça essa
linha explicitamente como o motivo de release e discard serem duas tasks separadas. Estilizar
Release com o mesmo vermelho que o precedente usa para uma ação que APAGA diria visualmente ao
curador que os dois riscos são iguais, o que os nós vinculados (`a-case-version-is-written-once`:
"nunca mais alterada", nunca "removida") não sustentam. Discard, ao contrário, usa a variante
destructive -- ele de fato apaga a versão e seu manifest.

**Onde revisar**: `frontend/app/src/routes/case-version-editor-ready-view.tsx`; a divergence
registrada em `delivery/frontend-bootstrap/implementation/version-editor/release-draft-version.md`.

## Onda 5 — dois achados de conformance sobre os rótulos do checklist pré-Release

**Não é uma decisão, é uma disclosure** (achado do `/review-change`, ainda não corrigido): o
rótulo "Fallback resolution is set" do checklist na verdade testa se os termos outcome/action/
recipient do fallback ainda existem no glossário (`rules/knowledge/case-terms-exist-in-the-glossary`),
não se o campo fallback está presente (que `domain/knowledge/case-version` já garante sempre estar,
por ser obrigatório) -- um curador vendo esse item falhar é apontado pro problema errado. Do mesmo
jeito, "Every collected concept accepts the case subject" confunde "concept não existe mais no
glossário" (`case-terms-exist-in-the-glossary`) com "concept existe mas rejeita este subject"
(`a-concept-accepts-the-declared-subject-type`) sob um único rótulo -- duas causas raiz diferentes,
uma correção sugerida errada quando a causa real é a outra.

**Onde revisar**: `frontend/app/src/services/release-checklist.ts` (`buildReleaseChecklist`);
`delivery/frontend-bootstrap/review/version-editor-onda-5.md` (findings de conformance).

---

## Onda 6 (antes de cortar) — correção corretiva: Tailwind nunca escaneava o submodule do TUI

**Não é bem uma "decisão técnica em nome do usuário"** -- é um bug real que o usuário encontrou
rodando o sistema de verdade, tratado pela rota própria do framework para isso (incremento
corretivo via `/plan-work`, sem survey/decomposição).

**Causa raiz**: `frontend/tui` é um git submodule (repositório próprio). A detecção automática de
conteúdo do Tailwind v4, disparada pelo `@import "tailwindcss";` dentro do `theme.css` do próprio
TUI, nunca varre pra dentro da árvore de arquivos desse submodule a partir do build do
`frontend/app`. Qualquer classe usada só dentro do código do TUI e nunca repetida no código do app
ficava sem CSS compilado -- silenciosamente, em toda tela já entregue desde a Onda 1. Confirmado
lendo o build real: as strings `"peer sr-only"` (Checkbox) e `"flex h-9 w-full"` (Select) já
chegavam no bundle JS compilado, mas grep no CSS compilado da mesma build não encontrava nenhuma
das duas regras.

**Correção**: uma diretiva `@source "../../../tui/frontend/src";` em `tokens.css` (o único arquivo
que o `frontend/app` já possui pra essa finalidade -- nada do submodule TUI foi tocado). Verificado
empiricamente: `.sr-only`, `.h-9` e uma terceira classe (`.max-h-60`) passaram a compilar; 231/231
testes, nenhuma regressão.

**Efeito colateral disclosed, não escondido**: um warning novo de build ("Unexpected token
Delim('*')") -- o scanner do Tailwind, agora varrendo mais texto, capturou uma string parecida com
classe dentro de um COMENTÁRIO de código no `date-picker.tsx` do próprio TUI (documentando uma
classe que já foi removida) -- nunca um className real. Sem mecanismo pra excluir só comentários
sem excluir o arquivo inteiro (o que reintroduziria o bug original pras classes reais desse
arquivo).

**Onde revisar**: `frontend/app/src/design-system/tokens.css`;
`delivery/frontend-bootstrap/implementation/case-authoring-console/tailwind-scans-the-tui-submodule.md`.
Esta rota do framework (bug de código já entregue) não inclui `/review-change` na própria tabela de
rotas -- a entrega fechou sem revisão.

## Onda 6 — decomposição em 3 tasks, achado real sobre o painel de detalhe de Capabilities

**Decisão (do `backlog-decomposer`, ratificada)**: 3 tasks -- `widen-glossary-vocabulary-union`
separada do Glossary Browser porque `GlossaryVocabulary` é uma interface compartilhada com 6
consumidores reais fora desta epic; `capabilities-browser-screen` e `glossary-browser-screen`
como duas tasks independentes (hooks, rotas e dados distintos).

**Achado real do backend, não assumido do wireframe**: `GET /v1/capabilities` já retorna todos os
campos que o painel de detalhe do wireframe mostra (`input_schema`, `output_schema` inclusos na
própria listagem, não só no endpoint de detalhe). Isso muda o desenho do próprio wireframe: "clicar
na linha troca o painel de detalhe" nunca precisa de uma segunda leitura de rede -- é seleção
client-side pura sobre uma linha já carregada. O único endpoint de detalhe que existe
(`GET /v1/capabilities/:concept`) busca por CONCEPT, não por capability, e nunca é chamado por esta
entrega.

**Onde revisar**: `work/frontend-bootstrap/intake/onda-6-scope.md` (achado #5);
`work/frontend-bootstrap/task/glossary-and-capabilities-browser/capabilities-browser-screen.md`.

---

## Sweep de UX consistency — 3 tasks corretivas sob `epic/case-authoring-console`

**Decisão**: consolidar os achados repetidos de EDG-02 (erro sem retry), API-04 (coleção vazia sem
mensagem) e ACC-07 (mudança assíncrona sem `aria-live`) -- 9 localizações distintas em 6 arquivos,
across 6 reviews -- em 3 tasks corretivas (uma por padrão de regra), não uma por localização.

**Por quê**: cada padrão é mecanicamente idêntico em todo lugar onde aparece (o mesmo tipo de
correção repetido), e este código já tem exemplos corretos do padrão pra copiar em cada caso
(`CaseHypothesesTab`'s próprio retry; `FormField`'s próprio `role="alert"`). Rota "one wrong
behavior in code already delivered" do framework -- sem survey/decomposição, só o binder por task.

**Por que sob `case-authoring-console`**: nenhuma das 3 tasks pertence a uma única epic de feature
(cada uma toca telas de múltiplas ondas/epics diferentes) -- `case-authoring-console` é o único
epic desta iniciativa sem território de tela próprio, já usado assim pro `build-substrate` (Onda 0)
e pela correção do Tailwind.

**Onde revisar**: `work/frontend-bootstrap/task/case-authoring-console/every-{load-error-offers-retry,empty-collection-states-so,async-update-is-announced}.md`.

## Sweep de UX consistency — dois fatos decididos, dois achados reais não resolvidos

**Decisão (via 2 `unstated-fact-decider`s, cegos à task)**: o binder de `every-empty-collection-states-so`
achou que "o que o curador lê quando uma listagem vem vazia" é um fato de negócio (per a regra do
próprio framework: "o que alguém é informado num resultado é o que o negócio decidiu"), não um
nicety de UI puro como eu tinha assumido ao oferecer a sweep. Dois fatos decididos, dois nós novos:
`scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly` e
`rules/knowledge/a-release-refusal-with-no-named-violation-says-so`.

**Não é uma decisão, é uma disclosure** (achado do `/reconcile` desta sweep, nenhum causado por
ela, nenhum corrigido): dois nós da specification ficaram sem bind porque o código real os
contradiz —
1. `domain/knowledge/case-version`: o campo Subject do Version Editor fica sempre desabilitado
   (`case-version-editor-form-fields.tsx`), contradizendo o próprio nó ("seus atributos declarados
   podem ser corrigidos enquanto em draft"). Mesmo achado já disclosed na review da Onda 3, nunca
   corrigido.
2. `domain/knowledge/case-summary`: `cases-list-screen.tsx` modela `current_state`/`last_updated`
   como opcionais pro caso de um case com zero versões, mas o nó exige os três atributos
   (`current_state`, `version_count`, `last_updated`) obrigatórios, sem exceção declarada.

**Onde revisar**: `siegard-reconcile/ux-consistency-sweep-drift.md` (as duas rotas de resolução
nomeadas pra cada um, sem escolher entre elas).

---

(entradas seguintes anexadas conforme as ondas avançam)
