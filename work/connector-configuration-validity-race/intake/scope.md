# Corrective increment — the connector-configuration detail hook reports ready before it knows whether the configuration is valid

The human's ask, verbatim (in the session's own language, Portuguese):

"Incremento corretivo. Projeto: /home/siegfriedneto/projects/servicedeskn1. Target: frontend.
Slug da iniciativa: connector-configuration-validity-race. Comportamento errado, observado
rodando a suíte do sistema entregue: useConnectorConfigurationDetail reporta a fase "ready" assim
que query.data existe, mas configurationValid é inicializado como true e só corrigido dentro de um
useEffect que roda depois — então, no instante da transição para ready, um consumidor que lê
configuration.isValid recebe true para uma configuração cujo JSON carregado não é um objeto e
portanto é inválida. É corrida real e intermitente: dos cinco casos do it.each em
use-connector-configuration-detail-validity.spec.ts, um falhou (a string nua) e quatro passaram.
Arquivo em que o comportamento errado vive:
frontend/app/src/hooks/use-connector-configuration-detail.ts"

## The wrong behavior, as observed

useConnectorConfigurationDetail initialises configurationValid to true with useState.
It corrects that value only inside a useEffect keyed on query.data.
It reports phase "ready" as soon as query.data is present, without waiting for that effect to
have committed.
So at the moment of the transition to ready, a consumer reading configuration.isValid observes the
stale default true for a loaded configuration whose text does not parse to an object — a
configuration that is in fact not valid.

## How it surfaced

The frontend suite's own use-connector-configuration-detail-validity.spec.ts exercises five loaded
values through an it.each; one of the five failed and four passed in the same run, which is the
shape of a race rather than of a wrong constant.
The failing case was a bare string: the test read configuration.isValid as true where it expected
false.
The run that reported it is delivery/case-not-valid-error-code-frontend/run/case-not-valid-error-code-error-code-mapping-keys-on-the-current-name-suite-2,
captured during an unrelated re-delivery, and its diagnosis named this hook and this cause.

## The file the wrong behavior lives in

frontend/app/src/hooks/use-connector-configuration-detail.ts
