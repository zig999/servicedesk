Encerrar a iniciativa delete-routes-connector-capability-concept agora.

Direção do usuário via /goal: "trate as correções primeiro e depois feche as iniciativas."

As 11 tasks originais do plano estão entregues: as três remoções (connector-configuration,
capability, concept) com seus stores, guardas de uso cross-módulo, e rotas DELETE, todas com
implementation e proof records, deliver.py --check dá delivery.json sound sobre 25 nodes, zero
critério registrado como não atendido.

O /review-change ("delete-routes-connector-capability-concept, first review") rodou as quatro
passagens sobre as 11 tasks e está registrado em
delivery/delete-routes-connector-capability-concept/review/delete-routes-connector-capability-concept.md.
Encontrou 4 achados de conformidade e 7 de standard; dois dos achados de conformidade eram
correções reais de comportamento (não apenas cobertura de teste) e foram tratados como
incrementos corretivos via /plan-work:

- task/concept-usage-reader-manifested-revision-fix/broaden-hypothesis-revision-collects-check
  — corrigido e entregue: o reader de uso de concept agora detecta qualquer hypothesis-revision
  (manifestada ou não) cujo próprio collects liste o concept, fechando o buraco que permitia
  remove-concept apagar um concept ainda referenciado por uma revisão manifestada. Suíte completa
  limpa após a correção.
- task/case-overwrite-revision-draft-guard-fix/apply-require-case-holds-draft-guard — investigado
  e abandonado por decisão explícita do usuário: implementar o guard quebrava um teste de
  integração pré-existente e deliberado
  (relational-case-store.repository.spec.ts, "does not refuse an overwrite attempt against a
  hypothesis-revision whose own state is draft, even though a released case version's manifest
  still references that revision") que já validava o comportamento oposto contra Postgres real.
  A mudança de código foi revertida; nenhum implementation record foi escrito; a evidência
  completa e a decisão ficam registradas nas Notes da própria task file.

Os demais 5 achados de conformidade (não-comportamentais, unstated) e os 7 achados de standard
(ARC-01, MNT-03, PER-02) não foram tratados nesta iniciativa — nenhum é um defeito de
comportamento observável, e ficam como trabalho futuro para quem possuir o registro do standard
ou para uma nova iniciativa, se alguém decidir agir sobre eles.

Nada mais está em aberto sob este work root: as 12 tasks entregues (11 originais + 1 corretiva)
têm registro completo, e a 1 task corretiva abandonada tem sua própria justificativa registrada
em vez de pendência.

Target: backend (src). Initiative: delete-routes-connector-capability-concept.
