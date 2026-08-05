# Gestão do Conhecimento de Troubleshooting — Avaliação da v1 e Especificação v2

## Parte 1 — O que a v1 acerta

Três decisões são boas e devem sobreviver a qualquer revisão:

1. **Separar conhecimento de integração.** O conhecimento muda por decisão de especialista; a
   integração muda por mudança de sistema. Ritmos diferentes, módulos diferentes.
2. **Conceito de negócio como unidade de solicitação da LLM.** A LLM pede "situação financeira",
   não `SELECT` no Oracle. É o acerto central da proposta.
3. **Parecer reproduzível a partir das evidências.** É o princípio certo — a v1 só não o
   instrumenta (ver problema B).

## Parte 2 — Problemas estruturais, ordenados por custo

### A. O agregado está invertido

A v1 elege `Case` como Aggregate Root e trata `Investigation` como "Engine" (serviço). Está ao
contrário.

`Case` é **conteúdo versionado**: descrição, hipóteses, estratégia, conceitos. Não tem invariante
comportamental além de "publicado é imutável". Modelá-lo como agregado rico produz um agregado
anêmico com nome de DDD.

`Investigation` é onde existe estado real, ciclo de vida e invariante que precisa de consistência
transacional:

- um parecer só existe se **toda** hipótese do playbook tiver avaliação — inclusive
  "inconclusiva";
- todo parecer cita ao menos uma evidência, e toda evidência citada existe no agregado;
- nenhum passo depois do encerramento;
- um passo só requisita capability dentro da allowlist derivada do playbook pinado;
- orçamento estourado força encerramento — **o sistema fecha, não a LLM**.

Essas cinco linhas justificam um agregado. As da v1 para `Case`, não.

**Correção:** dois agregados em dois contextos — `Playbook` (autoria) e `Investigation`
(execução).

### B. Evidência não é modelada — o princípio de reprodutibilidade fica sem mecanismo

A v1 declara "todo parecer deve ser reproduzível a partir das evidências coletadas" e não define
`Evidence` em nenhum lugar: não está nas entidades, nem nos VOs, nem no agregado.

Reproduzir um parecer exige três pinos que a v1 não tem:

- `playbookVersion` — o conhecimento usado;
- `promptTemplateVersion` + `modelId` — o raciocinador usado;
- `evidence[]` com entradas e saídas efetivas — os fatos usados.

Sem os três, "reproduzível" é aspiração. Com os três, é replay.

### C. `Capability Registry` declarado infraestrutura — e o vazamento acontece na resposta

A v1 diz: *"Não pertence ao domínio. É infraestrutura."* O **Connector** é infraestrutura. O
**contrato** da Capability — nome, schema de entrada e saída, o que a resposta significa em
negócio, natureza (leitura ou mutação), escopos exigidos, frescor — é o *published language*
entre os dois contextos. Tratá-lo como infra transforma o registry num mapa de strings, e uma LLM
não chama o que não tem schema.

Pior: a v1 protege a **chamada** ("o Case nunca conhece esses nomes") mas não a **resposta**. Se o
connector devolve o payload cru do Oracle, a tecnologia entra pelo formato — e o playbook passa a
depender de nomes de coluna. Falta a **normalização**: toda evidência chega no vocabulário do
glossário, nunca no do sistema de origem.

E `Concept → Capability` não é 1:1. "Situação Financeira" pode exigir faturas no Oracle **e**
acordo no CRM. O que resolve um conceito é um **plano** (1..N capabilities + normalizador +
fallback), não um ponteiro.

### D. O loop da LLM não tem limites — nem defesa contra injeção

"LLM decide. Sistema executa" descreve intenção, não contrato. Falta:

- teto de passos, de custo e de tempo;
- **allowlist por playbook**, derivada dos `RequiredConcepts` — reduz superfície e alucinação;
- critérios de encerramento verificáveis pelo sistema, não só declarados pela LLM;
- obrigação de citar evidência por afirmação.

