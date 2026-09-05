# Hipótese com release próprio, desacoplado do manifest

Material para `/analyse`. Escrito em 2026-09-03 a partir de uma conversa com o dono do produto e da
leitura do código em `src/` e `frontend/app/` e da especificação em `knowledge/`. A seção "como está
hoje" foi verificada no código e nos nós; a seção "decisão" é o que o produto quer passar a valer.
Este documento é autossuficiente — não presume que a sessão que o lê tenha acesso à conversa que o
originou.

## 1. Problema relatado pelo produto

> "Eu quero poder salvar e testar uma hipótese dentro de um caso, sem precisar subir uma versão. Da
> forma que está, para eu testar um caso, eu preciso alterar o manifest — e isso pina a versão.
> [...] Para simular, eu preciso alterar o manifest. E alterar no manifest, a hipótese
> automaticamente passa a estar released."

Depois de investigar o código com o produto, a leitura literal ("alterar o manifest libera a
hipótese") não bate com o que o código faz hoje — ver seção 3. A dor real, confirmada com o produto,
é outra: **hoje não existe nenhum estado próprio da hipótese**. O que hoje impede uma revisão de ser
sobrescrita não é uma decisão da própria hipótese, é um efeito colateral de outro agregado: a revisão
trava quando *algum caso* que a referencia é released — um caso qualquer, não necessariamente o que o
curador está editando. Isso é frágil e imprevisível: uma edição que funcionava ontem (sobrescreve no
lugar) pode parar de funcionar hoje sem que o curador tenha feito nada, só porque outro caso, em
paralelo, foi released e passou a referenciar aquela revisão.

A proposta do produto resolve isso invertendo a dependência: a hipótese passa a ter um estado
próprio, controlado por uma ação própria (um botão, na tela da hipótese), e o manifest do caso passa
a ser **só seleção** — nunca aciona nem sofre efeito de liberação.

## 2. Como está hoje na especificação (`knowledge/`)

Nós lidos e o que cada um afirma:

- `domain/knowledge/hypothesis-revision` (aggregate-root) — "um estado numerado do conteúdo de uma
  hipótese". Atributos: `revision`, `criterion`, `collects`, `resolution`. **Não tem atributo de
  estado.**
- `domain/knowledge/case-version` — tem `state`, enumerado por `domain/knowledge/case-version-state`
  (`draft`, `released`). O estado pertence à **versão do caso**, não à hipótese nem à revisão.
- `domain/knowledge/manifest-entry` (value-object) — `position` + referência a exatamente uma
  `hypothesis-revision`. Não carrega estado de liberação.
- `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased.md` (policy) — hoje decide:
  revisar uma hipótese que já tem revisão sobrescreve a mais alta existente no lugar, **a menos que
  essa revisão esteja referenciada por qualquer versão de caso em estado released**, caso em que cria
  a próxima revisão. A própria descrição do nó admite a fragilidade que este documento quer resolver:
  > "This is a policy rather than an invariant because the fact it turns on belongs to a different
  > aggregate than the one it writes to: whether the highest revision is frozen is answered by
  > reading every case version that might reference it, not by anything the hypothesis or the
  > revision itself declares."
- `rules/knowledge/a-released-hypothesis-revision-is-never-altered.md` (policy) — "A
  hypothesis-revision referenced by any case version in released state is never altered again." É a
  metade complementar da regra acima, mesma fonte de fragilidade.
- `rules/knowledge/a-hypothesis-revision-number-is-never-reused.md` (policy) — primeira revisão é 1;
  cada revisão nova é exatamente uma acima da maior existente; número nunca reutilizado, revisão
  nunca descartada. **Continua valendo sem alteração.**
- `rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.md` (policy) — revisar exige
  que o caso tenha um draft aberto; sem draft, 409 `CaseHoldsNoDraftError`. Avaliar se continua
  fazendo sentido depois da mudança — ver seção 5, variação A.
- `rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused.md` (policy) —
  `simulate-hypothesis` só aceita um nome que já esteja no manifest da versão nomeada. **Continua
  valendo**: o produto confirmou que o manifest é o lugar certo de selecionar a revisão a simular,
  não quer um caminho de simulação que ignore o manifest.
- `contracts/investigation/case-simulation` — simulação aberta a versão do caso em qualquer estado,
  draft ou released. **Continua valendo.**
- `rules/knowledge/a-case-version-is-written-once.md` (invariant) — versão released e suas entradas
  de manifest nunca mudam depois de released. **Continua valendo**, é a base da variação D em §4.

Leitura consolidada: a especificação hoje não reconhece nenhum estado próprio de hipótese ou de
revisão — a única noção de "liberada" existe indiretamente, lida a partir do estado de versões de
caso que a referenciam.

## 3. Como está hoje no código (verificado)

- `src/src/case/hypothesis-revision-release-state.port.ts` — `IHighestRevisionReleaseStateQuery`,
  resposta `{ revision: undefined } | { revision: number; released_referenced: boolean }`.
- `src/src/persistence/relational-case-store.repository.ts:494-514`
  (`highestRevisionReleaseStateSelect`) — `released_referenced` é um `EXISTS` que junta
  `case_version_hypotheses` com `case_versions` filtrando `cv.state = 'released'`. Confirma: o
  "released" de uma revisão é lido de qualquer caso que a referencia, nunca gravado na própria
  revisão.
- `src/src/case/revise-hypothesis.operation.ts:38-45` (`writeRevision`) — se a revisão mais alta
  existe e **não** está `released_referenced`, sobrescreve (`overwriteHypothesisRevision`) e mantém o
  número; senão, insere revisão nova.
- `src/src/persistence/relational-case-store.repository.ts:648-666` — o overwrite físico dispara
  `ReleasedHypothesisRevisionNotAlterableError` se a constraint do banco recusar (revisão já
  referenciada por caso released).
- `frontend/app/src/hooks/use-manifest-builder.ts:87-101` — `PUT
  /v1/cases/:slug/versions/:version/manifest/:hypothesis_name` (`placeHypothesis`) só é aceito
  quando a versão é draft (senão `case-version-not-draft`, ver linhas 115-121). **Verificado: essa
  gravação não libera nada** — não existe nenhum caminho de código, hoje, em que colocar uma entrada
  no manifest de um draft congele a revisão referenciada. O congelamento só acontece via
  `ReleaseOperation.release()` do **caso** (`src/src/case/release.operation.ts:24-32`), que muda o
  estado da versão do caso para released — e é essa mudança, lida de volta pela query acima, que
  passa a proteger a revisão.
- `src/src/case/release.operation.ts` — hoje não faz nenhuma checagem sobre o estado das hipóteses
  do manifest antes de liberar o caso; só checa `state === 'draft'` (refuseNonDraft) e violações
  estruturais/de coerência (`caseCoherenceViolations`).
- Não existe hoje nenhuma tabela, coluna, endpoint ou rota de "release de hipótese" — não existe
  ação equivalente a `ReleaseOperation` para hipótese.

## 4. Decisão — comportamento a partir de agora

### Hipótese (revisão)

- Ganha estado próprio: `draft` → `released`. Transição única, nunca volta.
- Release é uma **ação própria do usuário**, disparada na tela da hipótese (fora do contexto de
  qualquer caso específico) — **não** exige que a hipótese esteja em nenhum manifest.
- Editar uma revisão em `draft`: sobrescreve no lugar, mesmo número (comportamento já existente,
  agora decidido pelo estado da própria revisão, não por leitura cruzada de outro agregado).
- Editar uma revisão `released`: sempre cria a revisão seguinte, em `draft` (comportamento já
  existente na prática, agora com a mesma origem de decisão).
- `a-hypothesis-revision-number-is-never-reused` continua valendo sem alteração.

### Manifest (dentro de um caso em draft)

- Continua apontando `{position, hypothesis, revision}`. A revisão apontada pode estar em `draft` ou
  em `released` — nenhuma restrição no ato de apontar.
- Apontar (`place-hypothesis`) nunca libera nem congela nada, em nenhuma hipótese. É sempre livre e
  reversível enquanto o caso estiver em draft.
- Remover do manifest uma entrada cuja hipótese nunca foi liberada: livre, sem restrição nova.
- `simulate-hypothesis` continua exigindo que a hipótese esteja no manifest da versão nomeada
  (regra `a-simulated-hypothesis-absent-from-the-manifest-is-refused`, inalterada) — simular usa o
  que estiver apontado, seja `draft` ou `released`.
- Caso released: manifest não edita mais (comportamento já existente, `a-case-version-is-written-once`
  inalterada) — só um novo draft muda a seleção.

### Caso (versão)

- Continua `draft` → `released`, nunca volta (comportamento já existente).
- `ReleaseOperation.release()` ganha uma checagem nova: **toda** entrada do manifest da versão deve
  apontar para uma revisão em estado `released`. Se qualquer entrada apontar para uma revisão em
  `draft`, o release inteiro é recusado — o caso permanece em draft.
- A recusa **bloqueia tudo de uma vez** (decisão do produto): não libera parcialmente. A resposta de
  erro deve listar quais hipóteses do manifest ainda estão em draft, para o usuário liberar cada uma
  e tentar de novo.
- Um novo draft criado a partir de uma versão released copia o manifest, apontando inicialmente para
  as mesmas revisões (todas já `released`, por definição da regra acima).

## 5. Variações já decididas pelo produto

- **Hipótese liberada sem nunca ter sido usada em nenhum manifest**: permitido. Release de hipótese
  não depende de estar referenciada em caso nenhum.
- **Remover do manifest uma hipótese não liberada**: livre, sem restrição.
- **Repin do manifest depois do caso já released**: não existe — caso released não edita manifest;
  só um novo draft. Comportamento já existente, confirmado que continua.
- **Dado existente**: pode ser descartado / recriado do zero. Não há necessidade de migração — o
  produto confirmou explicitamente que os dados atuais **podem ser excluídos**, então nenhuma
  decisão é necessária sobre revisões hoje "congeladas" apenas por referência indireta.
- **UI**: o botão de release da hipótese fica na tela da própria hipótese (fora do contexto de
  manifest/caso).

## 6. Pontos em aberto para a análise decidir

Não foram fechados na conversa com o produto; ficam para `/analyse` decidir e registrar no
decision-log, ou para o produto decidir antes se preferir:

- **A.** `a-hypothesis-is-revised-only-against-its-cases-draft` hoje exige um draft do caso para
  revisar uma hipótese. Com hipótese ganhando ciclo de vida próprio e podendo ser liberada fora de
  qualquer caso, essa exigência ainda faz sentido, ou revisar uma hipótese deveria valer
  independentemente de o caso ter draft aberto?
- **B.** Uma hipótese pode ser "removida"/descontinuada depois de liberada, ou uma vez liberada ela
  só ganha revisões novas para sempre (igual à revisão em si, que nunca é descartada)?
- **C.** A tela de listagem de hipóteses/revisões (`a-hypothesis-revisions-listing-answers-highest-
  revision-first`, `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis`) deve exibir o
  estado (`draft`/`released`) de cada revisão listada? O produto não descreveu a UI dessa tela, só a
  da tela de release em si (§5).
- **D.** Formato exato da resposta de recusa do release do caso (item "bloqueia tudo" em §4): o
  produto pediu que liste as hipóteses pendentes, mas o formato (corpo do erro 409, código de erro
  novo, etc.) fica para a análise decidir seguindo o padrão dos erros já existentes
  (`CaseVersionNotReleasableError` já lista violações de coerência de forma parecida — ver
  `release.operation.ts:26-30` — o padrão para "hipóteses do manifest ainda em draft" deveria seguir
  esse mesmo formato).

## 7. Fora de escopo (confirmado com o produto)

- Migração de dado existente.
- Simulação sem gravar no manifest (o produto confirmou que o manifest é o lugar certo de seleção;
  a dor não era essa).
- Qualquer mudança no versionamento numérico do caso (`next_version` incrementar a cada draft) — o
  produto disse explicitamente que isso "pode ficar assim".
