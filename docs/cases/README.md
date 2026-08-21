# Casos de diagnóstico — MWO sobre o domínio FSM do IFS

Documentação dos casos de diagnóstico do app mobile MWO, prontos para registro no motor de
hipóteses deste projeto, coletando exclusivamente do **domínio FSM do IFS**
(`/home/siegfriedneto/projects/ifs`).

## O que há aqui

```
docs/cases/
├── README.md                       ← este arquivo
├── registration-and-test-strategy.md   resumo, ordem de cadastro e os cinco níveis de teste
├── _glossary/                      o vocabulário, na forma que o seed lê
│   ├── subject-type.json  subject-attribute.json  concept.json
│   ├── outcome.json  action.json  recipient.json
│   └── vocabulary.md               o que cada termo significa (o registro não carrega descrição)
├── _registry/
│   ├── README.md                   ordem de cadastro, conferência e pendências
│   ├── capabilities/*.capability.json      a capacidade
│   └── connectors/*.connector.json         o collect (ConnectorConfiguration)
├── app-congelado-hardware/
│   ├── 1.json                      o caso, em formato manifest[]
│   └── collects.md                 origem do dado, por collect
└── init-device-perda-dados/
    ├── 1.json
    ├── collects.md
    └── blocked-cadeia-orfa-survey-anexo.md
```

## Os dois casos

| caso | sujeito | hipóteses | collects |
|---|---|---|---|
| `app-congelado-hardware` | `technician` | limitação de hardware → transação falha viva → push desabilitado | `perfil-mobile-tecnico`, `filas-de-transacao-falhadas` |
| `init-device-perda-dados` | `technician` | descarte por inicialização → re-inits em série → múltiplos devices | `filas-de-transacao-falhadas`, `serie-de-inits-do-device`, `perfil-mobile-tecnico` |

Os dois rodam com um único atributo de sujeito, `user-id`. Uma quarta hipótese de
`init-device-perda-dados` está deliberadamente fora do manifest — o motivo, e o que precisa mudar
no IFS, estão em `init-device-perda-dados/blocked-cadeia-orfa-survey-anexo.md`.

## O limite deste projeto

Este projeto **não consulta banco nenhum do FSM**. Não há driver Oracle, credencial de store nem
SQL em lugar algum daqui. Um collect é **uma chamada HTTP** a um serviço do IFS:

```
POST /v1/diagnose            (este projeto)
      │
      ├─ plano de coleta = os concepts que as hipóteses coletam
      │
      └─ por concept:  Capability → connector → ConnectorConfiguration
                                                 │  address + method + responseMap + statusMap
                                                 ▼
                          HttpDeclarativeObservationSource  ── fetch ──▶  IFS  ──▶  Oracle IFSAPP
                                                 │
                                                 └─ observação (JSON) ──▶ juiz ──▶ veredito
```

O único cliente HTTP é o `fetch` da plataforma — o adapter importa nenhum pacote de rede
(`src/src/investigation/http-declarative-observation-source.adapter.ts`, provado em
`__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts:145`). O único
banco que este projeto acessa é o **seu próprio Postgres**, onde ficam o cadastro (glossário,
concepts, capabilities, connectors, casos) e as investigações.

Quem abre conexão com o Oracle do FSM é o **IFS**, e só ele
(`ifs/knowledge/constraints/fsm-read-only-store-access.md`, `fsm-single-external-system.md`). Os
nomes de tabela que aparecem nos `collects.md` estão lá como **procedência** — de onde o fato vem,
e o que muda se ele mudar — nunca como algo endereçável daqui.

## De onde vêm os dados

Três collects, três capabilities, **duas** chamadas de rede distintas:

| concept | operação IFS | rota |
|---|---|---|
| `perfil-mobile-tecnico` | `get-tech-profile` | `GET /v1/technicians/:userId/profile` |
| `filas-de-transacao-falhadas` | `get-tech-sync-status` | `GET /v1/technicians/:userId/sync-status` |
| `serie-de-inits-do-device` | `get-tech-sync-status` *(a mesma operação, outra projeção)* | idem |

