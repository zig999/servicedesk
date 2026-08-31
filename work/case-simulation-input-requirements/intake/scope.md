# Scope

A tela de simulação de caso (case-simulation-screen.tsx / simulation-subject-derivation.ts /
use-simulation-subject.ts / case-simulation-subject-panel.tsx) deve parar de derivar os campos de
atributo do subject varrendo texto de configuração de conector por placeholders
`${subject:<nome>}`, e passar a consumir a leitura autoritativa
`GET /v1/cases/{slug}/versions/{version}/input-requirements` (já implementada e plugada no
backend), conforme decidido em
rules/investigation/a-composed-subject-presents-every-case-input-requirement,
rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses e
rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability.

Isso implica:
1. Um novo hook de leitura para o endpoint.
2. Um campo de input por case-input-requirement, obrigatório e opcional, cada um carregando seu
   próprio `required`.
3. Só o `required` bloqueia o envio, nunca a mera presença no conjunto derivado.
4. Resolução de `connector` e do hint de `input_schema` cruzando a identidade `{name, version}`
   da resposta com `useCapabilities()`, já que a resposta não os repete.
5. Divulgação ao curador de qualquer capability listada em `capabilities_with_malformed_input_schema`.
6. O controle "+ATTRIBUTE" (glossário) continua existindo, mas passa a excluir do `<Select>` os
   atributos já presentes no conjunto derivado.
