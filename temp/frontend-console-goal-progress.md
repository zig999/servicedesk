# Goal: implementar o Case Management Admin Console (todas as 6 ondas)

**As 6 ondas do plano estão entregues, testadas e revisadas.** O `/goal` original foi cancelado
pelo usuário durante o corte da Onda 2 (loop autônomo parado); a partir daí, cada onda seguinte
(3, 4, 5, 6) foi conduzida por instrução explícita e pontual do usuário, uma de cada vez, seguindo
sempre o mesmo ciclo rigoroso (`/plan-work` → `/implement-task` por task → `/review-change` →
`/reconcile` quando há drift). Este arquivo continua sendo o log append-only de tudo o que foi
feito, onda a onda.

Objetivo original (goal setado via `/goal`): entregar o plano completo de
`.claude/plans/precious-skipping-summit.md` (ondas 1-6 do console de curadoria de casos), com
autonomia para tomar decisões técnicas em nome do usuário -- cada decisão documentada em
`temp/frontend-console-decisions.md`. A condição terminal original (frontend rodando de fato,
conectado ao backend) nunca foi formalmente re-testada ponta-a-ponta depois do cancelamento do
goal, mas todas as 6 ondas do escopo estão entregues -- ver a tabela abaixo.

## Estado geral

| Onda | Status | Work root / epic | Delivery | Review |
|---|---|---|---|---|
| 0 — build-substrate | ✅ entregue (sessão anterior) | work/frontend-bootstrap, epic/case-authoring-console | delivery/frontend-bootstrap/implementation/case-authoring-console/build-substrate.md | delivery/frontend-bootstrap/review/frontend-bootstrap.md |
| 1 — fundação (router, dados, casca) | ✅ **entregue e revisada** (8/8 tasks) | work/frontend-bootstrap, epic/frontend-console-foundation | 9 implementation + 8 proof records | delivery/frontend-bootstrap/review/frontend-console-foundation-onda-1.md (2 achados, nenhum bloqueante, coverage 22 covered/10 partial/5 uncovered) |
| 2 — Cases List + Case Detail | ✅ **entregue e revisada** (3/3 tasks entregáveis -- a 4ª, `case-detail-new-draft-action`, removida do plano por ser infeasível como cortada, ver decisions.md) | work/frontend-bootstrap, epic/cases-list-and-detail | 3 implementation + 3 proof records | delivery/frontend-bootstrap/review/cases-list-and-detail-onda-2.md (2 achados de conformance + 5 de standard, nenhum bloqueante) |
| 3 — Version Editor | ✅ **entregue, revisada e reconciliada** (2/2 tasks) | work/frontend-bootstrap, epic/version-editor | 2 implementation + 2 proof records | delivery/frontend-bootstrap/review/version-editor-onda-3.md (3 achados de conformance + 2 de standard, nenhum bloqueante) |
| 4 — Manifest + Revise + Hypotheses | ✅ **entregue, revisada e reconciliada** (3/3 tasks) | work/frontend-bootstrap, epic/manifest-hypothesis-authoring | 3 implementation + 3 proof records | delivery/frontend-bootstrap/review/manifest-hypothesis-authoring-onda-4.md (1 achado de conformance + 3 de standard, nenhum bloqueante) |
| 5 — Release + Discard | ✅ **entregue e revisada** (2/2 tasks, sem drift novo -- nenhum `/reconcile` necessário) | work/frontend-bootstrap, epic/version-editor | 2 implementation + 2 proof records | delivery/frontend-bootstrap/review/version-editor-onda-5.md (2 achados de conformance + 3 de standard, nenhum bloqueante) |
| 6 — Glossary + Capabilities | ✅ **entregue, revisada e reconciliada** (3/3 tasks) | work/frontend-bootstrap, epic/glossary-and-capabilities-browser | 3 implementation + 3 proof records | delivery/frontend-bootstrap/review/glossary-and-capabilities-browser-onda-6.md (5 achados de standard, nenhum bloqueante) |
| Fix — Tailwind não escaneava o submodule TUI | ✅ **entregue** (incremento corretivo, sem `/review-change` -- rota própria não inclui) | work/frontend-bootstrap, epic/case-authoring-console | 1 implementation + 1 proof record | N/A (rota corretiva) |
| Sweep — UX consistency (EDG-02/API-04/ACC-07) | ✅ **entregue e reconciliada** (3/3 tasks) | work/frontend-bootstrap, epic/case-authoring-console | 3 implementation + 3 proof records | N/A (rota corretiva); 2 achados reais pré-existentes (Subject sempre desabilitado; CaseSummary parcial em caso de zero versões) ficaram disclosed, não corrigidos e não revinculados |

## Estado exato da Onda 2 no momento do cancelamento

`/plan-work` estava em andamento (não terminou -- nenhum `plan.json` foi derivado, nenhuma task
foi escrita a arquivo, nada foi implementado):