O IFS responde num envelope uniforme `{data, metadata, error[]}`, `data` sendo a entidade ou o
array direto (`ifs/backend/src/http/envelope.ts`). As operações e seus contratos estão em
`ifs/knowledge/contracts/fsm/`; as 31 regras que governam o que cada resposta pode e não pode
dizer, em `ifs/knowledge/rules/fsm/`.

Das treze operações do domínio (`ifs/knowledge/domain/fsm/fsm-directory.md`), estes casos usam
duas. As outras onze respondem status e eventos de tarefa, mídia de formulário, GPS, grupo de
acesso, população do dia, alocações e as duas pontes de identidade — disponíveis para os casos do
backlog.

## Três coisas que mudaram em relação ao material de referência

O material de origem foi escrito contra outro serviço FSM, com outro formato de resposta, e contra
uma versão anterior deste motor. Três decisões merecem ser lidas antes de qualquer edição.

**1. Nada é achatado, e nada precisa ser.** O motor entrega ao juiz o **valor inteiro** de cada
campo declarado, array completo incluído: o `responseMap` resolve um caminho, o valor vai inteiro
para a observação, e o juiz lê tudo
(`src/src/investigation/http-declarative-observation-source.adapter.ts:234`). Então
`installations` → `data.installations` é resposta completa, e perguntas como "alguma instalação
com X" vivem no `criterion`, que é onde devem viver. A sintaxe de caminho suporta chave aninhada e
índice de array, mas **não itera** — e não precisa.

**2. Nenhum fato do FSM é julgado antes de chegar ao juiz.** Não há campo `tier`, não há filtro por
fila, não há janela de 14 dias, não há limiar numérico embutido em lugar nenhum. O IFS se recusa a
derivar qualquer um deles — `ifs/knowledge/rules/fsm/fsm-facts-never-verdicts.md`,
`failed-transaction-queue-not-windowed.md`, `login-identity-answered-as-stored.md` — e o motor não
precisa que ele derive: a lista de modelos de linha de entrada, o nome da fila (`failed` vs
`deleted`) e a janela de tempo são **prosa do critério**. Isso elimina a duplicação que existia
entre uma expressão regular e um texto, e deixa um lugar só para corrigir.

**3. Vocabulários fechados, e em minúsculas.** `state` de instalação, `status` de assignment,
`taskType` de sync-task e `status` de tarefa são enumerações fechadas do IFS, todas **minúsculas**
(`active`, `init-entity-data`, …), mesmo que o store as guarde em maiúsculas. E um valor fora da
enumeração **derruba a leitura inteira** com HTTP 500, não a linha — custo declarado nas próprias
regras (`unknown-installation-state-fails-the-read`, `unknown-assignment-status-fails-the-read`).

## Antes de registrar

Leia `_registry/README.md`. Sete pendências estão abertas, e duas bloqueiam:

- **o endereço do IFS** — os `address` usam `http://IFS_HOST:IFS_PORT/…`, placeholder literal; o
  IFS não tem porta padrão e não registra autenticação própria;
- **não existe caminho de cadastro para `ConnectorConfiguration`** — o serviço e a tabela existem,
  mas nada os carrega: sem seed, sem rota, sem script.

E uma muda um resultado: **o limiar "três ou mais re-inits em 24 horas"** foi proposto aqui, não
herdado do material. Precisa ser confirmado antes do `release`.

## Sobre o formato do caso

Os `1.json` estão no formato que `src/src/case/parse-case-document.ts` lê **hoje**: `manifest[]`
com `hypothesis_name` + `revision`, mais `state`. O array `hypotheses` com `name` que as
instruções de trabalho de origem descrevem é a **forma retirada** — o parser não a lê mais.

Um caso, ainda assim, **não entra por arquivo**: entra por `createDraft` → `reviseHypothesis` →
`placeHypothesis` → `release`. Estes arquivos são documento de referência e fonte para o seed;
ambos estão com `state: "draft"` de propósito, porque `released_at` só existe depois do `release`
e uma versão liberada é imutável (`migrations/0006-case-version-immutability.sql`).
