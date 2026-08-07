# Gestão do Conhecimento de Troubleshooting — v5

Especificação para implementação. Incorpora a revisão crítica da v4: as decisões que precedem
qualquer código, os furos de correção fechados, e os cortes que a v4 deixou na mesa. Das quatro
decisões que abriam este documento, a 1 está fechada (síncrono) e a 2 foi dissolvida — o tipo de
sujeito é campo do caso, não decisão global.

As versões anteriores permanecem como registro do raciocínio — v2 (o modelo rico e por que ele era
demais), v3 (a simplificação: a LLM parou de orquestrar), v4 (a disciplina DDD aplicada).

---

## 1. As quatro decisões que precedem a implementação — duas fechadas

Não são lacunas de conteúdo a preencher depois. São decisões cujas respostas mudam código, e cada
uma tem custo alto de retrofit. A numeração é mantida porque o resto do documento a referencia.

| | Estado |
|---|---|
| Decisão 1 — síncrono ou job | **fechada:** síncrono |
| Decisão 2 — quem é o sujeito | **dissolvida:** é campo do caso |
| Decisão 3 — timeouts e prazo global | aberta |
| Decisão 4 — os quatro vocabulários | aberta |

### Decisão 1 — Síncrona. **DECIDIDA.**

O atendente aguarda a resposta na tela. Consequências, todas obrigatórias:

**Orçamento de tempo declarado como prazo, não como soma.** A decomposição abaixo é proposta de
engenharia; o total é decisão de operação.

```
prazo total          20s   (proposto — confirmar com operação)
├── overhead+margem   2s   idempotência, carga e pino do caso, normalização,
│                          serialização, rede entre etapas
├── coleta            7s   paralelo, então é o timeout do conceito mais
│                          lento, não a soma
├── julgamento        5s   paralelo por hipótese, com pool limitado
├── redação           4s
└── persistência      2s   com retry dentro do que sobrar
```

**O prazo é absoluto e propagado, e é isso que faz a conta fechar.** Na entrada da requisição
grava-se um instante limite; cada etapa recebe `min(orçamento nominal da etapa, prazo restante)`,
nunca o seu orçamento nominal isolado. Uma etapa que termina cedo devolve o saldo à seguinte; uma
que se atrasa o toma das seguintes, e a última a rodar é quem paga. Somar orçamentos por etapa e
chamar a soma de prazo é o erro que este documento cometia até esta correção: a soma dava
exatamente o total, sem nada para o overhead que existe **entre** as etapas.

O prazo interno total tem que ser **menor** que o timeout do chamador, com margem — senão o
atendente vê erro de rede em vez de um parecer degradado.

**Cada etapa degrada, nenhuma falha — com uma exceção declarada.** Estourar o prazo da coleta não
aborta: produz evidência com `resultado: timeout` para o que não chegou, e a investigação segue.
Estourar o do julgamento produz `inconclusiva / prazo-esgotado`. É essa regra que garante uma
resposta em tempo limitado; sem ela, o orçamento é intenção.

A exceção é a **persistência**, e ela é obrigatória: pela invariante 11 não há resposta sem
registro, então uma escrita que não conclui dentro do que sobrou do prazo é erro ao atendente, não
degradação. É a única etapa isenta da invariante 12, e é isso que lhe dá orçamento próprio e retry
dentro do prazo restante.

**Persistir antes de responder, e a resposta sai inteira.** Uma versão anterior deste documento
entregava o encaminhamento à tela antes da redação, para o atendente agir alguns segundos mais
cedo. Isso contradiz a invariante 11 e **a invariante 11 é a correta**: o encaminhamento é
justamente a parte sobre a qual se **age**, e agir sobre parecer sem registro é o que a invariante
existe para impedir. A resposta é uma só e sai depois da escrita. O custo aceito é latência
percebida — o atendente espera a redação para ver a ação.

**A segunda onda para hipóteses custosas (R2) fica inviável.** Serializar duas ondas não cabe em 20s.
Em modo síncrono, uma hipótese custosa cabe no paralelo ou o caso não a inclui — o que torna a
disciplina de timeout por capacidade (Decisão 3) mais importante, não menos.

### Decisão 2 — O tipo de sujeito é declarado pelo caso. **Não é decisão global.**

Um caso de "cliente sem internet" investiga um contrato; um de "cliente não recebe fatura" investiga
um cliente; um de "OLT saturada" investiga um equipamento de rede; um de "incidente em bairro"
investiga uma região. Fixar um tipo de sujeito para o sistema é deixar um caso específico ditar o
modelo — e foi o que a v5 fez até esta correção.

O sujeito é dimensão do caso:

- o **caso** declara `sujeito: <tipo>`
- o **glossário** guarda os tipos de sujeito como quarto vocabulário fechado
- cada **conceito** declara quais tipos aceita; a capacidade resolve internamente o que precisar
  derivar (endereço a partir do contrato, região a partir do acesso) — derivação é trabalho da ACL,
  nunca do caso
- o **validador** recusa, na publicação, caso cujas `coletas` contenham conceito que não aceita o
  `sujeito` declarado

