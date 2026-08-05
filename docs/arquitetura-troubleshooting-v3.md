# Gestão do Conhecimento de Troubleshooting — v3 (proposta simplificada)

A v2 está em `arquitetura-troubleshooting-v2.md` e permanece como o registro do raciocínio. Este
documento é a proposta a implementar.

## O que muda, em uma frase

**A LLM para de orquestrar.** Na v1 e na v2 ela descobria em tempo de execução o que olhar, via
tool calling. Na v3 o que olhar está declarado no caso — a LLM só julga o que foi coletado e
escreve o parecer.

Essa única mudança elimina, de uma vez: o loop de tool calling, o orçamento de passos, a allowlist
derivada em runtime, o log de passos append-only, a superfície de injeção pela escolha de
ferramenta, e o encerramento declarado pela LLM. O que a v2 precisava de seis invariantes para
conter, a v3 não permite acontecer.

## Estrutura do conhecimento: um arquivo por caso

```
Caso  (um markdown por caso, versionado em git)
├── slug · título · quando usar
├── coletas_iniciais: [conceito]        ← contexto do parecer, não prova
├── hipóteses, em ordem de precedência:
│     ├── nome
│     ├── coletas: [conceito]           ← o "playbook" da hipótese
│     ├── confirma_quando: <critério em linguagem de negócio>
│     ├── outcome
│     └── encaminhamento { ação, destinatário }
└── sem_hipótese_confirmada: outcome + encaminhamento
```

A "investigação de cada hipótese" é exatamente o par **coletas + critério**. Fica inline no
arquivo do caso: duplicar uma hipótese entre dois casos custa seis linhas de markdown, visíveis e
editáveis, enquanto extraí-la para nó próprio custa um tipo de nó, resolução de referência,
versionamento independente e a pergunta "de quem é o outcome". **Gatilho para revisar:** quando a
mesma hipótese aparecer no terceiro caso, extraia — a extração é mecânica e o pino continua sendo
do caso.

### Exemplo

```yaml
caso: cliente-sem-internet
titulo: Cliente sem internet
quando_usar: cliente relata ausência total de conexão

coletas_iniciais:            # enquadram o parecer; não julgam hipótese
  - dados-do-contrato
  - tecnologia-de-acesso

hipoteses:                   # ORDEM = PRECEDÊNCIA — ver lacuna L1
  - nome: incidente-regional
    coletas: [incidentes-na-regiao]
    confirma_quando: há incidente aberto cobrindo a localidade do cliente
    outcome: incidente-regional
    encaminhamento: { acao: informar-prazo, destinatario: atendimento }

  - nome: ordem-em-andamento
    coletas: [ordens-em-andamento]
    confirma_quando: existe ordem de serviço em execução no cliente
    outcome: intervencao-tecnica-em-curso
    encaminhamento: { acao: informar-ordem, destinatario: atendimento }

  - nome: bloqueio-financeiro
    coletas: [situacao-financeira]
    confirma_quando: o acesso está bloqueado por inadimplência
    outcome: bloqueio-financeiro
    encaminhamento: { acao: orientar-pagamento, destinatario: atendimento }

  - nome: onu-offline
    coletas: [estado-do-equipamento]
    confirma_quando: o equipamento do cliente não responde
    outcome: onu-offline
    encaminhamento: { acao: abrir-ordem-corretiva, destinatario: suporte-n2 }

sem_hipotese_confirmada:
  outcome: inconclusivo
  encaminhamento: { acao: escalar, destinatario: suporte-n2 }
```

A ordem acima é **ilustrativa**. Qual causa domina qual é fato de domínio — ver L1.

## Formato: três audiências, três formatos

A pergunta "YAML ou prosa" tem resposta diferente por campo, porque os campos têm consumidores
diferentes.

| Quem consome | O quê | Formato |
|---|---|---|
| o motor | coletas, ordem das hipóteses, outcome, encaminhamento, ttl | YAML no frontmatter, validado por schema |
| a LLM que julga | o critério de **uma** hipótese + as evidências dela | prosa curta, uma a três frases |
| o curador humano (e, no máximo, o parecer) | por que a hipótese existe, nuance, histórico | prosa no corpo, **fora** do prompt de julgamento |

**Regra que impede a deriva: nada no corpo pode mudar o que é coletado.** Se muda, é frontmatter.

### Por que não tudo em prosa

