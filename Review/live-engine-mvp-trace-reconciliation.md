# Review de desempenho — Siegard como framework (reconciliação do trace de `live-engine-mvp`)

**Data**: 2026-08-11
**Sessão**: sessão atual, mesma que planejou/entregou/testou `live-engine-mvp` (ver `Review/live-engine-mvp.md`), continuando após aquele relatório
**Objeto avaliado**: o framework Siegard em si — `bin/trace.py`, `bin/deliver.py`, `schemas/delivery-node.json`, o skill `/implement-task` e o skill `/plan-work` (etapa de fechamento) — não o código entregue
**Escopo do trabalho que gerou esta evidência**: completar a prova ausente de `task/diagnose-composition-root/remove-withdrawn-dedup-layer`; investigar e reconciliar 90 achados de `trace.py --check` (12 registros religados por leitura, 4 vínculos corrigidos com `--replace`, 1 registro retroativo escrito para um fix ao vivo sem task); e fechar formalmente a iniciativa `live-engine-mvp` (`closure.md`, `plan.py work/live-engine-mvp`). Commits: `351e124`, `cea4291`.

---

## TL;DR

O framework se comportou bem em três eixos estruturais: a separação de dois produtores sobreviveu a um uso fora do seu momento normal (um `test-author` fresco, chamado semanas depois da implementação, chegou à mesma conclusão que o produtor original — independentemente, não por repetir a prosa dele); o design de `trace.py --bind-record` (ler o mapeamento node↔arquivo do próprio registro, nunca digitá-lo de novo) tornou possível reconciliar 90 achados de drift sem inventar nenhum mapeamento à mão, só lendo o que já existia; e a exigência de `task` em todo node `kind: implementation` pegou, estruturalmente, uma tentativa de poluir `delivery.json` com um registro que não respondia a nenhuma task real.

Mas a etapa também expôs, de forma concreta e mensurável, a mesma lacuna que a sessão anterior já tinha nomeado em prosa (`Review/live-engine-mvp.md §"o framework não tem ritual nenhum"`): **mais da metade dos 90 achados de drift vieram de um único commit de fix ao vivo, escrito fora de `/implement-task`, e não existe hoje nenhum kind de delivery node, nenhum comando de `trace.py`, nenhuma orientação de skill que cubra esse caso.** A solução que aplicamos (`hotfixes/judgment-citation-matches-real-fields.md`, fora de qualquer delivery root) funcionou, mas foi inventada nesta sessão, sem contrato, sem schema, sem convenção nomeada em lugar nenhum do framework — o que significa que a próxima sessão que passar por isso vai reinventar (ou pior, inventar diferente) a mesma solução.

Um segundo achado, menor mas concreto: `trace.py` não tem comando para limpar um vínculo cujo node foi removido da especificação. Ficaram 15 achados permanentes, sem caminho de correção — nem mesmo um jeito de marcar "sei que isso é lixo, mas é lixo documentado" sem editar `siegard-trace.json` na mão, que o próprio framework proíbe.

---

## 1. Método desta avaliação

Toda afirmação abaixo cita o comando, o arquivo ou o commit que a produziu. Números vêm de `trace.py --check src` (antes: 90 achados/100 vínculos; depois: 15/100) e de `deliver.py delivery/live-engine-mvp work/live-engine-mvp src knowledge` (18 nodes, 0 critério não atendido, inalterado do início ao fim). Nenhuma citação de comportamento do framework vem de memória de conversas anteriores — cada uma foi conferida de novo nesta sessão, lendo o código-fonte de `.claude/bin/trace.py` e `.claude/bin/deliver.py` e o schema `schemas/delivery-node.json`.

---

## 2. O que funcionou

### 2.1 — A separação de dois produtores se sustentou fora do momento em que normalmente atua

`task/diagnose-composition-root/remove-withdrawn-dedup-layer` tinha implementação sem prova. O próprio registro de implementação já continha uma justificativa pronta, escrita pelo mesmo produtor que escreveu o código, para por que nenhuma prova seria possível. Em vez de aceitar essa justificativa (que teria sido o primeiro produtor decidindo, sozinho, que o segundo não precisa existir — exatamente a situação que a separação de contexto existe para prevenir), chamei um `test-author` fresco, sem mostrar a ele esse argumento como conclusão pronta, só como contexto a não aceitar de bandeja.