**Isso deixa de ser pré-requisito de código.** Virou campo de schema mais vocabulário, com a mesma
mecânica dos outros três. O que resta é o conjunto inicial de tipos, e ele se descobre com os
primeiros casos em vez de ser projetado antes deles.

**O ponto de entrada não é o sujeito.** O atendente tem o cliente na linha; o caso escolhido diz qual
identificador é necessário, e a interface resolve cliente → sujeito exigido, perguntando qual quando
há mais de um. Resolução de identidade é da interface; o sujeito da investigação é o que o caso
declara.

### Decisão 3 — Timeout por capacidade e prazo global da coleta

Cada capacidade declara seu timeout; a coleta tem prazo global. Estourar não é exceção: produz
evidência com `resultado: timeout`. Sem esses dois números, um sistema lento pendura a investigação.

### Decisão 4 — Os quatro vocabulários fechados

`tipo de sujeito`, `desfecho`, `acao`, `destinatario`. O validador não pode ser escrito antes deles, e
a invariante de publicação depende deles.

Os quatro têm naturezas diferentes, e tratá-los igual é erro:

| Vocabulário | Natureza |
|---|---|
| `destinatario` | **global e estável** — filas operacionais reais; papel, nunca pessoa |
| `acao` | **global** — o que o destinatário faz. Termo novo entra quando muda o que alguém faz, nunca quando muda o motivo |
| `tipo de sujeito` | **descoberto** — cresce com os casos; cada caso declara o seu |
| `desfecho` | **contribuído** — cada hipótese confirmável de cada caso contribui um; registrado globalmente só para não derivar em grafia e para permitir relatório entre casos |

Só um subconjunto precisa existir antes do primeiro caso: os destinatários, as ações desse caso, e
os dois desfechos de não-conclusão (`inconclusivo-sem-dados`,
`inconclusivo-hipoteses-esgotadas`). O resto se descobre escrevendo casos.

---

## 2. Destilação: onde está o core

| Subdomínio | Natureza | Consequência |
|---|---|---|
| conhecimento curado — quais hipóteses, o que as confirma, qual domina qual | **core** | é onde o esforço de modelagem se paga |
| execução — coletar, julgar, resolver desfecho | **supporting** | fino e óbvio |
| acesso aos sistemas corporativos | **generic** | substituível por construção |

**O modelo do core está no schema do caso, não em classes.** O schema é o modelo e o validador é
parte do modelo — não utilitário de build. O custo é real: nada é imposto em tempo de compilação,
então o modelo só é exercitado por validação e teste. É por isso que §4.5 enumera as regras.

## 3. Context map

```
┌─ glossario ──────────────────────────────────────────────────────
│  tipos de sujeito · desfechos · ações · destinatários
│  conceitos { aceita: [tipo de sujeito], ttl }
│  Published Language de todo o sistema — dado puro, sem comportamento
└────────┬──────────────────────────────────────────────┬──────────
         │                                              │
         ▼                                              ▼
┌─ conhecimento ─────────────────────┐   ┌─ integracao ─────────────────────
│  Caso                              │   │  Capacidade  nome · versão ·
│   em edição: entidade              │   │   schemas · timeout · natureza
│   publicado: value object          │   │  Normalizador  ← ACL
└────────┬───────────────────────────┘   │  Conectores  ifs · oracle ·
         │  Published Language:          │              crm · radius
         │  o caso publicado, imutável   └────────▲─────────────┬───────────
         │  Customer/Supplier:                    │             ▼
         │  contrato verificado ao publicar       │      Sistemas Corporativos
         ▼                                        │
┌─ investigacao ───────────────────────────────────┘
│  Investigacao (entidade, escrita uma vez)     Open Host Service:
│  port AvaliadorDeHipotese ◄── adapter LLM     capacidade
└──────────────────────────────────────────────────────────────────
```

Três leituras do mapa que a implementação precisa respeitar:

**O glossário é dependido pelos três.** A ACL traduz para o vocabulário do glossário, então
`integracao` depende dele — não de `conhecimento`. Sem isso explícito, nomes de conceito se
duplicam dentro de `integracao` e a ACL deixa de ser uma ACL.

**O normalizador é uma Anticorruption Layer.** Parece boilerplate e é a única coisa impedindo o
vocabulário do Oracle de virar vocabulário do domínio. Uma ACL não se simplifica.

**`conhecimento → investigacao` é Customer/Supplier, e é isso que exige a checagem na publicação.**
Um caso que nomeia conceito sem capacidade é impublicável. Se a checagem só roda na execução, o
curador descobre o erro durante uma ligação de cliente.

---

## 4. O modelo do conhecimento

### 4.1 Estrutura do caso

```
Caso  (um markdown por caso, versionado em git)
├── slug · titulo · quando_usar
├── sujeito: <tipo>                   do vocabulário do glossário
├── hipoteses, em ordem de precedência:
│     ├── nome                        único no caso
│     ├── coletas: [conceito]         ≥1 — a investigação da hipótese
│     ├── confirma_quando: <critério em linguagem de negócio>
│     ├── desfecho
│     └── encaminhamento { acao, destinatario }
└── sem_hipotese_confirmada: desfecho + encaminhamento
```