- **Escrito e válido em disco**: `work/frontend-bootstrap/intake/onda-2-scope.md` (escopo
  persistido), `work/frontend-bootstrap/inventory/frontend-cases-list-detail-foundation.md`
  (survey do codebase-surveyor), `work/frontend-bootstrap/epic/cases-list-and-detail.md` (epic
  completo, validado sozinho com `plan.py --node`).
- **Decompostas, mas não escritas como task files**: 4 skeletons de task retornados pelo
  `backlog-decomposer` -- `dev-proxy-for-backend-api`, `cases-list-screen`,
  `case-detail-timeline`, `case-detail-new-draft-action` (conteúdo completo no transcript da
  sessão, não persistido em `work/frontend-bootstrap/task/cases-list-and-detail/` ainda).
- **Vínculo à especificação (`execution-contract-binder`)**: só 1 de 4 terminou --
  `dev-proxy-for-backend-api` voltou com `implements: []` (esperado, é infraestrutura pura, sem
  fato de domínio). As outras 3 (`cases-list-screen`, `case-detail-timeline`,
  `case-detail-new-draft-action`) foram interrompidas pelo usuário antes de responder -- não
  rodaram até o fim, não retornaram nada reaproveitável.
- **Achado de infraestrutura já confirmado** (não uma task, mas o que a primeira task que chama
  o backend de verdade vai precisar produzir): CORS -- ver `temp/frontend-console-decisions.md`.
- **Para retomar**: re-rodar os 3 binders pendentes (ou `/plan-work` do zero sobre o mesmo
  escopo -- o epic já escrito seria reaproveitado), escrever as 4 tasks, validar o plano
  (`plan.py`), então `/implement-task` por task.

## Próximo passo imediato (antes do cancelamento)

Cortar a Onda 1 via `/plan-work`: escopo = casca visual (AppShell), árvore de rotas vazia, cliente
de API tipado + mapeamento erro→UI, banner de conflito reutilizável, hook de telemetria (sink =
log estruturado), tabela reutilizável sobre `@tui/ui/table`. Epic novo:
`epic/frontend-shell-and-data-layer` (nenhum nó de specification implementado -- é arquitetura).

## Log de execução (append-only, mais recente no topo)

- **Sweep de consistência de UX entregue e reconciliada (3/3 tasks corretivas).** Usuário pediu
  ("siga") depois que eu listei todos os achados de conformance/standard acumulados nas 6 reviews
  e ofereci varrer os repetidos (EDG-02/API-04/ACC-07) de uma vez.
  3 tasks corretivas (rota "one wrong behavior in code already delivered", sem survey/decomposição,
  só o binder por task), sob `epic/case-authoring-console` (crescido, único epic sem território de
  tela própria): `every-load-error-offers-retry` (botão Retry em Cases List, aba Versions do Case
  Detail e Capabilities Browser -- implementa nenhum nó), `every-empty-collection-states-so`
  (sentença explícita em vez de tabela/alert vazios na aba Versions e no Dialog de violações do
  Release), `every-async-update-is-announced` (aria-live/role="alert" em 4 lugares -- implementa
  nenhum nó).
  `every-empty-collection-states-so` decidiu 2 fatos não-declarados via `unstated-fact-decider`
  (cego à task, um por fato): `scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly`
  (o que o curador lê quando a listagem de versões de um caso vem vazia) e
  `rules/knowledge/a-release-refusal-with-no-named-violation-says-so` (o que o curador lê quando um
  release é recusado sem violação nomeada), ambos disclosed no decision-log.
  **Bug real encontrado e corrigido no caminho**: a primeira tentativa de implementação suprimiu o
  link "New draft" inteiro quando a lista de versões vinha vazia, regredindo o critério de uma task
  já entregue (`new-draft-creation`) -- pego por 3 testes pré-existentes ficando vermelhos, corrigido
  antes de fechar o registro. 2 testes obsoletos que afirmavam o comportamento agora superado
  (tabela só-com-cabeçalho) foram atualizados, nunca enfraquecidos -- um terceiro teste obsoleto
  (`case-detail-screen-hypotheses-tab.spec.ts`) precisou do mesmo ajuste, achado só na suíte
  completa.
  **Instabilidade de infraestrutura real**: vários agentes travaram (timeout de 600s) ou caíram por
  erro de API durante esta sweep -- mais que o normal, sem relação com o conteúdo pedido; todos
  recuperados com re-tentativas mais diretas/precisas, sem nenhuma perda de trabalho parcial (sempre
  verificado via `git status`/`git diff` antes de re-despachar).
  308/308 testes, 8/8 passos do build (`run/ux-consistency-sweep-full-suite`).
  Como esta sweep tocou 6 arquivos já vinculados por tasks anteriores de quase toda onda anterior
  (Ondas 1-6), rodei `/reconcile` sobre os 6 de uma vez: 24 nós julgados, 22 conformes e
  revinculados, **2 achados reais e não-bindáveis, disclosed** (nenhum causado por esta sweep,
  ambos pré-existentes, nunca corrigidos): `domain/knowledge/case-version` contradito pelo campo
  Subject sempre desabilitado em `case-version-editor-form-fields.tsx` (mesmo achado da Onda 3,
  ainda sem correção); `domain/knowledge/case-summary` contradito por `cases-list-screen.tsx`
  modelar `current_state`/`last_updated` como opcionais pro caso de zero versões, enquanto o nó
  exige os três atributos obrigatórios sem exceção declarada. Ambos ficaram sem bind (drift real,
  não escondido), com as duas rotas de resolução nomeadas sem escolher entre elas.
  Rota corretiva não inclui `/review-change` na própria tabela do framework -- as duas entregas
  desta sweep fecharam sem revisão. Tudo commitado (3 commits: entrega 3/3 + reconcile).

