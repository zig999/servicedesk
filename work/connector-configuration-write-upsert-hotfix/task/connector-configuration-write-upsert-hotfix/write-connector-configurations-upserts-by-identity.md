---
title: writeConnectorConfigurations upserta por identidade, sem apagar a tabela inteira
summary: Corrige RelationalConnectorConfigurationStore.writeConnectorConfigurations para não fazer DELETE
  sem filtro na tabela connector_configurations, permitindo salvar qualquer connector configuration sem
  que uma escrita concorrente ou futura apague uma identidade diferente.
objective: PUT /v1/connector-configurations/:connector cria ou substitui a configuração na identidade
  dada sem nunca apagar, como efeito colateral, a configuração de um connector diferente já registrado.
criteria:
- Registrar um connector configuration em uma identidade (connector) nova sucede sem apagar a configuração
  de nenhum connector diferente já registrado.
- Reescrever a configuração de um connector já registrado substitui exatamente esse connector; nenhuma
  linha de connector_configurations pertencente a um connector diferente é apagada como efeito colateral
  dessa escrita.
- Nenhuma escrita em connector_configurations emite mais um DELETE sem filtro de WHERE contra a tabela
  inteira.
implements:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
sources:
- intake/scope.md
---

## What it is

A correção do mecanismo de escrita do registry de connector configurations: writeConnectorConfigurations
passa a fazer upsert escopado por connector, em vez de apagar e reinserir a tabela inteira.

## Notes

Lida fresca, a Responsibility de domain/integration/connector-configuration — "Hold, by name, whatever configuration a connector currently answers to, replacing it whole on every edit rather than merging into what stood before" — é substituição integral por nome: o que é substituído é "whatever configuration a connector currently answers to", mantido "by name". Não declara nenhum mecanismo de armazenamento e não licencia apagar a configuração de um connector diferente, então não contradiz o objetivo nem nenhum critério. Registrado para que o revisor não leia o texto de whole-replace como uma licença para o DELETE da tabela inteira.
contracts/integration/connector-configuration-registry publica read-connector-configuration e list-connector-configurations (paginado) ao lado de register-connector. Nenhum critério desta tarefa alcança essas duas operações — a correção fica confinada ao caminho de escrita de register-connector — então a resposta desta entrega para este nó cobre só register-connector, e as leituras seguem exatamente como já foram entregues.
A Responsibility de domain/integration/connector-configuration-registry também declara duas cláusulas de recusa que nenhum critério desta tarefa alcança: recusar um registro cuja configuração não seja um objeto JSON bem formado, e recusar um cujo texto embuta um placeholder nomeando um atributo de Subject que nenhuma capability já registrada contra o nome desse connector declara em seu input schema. A correção de escrita deve deixar as duas exatamente como entregues; nada nos critérios desta tarefa detectaria a perda delas.
domain/integration/connector-configuration declara ainda dois fatos que nenhum critério desta tarefa alcança: que sua configuração é mantida e respondida como texto de objeto JSON, seja qual for a forma em que um registro a forneceu, e que o atributo connector de uma capability nomeando o valor de connector desta configuração não é obrigado a resolver. Os critérios aqui tratam só de quais linhas uma escrita toca, então a entrega responde a essas cláusulas deixando o comportamento já entregue inalterado, em vez de demonstrá-lo.
O terceiro critério ("Nenhuma escrita em connector_configurations emite mais um DELETE sem filtro de WHERE contra a tabela inteira") e a rota do objetivo (PUT /v1/connector-configurations/:connector) estão no vocabulário do sistema entregue, que nenhum candidato carrega: nenhum candidato nomeia uma tabela relacional, SQL, um método HTTP ou um path. O fato de domínio que o critério impõe é o "hold the current configuration for each connector name as currently registered" de domain/integration/connector-configuration-registry, e a operação que a rota expõe é o register-connector de contracts/integration/connector-configuration-registry — ambos candidatos, ambos governando. O vocabulário de armazenamento relacional em si é mantido por constraints/the-system-persists-to-one-relational-database, fora dos covers deste epic; o critério permanece falseável contra o store entregue sem ele, então nada aqui exige que a reivindicação do epic cresça. Registrado para que quem revisa veja a costura, não como pedido de recorte.
Decision, beyond the covers — stand: constraints/the-system-persists-to-one-relational-database governa mecânica de persistência em nível de sistema; o próprio binder concluiu que o terceiro critério permanece falseável contra contracts/integration/connector-configuration-registry e domain/integration/connector-configuration-registry sozinhos, então o epic desta correção pontual não cresce para cobrir uma constraint de sistema inteiro.
UNDERDETERMINED, from the specification — uma implementação que nunca atualiza nem apaga uma linha existente, mas anexa uma nova linha em connector_configurations a cada escrita, respondendo leituras com a linha mais recentemente inserida para aquele connector, satisfaz os três critérios como escritos — nada é apagado, nenhum DELETE sem filtro é emitido, e uma reescrita é "substituída" do ponto de vista de quem chama — embora domain/integration/connector-configuration (identidade = o atributo connector) e domain/integration/connector-configuration-registry ("hold the current configuration for each connector name as currently registered", no singular por nome) recusem uma tabela que mantenha duas configurações para um mesmo nome de connector, o que list-connector-configurations passaria a responder em duplicidade.
A suíte deve excluir isso: nenhum teste pode aceitar uma implementação de writeConnectorConfigurations que apenas insere linhas novas sem nunca fazer UPDATE ou upsert por chave primária — a suíte deve provar que, após duas escritas para o mesmo connector, a tabela mantém exatamente uma linha para esse nome.