A investigação de cada hipótese é o par **coletas + critério**, inline no arquivo do caso.
Duplicar uma hipótese entre casos custa seis linhas visíveis e editáveis; extraí-la para nó próprio
custa um tipo de nó, resolução de referência, versionamento independente e a pergunta "de quem é o
desfecho". **Gatilho para revisar: a terceira duplicação.**

`sem_hipotese_confirmada` é uma hipótese default disfarçada, e fica explícita de propósito: um
fallback não afirma nada sobre o mundo.

**`coletas_iniciais` foi cortado.** Existia na v4 como contexto para a redação, e a redação passou a
ter entrada estreitada (§5.4) exatamente para não poder contradizer o desfecho. As duas coisas se
cancelavam: era custo de coleta em toda investigação sem invariante que o governasse.

### 4.2 Formato: três audiências, três formatos

| Quem consome | O quê | Formato |
|---|---|---|
| o motor | coletas, ordem das hipóteses, desfecho, encaminhamento | YAML no frontmatter, validado por schema |
| a LLM que julga | o critério de **uma** hipótese + as evidências dela | prosa curta, uma a três frases |
| o curador humano | por que a hipótese existe, nuance, histórico | prosa no corpo, **fora** de qualquer prompt |

**Regra que impede a deriva: nada no corpo pode mudar o que é coletado.** Se muda, é frontmatter.

**Por que não tudo em prosa.** O motor não interpreta texto. Extrair a lista de conceitos exigiria
uma LLM decidindo o que olhar — o que a v3 removeu — e a extração é não determinística, então o
plano de coleta do mesmo caso mudaria entre duas execuções e o replay morre. Prosa também não é
validável: um schema recusa hipótese sem coleta; um bloco de texto não pode ser recusado por estar
incompleto.

**Por que não tudo estruturado.** Estruturar o critério transforma conhecimento em código e devolve
a curadoria ao desenvolvedor. É o único campo onde a nuance do especialista é o valor.

**O que substitui o determinismo no critério** é rastreabilidade imposta: a avaliação cita
`{conceito, campo}`, e o campo tem que existir no schema de saída da capacidade — então **a validade
da citação é checável por máquina** (§5.3). Sem isso, rastreabilidade é promessa que não sobrevive
seis meses.

Duas regras de escrita, verificadas por revisão humana e não por validador: **uma afirmação
falsificável por hipótese** ("confirma quando X, ou também quando Y" são duas hipóteses), e a ordem
das hipóteses reflete a precedência que os especialistas afirmam.

### 4.3 Exemplo

```yaml
caso: cliente-sem-internet
titulo: Cliente sem internet
quando_usar: cliente relata ausência total de conexão
sujeito: contrato            # este caso investiga um contrato; outro caso
                             # investiga um cliente, uma OLT, uma região

hipoteses:                   # A ORDEM É A PRECEDÊNCIA — ver L1
  - nome: incidente-regional
    coletas: [incidentes-na-regiao]
    confirma_quando: há incidente aberto cobrindo a localidade do cliente
    desfecho: incidente-regional
    encaminhamento: { acao: informar-prazo, destinatario: atendimento }

  - nome: ordem-em-andamento
    coletas: [ordens-em-andamento]
    confirma_quando: existe ordem de serviço em execução no cliente
    desfecho: intervencao-tecnica-em-curso
    encaminhamento: { acao: informar-ordem, destinatario: atendimento }

  - nome: bloqueio-financeiro
    coletas: [situacao-financeira]
    confirma_quando: o acesso está bloqueado por inadimplência
    desfecho: bloqueio-financeiro
    encaminhamento: { acao: orientar-pagamento, destinatario: atendimento }

  - nome: onu-offline
    coletas: [estado-do-equipamento]
    confirma_quando: o equipamento do cliente não responde
    desfecho: onu-offline
    encaminhamento: { acao: abrir-ordem-corretiva, destinatario: suporte-n2 }

sem_hipotese_confirmada:
  desfecho: inconclusivo
  encaminhamento: { acao: escalar, destinatario: suporte-n2 }
```

```markdown
## bloqueio-financeiro                              ← corpo: só para o curador
Aparece muito em recorrência de cobrança no dia 5. Não confundir
suspensão por inadimplência com suspensão a pedido do cliente.
```

A ordem acima é **ilustrativa**. Qual causa domina qual é fato de domínio (L1). Vale notar que
`onu-offline` é frequentemente sintoma das outras três, o que sugere última posição — hipótese a
confirmar com especialista, não fato.

### 4.4 Comportamento do caso publicado

O caso publicado não é estrutura de dados que um serviço percorre — é onde a lógica mora:

```
caso.planoDeColeta()               -> Set<Conceito>
      união das coletas de todas as hipóteses, deduplicada

caso.exigeAvaliacaoDe()            -> [Hipotese]
      base da checagem de totalidade

caso.resolverDesfecho(avaliacoes)  -> Parecer
      primeira hipótese confirmada na ordem declarada → seu desfecho,
      seu encaminhamento, e ela como hipoteseDeterminante;
      nenhuma confirmada → sem_hipotese_confirmada, sem determinante
```

A precedência é conhecimento que o caso declara, então resolvê-la é comportamento do caso. Deixá-la
no serviço de aplicação é o modelo anêmico: o serviço lendo `caso.hipoteses` e decidindo por ele.

