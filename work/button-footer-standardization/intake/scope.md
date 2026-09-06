Escopo confirmado pelo humano: criar um componente ButtonFooter compartilhado e reutilizável em
frontend/app/src/shared/components/, que padroniza a área de botões de ação principais de uma
tela, fixo (sticky) na base da área de conteúdo rolável do AppShell (dentro do
`<main overflow-y-auto>`, sem alterar o AppShell global), com os botões filhos configuráveis por
tela.

Migrar para este componente as áreas de botões de ação hoje existentes, hardcoded, em:

1. `capability-form-fields.tsx` (usado por `capability-create-screen.tsx` e
   `capability-detail-screen.tsx`/`capability-detail-ready-view.tsx`).
2. `connector-configuration-form-fields.tsx` (usado por
   `connector-configuration-create-screen.tsx` e `connector-configuration-detail-screen.tsx`).
3. `hypothesis-revision-form-fields.tsx` (usado por `new-hypothesis-screen.tsx` e
   `revise-hypothesis-screen.tsx` via `hypothesis-revision-screen.tsx`).
4. `case-version-editor-ready-view.tsx` (usado por `case-version-editor-screen.tsx` e
   `new-case-draft-screen.tsx`).

Toda tela que passa a ter o ButtonFooter deve ter, por padrão, um botão Cancel que cancela a
ação em andamento e retorna à tela anterior (as 3 primeiras famílias hoje não têm Cancel:
adicionar; `case-version-editor-ready-view.tsx` já tem um botão Cancel — apenas migrá-lo para
dentro do componente).

Como consequência da introdução do Cancel como retorno padrão, remover o link solto "Back to X"
hoje duplicado no topo de: `capability-create-screen.tsx`; `capability-detail-screen.tsx` (nos
3 estados: loading/erro/ready); `connector-configuration-create-screen.tsx`;
`connector-configuration-detail-screen.tsx` (nos 3 estados: loading/erro/ready).

Fora de escopo, mantido como está: o botão local "Back to hypotheses" em
`hypothesis-revision-history.tsx` (não é navegação de tela, é troca de estado local dentro da
aba de hipóteses do case).

Nenhum fato de negócio novo é introduzido — este é um pedido de padronização de
interação/superfície de tela já suportada pela especificação, endereçando a duplicação de
código e a ausência de fixação do footer de botões ao rolar o conteúdo.
