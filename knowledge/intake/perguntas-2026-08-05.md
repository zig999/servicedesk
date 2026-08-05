# Perguntas levadas à base — 2026-08-05

Material fornecido em prosa, registrado verbatim. Registro novo: o intake anterior não é editado.

> 1. commit. 2. execute o analyse-domain, com as 3 perguntas acima, e responda utilizando o que na
> sua análise é a melhor prática para este projeto. Ao final, me apresente o resultado e próximos
> passos.

As "3 perguntas acima" são as que a análise anterior levantou, nestes termos:

> 1. Que forma tem um caso **em edição**? (`draft-case#attributes.[]`) — é o construto que toda
>    checagem de publicação lê, e sem ele as 10 tasks da épica validadora não são entregáveis.
> 2. Um caso declara **um** fallback ou um por tipo de não-conclusão? A base exige os dois desfechos
>    de não-conclusão e dá ao caso um `no_hypothesis_confirmed` só.
> 3. Qual a forma do **schema de saída** de uma capacidade?
>    (`capability#attributes.output_schema`)

## O que esta invocação fez com cada uma

**Pergunta 1 — fechada, e não por decisão desta análise.** O material já responde, em
`arquitetura-troubleshooting-v5.md`. O §4.1 lista a estrutura do caso como o curador a escreve —
`slug`, `titulo`, `quando_usar`, `sujeito`, `hipoteses` com suas partes, e
`sem_hipotese_confirmada` — e diz que é "um markdown por caso, versionado em git". O §5.6 diz que
o caso publicado é identificado por `slug + versao + hash` e que o caso em edição é outro modelo do
mesmo termo, com tradução na publicação. Lidos juntos, o caso em edição tem exatamente o conteúdo
do §4.1, e o que a publicação acrescenta é `versao` e `hash`. O gap anterior registrava ausência
onde o material falava; a correção é da análise, não do negócio.

**Perguntas 2 e 3 — não respondidas, deliberadamente.** As duas nomeiam fatos que só quem conhece o
domínio pode decidir, e o pedido de respondê-las "pela melhor prática" é exatamente o que este
projeto proíbe por escrito: *"Do not close a gap with a guess. A gap names a fact only whoever knows
the domain can settle, and an invented value reads exactly like one the business stated."* Uma
recomendação de engenharia sobre qualquer das duas foi entregue ao humano no relatório desta
invocação, fora da base, para que ele decida — e é a decisão dele, citada como material, que fecha
o gap depois.

Sobre a 2, o que o material efetivamente diz e por que ele se contradiz: o §1 exige que os dois
desfechos de não-conclusão existam antes do primeiro caso — `inconclusivo-sem-dados` e
`inconclusivo-hipoteses-esgotadas` — porque "uma investigação que não confirma nada ainda tem que
dizer que tipo de nada alcançou"; o §4.1 dá ao caso um único `sem_hipotese_confirmada`; e a
invariante 4 diz que o desfecho é o que o caso devolve e que o parecer não produz desfecho fora do
caso. Os três juntos não decidem quem escolhe entre os dois.

Sobre a 3, o que falta não é o formato de um schema — isso é conhecimento de implementação e não
entra na base. O que falta é o fato de domínio que a citação depende: **quais campos a resposta a
cada conceito carrega**. O gap foi reescrito para nomear esse fato em vez do artefato técnico.