As três operações são testáveis sem coleta, sem LLM e sem integração — **a regra de negócio mais
importante do sistema ganha teste unitário puro.** O serviço de aplicação encolhe para: pedir o
plano, executar a coleta, pedir os julgamentos, pedir o parecer, redigir, persistir.

`resolverDesfecho` **não** marca hipótese como "superada": todas são julgadas e todas têm veredito.
Precedência escolhe a determinante; as outras mantêm o veredito que receberam. Isso preserva o sinal
mais valioso da projeção — duas hipóteses confirmarem com frequência é o que revela que a ordem de
precedência está errada.

### 4.5 Regras do validador

O validador é parte do modelo. Estas são as regras, e são todas.

**Estruturais**

1. `slug` casa com o nome do arquivo
2. `hipoteses` tem ao menos uma entrada
3. nome de hipótese único dentro do caso — `avaliacoes[]` é indexado por nome e colidiria em silêncio
4. `coletas` de cada hipótese tem ao menos um conceito — hipótese sem coleta não pode citar nada, e a invariante 2 seria insatisfazível para ela
5. `confirma_quando` presente e não vazio
6. `desfecho` e `encaminhamento{acao,destinatario}` presentes em cada hipótese e em `sem_hipotese_confirmada`

**Vocabulário**

7. `sujeito` é um tipo existente no glossário
8. todo conceito citado existe no glossário
9. todo `desfecho`, `acao` e `destinatario` existe no glossário
10. todo conceito citado tem `ttl` definido no glossário

**Coerência de sujeito**

11. todo conceito em `coletas` **aceita** o `sujeito` declarado pelo caso — é o que impede um caso
    de sujeito `cliente` pedir `estado-do-equipamento`

**Contrato, verificado no ato de publicar**

12. todo conceito nomeado tem capacidade registrada
13. a capacidade é `somente-leitura` e declara schema de saída e timeout

**Revisão humana, não validável**

- um critério, uma afirmação falsificável
- a ordem das hipóteses é a precedência que os especialistas afirmam

---

## 5. O modelo da execução

### 5.1 Fluxo

```
Atendente escolhe o caso          (ou o chamado já traz a categoria)
        │  + sujeito + relato
        ▼
chave de idempotência → investigação existente na janela? devolve ela
        │
        ▼
Caso pinado { slug, versao, hash }
        │
        ▼  caso.planoDeColeta()
╔═ COLETA ═════════════════════════════════════════════════════════╗
║  conjunto de conceitos, em paralelo, somente leitura,            ║
║  no escopo de autorização do solicitante                         ║
║  timeout por capacidade · prazo global · estouro = resultado     ║
║                                                                  ║
║   conceito     conceito     conceito     conceito                ║
║      └────────────┴─────┬──────┴────────────┘                    ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼ uma Evidencia por conceito (normalizada)
╔═ JULGAMENTO ═════════════════════════════════════════════════════╗
║  port AvaliadorDeHipotese — uma chamada por hipótese, em          ║
║  paralelo, pool limitado, recebendo só o critério dela e as       ║
║  evidências dela · resposta validada · retry se o prazo couber    ║
║  · fallback inconclusiva com motivo                              ║
║                                                                  ║
║   hipótese 1     hipótese 2     hipótese 3     hipótese 4        ║
║   confirmada     refutada       refutada      inconclusiva       ║
║   + citações                                  motivo: sem-dados  ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼  caso.resolverDesfecho(avaliacoes)
Parecer { desfecho, encaminhamento, hipoteseDeterminante }
                          │            declarados pelo caso
                          ▼  redação com entrada estreitada
Texto para o destinatário
                          │
                          ▼  escrita única
Investigacao persistida ──► evento InvestigacaoConcluida
                          │
                          ▼  só agora, e inteira — invariante 11
Resposta ao solicitante { encaminhamento, texto }
```

### 5.2 Coleta

- **Paralela, somente leitura, com pool limitado.** O conjunto vem de `caso.planoDeColeta()`, então
  há exatamente uma evidência por conceito.
- **Timeout por capacidade e prazo global** (Decisão 3). Estouro produz evidência com
  `resultado: timeout`, nunca exceção — a ausência de dado tem que ser um fato registrado.
- **No escopo de autorização do solicitante**, propagado até o conector. Se o que o atendente pode
  ver é limitado, a coleta tem que respeitar isso; retrofitar depois significa reescrever todos os
  conectores.
- **Normalização obrigatória** — a evidência chega no vocabulário do glossário, nunca no do sistema
  de origem. O vazamento tecnológico acontece na resposta, não na chamada.

**A alavanca de latência do dia 1 é o timeout agressivo por capacidade, não o cache.** Em modo
síncrono, falhar rápido para `resultado: timeout` vale mais que esperar por um dado que talvez venha:
uma hipótese `inconclusiva / sem-dados` dentro do prazo é um resultado; um parecer fora do prazo não
é.

