# Gestão do Conhecimento de Troubleshooting — v4

Especificação a implementar. A v3 (`arquitetura-troubleshooting-v3.md`) trouxe a simplificação: a
LLM parou de orquestrar. A v4 aplica sobre ela a disciplina de modelagem DDD — o que move lógica
para onde o conhecimento está, nomeia os padrões de fronteira, e corrige o que ainda estava anêmico.
A v2 e a v3 permanecem como registro do raciocínio.

## O que a v4 corrige na v3

| Correção | Efeito |
|---|---|
| Precedência, plano de coleta e totalidade viram **comportamento do caso** | a regra de negócio mais importante ganha teste unitário puro |
| `Investigacao` deixa de ser "registro" e passa a ser **resultado imutável de uma factory** | as invariantes moram na construção, não no objeto |
| Julgamento passa a ser **port**, não serviço | o critério mecânico ganha adapter próprio no futuro sem mexer no schema |
| Contrato verificado **no ato de publicar** | caso que nomeia conceito sem capacidade não chega à execução |
| Idioma do domínio: **português** | os arquivos são o modelo, e quem os escreve são os especialistas |
| `Evidencia` e `Avaliacao` perdem `id` | o conjunto de coleta garante uma evidência por conceito |

---

## 1. Destilação: onde está o core

| Subdomínio | Natureza | Consequência |
|---|---|---|
| conhecimento curado — quais hipóteses, o que as confirma, qual domina qual | **core** | é aqui que o esforço de modelagem se paga |
| execução — coletar, julgar, resolver desfecho | **supporting** | mantenha fino e óbvio |
| acesso aos sistemas corporativos | **generic** | substituível por construção |

A consequência que precisa estar escrita: **o modelo do core está no schema do caso, não em
classes.** O schema é o modelo, e o validador é parte do modelo — não utilitário de build. Isso é
DDD legítimo, e o custo é real: nada é imposto em tempo de compilação, então o modelo só é
exercitado por validação e teste.

## 2. Context map

```
┌─ conhecimento ───────────────────────────────────────────────────
│  Caso (em edição: entidade · publicado: value object)
│  Glossario  conceitos · desfechos · ações · destinatários
└──────────┬───────────────────────────────────────────────────────
           │  Published Language: o caso publicado, imutável
           │  Customer/Supplier: contrato verificado ao publicar
           ▼
┌─ investigacao ───────────────────────────────────────────────────
│  Investigacao (entidade, escrita uma vez)
│  port AvaliadorDeHipotese ◄── adapter LLM
└──────────┬───────────────────────────────────────────────────────
           │  Open Host Service: capacidade
           │  ▲ Anticorruption Layer: o normalizador
           ▼
┌─ integracao ─────────────────────────────────────────────────────
│  Capacidade  nome · versão · schemas · ttl · somente leitura
│  Conectores  ifs · oracle · crm · radius
└──────────┬───────────────────────────────────────────────────────
           ▼
     Sistemas Corporativos
```

**O normalizador é uma Anticorruption Layer.** Nomear isso importa porque ele parece boilerplate e
é a única coisa que impede o vocabulário do Oracle de virar vocabulário do domínio. Uma ACL não se
simplifica — é o preço de não deixar o modelo externo entrar.

**A relação com `conhecimento` é Customer/Supplier, e é isso que exige a checagem na publicação.**
Um caso que nomeia um conceito sem capacidade correspondente é impublicável. Se a checagem só
acontece na execução, o curador descobre o erro durante uma ligação de cliente.

---

## 3. O modelo do conhecimento

### 3.1 Estrutura do caso

```
Caso  (um markdown por caso, versionado em git)
├── slug · titulo · quando_usar
├── coletas_iniciais: [conceito]        ← contexto do parecer, não prova
├── hipoteses, em ordem de precedência:
│     ├── nome
│     ├── coletas: [conceito]           ← a investigação da hipótese
│     ├── confirma_quando: <critério em linguagem de negócio>
│     ├── desfecho
│     └── encaminhamento { acao, destinatario }
└── sem_hipotese_confirmada: desfecho + encaminhamento
```

A investigação de cada hipótese é o par **coletas + critério**, inline no arquivo do caso.
Duplicar uma hipótese entre casos custa seis linhas de markdown visíveis e editáveis; extraí-la
para nó próprio custa um tipo de nó, resolução de referência, versionamento independente e a
pergunta "de quem é o desfecho". **Gatilho para revisar: a terceira duplicação.**

`sem_hipotese_confirmada` é uma hipótese default disfarçada, e fica explícita de propósito: um
fallback não afirma nada sobre o mundo, e forçá-lo na mesma lista torna o arquivo mais estranho de
ler do que o caso especial custa.

### 3.2 Formato: três audiências, três formatos

