// Statically asserts what vite.config.ts's own server.proxy configuration declares -- it starts
// neither the vite dev server nor the real backend. The task this proves,
// cases-list-and-detail/dev-proxy-for-backend-api, states a second criterion about a live
// request through both running processes; that is a two-process integration fact this suite
// does not exercise, and the implementation record documents it as verified separately, by
// curl against both real processes.
//
// This reads vite.config.ts as source text rather than importing it as a module: importing it
// from inside a running Vitest/jsdom process executes its own plugin calls (react(),
// tailwindcss()) in that environment rather than the Node build context Vite itself loads it
// in, which breaks esbuild's own runtime invariant ("new TextEncoder().encode('') instanceof
// Uint8Array") and fails the whole suite -- a defineConfig() call is meant to be read by Vite's
// own CLI, never re-executed inside the test runtime it configures. A textual assertion over
// the declared server.proxy block is the honest way to prove this file's own content without
// re-running it.
//
// This file sits under src/ (not beside vite.config.ts at the project root) because vitest's
// own test.include ("src/**/*.spec.{ts,tsx}") and tsconfig.json's own include ("src", ...) both
// only reach files under src/ -- a spec file at the repository root, however correct, is never
// collected by `npm test` or checked by `npm run typecheck`.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// process.cwd() is the target source root (frontend/app) -- every invocation of this suite,
// captured or local, runs with that as its working directory (this project's own standard
// registry composes `npm test` with --cwd frontend/app), and Vitest itself does not change the
// process's OS-level working directory to run a suite.
const viteConfigSource = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf-8");

describe("the dev server's /v1 proxy configuration", () => {
  it("declares a server.proxy entry for /v1", () => {
    expect(viteConfigSource).toMatch(/proxy:\s*\{[^}]*["']\/v1["']/s);
  });

  it("forwards the /v1 proxy entry to the real backend at http://localhost:3000", () => {
    const proxyBlock = viteConfigSource.match(/["']\/v1["']:\s*\{([^}]*)\}/s)?.[1] ?? "";

    expect(proxyBlock).toContain('"http://localhost:3000"');
  });

  it("sets changeOrigin on the /v1 proxy entry", () => {
    const proxyBlock = viteConfigSource.match(/["']\/v1["']:\s*\{([^}]*)\}/s)?.[1] ?? "";

    expect(proxyBlock).toMatch(/changeOrigin:\s*true/);
  });
});
