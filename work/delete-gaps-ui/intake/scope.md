Implementar no frontend a exclusão de concept (glossário), capability e connector
configuration.

Cada uma das três telas/superfícies que já apresenta um registro único (o concept em
sua própria linha na tabela do glossário, a capability em `capability-detail-screen`,
a connector configuration em `connector-configuration-detail-screen`) passa a oferecer
um controle de exclusão.

Tomar o controle não remove nada por si só: pede um segundo ato explícito de
confirmação (sem exigir reprodução do nome do registro) antes de emitir a chamada de
remoção.

Uma vez emitida, o resultado é disclosed ao operador: sucesso (o registro não está
mais registrado) ou recusa (a condição nomeada pela API — por exemplo
ConceptInUseError ou CapabilityCitedByEvidenceError, com HTTP 409).

Uma remoção bem-sucedida leva o operador para a listagem correspondente
(`/capabilities`, `/connectors`, a aba de conceitos do glossário) e nunca para a
superfície do identificador que acabou de ser removido.

O backend não muda: as rotas DELETE (`/v1/glossary/concepts/:name`,
`/v1/capabilities/:name/:version`, `/v1/connectors/:connector`) e seus guards
(ConceptInUseError, CapabilityCitedByEvidenceError, remoção incondicional do
connector) já existem e já estão especificados.

Esta capacidade está especificada em:
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing

Um initiative anterior e já fechado, `delete-routes-connector-capability-concept`,
entregou apenas o lado backend (rotas, stores, operações de remoção) — nenhuma tarefa
sua tocou o frontend.
