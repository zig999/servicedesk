---
title: "Regras de criação e escrita do material"
purpose: "guia normativo para quem (pessoa ou sessão de Claude Code) for escrever ou ressincronizar qualquer arquivo desta pasta"
---

# Como este material funciona

Este é um material didático explicativo — uma transcrição de aula/palestra sobre como o
ServiceDeskN1 funciona — destinado ao time técnico que vai manter, sustentar e evoluir o sistema.
Ele é consumido em dois níveis: como fonte para gerar slides de apresentação, e como texto de
leitura corrida (a fala do "professor"). As regras abaixo são obrigatórias para qualquer arquivo
criado ou reescrito nesta pasta, em qualquer sessão.

## 1. Formato de cada arquivo

Cada arquivo de conteúdo (todos exceto este `_helper.md`) é uma sequência de blocos alternados:

```
<slide>
[o que aparece no slide: texto, bullets, ou código verbatim quando o slide mostra código.
Quando o slide precisar de uma imagem/diagrama, descreva aqui o que a imagem deve conter —
nunca gere a imagem, apenas a descrição de como ela deve ser.]
</slide>

<speach>
[a transcrição da fala do professor para ESSE slide especificamente. Deve ser completa,
autocontida e falar diretamente do que está no slide — não uma fala genérica que serviria
para qualquer slide do tópico.]
</speach>
```

- **Um arquivo `.md` não é um slide — é um tópico, e pode (e frequentemente deve) conter vários
  pares `<slide>/<speach>`.** Não existe um número fixo de slides por arquivo. A quantidade certa
  é decidida na hora de escrever aquele arquivo específico, avaliando a complexidade real do
  tema: quantos conceitos, classes ou trechos de código ele precisa apresentar para que quem
  está assistindo consiga acompanhar sem saltos. Um arquivo simples (ex.: introdução) pode ter
  2-3 slides; um arquivo denso (ex.: um módulo de domínio com várias operações) pode
  legitimamente ter 10 ou mais.
- Prefira slides curtos e focados (um conceito, uma classe, um trecho de código por slide) a
  slides genéricos que tentam cobrir demais — quando um assunto não cabe com clareza em um único
  slide, a resposta é sempre adicionar mais um par `<slide>/<speach>` dentro do mesmo arquivo,
  nunca espremer o conteúdo ou resumir para caber.
- Nunca misture o conteúdo de dois slides num só bloco. Se o assunto precisa de mais espaço,
  crie mais um par `<slide>/<speach>`.
- O cabeçalho YAML de cada arquivo (já presente no scaffolding) vem antes do primeiro `<slide>`
  e não é alterado por este processo de escrita, exceto o campo `status` (ver seção 5).

## 2. Tom e voz

- A fala (`<speach>`) é **informal** — como um tech lead explicando para o time em uma sala, não
  como documentação formal. Pode usar primeira pessoa, perguntas retóricas, analogias.
  Evite, porém, gírias que datam o material ou piadas que não agregam.
- O texto do slide (`<slide>`) é mais seco e direto — é o que fica na tela, não a fala. Bullets,
  títulos, código. Não duplique a fala ali.
- Português do Brasil em todo o material.

## 3. Fundamentação obrigatória em código

Esta é a regra mais importante: **toda afirmação técnica deste material deve ser rastreável ao
código-fonte real ou aos nós de especificação do projeto** — nunca invenção, suposição ou memória
genérica de "como esse tipo de sistema costuma funcionar".

- Antes de escrever um arquivo, releia os arquivos-fonte listados no campo `sources` do seu
  cabeçalho — e, se durante a escrita perceber que precisa de mais contexto, adicione as fontes
  que consultou de volta ao `sources` do cabeçalho.
- Use `graphify query`/`graphify explain`/`graphify path` (ver `CLAUDE.md` na raiz do projeto)
  para orientar a exploração antes de ler arquivos brutos, exatamente como em qualquer outra
  tarefa neste repositório.
- **Todo trecho de código citado num slide deve ser verbatim** — copiado exatamente do
  arquivo-fonte, com o caminho do arquivo indicado (ex.: `src/src/case/case.ts`). Nunca
  parafraseie código como se fosse código, nem "limpe"/resuma uma função e a apresente como se
  fosse o texto original.
- Se um trecho de código for longo, é preferível recortar a parte relevante (com `...` indicando
  omissão) a reescrever/resumir a lógica com sintaxe inventada.
- Nunca descreva um comportamento que o código não implementa hoje. Se o material precisar
  mencionar algo planejado ou pendente, isso deve ser marcado explicitamente como tal (ver a
  seção "Estado atual e limitações conhecidas", `26-estado-atual-e-limitacoes.md`, como padrão
  de como tratar isso) — nunca apresentado como comportamento atual.
