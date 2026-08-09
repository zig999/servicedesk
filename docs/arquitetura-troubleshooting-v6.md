# Gestão do Conhecimento de Troubleshooting — v6

Especificação para implementação. Incorpora três mudanças sobre a v5. **Primeira:** o case deixa de
ter dois modelos — em edição e publicado — porque **não existe case em edição**. Todo case que
existe é publicado; a distinção era artificial, e a pergunta que ela empurrava para depois — quem
aprova a publicação (L7 da v5) — se dissolve pelo mesmo motivo da Decisão 2, abaixo: não é decisão
do domínio. Ver §4.4. **Segunda:** três value objects que a v5 deixava sem forma própria ganham
estrutura — `Capability` (§3.1) e `Concept` (§3.2), que a v5 só resumia no context map, e
`Assessment` (§5.4), cujos campos já estavam ditos mas nunca reunidos num bloco. **Terceira:** os
identificadores técnicos — nomes de entity, atributo e função — passam para o inglês (en-US); o
que o curador escreve (o criterion, o corpo do case, o vocabulário de case) continua em português.
Isso reverte o argumento do §8 sobre identificadores em português; ver lá o que mudou e por quê. Das
quatro decisões que abriam a v5, a 1 continua fechada (síncrono) e a 2 continua dissolvida (o
subject type é campo do case, não decisão global); nenhuma das duas muda nesta versão.

As versões anteriores permanecem como registro do raciocínio — v2 (o modelo rico e por que ele era
demais), v3 (a simplificação: a LLM parou de orquestrar), v4 (a disciplina DDD aplicada), v5 (as
quatro decisões que precedem a implementação, duas fechadas).

---

## 1. As quatro decisões que precedem a implementação — duas fechadas

Não são lacunas de conteúdo a preencher depois. São decisões cujas respostas mudam código, e cada
uma tem custo alto de retrofit. A numeração é mantida porque o resto do documento a referencia.

| | Estado |
|---|---|
| Decisão 1 — síncrono ou job | **fechada:** síncrono |
| Decisão 2 — quem é o subject | **dissolvida:** é campo do case |
| Decisão 3 — timeouts e prazo global | aberta |
| Decisão 4 — os quatro vocabulários | aberta |

**Correção da v6, fora dessa numeração:** o case não tem estado de edição — todo case que existe é
publicado (§4.4). Não entra nas quatro porque não muda código de execução; muda o modelo de
autoria, e por isso é descrita onde o case é descrito, não aqui.

### Decisão 1 — Síncrona. **DECIDIDA.**

O atendente aguarda a resposta na tela. Consequências, todas obrigatórias:

**Orçamento de tempo declarado como prazo, não como soma.** A decomposição abaixo é proposta de
engenharia; o total é decisão de operação.

```
prazo total          20s   (proposto — confirmar com operação)
├── overhead+margem   2s   idempotência, carga e pino do case, normalização,
│                          serialização, rede entre etapas
├── collection        7s   paralelo, então é o timeout do concept mais
│                          lento, não a soma
├── judgment          5s   paralelo por hypothesis, com pool limitado
├── writing            4s
└── persistência      2s   com retry dentro do que sobrar
```

**O prazo é absoluto e propagado, e é isso que faz a conta fechar.** Na entrada da requisição
grava-se um instante limite; cada etapa recebe `min(orçamento nominal da etapa, prazo restante)`,
nunca o seu orçamento nominal isolado. Uma etapa que termina cedo devolve o saldo à seguinte; uma
que se atrasa o toma das seguintes, e a última a rodar é quem paga. Somar orçamentos por etapa e
chamar a soma de prazo é o erro que este documento cometia até esta correção: a soma dava
exatamente o total, sem nada para o overhead que existe **entre** as etapas.

O prazo interno total tem que ser **menor** que o timeout do chamador, com margem — senão o
atendente vê erro de rede em vez de um assessment degradado.

**Cada etapa degrada, nenhuma falha — com uma exceção declarada.** Estourar o prazo da collection
não aborta: produz evidence com `result: timeout` para o que não chegou, e a investigation segue.
Estourar o do judgment produz `inconclusive / deadline-exceeded`. É essa regra que garante uma
resposta em tempo limitado; sem ela, o orçamento é intenção.

A exceção é a **persistência**, e ela é obrigatória: pela invariante 11 não há resposta sem
registro, então uma escrita que não conclui dentro do que sobrou do prazo é erro ao atendente, não
degradação. É a única etapa isenta da invariante 12, e é isso que lhe dá orçamento próprio e retry
dentro do prazo restante.

**Persistir antes de responder, e a resposta sai inteira.** Uma versão anterior deste documento
entregava o referral à tela antes da writing, para o atendente agir alguns segundos mais cedo. Isso
contradiz a invariante 11 e **a invariante 11 é a correta**: o referral é justamente a parte sobre a
qual se **age**, e agir sobre assessment sem registro é o que a invariante existe para impedir. A
resposta é uma só e sai depois da writing. O custo aceito é latência percebida — o atendente espera
a writing para ver a ação.

**A segunda onda para hypotheses custosas (R2) fica inviável.** Serializar duas ondas não cabe em
20s. Em modo síncrono, uma hypothesis custosa cabe no paralelo ou o case não a inclui — o que torna
a disciplina de timeout por capability (Decisão 3) mais importante, não menos.

### Decisão 2 — O subject type é declarado pelo case. **Não é decisão global.**

Um case de "cliente sem internet" investiga um contrato; um de "cliente não recebe fatura" investiga
um cliente; um de "OLT saturada" investiga um equipamento de rede; um de "incidente em bairro"
investiga uma região. Fixar um subject type para o sistema é deixar um case específico ditar o
modelo — e foi o que a v5 fez até esta correção.

O subject é dimensão do case:

