# Entendimento: revisão de hipótese editável até a publicação

Material para `/analyse`. Escrito em 2026-09-02 a partir da leitura da especificação em `knowledge/`
e do código em `src/` e `frontend/app/`. Tudo que está na seção "como está hoje" foi verificado nos
nós e no código; a seção "decisão" é o que o produto quer passar a valer.

## 1. Problema observado

Na tela de edição de hipótese (`/cases/<slug>`, editor da hipótese dentro do draft), cada clique em
salvar cria uma nova revisão numerada da hipótese. Um curador que ajusta o texto do critério cinco
vezes antes de publicar deixa cinco revisões na história, das quais só a última interessa.

Consequências observadas:

- A lista de revisões da hipótese cresce sem relação com o número de publicações do caso.
- O manifesto do draft **não** passa a apontar para a revisão recém-criada. Depois de salvar, a tela
  oferece abrir o manifest builder para o curador repinar a entrada manualmente. Cada salvamento
  gera, portanto, um segundo passo de repin, ou deixa a entrada do draft apontando para uma revisão
  que já não é a mais alta, com o aviso "existe revisão mais alta" ligado.
- A tela de simulação, que lê o manifesto do draft, continua simulando a revisão antiga até o repin.

## 2. Como está hoje na especificação

Nós lidos e o que cada um afirma:

- `domain/knowledge/hypothesis-revision` (aggregate-root): "um estado numerado do conteúdo de uma
  hipótese". Atributos: `revision`, `criterion`, `collects`, `resolution`. Não tem atributo de
  estado. Descrição: "Once any case version in released state manifests it, this content never
  changes again — a further edit always creates the next revision instead".
- `domain/knowledge/hypothesis` (aggregate-root, operação `revise`): "revising a hypothesis never
  changes this name, it only adds a new revision for a case version's manifest to adopt".
- `domain/knowledge/case-version-state` (enumeration): `draft`, `released`. O estado pertence à
  **versão do caso**, não à revisão.
- `domain/knowledge/manifest-entry` (value-object): `position` + referência a exatamente uma
  `hypothesis-revision`. "Nothing moves that pin on its own."
- `contracts/knowledge/case-lifecycle`: operações `create-draft`, `revise-hypothesis`,
  `place-hypothesis`, `remove-hypothesis`, `update-draft`, `release`, `discard`. Não há operação de
  alterar uma revisão existente.
- `rules/knowledge/a-hypothesis-revision-number-is-never-reused` (policy): primeira revisão é 1;
  cada revisão posterior é exatamente uma acima da maior existente; um número nunca é reutilizado.
  Uma revisão nunca é descartada.
- `rules/knowledge/a-released-hypothesis-revision-is-never-altered` (policy): "A hypothesis-revision
  referenced by any case version in released state is never altered again." A proteção é
  condicionada a haver uma versão **released** que a referencie.
- `rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft` (policy): revisar exige
  que o caso tenha um draft; a checagem de aceitação de conceito usa o subject type desse draft;
  sem draft, 409 `CaseHoldsNoDraftError`.
- `rules/knowledge/a-case-has-at-most-one-draft` (policy): um caso tem no máximo um draft por vez.
- `rules/knowledge/a-case-version-is-written-once` (invariant): versão released e suas entradas de
  manifesto nunca mudam; revisar conteúdo compõe o próximo draft.
- `rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` e
  `rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown`: a entrada apresentada diz se
  a revisão pinada é a mais alta e sempre mostra qual revisão pina.
- `rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first` (invariant):
  listagem de revisões em ordem decrescente.
- `scenarios/knowledge/a-released-version-keeps-its-original-revision`: versão 1 released continua
  lendo a revisão 1 mesmo depois de a versão 2 adotar a revisão 2.
- `contracts/investigation/case-simulation`: simulação aberta a versão em qualquer estado, draft ou
  released; `simulate-hypothesis` só exige que a hipótese esteja no manifesto da versão nomeada.
- `scenarios/investigation/a-draft-case-version-is-simulated`: um draft em revisão vale ser
  julgado antes de publicar.
- `rules/investigation/a-simulation-result-is-stale-once-its-source-changes` (policy): o resultado
  fica stale quando a versão do caso, ou uma revisão que ela manifesta, muda depois do resultado.
  A regra não fixa mecanismo de detecção; admite "toda volta da edição" como resposta mais grossa,
  desde que uma mudança real nunca seja perdida.
