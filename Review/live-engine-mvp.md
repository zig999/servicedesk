# Review de desempenho — Siegard como framework (iniciativa `live-engine-mvp`)

**Data**: 2026-08-11
**Sessão**: sessão atual (`session_018Wj4kvEQBvTSAQNaZME2ZV`), que planejou, entregou e depois testou ao vivo esta iniciativa
**Objeto avaliado**: não o código entregue, mas o **framework Siegard em si** — seus validadores (`bin/*.py`), sua doutrina de subagentes (`agents/*.md`), seus skills (`/analyse`, `/plan-work`, `/implement-task`, `/review-change`) e o que acontece quando o trabalho sai do território que esses skills cobrem.
**Escopo do trabalho que gerou esta evidência**: planejamento de `live-engine-mvp` (9 tasks, 5 epics) a partir de uma revisão de escopo pós-`investigation-engine-v2`; entrega das 9 tasks por `/implement-task`, em dois lotes paralelos com merge; um `/review-change` formal sobre a entrega inteira; e, depois disso — o que esta review trata como o material mais importante — uma sessão de **teste real contra a API de verdade da Anthropic**, com uma chave temporária fornecida pelo usuário, que encontrou dois bugs genuínos que a suíte inteira (com mocks) nunca poderia ter encontrado, e a correção de ambos.
**O que este documento não é**: não é o review formal do código (`delivery/live-engine-mvp/review/live-engine-mvp.md`, já registrado e validado). É sobre como o framework — e a sessão que o operou — se comportou enquanto o processo corria, incluindo a parte que não tem ritual nenhum hoje: o que acontece depois que a entrega passou no review e alguém liga o sistema de verdade.

---

## TL;DR

Esta iniciativa é a prova mais forte até agora de que o feedback deste tipo de relatório funciona: o P0 da review anterior (`Review/investigation-engine.md`, §3.1 — `trace.py --bind` perdia arquivos silenciosamente ao substituir em vez de unir) **foi corrigido** entre uma sessão e a outra — `trace.py` hoje une por padrão e exige `--replace` explícito. Isso é um framework que absorveu uma lição real.

Ao mesmo tempo, esta sessão descobriu uma classe de problema que nenhuma das duas reviews anteriores nomeou: **a suíte de testes deste projeto, por desenho, não pode detectar um número desconhecido de bugs de integração real**, porque todo adaptador de LLM é testado contra um cliente mockado que nunca produz o comportamento real e não-determinístico do provedor. Isso não é uma falha do `task-implementer` nem do `test-author` — é estrutural, e correta (`TST-03` existe exatamente para isolar o limite externo). Mas ela deixa uma lacuna que só um teste real fecha, e **o framework não tem ritual nenhum para esse momento**: quando o teste real encontrou um `AnthropicHypothesisEvaluator` que sempre voltava `inconclusive` por dois motivos genuínos e independentes (um bug de parsing, e uma contradição não resolvida entre duas regras da própria especificação), a única forma de corrigir foi a sessão escrever a implementação e o teste no mesmo contexto, sem o segundo produtor, sem `/implement-task`, e — só percebido agora, escrevendo este relatório — sem nunca rodar `trace.py --bind` para os arquivos tocados. O rastro está desatualizado hoje, silenciosamente, exatamente pelo motivo oposto ao que causou o P0 da sessão passada: não porque a ferramenta perdeu dado, mas porque ninguém a chamou.

O segundo achado de peso é sobre planejamento: `execution-contract-binder`/`backlog-decomposer` aplicaram `produces` errado em **6 das 9 tasks** (67%) na primeira passada do plano — um campo estreito, com uma única finalidade documentada (substrato que o standard pressupõe), usado em tasks comuns. Isso não chegou a gerar dado incorreto (foi pego e corrigido antes de qualquer entrega), mas derrotou, na prática, o próprio motivo de `produces` existir: serializar `deliver.py --outstanding` em vez de permitir lotes paralelos.