- o **case** declara `subject: <type>`
- o **glossary** guarda os subject types como quarto vocabulário fechado
- cada **concept** declara quais types accepts; a capability resolve internamente o que precisar
  derivar (endereço a partir do contrato, região a partir do acesso) — derivação é trabalho da ACL,
  nunca do case
- o **validator** recusa, na publicação, case cujos `collects` contenham concept que não accepts o
  `subject` declarado

**Isso deixa de ser pré-requisito de código.** Virou campo de schema mais vocabulário, com a mesma
mecânica dos outros três. O que resta é o conjunto inicial de types, e ele se descobre com os
primeiros cases em vez de ser projetado antes deles.

**O ponto de entrada não é o subject.** O atendente tem o cliente na linha; o case escolhido diz
qual identificador é necessário, e a interface resolve cliente → subject exigido, perguntando qual
quando há mais de um. Resolução de identidade é da interface; o subject da investigation é o que o
case declara.

### Decisão 3 — Timeout por capability e prazo global da collection

Cada capability declara seu timeout; a collection tem prazo global. Estourar não é exceção: produz
evidence com `result: timeout`. Sem esses dois números, um sistema lento pendura a investigation.

### Decisão 4 — Os quatro vocabulários fechados

`subject type`, `outcome`, `action`, `recipient`. O validator não pode ser escrito antes deles, e a
invariante de publicação depende deles.

Os quatro têm naturezas diferentes, e tratá-los igual é erro:

| Vocabulário | Natureza |
|---|---|
| `recipient` | **global e estável** — filas operacionais reais; papel, nunca pessoa |
| `action` | **global** — o que o recipient faz. Termo novo entra quando muda o que alguém faz, nunca quando muda o motivo |
| `subject type` | **descoberto** — cresce com os cases; cada case declara o seu |
| `outcome` | **contribuído** — cada hypothesis confirmável de cada case contribui um; registrado globalmente só para não derivar em grafia e para permitir relatório entre cases |

Só um subconjunto precisa existir antes do primeiro case: os recipients, as actions desse case, e
os dois outcomes de não-conclusão (`inconclusive-no-data`, `inconclusive-hypotheses-exhausted`). O
resto se descobre escrevendo cases.

---

## 2. Destilação: onde está o core

| Subdomínio | Natureza | Consequência |
|---|---|---|
| conhecimento curado — quais hypotheses, o que as confirma, qual domina qual | **core** | é onde o esforço de modelagem se paga |
| execução — colher, julgar, resolver outcome | **supporting** | fino e óbvio |
| acesso aos sistemas corporativos | **generic** | substituível por construção |

**O modelo do core está no schema do case, não em classes.** O schema é o modelo e o validator é
parte do modelo — não utilitário de build. O custo é real: nada é imposto em tempo de compilação,
então o modelo só é exercitado por validação e teste. É por isso que §4.5 enumera as regras.

## 3. Context map

```
┌─ glossary ───────────────────────────────────────────────────────
│  subject types · outcomes · actions · recipients
│  concepts { accepts: [subject type], ttl }
│  Published Language de todo o sistema — dado puro, sem comportamento
└────────┬──────────────────────────────────────────────┬──────────
         │                                              │
         ▼                                              ▼
┌─ knowledge ─────────────────────────┐  ┌─ integration ────────────────────
│  Case                               │  │  Capability  name · version ·
│   value object, sempre publicado    │  │   schemas · timeout · nature
│   (sem estado de edição — v6)       │  │  Normalizer  ← ACL
└────────┬───────────────────────────┘  │  Connectors  ifs · oracle ·
         │  Published Language:         │              crm · radius
         │  o case, imutável,           └────────▲─────────────┬───────────
         │  identificado por conteúdo             │             ▼
         │  Customer/Supplier:                    │      Corporate Systems
         │  contrato verificado a cada leitura    │
         ▼                                        │
┌─ investigation ───────────────────────────────────┘
│  Investigation (entity, escrita uma vez)      Open Host Service:
│  port HypothesisEvaluator ◄── adapter LLM     capability
└──────────────────────────────────────────────────────────────────
```

Três leituras do mapa que a implementação precisa respeitar:

**O glossary é dependido pelos três.** A ACL traduz para o vocabulário do glossary, então
`integration` depende dele — não de `knowledge`. Sem isso explícito, nomes de concept se duplicam
dentro de `integration` e a ACL deixa de ser uma ACL.

**O normalizer é uma Anticorruption Layer.** Parece boilerplate e é a única coisa impedindo o
vocabulário do Oracle de virar vocabulário do domínio. Uma ACL não se simplifica.

**`knowledge → investigation` é Customer/Supplier, e é isso que exige a checagem a cada leitura
válida do case — não há mais um instante de "publicar" para ancorá-la (v6).** Um case que nomeia
concept sem capability é inválido: não existe como case, o mesmo tratamento de qualquer outra regra
do validator (§4.5). Se a checagem só roda na execução, o curador descobre o erro durante uma
ligação de cliente.

### 3.1 `Capability`: estrutura

A v5 tratava `Capability` como presença — name, version, timeout, nature no context map; sujeito
das regras de contrato em §4.5 — sem nunca declarar sua forma completa. Fechando:

```
Capability  (value object; identificada por name + version — os mesmos
             dois campos que Evidence.capability já carregava, §5.2)
├── name
├── version
├── nature            read-only — a única que o registry aceita
│                     (invariante 5); o field existe para o registry
│                     ter o que recusar, não porque outro valor é válido
├── inputSchema       forma que Evidence.inputs tem que respeitar
├── outputSchema      forma que Evidence.observation tem que respeitar —
│                     toda citation {concept, field} de uma Evaluation
│                     (§5.3) tem que existir aqui; é essa checagem que a
│                     regra 13 e a invariante 2 exigem
├── timeout           orçamento próprio da capability dentro do prazo
│                     global da collection (Decisão 3)
└── connector         qual dos adapters de integration a executa —
                      ifs · oracle · crm · radius (§3)
```

