// Proof for the "seed" entry package.json's own record for this delivery adds
// (delivery/relational-persistence/implementation/case-authoring/curated-data-seeded.md): the tree
// holds a runnable step, reachable as "npm run seed", invoking the built seed.ts entry point
// exactly the way "migrate" already invokes migrate.ts's — mirroring
// __tests__/unit/migrate.spec.ts's own pattern for that sibling script exactly. No numbered
// criterion of task/case-authoring/curated-data-seeded names this script entry directly (its six
// criteria are all about what running the seed leaves behind in the database); this proves the
// record's own package.json file change instead. What running the seed actually leaves behind is
// proven directly against the real database in this file's own integration-level sibling
// (__tests__/integration/seed.spec.ts); seed.ts's own top-level composition is left untested here,
// following the same precedent migrate.spec.ts already sets for migrate.ts (see this record's own
// `untested`).
//
// The two tests below this line prove a different, later task instead —
// task/case-authoring/seed-fixtures-resolve-against-a-real-build — whose own criteria are about
// where FIXTURES_ROOT resolves once seed.ts is actually compiled, not about the database or the
// package.json script text above. seed.ts exports nothing (its own top-level sequence runs at
// module-evaluation time, unconditionally — see this file's own header again), so FIXTURES_ROOT
// cannot be imported and asserted on directly; what follows instead reads the real relative
// segment seed.ts's own source currently declares for it and resolves that segment exactly the
// way Node would, from the one fixed path a real `npm run build` always places its compiled entry
// point at (tsconfig.build.json: outDir "dist", rootDir "src" — one level below the package root,
// the sibling of src/), without needing this suite to run tsc itself: the resolution is pure URL
// arithmetic over a path a real build always produces, not over a file that has to exist on disk.
// Before this task's own fix, that segment was './fixtures' relative to the compiled file's own
// directory, resolving to a nonexistent dist/fixtures — the exact ENOENT the task's own intake
// captured reading dist/fixtures/glossary/outcome.json; these two tests fail against that pre-fix
// segment and pass against the fixed one.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));
const SEED_SOURCE_PATH = fileURLToPath(new URL('../../seed.ts', import.meta.url));
const PACKAGE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const REAL_FIXTURES_ROOT = join(PACKAGE_ROOT, 'src', 'fixtures');
const FIXTURES_ROOT_ASSIGNMENT = /const FIXTURES_ROOT = fileURLToPath\(new URL\('([^']+)',\s*import\.meta\.url\)\)/;

/**
 * seed.ts exports nothing, so the only way to observe what its own module-private FIXTURES_ROOT
 * currently resolves to is to read the real relative segment its own source declares for it,
 * rather than reproducing seed.ts's formula from memory.
 */
async function readFixturesRootSegment(): Promise<string> {
  const source = await readFile(SEED_SOURCE_PATH, 'utf8');
  const match = FIXTURES_ROOT_ASSIGNMENT.exec(source);
  if (!match) {
    throw new Error("seed.ts no longer declares FIXTURES_ROOT the way this test expects to read it");
  }
  return match[1];
}

/**
 * Where seed.ts's own currently-declared FIXTURES_ROOT segment resolves to when applied from the
 * one fixed path a real `npm run build` always places its compiled entry point at, exactly where
 * package.json's own "seed" script above invokes it from — rather than from seed.ts's own
 * uncompiled location, which __tests__/integration/seed.spec.ts's own dynamic import already
 * exercises and which this task's fix left able to reach the same directory either way.
 */
async function resolveFixturesRootFromBuiltLocation(): Promise<string> {
  const segment = await readFixturesRootSegment();
  const builtSeedUrl = pathToFileURL(join(PACKAGE_ROOT, 'dist', 'seed.js'));
  return fileURLToPath(new URL(segment, builtSeedUrl));
}

const manifestScripts = z.object({
  scripts: z.record(z.string(), z.string()).optional(),
});

/** package.json's own "scripts" section, parsed as a boundary input (STK-08) rather than trusted as an untyped JSON.parse result. */
async function readManifestScripts(): Promise<Record<string, string>> {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  return manifestScripts.parse(parsed).scripts ?? {};
}

it('the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"\'s own precedent', async () => {
  const scripts = await readManifestScripts();

  expect(scripts.seed).toBe('node dist/seed.js');
});

// ---------------------------------------------------------------- task/case-authoring/seed-fixtures-resolve-against-a-real-build

it(
  'FIXTURES_ROOT resolves, from the fixed path a real build places seed.js at, to the exact directory the fixtures are actually committed in',
  async () => {
    const resolved = await resolveFixturesRootFromBuiltLocation();

    expect(resolved).toBe(REAL_FIXTURES_ROOT);
  },
);

it(
  'reads every fixture the seed step needs — the five glossary vocabularies, the concept and capability registrations, and the curated case — through that same built-location resolution, matching the real committed content exactly',
  async () => {
    const resolved = await resolveFixturesRootFromBuiltLocation();
    const relativeFixturePaths = [
      join('glossary', 'outcome.json'),
      join('glossary', 'subject-type.json'),
      join('glossary', 'subject-attribute.json'),
      join('glossary', 'action.json'),
      join('glossary', 'recipient.json'),
      join('glossary', 'concept.json'),
      join('capability', 'capability.json'),
      join('case', 'intermittent-connection-outage', '1.json'),
    ];

    for (const relativePath of relativeFixturePaths) {
      const fromBuiltLocation = await readFile(join(resolved, relativePath), 'utf8');
      const fromRealFixturesRoot = await readFile(join(REAL_FIXTURES_ROOT, relativePath), 'utf8');

      expect(fromBuiltLocation).toBe(fromRealFixturesRoot);
    }
  },
);
