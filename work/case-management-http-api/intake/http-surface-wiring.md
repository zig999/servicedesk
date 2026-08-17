# Lacuna descoberta durante a entrega — build-app.ts nunca registra as novas rotas

O próprio inventário desta iniciativa já apontava o risco (`## Notes` do inventário,
`work/case-management-http-api/inventory/case-management-http-api.md`): "`build-app.ts` registra
exatamente um plugin de rota, inline, sem nenhuma convenção de agregação; adicionar as dezoito
novas rotas sem uma arrisca um corpo longo e repetitivo." Nenhuma das 28 tarefas deste plano nomeia
`build-app.ts` como arquivo a tocar — cada tarefa de rota é "um plugin Fastify fino, um controller,
um DTO", e nada mais.

Confirmado ao entregar `task/capability-registry-http/read-capability-route`: o próprio
task-implementer, ao final, disclosed exatamente esta lacuna como `deferred` — a rota nova está
completa e testada isoladamente, mas `build-app.ts` continua sem registrá-la, então o servidor
real nunca a serviria.

Isto não é presuposto de nenhuma regra do padrão do projeto (nenhuma regra nomeia `build-app.ts`
como um artefato que uma tarefa deveria ter produzido) — é uma lacuna de decomposição: o corte das
28 tarefas nunca incluiu quem escreve a convenção de agregação nem quem registra cada rota nela.

Decisão: uma tarefa nova, cortada agora, estabelece a convenção de agregação em `build-app.ts` e
registra ali toda rota que esta iniciativa já entregou ou vai entregar — entregue depois que a
maioria (ou todas) as rotas existirem, antes de `/review-change`, para que o objetivo real do épico
(uma superfície HTTP que responde de verdade) seja atingido.