- `scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result`: ao voltar ao
  cockpit depois de editar, o resultado mostrado é marcado stale e o curador é avisado.

Leitura consolidada: a especificação decide que **toda** revisão cria o número seguinte, e é
silenciosa sobre alterar no lugar uma revisão que nenhuma versão released referencia. A única regra
de imutabilidade que existe não alcança essa revisão.

## 3. Como está hoje no código (verificado)

- `POST /v1/cases/:slug/hypotheses` é a operação `revise-hypothesis`. O corpo leva
  `hypothesis_name`, `criterion`, `collects`, `resolution`, `subject`. A operação chama
  `insertHypothesisRevision` e devolve `{ hypothesis_name, revision }`. Sempre insere.
- O hook de formulário no frontend faz esse POST a cada salvamento e, em sucesso, mostra a fase
  "success" com a ação de abrir o manifest builder. Não chama `place-hypothesis`.
- `PUT /v1/cases/:slug/versions/:version/manifest/:hypothesis_name` é `place-hypothesis`, usada
  pelo repin entregue na iniciativa `manifest-revision-repin`.
- A simulação de uma hipótese lê a versão nomeada na URL, estreita o caso à entrada do manifesto
  com aquele nome e coleta e julga só a revisão que essa entrada pina.

## 4. Decisão do produto

**Uma revisão de hipótese permanece editável no lugar enquanto nenhuma versão released a referencia.
No momento em que uma versão released a adota, ela congela, e o próximo salvamento cria a revisão
seguinte.**

Em outras palavras: o "draft" de uma revisão não é um estado novo; é derivado de quem a referencia.
Isso espelha exatamente a semântica que a versão do caso já tem (compõe-se livremente enquanto
draft, congela ao publicar), sem criar um segundo ciclo de vida para o curador administrar.

Alternativas consideradas e descartadas:

- **Estado explícito na revisão** (enumeração própria + ato de confirmação): dois ciclos de vida
  para coordenar, um passo a mais para o curador, e nada que a derivação acima não responda.
- **Manter e só esconder o ruído na listagem**: não resolve o crescimento nem o repin a cada
  salvamento.

## 5. O que passa a valer (proposta de fatos para os nós)

### 5.1 Alvo do salvamento

`revise-hypothesis` continua sendo a única operação de escrita de conteúdo de hipótese, e o
salvamento na tela continua sendo um só ato. O que muda é em qual revisão ela escreve:

- Se a hipótese não tem revisão alguma, cria a revisão 1.
- Se a revisão mais alta da hipótese **não** é referenciada por nenhuma versão released, o conteúdo
  dessa revisão é substituído, e o número não muda.
- Se a revisão mais alta é referenciada por alguma versão released, cria a revisão seguinte
  (comportamento atual).

A checagem de aceitação de conceito contra o subject type do draft, e a exigência de haver um draft,
continuam valendo em todos os três ramos.

### 5.2 O que não muda

- Números nunca são reutilizados e revisões nunca são descartadas. Sobrescrever conteúdo não é
  reutilizar número.
- Uma revisão referenciada por versão released nunca muda. A regra já existente passa a ser a
  condição que decide entre sobrescrever e criar.
- Versão released e seu manifesto são escritos uma vez.
- A entrada do manifesto pina uma revisão e nada a move sozinha. O repin continua manual.
- Listagem de revisões em ordem decrescente; entrada apresentada diz se pina a mais alta.
- Simulação em draft continua permitida e continua lendo a revisão que a entrada do draft pina.

### 5.3 Nós que a análise precisa tocar

Alterar:

- `domain/knowledge/hypothesis-revision`: a descrição "a further edit always creates the next
  revision" passa a dizer que a edição cria a próxima revisão **só quando** a atual está congelada
  por uma versão released, e substitui o conteúdo no lugar caso contrário.
- `domain/knowledge/hypothesis`: "it only adds a new revision" passa a descrever os dois
  desfechos da operação `revise`.
- `contracts/knowledge/case-lifecycle`: a descrição de `revise-hypothesis` passa a dizer em qual
  revisão escreve.
- `rules/knowledge/a-hypothesis-revision-number-is-never-reused`: manter o statement; a descrição
  precisa dizer que substituir o conteúdo de uma revisão existente não é reutilização de número.