Ele investigou a árvore por conta própria (glob dos arquivos removidos, grep de todos os símbolos, leitura do entry point já entregue por outras tasks) e chegou à mesma conclusão, mas por um caminho próprio, citando evidência própria (`agentId: af67d51199b609ff1`, ver transcript). Isso é o desenho da separação funcionando como projetado — inclusive numa situação que o skill não previu explicitamente (reusar `test-author` sobre uma implementação semanas mais velha, fora de uma entrega em andamento).

### 2.2 — `--bind-record` evitou inventar mapeamento node↔arquivo em escala

Dos 90 achados, 70 vinham de "arquivo mudou sem rebind" sobre 14 arquivos, espalhados por 4 work roots diferentes (`case-authoring-mvp`, `investigation-engine`, `investigation-engine-v2`, `live-engine-mvp`). A alternativa a `--bind-record` seria eu mesmo decidir, para cada um dos ~44 pares node/arquivo, qual arquivo pertence a qual node — exatamente o "segundo julgamento sobre o que já foi dito" que a doutrina do framework proíbe (`bind_record`'s docstring: "the record is the only thing that knows which nodes reached the code and where"). Em vez disso, escrevi um script que leu o front-matter `nodes:`/`encoded_at:` de cada registro de implementação já existente, e usei os 12 registros certos como fonte — nenhum node/arquivo foi digitado por mim.

Isso só foi seguro porque `fold()` (a função interna de `trace.py`) faz *union* por padrão: cada chamada de `--bind-record` sem `--replace` só atualiza os arquivos que aquele registro específico nomeia, preservando o que outros registros já tinham contribuído para o mesmo node. Isso permitiu religar 12 registros, de 4 raízes de entrega diferentes, numa ordem qualquer, sem um religar destruir a contribuição do outro.

### 2.3 — O schema recusou, estruturalmente, uma tentativa de poluir `delivery.json`

Ao planejar o registro retroativo do fix ao vivo, descobri que `schemas/delivery-node.json` exige `task` em todo node `kind: implementation`, e que `bin/deliver.py` varre recursivamente qualquer `.md` sob um delivery root e recusa qualquer um que não seja `implementation/<epic>/<slug>.md`, `proof/<epic>/<slug>.md` ou `review/<slug>.md` (linha 899-908 de `deliver.py`). Isso me impediu de simplesmente colocar o registro retroativo dentro de `delivery/live-engine-mvp/` com um nome inventado — o que teria quebrado a validação inteira da entrega, ou (peor) exigido inventar uma task fantasma só para satisfazer o schema. A recusa estrutural me forçou a colocar o registro fora de qualquer delivery root, o que é o design certo: um fato sem task não é uma entrega, e o schema não deixou fingir que era.

### 2.4 — Fechar uma iniciativa não reescreveu nada que não precisava mudar

`plan.py work/live-engine-mvp` (sem raiz de especificação) confirmou o fechamento sem alterar `plan.json` — o conteúdo ficou byte-idêntico, porque "fechado" é um fato de presença de arquivo (`closure.md`), nunca um campo que um node de plano carregaria. Isso é exatamente a doutrina ("A plan node carries no status, estimate, priority or order field") se pagando na prática: não existe estado duplicado para ficar dessincronizado.

---

## 3. O que não funcionou, e o que isso custou

### 3.1 — Não existe ritual para um fix escrito fora de `/implement-task` — achado confirmado, não só nomeado

A sessão anterior já tinha *dito* isso em prosa (`Review/live-engine-mvp.md`). Esta sessão *mediu*: um único commit (`b24e387`) sem task, sem registro, sem `trace.py --bind` gerou 5 arquivos e ~20 pares node/arquivo de drift — mais da metade dos 90 achados totais. Isso não é um incidente raro: é o resultado inevitável de o próprio framework (`/implement-task`'s doutrina, seção "This invocation runs, and every run it makes is captured") reconhecer que testar contra um provedor real, fora de um mock, é necessário — mas não oferecer nenhum caminho formal para o que acontece quando esse teste real encontra um bug.

**Custo concreto**: tive que inventar, nesta sessão, uma convenção nova (`hotfixes/`, fora de todo delivery root) sem nenhum contrato, nenhum schema, nenhuma referência em nenhum skill. Funcionou porque `trace.py --bind-record` só exige um front-matter com `nodes:`/`encoded_at:`, sem validar contra `schemas/delivery-node.json` — um acidente de implementação que tornou a solução possível, não uma via oficial. A próxima sessão que passar por isso não tem como descobrir essa convenção lendo o framework; só lendo este relatório, ou o commit.

**Sugestão concreta**: um quarto `kind` no schema — `hotfix` ou `patch` — sem exigir `task`, exigindo em vez disso `provenance` (commit/sessão) e a mesma lista `nodes`/`files` que `implementation` já exige; e uma convenção de local nomeada (`delivery/<slug>/hotfix/<qualquer-coisa>.md`, com o `collect()` de `deliver.py` reconhecendo esse terceiro prefixo do mesmo jeito que já pula `run/`). Isso tornaria o que fiz hoje um caminho *documentado* do framework, em vez de uma invenção desta sessão.

### 3.2 — `trace.py` não tem comando para limpar um node removido da especificação

Dos 90 achados, 15 nunca puderam ser resolvidos: `rules/investigation/an-investigation-is-idempotent-within-a-window` e nodes correlatos foram removidos da especificação, e `--bind` recusa qualquer node que `nodes not in nodes` (linha 243 de `trace.py`). Isso é comportamento correto — não dá para religar contra algo que não existe — mas não existe *nenhum* comando complementar para dizer "esse vínculo é lixo conhecido, marca como resolvido" sem editar `siegard-trace.json` na mão, que o próprio CLAUDE.md proíbe.

**Custo concreto**: esses 15 achados vão aparecer em todo `trace.py --check` futuro, para sempre, indistinguíveis (sem contexto de conversa ou deste relatório) de um drift real que alguém devia investigar. Isso corrói o valor do próprio comando: quanto mais lixo permanente se acumula, menos um "N achados" significa alguma coisa.

**Sugestão concreta**: `trace.py --unbind <node> [--reason "..."]`, que só aceita remover um vínculo cujo node comprovadamente não existe mais na especificação (a mesma checagem que `--bind` já faz, invertida), e talvez escreva a remoção com um comentário/log em vez de silenciosamente — não uma edição livre de `siegard-trace.json`, mas uma abertura estreita e auditável para exatamente este caso.

### 3.3 — `deliver.py --outstanding` não distingue "falta prova" de "prova nunca vai existir, por design"

A frase "implemented, and no proof record holds it up" para `remove-withdrawn-dedup-layer` é idêntica, sintaticamente, à que apareceria para uma task genuinamente incompleta. Isso me custou um ciclo inteiro (spawn de `test-author`, leitura de toda a árvore por ele) só para descobrir que o estado já estava correto — um custo que toda sessão futura vai pagar de novo, porque nada no output diferencia os dois casos.

**Sugestão concreta**: deixar um registro de implementação declarar, estruturalmente (não em prosa dentro de `## Notes`), algo como `no_proof: "reason"` — analogamente a como `produces` já isenta a build de rodar. `--outstanding` leria esse campo e diria "implemented; no proof by design: <reason>" em vez da frase ambígua atual, e uma sessão futura não precisaria re-litigar o que esta e a sessão anterior já resolveram duas vezes.

### 3.4 — Nenhuma consulta pronta para "quem, hoje, é o dono deste arquivo/node" — precisei escrever forense ad hoc

Para descobrir qual dos 12 registros era a versão corrente de cada node/arquivo (4 work roots diferentes tocaram os mesmos arquivos ao longo do tempo), escrevi três scripts Python ad hoc que leem front-matter de todo `delivery/*/implementation/**/*.md` e cruzam com `git log`. Isso é exatamente o tipo de leitura que o framework já sabe fazer estruturalmente (é o que `trace.py --check` faz, e o que `bind_record` faz por registro) — só não existe um comando que responda "quais registros, em qualquer delivery root, dizem que encodam o node X ou o arquivo Y" sem eu reimplementar a varredura.

**Sugestão concreta**: `trace.py --candidates <node-ou-arquivo> <delivery-root>...`, só leitura, que lista todo registro que nomeia aquele node ou arquivo, com o commit que o escreveu — transformando o que hoje é uma hora de script manual (repetida por toda sessão que precisar disso) num comando de segundos.

### 3.5 — `--replace` tem uma armadilha silenciosa entre registros que compartilham um node

Descobri, só por ler `fold()` linha a linha antes de agir, que rodar `--bind-record --replace` para um registro que cobre metade dos arquivos de um node, seguido de outro registro que cobre a outra metade, *apagaria* a primeira contribuição — porque `--replace` substitui a lista inteira, não só os arquivos que aquela chamada nomeia. Evitei isso não usando `--replace` para o caso de união (grupo 3b), e usando `--replace` só onde eu já tinha a lista completa e correta na mão (os 4 nodes do "grupo 1 parcial"). Nada no `--help` do comando, nem na mensagem de erro, avisa sobre essa interação — uma sessão menos cuidadosa (ou uma futura, sem o contexto que esta construiu) poderia corromper o trace silenciosamente, e `--check` passaria a mostrar "limpo" tendo na verdade perdido vínculos legítimos.

**Sugestão concreta**: documentar essa interação no próprio texto de ajuda de `trace.py --bind-record`, ou — mais forte — fazer `--replace` avisar (ou recusar sem `--force`) quando outro registro, ainda válido, também nomeia o mesmo node com arquivos que a chamada atual não inclui.

### 3.6 — Iniciativas supersedidas ficam sem fechamento, e nada avisa

`investigation-engine-v2` e `case-authoring-mvp` nunca receberam `closure.md`, apesar de ambas terem sido superadas por iniciativas mais novas (`investigation-engine` → fechada; as outras duas, não). Isso não quebrou nada tecnicamente, mas foi exatamente por isso que precisei da arqueologia da seção 3.4: sem saber quais raízes de entrega ainda são "vivas", não há como saber, só olhando o framework, qual registro é a fonte da verdade para um arquivo tocado por várias.

**Sugestão concreta**: `/plan-work`, ao abrir uma iniciativa nova apontando para o mesmo `target`, poderia avisar (não bloquear) se encontrar work roots irmãos sem `closure.md` — um lembrete barato que evitaria o acúmulo de 3 iniciativas "vivas" ao mesmo tempo, como aconteceu aqui.

---

## 4. Números desta etapa

| Fato | Valor |
|---|---|
| Achados de `trace.py --check` (antes → depois) | 90 → 15 (redução de 83%) |
| Registros de implementação religados por leitura (`--bind-record`, sem `--replace`) | 11 |
| Vínculos corrigidos com `--replace`, listando só arquivos ainda existentes | 4 nodes |
| Binds manuais pontuais (arquivo único, para não misturar grupo 3a) | 2 |
| Registro retroativo escrito fora de todo delivery root | 1 (`hotfixes/judgment-citation-matches-real-fields.md`, 20 nodes) |
| Achados sem comando de correção possível | 15 (nodes removidos da especificação) |
| Iniciativas encontradas sem `closure.md` | 2 (`investigation-engine-v2`, `case-authoring-mvp`) — não fechadas nesta sessão, fora do pedido |
| Commits desta etapa | 2 (`351e124`, `cea4291`) |
| `deliver.py` (início → fim) | 18 nodes, 0 critério não atendido — inalterado |

---

## 5. Prioridade sugerida, se alguém for atacar isto

1. **3.1** (kind `hotfix`/`patch` no schema) — é o achado com maior recorrência esperada: qualquer teste real futuro contra um provedor vai gerar o mesmo drift, do mesmo jeito.
2. **3.3** (`no_proof` estruturado) — baixo custo de implementar, remove um ciclo inteiro de re-julgamento a cada sessão que encontrar o mesmo estado.
3. **3.2** (`--unbind`) — baixo custo, resolve um incômodo permanente que só cresce.
4. **3.4** e **3.5** — ferramentas de leitura/segurança, valiosas mas menos urgentes que os três primeiros.
5. **3.6** — o mais barato de todos (um aviso), o de menor risco se ignorado.
