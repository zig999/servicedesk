# Escopo: substrato do target frontend

Construir o substrato do target `frontend` (`frontend/app`), que `siegard.json` já declara. Nenhuma
tela ainda -- só o que `standards/frontend-typescript.yaml` presupõe e a árvore ainda não tem:
`package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `stylelint.config.js`,
`playwright.config.ts`, `src/design-system/tokens.css` -- mais o alias `@tui/ui/*` e `@tui/lib/*`
resolvendo para o submódulo `frontend/tui/frontend/src/shared`, o `tokens.css` do app importando
o `theme.css` do TUI em vez de declarar uma segunda paleta (ARC-05), e um shell inicial
(`main.tsx`/`App.tsx`) renderizando um componente do catálogo do TUI (ex.: `Button`) como prova de
que a cadeia de import funciona.

Nenhum nó de specification cobre manifesto ou configuração de build -- isso é scaffolding, sem
`implements`, com `rationale`, seguindo o mesmo precedente do backend
(`work/case-authoring-mvp/task/published-language/build-substrate.md`).

## Por que este projeto tem um frontend

Este frontend existe para dar um console de curadoria ao domínio de autoria de casos que a
specification já sustenta -- `domain/knowledge/case`, `case-version`, `hypothesis`, `resolution`, e
o contrato `contracts/system/case-authoring`. O documento completo dessa proposta está em
`docs/frontend-triage-console-proposal.md`, referenciado aqui como contexto de por que a epic desta
iniciativa deve reivindicar (`covers`) esses nós mesmo que nenhuma task deste incremento os
implemente ainda -- eles ficam em `uncovered`, porque este incremento entrega só a fundação
(tooling), não telas.

## O que este incremento não é

Não decompõe telas, não decide wording de nenhum outcome, não toca no backend. É só o que faz
`npm install && npm run build` funcionar em `frontend/app`, importando componentes reais do TUI.