- **Onda 6 entregue, revisada e reconciliada -- fecha as 6 ondas do plano.** Usuário pediu
  explicitamente ("pode seguir para onda 6"). Antes de cortar a onda, o usuário reportou um bug
  visual real ao acessar uma tela já entregue (`.../manifest/hypotheses/limitacao-de-hardware`):
  checkboxes mostrando dois indicadores sobrepostos e Selects com altura diferente do Storybook do
  TUI. Diagnostiquei a causa raiz antes de tratar como incremento corretivo: `frontend/tui` é um
  git submodule, e a detecção automática de conteúdo do Tailwind v4 nunca escaneia pra dentro dele
  a partir do build do `frontend/app` -- qualquer classe usada só dentro do código do TUI e nunca
  repetida no app fica sem CSS compilado, silenciosamente, em toda tela já entregue. Corrigido com
  uma task corretiva (`task/case-authoring-console/tailwind-scans-the-tui-submodule`, rota "one
  wrong behavior in code already delivered" -- sem survey/decomposição, só o binder, que confirmou
  `implements: []`) adicionando uma diretiva `@source` no `tokens.css` do próprio app. Verificado
  empiricamente (rebuild real): `.sr-only`, `.h-9` e uma terceira classe (`.max-h-60`) passaram a
  compilar; 231/231 testes, nenhuma regressão. Um warning novo e inofensivo de build (o scanner do
  Tailwind lendo uma string parecida com classe dentro de um comentário do `date-picker.tsx` do
  TUI) foi disclosed, não suprimido. Esta rota do framework não inclui `/review-change` na sua
  própria tabela, então essa entrega fechou sem revisão.
  Planejamento da Onda 6: escopo com achados reais do backend (o glossário serve 5 vocabulários de
  termo, não 4 -- `subject-attribute` nunca lido antes; ambos os endpoints de listagem são
  paginados de verdade mas toda hook já entregue ignora paginação por convenção; `GET
  /v1/capabilities` já traz tudo que o painel de detalhe do wireframe precisa, então "clicar numa
  linha" é seleção client-side pura, nunca uma segunda leitura; não existe endpoint de detalhe por
  nome de capability, só por concept, e esta entrega nunca o chama). Epic novo
  `epic/glossary-and-capabilities-browser`, 3 tasks: `widen-glossary-vocabulary-union` (união
  `GlossaryVocabulary` ganha "subject-attribute", zero mudança de comportamento pros 6 consumidores
  já existentes), `capabilities-browser-screen` (hook novo `use-capabilities.ts`, primeira
  composição de clicar-linha-e-trocar-painel-de-detalhe deste código), `glossary-browser-screen`
  (hook novo `use-glossary-concepts.ts` preservando `ttl`, 6 abas compostas do mesmo jeito que
  `case-detail-screen.tsx` já compõe Tabs do TUI). Os 3 binders voltaram limpos, sem nota.
  Implementei `widen-glossary-vocabulary-union` e `capabilities-browser-screen` em paralelo
  (arquivos disjuntos), depois `glossary-browser-screen` sozinha (também toca `route-tree.tsx`).
  291/291 testes, 8/8 passos do build (`run/glossary-and-capabilities-browser-onda-6-full-suite`).
  A entrega de `widen-glossary-vocabulary-union` deixou 5 nós de trace obsoletos em
  `use-glossary-vocabulary.ts` (vinculados desde a Onda 3, restampados só pelos 2 nós que esta task
  implementa) -- `/reconcile` rodado, os 7 nós que o trace vincula a esse arquivo julgados, todos
  conformes, todos revinculados.
  `/review-change`: coverage 16/18 critérios cobertos, 1 não coberto (fato de union TypeScript que
  o Vitest não consegue verificar em runtime -- só o `tsc --noEmit` garante de verdade) + 1 parcial;
  0 achados de conformance; 5 achados de standard (EDG-02 -- tela de Capabilities sem botão Retry
  no erro, ao contrário da tela irmã de Glossary; 2x API-02 -- strings de erro genéricas
  hard-coded, não vindas de uma tabela compartilhada; ACC-07 -- painel de detalhe que aparece ao
  clicar numa linha sem `aria-live` nem foco movido, primeira vez que esse padrão aparece neste
  código; API-01 -- transform inline anônimo onde duas funções irmãs no mesmo arquivo já
  estabelecem um adaptador nomeado) -- nenhum bloqueante.
  Tudo commitado (4 commits: fix do Tailwind + entrega 3/3 + reconcile + review). **As 6 ondas do
  plano original estão fechadas.**

