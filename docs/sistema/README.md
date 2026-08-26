# ServiceDeskN1 — Documentação do Sistema

Esta documentação descreve o ServiceDeskN1 por inteiro: **o que ele é**, **todas as entidades e
seus atributos**, e **como o engine de diagnóstico funciona** do pedido HTTP ao registro gravado.
Foi escrita para quem não conhece o código; cada afirmação técnica aponta para o arquivo em
`src/` que a implementa e, quando existe, para o nó da especificação em `knowledge/` que a
autoriza.

> **Convenção de caminhos.** O código-fonte vive em `src/src/`; nesta documentação os caminhos
> são abreviados como `src/<módulo>/<arquivo>.ts`. A especificação (`knowledge/domain`,
> `knowledge/rules`, `knowledge/constraints`, `knowledge/scenarios`) é a fonte de verdade das
> regras; o código a implementa.

## Parte I — Visão geral

| Cap. | Assunto | Arquivo |
|---|---|---|
| 1 | O que o sistema é e o que resolve | [01-visao-geral.md](01-visao-geral.md#1-o-que-o-sistema-é-e-o-que-resolve) |
| 2 | Vocabulário essencial | [01-visao-geral.md](01-visao-geral.md#2-vocabulário-essencial) |
| 3 | Arquitetura hexagonal — portas, adaptadores, factories | [01-visao-geral.md](01-visao-geral.md#3-arquitetura-hexagonal) |
| 4 | Mapa de contextos | [01-visao-geral.md](01-visao-geral.md#4-mapa-de-contextos) |

## Parte II — Entidades e atributos

Cada entidade é apresentada no mesmo formato: propósito, tabela de atributos, invariantes e
regras, relacionamentos, erros que pode disparar e onde vive (código, banco, rotas HTTP).

| Cap. | Contexto | Entidades | Arquivo |
|---|---|---|---|
| 5 | **Glossário** — o vocabulário controlado | Concept, SubjectType, SubjectAttribute, Outcome, Action, Recipient | [02-glossario.md](02-glossario.md) |
| 6 | **Integração** — como o sistema observa o mundo | Capability, CapabilityNature, CapabilityRegistry, ConnectorConfiguration, ConnectorConfigurationRegistry | [03-integracao.md](03-integracao.md) |
| 7 | **Conhecimento** — a ficha de troubleshooting | Case, CaseVersion, CaseVersionState, Hypothesis, HypothesisRevision, ManifestEntry, Resolution, Referral, ConsolidationRegister, CaseSummary; coerência do caso | [04-conhecimento.md](04-conhecimento.md) |
| 8 | **Investigação** — o registro imutável de um diagnóstico | Investigation, Subject, SubjectAttributeValue, Evidence, EvidenceResult, Evaluation, Verdict, EvaluationReason, Citation, Assessment, Cost, Durations | [05-investigacao.md](05-investigacao.md) |
| 9 | Diagramas de classes por contexto | — | [06-diagramas.md](06-diagramas.md) |

## Parte III — Como o engine funciona

| Cap. | Assunto | Arquivo |
|---|---|---|
| 10 | O pipeline `POST /v1/diagnose` de ponta a ponta | [07-pipeline.md](07-pipeline.md) |
| 11 | Etapa 1 — Leitura e validação do caso pinado | [07-pipeline.md](07-pipeline.md) |
| 12 | Etapa 2 — Coleta de evidências | [08-coleta.md](08-coleta.md) |
| 13 | Etapa 3 — Julgamento das hipóteses (pool, prompt fechado, `no-data`, parse, citações e retry) | [09-julgamento.md](09-julgamento.md) |
| 14 | Etapa 4 — Resolução do desfecho | [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) |
| 15 | Etapa 5 — Consolidação do texto da conclusão | [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) |
| 16 | Etapa 6 — Gravação imutável e resposta síncrona | [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) |
| 17 | Orçamento de tempo — deadline absoluto propagado | [11-deadlines.md](11-deadlines.md) |
| 18 | Portas e adaptadores do engine | [12-portas-adaptadores.md](12-portas-adaptadores.md) |
| 19 | Exemplo prático de ponta a ponta | [13-exemplo.md](13-exemplo.md) |

## Parte IV — Interfaces e operação

| Cap. | Assunto | Arquivo |
|---|---|---|
| 20 | API HTTP — catálogo de rotas, DTOs e códigos de erro | [14-api-http.md](14-api-http.md) |
| 21 | Modelo relacional — tabelas, migrações, mapeamento entidade → tabela | [15-modelo-relacional.md](15-modelo-relacional.md) |
| 22 | Configuração — variáveis de ambiente e factories de composição | [16-configuracao.md](16-configuracao.md) |
| 23 | Catálogo de erros | [17-erros.md](17-erros.md) |
| 24 | Lacunas conhecidas entre especificação e código | [18-lacunas.md](18-lacunas.md) |

## Anexos

| Anexo | Assunto | Arquivo |
|---|---|---|
| A | Regra de negócio → arquivo que a implementa | [anexos.md](anexos.md#a-regras-de-negócio--implementação) |
| B | Restrições arquiteturais explicadas | [anexos.md](anexos.md#b-restrições-arquiteturais-knowledgeconstraints) |
| C | Cenários como casos de teste de leitura | [anexos.md](anexos.md#c-cenários-como-casos-de-teste-knowledgescenarios) |
| D | Índice remissivo de entidades e termos | [anexos.md](anexos.md#d-índice-remissivo) |

## Por onde começar

- **Quer entender o produto em 10 minutos?** Leia o capítulo 1 e depois o 19 (exemplo prático).
- **Vai cadastrar um caso novo?** Capítulos 5, 6 e 7 — o que o glossário, as capabilities e a
  ficha precisam ter para o caso ser coerente.
- **Vai mexer no engine?** Capítulos 10 a 18, começando pelo diagrama de sequência do 10.
- **Vai integrar por HTTP?** Capítulo 20.
- **Vai priorizar conformidade com a especificação?** Capítulo 24 é o backlog consolidado.

## Documentos relacionados

- [`../../README.md`](../../README.md) — visão resumida do serviço e como rodar.
- [`../hypothesis-engine.md`](../hypothesis-engine.md) — documento anterior, focado só no motor
  de hipóteses; seu conteúdo foi absorvido e atualizado nos capítulos 13 a 17.
- [`../cases/`](../cases/) — casos curados e estratégia de registro e teste.
- [`../../knowledge/`](../../knowledge/) — a especificação.
