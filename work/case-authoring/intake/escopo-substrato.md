# Escopo — o substrato que o standard pressupõe

O standard pressupõe package.json e tsconfig.json, que esta árvore não tem.
Sem eles 34 das 59 regras não se aplicam a nada e nenhuma entrega pode ser escrita.
A fonte anterior foi descartada; a árvore está vazia.

## Raízes nomeadas nesta invocação

knowledge root: `knowledge`
work root: `work/case-authoring`
target source root: `.`
standard: `standards/backend-node-service.yaml`

## O que o registro pressupõe, lido do disco

Comando: `python3 -B .claude/bin/deliver.py --standard standards/backend-node-service.yaml --against .`

Saída, na íntegra:

```
standard checked: standards/backend-node-service.yaml declares 59 rule(s) — 35 decided by reading, 24 by a tool
  pin sha256:10f0b19da6370ebc0078f49b4179f282fbe6f691edec122afdd51d68998a6755
  the rules a tool decides run as step(s) named lint, secret-scan, typecheck; a review reads only the 35 decided by reading
  it declares 5 command(s): install = npm install, typecheck = npm run typecheck, lint = npm run lint, secret-scan = npm run secret-scan, test = npm test
    installs with install, proves with test, and the rest run as checks on both sides of the tests
  it authorizes 11 direct dependency(ies): fastify, @modelcontextprotocol/sdk, pg, jose, zod, pino, @anthropic-ai/sdk, vitest, typescript, eslint, secretlint. What they pull in transitively is nobody's approval and the lockfile's record
  against .:
  package.json: ABSENT — The `"type": "module"` STK-02 depends on, the `test` script STK-10 names its runner through, the `lint`, `typecheck` and `secret-scan` steps every tool-decided rule below is run as, and the declaration of every dependency the stack rules name as the only one of its kind.
      unanswerable while it is: STK-01, STK-02, STK-03, STK-04, STK-05, STK-07, STK-08, STK-09, STK-10, STK-11, STK-12, ARC-02, ARC-03, ARC-05, DTO-02, DTO-03, DTO-04, API-01, API-06, COR-01, SEC-02, SEC-03, TYP-01, TYP-02, TYP-03, TYP-04, CON-01, MNT-01, MNT-02, PRH-01, PRH-02, PRH-03, PRH-04, TST-04
  tsconfig.json: ABSENT — The strict compiler configuration STK-01 and TYP-01 both require, and the module resolution mode that decides whether an extensionless relative import resolves at all.
      unanswerable while it is: STK-01, TYP-01

2 presupposed artifact(s) absent. Source written now answers to a registry that cannot be applied to it: the rules above go unanswered, and the absence is found once per file in a review instead of once here. The artifact is built by a task that declares it in `produces`, planned through /plan-work.
```

## O estado da árvore, lido do disco

Comando: `find . -path ./.git -prune -o \( -name '*.ts' -o -name '*.js' -o -name 'package.json' -o -name 'tsconfig.json' \) -print`

Saída: nenhuma linha.

`src/` não existe. A raiz alvo `.` holds `.claude/`, `delivery/`, `docs/`, `evidence/`, `knowledge/`, `standards/`, `temp/`, `work/` e `CLAUDE.md` — nenhum deles fonte do projeto.
