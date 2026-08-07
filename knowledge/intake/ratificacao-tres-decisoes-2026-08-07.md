# Ratificação — três decisões — 2026-08-07

Registro novo. Nenhum intake anterior é editado.

## O material, verbatim

> Ratifico como decisão do dono do projeto, verbatim.
>
> 1. definition/knowledge/refusal#attributes.rule.structural-checks — uma recusa das checagens 5 e 6
> do §4.5 nomeia um nó de regra pelo identificador, como toda outra recusa. As duas passam a ser nós
> de regra no contexto knowledge: uma hipótese declara um critério, e toda resolução de um caso
> declara um desfecho e um encaminhamento. Os atributos obrigatórios em definition/knowledge/hypothesis
> e definition/knowledge/resolution ficam como estão — restrição declarada e nó de regra são dois
> registros de uma decisão, não duas alternativas.
>
> O texto que cada regra nova declara para o curador:
>
> | a hipótese declara um critério | A hipótese «{hipotese}» não declara critério. Sem critério ela nunca poderá ser julgada — escreva em confirma_quando a afirmação falsificável que a confirma. |
> | a resolução declara desfecho e encaminhamento | Esta conclusão não declara «{campo}». Uma conclusão diz o que se concluiu e quem age sobre isso — declare desfecho e encaminhamento com acao e destinatario. |
>
> 2. lifecycle/knowledge/case-publication#transitions.published.publish — um caso publicado publica
> de novo onde está: publish sobre published leva a published, e a versão que a publicação atribui é
> uma a mais que a maior já publicada daquele slug. Nenhum gatilho devolve um caso publicado à edição,
> e este ciclo não nomeia nenhum.
>
> 3. A contradição entre rule/knowledge/an-unavailable-check-is-not-a-refusal e
> rule/knowledge/a-validation-answers-with-every-refusal — o MUST NOT da primeira estava enunciado
> largo demais, e a resposta estreita ele em vez de escolher entre as duas.
>
> Para um caso que está errado e não pôde ser checado, a publicação responde com toda recusa que as
> outras checagens produziram, e com a indisponibilidade da checagem de contrato ao lado delas, e não
> publica. O que nunca acontece é a indisponibilidade ser expressa como recusa: é esse o desfecho que
> a primeira regra proíbe, e apenas ele. Uma recusa que outra checagem produziu enuncia fato
> estabelecido sobre o caso, e cala-la porque o registro caiu é exatamente confundir falha de
> infraestrutura com fato de domínio, que é o que o §5.3 existe para impedir.
>
> O statement de an-unavailable-check-is-not-a-refusal passa a alcançar só o desfecho da checagem de
> contrato, e a totalidade de a-validation-answers-with-every-refusal segue valendo inteira.

## De onde veio

As três respostas fecham o que a base carregava aberto: as duas lacunas que travavam entrega, cada
uma com a proposta que a análise havia anexado para ratificação, e a lacuna de contradição que a
passada de reconciliação do incremento anterior registrou nos dois nós de regra. A ratificação foi
fornecida pelo dono do projeto como material desta invocação.

O §4.5 e o §5.3 que o texto cita são de `intake/arquitetura-troubleshooting-v5.md`.