Nada disso invalida o resultado: as 9 tasks foram entregues, revisadas, e — depois de dois ciclos de correção real — o sistema hoje responde corretamente, ao vivo, contra a API de verdade, duas vezes seguidas. Mas o caminho até lá expôs exatamente onde a doutrina do framework para "conserto pontual fora de uma task planejada" simplesmente não existe.

---

## 1. Método desta avaliação

Toda afirmação abaixo cita o commit, o comando ou o arquivo que a produziu — nunca memória de conversa. Onde a causa raiz está no framework (`.claude/bin/*.py`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`), digo isso explicitamente, distinguindo de decisões do projeto (a especificação, o standard) que não são do framework a resolver.

Evidência usada:
- `git log` com timestamps reais, do commit que planejou `live-engine-mvp` (`2e4b5af`, 2026-08-10 21:22) até o commit mais recente (`b24e387`, 2026-08-11 10:47) — 17 commits, 2 merges de lote paralelo.
- `python3 -B .claude/bin/plan.py --check`, `deliver.py --outstanding`, `trace.py --check`, rodados de novo agora, sobre o estado atual da árvore — não relidos de memória.
- O registro formal de review já validado, `delivery/live-engine-mvp/review/live-engine-mvp.md` (9 tasks, 43 arquivos, 8 achados de standard, 2 de conformidade, 45 critérios de cobertura).
- `git diff`/`git show` sobre commits específicos, para confirmar exatamente o que cada um mudou.
- A execução real desta sessão contra a API da Anthropic (chave temporária, nunca gravada em arquivo do repositório): duas rodadas de teste ao vivo, ambas com resultado correto e consistente.

---

## 2. O que funcionou

### 2.1 — A review anterior já melhorou o framework, de forma verificável

`Review/investigation-engine.md` (sessão anterior) apontou como P0 que `trace.py --bind` substituía o vínculo de um nó em vez de unir com o que já existia — perda de dado silenciosa toda vez que duas tasks diferentes encodavam o mesmo nó em arquivos diferentes. Lendo `.claude/bin/trace.py` agora:

```
trace.py --bind ... --replace                                 write it in full instead
```
> `--replace` writes the entry in full instead, exactly as every bind used to: a file left off the...

A união por padrão, com `--replace` como opt-in explícito, **é exatamente a recomendação P0 da review anterior, implementada**. Isso aconteceu entre uma sessão e a outra (o commit `8398446`, "atualizar framework vendorizado para 3.8.0", 2026-08-10 20:30, é o candidato mais provável). Independentemente de qual commit exato trouxe a correção: **o ciclo "sessão escreve review → projeto Siegard corrige o framework → próxima sessão herda a correção" é real, não teórico.** Vale nomear isso com todo o peso, porque é o motivo de valer a pena escrever o relatório que o usuário está pedindo agora.

### 2.2 — A entrega em lotes paralelos validou o procedimento documentado em CLAUDE.md, ponta a ponta

Dois lotes rodaram em paralelo (`batch/widen-evaluator-port`, `batch/author-diagnose-fixture`), cada um em seu próprio worktree, cada um entregue por uma invocação comum de `/implement-task`. Os dois merges (`b5b9eab`, `bc154bf`) e a reconciliação seguinte (`bf878f7`, "reconciliar delivery.json sobre a árvore integrada do Lote 2") aconteceram exatamente como CLAUDE.md descreve: `delivery.json` e `siegard-trace.json` são os dois únicos conflitos esperados, resolvidos por rederivação, nunca por merge manual.

Mais importante: apareceu **um conflito de fonte genuíno**, não um dos dois esperados — `anthropic-hypothesis-evaluator.adapter.ts` (lote 2, entregue depois) e `anthropic-assessment-consolidator.adapter.ts` (lote 1, já mesclado) precisavam, cada um, excluir seu próprio import de `@anthropic-ai/sdk` da mesma lista de exclusão em `observation-source-modules.spec.ts`:

```diff
-const KNOWN_INFRASTRUCTURE_ADAPTERS = ['anthropic-assessment-consolidator.adapter.ts'];
+const KNOWN_INFRASTRUCTURE_ADAPTERS = [
+  'anthropic-assessment-consolidator.adapter.ts',
+  'anthropic-hypothesis-evaluator.adapter.ts',
+];
```

O commit da segunda task (`1b4dd44`) já registra a mescla como "duas entradas em vez de sobrescrever" — o segundo `test-author` reconheceu o array compartilhado e estendeu em vez de substituir, exatamente o padrão que a review anterior recomendou (§3.2 de `investigation-engine.md`: nunca afirmar totalidade sobre algo compartilhado sem escopar pela própria task). Isso é evidência direta — não apenas teórica — de que aquele padrão de doutrina, mesmo informal, se propagou. O merge de árvore que se seguiu ainda colidiu nas mesmas linhas (esperado, já que os dois branches editaram o array concorrentemente), e foi resolvido pelo caminho certo: merge de `master` no worktree, adição manual do segundo nome, nunca merge cego.

### 2.3 — As recusas honestas de `task-implementer`/`test-author` preservaram a garantia central, duas vezes

- `task/diagnose-composition-root/remove-withdrawn-dedup-layer` exigia apagar seis arquivos (`idempotency-key.ts`, `idempotency-lease-store.ts`, etc.). `task-implementer` não tem `rm` no seu conjunto de ferramentas (`Read, Write, Edit, Grep, Glob`) e **corretamente recusou fabricar a deleção**, reportando exatamente quais arquivos precisavam sumir. A sessão fez o `rm` diretamente sobre o achado verificado do agente — nunca o agente inventando uma forma de "deletar" via `Write` de um arquivo vazio ou algo do gênero.
- Para a mesma task, `test-author` **recusou escrever um teste placeholder** sobre um fato de forma de árvore (arquivo não existe) — não há comportamento para provar. O registro de implementação ficou sem prova, e isso é um estado que `deliver.py --outstanding` já nomeia como válido ("implemented, and no proof record holds it up"), não um buraco disfarçado.

Nos dois casos, o agente certo disse "não posso fazer isso honestamente" em vez de improvisar uma aparência de conformidade. É o oposto exato do tipo de falha que este framework existe para prevenir.

### 2.4 — Nenhuma task carregou nota BLOCKING, UNDERDETERMINED ou REMAINDER

Diferente de `investigation-engine` (6 lacunas UNDERDETERMINED declaradas ao longo de 10 tasks), nenhuma das 9 tasks de `live-engine-mvp` chegou a precisar de uma nota de divergência do `execution-contract-binder`. Isso é coerente com a natureza do escopo (adaptadores de infraestrutura contra portas já especificadas, não nova modelagem de domínio) — não é evidência de que o binder "ficou melhor", é evidência de que o escopo era mais mecânico. Vale registrar para calibrar a próxima leitura: a ausência de divergência não é sempre sinal do mesmo tipo de qualidade de planejamento.

### 2.5 — Quando a especificação e o código real entraram em contradição, o framework parou do jeito certo — mesmo sem uma task para segurar a nota

O teste ao vivo (§3.1 abaixo) expôs que `rules/investigation/a-cited-field-exists-in-the-capability-output-schema` e `constraints/the-judgment-prompt-is-closed` não podiam ambas valer ao mesmo tempo. Não existia task nenhuma carregando essa informação — o achado surgiu de depuração manual, fora de qualquer plano. Ainda assim, a sessão aplicou a mesma disciplina que uma nota BLOCKING exigiria: parou, apresentou as rotas de resolução ao usuário (ampliar o prompt vs. relaxar a regra vs. só documentar) em vez de escolher sozinha, e só rodou `/analyse` depois da decisão explícita do humano. **Isso é o comportamento certo acontecendo sem que nenhuma ferramenta o obrigasse** — o que é ao mesmo tempo louvável e um risco: funcionou porque a sessão escolheu seguir o espírito da regra, não porque algo a teria impedido de simplesmente consertar em silêncio.

---

## 3. O que não funcionou — atrito e defeitos, por severidade

### 3.1 — P0: não existe ritual para "um bug real, achado fora de qualquer task planejada, precisa ser corrigido"

**O que aconteceu.** Depois do `/review-change` formal (`598aa63`) e da adição dos scripts `build`/`start` (`d894ea9`), o usuário forneceu uma chave real da Anthropic e pediu para rodar o sistema de ponta a ponta de verdade. Dois bugs genuínos apareceram, nenhum dos dois visível a qualquer teste existente:

1. O modelo (`claude-haiku-4-5-20251001`) envolve a resposta JSON num bloco de código markdown apesar da instrução explícita do prompt para não fazer isso — comportamento real do provedor, impossível de reproduzir com um `messages.create` mockado.
2. `citation-validation.ts` exige que o `field` de uma citação exista no `output_schema` real da capability — mas `constraints/the-judgment-prompt-is-closed` nunca deixava o modelo ver esse schema. Toda a suíte usa `FakeHypothesisEvaluator`, que injeta citações já válidas por construção, então essa contradição nunca foi exercitada por nenhum teste ao longo de duas iniciativas inteiras.

**Como foram corrigidos.** Sem `task-implementer`, sem `test-author`, sem `/implement-task`. A sessão escreveu a implementação e os testes no mesmo contexto, editou os arquivos diretamente, rodou a suíte, rebuildou, testou ao vivo contra a API real duas vezes, e só então commitou — dois commits (`d0dbd98` para a emenda de especificação via `/analyse`, `b24e387` para o código).

**Por que isso é grave.** A separação entre `task-implementer` e `test-author` existe precisamente para que implementação e prova nunca sejam escritas pela mesma mão às cegas uma da outra — "an implementation and its tests written in one pass agree by construction, including where both are wrong" (CLAUDE.md). É exatamente essa garantia que se perde aqui: se a correção do code-fence estivesse errada de um jeito sutil, os dois testes que a provam foram escritos pela mesma sessão que escreveu o fix, no mesmo raciocínio — não há segunda cabeça. Some a isso o fato, só percebido ao escrever este relatório (§3.3), de que `trace.py --bind` nunca foi chamado para nenhum dos dois consertos: o rastro que deveria dizer "este arquivo ainda encoda o que a especificação pede" está silenciosamente desatualizado desde `1b4dd44` (23:05 de 10/08) para três arquivos que seguiram mudando depois.

**Por que isso vai se repetir.** O framework, hoje, só tem dois pesos: a cerimônia completa de `/plan-work` + `/implement-task` (dimensionada para uma task inteira, com survey, decomposição, dois subagentes, standard, trace) ou nada — nenhum meio-termo. Um bug de uma linha achado em teste real, fora de qualquer plano, não tem onde pousar. A sessão inventou, ad hoc, um padrão de "conserto pragmático direto" (implementar + testar + suíte verde + commit, sem cerimônia) que funcionou tecnicamente mas abriu mão de toda garantia estrutural que o framework existe para dar.

**Recomendação.** Um skill leve — `/hotfix` ou similar — dimensionado para exatamente este caso: um arquivo (ou punhado pequeno) já entregue por uma iniciativa fechada ou em andamento, um comportamento errado observado (não um critério de task, porque não há task), correção que ainda separa quem escreve o código de quem escreve o teste (mesmo que os dois sejam invocações mais leves que `task-implementer`/`test-author` completos), e que termina chamando `trace.py --bind-record` sobre o que mudou — para que o rastro nunca fique quieto sobre uma mudança real. Sem isso, todo conserto pós-produção continua sendo escrito à mão, fora de qualquer garantia.

### 3.2 — P1: `produces` foi mal aplicado em 6 de 9 tasks (67%) na primeira passada do plano

**O que aconteceu.** O commit `e2702d9` ("corrigir uso indevido de produces em 6 tasks de live-engine-mvp") mostra que a decomposição/binding inicial marcou `produces` em 6 das 9 tasks do plano, quando o campo existe só para artefatos que o **standard do projeto pressupõe** (package.json, tsconfig.json, etc.) — nunca para entregáveis comuns de uma task. CLAUDE.md é explícito sobre o custo: *"misusing it serializes deliver.py --outstanding's parallelism"* — cada task marcada com `produces` deixa de poder ser entregue em paralelo com as outras, porque o validador passa a tratá-la como pré-requisito de substrato.

**Por que isso importa.** 6 de 9 é a maioria do plano. Se não tivesse sido pego e corrigido antes de qualquer entrega, `deliver.py --outstanding` teria oferecido um item de cada vez em vez do lote de 2+ que de fato aconteceu — na prática, anulando o próprio ganho de tempo que a entrega paralela existe para dar, numa iniciativa pequena o suficiente para o efeito já ser visível.

**Por que aconteceu.** `backlog-decomposer`/`execution-contract-binder` não viram o código sendo escrito (é o ponto do contexto limpo) — decidiram `produces` a partir da leitura da task e do inventário, sem o sinal que só aparece depois: nenhuma dessas 6 tasks realmente criava um artefato que o `standards/backend-node-service.yaml` presupõe. A taxa de erro (67%) sugere que a doutrina sobre quando `produces` se aplica não está suficientemente afiada nos dois agentes — ou que a distinção "isto é substrato que o standard presume" vs. "isto é um entregável comum desta task" não tem um teste de bancada claro o suficiente para o agente aplicar sozinho.

**Recomendação.** `backlog-decomposer.md`/`execution-contract-binder.md` deveriam trazer um teste explícito e restritivo — algo como "nomeie o arquivo do registry do standard e a regra exata que presupõe este artefato; se você não consegue nomear os dois, não é `produces`" — em vez de confiar em inferência geral sobre o que "parece" substrato.

### 3.3 — P1: o rastro (`siegard-trace.json`) está desatualizado agora, e ninguém percebeu até esta análise

**O que aconteceu.** Rodando `trace.py --check src` para este relatório, o resultado foi **90 desvios sobre 100 vínculos**. A maior parte é débito pré-existente de antes de `live-engine-mvp` (arquivos de `subject-identity-rework` e `assessment-consolidation`, de `investigation-engine`, nunca re-vinculados) e entradas obsoletas de nós removidos pelo `/analyse` de revisão de escopo (`an-investigation-is-idempotent-within-a-window` e vizinhos, que já não existem na especificação mas o rastro ainda os cita). Mas um subconjunto é **novo, desta sessão**: `judgment-stage.ts`, `anthropic-hypothesis-evaluator.adapter.ts` e `hypothesis-evaluator.port.ts` mudaram de conteúdo (pelos dois consertos de §3.1) sem que `trace.py --bind` fosse chamado uma única vez.

**Por que isso é grave, e por que é irônico.** O propósito declarado do rastro é permitir que uma sessão futura de `/analyse` ou `/plan-work` pergunte, sem histórico nenhum, "este nó ainda está de fato codificado onde eu penso que está?" — e a resposta, para os três arquivos acima, está errada hoje: o rastro afirma um hash que já não corresponde ao arquivo. Isso é exatamente a classe de falha que a review anterior (`investigation-engine.md`, §3.1) já tinha nomeado como P0 — só que lá a causa era um bug na ferramenta (`--bind` substituindo em vez de unir), aqui a causa é que **ninguém chamou a ferramenta**, porque não havia ritual pedindo isso fora de `/implement-task`. É o mesmo sintoma (rastro mentindo por omissão), causa nova.

**Recomendação.** Ligada a §3.1: qualquer caminho de conserto fora de `/plan-work`/`/implement-task` — seja um `/hotfix` novo, seja uma instrução explícita nesta mesma doutrina — precisa terminar chamando `trace.py --bind-record` (ou `--bind` nó a nó) sobre o que mudou, do jeito que `/implement-task` já faz. Sem isso, o rastro só é confiável enquanto todo mundo usa exclusivamente os skills formais — e esta sessão é prova de que isso não se sustenta na prática.

### 3.4 — P2: atrito recorrente de autoria manual de registros YAML, mesma classe do achado da review anterior

A review anterior (`investigation-engine.md`, §3.3) já tinha nomeado autoria manual de frontmatter YAML como fonte de atrito evitável e recomendado um helper programático. Nesta iniciativa, o atrito reapareceu numa forma vizinha, não idêntica: o registro de review (`delivery/live-engine-mvp/review/live-engine-mvp.md`) precisou de três correções manuais depois de escrito — `divergences: []` (schema exige `minItems: 1`, teve que ser removido em vez de vazio), um campo `run` presente numa passe de falhas que não rodou (também teve que ser removido), e dois critérios com texto idêntico vindos de tasks diferentes exigindo uma única entrada de cobertura mesclada em vez de duas. Nenhum é um erro de julgamento — são três formas distintas de "o schema é mais estrito do que a forma óbvia de escrever isso à mão", a mesma categoria de atrito que a review anterior já havia nomeado, ainda sem solução adotada.

**Recomendação.** A recomendação da review anterior continua de pé e não foi implementada: um helper em `bin/` que monta o frontmatter de um registro de delivery a partir de dados estruturados, em vez de um agente/sessão escrevendo YAML por `Edit` direto e descobrindo a violação só quando `deliver.py`/`spec.py` recusa.

### 3.5 — P2: um subagente travou por 600s, e a repetição consumiu uma fração desproporcional do tempo da sessão

A primeira tentativa de `test-author` para a prova de `wire-diagnose-runner` não devolveu nada em 600 segundos e foi encerrada pelo watchdog. A repetição, com escopo explicitamente mais estreito, levou cerca de 87 minutos — contra minutos, tipicamente, para as outras 8 tasks. Isso não aponta para um defeito de doutrina identificável (pode ser variância de modelo, carga de contexto, ou o tamanho real da composição que `wire-diagnose-runner` exigia), mas vale registrar como dado bruto: numa iniciativa de 9 tasks, uma delas consumiu uma ordem de grandeza a mais de tempo de agente que as demais, sem aviso prévio no escopo da task.

### 3.6 — P2: `npm ci` dessincronizado após editar `package.json`, mesmo workaround de uma iniciativa anterior

Depois de `declare-runtime-dependencies` adicionar `@anthropic-ai/sdk` e `fastify`, o passo `install` registrado (`npm ci`) falhou por lockfile fora de sincronia — o mesmo problema que `work/case-authoring-mvp/task/published-language/build-substrate.md` já documenta como precedente, resolvido da mesma forma (`npm install` uma vez, fora do runner capturado, antes de repetir o passo registrado). O fato de precisar do mesmo workaround numa segunda iniciativa sugere que o registro do standard (`install: npm ci`) deveria, ele mesmo, absorver isso — por exemplo, um passo `install` que tenta `npm ci` e cai para `npm install` só quando o lockfile está desatualizado, capturando os dois casos sem exigir intervenção humana fora do runner toda vez que uma dependência nova entra.

---

## 4. Tensões estruturais (não são bugs — são trade-offs que vale nomear)

### 4.1 — Testes com mock são estruturalmente cegos ao comportamento real de um provedor de LLM

`TST-03` (mockar o limite externo, nunca a lógica de negócio) é a decisão certa para uma suíte determinística e rápida — mas ela garante, por desenho, que nenhum teste jamais vai reproduzir o code-fence real do modelo ou qualquer outro comportamento genuíno do provedor. Isso não é um defeito para corrigir (a alternativa — testes que fazem chamadas reais — custaria dinheiro e determinismo a cada rodada de CI), mas é uma lacuna de cobertura que **nenhuma quantidade de disciplina de `task-implementer`/`test-author` fecha**. Só um teste real, feito por um humano com uma chave de API, fecha essa classe de bug — e o framework, hoje, não nomeia isso como uma etapa esperada de nenhum plano; acontece, quando acontece, por iniciativa de quem está operando a sessão.

**Sugestão**: nomear explicitamente, talvez em `constraints/judgment-runs-behind-a-port` ou num constraint novo, que um adaptador real de LLM carrega uma lacuna de cobertura estrutural que só teste manual contra o provedor real fecha — não para exigir automação (cara e não-determinística), mas para que a ausência seja uma decisão registrada, não um ponto cego silencioso.

### 4.2 — Revisão pós-entrega não tem gatilho quando o código muda depois dela

`delivery/live-engine-mvp/review/live-engine-mvp.md` documenta o estado do código em `598aa63`. Os dois consertos de §3.1 mudaram três dos arquivos que aquele review cobriu, e nada no framework marca o registro como desatualizado — `deliver.py --check` continua validando porque o registro nunca afirmou pin sobre o conteúdo dos arquivos revisados, só sobre as tasks e o standard. Isso é uma decisão de desenho deliberada (CLAUDE.md: "planejamento e entrega são descartáveis"), mas na prática significa que um review formal pode ficar historicamente incorreto sobre o presente sem que nada avise.

---

## 5. Dados desta sessão (para calibrar as próximas)

| Métrica | Valor |
|---|---|
| Tasks planejadas e entregues | 9 de 9, nenhuma com nota BLOCKING/UNDERDETERMINED/REMAINDER |
| Commits no arco completo (plano → correção final) | 17, incluindo 2 merges de lote paralelo |
| Duração relógio-de-parede, do plano ao commit final | ~13h25 (2026-08-10 21:22 → 2026-08-11 10:47), com um hiato de ~8h45 entre a entrega do adaptador de julgamento e a da composição root |
| Arquivos revisados formalmente | 43 (`delivery/live-engine-mvp/review/live-engine-mvp.md`) |
| Achados do review formal | 8 de standard, 2 de conformidade |
| Critérios de cobertura | 45, dos quais 4 uncovered/partial (fatos de build/tree-shape, sem gap real) |
| Registros de implementação/prova | 17 (9 implementação, 8 prova — 1 task sem prova por desenho) |
| Tasks com `produces` mal aplicado, corrigidas antes da entrega | 6 de 9 (67%) |
| Bugs reais achados só por teste ao vivo contra a API real | 2, nenhum detectável pela suíte mockada |
| Testes novos escritos para os 2 bugs pós-review | 4 (2 por bug) |
| Chamadas a `trace.py --bind`/`--bind-record` para os 2 consertos pós-review | 0 |
| `trace.py --check` no fechamento desta análise | 90 desvios sobre 100 vínculos (maioria débito pré-existente; um subconjunto novo desta sessão) |
| Suíte final | 458/458 verde |
| Lint / secret-scan / typecheck / build, checados agora | Todos limpos |
| Chamadas reais à API paga, feitas manualmente por este relatório/depuração | ~7 (2 diagnósticos diretos × 2 hipóteses, mais 2 chamadas HTTP completas de verificação) |

---

## 6. Recomendações, priorizadas

**P0 — o de maior alavancagem desta review:**
1. Um skill leve de "conserto pontual" (`/hotfix` ou equivalente), dimensionado para um bug real achado fora de qualquer plano — ainda com dois produtores separados (mesmo que mais leves que `task-implementer`/`test-author` completos), e terminando sempre em `trace.py --bind-record` sobre o que mudou. Sem isso, todo conserto pós-produção continua sendo o que foi nesta sessão: uma única mão escrevendo implementação e teste, e o rastro ficando quieto sobre a mudança.

**P1 — corrigir em breve, atrito recorrente e quantificado:**
2. Afiar a doutrina de `backlog-decomposer`/`execution-contract-binder` sobre quando `produces` se aplica — a taxa de erro observada (67% das tasks de um plano) é alta demais para um campo com uma única finalidade documentada.
3. Qualquer caminho de escrita de código fora de `/implement-task` precisa terminar chamando `trace.py --bind`/`--bind-record` — ligado à recomendação P0, mas vale como regra independente mesmo sem o skill novo existir ainda.
4. Um helper em `bin/` para montar frontmatter YAML de registros de delivery a partir de dados estruturados — recomendação da review anterior, ainda não adotada, e o atrito reapareceu numa forma vizinha nesta iniciativa.

**P2 — vale nomear, não urgente:**
5. Um passo `install` que absorve `npm ci` → fallback para `npm install` quando o lockfile está obsoleto, para não repetir o workaround manual a cada iniciativa que adiciona dependência.
6. Registrar explicitamente, em algum constraint, que um adaptador real de LLM carrega uma lacuna de cobertura que só teste manual contra o provedor real fecha — para que a lacuna seja uma decisão visível, não um ponto cego.
7. Investigar se o hiato de ~87 minutos na prova de `wire-diagnose-runner` é um padrão (tasks de composição/wiring custam mais) ou uma variância isolada, antes de assumir que o custo por task é uniforme em planos futuros.

---

## 7. Placar

| Eixo | Nota | Justificativa |
|---|---|---|
| Absorção de feedback de reviews anteriores | **Excelente, verificado** | o P0 de `investigation-engine.md` (`trace.py --bind` substituindo) foi corrigido de fato — evidência direta lendo o código da ferramenta hoje |
| Entrega em lotes paralelos | **Excelente** | os dois conflitos esperados (derivados) e o único conflito de fonte genuíno foram tratados exatamente como CLAUDE.md descreve, sem desvio |
| Recusa honesta de agentes diante do que não podiam fazer | **Excelente** | `task-implementer` recusou fabricar deleção; `test-author` recusou prova placeholder; nenhuma aparência de conformidade fabricada |
| Planejamento (`backlog-decomposer`/`execution-contract-binder`) | **Regular** | nenhuma nota de divergência (bom), mas 67% de mau uso de `produces` na primeira passada (ruim) |
| Cobertura de teste contra comportamento real de provedor | **Estruturalmente limitada, corretamente isolada** | `TST-03` é a decisão certa, mas deixa uma classe inteira de bug só descobrível ao vivo — e essa descoberta encontrou 2 bugs reais nesta única sessão |
| Rastreabilidade (`siegard-trace.json`) fora do caminho formal | **Fraca** | 90 desvios hoje; o subconjunto novo desta sessão existe porque nenhum ritual pedia `--bind` fora de `/implement-task` |
| Ritual para conserto pós-entrega/pós-review | **Inexistente** | esta é a lacuna central do relatório — não há meio-termo entre a cerimônia completa de uma task e conserto ad hoc sem garantia nenhuma |
| Resultado final observável | **Correto e verificado ao vivo** | duas chamadas reais consecutivas contra a API da Anthropic confirmam a hipótese certa, com a citação certa, depois dos dois consertos |

---

## 8. Veredito

`live-engine-mvp` entregou o que prometeu, e o sistema hoje funciona de verdade — verificado, não presumido, contra a API real, duas vezes. O framework também melhorou de forma mensurável desde a última review: a correção do P0 de `trace.py` é a prova de que este tipo de relatório tem efeito real sobre o Siegard, não é exercício de estilo.

Mas esta sessão expõe uma lacuna que as duas reviews anteriores não tinham nomeado, porque nenhuma delas tinha chegado a testar contra um provedor real: **o momento em que um bug genuíno aparece fora de qualquer task planejada é o momento em que toda a disciplina do framework — dois produtores, trace vinculado, standard aplicado — simplesmente para de se aplicar**, porque não existe ritual dimensionado para esse tamanho de trabalho. Os dois consertos desta sessão foram corretos no resultado (suíte verde, comportamento certo ao vivo) e vulneráveis no processo (uma mão só, rastro nunca atualizado) — e isso vai se repetir em toda iniciativa futura que chegue a ligar o sistema de verdade, o que é exatamente o ponto em que qualquer projeto real eventualmente chega.

Corrigir a lista do §6, começando por um ritual leve para conserto pontual que termine em `trace.py --bind`, é o que fecha essa lacuna antes que ela se acumule em silêncio por mais duas ou três iniciativas.

---

*Este documento foi escrito pela sessão que executou o trabalho revisado, com base em evidência direta (comandos, saídas, registros git, leitura do código do framework) produzida ao longo da própria sessão. Não substitui uma auditoria independente; funciona como material de partida para uma — e, como a review de `investigation-engine` antes dele, destina-se ao próprio projeto Siegard.*
