---
title: Proof for the dev-server proxy to the real backend
summary: Statically asserts vite.config.ts's own server.proxy["/v1"] entry, and names the two criteria a unit suite cannot exercise or verify was left untouched.
implementation: sha256:63b0bf6577a87e2c89309bd2a45b9ebc96ece09b2e64544a458e540eb3d35007
run: run/cases-list-and-detail-onda-2-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/vite-config.spec.ts
    name: declares a server.proxy entry for /v1
    proves: vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1 to http://localhost:3000.
    fails_when: vite.config.ts's server.proxy stops declaring a "/v1" entry
  - file: src/vite-config.spec.ts
    name: forwards the /v1 proxy entry to the real backend at http://localhost:3000
    proves: vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1 to http://localhost:3000.
    fails_when: the "/v1" proxy entry's target is anything other than "http://localhost:3000"
  - file: src/vite-config.spec.ts
    name: sets changeOrigin on the /v1 proxy entry
    proves: vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1 to http://localhost:3000 -- specifically the changeOrigin field the implementation record's own how names as part of that declared entry
    fails_when: the "/v1" proxy entry's changeOrigin is removed, set to false, or left undeclared
not_applicable:
  - edge_case: absent input, empty input, a boundary at a stated range, a duplicate, a forbidden state, or two concurrent operations
    why: the task's only behavior is a static configuration object read once at process start -- it takes no input, holds no collection, states no range, claims no uniqueness, and admits no concurrent caller, so none of these edge cases has anything to attach to
untested:
  - >-
    A request to http://localhost:5173/v1/cases, issued while the vite dev server and the real
    backend both run, returns the backend's own response body rather than a browser CORS error
    (criterion 2). This is a live, two-process integration fact -- it needs a running vite dev
    server and a running backend process, neither of which this vitest suite starts or connects
    to. The implementation record already documents this as verified manually: curl -i
    http://localhost:5173/v1/cases against both real running processes returned HTTP 200 with the
    backend's own body. No test in this file exercises it, and none should be written to fake it --
    a stand-in server here would test the stand-in's own wiring rather than the real backend's
    CORS-free reachability the criterion states.
  - >-
    No file under the backend's own source root is changed by this task (criterion 3). This is a
    fact about which files this delivery touched, not a runtime behavior -- no test process can
    observe the absence of a change. It is checked by reading the implementation record's own
    files list, which names only vite.config.ts, and by the diff a reviewer reads directly.
---

## What it is
Three tests statically asserting vite.config.ts's own declared /v1 proxy entry (its existence, its target, and changeOrigin) -- read as source text rather than imported as a module, since importing vite.config.ts from inside the running test process executes its own plugin calls (react(), tailwindcss()) and breaks esbuild's own runtime invariant.

## Notes
The spec file sits at src/vite-config.spec.ts rather than beside vite.config.ts at the project root: vitest's own test.include ("src/**/*.spec.{ts,tsx}") and tsconfig.json's own include ("src", ...) both only reach files under src/, so a spec file at the repository root -- however correct -- would never be collected by `npm test` or checked by `npm run typecheck`. An earlier draft of this file did sit at the project root and imported the config module directly; both were corrected in this same delivery before this record was written.