**Cache — dia 2.** O motivo mudou com a Decisão 1: não é mais "porque o retry é barato", é **porque o
cache não ajuda o caminho frio**, que é justamente o que está sob pressão de tempo. Ele encurta a
segunda investigação do mesmo sujeito dentro do ttl — a cauda, não a mediana. Quando entrar: chave
`(conceito, tipoSujeito, idSujeito, entradas)` — o tipo entra na chave porque ids de tipos
diferentes colidem — ttl do glossário, e **só evidência com `resultado: ok` entra**: cachear
indisponibilidade faz a próxima investigação herdar uma falha já resolvida.

O `ttl` fica no conceito, e representa a **tolerância mais estrita** entre os casos que o usam. Um
caso mais tolerante simplesmente não aproveita cache que poderia — ttl curto nunca produz erro, só
menos eficiência. Sobrepor ttl por caso é possível e fica fora do escopo até que a medição mostre
perda real.

```
Evidencia  (value object, identificada pelo conceito na investigação)
├── conceito
├── capacidade { nome, versao }
├── entradas
├── observacao          normalizada, no vocabulário do glossário
├── observadoEm · ttl · origem
└── resultado           ok | indisponivel | negado | timeout  (+ detalhe)
```

### 5.3 Julgamento

```
domínio           port AvaliadorDeHipotese
                    avaliar(hipotese, evidencias) -> Avaliacao

infraestrutura    AvaliadorLLM         produção
                  AvaliadorFalso       teste
                  AvaliadorDeRegra     opção futura, critério mecânico
```

Julgar não pode ser domain service: a regra que aplica não está no código, está na prosa do caso.
Como port, a tensão entre critério em prosa e critério mecânico se resolve por adapter — sem segunda
forma no schema e sem o curador ter que escolher nada.

```
Avaliacao  (value object, identificada pelo nome da hipótese)
├── hipotese
├── veredito    confirmada | refutada | inconclusiva
├── motivo      obrigatório se inconclusiva:
│                 sem-dados | falha-de-julgamento | prazo-esgotado
└── citacoes    [{ conceito, campo }] — ≥1 se confirmada ou refutada
```

**Contrato da resposta, validado pelo adapter:**

- `hipotese` é a que foi pedida
- `veredito` está no enum
- todo `conceito` citado está nas `coletas` daquela hipótese — o prompt não continha outros
- todo `campo` citado existe no schema de saída da capacidade que produziu aquela evidência

**Falha do julgamento não pode inviabilizar a investigação.** A invariante 1 exige uma avaliação por
hipótese e a factory não produz instância inválida — então, sem tratamento, uma resposta ruim mata a
requisição inteira. Política: validar, **um retry condicionado ao prazo restante**, e fallback para
`inconclusiva / falha-de-julgamento`.

A condição importa em modo síncrono: um retry dobra a latência daquela hipótese, e todas correm em
paralelo dentro do prazo da etapa. Se o que sobrou do prazo não cabe uma segunda tentativa, vai
direto ao fallback — o prazo vence o retry, sempre.

**O julgamento tem pool limitado, como a coleta — e é ele que tem cota externa.** O número de
chamadas simultâneas ao provedor é limitado, então uma hipótese pode nunca receber slot antes de o
prazo da etapa vencer. Esse caso não é `sem-dados`, porque os dados chegaram, nem
`falha-de-julgamento`, porque nada falhou: é **`prazo-esgotado`**, e o mesmo motivo cobre a chamada
que iniciou e não voltou a tempo.

Confundir os três não é questão de precisão vocabular — envenena a projeção de §7. Ler
`falha-de-julgamento` recorrente como "prompt, modelo ou critério ambíguo" quando a causa é fila
aponta a curadoria para o lugar errado, e o sinal que diria "o caso tem hipóteses demais" (R5)
desaparece dentro do sinal errado.

O motivo é obrigatório justamente por isso: **`inconclusiva` por falha técnica, por fila e por falta
de dado não podem ser indistinguíveis.** Sem essa distinção, uma falha de infraestrutura é lida como
fato do domínio — a patologia que o resto do sistema existe para evitar.

**Prompt de julgamento fechado:** só o critério daquela hipótese, só as evidências dela, e a
instrução de que o que não se deduz da evidência é `inconclusiva`, nunca inferência. Evidências em
bloco de dados delimitado — dado é dado, nunca instrução.

Julgar cada hipótese isolada e em paralelo dá três coisas além do custo: prompt pequeno, nenhum
viés de ordem, e erro contido em uma hipótese.

**Limite epistêmico, escrito em vez de mascarado:** o julgamento é uma operação de domínio não
determinística, e o DDD não tem padrão para isso. A garantia que o domínio oferece não é "correto" —
é **citado e completo**.

### 5.4 Parecer e redação

O desfecho e o encaminhamento vêm de `caso.resolverDesfecho()`. A LLM só redige, e **recebe entrada
estreitada** — nada impede um texto de contradizer o desfecho, exceto não lhe dar material para
isso:

| Desfecho | O que a redação recebe |
|---|---|
| hipótese confirmada | relato · hipótese determinante · evidências **dela** · desfecho · encaminhamento |
| nenhuma confirmada | relato · todas as hipóteses com veredito e motivo · encaminhamento |

O segundo caso é o único em que amplitude é o ponto: quando nada confirmou, o valor do parecer é
dizer o que foi descartado e por quê. Em nenhum dos dois a redação vê o corpo do caso — prosa para
curador não entra em prompt.