| Quem consome | O quê | Formato |
|---|---|---|
| o motor | coletas, ordem das hipóteses, desfecho, encaminhamento, ttl | YAML no frontmatter, validado por schema |
| a LLM que julga | o critério de **uma** hipótese + as evidências dela | prosa curta, uma a três frases |
| o curador humano | por que a hipótese existe, nuance, histórico | prosa no corpo, **fora** do prompt de julgamento |

**Regra que impede a deriva: nada no corpo pode mudar o que é coletado.** Se muda, é frontmatter.

**Por que não tudo em prosa.** O motor não interpreta texto. Extrair a lista de conceitos exigiria
uma LLM decidindo o que olhar — exatamente o que a v3 removeu — e a extração é não determinística,
então o plano de coleta do mesmo caso mudaria entre duas execuções e o replay morre. Prosa também
não é validável: um schema recusa hipótese sem coleta, critério ou desfecho; um bloco de texto não
pode ser recusado por estar incompleto.

**Por que não tudo estruturado.** Estruturar o critério transforma conhecimento em código e devolve
a curadoria ao desenvolvedor. É o único campo onde a nuance do especialista é o valor.

**O que substitui o determinismo no critério** não é determinismo, é **rastreabilidade**: a
avaliação cita o campo da evidência em que se apoiou. Um `confirmada` citando
`estado-do-equipamento.status` é verificável por um humano em um segundo.

