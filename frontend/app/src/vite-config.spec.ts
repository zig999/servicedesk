import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

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