### 5.5 `Investigacao`: resultado imutável

Um agregado existe para guardar invariantes **entre mutações**. As invariantes aqui são de
**completude**, verificadas uma vez. Isso não pede agregado — pede uma **factory que não sabe
produzir instância inválida**.

```
Investigacao  (entidade; escrita uma vez, nunca mutada)
├── id · solicitante · sujeito { tipo, id } · chamadoRef?   ← L2
├── relato
├── casoRef { slug, versao, hash }        ─┐
├── versaoDoPrompt · modelo               ─┤ pinos do replay
├── evidencias[]                          ─┘
├── avaliacoes[]
├── parecer  { desfecho, encaminhamento, hipoteseDeterminante?, texto }
├── custo     { chamadas, tokensEntrada, tokensSaida }
└── duracoes  { coleta, julgamento, redacao, total }
```

Sem orçamento, sem passos, sem encerramento: o fim é uma condição verificável, não estado a manter.

**Escrita única no fim.** Persistir em etapas reintroduz estados intermediários e o agregado que a
v3 cortou. Um crash antes da escrita custa a re-execução — aceitável porque a coleta é somente
leitura e paralela.

**Idempotência — e em modo síncrono ela deixa de ser refinamento.** Um atendente que espera 20s
clica duas vezes e atualiza a página; sem chave, cada impaciência custa uma investigação inteira.

Chave `(tipoSujeito, idSujeito, caso, chamadoRef?)` dentro de uma janela configurada, com dois
comportamentos distintos:

- investigação **concluída** na janela → devolve ela
- investigação **em andamento** → a segunda requisição se anexa à primeira, nunca inicia outra

O marcador de "em andamento" é um **lease na store de idempotência** — só a chave e um instante. Não
é estado da `Investigacao`, que continua escrita uma vez. A distinção é o que mantém a invariante 9
de pé.

**Replay** exige que o índice de casos guarde **todas** as versões publicadas, não a última. Se
guardar só a última, investigações antigas perdem reprodutibilidade em silêncio, e isso só se
descobre quando alguém precisa auditar.

### 5.6 Entidades e value objects

| | |
|---|---|
| `Investigacao` | **entidade** — tem identidade, é referenciada de fora |
| `Caso` publicado | **value object** — identificado por conteúdo (`slug + versao + hash`) |
| `Caso` em edição | **entidade** no contexto de autoria — mesmo termo, dois modelos, tradução na publicação |
| `Evidencia` · `Avaliacao` · `Parecer` · `Capacidade` | **value objects** |

Como o plano de coleta é um **conjunto**, há exatamente uma evidência por conceito: o conceito já
identifica a evidência, e não há `id`. Idem para `Avaliacao`, identificada pelo nome da hipótese.
Citações são por nome, nunca por id.

---

## 6. Invariantes

```
 1. uma avaliação por hipótese que caso.exigeAvaliacaoDe() lista —
    inconclusiva conta, silêncio não
 2. toda avaliação confirmada ou refutada cita ≥1 {conceito, campo}, e
    todo campo citado existe no schema de saída da capacidade
 3. toda avaliação inconclusiva declara motivo: sem-dados (citando a
    evidência cujo resultado ≠ ok), falha-de-julgamento, ou
    prazo-esgotado — os três são causas distintas e nenhuma é o
    guarda-chuva das outras
 4. o desfecho é o que caso.resolverDesfecho() devolve — o parecer não
    produz desfecho fora do caso
 5. nenhuma capacidade mutante: o registro recusa natureza diferente de
    somente-leitura. O sistema diagnostica e encaminha, nunca age.
 6. a coleta roda no escopo de autorização do solicitante, nunca do
    serviço
 7. pinos do replay: casoRef{slug,versao,hash} + modelo + versaoDoPrompt
    + evidencias[]; o índice guarda todas as versões publicadas
 8. publicação: todo conceito nomeado tem capacidade somente-leitura, e
    todo desfecho, acao e destinatario está no glossário
 9. Investigacao é escrita uma vez — nenhum estado intermediário do
    domínio persiste; o "em andamento" da idempotência é um lease, não
    estado do domínio
10. só evidência com resultado ok entra no cache
11. a resposta ao solicitante sai inteira e depois da escrita — nunca se
    age sobre um parecer que não tem registro, e o encaminhamento é
    exatamente a parte sobre a qual se age
12. nenhuma etapa aborta por prazo: estourar produz resultado registrado
    (timeout, prazo-esgotado) e a investigação segue. Exceção única e
    declarada: a persistência, que a 11 não deixa degradar — escrita que
    não conclui é erro ao solicitante
13. o prazo é um instante limite propagado: cada etapa recebe
    min(orçamento nominal, prazo restante), nunca o nominal isolado
```

A 5 é decisão de projeto, não limitação: apaga confirmação humana de mutação, escopos de escrita e
metade das preocupações de segurança — e é imposta pelo registro, não por disciplina. A 8 é onde os
dois contextos negociam. A 11 é a que decide a forma da resposta, e a 12 tem que declarar sua
exceção porque as duas se cruzam na persistência.

## 7. O evento e as projeções