Os cinco primeiros campos já estavam implícitos: `name`/`version` são os dois que
`Evidence.capability` já carregava; `schemas` (plural, no context map) sempre foi entrada e saída,
só nunca decomposto; `timeout` e `nature` já apareciam nas regras 12–13. **`connector` é acréscimo
desta revisão** — sem ele, uma capability tem contrato mas nenhuma forma declarada de saber qual
sistema a implementa, e o context map já desenhava essa aresta separadamente (a caixa `Connectors`)
sem nunca ligá-la a `Capability`. É decisão de modelagem, não fato que o material já continha, e
fica marcada como tal para quem revisar.

O **registry** (§14) é o que resolve `concept → Capability`, 1:1 (regra 12; fallback cortado na v3,
§15). Não precisa de estrutura própria além de ser essa tabela — é a peça mais genérica do sistema
(§2), e não há nada nela que a curadoria de cases precise ler.

### 3.2 `Concept`: estrutura

A mesma lacuna de `Capability` valia para `Concept`: o context map (§3) o resumia como
`concepts { accepts: [subject type], ttl }`, e é assim — por name, sem bloco próprio — que
`Hypothesis.collects`, `Evidence.concept` e toda citation `{concept, field}` (§5.3) o referenciam.
Fechando:

```
Concept  (value object do glossary; identificada por name — o mesmo
          name que Hypothesis.collects, Evidence.concept e toda
          citation {concept, field} usam)
├── name
├── accepts: [subject type]   quais subjects ele pode descrever — é o
│                             que a regra 11 checa contra o `subject`
│                             do case
└── ttl                       a tolerância mais estrita entre os cases
                              que o usam (§5.2) — o que o cache
                              (dia 2) respeita
```

Três campos, e nenhum a mais: depois de fechar `Capability`, ficou explícito que o output schema —
o que bounds a citation `{concept, field}` — pertence à capability que produziu a evidence, não ao
concept. `Concept` fica deliberadamente fino — é o name publicado e as duas restrições que o
glossary precisa garantir; a forma do dado é contrato de quem o produz.

---

## 4. O modelo do knowledge

### 4.1 Estrutura do case

```
Case  (um markdown por case, versionado em git)
├── slug · title · when_to_use
├── subject: <type>                    do vocabulário do glossary
├── hypotheses, em ordem de precedência:
│     ├── name                         único no case
│     ├── collects: [concept]          ≥1 — a investigation da hypothesis
│     ├── criterion: <em linguagem de negócio>
│     ├── outcome
│     └── referral { action, recipient }
└── fallback: outcome + referral
```

A investigation de cada hypothesis é o par **collects + criterion**, inline no arquivo do case.
Duplicar uma hypothesis entre cases custa seis linhas visíveis e editáveis; extraí-la para nó
próprio custa um tipo de nó, resolução de referência, versionamento independente e a pergunta "de
quem é o outcome". **Gatilho para revisar: a terceira duplicação.**

`fallback` é uma hypothesis default disfarçada, e fica explícita de propósito: um fallback não
afirma nada sobre o mundo.

**`coletas_iniciais` foi cortado.** Existia na v4 como contexto para a writing, e a writing passou a
ter entrada estreitada (§5.4) exatamente para não poder contradizer o outcome. As duas coisas se
cancelavam: era custo de collection em toda investigation sem invariante que o governasse.

### 4.2 Formato: três audiências, três formatos

| Quem consome | O quê | Formato |
|---|---|---|
| o motor | collects, ordem das hypotheses, outcome, referral | YAML no frontmatter, validado por schema |
| a LLM que julga | o criterion de **uma** hypothesis + as evidences dela | prosa curta, uma a três frases |
| o curador humano | por que a hypothesis existe, nuance, histórico | prosa no corpo, **fora** de qualquer prompt |

**Regra que impede a deriva: nada no corpo pode mudar o que é collected.** Se muda, é frontmatter.

**Por que não tudo em prosa.** O motor não interpreta texto. Extrair a lista de concepts exigiria
uma LLM decidindo o que olhar — o que a v3 removeu — e a extração é não determinística, então o
collection plan do mesmo case mudaria entre duas execuções e o replay morre. Prosa também não é
validável: um schema recusa hypothesis sem collect; um bloco de texto não pode ser recusado por
estar incompleto.

**Por que não tudo estruturado.** Estruturar o criterion transforma knowledge em código e devolve a
curadoria ao desenvolvedor. É o único campo onde a nuance do especialista é o valor.

**O que substitui o determinismo no criterion** é rastreabilidade imposta: a evaluation cita
`{concept, field}`, e o field tem que existir no output schema da capability — então **a validade da
citation é checável por máquina** (§5.3). Sem isso, rastreabilidade é promessa que não sobrevive
seis meses.

Duas regras de escrita, verificadas por revisão humana e não por validator: **uma afirmação
falsificável por hypothesis** ("confirma quando X, ou também quando Y" são duas hypotheses), e a
ordem das hypotheses reflete a precedência que os especialistas afirmam.

### 4.3 Exemplo