Adicionar:

- Uma regra (policy) que afirme o alvo do salvamento conforme 5.1, constrangendo
  `hypothesis`, `hypothesis-revision` e `case-version`.
- Um cenário: draft pina revisão 2 não publicada; curador salva três vezes; a hipótese continua
  com revisão 2 como mais alta, com o conteúdo do último salvamento; a entrada do draft continua
  pinando 2 e não anuncia revisão mais alta.
- Um cenário: versão released pina revisão 2; curador salva; nasce revisão 3; a versão released
  continua lendo revisão 2 inalterada (complementa
  `a-released-version-keeps-its-original-revision`).
- Um cenário de simulação: resultado mostrado para a revisão 2 do draft; curador edita a revisão 2
  no lugar e volta ao cockpit; o resultado é marcado stale, mesmo com o número da revisão
  inalterado. Provavelmente cabe como segundo cenário sob
  `a-simulation-result-is-stale-once-its-source-changes`, ou como ampliação do cenário existente.

## 6. Impacto na simulação

- Simular uma hipótese cujo draft pina uma revisão editável continua permitido. Nenhum nó de
  simulação precisa mudar de statement.
- A detecção de stale **não pode** se apoiar no número da revisão, porque na edição no lugar ele
  não muda. A regra já admite marcar stale a cada retorno da edição, então isso é escolha de
  implementação, não fato novo. O cenário proposto em 5.3 torna essa consequência explícita.
- Depois da mudança, o fluxo do curador fica: editar e salvar (revisão N sobrescrita), voltar ao
  cockpit (resultado stale), simular de novo, publicar (N congela). Sem repin entre salvamentos
  quando o draft já pina N.

## 7. Impacto no repin entregue

A iniciativa `manifest-revision-repin` permite escolher entre revisões existentes de uma hipótese
para a entrada do draft. Continua válida e útil: com menos revisões há menos escolhas, mas a
escolha existe (por exemplo, voltar a uma revisão antiga já publicada). Um caso a analisar: draft
pina revisão 1 (nunca publicada) e existe revisão 2 publicada. A revisão 1 não é a mais alta,
então pela regra 5.1 ela não é o alvo do salvamento; um salvamento cria a revisão 3. A revisão 1
fica de fato congelada por não ser alcançável para edição. Isso é aceitável e não contradiz
nenhuma regra, mas a análise deve deixar registrado.

## 8. Questões que a análise deve decidir e registrar no decision-log

1. **Alvo da edição: revisão mais alta ou revisão que o draft pina?** A proposta em 5.1 usa a mais
   alta, porque o draft pode não pinar a hipótese (hipótese nova ou removida do manifesto) e a
   regra precisa de um alvo em todo caso. Registrar a alternativa e por que foi descartada.
2. **Resposta da operação.** Hoje devolve `{ hypothesis_name, revision }`. Se o curador ou a tela
   precisam saber se o salvamento criou ou substituiu, isso é um fato a decidir. Se nada precisa
   saber, a resposta fica como está.
3. **Concorrência.** Duas edições no lugar sobre a mesma revisão não publicada: a última vence,
   ou a segunda é recusada? A especificação hoje não trata concorrência em nenhuma escrita de
   curadoria; se a análise decidir manter esse silêncio, registrar.
4. **Revisão não publicada e não pinada por nenhum draft** (a "órfã", possível quando o curador
   salva e nunca repina, ou quando o draft é descartado). Pela regra 5.1 ela continua editável
   enquanto for a mais alta. Confirmar que isso é desejado.
5. **Histórico.** Ao sobrescrever no lugar, o conteúdo anterior se perde. O produto aceita isso
   para conteúdo nunca publicado, do mesmo modo que aceita para o manifesto de um draft. Registrar.

## 9. Fora de escopo

- Mostrar a resposta bruta da LLM no painel de detalhe da simulação. Fato separado, rota separada.
- Mostrar a razão do `inconclusive` no painel de detalhe. Superfície de capacidade já
  especificada, rota separada.
- Corrigir `conceito.undefined` na lista de citações quando a citação vem sem campo. Superfície
  do frontend, alvo `edits_freely`.

## 10. Rota

Fato do negócio: `/analyse` sobre este material, depois `/plan-work`, `/implement-task` por tarefa e
`/review-change`.
