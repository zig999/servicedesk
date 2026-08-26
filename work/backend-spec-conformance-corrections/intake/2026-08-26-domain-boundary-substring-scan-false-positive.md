# Correção — o teste de fronteira do domínio recusa uma citação legítima, não um acoplamento

Comportamento observado ao rodar a suíte entregue, três vezes, em três entregas independentes
desta mesma iniciativa (`run/observation-endings-and-collection-budget-observation-port-unavailable-endings-suite/test.log`,
`run/observation-endings-and-collection-budget-observation-port-budget-clamp-suite/test.log`,
`run/connector-configuration-registration-conformance-incomplete-name-refusal-status-suite/test.log`):

`src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts`'s nono teste — "none of these
modules holds any mention of the http-connector module or its exports outside a static import
... except this epic's own legitimate HTTP adapter" — varre o texto bruto de cada módulo domain
(via `domainModuleSources()`) à procura de qualquer ocorrência da lista
`CONNECTOR_REQUEST_RESOLVER_BYPASS_MENTIONS`, que inclui a substring literal `'http-connector'`.

`src/investigation/observation-source.port.ts` cita, num comentário JSDoc, o nó da especificação
`rules/integration/an-http-connector-configuration-declares-its-call` — cuja identidade contém a
substring `http-connector` porque é assim que o nó se chama, não porque o arquivo referencia o
módulo `http-connector`. O arquivo não importa nada de `http-connector`; `failure-diagnostician`
confirmou isso três vezes, de forma independente, sempre com o mesmo veredito: `cause: test`,
falso positivo, nenhum acoplamento real.

A constraint que este teste aplica, `constraints/the-domain-depends-on-no-infrastructure`, tem seu
próprio `fitness` restrito a imports: "A dependency audit over the domain modules' imports finds
no framework, driver or client package." A varredura por substring bruta no texto do arquivo é
mais ampla do que o que a constraint declara verificar.

Comportamento correto: o teste continua recusando uma referência real ao módulo `http-connector`
fora do adaptador legítimo (um import, um lookup dinâmico, um service locator por string) — isso é
o que a constraint pede — mas para de recusar a substring aparecendo dentro da identidade de um nó
da especificação citado num comentário.

Nós que este comportamento implementa: `constraints/the-domain-depends-on-no-infrastructure`,
`rules/integration/an-http-connector-configuration-declares-its-call`,
`domain/integration/connector-configuration`.
