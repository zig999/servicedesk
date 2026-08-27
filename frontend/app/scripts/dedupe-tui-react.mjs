// frontend/tui is a vendored, read-only git submodule (see
// standards/frontend-typescript.yaml's own note on ARC-01/04/05) with its own,
// separately-installed node_modules at frontend/tui/frontend/node_modules. Both it
// and this app declare "react"/"react-dom": "^19.0.0", but each has its own lockfile
// and its own npm install, so nothing guarantees the two resolve to the same physical
// files -- two distinct copies loaded into one render tree break React's hooks with
// "Cannot read properties of null (reading 'useRef')" the moment a component from the
// duplicated copy renders (first hit through @tui/ui's Radix-based Dialog/Tooltip
// primitives). vite.config.ts's resolve.alias and test.server.deps.inline entries are
// meant to force every resolution of react/react-dom through this app's own copy, but
// that mechanism does not reliably intercept every path Vitest 4's own module loading
// takes (confirmed: the crash persisted with matching package-lock.json versions and a
// clean install on both sides). This script removes the doubt instead of the symptom:
// after this app's own `npm install`/`npm ci`, it replaces
// frontend/tui/frontend/node_modules/react and .../react-dom with symlinks to this
// app's own copies, so every consumer -- Vite's resolver, Vitest's SSR loader, plain
// Node `require` -- reaches the exact same files no matter which path it takes.
//
// It is deliberately silent (a no-op, not a failure) when the tui submodule or its own
// node_modules is not present: a checkout that never touches @tui/ui-composing code has
// no need for the submodule to be initialized, and this script must never turn "the
// submodule is not set up here" into an install failure for every other consumer of this
// package.

import { existsSync, lstatSync, readlinkSync, rmSync, symlinkSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appNodeModules = resolve(here, "..", "node_modules");
const tuiNodeModules = resolve(here, "..", "..", "tui", "frontend", "node_modules");

if (!existsSync(tuiNodeModules)) {
  console.log(
    "dedupe-tui-react: frontend/tui/frontend/node_modules not present -- skipping (submodule not installed here)",
  );
  process.exit(0);
}

for (const pkg of ["react", "react-dom"]) {
  const source = resolve(appNodeModules, pkg);
  const target = resolve(tuiNodeModules, pkg);

  if (!existsSync(source)) {
    console.log(`dedupe-tui-react: ${source} does not exist -- skipping ${pkg}`);
    continue;
  }

  if (existsSync(target) && lstatSync(target).isSymbolicLink() && readlinkSync(target) === relative(tuiNodeModules, source)) {
    console.log(`dedupe-tui-react: ${pkg} already deduped`);
    continue;
  }

  rmSync(target, { recursive: true, force: true });
  symlinkSync(relative(tuiNodeModules, source), target, "dir");
  console.log(`dedupe-tui-react: linked frontend/tui/frontend/node_modules/${pkg} -> frontend/app/node_modules/${pkg}`);
}
