# Brief para o Claude Design — Infográfico ServicedeskN1

## Objetivo
Transformar o conteúdo textual de `index.html` (mesma pasta) em um infográfico visual único
(uma peça, formato retrato ou paisagem largo — a definir), explicando o modelo de domínio do
ServicedeskN1 para quem não conhece o sistema.

Fonte de conteúdo: `./index.html`. Não inventar entidades, relações ou nomes além do que está
lá — o conteúdo já foi validado com o time; o trabalho aqui é só a forma visual.

## Título e enquadramento
- Título: "ServicedeskN1 — Modelo de Domínio"
- Subtítulo: "Do roteiro de investigação (Case / Hypothesis) à execução (Investigation)"
- Enquadramento narrativo: o infográfico deve contar uma história em duas metades —
  **"o que é definido"** (vocabulário + roteiro de conhecimento) e **"o que acontece quando
  roda"** (integração + execução). Sugestão: eixo vertical ou horizontal dividindo as duas
  metades, com uma seta/fluxo atravessando ambas.

## Os 4 blocos de conteúdo (mantêm a ordem)
1. **Vocabulário** — Concept como protagonista; termos de apoio (Subject Type, Action, Outcome,
   Recipient) podem aparecer como "chips" menores ao redor, sem virar caixas de destaque.
2. **Roteiro de Conhecimento** — Case→Case Version e Hypothesis→Hypothesis Revision. Sugiro
   representar visualmente o par "identidade → conteúdo versionado" como duas caixas conectadas
   por uma seta curta (ex.: círculo pequeno "Case" ligado a um cartão maior "Case Version").
3. **Integração** — Capability e Connector Configuration. A ligação entre eles deve ser
   visualmente tracejada/pontilhada (não é uma FK garantida no banco — ver legenda).
4. **Execução** — Investigation como caixa central/maior do bloco, com Evidence, Evaluation,
   Citation e Assessment orbitando ou fluindo a partir dela.

Cada bloco já tem uma cor-base sugerida no HTML (pode ser refinada pela ferramenta):
- Vocabulário: verde (`#6b8f71`)
- Roteiro de Conhecimento: azul (`#5b7fa6`)
- Integração: âmbar (`#b6852c`)
- Execução: vermelho terroso (`#a5495c`)

Manter as 4 cores diferenciadas e consistentes é o ponto mais importante da paleta — o resto do
infográfico deve ser neutro (fundo claro, texto escuro) para as cores dos blocos se destacarem.

## Diagrama de relações (seção 5)
Este é o elemento visual central da peça — deve ganhar mais espaço que qualquer bloco de texto.
Representar como diagrama de entidades e setas (não como bloco de código/monoespaçado no
resultado final — o `<div class="flow">` do HTML é só um rascunho de estrutura, não o layout
final). Usar:
- Retângulos para entidades.
- Setas cheias com cardinalidade (1:N, N:M) para relações com FK garantida.
- Setas tracejadas para a relação lógica Capability↔Connector Configuration.
- Agrupar visualmente as entidades por bloco/cor (ver seção anterior), para reforçar a
  associação bloco de texto ↔ posição no diagrama.

Fluxo sugerido a destacar com ênfase (maior peso de linha ou cor de destaque):
`Concept → Capability → Evidence → Evaluation → Assessment`, com `Case Version` "pairando" acima
amarrando tudo (via Hypothesis Revision → Evaluation, e via pin em Investigation).

## Rodapé
- Legenda de linha cheia vs. tracejada (pequena, discreta, canto inferior).
- Nota sobre "Simulation" não ser uma entidade — pode virar um asterisco/observação pequena
  perto do diagrama, não precisa de destaque.

## Tom visual
- Técnico, mas legível para não-desenvolvedores — este é material de onboarding/comunicação,
  não documentação de API.
- Prefira clareza a densidade: se o diagrama completo (14 entidades) ficar poluído em uma única
  visualização, está liberado simplificar as entidades de apoio (Citation, Manifest Entry) como
  rótulos menores nas setas em vez de caixas próprias.
- Sem necessidade de mascote, ilustração figurativa ou metáfora visual do domínio de suporte
  técnico (ex.: nada de "helpdesk"/"ticket" genérico) — o foco é a arquitetura de conceitos.

## Entrega
Uma peça visual (HTML/SVG/imagem, o formato que a ferramenta de design produzir) na mesma pasta
`./infografic`, referenciando ou substituindo `index.html` conforme o fluxo de trabalho da
ferramenta exigir.
