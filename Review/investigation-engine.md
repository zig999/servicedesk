# Review de desempenho — Siegard como framework (iniciativa `investigation-engine`)

**Data**: 2026-08-10
**Sessão**: `session_01XkHbvfSEwesqVtDEvqiA5q`
**Objeto avaliado**: não o código entregue, mas o **framework Siegard em si** — sua especificação de processo, seus validadores (`bin/*.py`), sua doutrina de subagentes (`agents/*.md`), seus skills (`/implement-task`, `/review-change`) — a partir do desempenho observado ao longo de uma sessão real de ponta a ponta.
**Escopo do trabalho que gerou esta evidência**: entrega de 10 das 11 tasks da iniciativa `investigation-engine` via `/implement-task` (uma invocação por task, ordem topológica), 1 stop correto sobre uma nota BLOCKING, e uma execução completa de `/review-change` sobre as 10 tasks entregues.
**O que este documento não é**: não é um review do código de `investigation-engine` (esse já existe, formal, em `delivery/investigation-engine/review/investigation-engine.md`, e narrado seletivamente ao longo desta sessão). Este documento é sobre **como o framework se comportou enquanto o processo corria** — onde ele preveniu erro, onde ele custou tempo sem preveni-lo, e onde ele deixou uma lacuna sem cobertura alguma.

---

## TL;DR

Siegard, nesta sessão, cumpriu sua promessa central — **nenhum fato de domínio foi inventado, e toda inferência foi declarada e é auditável** — de forma consistente ao longo de 10 tasks. A nota BLOCKING sobre `diagnose-entry-point` parou a implementação exatamente como o framework promete, sem hesitação e sem contorno. A separação em dois produtores (implementação/prova) e a separação em quatro passes de review (cobertura/especificação/standard/falhas) produziram achados reais, não-redundantes, que um pipeline sem essa separação teria deixado passar.

Ao mesmo tempo, esta sessão expôs um **defeito de dados sério em `bin/trace.py`** (rebind substitui em vez de unir — ver §3.1, severidade P0), uma **lacuna metodológica real** para o caso em que a entrega legítima de uma task invalida um teste já entregue por outra (§3.2), e uma **classe inteira de atrito evitável** em torno de autoria manual de YAML e limites numéricos do standard que dois subagentes (`task-implementer`, `test-author`) não verificam sozinhos antes de devolver o trabalho (§3.3–§3.4). Nenhum desses problemas comprometeu a entrega final — todos foram pegos, a tempo, pela própria disciplina do framework (validação content-addressed, `trace.py --check`, a suíte). Mas pegá-los custou trabalho manual que o framework deveria ter absorvido, e ao menos um deles (o de `trace.py`) só foi pego porque esta sessão escreveu, por conta própria, um script de auditoria que não existe em `bin/`.

---

## 1. Método desta avaliação

Esta avaliação não é uma opinião a posteriori — é a leitura de uma sessão real, com timestamps, comandos e saídas de comando reais, na qual:

- 10 subagentes `task-implementer` e 10 `test-author` foram delegados (um par por task), mais 4 retomadas de `test-author` via `SendMessage` para corrigir problemas encontrados na suíte;
- 3 subagentes de review (`coverage-auditor`, `specification-conformance-reviewer`, `standard-conformance-reviewer`) foram delegados sobre a mudança inteira;
- 13 commits git foram produzidos, cada um o registro de uma decisão do framework (2 de `/analyse`+`/plan-work` herdados do contexto anterior, 10 de tasks, 1 de review);
- a suíte de testes cresceu de ~178 para 303 testes (125 novos, todos escritos por `test-author`, nunca pela sessão orquestradora);
- `trace.py --check` foi executado repetidamente e terminou em 79 vínculos sem drift.