```
InvestigacaoConcluida { caso, versao, desfecho, hipoteseDeterminante?,
                        avaliacoes[], evidencias[], custo }
```

Um evento, e todo o loop de aprendizado é **projeção** sobre ele:

| Projeção | O que revela |
|---|---|
| hipóteses que nunca confirmam | candidata a sair, ou critério mal escrito |
| duas ou mais hipóteses confirmando na mesma investigação | a ordem de precedência está errada |
| conceitos com `resultado ≠ ok` recorrente | integração quebrada ou capacidade errada |
| `inconclusiva / falha-de-julgamento` recorrente | prompt, modelo ou critério ambíguo |
| `inconclusiva / prazo-esgotado` recorrente | fila ou cota — o caso tem hipóteses demais, ou o pool é pequeno demais |
| casos sempre inconclusivos | hipótese faltando |
| custo por caso | onde otimizar, com dado |
| duração por etapa e por capacidade | quem está estourando o orçamento de 20s |

Nenhum evento adicional, nenhum contexto de feedback. O feedback do operador é um segundo evento
(`ParecerAvaliado`) só porque chega depois e de fora — e é ele que rotula o corpus de regressão
(§9).

## 8. Linguagem ubíqua

Os arquivos de caso **são** o modelo, e quem os escreve são os especialistas. Identificadores em
inglês criariam tradução dentro do próprio modelo, entre o YAML que o especialista edita e o tipo
que o representa. O domínio fala português: `caso`, `hipotese`, `coletas`, `confirma_quando`,
`desfecho`, `encaminhamento`, `evidencia`, `avaliacao`, `parecer`, `capacidade`, `conector`,
`sujeito`, `relato`. Inglês apenas em termos de fronteira técnica.

`caso` é reservado ao procedimento. O chamado é **`chamado`**, e o sistema nunca usa "caso" para ele
— a ambiguidade tripla da v1 (chamado / tipo de problema / procedimento) volta pela porta do
vocabulário se isso não estiver escrito.

## 9. Qualidade: como isto se testa

**O que tem teste unitário puro** — sem LLM, sem coleta, sem integração:

- `caso.planoDeColeta()`, `caso.exigeAvaliacaoDe()`, `caso.resolverDesfecho()`
- as treze regras do validador (§4.5)
- a validação da resposta do adapter (§5.3)
- a factory: cada invariante violada deve impedir a construção

**O que exige conjunto de regressão.** O julgamento é não determinístico e o documento pina
`versaoDoPrompt` e `modelo` justamente porque eles mudam. Sem um corpus, trocar de modelo é
indistinguível de apostar.

```
Corpus de regressão
  N casos × evidências fixas × veredito esperado por hipótese
  medido a cada mudança de prompt ou modelo
  origem: eventos InvestigacaoConcluida + ParecerAvaliado
```

O corpus se constrói de graça — os eventos são os dados, e o feedback do operador é o rótulo. Mas
ele precisa existir desde a primeira entrega, com poucos exemplos escritos à mão, senão nunca nasce.

**O que não é testável e depende de revisão humana:** "um critério, uma afirmação falsificável", e a
ordem de precedência.

## 10. Custo

N hipóteses = N chamadas de julgamento + 1 de redação. Custo cresce linear com hipóteses; um caso
com 12 hipóteses custa 13 chamadas. Por isso `custo{chamadas, tokensEntrada, tokensSaida}` fica na
`Investigacao` — a projeção passa a responder quais casos são caros, com dado.

**A otimização óbvia e o que ela destrói:** julgar todas as hipóteses numa chamada só é
aproximadamente 10× mais barato e elimina as duas propriedades que justificam o desenho — nenhum
viés de ordem entre hipóteses, e erro contido em uma hipótese. Revisar apenas com medição, nunca
como decisão de dia 1.

Coleta: 3–8 chamadas somente leitura, paralelas. Se alguma for caríssima (varredura de rede), marque
a hipótese como `custosa` e rode-a em segunda onda, só se nenhuma anterior confirmar. Duas ondas
continuam triviais; não faça antes de doer.

## 11. Riscos que permanecem

**R1 — A investigação não se adapta ao que encontra.** Se uma coleta muda o que se deveria olhar em
seguida (ONU responde, mas com sinal degradado → histórico de flaps), um roteiro plano não expressa
isso. O escape é o desfecho `inconclusivo` com escalação — nunca improviso da LLM. **Primeira
extensão a esperar:** uma tabela `quando <condição sobre evidência coletada> então colete
<conceito>`, um nível, sem aninhamento. É uma tabela, não uma linguagem, e só vale quando um
especialista pedir por um caso concreto.

**R2 — Coletar tudo sempre custa mais que uma investigação humana.** Mitigado por paralelismo e
somente-leitura; cache encurta a cauda no dia 2. A segunda onda para hipóteses custosas, que era o
escape, **não existe em modo síncrono** — não cabe em 20s. Uma hipótese que não cabe no paralelo não
entra no caso. Ver §10.

**R5 — O orçamento de 20s é um limite duro sobre quantas hipóteses um caso pode ter.** Julgamentos
correm em paralelo, então o limite não é a soma — mas é o pool de concorrência e a cota do provedor
de LLM. Um caso com 15 hipóteses enfileira julgamentos e estoura a etapa. Mitigação: medir
`duracoes` desde a primeira entrega e tratar contagem alta de hipóteses como sinal de que o caso
deveria ser dois.

