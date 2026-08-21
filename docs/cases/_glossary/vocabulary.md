# Vocabulário — o que cada termo significa

Os seis arquivos JSON deste diretório estão na forma que o motor lê
(`src/src/fixtures/glossary/*.json`, tipo `GlossaryTerm` em `src/src/glossary/terms.ts`): um
array por vocabulário, e **todo termo carrega apenas `name`** — `subject-type`,
`subject-attribute`, `outcome`, `action` e `recipient` não têm campo de descrição. Só `concept`
tem mais: `accepts` e `ttl`, ambos obrigatórios.

Este documento é onde as descrições vivem, porque o registro não as carrega.

## `subject-type`

| termo | o que é |
|---|---|
| `technician` | Técnico de campo identificado pelo seu usuário corporativo (@Unifique), portador do device com o app MWO. |

## `subject-attribute`

Vocabulário **global e plano**: nada amarra um atributo a um tipo de sujeito
(`knowledge/domain/glossary/subject-attribute.md` declara só `name`). Um sujeito de
`POST /v1/diagnose` carrega `{type, attributes: [{attribute, value}, …]}`, e um `${subject:x}`
resolve se — e só se — o chamador tiver passado `x` não-vazio
(`connector-request-resolver.ts:208`).

| termo | o que é |
|---|---|
| `user-id` | Usuário corporativo do técnico, sem domínio. **Passado na grafia que o store do FSM guarda.** O IFS recusa, por decisão, normalizar a caixa (`ifs/knowledge/rules/fsm/login-identity-answered-as-stored.md`); os valores observados são maiúsculos (`FIDEM.VIEIRA`), por observação e não por contrato. |

## `concept`

`ttl` é a tolerância de frescor, em segundos — a mais estrita entre os casos que usam o concept.
**Os três valores abaixo são propostos, não medidos** (ver `../_registry/README.md`).

| concept | KB | `accepts` | `ttl` | o que se observa | operação IFS |
|---|---|---|---|---|---|
| `perfil-mobile-tecnico` | V4 | `technician` | 300 | As instalações do app mobile de um login e o aparelho vinculado a cada uma. | `get-tech-profile` |
| `filas-de-transacao-falhadas` | V5b | `technician` | 60 | As três filas de transação de um login — `failed`, `deleted`, `ignored` — como o store as guarda. | `get-tech-sync-status` |
| `serie-de-inits-do-device` | V5a | `technician` | 60 | O histórico de tentativas de sincronização de um login: inicializações e batches. | `get-tech-sync-status` *(a mesma chamada)* |

A coluna **KB** é procedência: a sigla da verificação de coleta no material de origem
(`kb/siglas.yaml`). V5a e V5b são duas projeções sobre **uma** operação do IFS — o catálogo de
origem também não tinha uma operação por sigla, tinha uma por forma de leitura.

`accepts` foi apertado para **`technician` sozinho**. Os dois casos deste diretório têm
`subject: technician`, as três operações do IFS são login-scoped, e um `accepts` mais largo seria
uma afirmação que nenhum caso sustenta.

## `outcome`

Vocabulário **contribuído**: cada hipótese confirmável de cada caso contribui o seu. Os dois
desfechos de não-conclusão (`inconclusive-no-data`, `inconclusive-hypotheses-exhausted`)
**preexistem a qualquer caso** e são escritos pelo próprio seed
(`NON_CONCLUSION_OUTCOMES`, `src/src/glossary/terms.ts:81`) — por isso não estão em
`outcome.json` aqui.

| termo | o que foi concluído |
|---|---|
| `issue-limitacao-de-hardware` | O aparelho é de linha de entrada e o app está sendo encerrado por falta de memória. |
| `issue-transacao-falha-viva` | Há transação em falha ainda reprocessável no servidor — o dado não se perdeu. |
| `issue-push-desabilitado` | Um aparelho ativo do técnico está com notificações desligadas no cadastro mobile. |
| `issue-descarte-por-inicializacao` | Houve descarte de transações por inicialização: perda irreversível do que não havia sincronizado. |
| `issue-re-inits-em-serie` | O device está sendo reinicializado em série, interrompendo downloads pela metade. |
| `issue-multiplos-devices-vinculados` | Há dois ou mais aparelhos vinculados ao mesmo usuário. |

## `action`

Nomeia **o ato**, nunca o motivo — duas hipóteses que levam ao mesmo ato usam o mesmo nome.

| termo | o ato |
|---|---|
| `orientar-runbook-de-hardware` | Passar o runbook de hardware: encerrar apps concorrentes de memória, desligar economia de bateria. |
| `solicitar-reprocesso-de-transacao` | Pedir reprocesso da transação em falha — o registro pai primeiro, nunca o anexo solto. |
| `orientar-runbook-de-push` | Passar o runbook de push: religar o envio de notificações no cadastro mobile. |
| `orientar-regras-de-ouro-do-mwo` | Passar as regras de ouro de uso do app. |
| `escalar-fornecedor-ifs` | Abrir escalação para o fornecedor do produto FSM. |
| `orientar-logout-login-sem-inicializar` | Orientar logout/login **sem** inicializar o device. |
| `remover-devices-obsoletos` | Remover do cadastro os aparelhos que o técnico não usa mais. |

## `recipient`

Sempre uma fila operacional real, nunca uma pessoa.

| termo | quem executa |
|---|---|
| `fila-suporte-mwo` | Suporte do MWO. |
| `fila-ti-unifique` | TI Unifique. |
| `fila-backoffice` | BackOffice. |
| `fila-fornecedor-ifs` | Fornecedor do produto FSM. |

## Termos adiados

Não estão registrados, deliberadamente — nada os usa hoje, e um termo registrado que nenhum caso
cita é uma afirmação sem lastro.

| termo adiado | o que é | volta quando |
|---|---|---|
| `subject-type` `task` | Ordem de serviço/tarefa no FSM, identificada pelo seu identificador de task. | um caso declarar `subject: task` (`status-divergente-pso`, `task-nao-desce`). |
| `subject-attribute` `task-seq` | Identificador numérico da task no FSM (`JT_TASK_TAB.TASK_SEQ`). | um connector precisar de `${subject:task-seq}` — o que acontece na primeira operação task-scoped do IFS que entrar. |
| `concept` `eform-respostas-e-fotos` (V7) | — | o IFS passar a responder o pareamento com a biblioteca de mídia (ver `../init-device-perda-dados/blocked-cadeia-orfa-survey-anexo.md`). |
| `concept` `assignments-envio-baixa` (V2) | — | ver `../_registry/README.md` §"V2 e a ponte de identidade". |
| `concept` `status-da-task` (V1), `usuario-grupo-de-acesso` (V8) | — | um caso os coletar. O IFS já os responde (`get-task-status`, `get-tech-access`). |
| `outcome` `issue-cadeia-orfa-survey-anexo`, `issue-id-tecnico-nao-encontrado`, `issue-id-task-nao-encontrado`, `issue-sem-grupo-de-acesso`, `issue-init-nao-concluida`, `issue-longo-periodo-sem-acesso`, `issue-cauda-de-entrega-no-servidor`, `issue-servico-nao-iniciado` | — | a hipótese que contribui cada um entrar num caso. |
| `action` `solicitar-id-correto`, `cadastrar-grupo-de-acesso`, `orientar-refazer-logon`, `orientar-iniciar-servico`, `reverificar-apos-janela-de-sincronizacao` | — | idem. |