- Onde a especificação do projeto (nós Siegard) for a fonte de uma regra de negócio, cite o nó
  correspondente, não apenas o código que a implementa.

## 4. Nível de detalhe esperado por tipo de arquivo

O público é técnico e vai sustentar o sistema — superficialidade é o principal risco a evitar.

- **Arquivos de contexto de domínio e infraestrutura do backend** (Partes 3 a 6 do índice —
  tudo sob `src/`) devem descer ao nível de classe/módulo: para cada arquivo-fonte listado em
  `sources`, explique o que a classe/função faz, sua assinatura relevante, suas decisões não
  óbvias, e mostre o código que a implementa. Não é aceitável tratar um módulo inteiro
  (ex.: "o contexto de investigação") em um único slide abrangente — é para isso que o índice já
  foi dividido em vários arquivos por módulo.
- **Arquivos de visão geral e de fechamento** (Partes 1, 7 e 8) podem ser mais panorâmicos, mas
  ainda assim toda afirmação factual precisa vir do código ou do README/CLAUDE.md — não de
  suposição.
- **Arquivos de frontend** devem mostrar a tela (descrever visualmente o que ela apresenta,
  como se fosse uma captura) e o código que a implementa (hooks, componentes, chamadas de
  serviço), conectando a tela à operação de backend que ela aciona.
- Sempre que um slide apresentar um fluxo com mais de 2-3 passos, considere descrever um
  diagrama (sequência ou blocos) em vez de só texto corrido.

## 5. Ciclo de vida do arquivo e o campo `status`

Cada cabeçalho tem `status: draft` no scaffolding. Ao escrever o conteúdo completo de um
arquivo, atualize esse campo:

- `draft` — só o cabeçalho e o parágrafo-resumo existem (estado inicial do scaffolding).
- `written` — o conteúdo completo (`<slide>/<speach>`) foi escrito e está fundamentado nas
  fontes atuais.
- `stale` — o conteúdo foi escrito, mas uma mudança posterior no código-fonte relevante pode tê-lo
  desatualizado; marque assim em vez de deixar o conteúdo errado sem sinalização quando não for
  possível ressincronizar imediatamente.

## 6. Ressincronização (por que o material é dividido assim)

O material foi deliberadamente dividido em um arquivo por módulo/contexto para que uma mudança de
código exija resync apenas dos arquivos cujo `sources` toca aquele código — nunca do material
inteiro.

- Ao alterar código-fonte do projeto, verifique se algum arquivo desta pasta lista o arquivo
  alterado em `sources`. Se sim, releia esse arquivo de material contra o código atual e corrija
  o que estiver desatualizado — texto, slides e trechos de código citados.
- Nunca "atualize" um arquivo de material sem reler o código-fonte atual primeiro — não edite de
  memória.
- Se a mudança de código introduzir um módulo/classe novo que não se encaixa em nenhum arquivo
  existente, prefira criar um novo arquivo de material (seguindo a numeração e o padrão de
  `part` do índice) a inflar um arquivo existente além do escopo do seu único parágrafo-resumo.
- Se um arquivo-fonte for removido/renomeado, atualize o `sources` do(s) arquivo(s) de material
  afetados e revise o conteúdo — não deixe uma fonte morta citada no cabeçalho.

## 7. Ordem de escrita recomendada

Embora cada arquivo seja autocontido, o índice tem uma ordem pedagógica (campo `order`). Ao
escrever o conteúdo pela primeira vez, siga essa ordem: os arquivos de visão geral (Parte 1)
estabelecem o vocabulário que os arquivos de domínio (Partes 3-6) vão usar sem redefinir, e o
arquivo de fluxo central (`03-fluxo-de-diagnostico.md`) é o mapa que os arquivos de pipeline de
investigação (Parte 5) detalham. Não é proibido pular a ordem, mas se pular, garanta que termos
que o arquivo usa e não define já foram definidos em algum arquivo de ordem menor.

## 8. O que não fazer

- Não criar comentários explicativos dentro dos trechos de código citados além do que já existe
  no código-fonte real (isso violaria o verbatim).
- Não inventar nomes de classe, assinatura de função ou variável de ambiente que não existam no
  código atual.
- Não escrever um arquivo inteiro num único slide gigante — quebre em quantos pares
  `<slide>/<speach>` o conteúdo pedir.
- Não avançar para o conteúdo de um arquivo sem antes ler (ou reler, no caso de resync) as fontes
  atuais listadas em seu `sources`.
- Não remover ou reescrever o parágrafo-resumo do cabeçalho ao escrever o conteúdo — ele continua
  servindo como declaração de escopo do arquivo para quem for ressincronizá-lo depois.