```yaml
case: cliente-sem-internet
title: Cliente sem internet
when_to_use: cliente relata ausência total de conexão
subject: contrato             # este case investiga um contrato; outro case
                              # investiga um cliente, uma OLT, uma região

hypotheses:                   # A ORDEM É A PRECEDÊNCIA — ver L1
  - name: incidente-regional
    collects: [incidentes-na-regiao]
    criterion: há incidente aberto cobrindo a localidade do cliente
    outcome: incidente-regional
    referral: { action: informar-prazo, recipient: atendimento }

  - name: ordem-em-andamento
    collects: [ordens-em-andamento]
    criterion: existe ordem de serviço em execução no cliente
    outcome: intervencao-tecnica-em-curso
    referral: { action: informar-ordem, recipient: atendimento }

  - name: bloqueio-financeiro
    collects: [situacao-financeira]
    criterion: o acesso está bloqueado por inadimplência
    outcome: bloqueio-financeiro
    referral: { action: orientar-pagamento, recipient: atendimento }

  - name: onu-offline
    collects: [estado-do-equipamento]
    criterion: o equipamento do cliente não responde
    outcome: onu-offline
    referral: { action: abrir-ordem-corretiva, recipient: suporte-n2 }

fallback:
  outcome: inconclusivo
  referral: { action: escalar, recipient: suporte-n2 }
```

```markdown
## bloqueio-financeiro                              ← corpo: só para o curador
Aparece muito em recorrência de cobrança no dia 5. Não confundir
suspensão por inadimplência com suspensão a pedido do cliente.
```

A ordem acima é **ilustrativa**. Qual causa domina qual é fato de domínio (L1). Vale notar que
`onu-offline` é frequentemente sintoma das outras três, o que sugere última posição — hypothesis a
confirmar com especialista, não fato.

### 4.4 O case não tem estado de edição, e seu comportamento

**Correção da v5.** A v5 modelava `Case` como dois modelos — uma entity em edição, no contexto de
autoria, traduzida para value object ao publicar (§5.6 da v5). Essa dualidade cai: **todo case que
existe é publicado.** Não há transição de publicar e não há rascunho no domínio — o trabalho em
curso é um branch ou uma PR, um fato de git, nunca um estado que o modelo do knowledge precisa
representar. A pergunta "quem aprova a publicação" (L7 da v5, §12) se dissolve pelo mesmo motivo da
Decisão 2: não é decisão do domínio. `Case` é **value object, sempre** — identificado por conteúdo
(`slug + version + hash`), exatamente como a v5 já descrevia para o lado que ela chamava de
"publicado". A validação (§4.5) deixa de ser "checagem no ato de publicar": é o que decide se o
arquivo pode existir como case, e roda toda vez que o arquivo é lido — a cada commit, a cada carga
pelo motor — sem porta intermediária.

O case não é estrutura de dados que um serviço percorre — é onde a lógica mora:

```
case.collectionPlan()               -> Set<Concept>
      união dos collects de todas as hypotheses, deduplicada

case.requiresEvaluationOf()         -> [Hypothesis]
      base da checagem de totalidade

case.resolveOutcome(evaluations)    -> Assessment
      primeira hypothesis confirmada na ordem declarada → seu outcome,
      seu referral, e ela como determiningHypothesis;
      nenhuma confirmada → fallback, sem determinante
```

A precedência é knowledge que o case declara, então resolvê-la é comportamento do case. Deixá-la no
serviço de aplicação é o modelo anêmico: o serviço lendo `case.hypotheses` e decidindo por ele.

As três operações são testáveis sem collection, sem LLM e sem integration — **a regra de negócio
mais importante do sistema ganha teste unitário puro.** O serviço de aplicação encolhe para: pedir
o plan, executar a collection, pedir os judgments, pedir o assessment, escrever, persistir.

`resolveOutcome` **não** marca hypothesis como "superada": todas são judged e todas têm verdict.
Precedência escolhe a determinante; as outras mantêm o verdict que receberam. Isso preserva o sinal
mais valioso da projeção — duas hypotheses confirmarem com frequência é o que revela que a ordem de
precedência está errada.

### 4.5 Regras do validator

O validator é parte do modelo. Estas são as regras, e são todas.

**Estruturais**

1. `slug` casa com o name do arquivo
2. `hypotheses` tem ao menos uma entrada
3. name de hypothesis único dentro do case — `evaluations[]` é indexado por name e colidiria em silêncio
4. `collects` de cada hypothesis tem ao menos um concept — hypothesis sem collect não pode citar nada, e a invariante 2 seria insatisfazível para ela
5. `criterion` presente e não vazio
6. `outcome` e `referral{action,recipient}` presentes em cada hypothesis e em `fallback`

**Vocabulário**

7. `subject` é um type existente no glossary
8. todo concept citado existe no glossary
9. todo `outcome`, `action` e `recipient` existe no glossary
10. todo concept citado tem `ttl` definido no glossary

**Coerência de subject**

11. todo concept em `collects` **accepts** o `subject` declarado pelo case — é o que impede um case
    de subject `cliente` pedir `estado-do-equipamento`

**Contrato, verificado a cada leitura válida — não há mais um ato de publicar (v6)**

12. todo concept nomeado tem capability registrada
13. a capability é `read-only` e declara output schema e timeout

**Revisão humana, não validável**

- um criterion, uma afirmação falsificável
- a ordem das hypotheses é a precedência que os especialistas afirmam

---

## 5. O modelo da execução

### 5.1 Fluxo

```
Atendente escolhe o case          (ou o ticket já traz a categoria)
        │  + subject + narrative
        ▼
chave de idempotência → investigation existente na janela? devolve ela
        │
        ▼
Case pinado { slug, version, hash }
        │
        ▼  case.collectionPlan()
╔═ COLLECTION ═════════════════════════════════════════════════════╗
║  conjunto de concepts, em paralelo, read-only,                   ║
║  no escopo de autorização do requester                           ║
║  timeout por capability · prazo global · estouro = result        ║
║                                                                  ║
║   concept      concept      concept      concept                 ║
║      └────────────┴─────┬──────┴────────────┘                    ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼ uma Evidence por concept (normalizada)
╔═ JUDGMENT ═══════════════════════════════════════════════════════╗
║  port HypothesisEvaluator — uma chamada por hypothesis, em        ║
║  paralelo, pool limitado, recebendo só o criterion dela e as      ║
║  evidences dela · resposta validada · retry se o prazo couber     ║
║  · fallback inconclusive com reason                              ║
║                                                                  ║
║   hypothesis 1   hypothesis 2   hypothesis 3   hypothesis 4      ║
║   confirmed      refuted        refuted        inconclusive      ║
║   + citations                                  reason: no-data   ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼  case.resolveOutcome(evaluations)
Assessment { outcome, referral, determiningHypothesis }
                          │            declarados pelo case
                          ▼  writing com entrada estreitada
Texto para o recipient
                          │
                          ▼  escrita única
Investigation persistida ──► evento InvestigationCompleted
                          │
                          ▼  só agora, e inteira — invariante 11
Resposta ao requester { referral, text }
```