- **Onda 5 entregue e revisada, sem `/reconcile` necessário.** Usuário pediu explicitamente
  ("avança para onda 5", instrução recebida de forma abreviada) depois de eu ter fechado a Onda 4.
  Planejamento: escopo (`intake/onda-5-scope.md`, com 5 achados reais do backend confirmados por
  leitura direta do código: `POST .../release` não recebe corpo e responde 200 com a projeção
  completa de `read-case`, erros 404/409 `CaseVersionNotDraftAtReleaseError`/422
  `CaseVersionNotReleasableError`; a agregação de violações é real mas roda em duas metades
  mutuamente exclusivas -- estrutural, depois coerência -- corrigindo o próprio exemplo do
  wireframe de "múltiplas violações combinadas"; não existe endpoint de dry-run, então o checklist
  pré-Release é melhor-esforço no cliente para 3 dos itens do wireframe, excluindo deliberadamente
  o item de capability-readiness, território da Onda 6; `DELETE .../versions/{version}` (discard)
  também não recebe corpo, responde 204, reaproveita `CaseVersionNotDraftError` (sem classe própria
  para discard); discard confirmado como nunca apagando hypothesis-revisions), survey, epic
  `epic/version-editor` crescido pela 3ª vez (adicionando `manifest-entry`, `concept`,
  `a-case-has-at-least-one-hypothesis`, `only-a-draft-case-version-may-be-discarded`,
  `every-collected-concept-has-a-read-only-capability` -- este último ficou `uncovered` de
  propósito, pois checá-lo exigiria ler `domain/integration/capability`, que nenhuma task deste
  frontend toca ainda), 2 tasks (`release-draft-version`, `discard-draft-version`) vinculadas
  limpo na primeira tentativa dos dois binders, sem nota `underdetermined`/`BLOCKING`.
  Implementei e entreguei as 2 tasks **sequencialmente** (decisão deliberada, ao contrário da
  Onda 4: as duas tocam o mesmo par de arquivos -- `case-version-editor-ready-view.tsx` e
  `use-edit-draft-version-form.ts` -- então implementar em paralelo teria alto risco de conflito de
  edição não sincronizado): `release-draft-version` primeiro (checklist pré-Release
  calculado no cliente a partir de dados já carregados mais 4 releituras de glossário/concepts,
  Dialog TUI em lugar, POST único sem corpo, 200 vira o form permanentemente somente-leitura, 422
  renderiza as violações verbatim, 409 fecha o Dialog e relê a versão), depois
  `discard-draft-version` (Dialog TUI destrutivo com confirmação por digitação exata do slug,
  DELETE único sem corpo, 204 navega pro Case Detail, qualquer erro mantém o Dialog aberto com a
  mensagem real).
  **Cada task, ao ser adicionada, estourou o limite de 300 linhas do ESLint (`max-lines`) em
  `use-edit-draft-version-form.ts`** -- resolvido extraindo lógica pura pra novos módulos de
  serviço: `services/case-version-record.ts` e `services/release-checklist.ts` (pela entrega de
  release) e `services/discard-confirmation.ts` (pela entrega de discard, com um formato de
  extração diferente -- carrega também o objeto de opções da mutation e o literal do campo de
  retorno, não só computação pura, porque a lógica de discard é mais fina e a extração só-pura não
  teria fechado a folga sozinha).
  226/226 testes passando (31 arquivos), 8/8 passos do build capturados em
  `run/version-editor-onda-5-full-suite`. Verifiquei manualmente, antes de rodar `/review-change`,
  que os dois `bind-record` das novas entregas restamparam **todos** os nós que `edit-draft-version`
  (Onda 3) já tinha vinculado nos dois arquivos compartilhados -- zero drift `code` novo, então
  **nenhum `/reconcile` foi necessário desta vez** (ao contrário das Ondas 3 e 4, que sempre
  precisaram).
  `/review-change`: coverage 13/15 critérios cobertos, 2 parciais (o item de fallback do checklist
  só é exercitado contra `outcome`, nunca `action`/`recipient`; a alegação "desabilita todo campo"
  do 200 de sucesso só é exercitada para o campo Title e o botão Save); 2 achados de conformance
  (ambos em `release-checklist.ts` -- o rótulo "Fallback resolution is set" na verdade testa
  validade do termo no glossário, não presença do campo; o item de aceitação de concept confunde
  "concept não existe mais no glossário" com "concept existe mas rejeita o subject", duas regras
  diferentes sob um rótulo só); 3 achados de standard (2x TYP-04 -- `CaseVersionRecord.state`/
  `manifest` e o campo `release`/`discard` da fase "ready" modelados como campos opcionais
  independentes em vez de union discriminada -- e 1x API-04 -- array `violations` vazio do 422
  renderiza uma região de alerta em branco, sem texto explicativo) -- nenhum bloqueante.
  Trace: 7 achados de drift `code` pré-existentes, nenhum causado por esta entrega (confirmado por
  comparação direta de digest); 1 deles é a mesma constraint `no-route-enforces-authentication` em
  `app-shell.tsx` já duas vezes divulgada e deliberadamente não reconciliada nas Ondas 3 e 4 (esta
  onda não tocou esse arquivo); os outros 6 são do target backend, de outra iniciativa.
  Tudo commitado (2 commits: entrega 2/2 + review). Onda 6 (Glossary + Capabilities Browsers) é a
  última onda restante, pronta para cortar, independente das Ondas 2-5.