E o risco que a v1 não menciona: um campo de texto livre no CRM ("observação do atendente") chega
ao prompt. Se evidências forem concatenadas como instrução, qualquer sistema corporativo é um
vetor de injeção. Evidências vão em canal de dados delimitado, com a regra fixada no prompt de
sistema — dado é dado, nunca instrução. E `nature: mutating` não é disparável por raciocínio de
LLM sem confirmação humana.

### E. Matching como decisão única e silenciosa

`CaseMatchingService` "retorna o Case mais adequado". Matching semântico é probabilístico; retornar
um único resultado sem score esconde o erro no lugar mais caro — a investigação inteira segue o
playbook errado.

**Correção:** top-N com score, limiar de confiança, modo genérico quando nada passa do limiar, e
registro do problema não-casado como insumo de curadoria. Matching é sugestão, não veredito.

### F. Não há caminho para dado indisponível — então a LLM preenche

Sistema externo fora do ar é o caso comum, não a exceção. Se `Evidence` só existe quando a coleta
dá certo, a ausência é invisível e a LLM completa a lacuna com o que é plausível. É exatamente a
patologia que este repositório chama de fechar gap com chute.

**Correção:** `Evidence.outcome ∈ {ok, unavailable, denied, timeout}`. Indisponível **é** uma
evidência. E `inconclusivo-por-indisponibilidade` é um Outcome legítimo, com o parecer declarando o
que não pôde ser verificado.

### G. Outcome sem ação, e nenhum loop de aprendizado

"Bloqueio Financeiro" é rótulo, não valor operacional. Um Outcome precisa carregar encaminhamento:
ação, destinatário, e se é automatizável. E nada na v1 fecha o ciclo — feedback do operador sobre
o parecer, problemas sem match, hipóteses nunca confirmadas, conceitos sempre indisponíveis. É o
que faz o sistema melhorar em vez de apenas rodar.

### H. Vocabulário misturado e um nome ambíguo

A v1 alterna `Caso`/`Case`, `Parecer`/`Verdict`. Escolher: identificadores em inglês, glossário
guardando o termo de negócio em português como autoridade.

E `Case` colide com "caso"/"chamado" no vocabulário de operação, num domínio que já tem ticket.
**`Playbook`** (ou "Roteiro de Investigação") desambigua sem custo.

## Parte 3 — Especificação v2

### Contextos (3)

| Contexto | Responsabilidade | Agregado | Ritmo |
|---|---|---|---|
| `knowledge` | Autoria e publicação de playbooks, glossário | `Playbook` | edições esparsas, humanas |
| `investigation` | Execução, evidências, parecer | `Investigation` | milhares/dia, automático |
| `integration` | Catálogo de capabilities + connectors | — (catálogo + adaptadores) | muda com os sistemas |

Feedback **não** é contexto no dia 1 — são eventos emitidos por `investigation`. Vira contexto
quando houver curadoria real.

### Agregado: Investigation

```
Investigation (AR)
├── id, requestedBy, subject          # cliente | contrato | terminal — ver lacuna L1
├── problemStatement                  # texto do solicitante
├── playbookRef { slug, version }     # pino de conteúdo
├── budget { maxSteps, maxCost, deadline }
├── steps[]                           # append-only: Requested | Recorded | Reasoned
├── evidence[]                        # Evidence
├── assessments[]                     # HypothesisAssessment
├── verdict?                          # Verdict
└── closure { reason }                # concluded | inconclusive-missing-data
                                      # | budget-exhausted | abandoned
```

`steps[]` append-only dá auditoria sem Event Sourcing.

### Distinção que a v1 funde

- `HypothesisDefinition` — conhecimento, no playbook: hipótese candidata.
- `HypothesisAssessment` — runtime, na investigação: `supported | refuted | inconclusive`, com as
  evidências que sustentam o julgamento.

### Evidence (VO)

