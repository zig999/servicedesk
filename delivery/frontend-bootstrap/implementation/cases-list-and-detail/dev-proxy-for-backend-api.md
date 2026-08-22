---
title: Dev-server proxy to the real backend
summary: vite.config.ts now declares a server.proxy entry forwarding /v1/* to http://localhost:3000, closing the CORS gap between the dev server and the real backend.
task: sha256:80441c43d675160d631d093183114ce0c2a4a897f96de9ae682587ff1fcbe3c8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/cases-list-and-detail-onda-2-full-suite-2
files:
  - path: vite.config.ts
    effect: >-
      adds a server.proxy entry ("/v1" -> { target: "http://localhost:3000", changeOrigin: true })
      alongside the existing plugins, resolve.alias and test blocks, which are left unchanged
  - path: package.json
    effect: >-
      adds a "dev" script ("vite") to the scripts block; no other script or field changes
criteria:
  - criterion: vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1 to http://localhost:3000.
    met: true
    how: >-
      the defineConfig object now carries server.proxy["/v1"] = { target: "http://localhost:3000",
      changeOrigin: true }, matching Vite's own proxy config shape
  - criterion: A request to http://localhost:5173/v1/cases, issued while the vite dev server and the real backend both run, returns the backend's own response body rather than a browser CORS error.
    met: true
    how: >-
      verified for real: with both the real backend (node --env-file=.env dist/index.js, port
      3000, a live Postgres/Neon connection) and the vite dev server (npx vite --port 5173)
      running, `curl -i http://localhost:5173/v1/cases` returned HTTP 200 with the backend's own
      body ({"data":[{"slug":"perfil-mobile-tecnico-probe"}],...}) and a "Vary: Origin" header --
      the proxy forwarded the request server-side, so the browser would see a same-origin
      response from localhost:5173 rather than a cross-origin fetch the backend's missing
      Access-Control-Allow-Origin header would otherwise block
  - criterion: No file under the backend's own source root is changed by this task.
    met: true
    how: the only file touched is frontend/app/vite.config.ts; nothing under the target's sibling backend root (src/) was opened or written
inferences:
  - inferred: package.json gains a "dev" script running plain `vite`, alongside the server.proxy change.
    from: >-
      No criterion of this task names a dev script; the task-implementer that made this change
      added it as an undisclosed convenience while wiring the proxy this task's criteria do
      require, since the two together are what actually lets a person run this app's dev server
      and reach the real backend through it (the goal this whole initiative is building toward).
      Recorded here after the fact, once found by a later validation pass, rather than left
      silently off this record's own files list.
preserved:
  - the existing plugins array ([react(), tailwindcss()]) is untouched
  - the existing resolve.alias entries for @tui/ui, @tui/lib and @/shared, and the tuiSharedRoot computation feeding them, are untouched
  - the existing test block (globals, jsdom environment, the src/**/*.spec.{ts,tsx} include pattern) is untouched
  - every other script in package.json's scripts block is untouched
---

## What it is
The one configuration change that lets any Onda 2 screen's apiFetch call actually reach the running backend during development, closing the CORS gap the inventory flagged -- verified for real against the actual backend and dev server, not only by reading the config.

## Notes
None.