- **Onda 4 entregue, revisada e reconciliada.** Usuário pediu explicitamente ("pode continuar a
  onda 4") depois de eu ter fechado a Onda 3. Planejamento: escopo (`intake/onda-4-scope.md`,
  incluindo achados reais do backend confirmados por leitura direta do código: os quatro erros de
  domínio de `POST /v1/cases/{slug}/hypotheses` caem em 500 genérico, sem mapeamento em
  `status-map.ts`), survey, epic novo `epic/manifest-hypothesis-authoring`, 3 tasks
  (`revise-hypothesis-form`, `manifest-builder`, `hypotheses-tab`). Um binder voltou
  `underdetermined` sobre os dropdowns de resolution/referral não exigirem explicitamente vir do
  glossário -- corrigi adicionando o critério faltante e re-vinculei.
  Implementei e entreguei as 3 tasks (`revise-hypothesis-form` primeiro, depois
  `manifest-builder`/`hypotheses-tab` em paralelo, ambas dependendo só da primeira): formulário
  compartilhado Nova hipótese/Revise (rota estática `.../hypotheses/new` distinta da rota
  parametrizada `$hypothesisName`, mesma convenção de "versions/new"), Manifest Builder
  (reordenar/remover via PUT/DELETE reais, diálogo de confirmação, banner de conflito), aba
  Hypotheses no Case Detail (lista + histórico de revisões current/frozen).
  **Dois bugs reais encontrados e corrigidos durante a entrega**: `apiFetch` quebrava em qualquer
  resposta `204` (exatamente o que os dois endpoints de manifest retornam); e um crash real de
  "duas cópias de React" ao usar Tooltip/Dialog do TUI pela primeira vez (as dependências deles,
  `@radix-ui/*`, resolvem `react` do `node_modules` próprio do TUI, não do app) -- corrigido com
  aliases/`deps.inline` no `vite.config.ts` mais um symlink de ambiente, ambos documentados como
  divergência no registro de `manifest-builder`.
  **Achado real de produto, não bug desta entrega**: o backend recusa trocar duas posições já
  ocupadas num único PUT -- um clique de ▲/▼ num manifest compacto normal vai bater nesse 409 quase
  sempre. Já previsto no próprio texto do wireframe e coberto pelos critérios 4/5 da task.
  189/189 testes passando, 8/8 passos do build. `/review-change`: 1 achado de conformance (tooltip
  de Remove nomeia a regra em termos de "case" em vez de "manifest") + 3 de standard (duas
  inconsistências dentro do próprio `case-detail-screen.tsx` -- a aba Versions não tem retry nem
  estado vazio que a aba Hypotheses já tem; um erro inline sem `role="alert"`) -- nenhum
  bloqueante.
  Como as tasks tocaram `case-detail-screen.tsx` e `app-shell.tsx` (já vinculados por ondas
  anteriores), rodei `/reconcile`: os 6 nós de `case-detail-screen.tsx` foram limpos e rebindados;
  `constraints/no-route-enforces-authentication` em `app-shell.tsx` continua sem bind (mesmo
  achado pré-existente da Onda 3, não causado por esta onda).
