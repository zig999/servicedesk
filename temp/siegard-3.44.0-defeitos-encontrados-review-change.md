# Dois defeitos do Siegard 3.44.0 encontrados durante `/deliver-scope connector-unavailable-refuses-simulation`

Encontrados e contornados na sessão que entregou `task/connector-observation-failure-classification/classify-connector-network-failure-as-unavailable`, durante a etapa de `/review-change`. Os dois já têm rascunho de feedback na fila local (`type: bug`); este arquivo é o detalhamento completo, com os comandos exatos para reproduzir.

Plugin: `siegard-generator/siegard` versão `3.44.0`, instalado em
`/home/siegfriedneto/.claude/plugins/cache/siegard-generator/siegard/3.44.0`.

---

## 1. `orchestration.md` na raiz de entrega — o skill manda escrever, `deliver.py` recusa

### O que o skill diz

`deliver-scope/SKILL.md`, seção "The orchestration log":

> **The orchestration log.** After each step, append one line to `orchestration.md` at the
> delivery root — what was invoked, the commit that followed by its hash, and the outcome, one
> sentence per line. It is a marker, never a node, exactly as `closure.md` is: **no contract holds
> it, the validator keeps it the way it keeps `intake/`**, and it is the one place the run's own
> decisions — the slug derived, the target decided, the order taken, the stop that ended it —
> survive the conversation that made them.

Ou seja: o próprio skill garante, textualmente, que "the validator keeps it" — que `bin/deliver.py`
tolera esse arquivo do mesmo jeito que tolera `intake/` (que fica sob o *work root*, não sob o
*delivery root*, mas o paralelo é explícito).

### O que `deliver.py` realmente faz

Depois de escrever `delivery/connector-unavailable-refuses-simulation/orchestration.md` com uma
linha por passo (plan, deliver, review), rodei:

```bash
python3 -B /home/siegfriedneto/.claude/plugins/cache/siegard-generator/siegard/3.44.0/bin/deliver.py \
  --outstanding \
  /home/siegfriedneto/projects/servicedeskn1/delivery/connector-unavailable-refuses-simulation \
  /home/siegfriedneto/projects/servicedeskn1/work/connector-unavailable-refuses-simulation \
  /home/siegfriedneto/projects/servicedeskn1/src \
  /home/siegfriedneto/projects/servicedeskn1/knowledge
```

Saída (exit code 1):

```
orchestration.md: not implementation/<epic>/<slug>.md, proof/<epic>/<slug>.md or review/<slug>.md; the path is the identity and this one computes to none. Material a judgment was read from belongs under run/, which is never validated as a node

1 problem(s) over 2 node(s). the outstanding report is not derived over a delivery that does not hold together.
```