### 5.2 Collection

- **Paralela, read-only, com pool limitado.** O conjunto vem de `case.collectionPlan()`, então há
  exatamente uma evidence por concept.
- **Timeout por capability e prazo global** (Decisão 3). Estouro produz evidence com
  `result: timeout`, nunca exceção — a ausência de dado tem que ser um fato registrado.
- **No escopo de autorização do requester**, propagado até o connector. Se o que o atendente pode
  ver é limitado, a collection tem que respeitar isso; retrofitar depois significa reescrever todos
  os connectors.
- **Normalização obrigatória** — a evidence chega no vocabulário do glossary, nunca no do sistema de
  origem. O vazamento tecnológico acontece na resposta, não na chamada.

**A alavanca de latência do dia 1 é o timeout agressivo por capability, não o cache.** Em modo
síncrono, falhar rápido para `result: timeout` vale mais que esperar por um dado que talvez venha:
uma hypothesis `inconclusive / no-data` dentro do prazo é um result; um assessment fora do prazo não
é.

**Cache — dia 2.** O motivo mudou com a Decisão 1: não é mais "porque o retry é barato", é **porque
o cache não ajuda o caminho frio**, que é justamente o que está sob pressão de tempo. Ele encurta a
segunda investigation do mesmo subject dentro do ttl — a cauda, não a mediana. Quando entrar: chave
`(concept, subjectType, subjectId, inputs)` — o type entra na chave porque ids de types diferentes
colidem — ttl do glossary, e **só evidence com `result: ok` entra**: cachear indisponibilidade faz a
próxima investigation herdar uma falha já resolvida.

O `ttl` fica no concept, e representa a **tolerância mais estrita** entre os cases que o usam. Um
case mais tolerante simplesmente não aproveita cache que poderia — ttl curto nunca produz erro, só
menos eficiência. Sobrepor ttl por case é possível e fica fora do escopo até que a medição mostre
perda real.

```
Evidence  (value object, identificada pelo concept na investigation)
├── concept
├── capability { name, version }
├── inputs
├── observation           normalizada, no vocabulário do glossary
├── observedAt · ttl · origin
└── result                ok | unavailable | denied | timeout  (+ detalhe)
```

### 5.3 Judgment

```
domínio           port HypothesisEvaluator
                    evaluate(hypothesis, evidence) -> Evaluation

infraestrutura    LLMEvaluator          produção
                  FakeEvaluator         teste
                  RuleEvaluator         opção futura, criterion mecânico
```

Julgar não pode ser domain service: a regra que aplica não está no código, está na prosa do case.
Como port, a tensão entre criterion em prosa e criterion mecânico se resolve por adapter — sem
segunda forma no schema e sem o curador ter que escolher nada.

```
Evaluation  (value object, identificada pelo name da hypothesis)
├── hypothesis
├── verdict     confirmed | refuted | inconclusive
├── reason      obrigatório se inconclusive:
│                 no-data | judgment-failure | deadline-exceeded
└── citations   [{ concept, field }] — ≥1 se confirmed ou refuted
```

**Contrato da resposta, validado pelo adapter:**

- `hypothesis` é a que foi pedida
- `verdict` está no enum
- todo `concept` citado está nos `collects` daquela hypothesis — o prompt não continha outros
- todo `field` citado existe no output schema da capability que produziu aquela evidence

**Falha do judgment não pode inviabilizar a investigation.** A invariante 1 exige uma evaluation por
hypothesis e a factory não produz instância inválida — então, sem tratamento, uma resposta ruim mata
a requisição inteira. Política: validar, **um retry condicionado ao prazo restante**, e fallback
para `inconclusive / judgment-failure`.

A condição importa em modo síncrono: um retry dobra a latência daquela hypothesis, e todas correm em
paralelo dentro do prazo da etapa. Se o que sobrou do prazo não cabe uma segunda tentativa, vai
direto ao fallback — o prazo vence o retry, sempre.

**O judgment tem pool limitado, como a collection — e é ele que tem cota externa.** O número de
chamadas simultâneas ao provedor é limitado, então uma hypothesis pode nunca receber slot antes de o
prazo da etapa vencer. Esse caso não é `no-data`, porque os dados chegaram, nem
`judgment-failure`, porque nada falhou: é **`deadline-exceeded`**, e o mesmo reason cobre a chamada
que iniciou e não voltou a tempo.

Confundir os três não é questão de precisão vocabular — envenena a projeção de §7. Ler
`judgment-failure` recorrente como "prompt, model ou criterion ambíguo" quando a causa é fila
aponta a curadoria para o lugar errado, e o sinal que diria "o case tem hypotheses demais" (R5)
desaparece dentro do sinal errado.

O reason é obrigatório justamente por isso: **`inconclusive` por falha técnica, por fila e por falta
de dado não podem ser indistinguíveis.** Sem essa distinção, uma falha de infraestrutura é lida como
fato do domínio — a patologia que o resto do sistema existe para evitar.

**Prompt de judgment fechado:** só o criterion daquela hypothesis, só as evidences dela, e a
instrução de que o que não se deduz da evidence é `inconclusive`, nunca inferência. Evidences em
bloco de dados delimitado — dado é dado, nunca instrução.