```
Evidence
├── id
├── concept                # "situacao-financeira" — vocabulário de negócio
├── capability { name, version }
├── inputs                 # parâmetros efetivos, PII já minimizada
├── observation            # payload NORMALIZADO no vocabulário do glossário
├── rawRef?                # ponteiro para payload cru, store com retenção própria
├── observedAt, ttl
├── source                 # sistema de origem
└── outcome + detail       # ok | unavailable | denied | timeout
```

### Capability (published language, não infra)

```
Capability
├── name                   # network.equipment-status
├── version
├── inputSchema / outputSchema     # JSON Schema — é o que a LLM consegue chamar
├── semantics                      # o que a resposta significa, em negócio
├── nature                         # read-only | mutating
├── costClass, latencyClass, cacheTtl
└── requiredScopes
```

`Concept` resolve para um `ConceptResolutionPlan`: capabilities (1..N) + normalizador + fallback +
política de degradação.

### Fluxo v2

```
1. Requisição
2. Matching → top-N com score
3. score < limiar → modo genérico (allowlist mínima) + evento unmatched-problem
4. Playbook pinado por versão → Investigation aberta (orçamento + allowlist)
5. PRÉ-COLETA determinística e paralela dos conceitos obrigatórios  ← maior alavanca
6. LLM recebe: playbook + evidências (canal de dados) + allowlist de tools
7. Loop limitado: LLM pede conceito → resolver → Evidence
8. Encerramento: critério do sistema OU declaração da LLM + validação de totalidade
9. Verdict + Outcome + encaminhamento (ação, destinatário)
10. Feedback do operador → evento
```

O passo 5 é a decisão de engenharia mais importante da v2. Boa parte das verificações é
determinística (ONU offline? conta bloqueada?). Coletá-las antes, em paralelo e com cache, reduz
latência, custo e variância — a LLM entra para **interpretar e decidir**, não para descobrir o
óbvio um `tool_call` por vez.

### Estrutura de código

```
modules/
  knowledge/          # playbooks, glossário, publicação
  investigation/      # agregado, orquestração, parecer
  integration/        # capability catalog, connectors/{ifs,oracle,crm,radius}
```

Três módulos. `Case Engine` e `Investigation Engine` desaparecem como camadas nomeadas: são
application services dentro de `investigation`.

## Parte 4 — O que eu cortaria da v1

| Corte | Por quê |
|---|---|
| `Case Engine` / `Investigation Engine` como camadas | são application services |
| `CaseRepository.publish()` | publicação é comando do agregado, não do repositório |
| Event Sourcing | `steps[]` append-only já dá auditoria |
| `Case.status` visível ao runtime | runtime só vê versões publicadas |
| Contexto de feedback no dia 1 | eventos bastam até haver curadoria |
| `Metadata.tags/owner` | só se paga acima de ~30 playbooks |
| CRUD + tela de autoria de playbook | ver abaixo |

**Playbooks como markdown com frontmatter validado, em git.** Especialista edita, PR revisa,
publicação = tag; runtime consome um índice derivado. Elimina CRUD, workflow editorial e migração
de schema no dia 1 — e é exatamente o arranjo que este repositório já implementa (nós markdown +
`graph.json` derivado, schema único, validador que se recusa a derivar sobre base inconsistente).
O `Case Catalog` da v1 é um knowledge root.

### Quando essa arquitetura se paga

Abaixo de ~15 playbooks e 2 sistemas integrados, um arquivo de configuração e tool calling direto
resolvem melhor. A separação `Concept → Capability → Connector` se paga quando **um mesmo conceito
tem duas ou mais fontes** ou **os sistemas mudam mais rápido que o conhecimento**. Se nenhuma das
duas é verdade hoje, a indireção é custo sem retorno — e é reversível: comece com resolução
direta e introduza o plano quando o segundo fornecedor do mesmo conceito aparecer.

## Parte 5 — Diagramas da v2

### 5.1 Contextos, e o que atravessa cada fronteira

