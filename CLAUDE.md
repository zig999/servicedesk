## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. It is built only from `src/` and `frontend/` — the Siegard `work/`, `delivery/`, `knowledge/` and `siegard-reconcile/` roots are excluded.

The graph is split per subfolder, each with its own incremental manifest: `src/graphify-out/` and `frontend/graphify-out/`. The root `graphify-out/graph.json` is the merged view used for querying — it is a build artifact of the two, not updated directly.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update src` and `graphify update frontend` separately (AST-only, no API cost) — never `graphify update .`, which would re-scan the whole repo including the excluded roots.
- After updating both, refresh the merged root view: `graphify merge-graphs src/graphify-out/graph.json frontend/graphify-out/graph.json --out graphify-out/graph.json`, then `graphify cluster-only . --no-label` (or without `--no-label` if an LLM backend is configured) to regenerate GRAPH_REPORT.md and graph.html.
- Doc/paper/image changes under `frontend/` need the fuller semantic `/graphify frontend --update` flow, not the AST-only `graphify update frontend`.
