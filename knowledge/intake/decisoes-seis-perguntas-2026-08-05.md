# Seis decisões — 2026-08-05

Material fornecido em prosa, registrado verbatim. Registro novo; nenhum intake anterior foi editado.

> Q1 - A
> Q2 - A
> Q3 - A
> Q4 - A
> Q5 - A
> Q6 - A

## As perguntas e o que a opção A dizia em cada uma

As seis foram apresentadas ao humano em tabela, com todas as opções e o custo de cada uma. Ele
escolheu A nas seis. O texto da opção escolhida, como foi apresentado:

**Q1 — O que uma validação responde quando mais de uma checagem recusa um caso?**

> **A** — A validação roda **todas** as checagens registradas, independente de qualquer uma já ter
> recusado, e responde com a lista inteira de recusas. O curador vê tudo que está errado num ciclo.
> Custo: nenhuma checagem pode abortar a corrida, e toda checagem tem que ser segura sobre um caso
> que outra já recusou — a de "hipótese coleta ao menos um conceito" precisa caminhar sem quebrar num
> caso que não tem hipótese nenhuma.

**Q2 — Onde vivem os campos que a resposta a cada conceito carrega?**

> **A** — Cada conceito declara seus campos na base, como atributos do nó do conceito.
> `{conceito, campo}` de uma citação é verificado contra a base, sem consultar nada externo. Custo: o
> glossário cresce, e cada campo novo é uma edição de base. Em troca, "a base é a autoridade"
> continua valendo para o campo citado.

**Q3 — O caso declara um fallback ou um por tipo de não-conclusão?**

> **A** — O caso declara **dois** fallbacks, um por tipo, e a base ganha a regra de seleção: alguma
> evidência com `resultado ≠ ok` → `inconclusive-no-data`; todas ok e todas refutadas →
> `inconclusive-hypotheses-exhausted`. Custo: um campo a mais em todo caso e uma regra nova. Em
> troca preserva a invariante 4, honra o §1, e a projeção passa a distinguir "integração quebrada" de
> "falta hipótese".

**Q4 — O que o content hash de um caso publicado cobre?**

> **A** — O arquivo inteiro, frontmatter e prosa do curador. Replay reproduz exatamente o arquivo
> lido. Custo: corrigir uma vírgula na prosa cria um caso publicado novo, e investigações antigas
> passam a apontar para uma versão que não é a atual.

**Q5 — Como dois nomes de hipótese se comparam para "mesmo nome"?**

> **A** — Igualdade exata, caractere por caractere. Custo: `bloqueio-financeiro` e
> `Bloqueio-Financeiro` passam como distintos, e um curador pode criar duas hipóteses que ele lê como
> a mesma.

**Q6 — Como se decide que um destinatário é papel e não pessoa?**

> **A** — Nada a decidir; confirmar a leitura. Todo destinatário que o glossário publica já é papel,
> porque a invariante é sobre a entrada do glossário e não sobre o caso. A checagem do lado do caso
> só testa existência. Custo: nada verifica "papel, não pessoa" em ponto nenhum — a invariante passa
> a ser disciplina de quem registra no glossário.

## O que não foi decidido e continua aberto

`definition/knowledge/case#attributes.version.derivation` não estava entre as seis e segue gap: nada
diz o que fixa a versão de um caso publicado. Nenhuma task o cita como `unresolved` hoje, então ele
não bloqueia entrega.

As duas perguntas que a Q1 carregava eram de espécies diferentes, e só uma era do negócio. A outra —
se um registro de checagens por corrida é estado que a base admite — é re-corte de critério e não
fato faltando: a base tem oito invariantes de publicação, fixas, e "corrida com nenhuma checagem
registrada" é mecanismo que os critérios inventaram. Fica registrado aqui para que o plano não a leve
de novo à base.