- **Onda 3 entregue, revisada e reconciliada.** Usuário pediu explicitamente ("pode iniciar a onda
  3") depois de eu ter fechado a Onda 2. Planejamento: escopo (`intake/onda-3-scope.md`, incluindo
  a decisão herdada do fechamento da Onda 2 de que "New draft" entra aqui como Version Editor em
  branco), survey, epic novo `epic/version-editor`, 2 tasks (`edit-draft-version`,
  `new-draft-creation`). O binder de `edit-draft-version` levantou 2 notas: `unstated` sobre o
  texto do banner de conflito (resolvido `stated` por um `unstated-fact-decider` cego à task --
  já citado verbatim em `docs/frontend-triage-console-proposal.md` §2.3 e na própria
  `intake/onda-3-scope.md`, sem escrever nó novo) e `underdetermined` sobre `consolidation_register`
  (resolvido adicionando `domain/knowledge/consolidation-register` ao candidate set do epic e
  re-rodando os 2 binders). O re-run reclassificou `rules/knowledge/validation-runs-at-every-read`
  como não implementado por nenhuma task (só citado informalmente na rationale) -- movido pro
  `uncovered` do epic.
  Implementei e entreguei as 2 tasks: `edit-draft-version` (form full-replace via `PATCH`, máquina
  clean/dirty/saving/conflict, banner de conflito ligado a dados reais, 404→Cases List) e
  `new-draft-creation` (form em branco, primeiro Save chama `POST /v1/cases`, troca em lugar pro
  fluxo de edição sem reler via GET por causa do risco `manifest.min(1)`, 409
  `CaseAlreadyHasDraftError` tratado com toast+redirect). 125/125 testes passando (17 arquivos,
  incluindo split de 2 arquivos de teste que passaram do limite de 300 linhas do ESLint), 8/8
  passos do build. `/review-change` rodado: 3 achados de conformance (campo subject sempre
  desabilitado sem nó que autorize a exceção, texto do banner de conflito só em código, vocabulário
  de `consolidation_register` duplicado à mão) + 2 de standard (ACC-07 sem aria-live no indicador
  de save, API-04 tabela vazia sem mensagem -- já apontado na Onda 2, ainda presente) -- nenhum
  bloqueante.
  `new-draft-creation` tocou `case-detail-screen.tsx` e `app-shell.tsx`, que já tinham binding de
  tasks anteriores (Onda 2 e Onda 1) -- isso deixou 3 bindings "code drift" (bind só restampa os
  nós da própria task). Rodei `/reconcile`: os 2 nós de `case-detail-screen.tsx` (que a
  Onda 2 já vinha vinculando) foram julgados de novo e limpos, rebindados. O nó
  `constraints/no-route-enforces-authentication` em `app-shell.tsx` **não** foi limpo -- achado
  real e pré-existente (o texto "No auth in this build" é uma segunda casa pro fato que a
  constraint já declara), não causado por esta task; ficou sem bind, `trace.py --check` continua
  reportando, e o registro do reconcile diz que a rota é um incremento corretivo via `/plan-work`,
  nunca um `/analyse` (a specification já afirma o fato).