Julgar cada hypothesis isolada e em paralelo dá três coisas além do custo: prompt pequeno, nenhum
viés de ordem, e erro contido em uma hypothesis.

**Limite epistêmico, escrito em vez de mascarado:** o judgment é uma operação de domínio não
determinística, e o DDD não tem padrão para isso. A garantia que o domínio oferece não é "correto" —
é **citado e completo**.

### 5.4 Assessment e writing

```
Assessment  (value object)
├── outcome                 do vocabulário do glossary — vem sempre de
│                           case.resolveOutcome(), nunca decidido aqui
├── referral                { action, recipient } — idem, do case
├── determiningHypothesis?  name da hypothesis confirmada; ausente
│                           quando nenhuma confirma (fallback)
└── text                    o que a writing produz — o único dos
                            quatro campos que esta seção decide
```

`outcome`, `referral` e `determiningHypothesis` vêm de `case.resolveOutcome()`. A LLM só escreve o
text, e **recebe entrada estreitada** — nada impede um text de contradizer o outcome, exceto não
lhe dar material para isso:

| Outcome | O que a writing recebe |
|---|---|
| hypothesis confirmed | narrative · determining hypothesis · evidences **dela** · outcome · referral |
| nenhuma confirmed | narrative · todas as hypotheses com verdict e reason · referral |

O segundo caso é o único em que amplitude é o ponto: quando nada confirmou, o valor do assessment é
dizer o que foi descartado e por quê. Em nenhum dos dois a writing vê o corpo do case — prosa para
curador não entra em prompt.

### 5.5 `Investigation`: resultado imutável

Um aggregate existe para guardar invariantes **entre mutações**. As invariantes aqui são de
**completude**, verificadas uma vez. Isso não pede aggregate — pede uma **factory que não sabe
produzir instância inválida**.

```
Investigation  (entity; escrita uma vez, nunca mutada)
├── id · requester · subject { type, id } · ticketRef?     ← L2
├── narrative
├── caseRef { slug, version, hash }       ─┐
├── promptVersion · model                 ─┤ pinos do replay
├── evidence[]                            ─┘
├── evaluations[]
├── assessment                             § 5.4
├── cost      { calls, inputTokens, outputTokens }
└── durations { collection, judgment, writing, total }
```

Sem orçamento, sem passos, sem encerramento: o fim é uma condição verificável, não estado a manter.

**Escrita única no fim.** Persistir em etapas reintroduz estados intermediários e o aggregate que a
v3 cortou. Um crash antes da escrita custa a re-execução — aceitável porque a collection é read-only
e paralela.

**Idempotência — e em modo síncrono ela deixa de ser refinamento.** Um atendente que espera 20s
clica duas vezes e atualiza a página; sem chave, cada impaciência custa uma investigation inteira.

Chave `(subjectType, subjectId, case, ticketRef?)` dentro de uma janela configurada, com dois
comportamentos distintos:

- investigation **concluída** na janela → devolve ela
- investigation **em andamento** → a segunda requisição se anexa à primeira, nunca inicia outra

O marcador de "em andamento" é um **lease na store de idempotência** — só a chave e um instante. Não
é estado da `Investigation`, que continua escrita uma vez. A distinção é o que mantém a invariante 9
de pé.

**Replay** exige que o índice de cases guarde **todas** as versões do case, não a última — cada uma
delas publicada por definição (v6), já que não existe outro type. Se guardar só a última,
investigations antigas perdem reprodutibilidade em silêncio, e isso só se descobre quando alguém
precisa auditar.

### 5.6 Entities e value objects

| | |
|---|---|
| `Investigation` | **entity** — tem identidade, é referenciada de fora |
| `Case` | **value object** — identificado por conteúdo (`slug + version + hash`); sempre publicado, sem estado de edição (v6, §4.4) |
| `Evidence` · `Evaluation` · `Assessment` · `Capability` | **value objects** |

Como o collection plan é um **conjunto**, há exatamente uma evidence por concept: o concept já
identifica a evidence, e não há `id`. Idem para `Evaluation`, identificada pelo name da hypothesis.
Citations são por name, nunca por id.

---

## 6. Invariantes

```
 1. uma evaluation por hypothesis que case.requiresEvaluationOf() lista —
    inconclusive conta, silêncio não
 2. toda evaluation confirmed ou refuted cita ≥1 {concept, field}, e
    todo field citado existe no output schema da capability
 3. toda evaluation inconclusive declara reason: no-data (citando a
    evidence cujo result ≠ ok), judgment-failure, ou
    deadline-exceeded — os três são causas distintas e nenhuma é o
    guarda-chuva das outras
 4. o outcome é o que case.resolveOutcome() devolve — o assessment não
    produz outcome fora do case
 5. nenhuma capability mutante: o registry recusa nature diferente de
    read-only. O sistema diagnostica e encaminha, nunca age.
 6. a collection roda no escopo de autorização do requester, nunca do
    serviço
 7. pinos do replay: caseRef{slug,version,hash} + model + promptVersion
    + evidence[]; o índice guarda todas as versões do case — cada uma
    publicada por definição, já que não existe outra (v6)
 8. para um case existir: todo concept nomeado tem capability
    read-only, e todo outcome, action e recipient está no
    glossary — verificado a cada leitura válida, não num instante de
    publicar (v6)
 9. Investigation é escrita uma vez — nenhum estado intermediário do
    domínio persiste; o "em andamento" da idempotência é um lease, não
    estado do domínio
10. só evidence com result ok entra no cache
11. a resposta ao requester sai inteira e depois da escrita — nunca se
    age sobre um assessment que não tem registro, e o referral é
    exatamente a parte sobre a qual se age
12. nenhuma etapa aborta por prazo: estourar produz result registrado
    (timeout, deadline-exceeded) e a investigation segue. Exceção única
    e declarada: a persistência, que a 11 não deixa degradar — escrita
    que não conclui é erro ao requester
13. o prazo é um instante limite propagado: cada etapa recebe
    min(orçamento nominal, prazo restante), nunca o nominal isolado
```