Duas regras de escrita: **uma afirmação falsificável por hipótese** ("confirma quando X, ou também
quando Y" são duas hipóteses), e **prompt de julgamento fechado** — só aquele critério, só as
evidências daquela hipótese, e o que não se deduz da evidência é `inconclusiva`, nunca inferência.

`confirma_quando` é a parte do modelo que ferramenta não refatora, só curadoria. Aceitar isso
significa gastar validação onde ela é possível, e tratar "um critério, uma afirmação" como regra de
revisão humana.

### 3.3 Exemplo

```yaml
caso: cliente-sem-internet
titulo: Cliente sem internet
quando_usar: cliente relata ausência total de conexão

coletas_iniciais:            # enquadram o parecer; não julgam hipótese
  - dados-do-contrato
  - tecnologia-de-acesso

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

A ordem acima é **ilustrativa** — qual causa domina qual é fato de domínio (L1). Vale notar que
"onu-offline" é frequentemente sintoma das outras três, o que sugere última posição; é hipótese a
confirmar com especialista, não fato.

`desfecho`, `acao` e `destinatario` são vocabulários **fechados** no glossário, verificados pelo
validador. String livre transforma erro de digitação em falha silenciosa de roteamento.

### 3.4 Comportamento do caso publicado

O caso publicado não é estrutura de dados que um serviço percorre — é onde a lógica mora:

```
caso.planoDeColeta()               -> Set<Conceito>
      união de coletas_iniciais com as coletas de todas as hipóteses,
      deduplicada

caso.exigeAvaliacaoDe()            -> [Hipotese]
      base da checagem de totalidade

caso.resolverDesfecho(avaliacoes)  -> Parecer
      primeira hipótese confirmada na ordem declarada → seu desfecho e
      encaminhamento; nenhuma confirmada → sem_hipotese_confirmada;
      as posteriores à confirmada ficam superadas
```

A precedência é conhecimento que o caso declara, então resolvê-la é comportamento do caso. Deixá-la
no serviço de aplicação é o modelo anêmico: o serviço lendo `caso.hipoteses` e decidindo por ele.

Movidas para cá, as três operações são testáveis sem coleta, sem LLM e sem integração — a regra de
negócio mais importante do sistema ganha teste unitário puro. E o serviço de aplicação encolhe
para: pedir o plano, executar a coleta, pedir os julgamentos, pedir o parecer, persistir.

---

## 4. O modelo da execução

### 4.1 Fluxo

```
Atendente escolhe o caso           (ou o chamado já traz a categoria)
        │  + subject
        ▼
Caso pinado { slug, versao, hash }
        │
        ▼  caso.planoDeColeta()
╔═ COLETA ═════════════════════════════════════════════════════════╗
║  conjunto de conceitos, em paralelo, cache por ttl,              ║
║  somente leitura                                                 ║
║   conceito   conceito   conceito   conceito   conceito           ║
║      └──────────┴─────┬────┴──────────┴──────────┘               ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼ Evidencia por conceito (normalizada)
╔═ JULGAMENTO ═════════════════════════════════════════════════════╗
║  port AvaliadorDeHipotese, uma chamada por hipótese, em          ║
║  paralelo: recebe só o critério dela e as evidências dela        ║
║   hipótese 1     hipótese 2     hipótese 3     hipótese 4        ║
║   confirmada     refutada       refutada      inconclusiva       ║
║   + citações                                  (sem dados)        ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼  caso.resolverDesfecho(avaliacoes)
Parecer { desfecho, encaminhamento }        ← declarados pelo caso
                          │
                          ▼  redação (LLM, uma chamada)
Texto para o destinatário
                          │
                          ▼  escrita única
Investigacao persistida ──► evento InvestigacaoConcluida
```

### 4.2 `Investigacao`: resultado imutável, não agregado

Um agregado existe para guardar invariantes **entre mutações**. As invariantes aqui são de
**completude**, verificadas uma vez. Isso não pede agregado — pede uma **factory que não sabe
produzir instância inválida**.

```
Investigacao  (entidade; escrita uma vez, nunca mutada)
├── id · solicitante · subject · chamadoRef?      ← L2
├── relato                                       ← texto do solicitante
├── casoRef { slug, versao, hash }        ─┐
├── versaoDoPrompt · modelo               ─┤ os pinos do replay
├── evidencias[]  { conceito, capacidade+v, entradas, observacao,
│                   observadoEm, ttl, origem, resultado }
├── avaliacoes[]  { hipotese, veredito, citacoes[] }
└── parecer       { desfecho, encaminhamento, texto }
```

Sem `orcamento`, sem `passos[]`, sem `encerramento`: o fim é uma condição verificável, não estado a
manter.

**Persistir uma vez no fim, não progressivamente.** Persistir em etapas reintroduz estados
intermediários e o agregado que a v3 cortou. E as duas decisões se sustentam mutuamente: **é o
cache de evidência por conceito e ttl que permite a escrita única** — um crash no meio custa a
re-execução, não a re-coleta. Mexer numa quebra a outra.

### 4.3 A port de julgamento

```
domínio           port AvaliadorDeHipotese
                    avaliar(hipotese, evidencias)
                      -> Avaliacao { veredito, citacoes[] }

infraestrutura    AvaliadorLLM        adapter de produção
                  AvaliadorFalso      teste
                  AvaliadorDeRegra    opção futura, critério mecânico
```

Julgar não pode ser domain service: a regra que aplica não está no código, está na prosa do caso.
Como port, resolve-se a tensão entre critério em prosa e critério mecânico **sem** segunda forma no
schema e sem o curador ter que escolher nada — um critério booleano ganha adapter próprio se algum
dia doer.

Julgar cada hipótese isolada e em paralelo tem três efeitos além do custo: prompt pequeno, nenhum
viés de ordem entre hipóteses, e um erro contido em uma hipótese em vez de contaminar tudo depois
dele.

**Limite epistêmico, escrito em vez de mascarado:** o julgamento é uma operação de domínio não
determinística, e o DDD não tem padrão para isso. A garantia que o domínio oferece não é "correto"
— é **citado e completo**.

### 4.4 Entidades e value objects

| | |
|---|---|
| `Investigacao` | **entidade** — tem identidade, é referenciada de fora |
| `Caso` publicado | **value object** — identificado por conteúdo (`slug + versao + hash`) |
| `Caso` em edição | **entidade** no contexto de autoria — mesmo termo, dois modelos, tradução na publicação |
| `Evidencia` · `Avaliacao` · `Parecer` · `Capacidade` | **value objects** |

Como o plano de coleta é um **conjunto**, existe exatamente uma evidência por conceito em cada
investigação: `conceito` já identifica a evidência, e o `id` sai. Idem para `Avaliacao`,
identificada pelo nome da hipótese. Citações são por nome de conceito, nunca por id.

---

## 5. O evento e as projeções

```
InvestigacaoConcluida { caso, versao, desfecho, avaliacoes[], evidencias[] }
```

Um evento, e todo o loop de aprendizado é **projeção** sobre ele:

- hipóteses que nunca confirmam → candidata a sair, ou critério mal escrito
- conceitos sempre com resultado ≠ ok → integração quebrada ou capacidade errada
- casos sempre inconclusivos → hipótese faltando
- distribuição de desfechos por caso → onde o conhecimento está rendendo

Nenhum evento adicional, nenhum contexto de feedback. O feedback do operador é um segundo evento
(`ParecerAvaliado`) só porque chega depois e de fora.

## 6. Invariantes

```
1. uma avaliação por hipótese que caso.exigeAvaliacaoDe() lista —
   inconclusiva conta, silêncio não
2. toda avaliação cita ≥1 conceito; "sem dados" cita a evidência cujo
   resultado ≠ ok
3. o desfecho do parecer é o que caso.resolverDesfecho() devolve — o
   parecer não produz desfecho fora do caso
4. nenhuma capacidade mutante: o sistema diagnostica e encaminha,
   nunca age. Ação é de pessoa.
5. pinos do replay: casoRef{slug,versao,hash} + modelo +
   versaoDoPrompt + evidencias[]
6. publicação: todo conceito que o caso nomeia tem capacidade, e todo
   desfecho, acao e destinatario está no glossário
7. Investigacao é escrita uma vez — não há estado intermediário
```

A invariante 4 é decisão de projeto, não limitação: ela apaga confirmação humana de mutação,
escopos de escrita e metade das preocupações de segurança. A 6 é onde os dois contextos negociam.

## 7. Linguagem ubíqua

Os arquivos de caso **são** o modelo, e quem os escreve são os especialistas. Identificadores em
inglês criariam uma camada de tradução dentro do próprio modelo, entre o YAML que o especialista
edita e o tipo que o representa. Então o domínio fala português: `caso`, `hipotese`, `coletas`,
`confirma_quando`, `desfecho`, `encaminhamento`, `evidencia`, `avaliacao`, `parecer`, `capacidade`,
`conector`. Inglês apenas em termos de fronteira técnica.

E `caso` é reservado ao procedimento. O chamado é **`chamado`**, e o sistema nunca usa "caso" para
ele — a ambiguidade tripla da v1 (chamado / tipo de problema / procedimento) volta pela porta do
vocabulário se isso não estiver escrito.

## 8. O que foi cortado das versões anteriores, e o custo aceito

| Cortado | Custo |
|---|---|
| Loop de tool calling da LLM | a investigação não se adapta ao que encontra — R1 |
| Matching semântico, limiar, modo genérico | o humano classifica; erro passa a ser dele, visível e corrigível na hora |
| Perfil do subject, applicability, ProblemType | um caso por procedimento: `cliente-sem-internet-ftth` é outro caso |
| `orcamento`, `passos[]`, allowlist | nada disso tem o que conter sem tool calling |
| Plano de resolução de conceito com fallback | conceito → capacidade 1:1 até aparecer a segunda fonte do mesmo conceito |
| Agregado rico `Investigacao` | virou resultado imutável de factory |

## 9. Riscos que permanecem

**R1 — A investigação não se adapta ao que encontra.** Se uma coleta muda o que se deveria olhar em
seguida (ONU responde, mas com sinal degradado → histórico de flaps), um roteiro plano não expressa
isso. O escape é o desfecho `inconclusivo` com escalação — nunca improviso da LLM. **Primeira
extensão a esperar:** uma tabela `quando <condição sobre evidência coletada> então colete
<conceito>`, um nível, sem aninhamento. É uma tabela, não uma linguagem, e só vale quando um
especialista pedir por um caso concreto.

**R2 — Coletar tudo sempre custa mais que uma investigação humana.** São chamadas somente leitura,
paralelas e cacheadas: 4–8 por investigação é aceitável. Se alguma for caríssima (varredura de
rede), marque a hipótese como `custosa` e rode-a em segunda onda, só se nenhuma anterior confirmar.
Duas ondas continuam triviais; não faça antes de doer.

**R3 — Dados externos ainda chegam ao prompt.** Sem tool calling a LLM não pode ser levada a
*agir*, mas ainda pode ser levada a *julgar errado* por um campo de texto livre. Evidência em bloco
de dados delimitado, e a regra fixada no prompt de sistema.

## 10. Lacunas: fatos que só o negócio decide

- **L1.** A ordem de precedência entre hipóteses — qual causa domina qual. É a decisão de negócio
  central, porque ela escolhe o desfecho.
- **L2.** A investigação nasce de um chamado, ou pode precedê-lo? Define se existe `chamadoRef`.
- **L3.** Quem é o `subject` — cliente, contrato ou terminal.
- **L4.** Frescor aceitável por conceito (o ttl de cada um).
- **L5.** O que o parecer pode expor ao cliente final versus só ao técnico.
- **L6.** Retenção de evidência e masking de PII antes do prompt.
- **L7.** Quem aprova a publicação de um caso.
- **L8.** Os vocabulários fechados de `desfecho`, `acao` e `destinatario`.

## 11. Módulos

```
conhecimento/   casos em markdown · glossário · schema · validador
investigacao/   coleta · port de julgamento · parecer · factory · evento
integracao/     capacidades (nome, versão, schemas, ttl) · normalizadores
                conectores: ifs · oracle · crm · radius
```

## 12. Onde investir primeiro

Se o core é o conhecimento curado, o maior retorno **não é o motor**. O motor da v4 é uma semana:
coleta paralela, uma port de julgamento, três métodos no caso, um evento, uma escrita.

O produto é o **ciclo de autoria**: o schema, o validador, a checagem de contrato na publicação, e
as projeções que dizem ao curador quais hipóteses nunca disparam. É lá que o sistema fica melhor
com o tempo, e é o único lugar onde investir mais rende mais.