**R3 — Dados externos chegam ao prompt.** Sem tool calling a LLM não pode ser levada a *agir*, mas
pode ser levada a *julgar errado* por um campo de texto livre. Bloco de dados delimitado, regra
fixada no prompt de sistema, e prompt de julgamento fechado.

**R4 — A prosa do critério não é refatorável por ferramenta.** `confirma_quando` é a parte do modelo
que só curadoria melhora. Aceitar isso significa gastar validação onde ela é possível e tratar a
qualidade do critério como item de revisão, com a projeção de §7 apontando quais critérios estão
ambíguos.

## 12. Lacunas, ordenadas por o que bloqueiam

| | Lacuna | Bloqueia |
|---|---|---|
| ~~—~~ | ~~Decisão 1 — síncrono ou job~~ | **decidida: síncrono** |
| ~~—~~ | ~~Decisão 2 — quem é o sujeito~~ | **dissolvida: é campo do caso, não decisão global** |
| 1 | **Decisão 4** — os quatro vocabulários fechados | o validador |
| 2 | **Decisão 3** — timeouts por capacidade e prazo global | a coleta, e o orçamento de 20s |
| 3 | o total de 20s é aceitável para a operação? | a viabilidade do modo síncrono |
| 4 | L4 — ttl por conceito | o cache, e o frescor aceitável de cada dado |
| 5 | L1 — ordem de precedência | a semântica do desfecho (não o código) |
| 6 | L6 — retenção de evidência e masking de PII | o que vai ao prompt |
| 7 | L7 — quem aprova publicação de caso | o fluxo de curadoria |
| 8 | L2 — a investigação nasce de um chamado? | `chamadoRef` |
| 9 | L5 — o que o parecer expõe ao cliente final | a redação |

**As duas primeiras são pré-requisito de código.** As demais podem ser respondidas com a
implementação em andamento.

A terceira é consequência da Decisão 1: se a operação não aceitar 20s, a Decisão 1 se reabre — e
reabri-la depois de implementar custa a camada de execução inteira.

## 13. Primeira entrega

| Entra | Fica para depois |
|---|---|
| 1 caso real, escrito por especialista | demais casos |
| 2–3 capacidades somente leitura, com timeout | cache de evidência |
| coleta paralela com prazo global | evento e projeções (query direta resolve no começo) |
| port de julgamento + adapter LLM + adapter falso | `AvaliadorDeRegra` |
| `planoDeColeta`, `exigeAvaliacaoDe`, `resolverDesfecho` | segunda onda para hipóteses custosas |
| validador com as treze regras | |
| corpus de regressão com poucos exemplos | |
| idempotência, com lease de "em andamento" | |
| `duracoes` medidas por etapa e por capacidade | |
| prazo absoluto propagado, com pool no julgamento | |

O motor é uma semana. O que este corte protege é a ordem: **um caso real atravessando o sistema
inteiro antes de o segundo caso existir** — é isso que testa se `confirma_quando` em prosa é
suficiente, ou se algum critério precisa de dado que nenhuma capacidade entrega.

## 14. Módulos

```
glossario/      tipos de sujeito · desfechos · ações · destinatários
                conceitos { aceita, ttl }
conhecimento/   casos em markdown · schema · validador
investigacao/   coleta · port de julgamento · parecer · redação ·
                factory · idempotência · evento
integracao/     capacidades · normalizadores (ACL) · registro
                conectores: ifs · oracle · crm · radius
```

## 15. O que foi cortado no caminho, e o custo aceito

| Cortado | Custo |
|---|---|
| Loop de tool calling da LLM (v3) | a investigação não se adapta — R1 |
| Matching semântico, limiar, modo genérico (v3) | o humano classifica; erro passa a ser dele, visível e corrigível na hora |
| Perfil do sujeito, applicability, ProblemType (v3) | um caso por procedimento: `cliente-sem-internet-ftth` é outro caso |
| Orçamento, passos, allowlist (v3) | nada disso tem o que conter sem tool calling |
| Plano de resolução de conceito com fallback (v3) | conceito → capacidade 1:1 até aparecer a segunda fonte do mesmo conceito |
| Agregado rico `Investigacao` (v4) | virou resultado imutável de factory |
| `coletas_iniciais` (v5) | parecer menos contextualizado — e a redação estreitada o queria assim |
| resposta em duas partes, encaminhamento antes do texto (v5) | o atendente espera a redação para ver a ação — a invariante 11 não admite agir sobre parecer sem registro |

## 16. Onde investir primeiro

Se o core é o conhecimento curado, o maior retorno **não é o motor**. O motor é uma semana: coleta
paralela, uma port, três métodos no caso, uma factory, uma escrita.

O produto é o **ciclo de autoria**: o schema, as treze regras do validador, a checagem de contrato na
publicação, e as projeções que dizem ao curador quais hipóteses nunca disparam e quais critérios
estão ambíguos. É lá que o sistema fica melhor com o tempo, e é o único lugar onde investir mais
rende mais.
