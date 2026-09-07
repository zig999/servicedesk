Escopo: as três correções que a revisão button-footer-standardization-full-scope apontou.

Nenhum /analyse é necessário: os três fatos já têm nó.
Este escopo não pede fato novo à especificação.

## Correção 1 — o abandono devolve à tela de onde se veio, e a rota para a listagem é um controle próprio

Hoje, nas quatro superfícies de autoria dos dois registros, um único controle chamado Cancel é ao mesmo tempo o abandono e a rota para a listagem, e ele leva sempre à listagem:

- `src/routes/capability-create-screen.tsx` — Cancel como Link fixo para `/capabilities`, nas três fases
- `src/routes/capability-detail-ready-view.tsx` — Cancel como Link fixo para `/capabilities`
- `src/routes/connector-configuration-create-screen.tsx` — Cancel como Link fixo para `/connectors`
- `src/routes/connector-configuration-detail-ready-view.tsx` — Cancel como Link fixo para `/connectors`

Dois nós valem ao mesmo tempo sobre essas telas e um único controle não satisfaz os dois.

`rules/integration/an-abandoned-capability-registration-entry-registers-nothing` e `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering` dizem que o abandono devolve o operador à superfície de onde a autoria foi alcançada.
O log de decisão registra "devolver à listagem" como uma leitura anterior desses nós que a análise substituiu, justamente por privilegiar a listagem sobre a tela de origem.

`rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` e `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` dizem que a rota para a listagem é oferecida em toda leitura, sem depender de como o operador chegou.

Os dois nós já se leem juntos sem conflito, e cada um diz isso do outro em texto.
O nó do abandono declara que a obrigação da rota para a listagem permanece intocada, e que nada se perde por levar o abandono à origem porque quem queria a listagem toma a rota que lhe é devida de todo modo.
O nó da rota declara que nenhuma propriedade do controle é avaliada, e que um controle entre as próprias ações da superfície satisfaz a rota tanto quanto um link acima do heading.

O que se quer: dois controles distintos em cada uma dessas telas.
Um abandono que devolve à tela de onde se veio, no padrão que `use-hypothesis-revision-form.ts` e `use-edit-draft-version-form.ts` já usam.
E uma rota própria e incondicional para a listagem, presente em toda leitura, incluindo as fases de carregamento e de erro das telas de detalhe, que hoje só têm o controle único.

Os specs que hoje afirmam o destino fixo `/capabilities` ou `/connectors` como comportamento do abandono precisam passar a afirmar o que os nós dizem: o abandono volta à origem, a rota para a listagem existe à parte.
Em particular `capability-create-screen-actions.spec.ts` afirma que o pathname vira `/capabilities` depois do Cancel, que é exatamente o valor que a análise descartou.

## Correção 2 — o fixture do erro de nature responde com o status errado

`src/routes/capability-detail-screen-outcome.spec.ts` monta a recusa `CapabilityNotReadOnlyError` com HTTP 409.
`rules/integration/a-capability-is-read-only` e o log de decisão fixam 422 para essa recusa, e reservam 409 para uma operação que o estado atual do alvo proíbe.
O mapeamento do frontend acerta por código de erro e não por status, então o teste passa dos dois jeitos.
O defeito é o fixture mentir sobre o contrato para quem o ler como exemplo.

Corrigir o status no fixture para 422.

## Correção 3 — a cópia de ajuda que repete dois nós

`src/routes/capability-form-fields.tsx` carrega, como texto em português dentro do JSX abaixo do campo de output schema, uma reprodução de dois nós.

`domain/investigation/field-semantics` — quais dois atributos de uma entrada de `properties` são lidos como o significado declarado do campo, e que nada mais do schema é lido ou validado.

`rules/glossary/a-description-states-meaning-never-policy` — a distinção significado-versus-decisão, com o mesmo exemplo trabalhado do nó.

Decisão do humano: reescrever, não remover.
A orientação ao operador fica na tela, mas sem reproduzir o texto nem o exemplo do nó.
Deixa de ser segunda casa do fato, e o operador não perde a ajuda.
A cópia nova orienta sobre o que preencher sem enunciar a regra como se a tela fosse a fonte dela.

## Onde as correções foram encontradas

Os três achados vêm do registro de revisão `delivery/button-footer-standardization/review/button-footer-standardization-full-scope.md` e do registro de reconciliação `siegard-reconcile/button-footer-standardization-full-scope.md` que a passada de conformidade daquela revisão dobrou.