Ou seja: qualquer arquivo solto na raiz do *delivery root* que não seja
`implementation/<epic>/<slug>.md`, `proof/<epic>/<slug>.md` ou `review/<slug>.md` é recusado.
`run/` é a única exceção conhecida ("Material a judgment was read from belongs under run/, which
is never validated as a node") — e `orchestration.md` não está nela.

Conferi isso no próprio código (`bin/deliver.py`), buscando por "orchestration": não há nenhuma
menção — nenhuma exceção foi codificada para esse marcador, ao contrário do que o texto do skill
promete.

### O contorno usado

```bash
cd /home/siegfriedneto/projects/servicedeskn1
git rm -q delivery/connector-unavailable-refuses-simulation/orchestration.md
git commit -q -m "deliver-scope connector-unavailable-refuses-simulation: drop orchestration.md

bin/deliver.py 3.44.0 refuses any file at the delivery root that is not
implementation/, proof/, review/ or run/ — including the orchestration.md
marker /deliver-scope's own SKILL.md says the validator tolerates. Removed so
--outstanding and /review-change can run; the run's own decisions stay in the
commit messages of 0d89cbe, faab25f and 7ca17c3."
```

As decisões que o `orchestration.md` guardaria (slug derivado, target decidido, ordem tomada,
onde o run parou) ficaram registradas nas próprias mensagens de commit da entrega
(`0d89cbe`, `faab25f`, `7ca17c3`, `d96468c`, `2b638f4`), que é o que o texto do skill diz que esse
arquivo existe para preservar "survive the conversation that made them" — só que por um caminho
que o validador de fato aceita.

### Rascunho de feedback já na fila

```
type: bug
title: deliver-scope SKILL.md says validator tolerates orchestration.md at delivery root; deliver.py 3.44.0 refuses it
area: siegard plugin (deliver-scope skill / bin/deliver.py)
```

---

## 2. `trace.py --fold` sob `--review` com `--node` não consegue dobrar arquivos sem vínculo

### O contexto

O passo de conformidade do `/review-change` manda estagiar assim (SKILL.md, seção "1. Situate"):

```
trace.py --stage <target-source-root> <specification-root> <review-name> <workspace> \
    <each path of the file set> --review --node <each node the tasks implement>
```

O `--node` existe precisamente para o caso descrito no próprio skill: "the plan's nodes ride
along on every file... A file the trace binds nothing to — a test, a file the records did not
name under `encoded_at` — is still handed a judge, over the plan's nodes alone." Ou seja: um
arquivo de teste, sem vínculo nenhum no rastro, ainda recebe um julgamento de conformidade — só
que sobre os nós do plano (`also`), não sobre nós vinculados (`nodes`).

### O comando exato

```bash
cd /home/siegfriedneto/projects/servicedeskn1
python3 -B /home/siegfriedneto/.claude/plugins/cache/siegard-generator/siegard/3.44.0/bin/trace.py \
  --stage src /home/siegfriedneto/projects/servicedeskn1/knowledge \
  connector-unavailable-refuses-simulation /tmp/review-ws-0X5B \
  src/errors/connector-unreachable.error.ts \
  src/investigation/http-declarative-observation-source.adapter.ts \
  src/__tests__/unit/errors/connector-unreachable.error.spec.ts \
  src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts \
  src/__tests__/unit/investigation/evidence-collection-stage.spec.ts \
  src/__tests__/unit/investigation/judgment-stage.spec.ts \
  --review \
  --node rules/integration/an-unreachable-connector-ends-unavailable \
  --node domain/investigation/evidence-result \
  --node rules/investigation/an-inconclusive-evaluation-declares-its-reason \
  --node rules/investigation/one-evaluation-per-required-hypothesis
```

Saída:

```
staged connector-unavailable-refuses-simulation: 6 file(s) to judge over 20 node(s); staged by a review — no pair omitted, and 4 plan node(s) read on every file without being bound; 0 file(s) with nothing left to judge; 0 file(s) the trace binds nothing to
```

Note a última contagem: **"0 file(s) the trace binds nothing to"**. Isso é enganoso — os 4 arquivos
de teste genuinamente não têm nenhum vínculo no `siegard-trace.json` (confirmado depois, olhando o
`manifest.json` gerado: `"nodes": []` para cada um deles, só `"also": [...]` com os 4 nós do
plano). O contador de "binds nothing to" não está contando esse caso porque `also` não é vazio.

Depois de rodar os 6 julgamentos (um `specification-conformance-reviewer` por arquivo, incluindo os
4 arquivos de teste, cada um lendo só os 4 nós do plano) e salvar os 6 retornos em
`siegard-reconcile/connector-unavailable-refuses-simulation.returns/`, tentei dobrar:

```bash
python3 -B /home/siegfriedneto/.claude/plugins/cache/siegard-generator/siegard/3.44.0/bin/trace.py \
  --fold src /tmp/review-ws-0X5B /tmp/review-ws-0X5B/premise.yaml \
  siegard-reconcile/connector-unavailable-refuses-simulation.md
```

Saída (exit code 2):

```
cannot fold: files: src/__tests__/unit/errors/connector-unreachable.error.spec.ts is named and no node accounts for it; a file the trace binds nothing to belongs under `unbound`, said rather than left out
cannot fold: files: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts is named and no node accounts for it; a file the trace binds nothing to belongs under `unbound`, said rather than left out
cannot fold: files: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts is named and no node accounts for it; a file the trace binds nothing to belongs under `unbound`, said rather than left out
cannot fold: files: src/__tests__/unit/investigation/judgment-stage.spec.ts is named and no node accounts for it; a file the trace binds nothing to belongs under `unbound`, said rather than left out

4 problem(s) in what the fold composed; this is a defect in the staging or the premise, and nothing was written.
```

O contrato de `siegard-reconcile.json` exige que todo arquivo de `files` seja "accounted for by a
node" ou declarado em `unbound` — e `unbound` só pode ser preenchido pela própria premissa
(`premise.yaml`), que por sua vez só reflete o que o `--stage` calculou. Tentei declarar `unbound`
manualmente na premissa e refiz o fold: mesmo erro, porque `--fold` lê o `unbound` do
**manifesto** (`manifest.json`, gerado pelo `--stage`), não da premissa — a premissa só pode listar
o que já está em `manifest["files"] | manifest["all_current"] | manifest["unbound"]`.

### A causa raiz, lida no código

Em `bin/trace.py`, na função de staging (por volta da linha 1366-1396):

```python
unbound: list[str] = []
...
for given in files:
    stored = stored_of[given]
    rows = sorted(index.get(stored) or [])
    if not rows and not also:
        unbound.append(given)
        continue
    assigned = []
    ...
    if assigned or also:
        judged_files[given] = assigned
    elif rows:
        all_current.append(given)
    else:
        unbound.append(given)
```

Um arquivo sem nenhuma linha (`rows` vazio) só cai em `unbound` **se `also` também estiver vazio**
(`if not rows and not also`). Como `--review --node <n>` sempre popula `also` com os nós do plano,
essa condição nunca é verdadeira para os 4 arquivos de teste — eles caem direto em
`judged_files[given] = assigned` (linha "if assigned or also"), com `assigned == []`. Ou seja, o
`--stage` os classifica como "arquivo a julgar" (com `nodes: []`, `also: [...]`), nunca como
"arquivo sem vínculo".

E do lado do `--fold` (por volta da linha 1585-1595), a lista de arquivos que a premissa *pode*
declarar `unbound` é justamente `manifest["unbound"]` — que para esses 4 arquivos está vazia,
porque o `--stage` nunca os colocou lá. Não há como a premissa corrigir isso por conta própria: o
schema (`reconciliation.json`) exige que todo `unbound` também esteja em `files`, e o `--fold` cruza
contra o manifesto, não aceita um `unbound` que o manifesto desconhece.

Testei isso também do lado do retorno de cada julgador: `return_problems()` (por volta da linha
1505-1535) recusa um retorno cujo `read` traga um nó fora do conjunto que a delegação recebeu —
então, se eu tivesse mandado os julgadores dos arquivos de teste responderem só pelos 4 nós do
plano (que é exatamente o que fiz, seguindo o próprio `manifest.json`), o retorno bate certo com o
que o manifesto pediu — o problema não está no retorno, está no manifesto classificando esses
arquivos como "a julgar" (`judged_files`) em vez de "sem vínculo" (`unbound`).

### O contorno usado

1. Tirei os 4 retornos dos arquivos de teste de
   `siegard-reconcile/connector-unavailable-refuses-simulation.returns/` e guardei à parte, em
   `siegard-reconcile/connector-unavailable-refuses-simulation.test-file-returns/` (para não
   perder o trabalho dos 4 julgamentos já feitos — cada um encontrou achados reais, que acabaram
   entrando no registro da revisão do mesmo jeito, só que colados manualmente).
2. Editei `/tmp/review-ws-0X5B/manifest.json` diretamente: removi as 4 entradas de teste de
   `"files"` e acrescentei seus caminhos em `"unbound"`.
3. Reduzi a premissa (`premise.yaml`) para não listar mais os 4 arquivos de teste em `unbound` (já
   que agora o manifesto corrigido é quem fornece essa lista).
4. Rodei `--fold` de novo — dessa vez passou, aplicando as próprias regras do fold sem mais
   nenhuma edição manual:

```
folded connector-unavailable-refuses-simulation.md: 16 node(s) cleared, 3 not — 0 of those collateral, blocked only by an unattributed sibling finding — 0 pair(s) omitted as current and unowed
```

5. Segui o resto da cadeia normalmente: `--reconciliation` (checagem de forma) e
   `--bind-record` (recarimbou 16 vínculos, deixou 3 como estavam, porque a conformidade encontrou
   *contradicts* contra eles).

Os 4 achados dos arquivos de teste (fatos não-declarados sobre `fetch`-only, desempate de timeout,
body não-parseável, `capability_name`/`capability_version`) não se perderam: entraram no registro
final da revisão (`delivery/connector-unavailable-refuses-simulation/review/connector-unavailable-refuses-simulation.md`)
como achados de `conformance`, só que lidos de
`siegard-reconcile/connector-unavailable-refuses-simulation.test-file-returns/` em vez do
diretório oficial `.returns/`.

### Rascunho de feedback já na fila

```
type: bug
title: trace.py --fold cannot fold a --review staging that passed --node over files the trace binds nothing to
area: siegard plugin (bin/trace.py --stage --review / --fold)
```

---

## Por que registrar isso aqui

Nenhum dos dois contornos mudou o que a revisão encontrou — só o caminho para escrever os
registros. Guardado em `temp/` (nunca em `docs/`, por convenção deste projeto) para eventual
consulta, e para acompanhar os rascunhos de feedback já na fila local (`/feedback` para revisar e
enviar, se quiser).