```
┌─ knowledge ──────────────────────────────────────────────────────
│  Playbook (AR)     problemType + applicability · hipóteses ·
│                    conceitos · critérios · outcomes
│                    markdown + frontmatter · publicação = tag git
│  Glossary          conceitos E tipos de problema — autoridade do
│                    vocabulário (um ProblemType não é nó próprio)
└────────────────────────────┬─────────────────────────────────────
                             │ PublishedPlaybook { slug, version,
                             │   hipóteses, conceitos exigidos,
                             │   critérios de encerramento, outcomes }
                             ▼ somente leitura
┌─ investigation ──────────────────────────────────────────────────
│  Investigation (AR)   steps[] · evidence[] · assessments[]
│                       verdict? · closure                ┌───────┐
│  orquestra e registra ─────────────────────────────────►│  LLM  │
│  o raciocínio         ◄─────────────────────────────────└───────┘
└────────────────────────────┬─────────────────────────────────────
                             │ pede:   Concept
                             │ recebe: Evidence (normalizada)
                             ▼
┌─ integration ────────────────────────────────────────────────────
│  Capability Catalog   name+version · schemas · semântica
│                       nature · escopos · cacheTtl
│  Connectors           ifs · oracle · crm · radius
└────────────────────────────┬─────────────────────────────────────
                             ▼
                   Sistemas Corporativos


        knowledge ─ ─ ─ ✗ ─ ─ ─► integration

        A aresta que não existe. Um playbook nomeia conceitos,
        nunca capabilities — é o desacoplamento inteiro.
```

### 5.2 Fluxo de uma investigação

```
Solicitante
    │ problemStatement + subject
    ▼
Perfil do subject   conceitos fixos, sempre coletados, cacheáveis
    │               (tecnologia de acesso, segmento, canal…)
    ▼
Classificar   texto → ProblemType, top-N com score   ← probabilístico
    │
    ├─ score ≥ limiar ─► Selecionar: ProblemType + perfil → Playbook
    │                    por applicability             ← determinístico
    │                            │
    └─ score < limiar ─► generico/investigacao-aberta
                          + evento unmatched-problem ──► curadoria
                                     │
                     ┌───────────────┘
                     ▼
Investigation aberta   playbookRef { slug, version, contentHash }
                       budget { maxSteps, maxCost, deadline }
                       allowlist ← conceitos exigidos pelo playbook

     Há sempre um playbook pinado. O modo genérico É um playbook
     publicado — não um caminho alternativo no código.
                     │
                     ▼
╔═ PRÉ-COLETA determinística ═════════════════════════════════════╗
║  conceitos obrigatórios, em paralelo, com cache, sem LLM        ║
║      concept    concept    concept    concept                   ║
║         └──────────┴─────┬────┴──────────┘                      ║
╚══════════════════════════╪══════════════════════════════════════╝
                           ▼ Evidence[]
   ┌─────────┐  1. pede Concept    ┌──────────────────┐
   │   LLM   │ ──────────────────► │ Concept Resolver │
   │         │ ◄────────────────── │                  │
   └─────────┘  2. Evidence        └──────────────────┘
        loop limitado por allowlist, maxSteps, maxCost, deadline
        cada volta grava um step (append-only)
                           │
                           ▼
guarda do orçamento ─ excedido? ─sim─► closure: budget-exhausted
                           │
                          não
                           ▼
validação de totalidade    toda hipótese tem assessment?
                           todo assessment tem evidência
                             ou "sem dados"?
                           │
                           ▼
Verdict + Outcome + encaminhamento (ação · destinatário)
                           │
                           ▼
Feedback do operador ──► eventos ──► curadoria do conhecimento
```

### 5.3 Resolução de um conceito

```
"Situação Financeira"        ← termo do glossário; é o que o playbook nomeia
       │
       ▼
ConceptResolutionPlan
   ├── billing.open-invoices    v2  read-only  ttl 60s   ──► oracle
   ├── crm.payment-agreement    v1  read-only  ttl 300s  ──► crm
   └── fallback: crm indisponível → prossegue sem acordo
       │
       ▼
Normalizador   payload do sistema → vocabulário do glossário
       │        (a tecnologia é barrada AQUI; a v1 barrava só na
       │         chamada e vazava na resposta)
       ▼
Evidence { concept, capability+version, inputs, observation,
           observedAt, ttl, source, outcome }

   outcome ∈ { ok | unavailable | denied | timeout }
             └─ "indisponível" É evidência, não ausência de evidência
```