- **Onda 2 entregue e revisada.** Usuário pediu explicitamente para retomar ("retome a onda 2,
  termine todo o planejamento da Onda 2 para então iniciar as tasks") depois do cancelamento do
  goal. Terminei o vínculo à especificação das 3 tasks pendentes, decidi (via
  `unstated-fact-decider`, cego ao corte, 2 tentativas -- a 1ª deixou `domain/knowledge/case-summary`
  órfão, sem nada que o referenciasse; a 2ª corrigiu isso pedindo a regra de derivação junto)
  `domain/knowledge/case-summary` + `rules/knowledge/a-case-summary-is-derived-from-its-existing-versions`
  pro fato que a listagem de casos precisa (estado/contagem/atualização, que o `GET /v1/cases` real
  não retorna -- só `{slug}` -- só as versões de cada caso guardam isso).
  Implementei e entreguei 3 tasks: `dev-proxy-for-backend-api` (proxy real testado com `curl`
  através de `localhost:5173`, confirmando dados reais do backend sem erro de CORS),
  `case-detail-timeline` (timeline real via `GET /v1/cases/:slug/versions`) e `cases-list-screen`
  (lista real via `GET /v1/cases`, com estado/versões/atualização derivados por caso). 89/89 testes
  passando, 8/8 passos do build. `/review-change` rodado: 2 achados de conformance (o enum
  `CaseVersionState` duplicado em dois arquivos, deveria vir de uma fonte só) + 5 achados de
  standard (2x EDG-02 sem retry no erro, 1x API-04 tabela vazia sem mensagem, 1x PRF-02 memo
  prematuro, 1x ACC-07 sem aria-live na busca) -- nenhum bloqueante.
  **4ª task (`case-detail-new-draft-action`) removida do plano**: o `task-implementer` recusou
  corretamente escrevê-la -- `POST /v1/cases` real exige `title`, `when_to_use`, `authored_at`,
  `subject` e `fallback`, todos obrigatórios (confirmado no schema real do backend), não só
  `{slug}` como a proposta original (seção 2.2) e o plano assumiam. Decisão: adiar a criação de
  draft pra Onda 3 (Version Editor), que já vai construir esse mesmo formulário pra editar via
  PATCH full-replace. Epic ajustado (`case-lifecycle`/`a-case-has-at-most-one-draft` voltaram pra
  `uncovered`), decisão completa em `temp/frontend-console-decisions.md`.
  Tudo commitado (2 commits: entrega 3/4 + review).

- **Goal cancelado pelo usuário** ("cancele o goal") durante o corte da Onda 2. Estado exato no
  momento: `/plan-work` tinha escrito e validado `intake/onda-2-scope.md`,
  `inventory/frontend-cases-list-detail-foundation.md` e `epic/cases-list-and-detail.md`; 4
  skeletons de task decompostos (não persistidos); só 1 de 4 `execution-contract-binder`
  terminou (`dev-proxy-for-backend-api`, `implements: []`); os outros 3 foram interrompidos
  pelo usuário sem responder. Nenhuma task foi escrita, nenhum `plan.json` foi derivado, nada
  foi implementado para a Onda 2. Loop autônomo parado via `ScheduleWakeup(stop: true)`.
  Servidores efêmeros de verificação (`node dist/index.js` na porta 3000, `npx vite` na porta
  5173) seguem rodando neste shell -- não fazem parte de nenhum artefato commitado.

- Onda 1: **`/review-change` completo e commitado** (`review/frontend-console-foundation-onda-1.md`).
  2 achados, nenhum bloqueante: (1) standard/API-02 -- `query-client.ts`'s onError joga a mensagem
  crua do erro no toast em vez de passar por `error-ui-state.ts` (o módulo que existe exatamente
  pra isso); (2) conformance -- o texto "No auth in this build" em `app-shell.tsx` é uma segunda
  casa do fato que `constraints/no-route-enforces-authentication` já guarda (rastreável ao material
  original, não inventado, mas o nó não referencia de volta essa obrigação de UI). Coverage: 37
  critérios -- 22 covered, 10 partial, 5 uncovered (incluindo o critério `met: false` já disclosed
  do conflict-banner, que é esperado, não um furo). Trace: 1 bind novo e limpo (`app-shell` ->
  `constraints/no-route-enforces-authentication`, via `trace.py --bind-record`, que o
  `/implement-task` original não tinha feito); 6 achados de drift `code` pré-existentes no target
  backend, sem relação com esta entrega. Delivery raiz e onda 1 inteira commitados em dois commits.
  Próximo passo: tentar `npm run dev` e confirmar conexão real com o backend (condição terminal do
  `/goal`), depois iniciar a Onda 2 (`/plan-work`) via `deliver.py --outstanding`.

- Onda 1: **8/8 tasks entregues** (app-shell, query-client-and-toaster, error-to-ui-state-table
  implementadas nesta rodada, completando as 5 já entregues). `deliver.py --check` limpo,
  `delivery.json` rederivado: 9 implementation, 8 proof, 1 review; **9/9 tasks do work root inteiro
  têm registro** (8 de frontend-console-foundation + build-substrate da onda 0).
  Suíte completa final: `run/frontend-console-foundation-onda-1-full-suite-2` (71/71 testes, 8/8
  passos). Pendências honestamente registradas, não escondidas:
  - `conflict-banner`: critério "reuses Banner's accent prop" ficou `met: false` de propósito --
    `frame="notched"` (única forma de ativar o accent) quebra o landmark ARIA "banner" e duplica o
    heading (comportamento documentado do próprio TUI); decisão em decisions.md.
  - `app-shell`'s proof usa um roteador de teste próprio (3 rotas), não a árvore de produção de 10
    rotas -- só "/cases" e "/glossary" têm o label real da tabela de produção testado.
  - `query-client-and-toaster`'s proof não exercita o QueryClientProvider real de main.tsx (testa
    AppShell isolado); a versão pinada do pacote é um fato de manifesto, não testado em runtime.
  Achados adicionais documentados em decisions.md: `router.routeTree.options.component` deixou de
  ser `undefined` (app-shell mudou isso de propósito) -- proof de router-skeleton reescrita (5->4
  testes) via o modo de "re-entrega mais estreita" do implement-task (implementation intocada).
  Próximo passo: `/review-change` sobre a onda 1 inteira, depois tentar rodar `npm run dev` e
  confirmar conexão real com o backend (condição terminal do /goal).

- Onda 1: 5/8 tasks com implementation + proof completos e validados (`deliver.py --check` limpo,
  `delivery.json` rederivado: 6 implementation, 5 proof, 1 review; 6/9 tasks do work root inteiro já
  têm registro). Suíte completa (8 passos: install/typecheck/lint/style/build/a11y/secret-scan/test)
  passou por completo pela primeira vez nesta onda em
  `run/frontend-console-foundation-onda-1-independent-suite-3` (44/44 testes). Achados reais no
  caminho (documentados em full em temp/frontend-console-decisions.md):
  - `ApiError.details` sempre existia como propriedade própria mesmo sem `details` no envelope --
    `useDefineForClassFields` + campo de classe comum; corrigido com `declare readonly details?`.
  - `ConflictBanner`'s `accent="danger"` era mesmo um no-op sob `frame="none"`; a tentativa de
    corrigir com `frame="notched"` foi REVERTIDA depois de rodar o teste de verdade -- duplicava o
    heading e trocava o landmark "banner" por "region" (comportamento documentado do próprio TUI).
    Critério da task ficou `met: false`, honestamente, com a divergência registrada -- não inventei
    um jeito de "passar" o critério.
  - linha clicável de `StatusTable` usa `role="button"`, não o "row" implícito -- os testes
    precisavam de `getAllByRole("button")`, não `getAllByRole("row")`, para linhas clicáveis.
  - 21 erros de lint (`eslint-plugin-testing-library`: no-manual-cleanup, no-node-access,
    no-container) resolvidos ligando `test.globals: true` (auto-cleanup) e reescrevendo os specs
    para queries nativas do Testing Library, com 2 suppressions disclosed (aria-hidden, ver
    decisions.md) para o indicador de cor decorativo, que nenhuma query de acessibilidade alcança.
  Restam 3/8 tasks (app-shell, query-client-and-toaster, error-to-ui-state-table) -- dependem uma da
  outra em cadeia e ainda não foram implementadas.

