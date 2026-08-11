Encerrar a iniciativa investigation-engine-v2 agora.

As 11 tasks do plano estão entregues — 11 implementações e 11 provas sob
delivery/investigation-engine-v2 — e revisadas, com o review formal das quatro passagens
registrado em delivery/investigation-engine-v2/review/investigation-engine-v2.md.

O plano não valida mais contra a especificação, e é isso que o fechamento resolve. Quatro nodes
que ele nomeia foram retirados da especificação depois que este plano foi escrito, durante a
iniciativa live-engine-mvp, pela task/diagnose-composition-root/remove-withdrawn-dedup-layer:

  rules/investigation/an-investigation-is-idempotent-within-a-window
  constraints/in-progress-is-a-lease-not-domain-state
  scenarios/investigation/a-repeated-request-returns-the-same-investigation
  scenarios/investigation/no-ticket-reference-never-repeats

A convenção de que a especificação não muda enquanto um plano está vivo foi quebrada ali, e
enquanto este work root segue vivo o efeito é que plan.py e deliver.py recusam os 14 problemas
que essas referências produzem — deliver.py --check nem chega a conferir a entrega. Fechado, o
plano valida sem a especificação e o implements de cada task passa a valer como o registro
histórico de quais nodes o trabalho endereçou quando foi escrito, que é exatamente o que essas
quatro referências são hoje.

O drift de rastro sobre esses mesmos nodes retirados já está documentado no closure de
live-engine-mvp — 15 achados remanescentes, sem comando de trace.py que os limpe.

A suíte do alvo passa inteira no estado atual — 51 arquivos, 458 testes — e o typecheck está
limpo.

Nada mais está em aberto sob este work root.

Target: backend (src). Initiative: investigation-engine-v2.