O motor não interpreta texto. Para coletar a partir de prosa, uma LLM teria que extrair a lista de
conceitos — e aí está de volta uma LLM decidindo o que olhar, que é exatamente o que a v3 removeu.
Pior: a extração é não determinística, então **o plano de coleta do mesmo caso mudaria entre duas
execuções**, e o replay morre. Prosa também não é validável: um schema exige que toda hipótese
tenha coleta, critério e outcome; um bloco de texto não pode ser recusado por estar incompleto.

### Por que não tudo estruturado

Estruturar o critério — `incidentes.count > 0 AND incidentes.localidade == cliente.localidade` —
transforma conhecimento em código e devolve a curadoria ao desenvolvedor. O critério é o único
lugar do caso onde a nuance do especialista é o valor; é o último campo que deve virar expressão.

### O que substitui o determinismo no critério

Não determinismo, e sim **rastreabilidade**: a avaliação é obrigada a citar o campo da evidência em
que se apoiou. Um julgamento que diz `supported` citando `estado-do-equipamento.status` é
verificável por um humano em um segundo — o que um booleano exato daria de garantia, a citação dá
de auditoria, sem congelar o conhecimento em sintaxe.

Duas regras de escrita para o critério:

- **uma afirmação falsificável por hipótese.** "Confirma quando X, ou também quando Y" são duas
  hipóteses, e separá-las é o que permite citar evidência por uma delas.
- **o prompt de julgamento é fechado**: só o critério daquela hipótese, só as evidências dela, e a
  instrução de que o que não se deduz da evidência é `inconclusive` — nunca inferência.

## Fluxo

```
Atendente escolhe o caso            (ou o chamado já traz a categoria)
        │  + subject
        ▼
Caso pinado { slug, version, contentHash }
        │
        ▼
╔═ COLETA ═════════════════════════════════════════════════════════╗
║  união de coletas_iniciais + coletas de TODAS as hipóteses,      ║
║  deduplicada, em paralelo, com cache por TTL, somente leitura    ║
║                                                                  ║
║   conceito   conceito   conceito   conceito   conceito           ║
║      └──────────┴─────┬────┴──────────┴──────────┘              ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼ Evidence[]  (normalizadas, com outcome)
╔═ JULGAMENTO ═════════════════════════════════════════════════════╗
║  uma chamada de LLM por hipótese, em paralelo, prompt pequeno:   ║
║  recebe só o critério da hipótese e as evidências dela           ║
║                                                                  ║
║   hipótese 1     hipótese 2     hipótese 3     hipótese 4        ║
║      │               │               │               │           ║
║   supported      refuted        refuted     inconclusive         ║
║   + evidências citadas                      (sem dados)          ║
╚═════════════════════════╪════════════════════════════════════════╝
                          ▼
Precedência (código, não LLM)
  primeira hipótese confirmada na ordem do caso → seu outcome
  nenhuma confirmada → outcome de sem_hipótese_confirmada
  as posteriores à confirmada ficam superseded
                          │
                          ▼
Parecer (uma chamada de LLM, com tudo em mãos)
  texto para o destinatário + outcome + encaminhamento declarados
                          │
                          ▼
Feedback do operador ──► eventos ──► curadoria dos casos
```

### O que a LLM faz — e só isso

1. Julga **uma** hipótese por chamada: `supported | refuted | inconclusive`, citando as evidências
   que sustentam o julgamento.
2. Escreve o parecer para o destinatário.

### O que a LLM não faz

Não escolhe o caso, não decide o que coletar, não chama integração, não aplica precedência, não
escolhe o outcome, não declara encerramento. **Nenhuma tool call existe no sistema.**

Julgar cada hipótese isolada, em paralelo, tem três efeitos além do custo: prompt pequeno, nenhum
viés de ordem entre hipóteses, e cada julgamento auditável por conta própria.

## Invariantes

```
1. uma avaliação por hipótese do caso pinado — inconclusive conta,
   silêncio não
2. toda avaliação cita ≥1 evidência; "sem dados" cita a evidência
   cujo outcome ≠ ok
3. o outcome do parecer é o declarado pela hipótese de maior
   precedência confirmada, ou o de sem_hipótese_confirmada — o
   parecer não inventa outcome fora do caso
4. nenhuma capability mutating: o sistema diagnostica e encaminha,
   nunca age. Ação é de pessoa.
5. pinos do replay: casoRef{slug,version,contentHash} + modelId
   + promptVersion + evidence[]
```