- Onda 1: jsdom autorizado no standard (pin sha256:b65918f3...) e sendo ligado no vite.config.ts --
  decisão: atribuir essa correção à entrega de `app-shell` (ainda não implementada), não reabrir
  router-skeleton/conflict-banner/status-table já validadas. Depois de ligado, refazer os testes
  de conflict-banner e status-table pra provar render real em vez de só "é uma função exportada".
- Onda 1: 4/5 provas escritas e válidas (telemetry, conflict-banner, typed-api-client,
  router-skeleton). reusable-status-table's test content já veio do agente, mas vou escrever o
  registro só depois de religar o jsdom e atualizar esse teste (e o de conflict-banner) pra
  render real, evitando escrever e já reescrever (telemetry, conflict-banner, typed-api-client,
  router-skeleton). reusable-status-table na 3a tentativa (conteúdo mínimo fornecido no prompt).
  ACHADO PENDENTE DE DECISÃO: nenhum ambiente DOM (jsdom/happy-dom) está autorizado no standard --
  todo componente React desta e das próximas ondas só pode provar "é uma função exportada", nunca
  render real (click, texto, composição visual). Vale decidir antes da Onda 2 (que já é toda
  telas React) se autoriza um dos dois.

- Onda 1: 5 tasks independentes com implementation records completos e validados (run que passou:
  frontend-console-foundation-onda-1-independent-build-4, todos os 7 passos). Corrigido no caminho:
  alias @/shared muito estreito (Banner precisa de Panel), 3 casts de tipo guardados sinalizados
  pela regra genérica (TYP-02), 2 comentários eslint-disable mal posicionados (mesmo bug 2x --
  eslint-disable-next-line só suprime a linha imediatamente seguinte, não através de blocos de
  comentário multi-linha). 5 test-authors rodando agora (proof records). app-shell,
  query-client-and-toaster, error-to-ui-state-table ainda não implementadas (dependem das
  anteriores).

- Onda 1: typed-api-client e telemetry-catalog-hook -- registros de implementação escritos (sem
  `run` ainda, falta o build capturado). router-skeleton e reusable-status-table têm arquivos
  completos no disco, só faltando confirmação/registro. conflict-banner ainda sem arquivo (3
  tentativas travadas) -- 4a tentativa com conteúdo exato no prompt. NOTA: vários agentes
  travaram (timeout de 600s) nesta onda, mais que o normal -- parece instabilidade de
  infraestrutura, não do conteúdo pedido (vários retries com arquivo já pronto só precisavam
  confirmar e mesmo assim travaram uma vez antes de responder na 2a/3a tentativa).

- Onda 1: plano completo commitado (8 tasks + epic/frontend-console-foundation). Novo constraint
  na specification: constraints/no-route-enforces-authentication (outcome "stated", achado no
  próprio material -- sem entrada no decision-log). app-shell implementa esse nó.
  NOTICED (não decidido, watch item): a proposta também assume persona única implicitamente --
  fato relacionado, não tratado ainda.
  5 task-implementers rodando em paralelo: router-skeleton, typed-api-client, conflict-banner,
  telemetry-catalog-hook, reusable-status-table (as 5 sem dependência, deliverable now).

- Onda 1: 7/8 tasks escritas e válidas (router-skeleton, query-client-and-toaster,
  typed-api-client, error-to-ui-state-table, conflict-banner, telemetry-catalog-hook,
  reusable-status-table). app-shell pendente: binder achou fato não-declarado ("backend sem
  autenticação em nenhuma rota") -- unstated-fact-decider rodando (2 tentativas travaram por
  timeout, 3a em andamento).

- Onda 1: epic/frontend-console-foundation escrito e válido. 8 tasks decompostas
  (router-skeleton, app-shell, query-client-and-toaster, typed-api-client,
  error-to-ui-state-table, conflict-banner, telemetry-catalog-hook, reusable-status-table).
  8 execution-contract-binders rodando em paralelo.
- Onda 1: standard já expandido (5 pacotes, pin sha256:154d391b...), scope persistido em
  work/frontend-bootstrap/intake/onda-1-scope.md, codebase-surveyor rodou (achou Table/Alert/
  Banner/Breadcrumb no TUI, nenhum sidebar/nav -- construção nova).
