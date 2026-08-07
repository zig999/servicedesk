---
title: "Repository root, empty of project source"
summary: "The area this scope lands in: a repository root that holds the framework, the base, the plan, the delivery records and the standard registry, and no project source at all — no `src/`, no `.ts` file, no `package.json`, no `tsconfig.json`, no lockfile anywhere outside `.git/`."
rationale: "The target source root is the repository root, which also holds directories that are not project source; the survey judged `.claude/`, `knowledge/`, `work/` and `docs/` out of the inventory because no task of this plan writes into them, and kept `standards/` and `delivery/case-authoring/` in because the scope names the first and the second already claims the paths a rebuild would recreate."
sources:
  - "intake/escopo-substrato.md"
area:
  - "."
  - "standards/"
  - "delivery/case-authoring/"
  - "docs/"
  - "evidence/"
  - "knowledge/"
  - "work/case-authoring/"
  - ".claude/"
modules:
  - name: standards-registry
    path: "standards/backend-node-service.yaml"
    role: depends-on
  - name: delivery-records
    path: "delivery/case-authoring"
    role: adjacent
must_not_duplicate:
  - what: "The five command names the registry declares — install, typecheck, lint, secret-scan, test — and the eleven direct dependencies it authorizes; a manifest that names its own scripts or pulls a twelfth package answers to nothing."
    at: "standards/backend-node-service.yaml"
  - what: "The `under: src` / `suffix: .ts` scope every rule's `applies_to` states; a source root chosen anywhere else puts the whole registry out of reach of the files it was written for."
    at: "standards/backend-node-service.yaml"
risks:
  - risk: "Eighteen implementation records already list files under `src/` that no longer exist, so source rebuilt at those paths will read as delivered by tasks this plan has not re-run."
    consumers:
      - "delivery/case-authoring/delivery.json"
      - "delivery/case-authoring/implementation/case-validator/validation-run.md"
      - "delivery/case-authoring/review/dezoito-entregas.md"
      - "delivery/case-authoring/review/primeiras-seis-entregas.md"
  - risk: "Two paths hold a registry named `backend-node-service`, and a manifest built from one of them satisfies the other only while the copies stay identical."
    consumers:
      - "standards/backend-node-service.yaml"
      - "delivery/case-authoring/standards/backend-node-service.yaml"
      - "delivery/case-authoring/standards/backend-typescript.yaml"
---
## What it is
The repository root as it stands, walked in full, holding no project source.
A glob for `*.ts`, `*.js`, `package.json` and `tsconfig.json` across the whole root outside `.git/` returns nothing.
`src/`, `lib/`, `app/`, `test/` and `tests/` do not exist; neither does `node_modules/`, a lockfile, or a `temp/` or `run/` with anything in it.
What the root does hold is `.claude/` (the vendored framework's schemas, bin, agents and skills), `knowledge/` (the base and its derived `graph.json`), `work/case-authoring/` (this plan), `delivery/case-authoring/` (eighteen implementation and proof records plus two reviews over source that is gone), `standards/backend-node-service.yaml` (the registry of 59 rules this project's source answers to), `docs/arquitetura-troubleshooting-v5.md`, `evidence/01-plan-run.md` and `CLAUDE.md`.
Every rule of the registry scopes itself to `under: src` with `suffix: .ts`, and that directory is the one thing the tree does not have.
The registry's `presupposes` block names `package.json` and `tsconfig.json`, and both are absent, which is what puts 34 and 2 of its rules respectively out of application.

## Notes
The survey recorded no `conventions`, because a convention needs a path in the tree as it stands and there is no source file to have seen one at.
An earlier inventory node recorded eight conventions over an eight-file tree under `src/`; that source was discarded, none of those conventions is evidenced by any path now, and the node is removed by the same change that writes this one.
The standard registry states an intended arrangement, but a declared rule is not an observed convention, and the standard pass rather than this inventory is what holds source to it.
`.claude/`, `knowledge/`, `work/` and `docs/` were walked and deliberately left out of `modules`: the framework is vendored infrastructure, the base is what tasks bind rather than territory a change lands in, the plan is this document's own root, and the two markdown documents under `docs/` and `evidence/` are intake material no task writes to.
`standards/backend-node-service.yaml` is recorded as `depends-on` rather than `touched` because the scope names it as the registry the work answers to and nothing in the scope changes a rule.
`delivery/case-authoring/` is recorded as `adjacent` because the plan's delivery lands beside its existing records without rewriting them, and because those records are the named consumers of the first risk above.
This is a greenfield area for project source, and that is the whole answer rather than a shortfall in the walk.
