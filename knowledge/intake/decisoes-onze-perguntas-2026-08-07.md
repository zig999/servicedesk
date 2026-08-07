# Decisões — onze perguntas — 2026-08-07

Registro novo. Nenhum intake anterior é editado.

## O pedido, verbatim

> **1. Que texto uma recusa carrega para o curador — a redação e o idioma?**
>
> Idioma: português. Leitura, não decisão. O §8 do documento fecha isso: "O domínio fala
> português: caso, hipotese, coletas, confirma_quando… Inglês apenas em termos de fronteira
> técnica." O curador é o especialista que escreve os casos; uma recusa endereçada a ele em inglês
> seria tradução dentro do próprio modelo, que é exatamente o que o §8 recusa.
>
> Redação: uma frase por regra, e ela mora no nó da regra — não no nó da recusa. Esta é a parte
> estrutural da resposta, e é o que faz a lacuna parar de reaparecer. definition/knowledge/refusal
> diz que a recusa "nomeia a regra que recusou pelo seu identificador, porque a regra é a linguagem
> do domínio e sobrevive a qualquer checagem que a implemente". Pela mesma razão, o texto para o
> curador é fato da regra, e a recusa o carrega instanciado com a posição. Assim treze regras
> produzem treze textos versionados na base, em vez de treze strings soltas no código.
>
> Rascunhos para as oito checagens que este plano constrói:
>
> | Regra | Texto proposto |
> |---|---|
> | case-has-at-least-one-hypothesis | Este caso não declara nenhuma hipótese. Um caso investiga por hipóteses — acrescente ao menos uma antes de publicar. |
> | hypothesis-collects-at-least-one-concept | A hipótese «{hipotese}» não coleta nenhum conceito. Sem coleta ela nunca poderá citar evidência — declare ao menos um conceito em coletas. |
> | hypothesis-name-is-unique-in-its-case | Duas hipóteses deste caso se chamam «{nome}». As avaliações são indexadas pelo nome, então nomes repetidos se sobrepõem em silêncio — renomeie uma delas. |
> | case-terms-exist-in-the-glossary | O termo «{termo}» não está publicado no glossário como {tipo}. O caso só fala a linguagem publicada — registre o termo no glossário ou corrija a grafia. |
> | every-collected-concept-declares-a-ttl | O conceito «{conceito}» não declara ttl no glossário. Quanto um dado pode estar velho é decisão do conceito — declare o ttl antes de usá-lo em um caso. |
> | concept-accepts-the-declared-subject-type | O conceito «{conceito}» não aceita sujeito do tipo «{sujeito}», que é o que este caso investiga. Escolha outro conceito ou outro tipo de sujeito. |
> | every-collected-concept-has-a-read-only-capability | Nenhuma capacidade registrada responde ao conceito «{conceito}». Um caso não publica enquanto algum conceito que ele coleta não tiver capacidade — registre a capacidade na integração. |
> | one-falsifiable-claim-per-criterion | (nenhum — o material declara esta regra não validável; ela é item de revisão humana, não recusa) |
>
> ---
>
> **2. Uma recusa que não se senta em nenhuma hipótese carrega um campo ofendido? O que o nomeia?**
>
> Sim — e a resposta que resolve isto resolve também a pergunta 3. Proponho substituir o par
> opcional hypothesis + offended_term por uma posição obrigatória: um caminho na linguagem do
> próprio caso.
>
> ```
> hipoteses[bloqueio-financeiro].coletas[situacao-financeira]
> sem_hipotese_confirmada.encaminhamento.destinatario
> hipoteses
> sujeito
> ```
>
> Para o caso sem hipótese alguma, a posição é hipoteses — o campo é nomeável, mesmo quando a lista
> está vazia. É isso que dissolve o argumento que hoje deixa os dois campos opcionais.
>
> Por que caminho e não par nome+termo. definition/knowledge/refusal diz que "o curador conserta
> posições, não categorias". Um caminho é literalmente onde ele coloca o cursor. E o §5.6 do
> documento prefere nome a id — por isso o caminho indexa por nome da hipótese, não por índice
> numérico, e só cai em índice onde o nome não desambigua (que é exatamente o caso que a regra de
> unicidade recusa).
>
> O que isso custa. É mudança em definition/knowledge/refusal — dois atributos saem, um entra, e o
> rationale do nó muda. Consequência que você deve conhecer antes de decidir: oito das dezessete
> tarefas do plano vinculam esse nó, e todas ficam com digest divergente. Isso é o mecanismo
> funcionando, não um acidente — o validador vai nomear cada uma, e elas se re-vinculam por
> /plan-work.
>
> ---
>
> **3. O que conta como uma posição quando uma regra ofende duas vezes dentro de uma hipótese, e
> quando ofende nos dois fallbacks?**
>
> Uma posição é um caminho. Caminhos distintos são posições distintas. Direto da resposta 2, e é o
> que torna two-positions-are-two-refusals aplicável sem ambiguidade:
>
> - Duas coletas ofensoras na mesma hipótese → hipoteses[x].coletas[a] e hipoteses[x].coletas[b] →
>   duas recusas.
> - O mesmo destinatário não publicado nos dois fallbacks → sem_dados.encaminhamento.destinatario e
>   hipoteses_esgotadas.encaminhamento.destinatario → duas recusas, agora distinguíveis, que é o que
>   hoje não são.
> - O mesmo termo ofendido duas vezes no mesmo caminho → impossível: um caminho aponta um lugar.
>
> Um efeito colateral que vale registrar: a expression de a-validation-answers-with-every-refusal
> diz count(refusals answered) == count(checks that refused), contando checagens, enquanto esta
> resposta conta posições. Os corpos dos dois nós já reconciliam isso em prosa; a expressão é que
> está desalinhada. Recomendo corrigi-la para count(refusals answered) == count(positions refused)
> na mesma passada — dois binders independentes apontaram essa divergência.
>
> ---
>
> **4. O que é um arquivo de caso — um arquivo, a sintaxe da parte estruturada, e onde fica a
> fronteira?**
>
> Leitura pura. O material já responde, a análise é que não registrou como fato de nó.
>
> - Um arquivo por caso, markdown, versionado em git — §4.1: "Caso (um markdown por caso,
>   versionado em git)".
> - A parte estruturada é o frontmatter YAML, validado por schema — §4.2: "o motor | coletas, ordem
>   das hipóteses, desfecho, encaminhamento | YAML no frontmatter, validado por schema".
> - A prosa do curador é o corpo markdown, abaixo do frontmatter — §4.2: "o curador humano | por que
>   a hipótese existe, nuance, histórico | prosa no corpo, fora de qualquer prompt".
> - A fronteira são os delimitadores --- do frontmatter. Acima, o que o motor lê; abaixo, o que só o
>   curador lê.
> - O slug casa com o nome do arquivo — §4.5, regra estrutural 1.
>
> Isso não é decisão nova: é um fato que estava no material desde a v5 e ficou fora dos nós. Vale
> notar que o confirms_when de cada hipótese é prosa dentro do frontmatter — a terceira audiência do
> §4.2 — e não parte do corpo. Um leitor que tratar "prosa" como sinônimo de "corpo" perde o
> critério.
>
> ---
>
> **5. O que a leitura responde quando a parte estruturada não parseia?**
>
> Uma falha de leitura, não uma recusa de validação. Decisão, com fundamento estrutural.
>
> O raciocínio: rule/knowledge/a-validation-answers-with-every-refusal exige que toda checagem rode
> sobre um caso, e definition/knowledge/draft-case é o que uma checagem de publicação recusa. Um
> arquivo cujo YAML não parseia não produz caso em edição algum — não há o que percorrer, não há
> posição a nomear, e a totalidade da validação não tem sobre o que ser total. Modelar isso como
> recusa exigiria um objeto-caso que não existe.
>
> Então: a leitura responde com uma falha de leitura, nomeando onde o YAML quebrou (linha e coluna,
> que o parser dá de graça), em português, e a validação não roda. O curador vê um erro, não treze.
>
> Isto preserva a distinção que o próprio documento insiste em manter no §5.3 — falha técnica e fato
> de domínio não podem ser indistinguíveis. Um arquivo malformado é a primeira; uma recusa é a
> segunda.
>
> ---
>
> **6. Qual digest é o content_hash de um caso publicado, e em que forma o valor é escrito?**
>
> SHA-256 sobre os bytes do arquivo inteiro, escrito sha256:<64 hex minúsculos>.
>
> - SHA-256 porque é o que o resto deste ecossistema já usa — os pinos de plan.json e delivery.json
>   são SHA-256, e um projeto com dois algoritmos de digest tem um a mais do que precisa.
> - Sobre os bytes do arquivo, não sobre uma re-serialização do caso parseado —
>   rule/knowledge/the-content-hash-covers-the-whole-file já exige que a prosa do curador esteja
>   coberta, e prosa nenhum parse retém.
> - Com o prefixo sha256: porque o valor é identidade visível ao negócio: uma investigação o pina
>   para continuar reproduzível. O prefixo nomeia o algoritmo dentro do próprio valor, então trocar
>   de algoritmo um dia não torna os pinos antigos ambíguos. Custa sete caracteres.
>
> ---
>
> **7. Como o contexto de conhecimento lê o registro de capacidades — por que chave, e a busca
> atravessa versões?**
>
> Chave: o nome do conceito, comparado caractere a caractere.
> rule/glossary/a-lookup-matches-a-published-name-exactly já decide a comparação para toda a
> linguagem publicada, e o corpo dela estende a decisão ao sistema inteiro.
>
> Uma capacidade por conceito. §15 registra o corte: "Plano de resolução de conceito com fallback
> (v3) → conceito → capacidade 1:1 até aparecer a segunda fonte do mesmo conceito." Então o registro
> responde no máximo uma capacidade registrada por conceito, e a pergunta "qual delas" não existe
> hoje.
>
> A busca não atravessa versões. A publicação pergunta pela capacidade registrada agora para aquele
> conceito e lê o que ela declara. Versões antigas importam para replay de investigação — a
> evidência carrega capacidade { nome, versao } (§5.2) — e replay é ato da investigação, não da
> publicação. Um caso publica contra o contrato vigente; uma investigação antiga permanece legível
> contra o que leu.
>
> ---
>
> **8. O que a publicação faz quando o registro de capacidades não pode ser consultado?**
>
> Recusa publicar, e diz que não conseguiu decidir — nunca que o caso está errado. Decisão, e o
> documento praticamente a dita.
>
> Publicar assim mesmo destruiria a razão de a checagem existir: §3 diz que "se a checagem só roda
> na execução, o curador descobre o erro durante uma ligação de cliente". Um registro fora do ar não
> é permissão para adiar a checagem.
>
> Mas a resposta não pode ser uma recusa no sentido de definition/knowledge/refusal, porque uma
> recusa nomeia uma regra que o caso ofendeu, e aqui o caso pode estar perfeito. Isso é exatamente a
> patologia que o §5.3 existe para impedir: "uma falha de infraestrutura é lida como fato do domínio
> — a patologia que o resto do sistema existe para evitar." A mesma disciplina que separa sem-dados
> de falha-de-julgamento de prazo-esgotado na investigação se aplica aqui.
>
> Proponho: a publicação responde com indisponibilidade da checagem de contrato, distinta de
> qualquer recusa, dizendo ao curador que tente de novo. Isso provavelmente pede um construto novo
> na base ao lado de refusal — e é bom que peça, porque é o que impede a confusão.
>
> ---
>
> **9. As checagens de termo, de ttl e de tipo de sujeito recusam cada uma sobre um conceito que o
> glossário não publica, ou isso fica só com a de termo?**
>
> Só com a de termo. Decisão, apoiada em dois fatos que a base já tem.
>
> O corpo de a-validation-answers-with-every-refusal diz que "a checagem de que uma hipótese coleta
> um conceito percorre um caso sem hipótese alguma sem falhar, e simplesmente não recusa nada" — o
> padrão já está escrito: cada checagem é segura sobre o que não se sustenta e deixa a falta para a
> checagem que a possui.
>
> E definition/knowledge/refusal diz que o curador conserta posições. Três recusas para um erro de
> digitação num nome de conceito — "não existe", "não declara ttl", "não aceita o sujeito" — são
> três posições idênticas e uma correção só. Ruído.
>
> Então, sobre um conceito que o glossário não publica: a checagem de termo recusa; a de ttl e a de
> tipo de sujeito não recusam nada, porque não há entrada de glossário para ler. O mesmo vale para
> um sujeito declarado que o glossário não publica: a de termo recusa, a de tipo de sujeito se cala.
>
> ---
>
> **10. definition/knowledge/case#attributes.version.derivation — o que define a versão de um caso
> publicado?**
>
> Um inteiro sequencial por slug, atribuído pela publicação. A base já eliminou duas das três
> opções.
>
> O why da lacuna abria três: referência git, número que o curador levanta, ou algo que a publicação
> conta.
>
> - O curador está fora. definition/knowledge/draft-case diz, textualmente: "O que a publicação
>   acrescenta é a versão e o hash do conteúdo que identificam o valor publicado; nada que um
>   curador escreve carrega qualquer um dos dois." Isto não é preferência minha — é a base recusando
>   a opção.
> - Referência git é redundante. O content_hash já carrega identidade por conteúdo. Uma versão que
>   fosse o commit sha diria a mesma coisa duas vezes e não ordenaria nada legível.
> - Resta a publicação contar — e é o que serve. A versão passa a fazer o trabalho que o hash não
>   faz: ordenar e ser legível. caso#3 diz a um humano que houve duas publicações antes;
>   sha256:af4d… não.
>
> Então: na publicação bem-sucedida do slug X, versão = (maior versão já publicada de X) + 1,
> começando em 1. O índice guarda todas — §5.5: "Replay exige que o índice de casos guarde todas as
> versões publicadas, não a última."
>
> ---
>
> **11. lifecycle/knowledge/case-publication#rejections — who approves a case's publication.**
> Resposta: Ninguém aprova.

## De onde vieram

As onze perguntas são as que a base deixava abertas depois da re-vinculação de 2026-08-06 — as
lacunas de `definition/knowledge/refusal` sobre o que uma recusa carrega e onde ela se senta, o
formato do arquivo de caso que o material da v5 nunca virou nó, a leitura de um arquivo malformado,
o digest do caso publicado, a leitura do registro de capacidades, a lacuna
`definition/knowledge/case#attributes.version.derivation`, e a sétima lacuna do documento v5
(L7, "quem aprova publicação de caso").

As respostas foram propostas pelo analista e ratificadas pelo dono do projeto, que as forneceu como
material desta invocação.