A invariante 4 é uma decisão de projeto, não uma limitação: ela apaga confirmação humana de
mutação, escopos de escrita e metade das preocupações de segurança.

## O registro da investigação

```
Investigacao  (registro, não agregado rico — o processo é uma linha reta)
├── id · requestedBy · subject · ticketRef?      ← L2
├── problemStatement
├── casoRef { slug, version, contentHash }
├── promptVersion · modelId
├── evidence[]      { conceito, capability+v, inputs, observation,
│                     observedAt, ttl, source, outcome }
├── avaliacoes[]    { hipótese, veredito, evidências citadas }
└── parecer         { outcome, encaminhamento, texto }
```

Sem `budget`, sem `steps[]`, sem `closure`: o fim é a coleta terminar e as avaliações estarem
completas — condição verificável, não estado a manter.

## O que foi mantido da v2, e por quê

| Mantido | Por quê |
|---|---|
| `Evidence.outcome ∈ {ok, unavailable, denied, timeout}` | sem isso a ausência de dado é invisível e a LLM preenche a lacuna |
| Normalização payload → vocabulário do glossário | é onde a tecnologia é barrada; barrar só na chamada vaza pela resposta |
| Conceito de negócio → capability → connector | melhor ideia da v1; é o que torna a integração substituível |
| Pinos de conteúdo para replay | "parecer reproduzível" só é verdade com eles |
| Outcome com encaminhamento | diagnóstico sem ação não tem valor operacional |

## O que foi cortado da v2, e o custo

| Cortado | Custo aceito |
|---|---|
| Loop de tool calling da LLM | investigação não se adapta ao que encontra — ver R1 |
| Matching semântico, limiar, modo genérico | o humano classifica; erro de classificação passa a ser dele, visível e corrigível na hora |
| Perfil do subject + applicability + ProblemType | um caso por procedimento: `cliente-sem-internet-ftth` é outro caso. Duplicação de conteúdo curado é barata e visível |
| `budget`, `steps[]`, allowlist, `misrouted` | nada disso tem o que conter sem tool calling |
| `ConceptResolutionPlan` com fallback | conceito → capability 1:1 até aparecer a segunda fonte do mesmo conceito |
| Agregado rico `Investigation` | virou registro com condição de completude |

## Riscos que permanecem

**R1 — A investigação não se adapta ao que encontra.** Se uma coleta muda o que se deveria olhar
em seguida (ONU responde, mas com sinal degradado → histórico de flaps), um roteiro plano não
expressa isso. O escape na v3 é o outcome `inconclusivo` com escalação — nunca improviso da LLM.
**Primeira extensão a esperar:** uma tabela de `quando <condição sobre evidência coletada> então
colete <conceito>`, um nível, sem aninhamento. É uma tabela, não uma linguagem — e só vale quando
um especialista pedir por um caso concreto.

**R2 — Coletar tudo sempre custa mais que uma investigação humana.** São chamadas somente leitura,
paralelas e cacheadas, então 4–8 por investigação é aceitável. Se alguma for caríssima (varredura
de rede), marque a hipótese como `custosa` e rode-a em segunda onda, só se nenhuma anterior
confirmar. Duas ondas continuam triviais; não faça antes de doer.

**R3 — Dados de sistemas externos ainda chegam ao prompt.** Sem tool calling a LLM não pode ser
levada a *agir*, mas ainda pode ser levada a *julgar errado* por um campo de texto livre. Mitigação
inalterada: evidência em bloco de dados delimitado, e a regra fixada no prompt de sistema.

## Lacunas

- **L1.** A ordem de precedência entre hipóteses — qual causa domina qual. É a decisão de negócio
  central da v3, porque ela escolhe o outcome. Não é de arquitetura.
- **L2.** A investigação nasce de um chamado, ou pode precedê-lo? Define se existe `ticketRef`.
- **L3.** Quem é o `subject` — cliente, contrato ou terminal.
- **L4.** Frescor aceitável por conceito (o TTL de cada um).
- **L5.** O que o parecer pode expor ao cliente final versus só ao técnico.
- **L6.** Retenção de evidência e masking de PII antes do prompt.
- **L7.** Quem aprova a publicação de um caso.

## Módulos

```
conhecimento/   casos em markdown · glossário · validação de schema
investigacao/   coleta · julgamento · precedência · parecer · registro
integracao/     capabilities (nome, versão, schemas, ttl) · connectors
                ifs · oracle · crm · radius
```