Cada afirmação abaixo cita o arquivo, a task ou o comando que a produziu. Onde a causa raiz está em código do framework (`.claude/bin/*.py`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`), digo isso explicitamente — distinguindo de decisões do projeto (a especificação, o standard) que não são do framework a resolver.

---

## 2. O que funcionou — e por que isso é o diferencial de Siegard

### 2.1 — O stop BLOCKING funcionou exatamente como prometido, no caso que mais importava

`task/investigation-lifecycle/diagnose-entry-point` chegou a esta sessão já carregando uma nota BLOCKING: nenhum nó da especificação diz de onde vêm `requester` e `ticket_ref` para uma chamada de diagnose, mas `domain/investigation/investigation` os exige e a chave de idempotência precisa deles. A instrução do humano foi explícita — não implementar enquanto a nota estivesse de pé, nunca inventar o valor.

O framework não precisou de reforço algum para respeitar isso. Antes de tocar a task, o passo de leitura das `## Notes` (etapa obrigatória de `/implement-task`, anterior a qualquer escrita) encontrou a nota, e a sessão parou — sem escrever um caractere de código, sem "só uma tentativa para ver se dá". O relatório final devolveu as duas portas certas, prontas para colar (`/plan-work` para reescopar, `/analyse` para estender a especificação), e nomeou exatamente o campo que falta.

**Por que isso importa**: `requester`/`ticket_ref` alimentariam a chave de idempotência (`idempotency-window`, já entregue) e o agregado `Investigation` (`investigation-factory`, já entregue). Um valor inventado aqui — mesmo um "placeholder razoável" — teria se propagado para dois módulos já fechados e para o contrato de entrada de todo o sistema. O custo de inventar seria descoberto tarde, fora de um review, possivelmente em produção. O framework pagou esse custo agora, de forma barata e visível, exatamente onde deveria.

### 2.2 — A taxonomia BLOCKING / UNDERDETERMINED / REMAINDER / ADVISORY carregou peso real, não decorativo

Ao longo das 10 tasks entregues, 6 lacunas genuínas da especificação foram encontradas, decididas por inferência e **declaradas**, nunca inventadas em silêncio:

| Task | Lacuna | Decisão registrada |
|---|---|---|
| `observation-source-port` | `evidence-result` não diz se o payload de `ok` é obrigatório | Observação real incluída, não só a tag |
| `idempotency-window` | a janela vale para o ramo completed também? Lease vs stub? | Completed nunca reexpira (não há lookup real aqui); lease store separado, nunca um stub de investigation |
| `evidence-collection-stage` | `evidence.observation`/`inputs`/`ttl` sem forma para o caso não-ok; referência a capability sem forma para ausência | String vazia; serialização de concept+subject+requester; default de 60s (`rules/knowledge/a-collected-concept-declares-a-ttl`); dois campos flat, string vazia na ausência |
| `citation-validation` | `output_schema` sem formato concreto em lugar nenhum | Lido como JSON Schema, campo existe = chave de `properties` |
| `judgment-stage` | citação de no-data sem campo real; `judgment-does-not-infer` não é computável por esta camada | Campo vazio, todas as evidências não-ok citadas; gap deixado aberto deliberadamente, nunca fechado por invenção |
| `investigation-factory` | relacionamento `pinned-case` sem forma de campo | Objeto aninhado `{slug, version, hash}`, não campos flat |

O ponto forte aqui não é que as decisões estejam certas — algumas, como o default de `ttl`, foram exatamente o que a passe de conformidade de especificação (§2.4) reabriu como achado no fim. O ponto forte é que **cada uma delas é rastreável até uma frase exata do porquê**, no registro de implementação, sem exceção. Uma equipe humana que precise revisar essas seis decisões não precisa re-derivar nada: o rastro já está escrito.

### 2.3 — A separação em dois produtores pegou dois problemas reais que um produtor único teria deixado passar

- Ao escrever a prova de `hypothesis-evaluator-port` (task 2), o `test-author` decidiu, por conta própria, escopar seu teste de "só um adaptador concreto" por **implementação de interface** em vez de contagem de arquivos no diretório — porque sabia que o diretório `src/investigation/` seria compartilhado com o port irmão. Esse padrão, inventado pelo produtor de prova, foi exatamente o que corrigiu o teste **já entregue e quebrado** da task 1 (§3.2) quando o mesmo problema apareceu lá.
- Ao escrever a prova de `judgment-stage` (task 6), o `test-author` chegou a escrever um teste deliberadamente vermelho para excluir a implementação descrita na nota UNDERDETERMINED sobre `judgment-does-not-infer` — e a sessão teve que corrigi-lo (§3.4). Mas note o que aconteceu antes disso: o produtor de prova **leu a nota e tentou honestamente cumprir a instrução "excluir é trabalho do test-author"**, até o ponto de reconhecer, quando confrontado, que a exclusão era estruturalmente impossível nesta camada. Isso é o dissenso institucionalizado funcionando: o produtor de prova nunca aceitou a implementação sem examiná-la contra a nota.

### 2.4 — Pins content-addressed pegaram uma dessincronia real, sem que ninguém precisasse lembrar de nada

Depois de compor o registro de implementação da task 1 e então editá-lo (para corrigir a descrição do teste retroativamente corrigido na task 2 — §3.2), `bin/deliver.py` recusou a validação da prova até o pin `implementation:` ser recalculado e re-estampado. Nenhuma disciplina humana foi necessária — o validador simplesmente não deixou passar um par implementação/prova desalinhado. Isso é o design working as intended: o hash é a única verdade sobre "contra qual versão este teste foi escrito", e ele não pode ser esquecido porque é verificado, não lembrado.

### 2.5 — As quatro passes de review produziram achados ortogonais, sem duplicação

`coverage-auditor`, `specification-conformance-reviewer` e `standard-conformance-reviewer`, cada um em contexto limpo, sem ver o que os outros achavam, devolveram:
- cobertura: 37 critérios cobertos, 2 parciais, 1 inauditável (a própria UNDERDETERMINED de `idempotency-window` — o auditor reconheceu que o critério, como escrito, não decide a questão);
- conformidade de especificação: 4 achados, todos sobre inferências já declaradas que carecem de um nó que as sustente (o `ttl` default, a cardinalidade de `capability_name`/`capability_version`, uma citação errada a uma constraint, e o campo vazio de citação de no-data);
- standard: 3 achados, todos sobre `COR-02`/`COR-04` (erros sem status) e `STK-12` (o store fala com filesystem, não com PostgreSQL).

Nenhum achado se repetiu entre passes. A disciplina de "nenhuma passe vê o que a outra achou" (a passe de standard nunca é mostrada o que o registro de implementação já divulgou como inferência) evitou exatamente o viés que o framework diz evitar: um achado real (`STK-12`) não foi suavizado por saber que "isso já foi decidido conscientemente".

E a disciplina "nenhum veredito" permitiu relatar honestamente uma tensão real e não resolvida — `STK-12` (só PostgreSQL) contra `constraints/the-mvp-persists-to-no-database` (nenhum banco de dados) — sem que a sessão precisasse arbitrar uma decisão de projeto que não é dela. Isso está registrado nas `## Notes` do review, e é exatamente onde deveria estar: visível, não resolvido, não escondido.

### 2.6 — "Nenhum agente segura um shell" nunca foi violado, e nunca precisou ser

Toda vez que uma suíte veio vermelha — a colisão de teste da task 2 (§3.2), quatro violações de `max-lines-per-function` (§3.4), a exclusão impossível de `judgment-does-not-infer` (§3.4) — a correção voltou para o produtor certo via `SendMessage`, nunca foi feita por edição direta da sessão orquestradora. Em nenhum momento a tentação de "eu mesmo edito, é rápido" foi cedida. Isso vale a pena nomear porque é fácil, sob pressão de produzir 11 tasks em sequência, relaxar essa disciplina — e o framework, ao não dar um shell à sessão orquestradora sobre o código-fonte de teste, torna o relaxamento literalmente impossível, não apenas malvisto.

---

## 3. O que não funcionou — atrito e defeitos, por severidade

### 3.1 — P0: `bin/trace.py --bind` substitui em vez de unir, e isso é uma perda de dados silenciosa

**O que aconteceu.** `trace.py --bind <target> <spec> <node> <file...>` documenta explicitamente: *"held before, in full: a file left out of the list is a file this bind no longer claims."* Isso é correto quando **uma task, uma vez** encoda um nó. Não é correto quando **duas tasks diferentes**, em ordem, encodam o mesmo nó em arquivos diferentes — que é exatamente o caso mais comum neste projeto, porque o próprio inventário do plano descreve várias tasks pousando no mesmo diretório (`src/investigation/`).

Aconteceu pela primeira vez entre a task 1 e a task 4: `rules/investigation/collection-runs-in-the-requester-scope` foi vinculada a `[observation-source.port.ts]` pela task 1. A task 4, ao implementar o mesmo nó em `evidence-collection-stage.ts`, executou `trace.py --bind ... rules/investigation/collection-runs-in-the-requester-scope src/investigation/evidence-collection-stage.ts` — e o vínculo silenciosamente **perdeu** `observation-source.port.ts`. O mesmo aconteceu, na mesma passada, para `constraints/the-domain-depends-on-no-infrastructure` (perdeu 8 arquivos de 4 tasks anteriores) e `domain/investigation/evidence-result` (perdeu 2 arquivos).

**Como foi pego.** Não por nenhuma ferramenta do framework. Esta sessão escreveu, ad hoc, um script Python que lê `nodes[].encoded_at` de **todo** registro de implementação já entregue, calcula a união esperada por nó, e compara contra `siegard-trace.json`. Esse script não existe em `bin/`; foi inventado no momento, e teve que ser executado manualmente **antes de todo `--bind` subsequente**, do zero, para os 6 restantes das 10 tasks. `trace.py --check` não detecta o problema — ele verifica que o que está lá bate com o disco e a especificação, não que o que está lá é **completo**.

**Por que isso é grave.** O propósito declarado de `siegard-trace.json` é permitir que um `/analyse` ou `/plan-work` futuro pergunte, sem histórico de nenhum plano, "este nó ainda está de fato codificado onde eu penso que está?". Um vínculo que perdeu arquivos silenciosamente responde a essa pergunta **incorretamente e sem aviso** — e o defeito é invisível a menos que alguém, à mão, audite contra todos os registros de implementação outra vez. Numa iniciativa maior que esta (11 tasks), o custo de detecção cresce exatamente na proporção do que o rastro deveria estar economizando.

**Recomendação (a de maior alavancagem desta review).** `trace.py --bind` deveria, por padrão, ler o vínculo existente do nó (se houver) e **unir** os arquivos dados com os já lá, em vez de substituir — exigindo uma flag explícita (`--replace`) para o comportamento atual. Isso é uma mudança pequena, sem risco de regressão (a documentação já diz que um bind é "write or replace"; mudar o padrão para "write or extend, replace only if asked" preserva a extensibilidade sem o efeito colateral). Alternativamente, ou adicionalmente: `bin/trace.py` deveria expor um modo `--verify-completeness <delivery-root>` que faz exatamente o que o script ad hoc desta sessão fez, para que a próxima sessão não precise reinventá-lo.

### 3.2 — P1: nenhuma trilha existe para "a entrega legítima da task B invalida um teste já entregue pela task A"

**O que aconteceu.** A prova da task 1 (`observation-source-port`) incluiu um teste que contava arquivos `.adapter.ts` no diretório inteiro `src/investigation/` e exigia exatamente um. Isso era correto quando só a task 1 existia. Quando a task 2 (`hypothesis-evaluator-port`) pousou seu próprio adaptador legítimo no mesmo diretório, esse teste — já entregue, já commitado — quebrou, não por regressão, mas porque sua própria asserção era mais ampla do que o critério que ela deveria provar ("o único que **esta task** envia", não "o único no diretório").

**A lacuna do framework.** As regras de `/implement-task` são explícitas: *"Take a second task, or widen the one you were given — code that should change and that this task does not reach is deferred in the record, never changed."* Corrigir esse teste exigia, por construção, editar um arquivo entregue por outra task — exatamente o que essa regra proíbe. Não havia rota sancionada para esse caso específico dentro do fluxo de `/implement-task`; a correção só aconteceu porque esta sessão parou, explicou a colisão ao humano, e recebeu autorização explícita para tratar como "correção de forma de um teste já entregue" (uma categoria que a regra não nomeia, mas também não proíbe explicitamente — é uma zona cinzenta que o framework deixa para julgamento humano ad hoc, sessão a sessão).

**Por que isso vai se repetir.** O próprio inventário deste projeto (`inventory/investigation-engine.md`) já nomeia `src/investigation/` como diretório compartilhado por várias tasks de várias epics. Qualquer plano cujas tasks compartilhem um diretório físico — o que o framework não desencoraja, e às vezes até recomenda, quando um port e sua fake "moram juntos" por convenção — vai produzir esse tipo de colisão sempre que uma task escrever um teste cuja asserção é mais ampla do que seu próprio critério (contagem de arquivos em vez de verificação de interface, por exemplo).

**Recomendação.** Duas rotas, não mutuamente exclusivas:
1. **Doutrina do `test-author`** deveria nomear explicitamente esse anti-padrão: uma afirmação sobre "o único X que existe" deve ser escopada por **o que o critério da própria task afirma** (implementa a interface X, está listado como arquivo desta task), nunca por uma contagem sobre um diretório que pode ser compartilhado por tasks futuras. Isso teria prevenido o problema na origem, na task 1, sem custar nada.
2. **`execution-contract-binder`** (o agente que decide `implements` de cada task, em `/plan-work`) poderia, ao notar que duas tasks da mesma epic compartilham um `covers`/diretório de destino, deixar uma nota ADVISORY explícita na primeira task delivered avisando o próprio `test-author` dessa: "este diretório será compartilhado; não afirme totalidade sobre ele."

### 3.3 — P1: autoria manual de frontmatter YAML é adversarial à prosa livre que o próprio schema pede

**O que aconteceu.** O campo `how` (e `departure`, `why`, `effect`) do schema de delivery-node pede prosa livre em inglês explicando decisões — e prosa livre em inglês usa dois-pontos com frequência ("here: this task ships...", "unless...: never..."). YAML de fluxo em bloco lê `palavra: palavra` como um mapeamento sempre que aparece dentro de um valor não citado. Isso quebrou a autoria manual do registro de implementação da task 1 **quatro vezes seguidas** (`deliver.py --node` reportando linha e coluna exatas a cada vez), até a sessão adotar `yaml.safe_dump` em Python para compor os 9 registros restantes — o que eliminou o problema por completo a partir da task 2.

**Por que isso é um defeito do framework, não do projeto.** O schema (`delivery-node.json`) não prescreve como a prosa deve ser serializada — só que ela deve existir. A skill `/implement-task` também não prescreve isso; a exemplificação do próprio schema (`examples`) usa YAML de bloco simples, sem nunca demonstrar o caso de prosa contendo dois-pontos, embora toda prosa real de "how"/"why" gerada por este projeto os contenha constantemente. O atrito é 100% evitável e 100% mecânico — nenhuma decisão de negócio depende de como o YAML é serializado.

**Recomendação.** Documentar, no próprio schema ou na skill, que todo campo de prosa livre deve usar escalar de bloco (`>-`) por padrão — ou, melhor, `/implement-task` e `/review-change` deveriam compor o frontmatter programaticamize (como esta sessão passou a fazer manualmente) em vez de depender de um humano/sessão escrevendo YAML por Edit direto. Um pequeno helper em `bin/` que recebe um JSON e emite frontmatter YAML válido teria eliminado inteiramente essa classe de atrito.

### 3.4 — P1: nem `task-implementer` nem `test-author` se autoverificam contra os limites numéricos do standard antes de devolver

**O que aconteceu.** `standards/backend-node-service.yaml` declara `MNT-01`-style limits (`max-lines-per-function: 30`) decididos por ferramenta (`lint`). Em **4 das 10 tasks** (`evidence-collection-stage`, `judgment-stage` — duas vezes, incluindo uma segunda rodada — e `investigation-store`), a suíte veio vermelha *depois* de um build verde, puramente porque uma função de teste excedeu 30 linhas. Cada uma exigiu uma rodada extra de `SendMessage` de volta ao `test-author`, uma nova execução completa de `npm ci && typecheck && lint && secret-scan && test`, e uma nova composição do registro de prova. Em nenhum dos quatro casos havia um defeito real de comportamento — 100% eram violações mecânicas de forma.

**Por que isso é evitável.** O caminho do `standard` já é passado ao `test-author` (`Project's standard: ../standards/backend-node-service.yaml`), então o subagente **tem acesso** ao número exato. O que falta é instrução para efetivamente lê-lo e se autoverificar antes de devolver — nem a doutrina do agente (`agents/test-author.md`) nem a instrução da skill exigem essa verificação. O padrão observado nesta sessão foi: o subagente escreve, devolve, a sessão orquestradora roda a suíte, descobre o problema, e só então volta ao subagente com o número exato da violação — um ciclo completo de rodada que poderia ter sido evitado se o próprio subagente tivesse contado linhas antes de terminar.

**Recomendação.** Adicionar à doutrina de `task-implementer.md`/`test-author.md` um passo final explícito: "antes de devolver, leia as regras do standard decididas por ferramenta com limiar numérico explícito (funções, parâmetros, linhas) e verifique cada arquivo escrito contra elas." Isso não substitui o lint real (que continua sendo a fonte de verdade), mas eliminaria a maioria dos ciclos de correção mecânica antes que cheguem à suíte.

### 3.5 — P2: um teste foi escrito para ser permanentemente vermelho, e isso quase entrou no registro

**O que aconteceu.** A task `judgment-stage` carrega uma nota UNDERDETERMINED explícita: nenhum critério exclui um veredito confirmado/refutado cuja citação é estruturalmente válida mas não está de fato fundamentada na evidência — exatamente o que `rules/investigation/judgment-does-not-infer` recusa. A instrução da skill para o `test-author` é literal: *"each names an implementation that satisfies every criterion as written and that the specification refuses, and excluding it is the test author's work."* O `test-author`, seguindo essa instrução ao pé da letra, escreveu um teste que afirma que um veredito assim **nunca** deveria ser aceito — mas nenhuma implementação legítima desta task (uma orquestração puramente estrutural, sem julgamento semântico) pode de fato excluir esse caso, porque fazer isso exigiria a própria camada de julgamento que a regra delega ao adaptador.

**Como foi pego.** Não pelo framework — pela sessão, ao revisar o teste antes de rodá-lo, reconhecendo que ele só poderia ser vermelho para sempre, para qualquer implementação correta desta task. O `test-author`, ao ser confrontado, concordou e corrigiu para um `untested` honesto.

**A lacuna doutrinária.** A instrução da skill trata toda nota UNDERDETERMINED como igualmente "excluível por teste" — mas há duas classes distintas: (a) a implementação pode decidir uma leitura mais estrita e um teste pode provar que decidiu (a maioria dos 6 casos do §2.2); (b) a exclusão exigiria uma capacidade que a própria arquitetura delega para outra camada, e nenhum teste desta task pode prová-la sem inventar essa capacidade. A doutrina atual não distingue as duas.

**Recomendação.** A skill (ou a doutrina do `test-author`) deveria nomear essa segunda classe explicitamente: quando a exclusão exigiria uma capacidade fora do escopo desta task (frequentemente sinalizado pelo próprio REMAINDER/ADVISORY que aponta a capacidade para outra task), o correto é `untested` com a razão nomeada — nunca um teste que só pode falhar.

---

## 4. Tensões estruturais (não são bugs — são trade-offs que vale nomear)

### 4.1 — Custo fixo por task é aproximadamente constante, independente do tamanho da task

`citation-validation` (3 critérios, 1 arquivo de 130 linhas, uma função pura) passou pelo mesmo pipeline de nove passos que `judgment-stage` (6 critérios, pool de concorrência, retry sob deadline, 300+ linhas de orquestração): dois subagentes completos, duas execuções completas de `npm ci && typecheck && lint && secret-scan` (build e suite), uma composição de registro em YAML, um rebind de trace sobre então 8 nós já entregues. O overhead de orquestração — não o de implementação — é aproximadamente fixo. Isso significa que a razão custo/valor por task **piora** quanto mais uma iniciativa decompõe em tasks pequenas. Nenhuma parte do framework hoje ajuda `/plan-work` a pesar esse trade-off explicitamente ao decidir granularidade.

**Sugestão**: documentar, no próprio `plan-work` ou em `backlog-decomposer.md`, uma heurística de custo fixo por task observada empiricamente (esta sessão: ordem de 27 invocações de subagente e 2 execuções completas de suíte por task, independente do tamanho), para que decisões de decomposição levem isso em conta.

### 4.2 — Nada verifica, antes da escrita de código, se o standard do projeto e a especificação podem ambos ser satisfeitos

`STK-12` ("PostgreSQL é o único datastore") e `constraints/the-mvp-persists-to-no-database` (nenhum banco de dados) não podem ambos valer para o mesmo arquivo — e isso não é exclusivo de `investigation-store`: o mesmo padrão de armazenamento em arquivo já existia em `FileCaseStore`, `FileGlossaryStore` e `FileCapabilityStore`, entregues pela iniciativa anterior, e **nenhuma delas foi sinalizada** no review daquela iniciativa. A tensão só apareceu agora porque a passe de standard desta sessão a encontrou de novo, independentemente. Isso sugere que o achado não é sobre o código — é sobre o registro do projeto ter uma regra de standard que a própria especificação já torna impossível de cumprir para qualquer store que a especificação exige.

**Sugestão**: `/siegard-config` ou uma validação leve do standard poderia, ao menos, avisar quando uma regra do standard (`STK-*`, tipicamente sobre infraestrutura) e uma constraint da especificação (`constraints/*`) mencionam a mesma tecnologia em termos opostos — sem tentar resolver automaticamente, apenas para que a tensão seja visível a quem escreve o standard, não só a quem o revisa depois de já ter código escrito contra ele.

### 4.3 — Entrega serial de tasks quando o grafo de dependências permitiria paralelismo

O plano desta iniciativa tinha, em vários pontos, duas ou mais tasks prontas simultaneamente (por exemplo, depois da task 1, nada bloqueava o início da task 2 — ambas dependiam apenas de nós já entregues por iniciativas anteriores). A instrução do humano pediu ordem sequencial explícita, e esta sessão seguiu isso à risca — o que foi a decisão certa dado o objetivo declarado (auditar cada entrega antes de seguir). Mas o framework, por si, não oferece um padrão documentado para entrega paralela seguro (isolamento de worktree, bloqueio de arquivo compartilhado) quando um plano legitimamente permite. Isso não é um defeito nesta sessão, mas é uma lacuna a preencher se Siegard quiser escalar para iniciativas maiores sob pressão de tempo.

---

## 5. Dados desta sessão (para calibrar as próximas)

| Métrica | Valor |
|---|---|
| Tasks entregues | 10 de 11 (1 stop correto sobre BLOCKING) |
| Invocações de subagente | ~27 (10 `task-implementer`, 10 `test-author` iniciais, 4 retomadas de `test-author`, 3 passes de review) |
| Testes novos | 125 (178 → 303) |
| Arquivos tocados | 45 (produção + teste + erros) |
| Commits git | 13 |
| Rodadas de correção só por `max-lines-per-function` | 4 de 10 tasks (40%) |
| Rebinds manuais de trace por união (workaround ad hoc) | 6 |
| Colisão de teste entre tasks | 1 (task 1 × task 2, corrigida com autorização humana explícita) |
| Teste escrito para ser permanentemente vermelho, corrigido antes de rodar | 1 |
| Lacunas UNDERDETERMINED decididas e declaradas | 6 |
| Achados no review final (4 conformidade + 3 standard) | 7 |
| Suíte final | 303/303 verde |
| `trace.py --check` final | 79 vínculos, sem drift |

---

## 6. Recomendações, priorizadas

**P0 — corrigir antes de qualquer iniciativa maior que esta:**
1. `bin/trace.py --bind`: unir com o vínculo existente por padrão; exigir `--replace` explícito para descartar arquivos. É a mudança de maior alavancagem desta review — um defeito de perda de dados silenciosa no próprio mecanismo que existe para detectar deriva.

**P1 — corrigir em breve, custo baixo, atrito recorrente e quantificado:**
2. Doutrina de `task-implementer`/`test-author`: nunca afirmar totalidade sobre um diretório compartilhado; escopar por interface ou pela lista de arquivos da própria task.
3. Doutrina de `test-author`/`task-implementer`: autoverificar limiares numéricos do standard (linhas, parâmetros) antes de devolver.
4. Padronizar/automatizar a serialização de frontmatter YAML (escalares de bloco por padrão, ou um helper programático) para eliminar a classe de erro "prosa livre com dois-pontos quebra o parser".
5. Doutrina de `test-author`: distinguir uma nota UNDERDETERMINED excluível por teste de uma cuja exclusão exigiria capacidade fora do escopo da task — a segunda vai para `untested`, nunca para um teste que só pode falhar.

**P2 — vale um design doc próprio, não uma correção pontual:**
6. Rota sancionada para "a entrega legítima da task B invalida um teste já entregue pela task A" — hoje só existe como julgamento humano ad hoc.
7. Heurística documentada de custo fixo por task para informar granularidade em `/plan-work`.
8. Verificação leve de tensão standard-vs-especificação antes da escrita de código.
9. Padrão documentado para entrega paralela segura de tasks independentes do mesmo plano.

---

## 7. Placar

| Eixo | Nota | Justificativa |
|---|---|---|
| Prevenção de fato inventado | **Excelente** | BLOCKING parou exatamente onde deveria; 6 lacunas UNDERDETERMINED declaradas, nenhuma inventada em silêncio |
| Rastreabilidade / auditabilidade | **Excelente no design, com um defeito de execução sério** | decision-log e inferências impecáveis; `trace.py --bind` compromete a garantia que o próprio mecanismo existe para dar (§3.1) |
| Separação de julgamentos (dois produtores, quatro passes) | **Excelente** | achados reais, não-redundantes, sem vazamento de contexto entre passes |
| Robustez das ferramentas (`bin/*.py`) | **Boa, com uma lacuna P0** | validação de forma é rigorosa e útil; a lacuna de união em `trace.py` é o único defeito de dados encontrado |
| Doutrina dos subagentes (`agents/*.md`) | **Boa, com lacunas nomeáveis** | convenções de caminho e limiares numéricos deveriam estar na doutrina, não repetidas a cada delegação |
| Ergonomia de iteração | **Regular** | atrito real e quantificado (YAML, lint, 4 rodadas de correção mecânica em 10 tasks) que não deveria ter chegado à sessão orquestradora |
| Escalabilidade para iniciativas maiores | **Regular** | o custo de detectar o defeito de `trace.py` cresce com o número de tasks; nada ajuda a decidir granularidade ou paralelismo |

---

## 8. Veredito

Siegard, nesta sessão, fez exatamente o que promete no ponto que mais importa: **nada foi inventado, tudo foi declarado, e a única parada real (BLOCKING) foi respeitada sem hesitação**. Isso é raro em qualquer processo de desenvolvimento assistido por IA, humano ou não, e é o motivo pelo qual vale investir em corrigir o resto.

O resto, porém, é real: um defeito de dados silencioso no próprio subsistema que existe para prevenir deriva silenciosa (§3.1) é uma ironia que merece correção imediata — é precisamente o tipo de falha que Siegard foi desenhado para tornar visível em outras partes do sistema, e não deveria existir na parte do sistema que audita a si mesmo. As lacunas de doutrina (§3.2–§3.4) custaram, ao todo, algo entre 6 e 8 rodadas extras de subagente nesta sessão — um custo pequeno em uma iniciativa de 10 tasks, mas que cresce linearmente com o tamanho de qualquer iniciativa futura, e é inteiramente evitável com mudanças pequenas e localizadas na doutrina dos agentes e no comportamento padrão de uma ferramenta.

Corrigir a lista do §6, começando pelo P0, é o caminho mais direto para Siegard se tornar não apenas metodologicamente correto — que já é, nesta sessão — mas também barato de operar em escala.

---

*Este documento foi escrito pela sessão que executou o trabalho revisado, com base em evidência direta (comandos, saídas, registros git) produzida ao longo da própria sessão. Não substitui uma auditoria independente; funciona como o material de partida para uma.*
