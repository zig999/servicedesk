Tornar o motor de diagnóstico executável de ponta a ponta com chamadas reais a LLM e uma
entrada HTTP, mantendo persistência em JSON e sem autenticação. Sete frentes:

1. Adaptador real de julgamento — implementação de produção do port hypothesis-evaluator
   (constraints/judgment-runs-behind-a-port) usando a API da Anthropic via @anthropic-ai/sdk,
   já autorizado pelo standard (STK-11). O prompt segue
   constraints/the-judgment-prompt-is-closed como emendado: critério da hipótese, sua própria
   evidência (resultado da coleta), e o title e when_to_use do caso fixado, em bloco de dados
   delimitado, sem tool calling.

2. Adaptador real de consolidação — implementação de produção do port assessment-consolidator
   (constraints/consolidation-runs-behind-a-port), também Anthropic via @anthropic-ai/sdk. O
   prompt segue constraints/the-consolidation-prompt-is-closed sem mudança: avaliações das
   hipóteses requeridas, evidência citada, e o consolidation register do caso.

3. Caso fictício para testes — nenhum caso real existe; criar um caso de teste completo,
   armazenado como um documento JSON por caso (constraints/a-case-is-stored-as-one-json-document),
   válido perante as regras de knowledge (hipóteses com critério, collects, resolutions,
   fallback), para alimentar o fluxo inteiro.

4. Raiz de composição — nenhuma existe; decidir e construir a composição que instancia os
   adaptadores reais e monta o pipeline síncrono do diagnose. O plano decide o que ela precisa.

5. Adaptadores de infraestrutura restantes — dos adaptadores reais que os ports e stores do
   domínio pedem, nenhum existe; o survey identifica quais são e o plano os define, mantendo o
   domínio sem dependência de infraestrutura (constraints/the-domain-depends-on-no-infrastructure).

6. Camada HTTP — expor a operação diagnose (contracts/investigation/diagnosis) em um serviço
   HTTP síncrono, para testar o sistema: caso, subject, narrative e requester entram no payload
   da própria chamada, com ticket reference opcional; assessment sai na própria resposta
   (constraints/diagnosis-answers-synchronously). Sem autenticação/autorização nesta iniciativa —
   o requester é fornecido diretamente pelo chamador, como a especificação já decide. Persistência
   segue em JSON, sem banco de dados (constraints/the-mvp-persists-to-no-database).

7. Teste de ponta a ponta — a partir da implementação, um teste que atravessa a entrada HTTP,
   a coleta, o julgamento, a consolidação e a escrita, contra o caso fictício e com os ports de
   LLM substituíveis por fakes (os ports existem para isso), provando o fluxo inteiro sem
   depender do provedor em CI.

Artefatos que nenhum nó da especificação responde (fixture do caso, raiz de composição,
servidor HTTP, teste e2e) entram como `produces` das suas tasks.

Nota adicional, à luz do que o survey encontrou: a remoção da deduplicação por janela
(rules/investigation/an-investigation-is-idempotent-within-a-window e os nós vizinhos) já
aconteceu na especificação hoje mais cedo, antes desta iniciativa. O código em
src/investigation/diagnose.ts e seus vizinhos (idempotency-key.ts, idempotency-lease-store.ts,
idempotency-resolution.ts, diagnosis-run-registry.ts, factories/diagnose-entry-point.factory.ts)
ainda implementa essa regra removida — a raiz de composição e a camada HTTP desta iniciativa não
devem passar por essa camada de dedup; o plano decide o que fazer com o código que a implementa.