### 5.4 O agregado, e o que o torna um agregado

```
Investigation (AR)
├── id · requestedBy · subject       ← L1: cliente? contrato? terminal?
├── problemStatement
├── playbookRef { slug, version, contentHash }  ─┐
├── promptTemplateVersion · modelId              ─┤ os 3 pinos do replay
├── evidence[]                                   ─┘
├── budget { maxSteps, maxCost, deadline }
├── steps[]        append-only: Requested → Recorded → Reasoned
├── assessments[]  supported | refuted | inconclusive + evidências
├── verdict?
└── closure { concluded | inconclusive-missing-data
            | budget-exhausted | misrouted | abandoned }

invariantes
 1. verdict ⇒ toda hipótese do playbook tem assessment
 2. verdict cita ≥1 evidência, e toda citada existe em evidence[]
 3. nenhum step após closure
 4. step só requisita capability na allowlist do playbook pinado
 5. budget excedido ⇒ closure automática — o sistema fecha, não a LLM
 6. capability nature=mutating ⇒ confirmação humana obrigatória
 7. playbookRef é fixado na abertura e nunca muda: playbook errado
    encerra como misrouted e abre outra investigação — repinar em
    voo invalidaria os assessments já feitos e quebraria o replay
```

### 5.5 Tipo de problema e procedimento não são a mesma coisa

```
ProblemType  "cliente-sem-internet"      ← termo do glossário, não nó
   │                                       é o que a classificação devolve
   │ 1..N
   ├──► Playbook  ftth/cliente-sem-internet
   │      applicability { acesso: ftth }
   ├──► Playbook  radio/cliente-sem-internet
   │      applicability { acesso: radio }
   └──► Playbook  coax/cliente-sem-internet
          applicability { acesso: coax }

regra que o validador sustenta
  playbooks que declaram o mesmo problemType têm applicability
  disjunta — senão a seleção volta a ser um palpite

por que ProblemType não é nó próprio
  o glossário já é a autoridade do vocabulário, e um segundo tipo de
  nó só se paga quando o tipo de problema passar a carregar fato
  próprio (sintomas, histórico, incidência). Promover depois é
  aditivo: o pino é do playbook, não do tipo.
```

A v1 chamava de `Case` três coisas distintas — o chamado, o tipo de problema e o
procedimento de investigação. É por isso que a palavra saiu: cada uma tem dono,
cardinalidade e ciclo de vida diferentes.

## Parte 6 — Lacunas: fatos que só o negócio decide

Nenhuma destas deve ser preenchida por inferência de arquitetura.

- **L1.** Qual é o `subject` de uma investigação — cliente, contrato ou terminal? Define a
  cardinalidade de tudo.
- **L2.** Autoridade do parecer: sugestão ao atendente ou ação automática? Muda as garantias
  exigidas.
- **L3.** Frescor aceitável por conceito — um "ONU offline" de 5 minutos atrás ainda vale?
- **L4.** O que pode ser exibido ao cliente final versus só ao técnico.
- **L5.** SLA de latência da investigação — define se a pré-coleta é síncrona.
- **L6.** Retenção de evidência e de payload cru (LGPD), e masking de PII antes do prompt.
- **L7.** Quem aprova a publicação de um playbook.
- **L8.** A investigação nasce de um chamado, ou pode precedê-lo? Define se existe `ticketRef` e
  de quem é o encaminhamento do parecer.
- **L9.** Quais fatos compõem o perfil do subject, e por que a aplicabilidade de um playbook
  varia — tecnologia de acesso, segmento, canal? É o que decide se `ProblemType` continua
  vocabulário ou vira nó próprio.