A 5 é decisão de projeto, não limitação: apaga confirmação humana de mutação, escopos de escrita e
metade das preocupações de segurança — e é imposta pelo registry, não por disciplina. A 8 é onde os
dois contextos negociam — sem uma transição de publicação para ancorá-la, desde a v6; ela vale toda
vez que o case é lido. A 11 é a que decide a forma da resposta, e a 12 tem que declarar sua exceção
porque as duas se cruzam na persistência.

## 7. O evento e as projeções

```
InvestigationCompleted { case, version, outcome, determiningHypothesis?,
                         evaluations[], evidence[], cost }
```

Um evento, e todo o loop de aprendizado é **projeção** sobre ele:

| Projeção | O que revela |
|---|---|
| hypotheses que nunca confirmam | candidata a sair, ou criterion mal escrito |
| duas ou mais hypotheses confirmando na mesma investigation | a ordem de precedência está errada |
| concepts com `result ≠ ok` recorrente | integration quebrada ou capability errada |
| `inconclusive / judgment-failure` recorrente | prompt, model ou criterion ambíguo |
| `inconclusive / deadline-exceeded` recorrente | fila ou cota — o case tem hypotheses demais, ou o pool é pequeno demais |
| cases sempre inconclusive | hypothesis faltando |
| cost por case | onde otimizar, com dado |
| duração por etapa e por capability | quem está estourando o orçamento de 20s |

Nenhum evento adicional, nenhum contexto de feedback. O feedback do operador é um segundo evento
(`AssessmentReviewed`) só porque chega depois e de fora — e é ele que rotula o corpus de regressão
(§9).

## 8. Linguagem técnica e linguagem do curador

**Correção da v6.** Esta seção argumentava, na v5, por identificadores em português — para não abrir
uma tradução dentro do próprio modelo, entre o YAML que o especialista edita e o type que o
representa. Essa posição se reverte aqui: os identificadores de schema — nomes de entity, atributo,
função, evento — passam para o inglês (en-US), a língua padrão de código neste sistema, como este
próprio documento agora demonstra.

O que não muda é **o que o curador escreve continua em português**: o `criterion` de uma hypothesis,
o corpo do case, e o vocabulário aberto que um case contribui (nomes de hypothesis, outcomes,
actions e recipients específicos de negócio) são conteúdo do especialista, na língua dele — a
tradução que a v5 temia nunca chega a essa camada, porque o schema não interpreta essas strings, só
as carrega. A distinção que evita a deriva: um identificador que o schema declara é inglês; um valor
que um case escolhe é português.

`case` é reservado ao procedimento. O ticket de atendimento nunca usa esse termo — a ambiguidade
tripla da v1 (ticket / tipo de problema / procedimento) volta pela porta do vocabulário se isso não
estiver escrito.

## 9. Qualidade: como isto se testa

**O que tem teste unitário puro** — sem LLM, sem collection, sem integration:

- `case.collectionPlan()`, `case.requiresEvaluationOf()`, `case.resolveOutcome()`
- as treze regras do validator (§4.5)
- a validação da resposta do adapter (§5.3)
- a factory: cada invariante violada deve impedir a construção

**O que exige conjunto de regressão.** O judgment é não determinístico e o documento pina
`promptVersion` e `model` justamente porque eles mudam. Sem um corpus, trocar de model é
indistinguível de apostar.

```
Corpus de regressão
  N cases × evidences fixas × verdict esperado por hypothesis
  medido a cada mudança de prompt ou model
  origem: eventos InvestigationCompleted + AssessmentReviewed
```

O corpus se constrói de graça — os eventos são os dados, e o feedback do operador é o rótulo. Mas
ele precisa existir desde a primeira entrega, com poucos exemplos escritos à mão, senão nunca nasce.

**O que não é testável e depende de revisão humana:** "um criterion, uma afirmação falsificável", e
a ordem de precedência.

## 10. Custo

N hypotheses = N chamadas de judgment + 1 de writing. Custo cresce linear com hypotheses; um case
com 12 hypotheses custa 13 chamadas. Por isso `cost{calls, inputTokens, outputTokens}` fica na
`Investigation` — a projeção passa a responder quais cases são caros, com dado.

**A otimização óbvia e o que ela destrói:** julgar todas as hypotheses numa chamada só é
aproximadamente 10× mais barato e elimina as duas propriedades que justificam o desenho — nenhum
viés de ordem entre hypotheses, e erro contido em uma hypothesis. Revisar apenas com medição, nunca
como decisão de dia 1.

Collection: 3–8 chamadas read-only, paralelas. Se alguma for caríssima (varredura de rede), marque a
hypothesis como `costly` e rode-a em segunda onda, só se nenhuma anterior confirmar. Duas ondas
continuam triviais; não faça antes de doer.

## 11. Riscos que permanecem

**R1 — A investigation não se adapta ao que encontra.** Se uma collection muda o que se deveria
olhar em seguida (ONU responde, mas com sinal degradado → histórico de flaps), um roteiro plano não
expressa isso. O escape é o outcome `inconclusivo` com escalação — nunca improviso da LLM.
**Primeira extensão a esperar:** uma tabela `quando <condição sobre evidence coletada> então colete
<concept>`, um nível, sem aninhamento. É uma tabela, não uma linguagem, e só vale quando um
especialista pedir por um case concreto.

**R2 — Coletar tudo sempre custa mais que uma investigation humana.** Mitigado por paralelismo e
read-only; cache encurta a cauda no dia 2. A segunda onda para hypotheses custosas, que era o
escape, **não existe em modo síncrono** — não cabe em 20s. Uma hypothesis que não cabe no paralelo
não entra no case. Ver §10.

**R5 — O orçamento de 20s é um limite duro sobre quantas hypotheses um case pode ter.** Judgments
correm em paralelo, então o limite não é a soma — mas é o pool de concorrência e a cota do provedor
de LLM. Um case com 15 hypotheses enfileira judgments e estoura a etapa. Mitigação: medir
`durations` desde a primeira entrega e tratar contagem alta de hypotheses como sinal de que o case
deveria ser dois.

**R3 — Dados externos chegam ao prompt.** Sem tool calling a LLM não pode ser levada a *agir*, mas
pode ser levada a *julgar errado* por um campo de texto livre. Bloco de dados delimitado, regra
fixada no prompt de sistema, e prompt de judgment fechado.

**R4 — A prosa do criterion não é refatorável por ferramenta.** `criterion` é a parte do modelo que
só curadoria melhora. Aceitar isso significa gastar validação onde ela é possível e tratar a
qualidade do criterion como item de revisão, com a projeção de §7 apontando quais criteria estão
ambíguos.

## 12. Lacunas, ordenadas por o que bloqueiam

| | Lacuna | Bloqueia |
|---|---|---|
| ~~—~~ | ~~Decisão 1 — síncrono ou job~~ | **decidida: síncrono** |
| ~~—~~ | ~~Decisão 2 — quem é o subject~~ | **dissolvida: é campo do case, não decisão global** |
| ~~—~~ | ~~L7 — quem aprova publicação de case~~ | **dissolvida (v6): não há publicação como transição — o case é sempre publicado; a única porta é a validação, a cada leitura (§4.4)** |
| 1 | **Decisão 4** — os quatro vocabulários fechados | o validator |
| 2 | **Decisão 3** — timeouts por capability e prazo global | a collection, e o orçamento de 20s |
| 3 | o total de 20s é aceitável para a operação? | a viabilidade do modo síncrono |
| 4 | L4 — ttl por concept | o cache, e o frescor aceitável de cada dado |
| 5 | L1 — ordem de precedência | a semântica do outcome (não o código) |
| 6 | L6 — retenção de evidence e masking de PII | o que vai ao prompt |
| 7 | L2 — a investigation nasce de um ticket? | `ticketRef` |
| 8 | L5 — o que o assessment expõe ao cliente final | a writing |

**As duas primeiras da lista numerada são pré-requisito de código.** As demais podem ser respondidas
com a implementação em andamento.

A terceira é consequência da Decisão 1: se a operação não aceitar 20s, a Decisão 1 se reabre — e
reabri-la depois de implementar custa a camada de execução inteira.

## 13. Primeira entrega

| Entra | Fica para depois |
|---|---|
| 1 case real, escrito por especialista | demais cases |
| 2–3 capabilities read-only, com timeout | cache de evidence |
| collection paralela com prazo global | evento e projeções (query direta resolve no começo) |
| port de judgment + adapter LLM + adapter falso | `RuleEvaluator` |
| `collectionPlan`, `requiresEvaluationOf`, `resolveOutcome` | segunda onda para hypotheses custosas |
| validator com as treze regras | |
| corpus de regressão com poucos exemplos | |
| idempotência, com lease de "em andamento" | |
| `durations` medidas por etapa e por capability | |
| prazo absoluto propagado, com pool no judgment | |

O motor é uma semana. O que este corte protege é a ordem: **um case real atravessando o sistema
inteiro antes de o segundo case existir** — é isso que testa se `criterion` em prosa é suficiente,
ou se algum criterion precisa de dado que nenhuma capability entrega.

## 14. Módulos

```
glossary/       subject types · outcomes · actions · recipients
                concepts { accepts, ttl }
knowledge/      cases em markdown · schema · validator
investigation/  collection · port de judgment · assessment · writing ·
                factory · idempotência · evento
integration/    capabilities · normalizers (ACL) · registry
                connectors: ifs · oracle · crm · radius
```

## 15. O que foi cortado no caminho, e o custo aceito

| Cortado | Custo |
|---|---|
| Loop de tool calling da LLM (v3) | a investigation não se adapta — R1 |
| Matching semântico, limiar, modo genérico (v3) | o humano classifica; erro passa a ser dele, visível e corrigível na hora |
| Perfil do subject, applicability, ProblemType (v3) | um case por procedimento: `cliente-sem-internet-ftth` é outro case |
| Orçamento, passos, allowlist (v3) | nada disso tem o que conter sem tool calling |
| Plano de resolução de concept com fallback (v3) | concept → capability 1:1 até aparecer a segunda fonte do mesmo concept |
| Aggregate rico `Investigation` (v4) | virou resultado imutável de factory |
| `coletas_iniciais` (v5) | assessment menos contextualizado — e a writing estreitada o queria assim |
| resposta em duas partes, referral antes do text (v5) | o atendente espera a writing para ver a ação — a invariante 11 não admite agir sobre assessment sem registro |
| estado de edição do case, entity separada da autoria (v5) | nenhum custo funcional identificado — o rascunho é trabalho de git (branch, PR), fora do domínio; o domínio só enxerga o case, sempre publicado |

## 16. Onde investir primeiro

Se o core é o knowledge curado, o maior retorno **não é o motor**. O motor é uma semana: collection
paralela, uma port, três métodos no case, uma factory, uma escrita.

O produto é o **ciclo de autoria**: o schema, as treze regras do validator — a checagem de contrato
incluída, agora contínua e não mais um portão que se atravessa uma vez (v6) — e as projeções que
dizem ao curador quais hypotheses nunca disparam e quais criteria estão ambíguos. É lá que o sistema
fica melhor com o tempo, e é o único lugar onde investir mais rende mais.
